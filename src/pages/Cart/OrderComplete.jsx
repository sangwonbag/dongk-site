import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { CheckCircle2 } from "lucide-react";
import "./OrderComplete.css";

export default function OrderComplete() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  // 비정상 접근 시 리다이렉트 처리
  useEffect(() => {
    if (!order) {
      console.warn("No order state found on OrderComplete render.");
    }
  }, [order]);

  const handleGoHome = () => navigate("/");
  const handleGoOrders = () => navigate("/orders");

  if (!order) {
    return (
      <MainLayout>
        <div className="order-complete-container empty">
          <div className="error-card">
            <h3>올바르지 않은 접근입니다.</h3>
            <p>존재하지 않는 주문이거나, 만료된 페이지입니다.</p>
            <button className="btn-complete-action primary" onClick={handleGoHome}>
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="order-complete-container">
        <div className="complete-card">
          <div className="success-icon-wrapper">
            <CheckCircle2 size={64} className="success-icon" />
          </div>
          
          <h2 className="complete-title">주문이 정상적으로 접수되었습니다.</h2>
          <p className="complete-desc">동경바닥재를 이용해 주셔서 대단히 감사합니다. 신속히 확인하여 처리를 도와드리겠습니다.</p>

          <div className="receipt-details">
            <div className="receipt-row">
              <span className="label">주문 번호</span>
              <strong className="value order-no">{order.order_no}</strong>
            </div>
            
            <div className="receipt-row">
              <span className="label">주문자명</span>
              <span className="value">{order.customer_name}</span>
            </div>

            <div className="receipt-row">
              <span className="label">연락처</span>
              <span className="value">{order.phone}</span>
            </div>

            <div className="receipt-row">
              <span className="label">총 주문금액</span>
              <strong className="value price">{order.total_amount?.toLocaleString()}원</strong>
            </div>

            <div className="receipt-row">
              <span className="label">주문 상태</span>
              <span className="status-badge">{order.status || "접수"}</span>
            </div>
          </div>

          <div className="bank-transfer-info">
            <h4>무통장 입금 계좌 안내</h4>
            <p>우리은행 1005-401-447012 (예금주: 주식회사 동경바닥재)</p>
            <span className="bank-notice">* 입금자명은 주문자명 혹은 업체명과 동일하게 입금해 주시기 바랍니다.</span>
          </div>

          <div className="complete-actions">
            <button className="btn-complete-action secondary" onClick={handleGoOrders}>
              주문내역 확인하기
            </button>
            <button className="btn-complete-action primary" onClick={handleGoHome}>
              쇼핑 계속하기
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
