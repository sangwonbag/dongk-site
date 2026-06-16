import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { 
  getAdminOrders, 
  updateOrderAdminFields 
} from "../../../services/orderService";
import { 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  AlertTriangle, 
  Search, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Clipboard, 
  Package,
  Layers,
  CheckCircle2,
  Hourglass,
  BadgeAlert,
  CalendarCheck
} from "lucide-react";
import "./AdminOrders.css";

// 헬퍼 함수: memo에서 희망배송일 추출
const extractDeliveryDate = (memo) => {
  if (!memo) return { cleanMemo: "", deliveryDate: "" };
  const match = memo.match(/\[희망배송일:\s*([^\]]+)\]/);
  if (match) {
    const deliveryDate = match[1];
    const cleanMemo = memo.replace(/\[희망배송일:\s*[^\]]+\]/, "").trim();
    return { cleanMemo, deliveryDate };
  }
  return { cleanMemo: memo, deliveryDate: "" };
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("전체");

  // 초기 권한 확인 및 데이터 로드
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

  // 주문 데이터 패치
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

  // 실시간 다변수 필터링 및 검색 로직
  useEffect(() => {
    let result = [...orders];

    // 1. 주문/결제 상태 필터링
    if (activeFilter !== "전체") {
      if (activeFilter === "확인중/준비중") {
        result = result.filter(o => o.status === "확인중" || o.status === "준비중");
      } else if (["미입금", "입금완료", "환불"].includes(activeFilter)) {
        result = result.filter(o => o.payment_status === activeFilter);
      } else {
        result = result.filter(o => o.status === activeFilter);
      }
    }

    // 2. 통합 검색 필터링 (주문번호, 고객명, 연락처, 주소, 상품명, 상품코드)
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(o => {
        const matchHeader = 
          o.customer_name?.toLowerCase().includes(term) ||
          o.company_name?.toLowerCase().includes(term) ||
          o.order_no?.toLowerCase().includes(term) ||
          o.phone?.includes(term) ||
          o.address?.toLowerCase().includes(term) ||
          o.address_detail?.toLowerCase().includes(term);

        const matchItems = o.order_items?.some(item => 
          item.product_name?.toLowerCase().includes(term) ||
          item.product_code?.toLowerCase().includes(term)
        );

        return matchHeader || matchItems;
      });
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, activeFilter]);

  // 카드별 데이터 저장 성공 시 로컬 상태 업데이트 콜백
  const handleOrderSaveSuccess = (updatedOrder) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  // 요약 통계 정보 연산
  const totalCount = orders.length;
  const submittedCount = orders.filter(o => o.status === "접수완료").length;
  const processingCount = orders.filter(o => o.status === "확인중" || o.status === "준비중").length;
  const completedCount = orders.filter(o => o.status === "완료").length;
  const unpaidCount = orders.filter(o => o.payment_status === "미입금").length;
  
  const todayCount = orders.filter(o => {
    if (!o.created_at) return false;
    const orderDate = new Date(o.created_at).toDateString();
    const todayDate = new Date().toDateString();
    return orderDate === todayDate;
  }).length;

  if (authLoading) {
    return (
      <MainLayout>
        <div className="admin-orders-loading-screen">
          <div className="spinner-loader"></div>
          <p>권한 정보를 확인하는 중입니다...</p>
        </div>
      </MainLayout>
    );
  }

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
        {/* 상단 타이틀 영역 */}
        <div className="admin-orders-header">
          <div>
            <h1>관리자 주문관리</h1>
            <p>접수된 모든 주문의 상세 현황 파악 및 통합 저장 처리가 가능합니다.</p>
          </div>
          <button className="btn-refresh-dashboard" onClick={fetchAdminOrders} disabled={loading}>
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            새로고침
          </button>
        </div>

        {errorMsg && <div className="admin-error-banner">{errorMsg}</div>}

        {/* 1. 요약 통계 대시보드 */}
        <div className="admin-summary-cards">
          <div className="summary-card" onClick={() => setActiveFilter("전체")}>
            <div className="card-icon bg-total"><Layers size={20} /></div>
            <div className="card-info">
              <span className="card-label">전체 주문</span>
              <strong className="card-value">{totalCount}건</strong>
            </div>
          </div>
          <div className="summary-card" onClick={() => setActiveFilter("접수완료")}>
            <div className="card-icon bg-submitted"><Hourglass size={20} /></div>
            <div className="card-info">
              <span className="card-label">접수완료</span>
              <strong className="card-value text-submitted">{submittedCount}건</strong>
            </div>
          </div>
          <div className="summary-card" onClick={() => setActiveFilter("확인중/준비중")}>
            <div className="card-icon bg-processing"><CalendarCheck size={20} /></div>
            <div className="card-info">
              <span className="card-label">확인/준비중</span>
              <strong className="card-value text-processing">{processingCount}건</strong>
            </div>
          </div>
          <div className="summary-card" onClick={() => setActiveFilter("완료")}>
            <div className="card-icon bg-completed"><CheckCircle2 size={20} /></div>
            <div className="card-info">
              <span className="card-label">완료 주문</span>
              <strong className="card-value text-completed">{completedCount}건</strong>
            </div>
          </div>
          <div className="summary-card" onClick={() => setActiveFilter("미입금")}>
            <div className="card-icon bg-unpaid"><BadgeAlert size={20} /></div>
            <div className="card-info">
              <span className="card-label">미입금 주문</span>
              <strong className="card-value text-unpaid">{unpaidCount}건</strong>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon bg-today"><Calendar size={20} /></div>
            <div className="card-info">
              <span className="card-label">오늘 신규</span>
              <strong className="card-value text-today">{todayCount}건</strong>
            </div>
          </div>
        </div>

        {/* 2. 필터 버튼 탭 및 검색창 */}
        <div className="admin-search-filter-section">
          <div className="filter-tabs-wrapper">
            {[
              "전체", 
              "접수완료", 
              "확인중", 
              "준비중", 
              "출고/배송중", 
              "완료", 
              "취소", 
              "미입금", 
              "입금완료"
            ].map(tab => (
              <button 
                key={tab} 
                className={`filter-tab-btn ${activeFilter === tab ? "active" : ""}`}
                onClick={() => setActiveFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="admin-search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="주문번호, 고객명, 연락처, 주소, 상품명, 상품코드 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 3. 주문 카드 리스트 */}
        {loading ? (
          <div className="admin-orders-loading-view">
            <div className="spinner-loader"></div>
            <p>주문 데이터를 불러오고 있습니다...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-orders-empty-card">
            <Clipboard size={44} />
            <h3>조회 대상 주문 건이 없습니다.</h3>
            <p>필터 조건을 해제하거나 검색어를 변경해 보시기 바랍니다.</p>
          </div>
        ) : (
          <div className="admin-orders-list">
            {filteredOrders.map(order => (
              <AdminOrderCard 
                key={order.id} 
                order={order} 
                onSave={async (id, fields) => {
                  const updated = await updateOrderAdminFields(id, fields);
                  handleOrderSaveSuccess(updated);
                }} 
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

/* ==========================================================
   자식 컴포넌트: AdminOrderCard
   각 카드별로 로컬 폼 상태 및 저장 동작을 격리하여 성능을 향상시킵니다.
   ========================================================== */
function AdminOrderCard({ order, onSave }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
  const [adminMemo, setAdminMemo] = useState(order.admin_memo || "");
  const [isSaving, setIsSaving] = useState(false);

  // 외부 props 변경 시 동기화
  useEffect(() => {
    setStatus(order.status);
    setPaymentStatus(order.payment_status);
    setAdminMemo(order.admin_memo || "");
  }, [order]);

  const { cleanMemo, deliveryDate } = extractDeliveryDate(order.memo);
  const displayDeliveryDate = order.delivery_request_date || deliveryDate;

  const handleSave = async (e) => {
    e.stopPropagation();
    setIsSaving(true);
    try {
      await onSave(order.id, { status, paymentStatus, adminMemo });
      alert("주문 정보가 성공적으로 저장되었습니다.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getStatusBadgeClass = (statusVal) => {
    switch(statusVal) {
      case "접수완료": return "badge-submitted";
      case "확인중": return "badge-confirmed";
      case "준비중": return "badge-preparing";
      case "출고/배송중": return "badge-shipped";
      case "완료": return "badge-completed";
      case "취소": return "badge-cancelled";
      default: return "";
    }
  };

  const getPaymentBadgeClass = (payVal) => {
    switch(payVal) {
      case "미입금": return "badge-unpaid";
      case "입금완료": return "badge-paid";
      case "환불": return "badge-refunded";
      default: return "";
    }
  };

  return (
    <div className={`admin-order-card-v2 ${isExpanded ? "expanded" : ""}`}>
      {/* 카드 상단 요약 영역 (토글용 클릭 핸들러 장착) */}
      <div className="card-summary-row" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="summary-left-group">
          <span className="order-no">{order.order_no}</span>
          <span className="order-date">{formatDate(order.created_at)}</span>
          <div className="badges-group">
            <span className={`badge-status ${getStatusBadgeClass(order.status)}`}>
              {order.status}
            </span>
            <span className={`badge-payment ${getPaymentBadgeClass(order.payment_status)}`}>
              {order.payment_status}
            </span>
          </div>
        </div>

        <div className="summary-right-group">
          <strong className="total-price">{order.total_amount?.toLocaleString()}원</strong>
          <button className="btn-toggle-arrow">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* 카드 상세 아코디언 바디 */}
      {isExpanded && (
        <div className="card-detailed-body">
          <div className="detailed-info-sections">
            
            {/* 1. 수령자 배송정보 및 일정 */}
            <div className="info-block-customer">
              <h4>수령인 및 배송 정보</h4>
              <div className="customer-info-grid">
                <div className="info-item">
                  <User size={14} className="icon" />
                  <span className="label">주문자/업체</span>
                  <span className="value">{order.customer_name} {order.company_name ? `(${order.company_name})` : ""}</span>
                </div>
                <div className="info-item">
                  <Phone size={14} className="icon" />
                  <span className="label">연락처</span>
                  <span className="value">{order.phone}</span>
                </div>
                <div className="info-item full">
                  <MapPin size={14} className="icon" />
                  <span className="label">배송주소</span>
                  <span className="value">{order.address} {order.address_detail || ""}</span>
                </div>
                <div className="info-item">
                  <Calendar size={14} className="icon" />
                  <span className="label">결제 방식</span>
                  <span className="value">{order.payment_method}</span>
                </div>
                {displayDeliveryDate && (
                  <div className="info-item highlight-delivery">
                    <CalendarCheck size={14} className="icon" />
                    <span className="label">희망 배송일</span>
                    <span className="value font-bold">{displayDeliveryDate}</span>
                  </div>
                )}
                {cleanMemo && (
                  <div className="info-item full memo-item">
                    <Clipboard size={14} className="icon" />
                    <span className="label">요청사항</span>
                    <span className="value">{cleanMemo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. 주문 자재 품목 상세 */}
            <div className="info-block-items">
              <h4>주문 품목 내역 ({order.order_items?.length || 0}개)</h4>
              <div className="admin-items-card-list">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="admin-item-card-row">
                    <div className="item-img-box">
                      <img 
                        src={item.image_url || "/images/deco_tile.png"} 
                        alt={item.product_name} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/deco_tile.png";
                        }}
                      />
                    </div>
                    <div className="item-meta-box">
                      <div className="item-header-meta">
                        <span className="item-brand-badge">[{item.brand || "자재"}]</span>
                        <strong className="item-product-name">{item.product_name}</strong>
                      </div>
                      <div className="item-specs-sub">
                        <span>코드: {item.product_code || "-"}</span>
                        <span>규격: {item.spec || "-"}</span>
                      </div>
                      <div className="item-price-calc">
                        <span className="calc-unit">{item.unit_price?.toLocaleString()}원 × {item.quantity}{item.unit || "평"}</span>
                        <strong className="calc-total">
                          {((item.unit_price || 0) * (item.quantity || 0)).toLocaleString()}원
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. 관리자 처리 및 메모 입력란 */}
            <div className="info-block-admin-control">
              <h4>관리자 주문 제어</h4>
              <div className="admin-control-box">
                <div className="control-selectors-grid">
                  <div className="select-field">
                    <label>주문 진행 상태</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={isSaving}
                      className={`control-select status-${status}`}
                    >
                      <option value="접수완료">접수완료</option>
                      <option value="확인중">확인중</option>
                      <option value="준비중">준비중</option>
                      <option value="출고/배송중">출고/배송중</option>
                      <option value="완료">완료</option>
                      <option value="취소">취소</option>
                    </select>
                  </div>

                  <div className="select-field">
                    <label>결제 수급 상태</label>
                    <select 
                      value={paymentStatus} 
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      disabled={isSaving}
                      className={`control-select payment-${paymentStatus}`}
                    >
                      <option value="미입금">미입금</option>
                      <option value="입금완료">입금완료</option>
                      <option value="환불">환불</option>
                    </select>
                  </div>
                </div>

                <div className="admin-memo-field">
                  <label>관리자 업무 메모 (고객 미노출)</label>
                  <textarea 
                    value={adminMemo}
                    onChange={(e) => setAdminMemo(e.target.value)}
                    placeholder="입금 확인 시간, 출고 예정 정보, 시공 일정 등 업무용 메모를 남겨주세요."
                    disabled={isSaving}
                    rows={3}
                  />
                </div>

                <button 
                  className="btn-admin-order-save" 
                  onClick={handleSave} 
                  disabled={isSaving}
                >
                  {isSaving ? "상태 저장 중..." : "설정 완료 저장하기"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
