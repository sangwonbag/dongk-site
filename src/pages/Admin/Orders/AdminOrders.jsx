import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { 
  getAdminOrders, 
  updateOrderAdminFields,
  updateOrderChecked
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
  CalendarCheck,
  Copy,
  Check,
  Clock
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

// 헬퍼 함수: 미확인 여부 확인 (status가 "접수완료"이면서 admin_checked가 true가 아닌 경우)
const isUnchecked = (o) => {
  if (o.admin_checked === true) return false;
  if (o.status !== "접수완료") return false;
  return true;
};

// 헬퍼 함수: 주문 우선순위 정렬
const sortOrders = (ordersList) => {
  const todayStr = new Date().toDateString();
  return [...ordersList].sort((a, b) => {
    // 1. 미확인 신규 주문 우선
    const aIsNewUnchecked = isUnchecked(a);
    const bIsNewUnchecked = isUnchecked(b);
    if (aIsNewUnchecked && !bIsNewUnchecked) return -1;
    if (!aIsNewUnchecked && bIsNewUnchecked) return 1;

    // 2. 오늘 주문 우선
    const aIsToday = a.created_at && new Date(a.created_at).toDateString() === todayStr;
    const bIsToday = b.created_at && new Date(b.created_at).toDateString() === todayStr;
    if (aIsToday && !bIsToday) return -1;
    if (!aIsToday && bIsToday) return 1;

    // 3. 미입금 주문 우선
    const aIsUnpaid = a.payment_status === "미입금";
    const bIsUnpaid = b.payment_status === "미입금";
    if (aIsUnpaid && !bIsUnpaid) return -1;
    if (!aIsUnpaid && bIsUnpaid) return 1;

    // 4. 최근 주문순 (created_at desc)
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });
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
      if (activeFilter === "신규 주문" || activeFilter === "접수완료") {
        result = result.filter(o => o.status === "접수완료");
      } else if (activeFilter === "미확인 주문") {
        result = result.filter(o => isUnchecked(o));
      } else if (activeFilter === "오늘 주문") {
        const todayStr = new Date().toDateString();
        result = result.filter(o => o.created_at && new Date(o.created_at).toDateString() === todayStr);
      } else if (activeFilter === "미입금") {
        result = result.filter(o => o.payment_status === "미입금");
      } else if (activeFilter === "처리중 주문") {
        result = result.filter(o => o.status === "확인중" || o.status === "준비중" || o.status === "출고/배송중");
      } else if (activeFilter === "완료 주문" || activeFilter === "완료") {
        result = result.filter(o => o.status === "완료");
      } else if (["입금완료", "환불"].includes(activeFilter)) {
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

    // 3. 우선순위 정렬 적용
    result = sortOrders(result);

    setFilteredOrders(result);
  }, [orders, searchTerm, activeFilter]);

  // 카드별 데이터 저장 성공 시 로컬 상태 업데이트 콜백
  const handleOrderSaveSuccess = (updatedOrder) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  // 요약 통계 정보 연산
  const totalCount = orders.length;
  const newCount = orders.filter(o => o.status === "접수완료").length;
  const uncheckedCount = orders.filter(isUnchecked).length;
  const unpaidCount = orders.filter(o => o.payment_status === "미입금").length;
  const processingCount = orders.filter(o => o.status === "확인중" || o.status === "준비중" || o.status === "출고/배송중").length;
  const completedCount = orders.filter(o => o.status === "완료").length;
  
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
            <h1>주문 접수함</h1>
            <p>고객이 접수한 주문을 신속하게 확인하고 결제 및 처리 상태를 제어합니다.</p>
          </div>
          <button className="btn-refresh-dashboard" onClick={fetchAdminOrders} disabled={loading}>
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            새로고침
          </button>
        </div>

        {errorMsg && <div className="admin-error-banner">{errorMsg}</div>}

        {/* 1. 요약 통계 대시보드 */}
        <div className="admin-summary-cards">
          <div className={`summary-card ${activeFilter === "신규 주문" ? "active" : ""}`} onClick={() => setActiveFilter("신규 주문")}>
            <div className="card-icon bg-total"><Layers size={20} /></div>
            <div className="card-info">
              <span className="card-label">신규 주문</span>
              <strong className="card-value">{newCount}건</strong>
            </div>
          </div>
          <div className={`summary-card ${activeFilter === "미확인 주문" ? "active" : ""}`} onClick={() => setActiveFilter("미확인 주문")}>
            <div className="card-icon bg-submitted"><BadgeAlert size={20} /></div>
            <div className="card-info">
              <span className="card-label">미확인 주문</span>
              <strong className="card-value text-submitted">{uncheckedCount}건</strong>
            </div>
          </div>
          <div className={`summary-card ${activeFilter === "오늘 주문" ? "active" : ""}`} onClick={() => setActiveFilter("오늘 주문")}>
            <div className="card-icon bg-today"><Calendar size={20} /></div>
            <div className="card-info">
              <span className="card-label">오늘 주문</span>
              <strong className="card-value text-today">{todayCount}건</strong>
            </div>
          </div>
          <div className={`summary-card ${activeFilter === "미입금" ? "active" : ""}`} onClick={() => setActiveFilter("미입금")}>
            <div className="card-icon bg-unpaid"><Hourglass size={20} /></div>
            <div className="card-info">
              <span className="card-label">미입금 주문</span>
              <strong className="card-value text-unpaid">{unpaidCount}건</strong>
            </div>
          </div>
          <div className={`summary-card ${activeFilter === "처리중 주문" ? "active" : ""}`} onClick={() => setActiveFilter("처리중 주문")}>
            <div className="card-icon bg-processing"><CalendarCheck size={20} /></div>
            <div className="card-info">
              <span className="card-label">처리중 주문</span>
              <strong className="card-value text-processing">{processingCount}건</strong>
            </div>
          </div>
          <div className={`summary-card ${activeFilter === "완료 주문" ? "active" : ""}`} onClick={() => setActiveFilter("완료 주문")}>
            <div className="card-icon bg-completed"><CheckCircle2 size={20} /></div>
            <div className="card-info">
              <span className="card-label">완료 주문</span>
              <strong className="card-value text-completed">{completedCount}건</strong>
            </div>
          </div>
        </div>

        {/* 2. 필터 버튼 탭 및 검색창 */}
        <div className="admin-search-filter-section">
          <div className="filter-tabs-wrapper">
            {[
              "전체", 
              "신규 주문",
              "미확인 주문",
              "오늘 주문",
              "처리중 주문",
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

        {/* 3. 주문 카드 리스트 (스켈레톤 및 빈 화면 처리 포함) */}
        {loading ? (
          <div className="admin-orders-skeleton-list">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-row skeleton-header"></div>
                <div className="skeleton-row skeleton-body"></div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-orders-empty-card">
            <Clipboard size={44} />
            <h3>접수된 주문이 없습니다.</h3>
            <p>필터 조건을 해제하거나 검색어를 변경해 보시기 바랍니다.</p>
          </div>
        ) : (
          <div className="admin-orders-list">
            {filteredOrders.map(order => (
              <AdminOrderCard 
                key={order.id} 
                order={order} 
                currentUser={user}
                onSaveSuccess={handleOrderSaveSuccess}
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
   각 카드별로 로컬 상태 및 개별 복사/저장 액션 관리
   ========================================================== */
function AdminOrderCard({ order, currentUser, onSaveSuccess }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
  const [adminMemo, setAdminMemo] = useState(order.admin_memo || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [cardError, setCardError] = useState("");
  const [cardSuccess, setCardSuccess] = useState("");

  // 외부 props 변경 시 동기화
  useEffect(() => {
    setStatus(order.status);
    setPaymentStatus(order.payment_status);
    setAdminMemo(order.admin_memo || "");
  }, [order]);

  const { cleanMemo, deliveryDate } = extractDeliveryDate(order.memo);
  const displayDeliveryDate = order.delivery_request_date || deliveryDate;

  // 상품 요약 텍스트 연산
  const itemsCount = order.order_items?.length || 0;
  const firstItemName = order.order_items?.[0]?.product_name || "자재";
  const itemsSummaryText = itemsCount > 1 
    ? `${firstItemName} 외 ${itemsCount - 1}건` 
    : firstItemName;

  // 확인 처리 핸들러
  const handleCheck = async (e) => {
    e.stopPropagation();
    setIsChecking(true);
    setCardError("");
    setCardSuccess("");
    try {
      const updated = await updateOrderChecked(order.id, currentUser?.name || currentUser?.email || "admin");
      onSaveSuccess(updated);
      setCardSuccess("주문 확인 처리가 완료되었습니다.");
      setTimeout(() => setCardSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setCardError(err.message || "확인 처리에 실패했습니다.");
    } finally {
      setIsChecking(false);
    }
  };

  // 저장 처리 핸들러
  const handleSave = async (e) => {
    e.stopPropagation();
    setIsSaving(true);
    setCardError("");
    setCardSuccess("");
    try {
      const updated = await updateOrderAdminFields(order.id, { status, paymentStatus, adminMemo });
      onSaveSuccess(updated);
      setCardSuccess("주문 정보가 성공적으로 저장되었습니다.");
      setTimeout(() => setCardSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setCardError(err.message || "저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 텍스트 클립보드 복사 함수
  const handleCopyText = (text, label, e) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(`${label} 복사되었습니다.`);
      setTimeout(() => setCopyFeedback(""), 2000);
    }).catch(err => {
      console.error("Copy failed:", err);
      alert("복사에 실패했습니다.");
    });
  };

  // 주문 요약 클립보드 복사 함수
  const handleCopySummary = (e) => {
    e.stopPropagation();
    const itemsDetailText = (order.order_items || []).map(item => 
      `- ${item.product_name} (${item.quantity}${item.unit || '평'})`
    ).join("\n");

    const summaryText = `[동경바닥재 주문]
주문번호: ${order.order_no}
고객: ${order.customer_name} / ${order.phone}
주소: ${order.address} ${order.address_detail || ""}
상품: ${itemsSummaryText}
${itemsDetailText}
금액: ${order.total_amount?.toLocaleString() || 0}원
요청사항: ${cleanMemo || "없음"}`;

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopyFeedback("주문 요약이 복사되었습니다.");
      setTimeout(() => setCopyFeedback(""), 2000);
    }).catch(err => {
      console.error("Copy failed:", err);
      alert("복사에 실패했습니다.");
    });
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
    <div className={`admin-order-card-v2 ${isExpanded ? "expanded" : ""} ${isUnchecked(order) ? "unchecked-highlight" : ""}`}>
      {/* 카드 상단 요약 영역 (그리드 최적화) */}
      <div className="card-summary-row" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="summary-grid">
          {/* 메타 정보 */}
          <div className="summary-col-meta">
            <span className="order-no">{order.order_no}</span>
            <span className="order-date">{formatDate(order.created_at)}</span>
            <div className="badges-row">
              {order.status === "접수완료" && <span className="badge-new-order">신규</span>}
              {isUnchecked(order) ? (
                <span className="badge-unchecked-card">미확인</span>
              ) : (
                <span className="badge-checked-card">확인 완료</span>
              )}
              {order.admin_memo && order.admin_memo.trim() !== "" && (
                <span className="badge-has-memo">메모 있음</span>
              )}
            </div>
          </div>

          {/* 고객 정보 */}
          <div className="summary-col-customer">
            <div className="customer-name-wrapper">
              <User size={13} className="icon-sub" />
              <strong>{order.customer_name}</strong>
              {order.company_name && <span className="company-sub">({order.company_name})</span>}
            </div>
            <div className="customer-phone-wrapper">
              <Phone size={13} className="icon-sub" />
              <span>{order.phone}</span>
            </div>
          </div>

          {/* 자재 및 주소 */}
          <div className="summary-col-items-address">
            <div className="items-summary-text">
              <Package size={13} className="icon-sub" />
              <span>{itemsSummaryText}</span>
            </div>
            <div className="address-summary-text">
              <MapPin size={13} className="icon-sub" />
              <span>{order.address}</span>
            </div>
          </div>

          {/* 상태 및 총액 */}
          <div className="summary-col-status-amount">
            <div className="badges-group">
              <span className={`badge-status ${getStatusBadgeClass(order.status)}`}>
                {order.status}
              </span>
              <span className={`badge-payment ${getPaymentBadgeClass(order.payment_status)}`}>
                {order.payment_status}
              </span>
            </div>
            <strong className="total-price">{order.total_amount?.toLocaleString()}원</strong>
          </div>
        </div>

        <button className="btn-toggle-arrow">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* 카드 상세 아코디언 바디 */}
      {isExpanded && (
        <div className="card-detailed-body">
          {/* 간편 복사 툴바 */}
          <div className="quick-action-toolbar">
            <button className="btn-quick-copy" onClick={(e) => handleCopyText(order.order_no, "주문번호가", e)}>
              <Copy size={12} /> 주문번호 복사
            </button>
            <button className="btn-quick-copy" onClick={(e) => handleCopyText(order.phone, "전화번호가", e)}>
              <Copy size={12} /> 연락처 복사
            </button>
            <button className="btn-quick-copy" onClick={(e) => handleCopyText(order.address + " " + (order.address_detail || ""), "주소가", e)}>
              <Copy size={12} /> 배송주소 복사
            </button>
            <button className="btn-quick-copy btn-summary-copy" onClick={handleCopySummary}>
              <Copy size={12} /> 주문 요약 복사
            </button>
            {copyFeedback && <span className="copy-success-toast">{copyFeedback}</span>}
          </div>

          {cardError && <div className="card-inner-error-banner">{cardError}</div>}
          {cardSuccess && <div className="card-inner-success-banner">{cardSuccess}</div>}

          <div className="detailed-info-sections">
            {/* 1. 고객 정보 */}
            <div className="info-block-customer">
              <h4>고객 정보</h4>
              <div className="customer-info-grid">
                <div className="info-item">
                  <User size={14} className="icon" />
                  <span className="label">고객명</span>
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

            {/* 2. 상품 정보 */}
            <div className="info-block-items">
              <h4>상품 정보 ({itemsCount}개)</h4>
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

            {/* 3. 결제 및 관리자 처리 영역 */}
            <div className="info-block-admin-control">
              <h4>결제 정보</h4>
              <div className="payment-summary-box">
                <div className="payment-row">
                  <span className="pay-label">결제 방식</span>
                  <span className="pay-value">{order.payment_method || "무통장입금"}</span>
                </div>
                <div className="payment-row">
                  <span className="pay-label">결제 상태</span>
                  <span className={`badge-payment ${getPaymentBadgeClass(order.payment_status)}`}>
                    {order.payment_status}
                  </span>
                </div>
                <div className="payment-row total">
                  <span className="pay-label">총 주문금액</span>
                  <span className="pay-value total-price-large">{order.total_amount?.toLocaleString()}원</span>
                </div>
              </div>

              <h4 style={{ marginTop: "20px" }}>관리자 처리 영역</h4>
              <div className="admin-control-box">
                <div className="control-selectors-grid">
                  <div className="select-field">
                    <label>주문 상태</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={isSaving || isChecking}
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
                    <label>결제 상태</label>
                    <select 
                      value={paymentStatus} 
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      disabled={isSaving || isChecking}
                      className={`control-select payment-${paymentStatus}`}
                    >
                      <option value="미입금">미입금</option>
                      <option value="입금완료">입금완료</option>
                      <option value="환불">환불</option>
                    </select>
                  </div>
                </div>

                <div className="admin-memo-field">
                  <label>관리자 메모 (고객에게 노출되지 않음)</label>
                  <textarea 
                    value={adminMemo}
                    onChange={(e) => setAdminMemo(e.target.value)}
                    placeholder="업무 특이사항이나 통화 내용 메모..."
                    disabled={isSaving || isChecking}
                    rows={3}
                  />
                </div>

                {order.admin_checked && (
                  <div className="checked-info-box">
                    <span className="checked-badge">✓ 확인 완료</span>
                    <span className="checked-meta">
                      {formatDate(order.admin_checked_at)} ({order.admin_checked_by || 'admin'})
                    </span>
                  </div>
                )}

                <div className="admin-actions-row">
                  {isUnchecked(order) && (
                    <button 
                      type="button"
                      className="btn-admin-order-check" 
                      onClick={handleCheck} 
                      disabled={isSaving || isChecking}
                    >
                      {isChecking ? "확인 처리 중..." : "확인 처리"}
                    </button>
                  )}
                  <button 
                    type="button"
                    className="btn-admin-order-save" 
                    onClick={handleSave} 
                    disabled={isSaving || isChecking}
                  >
                    {isSaving ? "상태 저장 중..." : "저장"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
