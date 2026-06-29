import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, BellOff, X, ExternalLink, Calendar, Phone, DollarSign, MessageSquare } from 'lucide-react';
import './AdminOrderNotifier.css';

const LOCAL_STORAGE_KEY = 'dongk_notified_ids';
const MUTE_STORAGE_KEY = 'dongk_notifier_muted';

// Audio chime using Web Audio API
const playChime = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const playNote = (freq, startTime, duration) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0.08, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    
    playNote(659.25, audioCtx.currentTime, 0.4);
    playNote(880.00, audioCtx.currentTime + 0.12, 0.5);
  } catch (e) {
    console.warn('[Notifier] Audio context playback blocked or unsupported:', e);
  }
};

// Mask phone number for privacy
const maskPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.substring(0, 3)}-****-${cleaned.substring(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)}-***-${cleaned.substring(6)}`;
  }
  return phone;
};

export default function AdminOrderNotifier() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [toasts, setToasts] = useState([]);
  const [isMuted, setIsMuted] = useState(() => {
    try {
      const saved = localStorage.getItem(MUTE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : true; // Default to muted
    } catch {
      return true;
    }
  });

  const [unreadInquiriesCount, setUnreadInquiriesCount] = useState(0);

  const stateRef = useRef({ toasts, isMuted });
  
  useEffect(() => {
    stateRef.current = { toasts, isMuted };
  }, [toasts, isMuted]);

  const isAdminPage = location.pathname.startsWith('/admin') || location.pathname.startsWith('/admin-orders');
  const isUserAdmin = user && user.isLoggedIn && user.role === 'admin';

  const getNotifiedIds = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const addNotifiedId = (id) => {
    try {
      const ids = getNotifiedIds();
      if (!ids.includes(id)) {
        const updated = [id, ...ids].slice(0, 100);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch count of inquiries with is_read = false
  const fetchUnreadCount = async () => {
    try {
      if (!supabase) return;
      const { count, error } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      if (!error) {
        setUnreadInquiriesCount(count || 0);
      }
    } catch (e) {
      console.warn('[Notifier] Failed to load unread count:', e);
    }
  };

  const triggerNotification = (item, type) => {
    const ids = getNotifiedIds();
    if (ids.includes(item.id)) return; // prevent duplicate

    addNotifiedId(item.id);

    // Chime
    if (!stateRef.current.isMuted) {
      playChime();
    }

    // Refresh unread count if it's a new inquiry
    if (type === 'inquiry') {
      setUnreadInquiriesCount(prev => prev + 1);
    }

    // Map item properties to uniform toast layout
    const isOrder = type === 'order';
    const isEstimate = type === 'estimate';
    const isInquiry = type === 'inquiry';
    
    let title = '';
    let link = '';
    let number = '';
    let amount = 0;
    
    if (isOrder) {
      title = '새 주문이 접수되었습니다';
      link = `/admin-orders?highlight=${item.id}`;
      number = item.order_no;
      amount = item.total_amount;
    } else if (isEstimate) {
      title = '새 견적요청이 등록되었습니다';
      link = `/admin/estimates?highlight=${item.id}`;
      number = item.estimate_no;
      amount = item.total || 0;
    } else {
      title = '새 견적문의가 들어왔어요';
      link = '/admin/inquiries';
      number = item.id.substring(0, 8).toUpperCase();
      amount = 0;
    }

    const toastItem = {
      id: item.id,
      type,
      title,
      number,
      customer: item.customer_name || item.name || '비회원',
      phone: maskPhone(item.phone),
      amount,
      time: item.created_at,
      link
    };

    setToasts(prev => {
      const list = [toastItem, ...prev];
      return list.slice(0, 3);
    });

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== item.id));
    }, 9000);
  };

  useEffect(() => {
    if (!isUserAdmin || !isAdminPage || !supabase) return;

    console.log('[Notifier] Admin notifications listener starting...');
    fetchUnreadCount();

    // -- 1. Supabase Realtime Channels --
    const orderChannel = supabase
      .channel('admin-realtime-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
        console.log('[Notifier] Realtime Order Inserted:', payload.new);
        triggerNotification(payload.new, 'order');
      })
      .subscribe();

    const estimateChannel = supabase
      .channel('admin-realtime-estimates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'estimates' }, payload => {
        console.log('[Notifier] Realtime Estimate Inserted:', payload.new);
        triggerNotification(payload.new, 'estimate');
      })
      .subscribe();

    const inquiryChannel = supabase
      .channel('admin-realtime-inquiries')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inquiries' }, payload => {
        console.log('[Notifier] Realtime Inquiry Inserted:', payload.new);
        triggerNotification(payload.new, 'inquiry');
      })
      .subscribe();

    // -- 2. Polling Fallback Interval --
    const pollingInterval = setInterval(async () => {
      try {
        fetchUnreadCount();

        // Query latest order
        const { data: latestOrder, error: oErr } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (!oErr && latestOrder && latestOrder.length > 0) {
          const item = latestOrder[0];
          const ids = getNotifiedIds();
          if (!ids.includes(item.id)) {
            const ageMs = Date.now() - new Date(item.created_at).getTime();
            if (ageMs < 10 * 60 * 1000) {
              triggerNotification(item, 'order');
            }
          }
        }

        // Query latest estimate
        const { data: latestEstimate, error: eErr } = await supabase
          .from('estimates')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (!eErr && latestEstimate && latestEstimate.length > 0) {
          const item = latestEstimate[0];
          const ids = getNotifiedIds();
          if (!ids.includes(item.id)) {
            const ageMs = Date.now() - new Date(item.created_at).getTime();
            if (ageMs < 10 * 60 * 1000) {
              triggerNotification(item, 'estimate');
            }
          }
        }

        // Query latest inquiry
        const { data: latestInquiry, error: iErr } = await supabase
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (!iErr && latestInquiry && latestInquiry.length > 0) {
          const item = latestInquiry[0];
          const ids = getNotifiedIds();
          if (!ids.includes(item.id)) {
            const ageMs = Date.now() - new Date(item.created_at).getTime();
            if (ageMs < 10 * 60 * 1000) {
              triggerNotification(item, 'inquiry');
            }
          }
        }
      } catch (err) {
        console.warn('[Notifier] Polling failure:', err);
      }
    }, 20000);

    return () => {
      console.log('[Notifier] Cleaning up listeners...');
      clearInterval(pollingInterval);
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(estimateChannel);
      supabase.removeChannel(inquiryChannel);
    };
  }, [isUserAdmin, isAdminPage, location.pathname]);

  const toggleMute = () => {
    const newVal = !isMuted;
    setIsMuted(newVal);
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, JSON.stringify(newVal));
    } catch (e) {
      console.error(e);
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleAction = (link) => {
    navigate(link);
  };

  if (!isUserAdmin || !isAdminPage) return null;

  return (
    <div className="admin-notifier-fixed-box">
      {/* Sound Controller & Unread Count Badge */}
      <div className="notifier-sound-toggle-card">
        {unreadInquiriesCount > 0 && (
          <div 
            className="unread-inquiries-badge-indicator" 
            onClick={() => navigate('/admin/inquiries')}
            title="미처리 견적문의 확인하기"
          >
            안읽은 문의: <strong>{unreadInquiriesCount}</strong>건
          </div>
        )}
        <label className="toggle-label" title={isMuted ? "알림음 켜기" : "알림음 끄기"}>
          <input
            type="checkbox"
            checked={!isMuted}
            onChange={toggleMute}
            className="toggle-checkbox"
          />
          <div className="toggle-sound-icon-box">
            {isMuted ? <BellOff size={13} className="text-gray" /> : <Bell size={13} className="text-indigo" />}
          </div>
          <span>{isMuted ? '무음' : '알림음'}</span>
        </label>
      </div>

      {/* Toasts Stack */}
      <div className="notifier-toast-stack">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-alert-card ${toast.type}`}>
            <div className="toast-top-row">
              <span className={`toast-type-badge ${toast.type}`}>
                {toast.type === 'order' ? '주문' : toast.type === 'estimate' ? '견적' : '문의'}
              </span>
              <button className="btn-close-toast" onClick={() => removeToast(toast.id)}>
                <X size={14} />
              </button>
            </div>
            
            <h4 className="toast-title">{toast.title}</h4>
            
            <div className="toast-meta-grid">
              <div className="meta-item">
                <span className="lbl">접수정보</span>
                <span className="val font-mono">{toast.number}</span>
              </div>
              <div className="meta-item">
                <span className="lbl">고객 정보</span>
                <span className="val">{toast.customer} ({toast.phone})</span>
              </div>
              {toast.type !== 'inquiry' && (
                <div className="meta-item">
                  <span className="lbl">결제금액</span>
                  <span className="val price">{(toast.amount || 0).toLocaleString()}원</span>
                </div>
              )}
            </div>

            <button 
              className="btn-toast-action"
              onClick={() => {
                handleAction(toast.link);
                removeToast(toast.id);
              }}
            >
              확인하기 <ExternalLink size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
