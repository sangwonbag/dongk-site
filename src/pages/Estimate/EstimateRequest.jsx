import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { KAKAO_CHAT_URL, OFFICE_PHONE, OFFICE_ADDRESS, NAVER_MAP_URL } from '../../constants/contact';
import { useEstimateCart } from '../../contexts/EstimateCartContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Trash2, Plus, Minus, CheckCircle, Phone, MessageSquare, MapPin, Calculator, FileText, X } from 'lucide-react';
import MaterialSearchModal from './MaterialSearchModal';
import JangpanAutoCalculator from '../../components/estimate/JangpanAutoCalculator';
import { createEstimateInquiry } from '../../services/estimateInquiryService';
import { sendOrderNotification } from '../../services/notificationService';
import { loadDaumPostcode } from '../../utils/loadDaumPostcode';
import { getComputedBrand, formatProductTitle, getProductUnit } from '../../utils/brandUtils';
import { getMaterialImagePath } from '../../utils/materialImageResolver';
import SEO from '../../components/seo/SEO';
import { supabase } from '../../lib/supabaseClient';
import './EstimateRequest.css';

const ACCESSORY_OPTIONS = ['걸레받이', '본드', '실리콘', '논슬립', '마감재', '문턱/재료분리대'];
const CUSTOMER_TYPES = ['일반 소비자', '인테리어/시공 업자', '건설사/업체', '기타'];
const SITE_TYPES = ['아파트', '빌라', '상가', '사무실', '병원/학원', '공장', '기타'];
const WORK_TYPES = ['자재만 구매', '자재 + 시공', '철거 포함', '기존 바닥 위 시공', '상담 후 결정'];
const CONSULTATION_TYPES = ['전화 상담', '카카오톡 1:1 상담', '방문 상담'];

