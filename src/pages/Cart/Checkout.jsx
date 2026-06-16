import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { useEstimateCart } from "../../contexts/EstimateCartContext";
import { useAuth } from "../../contexts/AuthContext";
import { createOrder } from "../../services/orderService";
import { sendOrderNotification } from "../../services/notificationService";
import "./Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems: globalCartItems, clearCart } = useEstimateCart();
  const { user, openLoginModal } = useAuth();

  // 바로구매용 임시 품목 상태 결정
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isDirectOrder, setIsDirectOrder] = useState(false);

  // 주문자 입력 정보
  const [customer, setCustomer] = useState({
    name: "",
    company_name: "",
    phone: "",
    address: "",
    address_detail: "",
    delivery_date: "",
    memo: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("무통장입금"); // 무통장입금 | 전화확인
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 페이지 진입 시 사용자 및 장바구니 정보 확인
  useEffect(() => {
    const pendingDirect = localStorage.getItem("pendingDirectOrder");
    let targetItems = [];
    let isDirect = false;

    if (location.state?.isDirect && location.state?.directOrderItem) {
      targetItems = [location.state.directOrderItem];
      isDirect = true;
    } else if (pendingDirect) {
      try {
        targetItems = [JSON.parse(pendingDirect)];
        isDirect = true;
      } catch (e) {
        console.error("Failed to parse pending direct order", e);
      }
    } else {
      targetItems = globalCartItems;
      isDirect = false;
    }

    setCheckoutItems(targetItems);
    setIsDirectOrder(isDirect);

    // 주문 대상 품목이 없다면 리다이렉트
    if (!targetItems || targetItems.length === 0) {
      alert("주문할 대상 상품이 없습니다.");
      navigate("/cart");
      return;
    }

    // 로그인하지 않은 사용자라면 로그인 모달 유도
    if (!user) {
      openLoginModal();
      return;
    }

    // 로그인되어 있다면 폼 자동 완성
    setCustomer({
      name: user.name || "",
      company_name: user.company_name || "",
      phone: user.phone || "",
      address: user.address || "",
      address_detail: user.address_detail || "",
      delivery_date: "",
      memo: "",
    });
  }, [globalCartItems, navigate, user, openLoginModal, location.state]);

  // 총액 자동 계산
  const calculateTotal = () => {
    return checkoutItems.reduce((sum, item) => {
      const qty = Math.max(1, parseInt(item.quantity) || 1);
      const price = Math.max(0, parseFloat(item.price || item.unit_price) || 0);
      return sum + (price * qty);
    }, 0);
  };

  // 주문 실행
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // 로그인 여부 검사
    if (!user) {
      openLoginModal();
      return;
    }

    // 필수값 검사
    if (!customer.name.trim()) {
      setErrorMsg("주문자명을 입력해주세요.");
      return;
    }
    if (!customer.phone.trim()) {
      setErrorMsg("연락처를 입력해주세요.");
      return;
    }
    if (!customer.address.trim()) {
      setErrorMsg("주소를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      // 주문 생성 API 호출
      const orderData = await createOrder({
        cartItems: checkoutItems,
        customer,
        paymentMethod
      });

      // 장바구니 비우기 분기 처리
      if (isDirectOrder) {
        localStorage.removeItem("pendingDirectOrder");
      } else {
        clearCart();
      }

      // 비동기 알림 발송 (주문 성공 플로우에 지장을 주지 않도록 격리)
      try {
        const notifResult = await sendOrderNotification(orderData);
        if (!notifResult.success) {
          console.warn("[Checkout Warning] 주문 접수 완료 알림 전송 실패:", notifResult.error);
        }
      } catch (notifErr) {
        console.warn("[Checkout Exception] 주문 접수 완료 알림 전송 중 오류:", notifErr);
      }

      // 주문 완료 화면으로 이동
      navigate("/order-complete", { state: { order: orderData } });
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
        <div className="checkout-header">
          <h1>주문서 작성</h1>
          <p>고객님의 주문 정보를 작성하고 주문을 완료해 주세요.</p>
        </div>

        <form onSubmit={handleOrderSubmit} className="checkout-layout">
          {/* 1. 왼쪽: 주문자 정보 입력 폼 */}
          <div className="checkout-left-section">
            <div className="checkout-card">
              <h3>주문 정보 입력</h3>
              
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
                  <label htmlFor="customer_name">주문자명 <span className="req">*</span></label>
                  <input
                    id="customer_name"
                    type="text"
                    placeholder="주문하시는 분의 성함을 입력하세요"
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
                    placeholder="연락 가능한 전화번호를 입력하세요"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group-checkout">
                  <label htmlFor="customer_address">주소 <span className="req">*</span></label>
                  <input
                    id="customer_address"
                    type="text"
                    placeholder="주소를 입력하세요"
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group-checkout">
                  <label htmlFor="customer_address_detail">상세주소 <span className="opt">(선택)</span></label>
                  <input
                    id="customer_address_detail"
                    type="text"
                    placeholder="상세주소를 입력하세요"
                    value={customer.address_detail}
                    onChange={(e) => setCustomer({ ...customer, address_detail: e.target.value })}
                  />
                </div>

                <div className="form-group-checkout">
                  <label htmlFor="customer_delivery_date">희망 배송/시공일 <span className="opt">(선택)</span></label>
                  <input
                    id="customer_delivery_date"
                    type="date"
                    value={customer.delivery_date}
                    onChange={(e) => setCustomer({ ...customer, delivery_date: e.target.value })}
                  />
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
            <div className="checkout-card" style={{ marginTop: "20px" }}>
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
                    <span>주문 완료 후 계좌로 입금해 주세요. (가장 빠른 접수 가능)</span>
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
              
              <div className="summary-item-list">
                {checkoutItems.map((item) => {
                  const qty = Math.max(1, parseInt(item.quantity) || 1);
                  const price = Math.max(0, parseFloat(item.price || item.unit_price) || 0);
                  const hasPrice = (item.price || item.unit_price) !== undefined && (item.price || item.unit_price) !== null;

                  return (
                    <div key={item.id} className="summary-item-row">
                      <div className="summary-item-info">
                        <span className="summary-item-brand">[{item.brand}]</span>
                        <span className="summary-item-name">{item.name || item.product_name}</span>
                        <div className="summary-item-details">
                          <span>코드: {item.code || item.product_code || "-"}</span>
                          <span>규격: {item.spec || "-"}</span>
                          <span>수량: {qty}{item.unit || "평"}</span>
                        </div>
                      </div>
                      <div className="summary-item-price">
                        {hasPrice ? (
                          `${(price * qty).toLocaleString()}원`
                        ) : (
                          <span className="consult-text">상담 필요</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="summary-total-section">
                <div className="total-row">
                  <span>총 주문금액</span>
                  <strong>{calculateTotal().toLocaleString()}원</strong>
                </div>
                <p className="vat-notice">* 배송비 및 부가세는 별도로 안내됩니다.</p>
              </div>

              {errorMsg && <div className="checkout-error-banner">{errorMsg}</div>}

              <button 
                type="submit" 
                className="btn-order-submit" 
                disabled={loading}
              >
                {loading ? "주문 처리 중..." : "주문하기"}
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
    </MainLayout>
  );
}
