import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { KAKAO_CHAT_URL, OFFICE_PHONE, OFFICE_ADDRESS, NAVER_MAP_URL } from '../../constants/contact';
import { useEstimateCart } from '../../contexts/EstimateCartContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle, 
  Phone, 
  MessageSquare, 
  MapPin, 
  FileText, 
  X, 
  AlertCircle,
  Truck,
  Layers,
  Calendar,
  Building,
  User
} from 'lucide-react';
import MaterialSearchModal from './MaterialSearchModal';
import { createEstimateInquiry } from '../../services/estimateInquiryService';
import { sendOrderNotification } from '../../services/notificationService';
import { loadDaumPostcode } from '../../utils/loadDaumPostcode';
import { getComputedBrand, formatProductTitle, getProductUnit } from '../../utils/brandUtils';
import { getMaterialImagePath } from '../../utils/materialImageResolver';
import { getProductImageCandidates } from '../../utils/productImageResolver';
import SEO from '../../components/seo/SEO';
import { HIDE_SUB_MATERIALS } from '../../config/categoryConfig';
import { supabase } from '../../lib/supabaseClient';
import './EstimateRequest.css';

const ACCESSORY_OPTIONS = ['걸레받이', '본드', '실리콘', '논슬립', '마감재', '문턱/재료분리대'];
const SITE_TYPES = ['아파트', '빌라', '상가', '사무실', '병원/학원', '공장', '기타'];
const WORK_TYPES = ['자재만 구매', '자재 + 시공', '철거 포함', '상담 후 결정'];
const CONSULTATION_TYPES = ['전화 상담', '카카오톡 1:1 상담', '방문 상담'];
const DEMOLITION_OPTIONS = [
  '상담 후 결정',
  '철거 필요 (시공 전 기존 바닥 철거)',
  '철거 불필요 (빈 바닥 / 덧방 시공)'
];