export default function EstimateRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { cartItems, updateQuantity, syncAutomaticQuantities, removeFromCart, clearCart } = useEstimateCart();
  const { user: currentUser, openLoginModal } = useAuth();
  
  const [activeViewTab, setActiveViewTab] = useState('calc'); // 'calc' | 'inquiry'
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedNo, setSubmittedNo] = useState("");

  // Selected Material from product detail or URL parameter
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states - Pre-filled from logged in user
  const [customer, setCustomer] = useState({
    type: '일반 소비자',
    name: '',
    phone: '',
    email: '',
    consultation: '전화 상담'
  });

  const ESTIMATE_DRAFT_KEY = 'dk_pending_estimate';
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const isSubmittingRef = useRef(false);

  // Save draft before login navigation
  const saveEstimateDraft = () => {
    try {
      const draft = {
        customer,
        site,
        selectedMaterial,
        accessories,
        extraAccessory,
        requestMemo,
        activeViewTab,
        step,
        draftSavedAt: Date.now()
      };
      sessionStorage.setItem(ESTIMATE_DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      console.error('[EstimateRequest] Failed to save draft:', e);
    }
  };

  // Restore draft from sessionStorage after login or page revisit
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(ESTIMATE_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          // Check draft expiration (24h)
          const MAX_DRAFT_AGE_MS = 24 * 60 * 60 * 1000;
          if (parsed.draftSavedAt && (Date.now() - parsed.draftSavedAt > MAX_DRAFT_AGE_MS)) {
            sessionStorage.removeItem(ESTIMATE_DRAFT_KEY);
            return;
          }

          if (parsed.customer) setCustomer(prev => ({ ...prev, ...parsed.customer }));
          if (parsed.site) setSite(prev => ({ ...prev, ...parsed.site }));
          if (parsed.selectedMaterial) setSelectedMaterial(parsed.selectedMaterial);
          if (Array.isArray(parsed.accessories)) setAccessories(parsed.accessories);
          if (parsed.extraAccessory !== undefined) setExtraAccessory(parsed.extraAccessory);
          if (parsed.requestMemo !== undefined) setRequestMemo(parsed.requestMemo);
          if (parsed.activeViewTab) setActiveViewTab(parsed.activeViewTab);
          if (parsed.step) setStep(parsed.step);
          // Note: Do not remove draft here; remove ONLY after successful DB submission!
        }
      }
    } catch (e) {
      console.error('[EstimateRequest] Failed to restore draft:', e);
    }
  }, []);

  // Pre-fill customer fields when logged in
  useEffect(() => {
    if (currentUser) {
      setCustomer(prev => ({
        ...prev,
        name: prev.name || currentUser.name || '',
        phone: prev.phone || currentUser.phone || '',
        email: prev.email || currentUser.email || '',
      }));
    }
  }, [currentUser]);

  const isUnselectedRef = useRef(false);
  const lastParamIdRef = useRef(null);

  // Handle selected material from URL param or location.state
  useEffect(() => {
    const paramId = searchParams.get('materialId') || location.state?.materialId || location.state?.selectedProduct?.id;
    const stateProduct = location.state?.selectedProduct || location.state?.selectedMaterial;

    if (paramId && paramId !== lastParamIdRef.current) {
      isUnselectedRef.current = false;
      lastParamIdRef.current = paramId;
    }

    if (!paramId && !stateProduct) {
      return;
    }

    if (isUnselectedRef.current) {
      return;
    }

    let alive = true;

    async function resolveMaterial() {
      let found = null;
      let isNetworkError = false;

      // 1. Primary: Server Query (Supabase DB)
      if (supabase && paramId) {
        try {
          let res = await supabase.from('materials').select('*').or(`id.eq.${paramId},code.eq.${paramId},slug.eq.${paramId}`).maybeSingle();
          if (!res.data && !res.error) {
            res = await supabase.from('products').select('*').or(`id.eq.${paramId},product_code.eq.${paramId},slug.eq.${paramId}`).maybeSingle();
          }

          if (res.error) {
            console.warn('[EstimateRequest] Supabase query network error:', res.error);
            isNetworkError = true;
          } else if (res.data) {
            const p = res.data;
            // Check if product is deleted or discontinued on server
            if (p.is_active === false || p.is_deleted === true || p.status === 'discontinued' || p.status === 'deleted') {
              console.warn('[EstimateRequest] Product is deleted/discontinued on server:', paramId);
              return; // Do not select discontinued/deleted item, and do NOT fall back to local DB!
            }

            found = {
              id: p.id || p.slug,
              code: p.product_code || p.code || '',
              name: formatProductTitle(p),
              brand: getComputedBrand(p),
              category: p.category || (p.categories?.name) || '자재',
              line: p.line || p.description || '',
              spec: p.specs?.size || p.spec || p.size_text || '',
              thickness: p.thickness || (p.specs?.thickness) || '',
              price: p.price || 0,
              unit: getProductUnit(p),
              thumbnail: getMaterialImagePath(p)
            };
          }
        } catch (spErr) {
          console.warn('[EstimateRequest] Supabase exception during resolution:', spErr);
          isNetworkError = true;
        }
      } else if (!stateProduct) {
        isNetworkError = true;
      }

      // 2. If stateProduct was passed in location.state and no server override
      if (!found && stateProduct && (stateProduct.name || stateProduct.code) && !isNetworkError) {
        found = {
          id: stateProduct.id || stateProduct.product_id,
          code: stateProduct.code || stateProduct.product_code || '',
          name: stateProduct.name || stateProduct.product_name || '',
          brand: stateProduct.brand || '기타',
          category: stateProduct.category || '자재',
          line: stateProduct.line || '',
          spec: stateProduct.spec || stateProduct.selectedSize || '',
          thickness: stateProduct.thickness || '',
          price: stateProduct.price || 0,
          unit: stateProduct.unit || '박스',
          thumbnail: stateProduct.thumbnail || stateProduct.image || ''
        };
      }

      // 3. Fallback to local materials.db.js if server returned no row or connection failed
      if (!found && paramId) {
        try {
          const mod = await import('../../data/materials.db.js');
          const list = mod.materials || [];
          const localItem = list.find(m => String(m.id) === String(paramId) || String(m.code) === String(paramId) || String(m.slug) === String(paramId));
          if (localItem) {
            found = {
              id: localItem.id,
              code: localItem.code,
              name: formatProductTitle(localItem),
              brand: getComputedBrand(localItem),
              category: localItem.category || '자재',
              line: localItem.line || '',
              spec: localItem.specs?.size || localItem.spec || '',
              thickness: localItem.thickness || (localItem.specs?.thickness) || '',
              price: localItem.price || 0,
              unit: getProductUnit(localItem),
              thumbnail: getMaterialImagePath(localItem)
            };
          }
        } catch (locErr) {
          console.warn('[EstimateRequest] Local fallback error:', locErr);
        }
      }

      // Set state if query is still alive and not unselected by user
      if (found && alive && !isUnselectedRef.current) {
        setSelectedMaterial(found);
        setActiveViewTab('inquiry');
        setSite(prev => ({ ...prev, workType: '자재 + 시공' }));
      }
    }

    resolveMaterial();

    return () => {
      alive = false;
    };
  }, [searchParams, location.state]);

  const handleUnselectMaterial = () => {
    isUnselectedRef.current = true;
    setSelectedMaterial(null);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('materialId');
      return next;
    }, { replace: true });

    if (location.state) {
      location.state.selectedProduct = null;
      location.state.selectedMaterial = null;
      location.state.materialId = null;
    }
    navigate('.', { replace: true, state: {} });
  };

  // Backward compatibility: Map '문자 상담' or '카카오톡 상담' to '카카오톡 1:1 상담'
  useEffect(() => {
    if (customer.consultation === '문자 상담' || customer.consultation === '카카오톡 상담') {
      setCustomer(prev => ({ ...prev, consultation: '카카오톡 1:1 상담' }));
    }
  }, [customer.consultation]);

  const [site, setSite] = useState({
    address: '', detailAddress: '', preferredDate: '', type: '아파트',
    workType: '상담 후 결정', areaPyeong: '', hasElevator: false, parkingAvailable: false,
    hasLuggage: false, demolition: '상담 후 결정'
  });
  
  const [accessories, setAccessories] = useState([]);
  const [extraAccessory, setExtraAccessory] = useState('');
  const [requestMemo, setRequestMemo] = useState('');
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [errors, setErrors] = useState([]);
  const detailAddressRef = useRef(null);

  const [activeTab, setActiveTab] = useState('전화 상담');

  useEffect(() => {
    if (submitSuccess) {
      let initialTab = customer.consultation;
      if (initialTab === '문자 상담' || initialTab === '카카오톡 상담') {
        initialTab = '카카오톡 1:1 상담';
      }
      setActiveTab(initialTab || '전화 상담');
    }
  }, [submitSuccess, customer.consultation]);

  const handleAddressSearch = async () => {
    try {
      const Postcode = await loadDaumPostcode();
      new Postcode({
        oncomplete: (data) => {
          const fullAddress = data.roadAddress || data.address;
          setSite(prev => ({
            ...prev,
            address: fullAddress
          }));
          
          setTimeout(() => {
            if (detailAddressRef.current) {
              detailAddressRef.current.focus();
            }
          }, 100);
        }
      }).open();
    } catch (err) {
      console.error(err);
      alert('주소찾기 서비스를 불러오지 못했습니다. 직접 주소를 입력해주세요.');
    }
  };

  // Auto-recommend accessories based on cart items
  useEffect(() => {
    if (cartItems.length > 0) {
      const cats = cartItems.map(item => item.category);
      let recommended = new Set(accessories);
      if (cats.includes('데코타일') || cats.includes('장판')) {
        recommended.add('걸레받이');
        recommended.add('본드');
        recommended.add('실리콘');
        recommended.add('마감재');
      }
      setAccessories(Array.from(recommended));
    }
  }, [cartItems]); // Run when cart changes

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  };

  const handleQtyChange = (itemId, newQty) => {
    let qty = parseFloat(newQty);
    if (isNaN(qty)) qty = 0; // Temporarily allow 0 while typing
    updateQuantity(itemId, qty, { isManual: true });
  };

  const handleNext = () => {
    const errs = [];
    if (step === 1) {
      if (!customer.name.trim()) errs.push('이름 또는 업체명을 입력해주세요.');
      if (!customer.phone.trim()) errs.push('연락처를 입력해주세요.');
    } else if (step === 2) {
      if (!site.address.trim()) errs.push('현장 주소를 입력해주세요.');
      
      if (site.areaPyeong) {
        const pyeongVal = parseFloat(site.areaPyeong);
        if (isNaN(pyeongVal) || pyeongVal <= 0) {
          errs.push('예상 평수는 0보다 큰 숫자여야 합니다.');
        } else if (pyeongVal > 1000) {
          errs.push('예상 평수는 최대 1000평까지만 입력 가능합니다.');
        }
      }
    }
    
    if (errs.length > 0) {
      setErrors(errs);
      window.scrollTo(0, 0);
      return;
    }
    setErrors([]);

    // Step 2 -> 3 transition: Sync automatic quantities
    if (step === 2) {
      syncAutomaticQuantities(site.areaPyeong);
    }

    setStep(s => s + 1);
    window.scrollTo(0, 0);
  };

  const handleGoToLogin = () => {
    saveEstimateDraft();
    const currentPath = location.pathname + location.search;
    navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
  };

  const handleSubmit = async () => {
    if (isSubmittingRef.current || isSubmitting) return;

    if (!currentUser) {
      saveEstimateDraft();
      setShowLoginPrompt(true);
      return;
    }

    if (!agreePrivacy) {
      setErrors(['개인정보 수집 및 이용에 동의해야 합니다.']);
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setErrors([]);

    try {
      let finalPreferredDate = site.preferredDate;
      if (!finalPreferredDate) {
        finalPreferredDate = null;
      }

      let selectedItems = cartItems.map(item => ({
        product_id: item.productId || item.product_id || item.id,
        category: item.category || null,
        brand: item.brand || null,
        product_code: item.code || null,
        code: item.code || null,
        product_name: item.name || "",
        spec: item.selectedSize || item.spec || null,
        quantity: item.quantity || 1,
        unit_price: item.price || 0,
        supply_amount: Math.round((item.price || 0) * (item.quantity || 1))
      }));

      if (selectedMaterial) {
        const exists = selectedItems.some(i => String(i.product_id) === String(selectedMaterial.id));
        if (!exists) {
          selectedItems.unshift({
            product_id: selectedMaterial.id,
            category: selectedMaterial.category || null,
            brand: selectedMaterial.brand || null,
            product_code: selectedMaterial.code || null,
            code: selectedMaterial.code || null,
            product_name: selectedMaterial.name || "",
            spec: selectedMaterial.spec || null,
            quantity: 1,
            unit_price: selectedMaterial.price || 0,
            supply_amount: Math.round(selectedMaterial.price || 0)
          });
        }
      }

      const subtotal = selectedItems.reduce((sum, item) => sum + (item.supply_amount || 0), 0);

      const mappedConsultation = customer.consultation === '문자 상담' ? '카카오톡 1:1 상담' : customer.consultation;

      const payload = {
        customer_type: customer.type,
        customer_name: customer.name,
        phone: customer.phone,
        email: customer.email || null,
        site_address: site.address,
        site_detail_address: site.detailAddress || null,
        preferred_date: finalPreferredDate,
        consultation_type: mappedConsultation,
        site_type: site.type,
        work_type: site.workType,
        area_pyeong: site.areaPyeong ? Number(site.areaPyeong) : null,
        has_elevator: site.hasElevator,
        parking_available: site.parkingAvailable,
        accessory_options: accessories,
        extra_accessory_text: extraAccessory || null,
        request_memo: `[상담 방식: ${mappedConsultation}]\n${requestMemo}`,
        subtotal: Math.round(subtotal),
        total: Math.round(subtotal),
        selected_items: selectedItems
      };

      const inquiryData = await createEstimateInquiry(payload);

      // 이메일 알림 전송 (비동기 처리)
      const estNo = inquiryData.estimate_no || (inquiryData.id ? inquiryData.id.substring(0, 8).toUpperCase() : 'EST-' + Date.now());
      sendOrderNotification({
        order_no: `[견적요청] ${estNo}`,
        customer_name: customer.name,
        company_name: customer.type || '',
        phone: customer.phone,
        email: customer.email || '',
        address: site.address || '주소 정보 없음',
        address_detail: site.detailAddress || '',
        memo: payload.request_memo,
        delivery_request_date: finalPreferredDate || '',
        payment_method: '견적 상담',
        payment_status: '견적 요청 접수',
        status: '접수완료',
        total_amount: Math.round(subtotal),
        order_items: (selectedItems || []).map(item => ({
          product_name: item.name || item.product_name || '자재',
          product_code: item.code || item.product_code || '-',
          brand: item.brand || '',
          spec: item.spec || item.selectedSize || '-',
          unit: item.unit || '개',
          quantity: item.quantity || 1,
          unit_price: item.price || item.unit_price || 0,
          image_url: item.image || item.thumbnail || ''
        })),
        created_at: new Date().toISOString()
      }, 'admin').catch(e => console.warn('[Estimate Notification Exception]:', e));

      // DB 저장 성공 시에만 임시 draft 데이터 삭제
      sessionStorage.removeItem(ESTIMATE_DRAFT_KEY);

      setSubmittedNo(estNo);
      setSubmitSuccess(true);
      clearCart();
      window.scrollTo(0, 0);

    } catch (err) {
      console.error('[EstimateRequest Submit Error Details]:', {
        message: err.message,
        stack: err.stack,
        customer,
        site,
        cartItems,
        accessories,
        extraAccessory,
        requestMemo
      });

      if (err.message && err.message.includes('UNAUTHORIZED')) {
        saveEstimateDraft();
        setShowLoginPrompt(true);
      } else {
        setErrors(['견적요청 저장 중 문제가 발생했습니다. 작성 내용은 유지되어 있습니다. 다시 시도해 주세요.']);
      }
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <MainLayout>
        <div className="container" style={{ paddingBottom: '100px' }}>
          <div className="est-success-card">
            <div className="success-icon-wrapper">
              <CheckCircle size={40} />
            </div>
            <h2 className="success-title">견적요청이 완료되었습니다</h2>
            <p className="success-subtitle">
              담당자가 요청 내용을 확인한 후 연락드리겠습니다.
            </p>
            <div className="success-receipt">
              접수번호: {submittedNo}
            </div>

            <div className="consult-section-title">상담 방법 선택 및 안내</div>

            <div className="consult-cards-grid">
              <div 
                className={`consult-card ${activeTab === '전화 상담' ? 'active' : ''}`}
                onClick={() => setActiveTab('전화 상담')}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab('전화 상담'); }}
                role="button"
                aria-pressed={activeTab === '전화 상담'}
              >
                <Phone className="card-icon" size={24} />
                <span className="consult-card-title">전화 상담</span>
                <span className="consult-card-desc">빠르고 직관적인 유선 상담</span>
              </div>

              <div 
                className={`consult-card ${activeTab === '카카오톡 1:1 상담' ? 'active' : ''}`}
                onClick={() => setActiveTab('카카오톡 1:1 상담')}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab('카카오톡 1:1 상담'); }}
                role="button"
                aria-pressed={activeTab === '카카오톡 1:1 상담'}
              >
                <MessageSquare className="card-icon" size={24} />
                <span className="consult-card-title">카카오톡 1:1 상담</span>
                <span className="consult-card-desc">실시간 메신저 채팅 상담</span>
              </div>

              <div 
                className={`consult-card ${activeTab === '방문 상담' ? 'active' : ''}`}
                onClick={() => setActiveTab('방문 상담')}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab('방문 상담'); }}
                role="button"
                aria-pressed={activeTab === '방문 상담'}
              >
                <MapPin className="card-icon" size={24} />
                <span className="consult-card-title">방문 상담</span>
                <span className="consult-card-desc">사무실 직접 방문 및 대면 상담</span>
              </div>
            </div>

            <div className="active-details-box">
              {activeTab === '전화 상담' && (
                <>
                  <div className="details-header">
                    <div className="details-title-row">
                      <Phone size={20} color="var(--primary)" />
                      <h4>전화 상담</h4>
                    </div>
                    <p className="details-desc">동경바닥재 담당자와 전화로 상담할 수 있습니다.</p>
                  </div>
                  <ul className="details-content-list">
                    <li className="details-content-item">
                      <span className="label">전화번호</span>
                      <span className="value" style={{ fontSize: '16px', fontWeight: '700', color: 'var(--point-orange)' }}>{OFFICE_PHONE}</span>
                    </li>
                  </ul>
                  <div className="details-action-buttons">
                    <a href={`tel:${OFFICE_PHONE}`} className="btn-detail-phone">
                      📞 동경바닥재 전화하기
                    </a>
                  </div>
                </>
              )}

              {activeTab === '카카오톡 1:1 상담' && (
                <>
                  <div className="details-header">
                    <div className="details-title-row">
                      <MessageSquare size={20} color="#FEE500" style={{ fill: '#FEE500' }} />
                      <h4>카카오톡 1:1 상담</h4>
                    </div>
                    <p className="details-desc">접수된 견적요청 내용을 기준으로 카카오톡에서 빠르게 상담받을 수 있습니다.</p>
                  </div>
                  <ul className="details-content-list">
                    <li className="details-content-item">
                      <span className="label">채널명</span>
                      <span className="value">동경바닥재</span>
                    </li>
                    <li className="details-content-item">
                      <span className="label">채널 주소</span>
                      <span className="value">{KAKAO_CHAT_URL}</span>
                    </li>
                  </ul>
                  <div className="details-action-buttons">
                    <a 
                      href={KAKAO_CHAT_URL} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-detail-kakao"
                    >
                      💬 동경바닥재 카카오톡 1:1 상담
                    </a>
                  </div>
                </>
              )}

              {activeTab === '방문 상담' && (
                <>
                  <div className="details-header">
                    <div className="details-title-row">
                      <MapPin size={20} color="var(--point-gold)" />
                      <h4>방문 상담</h4>
                    </div>
                    <p className="details-desc">방문 상담을 선택하셨습니다. 사무실 방문 전 전화로 재고 및 상담 가능 시간을 확인해 주세요.</p>
                  </div>
                  <ul className="details-content-list">
                    <li className="details-content-item">
                      <span className="label">주소</span>
                      <span className="value">{OFFICE_ADDRESS}</span>
                    </li>
                    <li className="details-content-item">
                      <span className="label">대표전화</span>
                      <span className="value">{OFFICE_PHONE}</span>
                    </li>
                  </ul>
                  <div className="details-action-buttons">
                    <a href={`tel:${OFFICE_PHONE}`} className="btn-detail-phone">
                      📞 사무실 전화하기
                    </a>
                    <a 
                      href={NAVER_MAP_URL} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-detail-map"
                    >
                      🗺️ 지도에서 위치 보기
                    </a>
                  </div>
                </>
              )}
            </div>

            <div className="success-footer-actions">
              <button 
                className="btn-secondary" 
                onClick={() => navigate('/')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155'
                }}
              >
                🏠 홈으로 가기
              </button>
              <button 
                className="btn-primary" 
                onClick={() => navigate('/mypage')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none'
                }}
              >
                📋 내 견적 확인하기
              </button>
              <button 
                className="btn-primary" 
                onClick={() => navigate('/materials')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none'
                }}
              >
                📦 자재 더 보기
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleCalculatorInquiry = (quoteResult) => {
    if (quoteResult && quoteResult.areaPyeong) {
      setSite(prev => ({ ...prev, areaPyeong: String(quoteResult.areaPyeong) }));
    }
    setActiveViewTab('inquiry');
    setStep(1);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const pyeongVal = parseFloat(site.areaPyeong);
  const defaultQuantity = (!isNaN(pyeongVal) && pyeongVal > 0) ? (pyeongVal > 1000 ? 1000 : pyeongVal) : 1;

  return (
    <MainLayout>
      <SEO 
        title="자동 견적 및 상담 문의 | 동경바닥재"
        description="동경바닥재 자재 수량 계산기 및 자동 견적 시스템. 면적(㎡, 평) 입력 시 수량 및 예상 자재비를 실시간 계산하고 상담을 신청하세요."
        canonical="https://dkfloor.co.kr/estimate"
      />
      <div className={`container est-page ${activeViewTab === 'calc' ? 'wide-page' : ''}`}>
        <div className="est-header">
          <h1>자동견적 & 상담요청</h1>
          <p>실시간 장판 자동 견적계산 및 1:1 맞춤 견적 문의를 빠르게 진행하세요.</p>
        </div>

        {/* View Switcher Tabs */}
        <div className="est-view-tabs">
          <button
            type="button"
            className={`btn-est-tab ${activeViewTab === 'calc' ? 'active' : ''}`}
            onClick={() => setActiveViewTab('calc')}
          >
            <Calculator size={18} />
            <span>장판 자동 견적계산기</span>
          </button>
          <button
            type="button"
            className={`btn-est-tab ${activeViewTab === 'inquiry' ? 'active' : ''}`}
            onClick={() => setActiveViewTab('inquiry')}
          >
            <FileText size={18} />
            <span>1:1 견적요청 / 상담접수</span>
          </button>
        </div>

        {activeViewTab === 'calc' ? (
          <JangpanAutoCalculator onSelectForInquiry={handleCalculatorInquiry} />
        ) : (
          <>
            {selectedMaterial ? (
              <div className="selected-material-banner-card">
                <div className="selected-material-header">
                  <div className="selected-material-title-badge">
                    <CheckCircle size={18} />
                    <span>선택한 시공 상담 자재</span>
                  </div>
                  <button 
                    type="button" 
                    className="btn-unselect-material"
                    onClick={handleUnselectMaterial}
                    title="선택 자재 해제 및 변경"
                  >
                    <X size={15} />
                    <span>선택 해제</span>
                  </button>
                </div>
                
                <div className="selected-material-body">
                  {selectedMaterial.thumbnail && (
                    <img 
                      src={selectedMaterial.thumbnail} 
                      alt={selectedMaterial.name} 
                      className="selected-material-thumb"
                    />
                  )}
                  <div className="selected-material-details">
                    <div className="selected-material-brand-tag">
                      {selectedMaterial.brand} {selectedMaterial.category ? `· ${selectedMaterial.category}` : ''}
                    </div>
                    <h4 className="selected-material-name">{selectedMaterial.name}</h4>
                    
                    <div className="selected-material-meta">
                      {selectedMaterial.code && <span className="meta-pill">코드: {selectedMaterial.code}</span>}
                      {selectedMaterial.spec && <span className="meta-pill">규격: {selectedMaterial.spec}</span>}
                      {selectedMaterial.thickness && <span className="meta-pill">두께: {selectedMaterial.thickness}</span>}
                    </div>

                    <div className="selected-material-price-row">
                      <span className="price-label">자재 판매가:</span>
                      {selectedMaterial.price ? (
                        <span className="price-val">
                          {Number(selectedMaterial.price).toLocaleString()}원
                          <span className="unit-suffix"> / {selectedMaterial.unit || '박스'}</span>
                        </span>
                      ) : (
                        <span className="price-consult">상담 후 안내</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="selected-material-notice">
                  💡 선택하신 자재 정보가 견적서에 저장됩니다. 시공비는 현장 면적(평수) 및 현장 여건 확인 후 최종 안내해 드립니다.
                </div>
              </div>
            ) : location.state?.selectedProduct ? (
              <div className="product-prefill-banner" style={{
                backgroundColor: '#e6f4ea',
                border: '1.5px solid #137333',
                color: '#137333',
                padding: '16px 20px',
                borderRadius: '12px',
                marginBottom: '30px',
                fontSize: '14.5px',
                fontWeight: '600',
                lineHeight: '1.5',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <CheckCircle size={20} style={{ flexShrink: 0 }} />
                <div>
                  선택하신 자재 <strong>[{location.state.selectedProduct.brand}] {location.state.selectedProduct.name}{location.state.selectedProduct.selectedSize ? ` / ${location.state.selectedProduct.selectedSize}` : ''} {location.state.selectedProduct.code ? `(${location.state.selectedProduct.code})` : ''}</strong> 정보가 견적서에 자동 추가되었습니다.
                </div>
              </div>
            ) : null}

            {/* Steps */}
            <div className="est-stepper">
              {[1, 2, 3, 4].map(num => (
                <div key={num} className={`step ${step === num ? 'active' : step > num ? 'completed' : ''}`}>
                  <div className="step-circle">{step > num ? '✓' : num}</div>
                  <span>
                    {num === 1 ? '고객정보' : num === 2 ? '현장정보' : num === 3 ? '자재선택' : '확인/제출'}
                  </span>
                </div>
              ))}
            </div>

            {errors.length > 0 && (
              <div className="est-errors">
                <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
              </div>
            )}

        <div className="est-form">
          {step === 1 && (
            <div className="form-section">
              <h3>기본 정보 입력</h3>

              <div className="form-group">
                <label>이름 또는 업체명 <span className="req">*</span></label>
                <input type="text" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} placeholder="홍길동 / 동경인테리어" />
              </div>

              <div className="form-group">
                <label>연락처 <span className="req">*</span></label>
                <input type="tel" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} placeholder="010-0000-0000" />
              </div>

              <div className="form-group">
                <label>이메일 (선택)</label>
                <input type="email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} placeholder="example@email.com" />
              </div>

              <div className="form-group">
                <label>상담 방식 <span className="req">*</span></label>
                <div className="radio-group">
                  {CONSULTATION_TYPES.map(t => (
                    <label key={t} className="radio-label">
                      <input type="radio" checked={customer.consultation === t} onChange={() => setCustomer({...customer, consultation: t})} />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-section">
              <h3>현장 정보 입력</h3>
              
              <div className="form-group">
                <label>현장 주소 <span className="req">*</span></label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <input 
                    type="text" 
                    value={site.address} 
                    onChange={e => setSite({...site, address: e.target.value})} 
                    placeholder="시/도 구/군 동/면/리" 
                    style={{ flex: 1, minWidth: '200px', margin: 0 }}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddressSearch}
                    style={{
                      padding: '10px 18px',
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13.5px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      minHeight: '42px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    🔍 주소 찾기
                  </button>
                </div>
                <input 
                  type="text" 
                  ref={detailAddressRef}
                  value={site.detailAddress} 
                  onChange={e => setSite({...site, detailAddress: e.target.value})} 
                  placeholder="상세 주소 (선택)" 
                  style={{ margin: 0 }}
                />
              </div>

              <div className="form-group">
                <label>희망 시공/납품일 (선택)</label>
                <input type="date" value={site.preferredDate} onChange={e => setSite({...site, preferredDate: e.target.value})} />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>현장 유형 <span className="req">*</span></label>
                  <select value={site.type} onChange={e => setSite({...site, type: e.target.value})}>
                    {SITE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group half">
                  <label>작업 구분 <span className="req">*</span></label>
                  <select value={site.workType} onChange={e => setSite({...site, workType: e.target.value})}>
                    {WORK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>예상 평수 (선택)</label>
                <div className="input-with-unit">
                  <input type="number" step="any" value={site.areaPyeong} onChange={e => setSite({...site, areaPyeong: e.target.value})} placeholder="0" />
                  <span>평</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={site.hasElevator} onChange={e => setSite({...site, hasElevator: e.target.checked})} />
                    엘리베이터 있음
                  </label>
                </div>
                <div className="form-group half checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={site.parkingAvailable} onChange={e => setSite({...site, parkingAvailable: e.target.checked})} />
                    주차 가능
                  </label>
                </div>
              </div>

              <div className="form-row" style={{ marginTop: '15px' }}>
                <div className="form-group half checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={site.hasLuggage} onChange={e => setSite({...site, hasLuggage: e.target.checked})} />
                    시공 공간 내 짐 있음
                  </label>
                </div>
                <div className="form-group half">
                  <label>기존 바닥 철거 여부 <span className="req">*</span></label>
                  <select value={site.demolition} onChange={e => setSite({...site, demolition: e.target.value})}>
                    <option value="철거 필요">철거 필요 (시공 전 철거 필요)</option>
                    <option value="철거 불필요">철거 불필요 (빈 바닥 / 덧방)</option>
                    <option value="상담 후 결정">상담 후 결정</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-section">
              <div className="section-header-row">
                <h3>선택된 자재</h3>
                <button type="button" className="btn-secondary btn-sm" onClick={() => setIsModalOpen(true)}>
                  <Plus size={16} /> 자재 추가
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="empty-cart-msg">담긴 자재가 없습니다. 추가 버튼을 눌러주세요.</div>
              ) : (
                <div className="est-items">
                  {cartItems.map(item => (
                    <div key={item.id} className="est-item-card">
                      <div className="est-item-info">
                        <strong>
                          [{item.brand}] {item.name}
                          {item.selectedSize && ` / ${item.selectedSize}`}
                        </strong>
                        <div style={{ fontSize: '11px', color: '#888', marginTop: '2px', display: 'flex', gap: '8px' }}>
                          {item.code && item.code !== "" && <span className="est-item-code">코드: {item.code}</span>}
                          <span>규격: {item.spec || item.specs?.size || '표준규격'}</span>
                        </div>
                      </div>
                      
                      <div className="est-item-qty-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="est-item-qty" style={{ margin: 0 }}>
                          <button type="button" onClick={() => handleQtyChange(item.id, Math.max(1, (item.quantity || 1) - 1))}><Minus size={14}/></button>
                          <input 
                            type="number" 
                            step="any" 
                            value={item.quantity === 0 ? '' : item.quantity} 
                            onChange={(e) => handleQtyChange(item.id, e.target.value)} 
                            onBlur={(e) => {
                              let val = parseFloat(e.target.value);
                              if (isNaN(val) || val <= 0) {
                                val = 1;
                              } else if (val > 1000) {
                                val = 1000;
                                alert('수량은 최대 1000평까지 입력 가능합니다.');
                              } else {
                                val = Math.round(val * 100) / 100;
                              }
                              handleQtyChange(item.id, val);
                            }}
                          />
                          <button type="button" onClick={() => handleQtyChange(item.id, (item.quantity || 1) + 1)}><Plus size={14}/></button>
                        </div>
                        <span className="qty-unit" style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-muted)' }}>평</span>
                      </div>

                      <div className="est-item-price">
                        {item.price ? `${Math.round((item.price) * item.quantity).toLocaleString()}원` : <span className="consult-price">상담 후 안내</span>}
                      </div>
                      <button type="button" className="btn-delete-item" onClick={() => removeFromCart(item.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <div className="est-subtotal">
                    <span>자재 합계 (단가 없는 항목 제외)</span>
                    <strong>{Math.round(calculateSubtotal()).toLocaleString()}원</strong>
                  </div>
                </div>
              )}

              <h3 style={{ marginTop: '30px' }}>부자재 추천 (선택)</h3>
              <div className="accessory-grid">
                {ACCESSORY_OPTIONS.map(opt => (
                  <label key={opt} className="checkbox-label acc-label">
                    <input type="checkbox" checked={accessories.includes(opt)} onChange={(e) => {
                      if (e.target.checked) setAccessories([...accessories, opt]);
                      else setAccessories(accessories.filter(a => a !== opt));
                    }} />
                    {opt}
                  </label>
                ))}
              </div>
              <input type="text" value={extraAccessory} onChange={e => setExtraAccessory(e.target.value)} placeholder="기타 직접 입력" className="extra-acc-input" />
            </div>
          )}

          {step === 4 && (
            <div className="form-section review-section">
              <h3>요청사항</h3>
              <textarea 
                className="est-textarea"
                rows="4" 
                value={requestMemo} 
                onChange={e => setRequestMemo(e.target.value)}
                placeholder="예: KCC 600각 5531 5평, 걸레받이 2개, 실리콘 2개 필요합니다. 이번 주 안에 납품 가능 여부도 알려주세요."
              ></textarea>

              <div className="review-box">
                <h4>최종 확인</h4>
                <div className="review-row"><span>고객명:</span> {customer.name}</div>
                <div className="review-row"><span>연락처:</span> {customer.phone}</div>
                <div className="review-row"><span>상담 방식:</span> {customer.consultation === '문자 상담' ? '카카오톡 1:1 상담' : customer.consultation}</div>
                <div className="review-row"><span>현장:</span> {site.address} {site.detailAddress}</div>
                <div className="review-row"><span>자재:</span> {cartItems.length}종 담김</div>
                <div className="review-row"><span>자재 예상액:</span> {Math.round(calculateSubtotal()).toLocaleString()}원 (VAT 별도)</div>
              </div>

              <div className="privacy-consent">
                <label className="checkbox-label">
                  <input type="checkbox" checked={agreePrivacy} onChange={e => setAgreePrivacy(e.target.checked)} />
                  개인정보 수집 및 상담 목적 이용에 동의합니다. (필수)
                </label>
              </div>

              {!currentUser && (
                <div className="est-login-notice font-medium text-slate-500 mt-3 text-center text-xs">
                  견적 신청은 로그인 후 이용 가능합니다.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="est-actions">
          {step > 1 && (
            <button type="button" className="btn-secondary" onClick={() => setStep(s => s - 1)}>
              이전 단계
            </button>
          )}
          {step < 4 ? (
            <button type="button" className="btn-primary" onClick={handleNext}>
              다음 단계
            </button>
          ) : (
            <button type="button" className="btn-primary btn-submit" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? '전송 중...' : '견적요청 보내기'}
            </button>
          )}
        </div>
      </>
    )}
  </div>

      {isModalOpen && (
        <MaterialSearchModal 
          onClose={() => setIsModalOpen(false)} 
          defaultQuantity={defaultQuantity}
        />
      )}

      {showLoginPrompt && (
        <div className="est-modal-overlay">
          <div className="est-modal-card">
            <div className="est-modal-header">
              <h3>로그인 안내</h3>
            </div>
            <div className="est-modal-body">
              <p>견적 신청은 로그인 후 이용할 수 있습니다.</p>
            </div>
            <div className="est-modal-actions">
              <button type="button" className="btn-modal-login" onClick={handleGoToLogin}>
                로그인하기
              </button>
              <button type="button" className="btn-modal-continue" onClick={() => setShowLoginPrompt(false)}>
                계속 견적 확인하기
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
