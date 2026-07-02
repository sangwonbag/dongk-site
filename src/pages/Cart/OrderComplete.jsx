import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { KAKAO_CHAT_URL } from "../../constants/contact";
import { CheckCircle2 } from "lucide-react";
import "./OrderComplete.css";

export default function OrderComplete() {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isItemsExpanded, setIsItemsExpanded] = useState(true);

  // Retrieve order state (first from location.state, fallback to localStorage)
  useEffect(() => {
    if (location.state?.order) {
      setOrder(location.state.order);
    } else {
      const saved = localStorage.getItem("last_completed_order");
      if (saved) {
        try {
          setOrder(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved order from localStorage:", e);
        }
      }
    }
  }, [location]);

  const handleGoHome = () => navigate("/");
  const handleGoOrders = () => navigate("/orders");
  const handleGoCart = () => navigate("/cart");

  // Parse delivery date, time and memo text if stored in finalMemo format: [희망배송일: YYYY-MM-DD] [희망시간: HH:mm] Memo
  let deliveryDate = "";
  let deliveryTime = "";
  let memoText = "";
  if (order && order.memo) {
    memoText = order.memo;
    if (memoText.includes("[희망배송일:")) {
      const match = memoText.match(/\[희망배송일:\s*([^\]]+)\]/);
      if (match) {
        deliveryDate = match[1];
        memoText = memoText.replace(/\[희망배송일:\s*[^\]]+\]/, "").trim();
      }
    }
    if (memoText.includes("[희망시간:")) {
      const match = memoText.match(/\[희망시간:\s*([^\]]+)\]/);
      if (match) {
        deliveryTime = match[1];
        memoText = memoText.replace(/\[희망시간:\s*[^\]]+\]/, "").trim();
      }
    }
  }

  // Format YYYY-MM-DD and HH:mm to Korean display date
  const formatKoreanDateTime = (dateStr, timeStr) => {
    if (!dateStr) return "";
    let formattedDate = dateStr;
    const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateMatch) {
      const year = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]);
      const day = parseInt(dateMatch[3]);
      formattedDate = `${year}년 ${month}월 ${day}일`;
    }
    if (!timeStr) {
      return `${formattedDate} (시간 미지정)`;
    }
    return `${formattedDate} ${timeStr}`;
  };

  // Fallback / Empty state
  if (!order) {
    return (
      <MainLayout>
        <div className="order-complete-error-container">
          <div className="order-complete-error-box">
            <h3 className="error-title">주문 정보를 찾을 수 없습니다.</h3>
            <p className="error-desc">주문이 만료되었거나 올바르지 않은 접근 방식입니다. 장바구니 혹은 홈 화면으로 이동하여 다시 시도해 주세요.</p>
            <div className="error-actions">
              <button className="btn-error-primary" onClick={handleGoCart}>
                장바구니로 이동
              </button>
              <button className="btn-error-outline" onClick={handleGoHome}>
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="order-complete-page-wrapper">
        
        {/* 1. Progress steps stage indicator */}
        <div className="order-complete-progress-bar container">
          <div className="progress-step-item done">
            <span className="step-circle">01</span>
            <span className="step-label">장바구니</span>
          </div>
          <div className="progress-step-line done"></div>
          <div className="progress-step-item done">
            <span className="step-circle">02</span>
            <span className="step-label">배송/결제</span>
          </div>
          <div className="progress-step-line active"></div>
          <div className="progress-step-item active">
            <span className="step-circle">03</span>
            <span className="step-label">주문완료</span>
          </div>
        </div>

        <div className="order-complete-main-content container">
          
          {/* 2. Success message header banner */}
          <div className="order-complete-success-banner">
            <div className="success-check-icon-wrap">
              <CheckCircle2 size={52} className="success-check-icon" />
            </div>
            <h2 className="success-banner-title">주문이 완료되었습니다.</h2>
            <p className="success-banner-desc">담당자가 주문 내용을 확인한 후 신속하게 출고 상담을 위해 연락드리겠습니다.</p>
            
            <div className="success-banner-meta">
              <div className="meta-row">
                <span className="meta-label">주문번호</span>
                <strong className="meta-value order-no">{order.order_no}</strong>
              </div>
              <div className="meta-row">
                <span className="meta-label">주문일시</span>
                <span className="meta-value">
                  {order.created_at ? new Date(order.created_at).toLocaleString("ko-KR") : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Items list / Collapsible items card */}
          <div className="order-complete-card-v3 items-collapse-card">
            <div className="card-collapse-header" onClick={() => setIsItemsExpanded(!isItemsExpanded)}>
              <div className="header-left">
                <span className="header-icon">🧱</span>
                <h3 className="card-section-title">주문 자재 내역</h3>
                <span className="items-count-badge">총 {order.order_items?.length || 0}개 상품</span>
              </div>
              <button className="btn-collapse-toggle">
                {isItemsExpanded ? "상세 정보 접기 ▲" : "상세 정보 펼치기 ▼"}
              </button>
            </div>

            {isItemsExpanded && (
              <div className="card-collapse-body">
                <div className="items-table-list">
                  {order.order_items?.map((item, idx) => (
                    <div key={idx} className="item-row-card">
                      <div className="item-img-container">
                        <img 
                          src={item.image_url || "/images/placeholder.png"} 
                          alt={item.product_name} 
                          className="item-row-img" 
                          onError={(e) => { e.target.src = "/images/cross_section.png"; }}
                        />
                      </div>
                      <div className="item-row-details">
                        <span className="item-row-brand">{item.brand}</span>
                        <h4 className="item-row-name">{item.product_name}</h4>
                        {item.spec && <p className="item-row-spec">규격: {item.spec}</p>}
                        
                        <div className="item-row-pricing">
                          <span className="item-row-qty">{item.quantity} {item.unit || "평"}</span>
                          <span className="item-row-price-unit">(@ {item.unit_price?.toLocaleString()}원)</span>
                          <strong className="item-row-total">{(item.unit_price * item.quantity)?.toLocaleString()}원</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. 2-Column information split grid */}
          <div className="order-complete-grid-v3">
            
            {/* Left Column: Shipping Details */}
            <div className="order-complete-card-v3 flex-column">
              <h3 className="card-section-title border-bottom">받는 사람 정보</h3>
              
              <div className="card-details-table">
                <div className="details-row">
                  <span className="details-lbl">이름 / 상호</span>
                  <span className="details-val">{order.customer_name}</span>
                </div>
                <div className="details-row">
                  <span className="details-lbl">연락처</span>
                  <span className="details-val">{order.phone}</span>
                </div>
                <div className="details-row">
                  <span className="details-lbl">배송 주소</span>
                  <span className="details-val">
                    {order.address} {order.address_detail ? `, ${order.address_detail}` : ""}
                  </span>
                </div>
                {deliveryDate && (
                  <div className="details-row">
                    <span className="details-lbl">희망 배송일시</span>
                    <strong className="details-val text-blue">
                      {formatKoreanDateTime(deliveryDate, deliveryTime)}
                    </strong>
                  </div>
                )}
                <div className="details-row">
                  <span className="details-lbl">배송 요청사항</span>
                  <span className="details-val">{memoText || "없음"}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Payment Details */}
            <div className="order-complete-card-v3 flex-column">
              <h3 className="card-section-title border-bottom">결제 정보</h3>

              <div className="card-details-table">
                <div className="details-row">
                  <span className="details-lbl">상품 금액</span>
                  <span className="details-val">{(order.subtotal || order.total_amount)?.toLocaleString()}원</span>
                </div>
                <div className="details-row">
                  <span className="details-lbl">배송비 / 추가요금</span>
                  <span className="details-val text-gray">착불 (출고 시 화물 택배비 별도 안내)</span>
                </div>
                <div className="details-row total-amount-row">
                  <span className="details-lbl">총 결제금액</span>
                  <strong className="details-val price-highlight">
                    {order.total_amount?.toLocaleString()}원
                  </strong>
                </div>
                <div className="details-row">
                  <span className="details-lbl">결제 수단</span>
                  <span className="details-val">무통장 입금</span>
                </div>
                <div className="details-row">
                  <span className="details-lbl">결제 상태</span>
                  <span className={`payment-status-badge ${order.payment_status === 'paid' ? 'paid' : 'unpaid'}`}>
                    {order.payment_status === 'paid' ? '입금완료' : '입금대기'}
                  </span>
                </div>
              </div>

              {/* Bank Account Guidelines */}
              <div className="order-complete-bank-box">
                <h4 className="bank-box-title">무통장 입금 계좌 안내</h4>
                <div className="bank-account-details">
                  <p className="bank-name">NH농협은행</p>
                  <p className="bank-number">301-0298-9197-81</p>
                  <p className="bank-holder">예금주: 동경바닥재</p>
                </div>
                <div className="bank-box-notice" style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  <span>* 입금 시 입금자명을 주문자명 또는 회사명과 동일하게 설정해 주세요.</span>
                  <span style={{ color: 'var(--point-gold)', fontWeight: '600' }}>* 입금 확인 완료 즉시 담당자가 연락을 드려 자재 출고 일정과 현장 배송 편을 확정해 드립니다.</span>
                </div>
              </div>
            </div>

          </div>

          {/* 5. Button Actions Row */}
          <div className="order-complete-actions-v3">
            <button className="btn-action-complete outline" onClick={handleGoOrders}>
              주문내역 확인하기
            </button>
            <a href="tel:02-487-9775" className="btn-action-complete tel-consult">
              📞 전화 상담 (02-487-9775)
            </a>
            <a 
              href={KAKAO_CHAT_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-action-complete kakao-consult"
              style={{
                backgroundColor: '#FEE500',
                color: '#191919',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600'
              }}
            >
              💬 카카오톡 1:1 상담
            </a>
            <button className="btn-action-complete primary" onClick={handleGoHome}>
              쇼핑 계속하기
            </button>
          </div>

        </div>

      </div>
    </MainLayout>
  );
}
