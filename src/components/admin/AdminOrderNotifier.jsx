import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, BellOff, X, ExternalLink, Calendar, Phone, DollarSign, FileText } from 'lucide-react';
import './AdminOrderNotifier.css';

const LOCAL_STORAGE_KEY = 'dongk_notified_ids';
const MUTE_STORAGE_KEY = 'dongk_notifier_muted';

// Audio chime using Web Audio API to avoid requiring external assets
const playChime = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Play a gentle two-tone chime
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
    
    // Play Note 1 (E5) and Note 2 (A5)
    playNote(659.25, audioCtx.currentTime, 0.4);
    playNote(880.00, audioCtx.currentTime + 0.12, 0.5);
  } catch (e) {
    console.warn('[Notifier] Audio context playback blocked or unsupported:', e);
  }
};

// Mask phone number for privacy (e.g. 010-1234-5678 -> 010-****-5678)
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

  const stateRef = useRef({ toasts, isMuted });
  
  useEffect(() => {
    stateRef.current = { toasts, isMuted };
  }, [toasts, isMuted]);

  // Check if current user is admin and viewing admin page
  const isAdminPage = location.pathname.startsWith('/admin') || location.pathname.startsWith('/admin-orders');
  const isUserAdmin = user && user.isLoggedIn && user.role === 'admin';

  // Retrieve notified IDs from localStorage
  const getNotifiedIds = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Add notified ID to localStorage (keep max 100 entries to avoid overflow)
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

  // Triggered when a new record is discovered
  const triggerNotification = (item, type) => {
    const ids = getNotifiedIds();
    if (ids.includes(item.id)) return; // prevent duplicate

    addNotifiedId(item.id);

    // Chime
    if (!stateRef.current.isMuted) {
      playChime();
    }

    // Map item properties to uniform toast layout
    const isOrder = type === 'order';
    const toastItem = {
      id: item.id,
      type,
      title: isOrder ? '새 주문이 접수되었습니다' : '새 견적요청이 등록되었습니다',
      number: isOrder ? item.order_no : item.estimate_no,
      customer: item.customer_name || '비회원',
      phone: maskPhone(item.phone),
      amount: isOrder ? item.total_amount : (item.total || 0),
      time: item.created_at,
      link: isOrder ? `/admin-orders?highlight=${item.id}` : `/admin/estimates?highlight=${item.id}`
    };

    setToasts(prev => {
      // Limit toast stack to max 3 items (drop oldest)
      const list = [toastItem, ...prev];
      return list.slice(0, 3);
    });

    // Auto-remove after 9 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== item.id));
    }, 9000);
  };

  useEffect(() => {
    if (!isUserAdmin || !isAdminPage || !supabase) return;

    console.log('[Notifier] Admin notifications listener starting...');

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

    // -- 2. Polling Fallback Interval (Checks every 20 seconds) --
    const pollingInterval = setInterval(async () => {
      try {
        // Query latest 1 order
        const { data: latestOrder, error: oErr } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (!oErr && latestOrder && latestOrder.length > 0) {
          const item = latestOrder[0];
          const ids = getNotifiedIds();
          
          // Only trigger if not already in localStorage
          if (!ids.includes(item.id)) {
            // Also ensure it is a recently created order (e.g. within past 10 minutes) to avoid triggering on old db rows during init
            const ageMs = Date.now() - new Date(item.created_at).getTime();
            if (ageMs < 10 * 60 * 1000) {
              triggerNotification(item, 'order');
            }
          }
        }

        // Query latest 1 estimate
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
      } catch (err) {
        console.warn('[Notifier] Polling failure:', err);
      }
    }, 20000);

    // Clean up connections on unmount or route change
    return () => {
      console.log('[Notifier] Cleaning up listeners and channels...');
      clearInterval(pollingInterval);
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(estimateChannel);
    };
  }, [isUserAdmin, isAdminPage]);

  // Handle click on audio toggle checkbox
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

  // Do not render anything if not an admin page or not admin user
  if (!isUserAdmin || !isAdminPage) return null;

  return (
    <div className="admin-notifier-fixed-box">
      {/* Sound Controller Toggle */}
      <div className="notifier-sound-toggle-card">
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
                {toast.type === 'order' ? '주문' : '견적'}
              </span>
              <button className="btn-close-toast" onClick={() => removeToast(toast.id)}>
                <X size={14} />
              </button>
            </div>
            
            <h4 className="toast-title">{toast.title}</h4>
            
            <div className="toast-meta-grid">
              <div className="meta-item">
                <span className="lbl">접수번호</span>
                <span className="val font-mono">{toast.number}</span>
              </div>
              <div className="meta-item">
                <span className="lbl">고객 정보</span>
                <span className="val">{toast.customer} ({toast.phone})</span>
              </div>
              <div className="meta-item">
                <span className="lbl">결제금액</span>
                <span className="val price">{(toast.amount || 0).toLocaleString()}원</span>
              </div>
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
