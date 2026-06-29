import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useEstimateCart } from '../../contexts/EstimateCartContext';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Trash2, Plus, Minus, CheckCircle } from 'lucide-react';
import MaterialSearchModal from './MaterialSearchModal';
import { createEstimateInquiry } from '../../services/estimateInquiryService';
import './EstimateRequest.css';

const ACCESSORY_OPTIONS = ['걸레받이', '본드', '실리콘', '논슬립', '마감재', '문턱/재료분리대'];
const CUSTOMER_TYPES = ['일반 소비자', '인테리어/시공 업자', '건설사/업체', '기타'];
const CONSULTATION_TYPES = ['전화 상담', '문자 상담', '카카오톡 상담', '방문 상담'];
const SITE_TYPES = ['아파트', '빌라', '상가', '사무실', '병원/학원', '공장', '기타'];
const WORK_TYPES = ['자재만 구매', '자재 + 시공', '철거 포함', '기존 바닥 위 시공', '상담 후 결정'];

export default function EstimateRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useEstimateCart();
  const { user: currentUser, openLoginModal } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedNo, setSubmittedNo] = useState("");
  
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

  const hasAutoOpened = useRef(false);

  // Open login modal if not logged in
  useEffect(() => {
    if (!currentUser) {
      if (!hasAutoOpened.current) {
        hasAutoOpened.current = true;
        openLoginModal();
      }
    } else {
      setCustomer(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        phone: currentUser.phone || prev.phone,
        email: currentUser.email || prev.email,
      }));
    }
  }, [currentUser, openLoginModal]);
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

  const handleNext = () => {
    const errs = [];
    if (step === 1) {
      if (!customer.name.trim()) errs.push('이름 또는 업체명을 입력해주세요.');
      if (!customer.phone.trim()) errs.push('연락처를 입력해주세요.');
    } else if (step === 2) {
      if (!site.address.trim()) errs.push('현장 주소를 입력해주세요.');
    }
    
    if (errs.length > 0) {
      setErrors(errs);
      window.scrollTo(0, 0);
      return;
    }
    setErrors([]);
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!agreePrivacy) {
      setErrors(['개인정보 수집 및 이용에 동의해야 합니다.']);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      let finalPreferredDate = site.preferredDate;
      if (!finalPreferredDate) {
        finalPreferredDate = null; // Ensure empty string becomes null for date column
      }
      const subtotal = calculateSubtotal();

      const selectedItems = cartItems.map(item => ({
        product_id: item.productId || item.product_id || item.id,
        category: item.category || null,
        brand: item.brand || null,
        name: item.name || "",
        code: item.code || null,
        size: item.selectedSize || item.spec || null,
        quantity: item.quantity || 1,
        unit_price: item.price || 0,
        amount: (item.price || 0) * (item.quantity || 1),
        thumbnail_url: item.thumbnail || item.image || null
      }));

      const payload = {
        customer_name: customer.name,
        phone: customer.phone,
        address: `${site.address} ${site.detailAddress}`.trim(),
        space_type: site.type,
        area_pyeong: site.areaPyeong ? Number(site.areaPyeong) : null,
        elevator: site.hasElevator ? '있음' : '없음',
        luggage: site.hasLuggage ? '있음' : '없음',
        parking: site.parkingAvailable ? '가능' : '불가',
        selected_items: selectedItems,
        extra_options: {
          customer_type: customer.type,
          consultation_type: customer.consultation,
          work_type: site.workType,
          accessory_options: accessories,
          extra_accessory_text: extraAccessory
        },
        demolition: site.demolition,
        desired_date: finalPreferredDate,
        memo: requestMemo,
        estimated_total: subtotal
      };

      const inquiryData = await createEstimateInquiry(payload);

      setSubmittedNo(inquiryData.id.substring(0, 8).toUpperCase());
      setSubmitSuccess(true);
      clearCart();
      window.scrollTo(0, 0);

    } catch (err) {
      console.error(err);
      setErrors(['견적 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
          <h2>로그인 후 이용해주세요</h2>
          <p style={{ marginTop: '20px', color: '#666' }}>견적요청은 로그인된 회원만 이용 가능합니다.</p>
          <div style={{ marginTop: '40px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/');
              }
            }}>이전 화면으로 돌아가기</button>
            <button className="btn-primary" onClick={openLoginModal}>로그인하기</button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (submitSuccess) {
    return (
      <MainLayout>
        <div className="container est-success">
          <CheckCircle size={64} color="#28a745" />
          <h2>견적요청이 접수되었습니다!</h2>
          <p>접수번호: <strong>{submittedNo}</strong></p>
          <p>내용을 확인한 후 빠른 시일 내에 연락드리겠습니다.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>홈으로 돌아가기</button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container est-page">
        <div className="est-header">
          <h1>견적요청</h1>
          <p>현장 정보와 필요한 자재를 입력해주시면 확인 후 연락드리겠습니다.</p>
        </div>

        {location.state?.selectedProduct && (
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
              선택하신 자재 <strong>[{location.state.selectedProduct.brand}] {location.state.selectedProduct.name}{location.state.selectedProduct.selectedSize ? ` / ${location.state.selectedProduct.selectedSize}` : ''} {location.state.selectedProduct.code ? `(${location.state.selectedProduct.code})` : ''}</strong> 정보가 견적서에 자동 추가되었습니다. 연락처와 주소 등 기본 사항만 채우시면 간편하게 접수하실 수 있습니다.
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="est-stepper">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className={`step ${step === num ? 'active' : step > num ? 'completed' : ''}`}>
              <div className="step-circle">{num}</div>
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
                <input type="text" value={site.address} onChange={e => setSite({...site, address: e.target.value})} placeholder="시/도 구/군 동/면/리" />
                <input type="text" value={site.detailAddress} onChange={e => setSite({...site, detailAddress: e.target.value})} placeholder="상세 주소 (선택)" style={{ marginTop: '8px' }} />
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
                  <input type="number" value={site.areaPyeong} onChange={e => setSite({...site, areaPyeong: e.target.value})} placeholder="0" />
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
                      <div className="est-item-qty">
                        <button type="button" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}><Minus size={14}/></button>
                        <input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)} />
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14}/></button>
                      </div>
                      <div className="est-item-price">
                        {item.price ? `${((item.price) * item.quantity).toLocaleString()}원` : <span className="consult-price">상담 후 안내</span>}
                      </div>
                      <button type="button" className="btn-delete-item" onClick={() => removeFromCart(item.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <div className="est-subtotal">
                    <span>자재 합계 (단가 없는 항목 제외)</span>
                    <strong>{calculateSubtotal().toLocaleString()}원</strong>
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
                <div className="review-row"><span>현장:</span> {site.address} {site.detailAddress}</div>
                <div className="review-row"><span>자재:</span> {cartItems.length}종 담김</div>
                <div className="review-row"><span>자재 예상액:</span> {calculateSubtotal().toLocaleString()}원 (VAT 별도)</div>
              </div>

              <div className="privacy-consent">
                <label className="checkbox-label">
                  <input type="checkbox" checked={agreePrivacy} onChange={e => setAgreePrivacy(e.target.checked)} />
                  개인정보 수집 및 상담 목적 이용에 동의합니다. (필수)
                </label>
              </div>
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
      </div>

      {isModalOpen && (
        <MaterialSearchModal onClose={() => setIsModalOpen(false)} />
      )}
    </MainLayout>
  );
}
