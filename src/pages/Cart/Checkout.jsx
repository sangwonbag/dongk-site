import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { useEstimateCart } from "../../contexts/EstimateCartContext";
import { useAuth } from "../../contexts/AuthContext";
import { createOrder } from "../../services/orderService";
import { sendOrderNotification } from "../../services/notificationService";
import "./Checkout.css";

const DELIVERY_TIME_OPTIONS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
  "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00"
];

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    cartItems: globalCartItems, 
    clearCart, 
    getPendingDirectOrder, 
    removePendingDirectOrder 
  } = useEstimateCart();
  const { user, openLoginModal } = useAuth();

  const hasAutoOpened = useRef(false);

  // 바로구매용 임시 품목 상태 결정
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isDirectOrder, setIsDirectOrder] = useState(false);

  // 주문자 입력 정보
  const [customer, setCustomer] = useState({
    name: "",
    company_name: "",
    phone: "",
    email: "",
    address: "",
    address_detail: "",
    delivery_date: "",
    delivery_time: "",
    memo: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("무통장입금"); // 무통장입금 | 전화확인
  const [hasElevator, setHasElevator] = useState("yes"); // yes | no
  const [needCarry, setNeedCarry] = useState("no"); // yes | no
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);

  // Helper to parse price string/number cleanly
  const parsePrice = (priceVal) => {
    if (priceVal === undefined || priceVal === null) return 0;
    if (typeof priceVal === 'number') return priceVal;
    
    const cleanStr = String(priceVal).replace(/[^0-9]/g, "");
    const parsed = parseInt(cleanStr, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // 페이지 진입 시 사용자 및 장바구니 정보 확인
  useEffect(() => {
    if (loading || isOrderSuccess) return;
    const pendingDirect = getPendingDirectOrder();
    let targetItems = [];
    let isDirect = false;

    if (location.state?.isDirect && location.state?.directOrderItem) {
      targetItems = [location.state.directOrderItem];
      isDirect = true;
    } else if (pendingDirect) {
      targetItems = [pendingDirect];
      isDirect = true;
    } else {
      targetItems = globalCartItems;
      isDirect = false;
    }

    // 주문 대상 품목이 없다면 리다이렉트
    if (!targetItems || targetItems.length === 0) {
      alert("주문할 대상 상품이 없습니다.");
      navigate("/cart");
      return;
    }

    // 가격 확인 필요 상품 검사 및 차단
    const hasUnpriced = targetItems.some(item => {
      const price = parsePrice(item.price || item.unit_price);
      return price <= 0;
    });

    if (hasUnpriced) {
      alert("장바구니에 가격 확인이 필요한 자재가 포함되어 있어 주문 진행이 불가합니다.\n해당 상품을 제외하시거나 견적 요청을 진행해 주세요.");
      navigate("/cart");
      return;
    }

    setCheckoutItems(targetItems);
    setIsDirectOrder(isDirect);

    // 로그인하지 않은 사용자라면 로그인 모달 유도
    if (!user) {
      if (!hasAutoOpened.current) {
        hasAutoOpened.current = true;
        openLoginModal();
      }
      return;
    }

    // 로그인되어 있다면 폼 자동 완성
    setCustomer({
      name: user.name || "",
      company_name: user.company_name || "",
      phone: user.phone || "",
      email: user.email || "",
      address: user.address || "",
      address_detail: user.address_detail || "",
      delivery_date: "",
      delivery_time: "",
      memo: "",
    });
  }, [globalCartItems, navigate, user, openLoginModal, location.state, getPendingDirectOrder, isOrderSuccess, loading]);

  const [showPostcodeLayer, setShowPostcodeLayer] = useState(false);
  const postcodeContainerRef = useRef(null);

  const handleAddressSearch = () => {
    if (window.kakao?.Postcode) {
      setShowPostcodeLayer(true);
      return;
    }

    const scriptId = "kakao-postcode-script";
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.async = true;
      script.onload = () => {
        if (window.kakao?.Postcode) {
          setShowPostcodeLayer(true);
        } else {
          alert("주소검색 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
        }
      };
      script.onerror = () => {
        alert("주소검색 서비스를 불러오는 중 오류가 발생했습니다.");
      };
      document.body.appendChild(script);
    } else {
      if (window.kakao?.Postcode) {
        setShowPostcodeLayer(true);
      } else {
        script.addEventListener("load", () => {
          if (window.kakao?.Postcode) {
            setShowPostcodeLayer(true);
          }
        });
      }
    }
  };

  useEffect(() => {
    if (!showPostcodeLayer || !postcodeContainerRef.current) return;

    const kakao = window.kakao;
    new kakao.Postcode({
      oncomplete: function (data) {
        const fullAddress =
          data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;

        setCustomer((prev) => ({
          ...prev,
          address: `(${data.zonecode}) ${fullAddress}`,
          address_detail: "",
        }));

        setShowPostcodeLayer(false);

        setTimeout(() => {
          document.getElementById("customer_address_detail")?.focus();
        }, 50);
      },
      width: "100%",
      height: "100%",
    }).embed(postcodeContainerRef.current);
  }, [showPostcodeLayer]);

  // 총액 자동 계산
  const calculateTotal = () => {
    return checkoutItems.reduce((sum, item) => {
      const qty = Math.max(1, parseInt(item.quantity) || 1);
      const price = parsePrice(item.price || item.unit_price);
      return sum + (price * qty);
    }, 0);
  };

  const totalTypesCount = checkoutItems.length;

  const totalQuantitySum = checkoutItems.reduce((sum, item) => {
    return sum + (parseInt(item.quantity) || 1);
  }, 0);

  // 주문 실행
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg("");

    // 로그인 여부 검사
    if (!user) {
      openLoginModal();
      return;
    }

    // 필수값 검사
    if (!customer.name.trim()) {
      setErrorMsg("받는 사람 이름을 입력해주세요.");
      return;
    }
    if (!customer.phone.trim()) {
      setErrorMsg("연락처를 입력해주세요.");
      return;
    }
    if (!customer.address.trim()) {
      setErrorMsg("배송주소를 입력해주세요.");
      return;
    }

    // 희망배송일 지정 시 시간 선택 필수 검사
    if (customer.delivery_date && !customer.delivery_time) {
      setErrorMsg("희망 배송 시간을 선택해주세요.");
      return;
    }

    // 연락처 형식 검사 (최소 10자리 숫자 이상)
    const digitsOnly = customer.phone.replace(/[^0-9]/g, "");
    if (digitsOnly.length < 10) {
      setErrorMsg("연락처는 최소 10자리 이상의 숫자로 입력해 주세요.");
      return;
    }

    // 이메일 유효성 검사 (입력된 경우에만 진행)
    if (customer.email && customer.email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customer.email.trim())) {
        setErrorMsg("올바른 이메일 형식을 입력해 주세요.");
        return;
      }
    }

    // 가격 미정 상품 재검사
    const hasUnpriced = checkoutItems.some(item => {
      const price = parsePrice(item.price || item.unit_price);
      return price <= 0;
    });

    if (hasUnpriced) {
      setErrorMsg("가격 확인이 필요한 자재가 포함되어 있어 주문 진행이 불가합니다.");
      return;
    }

    setLoading(true);
    try {
      const siteInfo = `[현장정보] 엘리베이터: ${hasElevator === "yes" ? "있음" : "없음"} / 양중(계단운반): ${needCarry === "yes" ? "필요(운임협의)" : "불필요(1층하차)"}`;
      const finalMemo = customer.memo ? `${siteInfo}\n[요청사항] ${customer.memo}` : siteInfo;

      // 주문 생성 API 호출
      const orderData = await createOrder({
        cartItems: checkoutItems,
        customer: {
          ...customer,
          memo: finalMemo
        },
        paymentMethod
      });

      setIsOrderSuccess(true);

      // 장바구니 및 바로구매 임시 정보 완전 초기화
      await clearCart({ clearAll: true });
      removePendingDirectOrder();

      // 비동기 알림 발송 (주문 성공 플로우에 지장을 주지 않도록 격리)
      // 1. 관리자 알림 발송
      try {
        const adminNotif = await sendOrderNotification(orderData, "admin");
        if (!adminNotif.success) {
          console.warn("[Checkout Warning] 관리자 주문 접수 알림 전송 실패:", adminNotif.error);
        }
      } catch (notifErr) {
        console.warn("[Checkout Exception] 관리자 주문 접수 알림 전송 중 오류:", notifErr);
      }

      // 2. 고객 알림 발송 (이메일 주소가 기입된 경우에만 진행)
      if (customer.email && customer.email.trim() !== "") {
        try {
          const customerNotif = await sendOrderNotification(orderData, "customer");
          if (!customerNotif.success) {
            console.warn("[Checkout Warning] 고객 주문 확인 이메일 전송 실패:", customerNotif.error);
          }
        } catch (notifErr) {
          console.warn("[Checkout Exception] 고객 주문 확인 이메일 전송 중 오류:", notifErr);
        }
      }

      // 주문 완료 화면으로 이동 (뒤로가기 방지를 위해 replace: true 추가)
      try {
        localStorage.setItem("last_completed_order", JSON.stringify(orderData));
      } catch (storageErr) {
        console.warn("[Checkout Warning] localStorage 저장 실패:", storageErr);
      }
      navigate("/order-complete", { state: { order: orderData }, replace: true });
    } catch (err) {
      console.error("[Checkout Error]", err);
      setErrorMsg(err.message || "주문 처리 중 에러가 발생했습니다. 다시 시도해 주세요.");
      alert(`주문 실패: ${err.message || "서버 오류"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="checkout-page-container">
        {/* 주문서 헤더 */}
        <div className="checkout-header">
          {isDirectOrder ? (
            <span className="order-type-badge direct-buy">⚡ 바로구매 주문</span>
          ) : (
            <span className="order-type-badge">📦 장바구니 주문</span>
          )}
          <h1>주문서 작성</h1>
          <p>배송 정보와 요청사항을 확인한 뒤 주문을 접수해주세요.</p>
        </div>

        <form onSubmit={handleOrderSubmit} className="checkout-layout" noValidate>
          {/* 1. 왼쪽: 주문자 정보 입력 폼 */}
          <div className="checkout-left-section">
            <div className="checkout-card">
              <h3>배송 정보 입력</h3>
              
              {!user && (
                <div className="non-member-banner">
                  <p>주문 완료를 위해 로그인이 필요합니다.</p>
                  <button 
                    type="button" 
                    className="btn-auth-trigger"
                    onClick={openLoginModal}
                  >
                    로그인 / 회원가입 하기
                  </button>
                </div>
              )}

              <div className="checkout-form-grid">
                <div className="form-group-checkout">
                  <label htmlFor="customer_name">받는 사람 / 주문자명 <span className="req">*</span></label>
                  <input
                    id="customer_name"
                    type="text"
                    placeholder="받는 분 성함 또는 주문자명을 입력해 주세요"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group-checkout">
                  <label htmlFor="customer_company">업체명 <span className="opt">(선택)</span></label>
                  <input
                    id="customer_company"
                    type="text"
                    placeholder="업체명 또는 상호를 입력하세요"
                    value={customer.company_name}
                    onChange={(e) => setCustomer({ ...customer, company_name: e.target.value })}
                  />
                </div>

                <div className="form-group-checkout">
                  <label htmlFor="customer_phone">연락처 <span className="req">*</span></label>
                  <input
                    id="customer_phone"
                    type="tel"
                    placeholder="받는 분 연락처를 입력해 주세요 (숫자 10자리 이상)"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group-checkout">
                  <label htmlFor="customer_email">이메일 <span className="opt">(선택)</span></label>
                  <input
                    id="customer_email"
                    type="email"
                    placeholder="주문 확인용 이메일 주소를 입력해 주세요"
                    value={customer.email || ""}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  />
                </div>

                <div className="form-group-checkout">
                  <label htmlFor="customer_address">배송주소 <span className="req">*</span></label>
                  <div className="checkout-address-search-row">
                    <input
                      id="customer_address"
                      type="text"
                      placeholder="우측 '주소 검색' 버튼을 클릭해 주세요"
                      value={customer.address}
                      onClick={handleAddressSearch}
                      readOnly
                      required
                    />
                    <button 
                      type="button" 
                      className="btn-checkout-address-search"
                      onClick={handleAddressSearch}
                    >
                      주소 검색
                    </button>
                  </div>
                </div>

                <div className="form-group-checkout">
                  <label htmlFor="customer_address_detail">상세주소 <span className="opt">(선택)</span></label>
                  <input
                    id="customer_address_detail"
                    type="text"
                    placeholder="상세 호수 및 상세 정보를 입력해 주세요"
                    value={customer.address_detail}
                    onChange={(e) => setCustomer({ ...customer, address_detail: e.target.value })}
                  />
                </div>

                <div className="form-group-checkout-datetime">
                  <div className="datetime-field">
                    <label htmlFor="customer_delivery_date">희망배송일 <span className="opt">(선택)</span></label>
                    <input
                      id="customer_delivery_date"
                      type="date"
                      value={customer.delivery_date}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setCustomer({ 
                          ...customer, 
                          delivery_date: newDate,
                          delivery_time: newDate ? customer.delivery_time : "" 
                        });
                      }}
                    />
                  </div>
                  <div className="datetime-field">
                    <label htmlFor="customer_delivery_time">희망시간 {customer.delivery_date && <span className="req">*</span>}</label>
                    <select
                      id="customer_delivery_time"
                      value={customer.delivery_time || ""}
                      onChange={(e) => setCustomer({ ...customer, delivery_time: e.target.value })}
                      disabled={!customer.delivery_date}
                    >
                      <option value="">시간 선택</option>
                      {DELIVERY_TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 🏗️ B2B 현장 배송 조건 입력 필드 */}
                <div className="form-group-checkout-radio-row">
                  <div className="radio-field">
                    <label>엘리베이터 유무 <span className="req">*</span></label>
                    <div className="checkout-radio-group">
                      <label className={`checkout-radio-label ${hasElevator === "yes" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="elevator"
                          value="yes"
                          checked={hasElevator === "yes"}
                          onChange={() => setHasElevator("yes")}
                        />
                        있음 (사용 가능)
                      </label>
                      <label className={`checkout-radio-label ${hasElevator === "no" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="elevator"
                          value="no"
                          checked={hasElevator === "no"}
                          onChange={() => setHasElevator("no")}
                        />
                        없음 (계단 이동)
                      </label>
                    </div>
                  </div>

                  <div className="radio-field">
                    <label>양중 작업(계단 운반) <span className="req">*</span></label>
                    <div className="checkout-radio-group">
                      <label className={`checkout-radio-label ${needCarry === "no" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="carry"
                          value="no"
                          checked={needCarry === "no"}
                          onChange={() => setNeedCarry("no")}
                        />
                        불필요 (1층 하차)
                      </label>
                      <label className={`checkout-radio-label ${needCarry === "yes" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="carry"
                          value="yes"
                          checked={needCarry === "yes"}
                          onChange={() => setNeedCarry("yes")}
                        />
                        필요 (운임 협의)
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group-checkout full-width">
                  <label htmlFor="customer_memo">요청사항 <span className="opt">(선택)</span></label>
                  <textarea
                    id="customer_memo"
                    placeholder="배송 혹은 시공 시 요청사항이 있으시면 적어주세요"
                    value={customer.memo}
                    onChange={(e) => setCustomer({ ...customer, memo: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* 결제방식 선택 카드 */}
            <div className="checkout-card">
              <h3>결제 방식</h3>
              <div className="payment-method-selector">
                <label className={`payment-option ${paymentMethod === "무통장입금" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="무통장입금"
                    checked={paymentMethod === "무통장입금"}
                    onChange={() => setPaymentMethod("무통장입금")}
                  />
                  <div className="payment-option-desc">
                    <strong>무통장입금</strong>
                    <span>주문 완료 후 아래 계좌로 입금해 주세요. (가장 빠른 접수 가능)</span>
                  </div>
                </label>

                <label className={`payment-option ${paymentMethod === "전화확인" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="전화확인"
                    checked={paymentMethod === "전화확인"}
                    onChange={() => setPaymentMethod("전화확인")}
                  />
                  <div className="payment-option-desc">
                    <strong>전화확인 주문</strong>
                    <span>상담 전화 통화 후 결제 및 배송을 안내해 드립니다.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 2. 오른쪽: 주문상품 요약 */}
          <div className="checkout-right-section">
            <div className="summary-sticky-card">
              <h3>주문 자재 요약</h3>
              
              {/* 카드 형태로 개선한 주문 자재 리스트 */}
              <div className="summary-item-list">
                {checkoutItems.map((item) => {
                  const qty = Math.max(1, parseInt(item.quantity) || 1);
                  const price = parsePrice(item.price || item.unit_price);
                  const hasPrice = price > 0;
                  const itemSpec = item.spec || item.specs?.size || "표준규격";
                  const itemPacking = item.packing || item.specs?.packing || "1박스 단위";

                  return (
                    <div key={item.id} className="summary-item-card">
                      {/* 썸네일 */}
                      <div className="summary-item-thumb-wrapper">
                        <img 
                          className="summary-item-thumb"
                          src={item.thumbnail || item.image || "/images/no-image.svg"} 
                          alt={item.name || item.product_name}
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/placeholder-material.jpg"; }}
                        />
                      </div>
                      
                      {/* 사양 */}
                      <div className="summary-item-info">
                        <div className="summary-item-brand-row">
                          {item.brand && <span className="summary-item-brand">{item.brand}</span>}
                          {item.category && <span className="summary-item-category">{item.category}</span>}
                        </div>
                        <span className="summary-item-name">
                          {item.name || item.product_name}
                          {item.selectedSize && ` / ${item.selectedSize}`}
                        </span>
                        <div className="summary-item-details">
                          {item.code && item.code !== "" && <span>코드: {item.code}</span>}
                          <span>규격: {itemSpec}</span>
                          <span>구성: {itemPacking}</span>
                          <span>단가: {hasPrice ? `${price.toLocaleString()}원` : "가격문의"}</span>
                        </div>
                      </div>

                      {/* 단가 및 소계 */}
                      <div className="summary-item-price-side">
                        <div className="summary-item-price-qty">{qty}박스(M)</div>
                        {hasPrice ? (
                          <div className="summary-item-price-total">
                            ₩{(price * qty).toLocaleString()}원
                          </div>
                        ) : (
                          <div className="summary-item-price-total consult-text">상담 필요</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="summary-detail-rows">
                <div className="summary-detail-row">
                  <span>상품 종류 수</span>
                  <span>{totalTypesCount}종</span>
                </div>
                <div className="summary-detail-row">
                  <span>총 수량</span>
                  <span>{totalQuantitySum.toLocaleString()}박스(M)</span>
                </div>
                <div className="summary-detail-row">
                  <span>상품금액</span>
                  <span>{calculateTotal().toLocaleString()}원</span>
                </div>
                <div className="summary-detail-row">
                  <span>배송비</span>
                  <span>별도 협의 (또는 0원)</span>
                </div>
              </div>

              <div className="summary-total-section">
                <div className="total-row">
                  <span>최종 주문금액</span>
                  <strong>{calculateTotal().toLocaleString()}원</strong>
                </div>
                <p className="vat-notice">* 배송비 및 부가세는 별도로 안내됩니다.</p>
              </div>

              {/* 무통장 입금 안내 카드박스 */}
              {paymentMethod === "무통장입금" && (
                <div className="checkout-bank-transfer-box">
                  <strong>💳 무통장 입금 정보</strong>
                  <div className="bank-info-grid">
                    <div className="bank-info-row">
                      <span className="bank-info-label">은행명</span>
                      <span className="bank-info-val">농협은행</span>
                    </div>
                    <div className="bank-info-row">
                      <span className="bank-info-label">계좌번호</span>
                      <span className="bank-info-val">301-0298-9197-81</span>
                    </div>
                    <div className="bank-info-row">
                      <span className="bank-info-label">예금주</span>
                      <span className="bank-info-val">동경바닥재</span>
                    </div>
                  </div>
                  <div className="bank-guideline">
                    • 실제 주문금액과 입금금액이 정확히 일치해야 자동 입금 확인 처리가 가능합니다.<br />
                    • 입금 확인 후 주문 접수가 완료되며, 담당자가 개별 유선 연락을 드립니다.
                  </div>
                </div>
              )}

              {errorMsg && <div className="checkout-error-banner">{errorMsg}</div>}

              <button 
                type="submit" 
                className="btn-order-submit" 
                disabled={loading}
              >
                {loading ? "주문 접수 중..." : "최종 주문하기"}
              </button>
              
              <button 
                type="button" 
                className="btn-back-to-cart"
                onClick={() => navigate("/cart")}
                disabled={loading}
              >
                장바구니로 돌아가기
              </button>
            </div>
          </div>
        </form>
      </div>

      {showPostcodeLayer && (
        <div className="checkout-postcode-overlay" onClick={() => setShowPostcodeLayer(false)}>
          <div className="checkout-postcode-modal" onClick={(e) => e.stopPropagation()}>
            <div className="postcode-modal-header">
              <h3>주소 검색</h3>
              <button 
                type="button" 
                className="btn-close-postcode" 
                onClick={() => setShowPostcodeLayer(false)}
                aria-label="닫기"
              >
                &times;
              </button>
            </div>
            <div ref={postcodeContainerRef} className="postcode-embed-container"></div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