export default function EstimateRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { cartItems, updateQuantity, syncAutomaticQuantities, removeFromCart, clearCart } = useEstimateCart();
  const { user: currentUser } = useAuth();
  
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
    name: '',
    phone: '',
    email: '',
    consultation: '전화 상담'
  });

  const [site, setSite] = useState({
    address: '',
    detailAddress: '',
    preferredDate: '',
    type: '아파트',
    workType: '자재 + 시공',
    areaPyeong: '',
    hasElevator: false,
    parkingAvailable: false,
    transportNotes: '',
    demolition: '상담 후 결정'
  });
  
  const [accessories, setAccessories] = useState([]);
  const [extraAccessory, setExtraAccessory] = useState('');
  const [requestMemo, setRequestMemo] = useState('');
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [errors, setErrors] = useState([]);
  const detailAddressRef = useRef(null);

  const [activeTab, setActiveTab] = useState('전화 상담');

  const ESTIMATE_DRAFT_KEY = 'dk_pending_estimate_inquiry';
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
          if (parsed.step) setStep(parsed.step);
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
            if (p.is_active === false || p.is_deleted === true || p.status === 'discontinued' || p.status === 'deleted') {
              console.warn('[EstimateRequest] Product is deleted/discontinued on server:', paramId);
              return;
            }

            const candidates = getProductImageCandidates(p);
            found = {
              id: p.id || p.slug,
              code: p.product_code || p.code || '',
              name: formatProductTitle(p),
              brand: getComputedBrand(p),
              category: p.category || (p.categories?.name) || '자재',
              line: p.line || p.description || '',
              spec: p.specs?.size || p.spec || p.size_text || '표준규격',
              thickness: p.thickness || (p.specs?.thickness) || '',
              price: p.price || 0,
              unit: getProductUnit(p),
              thumbnail: candidates[0] || getMaterialImagePath(p) || '/images/no-image.svg'
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
        const candidates = getProductImageCandidates(stateProduct);
        found = {
          id: stateProduct.id || stateProduct.product_id,
          code: stateProduct.code || stateProduct.product_code || '',
          name: stateProduct.name || stateProduct.product_name || '',
          brand: stateProduct.brand || '기타',
          category: stateProduct.category || '자재',
          line: stateProduct.line || '',
          spec: stateProduct.spec || stateProduct.selectedSize || '표준규격',
          thickness: stateProduct.thickness || '',
          price: stateProduct.price || 0,
          unit: stateProduct.unit || '평',
          thumbnail: stateProduct.thumbnail || stateProduct.image || candidates[0] || '/images/no-image.svg'
        };
      }

      // Set state if query is still alive and not unselected by user
      if (found && alive && !isUnselectedRef.current) {
        setSelectedMaterial(found);
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

  // Backward compatibility: Map consultation names
  useEffect(() => {
    if (customer.consultation === '문자 상담' || customer.consultation === '카카오톡 상담') {
      setCustomer(prev => ({ ...prev, consultation: '카카오톡 1:1 상담' }));
    }
  }, [customer.consultation]);

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
      if (cats.includes('데코타일') || cats.includes('장판')) {
        setAccessories(prev => {
          const recommended = new Set(prev);
          recommended.add('걸레받이');
          recommended.add('본드');
          recommended.add('실리콘');
          recommended.add('마감재');
          return Array.from(recommended);
        });
      }
    }
  }, [cartItems]);

  const handleQtyChange = (itemId, newQty) => {
    let qty = parseFloat(newQty);
    if (isNaN(qty)) qty = 0;
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
    if (step === 2 && site.areaPyeong) {
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
      setErrors(['개인정보 수집 및 상담 목적 이용에 동의해야 합니다.']);
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
        unit: item.unit || '평',
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
            unit: selectedMaterial.unit || '평',
            unit_price: selectedMaterial.price || 0,
            supply_amount: Math.round(selectedMaterial.price || 0)
          });
        }
      }

      const mappedConsultation = customer.consultation === '문자 상담' ? '카카오톡 1:1 상담' : customer.consultation;

      let extraDetails = [];
      if (mappedConsultation) extraDetails.push(`[상담 방식: ${mappedConsultation}]`);
      if (site.demolition) extraDetails.push(`[기존 바닥 철거: ${site.demolition}]`);
      if (site.transportNotes?.trim()) extraDetails.push(`[양중/운반 특이사항: ${site.transportNotes.trim()}]`);
      if (site.hasElevator) extraDetails.push(`[엘리베이터: 있음]`);
      if (site.parkingAvailable) extraDetails.push(`[주차 가능 여부: 가능]`);

      const fullMemo = [extraDetails.join(' '), requestMemo?.trim()].filter(Boolean).join('\n\n');

      const payload = {
        customer_type: null,
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
        request_memo: fullMemo,
        subtotal: 0,
        total: 0,
        selected_items: selectedItems
      };

      const inquiryData = await createEstimateInquiry(payload);

      const estNo = inquiryData.estimate_no || (inquiryData.id ? inquiryData.id.substring(0, 8).toUpperCase() : 'EST-' + Date.now());
      sendOrderNotification({
        order_no: `[견적문의] ${estNo}`,
        customer_name: customer.name,
        company_name: '',
        phone: customer.phone,
        email: customer.email || '',
        address: site.address || '주소 정보 없음',
        address_detail: site.detailAddress || '',
        memo: payload.request_memo,
        delivery_request_date: finalPreferredDate || '',
        payment_method: '견적 상담',
        payment_status: '견적문의 접수',
        status: '접수완료',
        total_amount: 0,
        order_items: (selectedItems || []).map(item => ({
          product_name: item.name || item.product_name || '자재',
          product_code: item.code || item.product_code || '-',
          brand: item.brand || '',
          spec: item.spec || item.selectedSize || '-',
          unit: item.unit || '평',
          quantity: item.quantity || 1,
          unit_price: 0,
          image_url: item.image || item.thumbnail || ''
        })),
        created_at: new Date().toISOString()
      }, 'admin').catch(e => console.warn('[Estimate Notification Exception]:', e));

      sessionStorage.removeItem(ESTIMATE_DRAFT_KEY);

      setSubmittedNo(estNo);
      setSubmitSuccess(true);
      clearCart();
      window.scrollTo(0, 0);

    } catch (err) {
      console.error('[EstimateRequest Submit Error Details]:', {
        message: err.message,
        customer,
        site,
        cartItems
      });

      if (err.message && err.message.includes('UNAUTHORIZED')) {
        saveEstimateDraft();
        setShowLoginPrompt(true);
      } else {
        setErrors(['견적문의 저장 중 문제가 발생했습니다. 작성 내용은 안전하게 유지되어 있습니다. 다시 시도해 주세요.']);
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
            <h2 className="success-title">견적문의가 정상 접수되었습니다</h2>
            <p className="success-subtitle">
              담당자가 확인 후 연락드리겠습니다.
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
                    <p className="details-desc">동경바닥재 담당자와 유선으로 전문 상담을 받으실 수 있습니다.</p>
                  </div>
                  <ul className="details-content-list">
                    <li className="details-content-item">
                      <span className="label">대표전화</span>
                      <span className="value" style={{ fontSize: '16px', fontWeight: '700', color: 'var(--point-gold)' }}>{OFFICE_PHONE}</span>
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
                    <p className="details-desc">접수된 견적문의 내용을 바탕으로 카카오톡에서 빠르게 상담받으실 수 있습니다.</p>
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
                      💬 카카오톡 1:1 상담 바로가기
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
                    <p className="details-desc">실물 샘플북 확인 및 대면 상담을 원하시는 경우 사무실 방문 전 전화로 방문 시간을 조율해 주세요.</p>
                  </div>
                  <ul className="details-content-list">
                    <li className="details-content-item">
                      <span className="label">사무실 주소</span>
                      <span className="value">{OFFICE_ADDRESS}</span>
                    </li>
                    <li className="details-content-item">
                      <span className="label">대표전화</span>
                      <span className="value">{OFFICE_PHONE}</span>
                    </li>
                  </ul>
                  <div className="details-action-buttons">
                    <a href={`tel:${OFFICE_PHONE}`} className="btn-detail-phone">
                      📞 방문 전 전화하기
                    </a>
                    <a 
                      href={NAVER_MAP_URL} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-detail-map"
                    >
                      🗺️ 네이버 지도 보기
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
                📋 내 문의내역 확인하기
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
                  backgroundColor: 'var(--point-gold)',
                  color: '#ffffff',
                  border: 'none'
                }}
              >
                📦 자재 더 둘러보기
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const pyeongVal = parseFloat(site.areaPyeong);
  const defaultQuantity = (!isNaN(pyeongVal) && pyeongVal > 0) ? (pyeongVal > 1000 ? 1000 : pyeongVal) : 1;

  // Active items for review / display
  const allDisplayItems = [...cartItems];
  if (selectedMaterial && !allDisplayItems.some(i => String(i.id) === String(selectedMaterial.id))) {
    allDisplayItems.unshift({
      ...selectedMaterial,
      quantity: 1
    });
  }

  return (
    <MainLayout>
      <SEO 
        title="견적문의 | 동경바닥재"
        description="원하는 자재와 현장 정보를 입력해 주시면 동경바닥재 담당자가 확인 후 맞춤 견적을 안내해 드립니다."
        canonical="https://dkfloor.co.kr/estimate"
      />
      <div className="container est-page">
        {/* Page Header */}
        <div className="est-header">
          <h1>견적문의</h1>
          <p>원하는 자재와 현장 정보를 입력해 주시면 동경바닥재 담당자가 확인 후 맞춤 견적을 안내해 드립니다.</p>
        </div>

        {/* Selected Material Banner (if navigated from product detail) */}
        {selectedMaterial && (
          <div className="selected-material-banner-card">
            <div className="selected-material-header">
              <div className="selected-material-title-badge">
                <CheckCircle size={18} />
                <span>선택한 상담 자재</span>
              </div>
              <button 
                type="button" 
                className="btn-unselect-material"
                onClick={handleUnselectMaterial}
                title="선택 자재 변경/해제"
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
              </div>
            </div>
            <div className="selected-material-notice">
              💡 선택하신 자재 정보가 견적문의에 자동으로 포함됩니다. 자재비, 시공비, 운반비는 현장 여건 확인 후 맞춤 안내해 드립니다.
            </div>
          </div>
        )}

        {/* 4-Step Stepper */}
        <div className="est-stepper">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className={`step ${step === num ? 'active' : step > num ? 'completed' : ''}`}>
              <div className="step-circle">{step > num ? '✓' : num}</div>
              <span>
                {num === 1 ? '고객정보' : num === 2 ? '현장정보' : num === 3 ? '자재선택' : '요청 및 접수'}
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
          {/* STEP 1: 고객 정보 */}
          {step === 1 && (
            <div className="form-section">
              <div className="section-title-wrap">
                <User size={20} className="sec-icon" />
                <h3>STEP 1. 고객 정보</h3>
              </div>

              <div className="form-group">
                <label>이름 또는 업체명 <span className="req">*</span></label>
                <input 
                  type="text" 
                  value={customer.name} 
                  onChange={e => setCustomer({...customer, name: e.target.value})} 
                  placeholder="예: 홍길동 / 동경인테리어" 
                />
              </div>

              <div className="form-group">
                <label>연락처 <span className="req">*</span></label>
                <input 
                  type="tel" 
                  value={customer.phone} 
                  onChange={e => setCustomer({...customer, phone: e.target.value})} 
                  placeholder="010-0000-0000" 
                />
              </div>

              <div className="form-group">
                <label>이메일 (선택)</label>
                <input 
                  type="email" 
                  value={customer.email} 
                  onChange={e => setCustomer({...customer, email: e.target.value})} 
                  placeholder="example@email.com" 
                />
              </div>

              <div className="form-group">
                <label>희망 상담 방식 <span className="req">*</span></label>
                <div className="radio-group">
                  {CONSULTATION_TYPES.map(t => (
                    <label key={t} className="radio-label">
                      <input 
                        type="radio" 
                        checked={customer.consultation === t} 
                        onChange={() => setCustomer({...customer, consultation: t})} 
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: 현장 정보 */}
          {step === 2 && (
            <div className="form-section">
              <div className="section-title-wrap">
                <Building size={20} className="sec-icon" />
                <h3>STEP 2. 현장 정보</h3>
              </div>
              
              <div className="form-group">
                <label>현장 주소 <span className="req">*</span></label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <input 
                    type="text" 
                    value={site.address} 
                    onChange={e => setSite({...site, address: e.target.value})} 
                    placeholder="주소 검색을 통해 기본 주소를 입력하세요" 
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
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      fontWeight: '700',
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
                  placeholder="상세 주소 (동/호수, 층수 등)" 
                  style={{ margin: 0 }}
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>현장 유형 <span className="req">*</span></label>
                  <select value={site.type} onChange={e => setSite({...site, type: e.target.value})}>
                    {SITE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group half">
                  <label>작업 유형 <span className="req">*</span></label>
                  <select value={site.workType} onChange={e => setSite({...site, workType: e.target.value})}>
                    {WORK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>시공 예정 평수 (선택)</label>
                  <div className="input-with-unit">
                    <input 
                      type="number" 
                      step="any" 
                      value={site.areaPyeong} 
                      onChange={e => setSite({...site, areaPyeong: e.target.value})} 
                      placeholder="예: 25" 
                    />
                    <span>평</span>
                  </div>
                </div>

                <div className="form-group half">
                  <label>시공 희망일 (선택)</label>
                  <input 
                    type="date" 
                    value={site.preferredDate} 
                    onChange={e => setSite({...site, preferredDate: e.target.value})} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>기존 바닥 철거 여부 <span className="req">*</span></label>
                <select value={site.demolition} onChange={e => setSite({...site, demolition: e.target.value})}>
                  {DEMOLITION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group half checkbox-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={site.hasElevator} 
                      onChange={e => setSite({...site, hasElevator: e.target.checked})} 
                    />
                    엘리베이터 있음
                  </label>
                </div>
                <div className="form-group half checkbox-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={site.parkingAvailable} 
                      onChange={e => setSite({...site, parkingAvailable: e.target.checked})} 
                    />
                    주차 가능
                  </label>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label>양중 및 운반 관련 정보 (선택)</label>
                <input 
                  type="text" 
                  value={site.transportNotes} 
                  onChange={e => setSite({...site, transportNotes: e.target.value})} 
                  placeholder="예: 계단 3층 운반 필요, 사다리차 진입 가능 여부, 주차장 거리 등" 
                />
              </div>
            </div>
          )}

          {/* STEP 3: 자재 선택 (가격 완전 비노출) */}
          {step === 3 && (
            <div className="form-section">
              <div className="section-header-row">
                <div className="section-title-wrap">
                  <Layers size={20} className="sec-icon" />
                  <h3>STEP 3. 자재 선택</h3>
                </div>
                <button type="button" className="btn-add-material-primary" onClick={() => setIsModalOpen(true)}>
                  <Plus size={16} /> 자재 검색 및 추가
                </button>
              </div>

              {allDisplayItems.length === 0 ? (
                <div className="empty-cart-guide-card">
                  <AlertCircle size={28} className="guide-icon" />
                  <h4>아직 선택된 자재가 없습니다</h4>
                  <p>상단의 <strong>'자재 검색 및 추가'</strong> 버튼을 눌러 원하시는 자재를 추가하실 수 있습니다.</p>
                  <div className="guide-subtext">
                    💡 특정 자재를 아직 결정하지 못하셨다면 자재를 선택하지 않고 바로 다음 단계로 넘어가실 수 있습니다.
                    원하시는 느낌이나 바닥 용도를 다음 단계의 요청사항에 적어주시면 전문 담당자가 맞춤 추천해 드립니다.
                  </div>
                </div>
              ) : (
                <div className="est-items-container">
                  {allDisplayItems.map(item => {
                    const thumb = item.thumbnail || item.image || '/images/no-image.svg';
                    return (
                      <div key={item.id} className="est-inquiry-item-card">
                        <img src={thumb} alt={item.name} className="inquiry-item-thumb" />
                        <div className="inquiry-item-info">
                          <div className="inquiry-item-brand">{item.brand || '브랜드'}</div>
                          <strong className="inquiry-item-name">{item.name}</strong>
                          <div className="inquiry-item-specs">
                            {item.code && <span className="spec-tag">코드: {item.code}</span>}
                            {item.spec && <span className="spec-tag">규격: {item.spec}</span>}
                            {item.thickness && <span className="spec-tag">두께: {item.thickness}</span>}
                          </div>
                        </div>
                        
                        <div className="inquiry-item-qty-wrap">
                          <div className="qty-control-box">
                            <button 
                              type="button" 
                              onClick={() => {
                                if (selectedMaterial && String(item.id) === String(selectedMaterial.id)) {
                                  // Selected material standalone item
                                  return;
                                }
                                handleQtyChange(item.id, Math.max(1, (item.quantity || 1) - 1));
                              }}
                              disabled={selectedMaterial && String(item.id) === String(selectedMaterial.id)}
                            >
                              <Minus size={14}/>
                            </button>
                            <input 
                              type="number" 
                              step="any" 
                              value={item.quantity === 0 ? '' : item.quantity} 
                              onChange={(e) => {
                                if (selectedMaterial && String(item.id) === String(selectedMaterial.id)) return;
                                handleQtyChange(item.id, e.target.value);
                              }}
                              onBlur={(e) => {
                                if (selectedMaterial && String(item.id) === String(selectedMaterial.id)) return;
                                let val = parseFloat(e.target.value);
                                if (isNaN(val) || val <= 0) val = 1;
                                else if (val > 1000) val = 1000;
                                else val = Math.round(val * 100) / 100;
                                handleQtyChange(item.id, val);
                              }}
                              disabled={selectedMaterial && String(item.id) === String(selectedMaterial.id)}
                            />
                            <button 
                              type="button" 
                              onClick={() => {
                                if (selectedMaterial && String(item.id) === String(selectedMaterial.id)) return;
                                handleQtyChange(item.id, (item.quantity || 1) + 1);
                              }}
                              disabled={selectedMaterial && String(item.id) === String(selectedMaterial.id)}
                            >
                              <Plus size={14}/>
                            </button>
                          </div>
                          <span className="qty-unit-txt">{item.unit || '평'}</span>
                        </div>

                        <button 
                          type="button" 
                          className="btn-delete-inquiry-item" 
                          onClick={() => {
                            if (selectedMaterial && String(item.id) === String(selectedMaterial.id)) {
                              handleUnselectMaterial();
                            } else {
                              removeFromCart(item.id);
                            }
                          }}
                          title="삭제"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {!HIDE_SUB_MATERIALS && (
                <div className="sub-materials-wrap" style={{ marginTop: '32px' }}>
                  <h4>부자재 추천 (선택)</h4>
                  <p className="sub-materials-desc">필요한 부자재를 체크하시면 현장에 맞는 소요량을 함께 산정해 드립니다.</p>
                  <div className="accessory-grid">
                    {ACCESSORY_OPTIONS.map(opt => (
                      <label key={opt} className="checkbox-label acc-label">
                        <input 
                          type="checkbox" 
                          checked={accessories.includes(opt)} 
                          onChange={(e) => {
                            if (e.target.checked) setAccessories([...accessories, opt]);
                            else setAccessories(accessories.filter(a => a !== opt));
                          }} 
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    value={extraAccessory} 
                    onChange={e => setExtraAccessory(e.target.value)} 
                    placeholder="기타 부자재 직접 입력" 
                    className="extra-acc-input" 
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 4: 요청사항 및 접수 */}
          {step === 4 && (
            <div className="form-section review-section">
              <div className="section-title-wrap">
                <FileText size={20} className="sec-icon" />
                <h3>STEP 4. 요청사항 및 접수</h3>
              </div>

              <div className="form-group">
                <label>고객 요청사항</label>
                <textarea 
                  className="est-textarea"
                  rows="4" 
                  value={requestMemo} 
                  onChange={e => setRequestMemo(e.target.value)}
                  placeholder="예: KCC 600각 데코타일 15평, 걸레받이 시공 희망합니다. 다음 주 화요일 방문 가능한지 확인 부탁드립니다. 자재를 아직 정하지 못한 경우 원하시는 느낌을 적어주셔도 좋습니다."
                ></textarea>
              </div>

              {/* Review Box without price */}
              <div className="inquiry-review-card">
                <h4>접수 정보 확인</h4>
                
                <div className="review-grid">
                  <div className="review-col">
                    <span className="col-label">고객 정보</span>
                    <div className="col-val"><strong>{customer.name}</strong></div>
                    <div className="col-sub">{customer.phone} {customer.email && `· ${customer.email}`}</div>
                    <div className="col-sub">상담 방식: <strong>{customer.consultation}</strong></div>
                  </div>

                  <div className="review-col">
                    <span className="col-label">현장 정보</span>
                    <div className="col-val">{site.address} {site.detailAddress}</div>
                    <div className="col-sub">
                      {site.type} · {site.workType}
                      {site.areaPyeong && ` · ${site.areaPyeong}평`}
                    </div>
                    <div className="col-sub">철거 여부: {site.demolition}</div>
                    {site.preferredDate && <div className="col-sub">희망일: {site.preferredDate}</div>}
                  </div>
                </div>

                <div className="review-materials-list">
                  <span className="col-label">선택 자재 ({allDisplayItems.length}건)</span>
                  {allDisplayItems.length === 0 ? (
                    <div className="no-mat-review">선택된 자재 없음 (상담 요청사항 기반 맞춤 추천)</div>
                  ) : (
                    <div className="review-mat-chips">
                      {allDisplayItems.map((m, idx) => (
                        <div key={idx} className="review-mat-chip">
                          <strong>[{m.brand}] {m.name}</strong>
                          <span>{m.code ? `(${m.code})` : ''} - {m.quantity} {m.unit || '평'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {accessories.length > 0 && (
                    <div className="review-accessories">
                      부자재: {accessories.join(', ')} {extraAccessory ? `(${extraAccessory})` : ''}
                    </div>
                  )}
                </div>

                <div className="inquiry-pricing-notice-banner">
                  💡 접수하신 내용을 확인한 후 자재비, 시공비, 운반비 등을 포함한 견적을 개별 안내해 드립니다.
                </div>
              </div>

              <div className="privacy-consent">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={agreePrivacy} 
                    onChange={e => setAgreePrivacy(e.target.checked)} 
                  />
                  개인정보 수집 및 상담 목적 이용에 동의합니다. (필수)
                </label>
              </div>

              {!currentUser && (
                <div className="est-login-notice">
                  * 견적문의 접수는 본인 확인 및 상담 관리를 위해 로그인 후 완료됩니다.
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
            <button 
              type="button" 
              className="btn-primary btn-submit" 
              onClick={handleSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? '접수 중...' : '견적문의 접수하기'}
            </button>
          )}
        </div>
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
              <p>작성하신 견적문의 내용을 안전하게 저장하고 상담을 접수하기 위해 로그인이 필요합니다.</p>
              <small>로그인 후 작성하신 내용이 그대로 복원되어 바로 접수됩니다.</small>
            </div>
            <div className="est-modal-actions">
              <button type="button" className="btn-modal-login" onClick={handleGoToLogin}>
                로그인하기
              </button>
              <button type="button" className="btn-modal-continue" onClick={() => setShowLoginPrompt(false)}>
                계속 작성하기
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
