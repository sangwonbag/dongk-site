import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { 
  getAdminOrders, 
  updateOrderStatus, 
  updatePaymentStatus 
} from "../../../services/orderService";
import { ChevronDown, ChevronUp, RefreshCw, AlertTriangle, Search, Filter } from "lucide-react";
import "./AdminOrders.css";

export default function AdminOrders() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // 'orderId' that is updating
  const [errorMsg, setErrorMsg] = useState("");
  
  // 아코디언 토글 상태
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  // 필터 및 검색 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [paymentFilter, setPaymentFilter] = useState("전체");

  // 주문 상태 옵션
  const orderStatusOptions = [
    "접수완료", "확인", "준비중", "배송중", "시공중/시공완료", "완료", "취소"
  ];

  // 결제 상태 옵션
  const paymentStatusOptions = [
    "미입금", "입금완료", "부분입금", "환불"
  ];

  // 권한 검사 및 초기 데이터 패치
  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== "admin") {
      setIsAdminUser(false);
      setLoading(false);
      return;
    }
    setIsAdminUser(true);
    fetchAdminOrders();
  }, [user, authLoading]);

  // 검색/필터 필터링 로직
  useEffect(() => {
    let result = [...orders];

    // 1. 주문 상태 필터
    if (statusFilter !== "전체") {
      result = result.filter(o => o.status === statusFilter);
    }

    // 2. 결제 상태 필터
    if (paymentFilter !== "전체") {
      result = result.filter(o => o.payment_status === paymentFilter);
    }

    // 3. 검색어 필터 (주문자명, 업체명, 주문번호, 연락처)
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(o => 
        o.customer_name?.toLowerCase().includes(term) ||
        o.company_name?.toLowerCase().includes(term) ||
        o.order_no?.toLowerCase().includes(term) ||
        o.phone?.includes(term)
      );
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  // 주문 패치 함수
  const fetchAdminOrders = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await getAdminOrders();
      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (err) {
      console.error("[AdminOrders Fetch Error]", err);
      setErrorMsg(err.message || "주문 목록을 가져오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 주문 상태 업데이트 핸들러
  const handleOrderStatusChange = async (orderId, newStatus) => {
    setActionLoading(orderId);
    setErrorMsg("");
    try {
      await updateOrderStatus(orderId, newStatus);
      // 로컬 상태 즉시 갱신
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error(err);
      setErrorMsg(`[상태변경 실패] ${err.message || "서버 오류가 발생했습니다."}`);
      alert(`상태 변경에 실패했습니다: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // 결제 상태 업데이트 핸들러
  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    setActionLoading(orderId);
    setErrorMsg("");
    try {
      await updatePaymentStatus(orderId, newPaymentStatus);
      // 로컬 상태 즉시 갱신
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newPaymentStatus } : o));
    } catch (err) {
      console.error(err);
      setErrorMsg(`[결제변경 실패] ${err.message || "서버 오류가 발생했습니다."}`);
      alert(`결제 상태 변경에 실패했습니다: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // 아코디언 토글
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

  // 날짜 포맷
  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 권한 정보 확인 중 로딩 화면
  if (authLoading) {
    return (
      <MainLayout>
        <div className="admin-orders-loading">
          <p>권한 정보를 확인하는 중입니다...</p>
        </div>
      </MainLayout>
    );
  }

  // 비권한자 차단 화면
  if (!loading && !isAdminUser) {
    return (
      <MainLayout>
        <div className="admin-unauthorized">
          <div className="unauth-card">
            <AlertTriangle size={48} className="warn-icon" />
            <h2>접근 권한이 없습니다.</h2>
            <p>관리자 계정으로 로그인 후 이용해 주시기 바랍니다.</p>
            <button onClick={() => navigate("/")} className="btn-unauth-home">
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="admin-orders-container">
        <div className="admin-orders-header">
          <div>
            <h1>관리자 주문관리</h1>
            <p>접수된 모든 주문의 현황 파악 및 상태(주문/결제) 변경 제어가 가능합니다.</p>
          </div>
          <button className="btn-refresh" onClick={fetchAdminOrders} disabled={loading}>
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            새로고침
          </button>
        </div>

        {errorMsg && <div className="admin-error-banner">{errorMsg}</div>}

        {/* 필터 및 검색 컨트롤 */}
        <div className="admin-filters-card">
          <div className="filter-search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="주문자명, 업체명, 주문번호, 연락처 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-selects">
            <div className="filter-select-group">
              <Filter size={14} className="filter-icon" />
              <span>주문상태:</span>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="전체">전체</option>
                {orderStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="filter-select-group">
              <Filter size={14} className="filter-icon" />
              <span>결제상태:</span>
              <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                <option value="전체">전체</option>
                {paymentStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 리스트 출력 */}
        {loading ? (
          <div className="admin-orders-loading">데이터를 로드하는 중입니다...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-orders-empty">
            <p>조건에 부합하는 주문 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="admin-orders-list">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrders.has(order.id);
              const isUpdating = actionLoading === order.id;

              return (
                <div key={order.id} className={`admin-order-card ${isExpanded ? "open" : ""}`}>
                  {/* 카드 요약 정보 */}
                  <div className="admin-card-header" onClick={() => toggleExpand(order.id)}>
                    <div className="admin-header-main">
                      <div className="order-no-badge">
                        <span>{order.order_no}</span>
                      </div>
                      <div className="header-meta-list">
                        <span className="order-date">{formatDate(order.created_at)}</span>
                        <span className="customer-info">
                          <strong>{order.customer_name}</strong>
                          {order.company_name && <span className="company-txt">({order.company_name})</span>}
                        </span>
                        <span className="phone-txt">{order.phone}</span>
                      </div>
                    </div>

                    <div className="admin-header-controls" onClick={(e) => e.stopPropagation()}>
                      {/* 주문상태 변경 드롭다운 */}
                      <div className="control-dropdown">
                        <label>주문상태</label>
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                          disabled={isUpdating}
                          className={`status-select select-${order.status}`}
                        >
                          {orderStatusOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      {/* 결제상태 변경 드롭다운 */}
                      <div className="control-dropdown">
                        <label>결제상태</label>
                        <select
                          value={order.payment_status}
                          onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                          disabled={isUpdating}
                          className={`payment-select select-${order.payment_status}`}
                        >
                          {paymentStatusOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div className="header-amount-text">
                        {order.total_amount?.toLocaleString()}원
                      </div>

                      <button className="btn-toggle-expand" onClick={() => toggleExpand(order.id)}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* 카드 상세 (아코디언) */}
                  {isExpanded && (
                    <div className="admin-card-body">
                      <div className="body-grid">
                        {/* 상세 정보 */}
                        <div className="body-section-shipping">
                          <h5>고객 배송/요청 정보</h5>
                          <div className="shipping-info-box">
                            <div className="shipping-row">
                              <span className="label">주소</span>
                              <span className="val">{order.address} {order.address_detail || ""}</span>
                            </div>
                            {order.delivery_request_date && (
                              <div className="shipping-row">
                                <span className="label">희망 배송/시공일</span>
                                <span className="val">{order.delivery_request_date}</span>
                              </div>
                            )}
                            <div className="shipping-row">
                              <span className="label">결제 방식</span>
                              <span className="val">{order.payment_method}</span>
                            </div>
                            {order.memo && (
                              <div className="shipping-row full">
                                <span className="label">요청 사항</span>
                                <span className="val memo-text">{order.memo}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 상세 아이템 목록 */}
                        <div className="body-section-items">
                          <h5>주문 자재 내역 ({order.order_items?.length || 0}건)</h5>
                          <div className="admin-items-table">
                            <div className="table-header">
                              <span>카테고리/브랜드/상품명/코드</span>
                              <span className="text-right">수량</span>
                              <span className="text-right">단가</span>
                              <span className="text-right">금액</span>
                            </div>
                            <div className="table-rows">
                              {order.order_items?.map(item => {
                                const hasPrice = item.unit_price > 0;
                                return (
                                  <div key={item.id} className="table-row">
                                    <div className="item-meta">
                                      <span className="cat-brand">[{item.category || "미지정"} | {item.brand || "미지정"}]</span>
                                      <span className="name">{item.product_name}</span>
                                      <span className="code-spec">코드: {item.product_code || "-"} / 규격: {item.spec || "-"}</span>
                                    </div>
                                    <div className="qty text-right">{item.quantity}{item.unit || "평"}</div>
                                    <div className="price text-right">{hasPrice ? `${item.unit_price?.toLocaleString()}원` : "상담 필요"}</div>
                                    <div className="total text-right">{hasPrice ? `${(item.unit_price * item.quantity).toLocaleString()}원` : "-"}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
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
