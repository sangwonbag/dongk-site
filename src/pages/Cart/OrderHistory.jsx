import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { getCurrentUser } from "../../lib/auth";
import { getMyOrders } from "../../services/orderService";
import { ChevronDown, ChevronUp, Package, Calendar, CreditCard, ClipboardList } from "lucide-react";
import "./OrderHistory.css";

export default function OrderHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  // 아코디언 토글 상태 (열려있는 주문 ID의 Set)
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  // 로그인 상태 및 해시 변경 시 처리
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login?redirect=" + encodeURIComponent(location.pathname + location.hash));
      return;
    }
    setUser(currentUser);
    fetchOrders();
  }, [location.pathname, location.hash, navigate]);

  // 주문 목록 가져오기
  const fetchOrders = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await getMyOrders();
      setOrders(data || []);
    } catch (err) {
      console.error("[OrderHistory fetch error]", err);
      setErrorMsg(err.message || "주문 내역을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 아코디언 토글 토글러
  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  // 날짜 포맷팅
  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 상품명 요약 생성 (예: "자재A 외 2건")
  const getProductSummary = (order) => {
    if (!order.order_items || order.order_items.length === 0) return "상품 정보 없음";
    const firstItem = order.order_items[0];
    const firstTitle = `[${firstItem.brand || "브랜드"}] ${firstItem.product_name}`;
    if (order.order_items.length === 1) return firstTitle;
    return `${firstTitle} 외 ${order.order_items.length - 1}건`;
  };

  return (
    <MainLayout>
      <div className="orders-page-container">
        <div className="orders-header">
          <h1>주문 내역</h1>
          <p>고객님께서 동경바닥재에 접수하신 실제 주문 내역을 확인하실 수 있습니다.</p>
        </div>

        {loading ? (
          <div className="orders-loading">주문 내역을 불러오고 있습니다...</div>
        ) : errorMsg ? (
          <div className="orders-error-card">
            <p>{errorMsg}</p>
            <button className="btn-retry" onClick={fetchOrders}>다시 시도</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty-state">
            <ClipboardList size={48} className="empty-icon" />
            <p>접수된 주문 내역이 없습니다.</p>
            <button onClick={() => navigate("/materials")} className="btn-shop-link">
              자재 보러가기
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const isExpanded = expandedOrders.has(order.id);
              return (
                <div key={order.id} className="order-card-wrapper">
                  {/* 주문 카드 메인 헤더 */}
                  <div 
                    className={`order-card-header ${isExpanded ? "open" : ""}`}
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="order-header-primary">
                      <span className="order-date-text">
                        <Calendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        {formatDate(order.created_at)}
                      </span>
                      <span className="order-no-text">주문번호: {order.order_no}</span>
                    </div>

                    <div className="order-header-secondary">
                      <div className="order-title-summary">
                        <Package size={16} className="summary-icon" />
                        <strong>{getProductSummary(order)}</strong>
                      </div>
                      
                      <div className="order-meta-info">
                        <span className="order-total-amount">
                          {order.total_amount?.toLocaleString()}원
                        </span>
                        
                        <div className="badges-wrapper">
                          <span className={`order-status-badge status-${order.status}`}>
                            주문: {order.status}
                          </span>
                          <span className={`order-status-badge payment-${order.payment_status}`}>
                            결제: {order.payment_status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-toggle-arrow">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {/* 주문 상세 내용 (아코디언) */}
                  {isExpanded && (
                    <div className="order-card-details">
                      {/* 1. 수령인 배송정보 */}
                      <div className="details-section-info">
                        <h4>배송 및 주문 정보</h4>
                        <div className="info-grid">
                          <div className="info-row">
                            <span className="label">주문자 / 업체명</span>
                            <span className="val">{order.customer_name} {order.company_name ? `/ ${order.company_name}` : ""}</span>
                          </div>
                          <div className="info-row">
                            <span className="label">연락처</span>
                            <span className="val">{order.phone}</span>
                          </div>
                          <div className="info-row">
                            <span className="label">배송/시공 주소</span>
                            <span className="val">{order.address} {order.address_detail || ""}</span>
                          </div>
                          {order.delivery_request_date && (
                            <div className="info-row">
                              <span className="label">희망 배송/시공일</span>
                              <span className="val">{order.delivery_request_date}</span>
                            </div>
                          )}
                          <div className="info-row">
                            <span className="label">결제 방식</span>
                            <span className="val">
                              <CreditCard size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                              {order.payment_method}
                            </span>
                          </div>
                          {order.memo && (
                            <div className="info-row full-width">
                              <span className="label">요청사항</span>
                              <span className="val memo-val">{order.memo}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. 상세 품목 목록 */}
                      <div className="details-section-items">
                        <h4>주문 상품 상세</h4>
                        <div className="items-table-header">
                          <span>상품명/상세</span>
                          <span className="text-right">수량</span>
                          <span className="text-right">단가</span>
                          <span className="text-right">금액</span>
                        </div>

                        <div className="items-table-body">
                          {order.order_items?.map((item) => {
                            const hasPrice = item.unit_price > 0;
                            return (
                              <div key={item.id} className="items-table-row">
                                <div className="item-name-cell">
                                  {item.image_url && (
                                    <img 
                                      src={item.image_url} 
                                      alt={item.product_name} 
                                      className="item-thumbnail" 
                                      onError={(e) => e.target.style.display = 'none'}
                                    />
                                  )}
                                  <div className="item-txt-info">
                                    <strong className="brand-label">[{item.brand}]</strong>
                                    <span className="product-name">{item.product_name}</span>
                                    <div className="item-sub-specs">
                                      {item.product_code && <span>코드: {item.product_code}</span>}
                                      {item.spec && <span>규격: {item.spec}</span>}
                                    </div>
                                  </div>
                                </div>
                                <div className="item-qty-cell text-right">
                                  {item.quantity}{item.unit || "평"}
                                </div>
                                <div className="item-price-cell text-right">
                                  {hasPrice ? `${item.unit_price?.toLocaleString()}원` : "상담 필요"}
                                </div>
                                <div className="item-total-cell text-right">
                                  {hasPrice ? `${(item.unit_price * item.quantity).toLocaleString()}원` : "-"}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="details-total-summary">
                          <span>최종 합계 금액</span>
                          <strong>{order.total_amount?.toLocaleString()}원</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
