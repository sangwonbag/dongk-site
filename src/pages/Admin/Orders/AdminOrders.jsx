import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { 
  getAdminOrders, 
  updateOrderAdminFields,
  updateOrderChecked
} from "../../../services/orderService";
import { syncGoogleCalendarEvent, cancelGoogleCalendarEvent } from "../../../services/calendarService";
import { getConstructionWorkers, updateOrderWorkerAssignment, checkWorkerScheduleConflict } from "../../../services/workerService";
import ReleaseNoteModal from "../../../components/documents/ReleaseNoteModal";
import CompletionCertificateModal from "../../../components/documents/CompletionCertificateModal";
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
  Clock,
  Printer,
  FileText,
  CalendarDays,
  ShieldAlert,
  UserCheck
} from "lucide-react";
import { formatFlooringProductName } from "../../../utils/brandUtils";
import { isDecoTile } from "../../../utils/decotileUtils";
import "./AdminOrders.css";


// 헬퍼 함수: memo에서 희망배송일 및 시간 추출
const extractDeliveryDateAndTime = (memo) => {
  if (!memo) return { cleanMemo: "", deliveryDate: "", deliveryTime: "" };
  let deliveryDate = "";
  let deliveryTime = "";
  let cleanMemo = memo;

  const dateMatch = cleanMemo.match(/\[희망배송일:\s*([^\]]+)\]/);
  if (dateMatch) {
    deliveryDate = dateMatch[1];
    cleanMemo = cleanMemo.replace(/\[희망배송일:\s*[^\]]+\]/, "").trim();
  }

  const timeMatch = cleanMemo.match(/\[희망시간:\s*([^\]]+)\]/);
  if (timeMatch) {
    deliveryTime = timeMatch[1];
    cleanMemo = cleanMemo.replace(/\[희망시간:\s*[^\]]+\]/, "").trim();
  }

  const accessoryMatch = cleanMemo.match(/\[상담요청 부자재\]\s*([^\n]+)/);
  if (accessoryMatch) {
    cleanMemo = cleanMemo.replace(/\[상담요청 부자재\].*$/m, "").trim();
  }

  return { cleanMemo, deliveryDate, deliveryTime };
};

const extractCustomAccessories = (memo) => {
  if (!memo) return [];
  const match = memo.match(/\[상담요청 부자재\]\s*([^\n]+)/);
  if (match) {
    return match[1].split(',').map(s => s.trim());
  }
  return [];
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
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
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

    // 1. 주문/결제/현장 상태 필터링
    if (activeFilter !== "전체") {
      if (activeFilter === "신규 주문" || activeFilter === "접수완료") {
        result = result.filter(o => o.status === "접수완료");
      } else if (activeFilter === "미확인 주문") {
        result = result.filter(o => isUnchecked(o));
      } else if (activeFilter === "오늘 주문" || activeFilter === "오늘시공") {
        const todayStr = new Date().toISOString().split('T')[0];
        result = result.filter(o => o.construction_date === todayStr || (o.created_at && new Date(o.created_at).toISOString().split('T')[0] === todayStr));
      } else if (activeFilter === "출고대기") {
        result = result.filter(o => o.shipment_status === "대기" || o.shipment_status === "준비중");
      } else if (activeFilter === "미수주문" || activeFilter === "미입금") {
        result = result.filter(o => o.outstanding_balance > 0 || o.payment_status === "미입금" || o.payment_status === "partial");
      } else if (activeFilter === "완납주문" || activeFilter === "입금완료") {
        result = result.filter(o => o.outstanding_balance === 0 && (o.total_paid_amount > 0 || o.payment_status === "입금완료"));
      } else if (activeFilter === "처리중 주문") {
        result = result.filter(o => o.status === "확인중" || o.status === "준비중" || o.status === "출고/배송중");
      } else if (activeFilter === "완료 주문" || activeFilter === "완료") {
        result = result.filter(o => o.status === "완료" || o.construction_status === "종결");
      } else {
        result = result.filter(o => o.status === activeFilter || o.construction_status === activeFilter);
      }
    }

    // 2. 통합 검색 필터링 (주문번호, 고객명, 연락처, 주소, 상품명, 상품코드, 시공담당자)
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(o => {
        const matchHeader = 
          o.customer_name?.toLowerCase().includes(term) ||
          o.company_name?.toLowerCase().includes(term) ||
          o.order_no?.toLowerCase().includes(term) ||
          o.phone?.includes(term) ||
          o.address?.toLowerCase().includes(term) ||
          o.address_detail?.toLowerCase().includes(term) ||
          o.construction_manager?.toLowerCase().includes(term);

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

  // If highlight ID is provided, automatically reset active filter and search text to ensure it's visible
  useEffect(() => {
    if (highlightId) {
      setActiveFilter("전체");
      setSearchTerm("");
    }
  }, [highlightId]);

  // 요약 통계 정보 연산
  const newCount = orders.filter(o => o.status === "접수완료").length;
  const uncheckedCount = orders.filter(isUnchecked).length;
  const unpaidCount = orders.filter(o => o.outstanding_balance > 0 || o.payment_status === "미입금").length;
  const processingCount = orders.filter(o => o.status === "확인중" || o.status === "준비중" || o.status === "출고/배송중").length;
  const completedCount = orders.filter(o => o.status === "완료" || o.construction_status === "종결").length;
  
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
            <h1>주문 및 현장 운영 관리</h1>
            <p>고객 접수 주문 확인, 자재 출고 체크리스트, 현장 진행 상태 및 수금/미수금을 통합 제어합니다.</p>
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
          <div className={`summary-card ${activeFilter === "미수주문" ? "active" : ""}`} onClick={() => setActiveFilter("미수주문")}>
            <div className="card-icon bg-unpaid"><Hourglass size={20} /></div>
            <div className="card-info">
              <span className="card-label">미수/일부입금</span>
              <strong className="card-value text-unpaid">{unpaidCount}건</strong>
            </div>
          </div>
          <div className={`summary-card ${activeFilter === "처리중 주문" ? "active" : ""}`} onClick={() => setActiveFilter("처리중 주문")}>
            <div className="card-icon bg-processing"><CalendarCheck size={20} /></div>
            <div className="card-info">
              <span className="card-label">현장 진행중</span>
              <strong className="card-value text-processing">{processingCount}건</strong>
            </div>
          </div>
          <div className={`summary-card ${activeFilter === "완료 주문" ? "active" : ""}`} onClick={() => setActiveFilter("완료 주문")}>
            <div className="card-icon bg-completed"><CheckCircle2 size={20} /></div>
            <div className="card-info">
              <span className="card-label">종결/완료</span>
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
              "오늘시공",
              "출고대기",
              "미수주문",
              "완납주문",
              "완료", 
              "취소"
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
              placeholder="주문번호, 고객명, 연락처, 주소, 상품명, 담당자 검색..."
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
                highlight={highlightId === order.id}
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
   현장 진행 관리, Google Calendar 동기화, 작업자 배정, 출고증/시공확인서 문서 생성, 수금/미수금 관리 확장
   ========================================================== */
function AdminOrderCard({ order, currentUser, onSaveSuccess, highlight }) {
  const [isExpanded, setIsExpanded] = useState(highlight || false);
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
  const [constructionStatus, setConstructionStatus] = useState(order.construction_status || '일정 미정');
  const [shipmentStatus, setShipmentStatus] = useState(order.shipment_status || '대기');
  const [adminMemo, setAdminMemo] = useState(order.admin_memo || "");
  
  // 시공 일정 및 작업자 폼 상태
  const [constructionDate, setConstructionDate] = useState(order.construction_date || "");
  const [constructionTimeSlot, setConstructionTimeSlot] = useState(order.construction_time_slot || "오전 9시");
  const [constructionManager, setConstructionManager] = useState(order.construction_manager || "");
  const [constructionPhone, setConstructionPhone] = useState(order.construction_phone || "");
  const [constructionMemo, setConstructionMemo] = useState(order.construction_memo || "");

  // 작업자 정보 상태
  const [workersList, setWorkersList] = useState([]);
  const [assignedWorkerId, setAssignedWorkerId] = useState(order.assigned_worker_id || "");
  const [assignedAssistantWorkerId, setAssignedAssistantWorkerId] = useState(order.assigned_assistant_worker_id || "");
  const [assignedTeam, setAssignedTeam] = useState(order.assigned_team || "");

  // Google Calendar 상태
  const [calendarStatus, setCalendarStatus] = useState(order.google_calendar_status || (order.google_calendar_event_id ? "등록 완료" : "미연결"));
  const [calendarSyncedAt, setCalendarSyncedAt] = useState(order.google_calendar_synced_at || null);
  const [calendarEventId, setCalendarEventId] = useState(order.google_calendar_event_id || null);

  // 문서 모달 상태
  const [showReleaseNote, setShowReleaseNote] = useState(false);
  const [showCompletionCert, setShowCompletionCert] = useState(false);

  // 출고 체크리스트 상태
  const [checklist, setChecklist] = useState(() => {
    if (order.shipment_checklist && order.shipment_checklist.length > 0) {
      return order.shipment_checklist;
    }
    // Default checklist built from order_items
    const items = (order.order_items || []).map(item => ({
      id: item.id || String(Math.random()),
      product_name: item.product_name,
      product_code: item.product_code || '-',
      expected_qty: item.quantity,
      actual_qty: item.quantity,
      unit: item.unit || '평',
      prepared: false,
      note: ''
    }));
    // Default accessories checklist items
    items.push({ id: 'acc-glue', product_name: '데코타일 본드', product_code: 'ACC-GLUE', expected_qty: 1, actual_qty: 1, unit: '통', prepared: false, note: '' });
    items.push({ id: 'acc-silicone', product_name: '마감 실리콘', product_code: 'ACC-SILICONE', expected_qty: 2, actual_qty: 2, unit: '개', prepared: false, note: '' });
    return items;
  });

  // 최종 청구 및 수금 상태
  const [extraChargeAmount, setExtraChargeAmount] = useState(order.extra_charge_amount || 0);
  const [extraChargeReason, setExtraChargeReason] = useState(order.extra_charge_reason || "");
  const [extraDiscountAmount, setExtraDiscountAmount] = useState(order.extra_discount_amount || 0);

  // 입금 내역 폼 및 입금 이력 목록
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [newPayAmount, setNewPayAmount] = useState("");
  const [newPayMethod, setNewPayMethod] = useState("계좌이체");
  const [newPayDate, setNewPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPayMemo, setNewPayMemo] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [cardError, setCardError] = useState("");
  const [cardSuccess, setCardSuccess] = useState("");

  // 외부 props 변경 시 동기화 및 입금 내역 로드
  useEffect(() => {
    setStatus(order.status);
    setPaymentStatus(order.payment_status);
    setConstructionStatus(order.construction_status || '일정 미정');
    setShipmentStatus(order.shipment_status || '대기');
    setAdminMemo(order.admin_memo || "");
    setConstructionDate(order.construction_date || "");
    setConstructionTimeSlot(order.construction_time_slot || "오전 9시");
    setConstructionManager(order.construction_manager || "");
    setConstructionPhone(order.construction_phone || "");
    setConstructionMemo(order.construction_memo || "");
    setExtraChargeAmount(order.extra_charge_amount || 0);
    setExtraChargeReason(order.extra_charge_reason || "");
    setExtraDiscountAmount(order.extra_discount_amount || 0);
    setAssignedWorkerId(order.assigned_worker_id || "");
    setAssignedAssistantWorkerId(order.assigned_assistant_worker_id || "");
    setAssignedTeam(order.assigned_team || "");
    setCalendarStatus(order.google_calendar_status || (order.google_calendar_event_id ? "등록 완료" : "미연결"));
    setCalendarSyncedAt(order.google_calendar_synced_at || null);
    setCalendarEventId(order.google_calendar_event_id || null);

    // Fetch payments log and worker list if expanded
    if (isExpanded) {
      import("../../../services/orderService").then(mod => {
        mod.getOrderPayments(order.id).then(logs => setPaymentHistory(logs)).catch(err => console.warn(err));
      });
      getConstructionWorkers().then(data => setWorkersList(data || [])).catch(err => console.warn(err));
    }
  }, [order, isExpanded]);

  // Handle auto-expanding and smooth scrolling for highlight
  useEffect(() => {
    if (highlight) {
      setIsExpanded(true);
      const timer = setTimeout(() => {
        const el = document.getElementById(`order-card-${order.id}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [highlight, order.id]);

  const { cleanMemo, deliveryDate, deliveryTime } = extractDeliveryDateAndTime(order.memo);

  // 미수금 경과일 계산
  const overdueInfo = useMemo(() => {
    const finalBilling = order.final_billing_amount || order.total_amount || 0;
    const totalPaid = order.total_paid_amount || 0;
    const outstanding = order.outstanding_balance ?? Math.max(0, finalBilling - totalPaid);

    if (outstanding <= 0) return { days: 0, text: '완납 (잔액 0원)', style: { backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' } };

    const refDateStr = order.construction_completed_at || order.construction_date || order.created_at;
    if (!refDateStr) return { days: 0, text: `미수 (${outstanding.toLocaleString()}원)`, style: { backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' } };

    const refDate = new Date(refDateStr);
    const now = new Date();
    const diffDays = Math.max(0, Math.floor((now.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24)));

    let riskLevel = '일반';
    let style = { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' };

    if (diffDays >= 15) {
      riskLevel = '장기 미수';
      style = { backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontWeight: '800' };
    } else if (diffDays >= 8) {
      riskLevel = '미수 주의';
      style = { backgroundColor: '#ffedd5', color: '#c2410c', border: '1px solid #fdba74', fontWeight: '800' };
    } else if (diffDays >= 4) {
      riskLevel = '확인 필요';
      style = { backgroundColor: '#fef9c3', color: '#a16207', border: '1px solid #fde047', fontWeight: '700' };
    } else {
      riskLevel = '일반';
      style = { backgroundColor: '#e2e8f0', color: '#334155', border: '1px solid #cbd5e1' };
    }

    return { days: diffDays, riskLevel, style, text: `미수 ${diffDays}일차 (${riskLevel})` };
  }, [order]);

  // Google Calendar 연동 핸들러
  const handleCalendarSync = async () => {
    setIsSaving(true);
    setCardError("");
    setCardSuccess("");
    try {
      const result = await syncGoogleCalendarEvent(order);
      setCalendarStatus(result.google_calendar_status || "등록 완료");
      setCalendarSyncedAt(result.google_calendar_synced_at || new Date().toISOString());
      setCalendarEventId(result.google_calendar_event_id);
      onSaveSuccess({ ...order, ...result });
      setCardSuccess(result.synced ? "Google Calendar에 일정이 등록/동기화되었습니다." : "일정 동기화 기록이 저장되었습니다.");
      setTimeout(() => setCardSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setCalendarStatus("동기화 실패");
      setCardError("Calendar 동기화 실패: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCalendarCancel = async () => {
    if (!window.confirm("Google Calendar 일정을 삭제/취소하시겠습니까?")) return;
    setIsSaving(true);
    setCardError("");
    setCardSuccess("");
    try {
      const result = await cancelGoogleCalendarEvent(order);
      setCalendarStatus("취소");
      onSaveSuccess({ ...order, ...result });
      setCardSuccess("Google Calendar 일정이 취소 처리되었습니다.");
      setTimeout(() => setCardSuccess(""), 3000);
    } catch (err) {
      setCardError("Calendar 취소 실패: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 작업자 선택 및 일정 중복 경고 체크
  const handleWorkerSelect = async (workerId) => {
    setAssignedWorkerId(workerId);
    const selectedWorker = workersList.find(w => w.id === workerId);
    if (selectedWorker) {
      setConstructionManager(selectedWorker.name);
      setConstructionPhone(selectedWorker.phone || "");
      if (selectedWorker.team_name) {
        setAssignedTeam(selectedWorker.team_name);
      }
    }

    if (workerId && constructionDate) {
      const check = await checkWorkerScheduleConflict(
        workerId,
        constructionDate,
        constructionTimeSlot,
        order.id
      );
      if (check.conflict) {
        const conflictingNos = check.conflictingOrders.map(o => o.order_no).join(', ');
        const workerName = selectedWorker ? selectedWorker.name : '선택한 작업자';
        alert(`⚠️ [작업자 일정 중복 경고]\n\n${workerName} 작업자가 ${constructionDate} (${constructionTimeSlot})에 다른 현장 [${conflictingNos}]에 이미 배정되어 있습니다.`);
      }
    }
  };

  // 작업자 배정 정보 저장
  const handleSaveWorkerAssignment = async () => {
    setIsSaving(true);
    setCardError("");
    setCardSuccess("");
    try {
      const mainWorker = workersList.find(w => w.id === assignedWorkerId);
      const updated = await updateOrderWorkerAssignment(order.id, {
        assigned_worker_id: assignedWorkerId || null,
        assigned_assistant_worker_id: assignedAssistantWorkerId || null,
        assigned_team: assignedTeam || "",
        construction_manager: mainWorker ? mainWorker.name : constructionManager,
        construction_phone: mainWorker ? (mainWorker.phone || constructionPhone) : constructionPhone
      });
      onSaveSuccess(updated);
      setCardSuccess("작업자 배정이 완료되었습니다.");
      setTimeout(() => setCardSuccess(""), 3000);
    } catch (err) {
      setCardError("작업자 배정 저장 실패: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 시공 일정 저장
  const handleSaveSchedule = async () => {
    setIsSaving(true);
    setCardError("");
    setCardSuccess("");
    try {
      const mod = await import("../../../services/orderService");
      const updated = await mod.updateOrderConstructionSchedule(order.id, {
        construction_date: constructionDate,
        construction_time_slot: constructionTimeSlot,
        construction_manager: constructionManager,
        construction_phone: constructionPhone,
        construction_memo: constructionMemo
      });
      onSaveSuccess(updated);
      setCardSuccess("시공 일정이 저장되었습니다.");
      setTimeout(() => setCardSuccess(""), 3000);
    } catch (err) {
      setCardError(err.message || "시공 일정 저장 실패");
    } finally {
      setIsSaving(false);
    }
  };

  // 현장 진행 상태 변경 (현장 도착, 시공 시작, 시공 완료, 고객 확인 등)
  const handleStatusStep = async (newStatus, timestampKey = null) => {
    setIsSaving(true);
    setCardError("");
    setCardSuccess("");
    try {
      const mod = await import("../../../services/orderService");
      const updated = await mod.updateOrderConstructionStatus(order.id, newStatus, timestampKey);
      setConstructionStatus(newStatus);
      onSaveSuccess(updated);
      setCardSuccess(`현장 상태가 '${newStatus}'(으)로 전환되었습니다.`);
      setTimeout(() => setCardSuccess(""), 3000);
    } catch (err) {
      setCardError(err.message || "상태 전환 실패");
    } finally {
      setIsSaving(false);
    }
  };

  // 출고 체크리스트 저장 / 완료
  const handleSaveShipment = async (isCompleted = false) => {
    setIsSaving(true);
    setCardError("");
    setCardSuccess("");
    try {
      const mod = await import("../../../services/orderService");
      const updated = await mod.updateOrderShipmentChecklist(order.id, checklist, isCompleted, currentUser?.name || 'admin');
      onSaveSuccess(updated);
      setCardSuccess(isCompleted ? "자재 출고 완료 처리가 기록되었습니다." : "출고 체크리스트가 저장되었습니다.");
      setTimeout(() => setCardSuccess(""), 3000);
    } catch (err) {
      setCardError(err.message || "출고 처리 실패");
    } finally {
      setIsSaving(false);
    }
  };

  // 최종 청구 금액 조정 저장
  const handleSaveBilling = async () => {
    setIsSaving(true);
    setCardError("");
    setCardSuccess("");
    try {
      const mod = await import("../../../services/orderService");
      const updated = await mod.saveOrderConstructionCompletion(order.id, {
        extra_charge_amount: extraChargeAmount,
        extra_charge_reason: extraChargeReason,
        extra_discount_amount: extraDiscountAmount
      });
      onSaveSuccess(updated);
      setCardSuccess("최종 청구금액이 성공적으로 계산 및 저장되었습니다.");
      setTimeout(() => setCardSuccess(""), 3000);
    } catch (err) {
      setCardError(err.message || "청구금액 저장 실패");
    } finally {
      setIsSaving(false);
    }
  };

  // 입금 이력 추가
  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!newPayAmount || parseFloat(newPayAmount) <= 0) {
      alert("올바른 입금 금액을 입력해 주세요.");
      return;
    }

    const numAmount = parseFloat(newPayAmount);
    const finalBilling = order.final_billing_amount || order.total_amount;
    const currentPaid = order.total_paid_amount || 0;

    if (currentPaid + numAmount > finalBilling) {
      if (!window.confirm(`⚠️ 최종 청구금액(${finalBilling.toLocaleString()}원)보다 총 입금액(${(currentPaid + numAmount).toLocaleString()}원)이 큽니다. 초과 입금을 등록하시겠습니까?`)) {
        return;
      }
    }

    setIsSaving(true);
    setCardError("");
    setCardSuccess("");
    try {
      const mod = await import("../../../services/orderService");
      const updated = await mod.addOrderPayment(order.id, {
        amount: numAmount,
        payment_method: newPayMethod,
        paid_at: newPayDate ? new Date(newPayDate).toISOString() : new Date().toISOString(),
        memo: newPayMemo
      }, currentUser?.name || 'admin');

      const logs = await mod.getOrderPayments(order.id);
      setPaymentHistory(logs);
      setNewPayAmount("");
      setNewPayMemo("");
      onSaveSuccess(updated);
      setCardSuccess("입금 내역이 등록되고 미수금이 재계산되었습니다.");
      setTimeout(() => setCardSuccess(""), 3000);
    } catch (err) {
      setCardError(err.message || "입금 등록 실패");
    } finally {
      setIsSaving(false);
    }
  };

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
      const mod = await import("../../../services/orderService");
      const updated = await mod.updateOrderChecked(order.id, currentUser?.name || currentUser?.email || "admin");
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

  // 일반 저장 처리 핸들러
  const handleSave = async (e) => {
    e.stopPropagation();
    setIsSaving(true);
    setCardError("");
    setCardSuccess("");
    try {
      const mod = await import("../../../services/orderService");
      const updated = await mod.updateOrderAdminFields(order.id, { status, paymentStatus, adminMemo });
      onSaveSuccess(updated);
      setCardSuccess("주문 상태 및 메모가 저장되었습니다.");
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

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const finalBilling = order.final_billing_amount || order.total_amount || 0;
  const totalPaid = order.total_paid_amount || 0;
  const outstanding = order.outstanding_balance ?? Math.max(0, finalBilling - totalPaid);

  return (
    <div id={`order-card-${order.id}`} className={`admin-order-card-v2 ${isExpanded ? "expanded" : ""} ${isUnchecked(order) ? "unchecked-highlight" : ""} ${highlight ? "highlight-pulse" : ""}`}>
      {/* 카드 상단 요약 영역 (그리드 최적화) */}
      <div className="card-summary-row" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="summary-grid">
          {/* 메타 정보 */}
          <div className="summary-col-meta">
            <span className="order-no">{order.order_no}</span>
            <span className="order-date">{formatDate(order.created_at)}</span>
            <div className="badges-row">
              {order.status === "접수완료" && <span className="badge-new-order">신규</span>}
              {(order.source_estimate_no || order.source_estimate_id || (order.memo && order.memo.includes('[시공상담전환]'))) && (
                <span className="badge-converted-from-estimate" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                  상담 전환
                </span>
              )}
              <span className={`badge-delivery-method-summary ${order.delivery_method || 'cargo'}`}>
                {order.delivery_method === "free_shipping" ? "무료배송" :
                 order.delivery_method === "quick" ? "퀵 요청" :
                 order.delivery_method === "pickup" ? "직접 수령" : "대신화물"}
              </span>
              <span className="badge-construction-status" style={{ backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                시공: {constructionStatus}
              </span>
              <span className="badge-shipment-status" style={{ backgroundColor: shipmentStatus === '출고완료' ? '#dcfce7' : '#fff7ed', color: shipmentStatus === '출고완료' ? '#15803d' : '#c2410c', border: '1px solid #fed7aa', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                출고: {shipmentStatus}
              </span>
              {/* Google Calendar 연동 상태 태그 */}
              <span className="badge-calendar-status" style={{ backgroundColor: calendarStatus === '등록 완료' ? '#e0f2fe' : (calendarStatus === '동기화 실패' ? '#fee2e2' : '#f1f5f9'), color: calendarStatus === '등록 완료' ? '#0369a1' : (calendarStatus === '동기화 실패' ? '#b91c1c' : '#475569'), border: '1px solid #cbd5e1', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                📅 Calendar: {calendarStatus}
              </span>
            </div>
          </div>

          {/* 고객 정보 */}
          <div className="summary-col-customer">
            <div className="customer-name-wrapper">
              <User size={13} className="icon-sub" />
              <strong>{order.customer_name}</strong>
              {order.company_name && <span className="company-sub">({order.company_name})</span>}
            </div>
            <div className="customer-phone-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={13} className="icon-sub" />
              <span>{order.phone}</span>
              <a href={`tel:${order.phone}`} onClick={(e) => e.stopPropagation()} style={{ fontSize: '11px', backgroundColor: '#e2e8f0', color: '#0f172a', padding: '1px 5px', borderRadius: '3px', textDecoration: 'none', fontWeight: '700' }}>
                전화
              </a>
            </div>
            {order.construction_date && (
              <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: '700', marginTop: '2px' }}>
                📅 시공예정: {order.construction_date} ({order.construction_time_slot || '시간미정'})
              </div>
            )}
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

          {/* 상태 및 청구/미수금 + 미수 위험 등급 */}
          <div className="summary-col-status-amount" style={{ textAlign: 'right' }}>
            <div className="badges-group" style={{ justifyContent: 'flex-end', marginBottom: '4px', gap: '4px' }}>
              {outstanding > 0 && overdueInfo.text && (
                <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', ...overdueInfo.style }}>
                  {overdueInfo.text}
                </span>
              )}
              <span className={`badge-payment ${outstanding === 0 && totalPaid > 0 ? 'badge-paid' : (totalPaid > 0 ? 'badge-preparing' : 'badge-unpaid')}`}>
                {outstanding === 0 && totalPaid > 0 ? '완납' : (totalPaid > 0 ? '일부입금' : '미수')}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              청구: <strong>{finalBilling.toLocaleString()}원</strong>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: outstanding > 0 ? '#dc2626' : '#16a34a' }}>
              {outstanding > 0 ? `미수금 ${outstanding.toLocaleString()}원` : `완납 (0원)`}
            </div>
          </div>
        </div>

        <button className="btn-toggle-arrow">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* 카드 상세 아코디언 바디 */}
      {isExpanded && (
        <div className="card-detailed-body">
          {/* 간편 복사 및 문서 / Calendar 스마트 툴바 */}
          <div className="quick-action-toolbar" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <button className="btn-quick-copy" onClick={(e) => handleCopyText(order.order_no, "주문번호가", e)}>
              <Copy size={12} /> 주문번호 복사
            </button>
            <button className="btn-quick-copy" onClick={(e) => handleCopyText(order.phone, "전화번호가", e)}>
              <Copy size={12} /> 연락처 복사
            </button>
            <button className="btn-quick-copy" onClick={(e) => handleCopyText(order.address + " " + (order.address_detail || ""), "주소가", e)}>
              <Copy size={12} /> 배송주소 복사
            </button>
            <a href={`tel:${order.phone}`} onClick={(e) => e.stopPropagation()} className="btn-quick-copy" style={{ textDecoration: 'none', color: '#0369a1', fontWeight: '700' }}>
              <Phone size={12} /> 고객 통화 연결
            </a>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowReleaseNote(true)} style={{ padding: '6px 12px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Printer size={13} /> [출고증 A4]
              </button>
              <button onClick={() => setShowCompletionCert(true)} style={{ padding: '6px 12px', backgroundColor: '#b3925f', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileText size={13} /> [시공확인서 A4]
              </button>
            </div>
            {copyFeedback && <span className="copy-success-toast">{copyFeedback}</span>}
          </div>

          {cardError && <div className="card-inner-error-banner">{cardError}</div>}
          {cardSuccess && <div className="card-inner-success-banner">{cardSuccess}</div>}

          {/* ==================== 5대 현장 진행 관리 섹션 ==================== */}
          <div className="operational-control-tabs" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Section ①: 주문 & 고객 기본 정보 */}
            <div className="op-section-card" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                ① 주문 및 고객 정보
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '13px' }}>
                <div><strong>주문번호:</strong> {order.order_no}</div>
                <div>
                  <strong>고객명:</strong> {order.customer_name} ({order.phone})
                  <a href={`tel:${order.phone}`} style={{ marginLeft: '8px', color: '#0284c7', fontSize: '12px' }}>[전화걸기]</a>
                </div>
                <div><strong>현장 주소:</strong> {order.address} {order.address_detail || ''}</div>
                <div><strong>생성일시:</strong> {formatDate(order.created_at)}</div>
                {order.source_estimate_no && <div><strong>연결 상담번호:</strong> {order.source_estimate_no}</div>}
              </div>
            </div>

            {/* Section ②: 자재 출고 정보 & 체크리스트 */}
            <div className="op-section-card" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  ② 자재 출고 정보 (체크리스트)
                </h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setShowReleaseNote(true)} style={{ padding: '6px 10px', backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                    출고증 미보기
                  </button>
                  <button onClick={() => handleSaveShipment(false)} disabled={isSaving} style={{ padding: '6px 12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                    출고 준비 저장
                  </button>
                  <button onClick={() => handleSaveShipment(true)} disabled={isSaving} style={{ padding: '6px 12px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                    [출고 완료] 처리
                  </button>
                </div>
              </div>

              {/* 출고 정보 요약 */}
              <div style={{ marginBottom: '12px', fontSize: '12.5px', color: '#475569', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span>배송 방식: <strong>{order.delivery_method_label || '대신화물'}</strong></span>
                {order.delivery_fee_status === '착불' && <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>착불</span>}
                {order.shipment_prepared_at && <span>출고완료 일시: {formatDate(order.shipment_prepared_at)} ({order.shipment_prepared_by})</span>}
              </div>

              {/* 품목 체크리스트 테이블 */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>준비</th>
                      <th style={{ padding: '8px' }}>품목명 / 코드</th>
                      <th style={{ padding: '8px' }}>예정수량</th>
                      <th style={{ padding: '8px' }}>실제출고수량</th>
                      <th style={{ padding: '8px' }}>출고 메모</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checklist.map((item, idx) => (
                      <tr key={item.id || idx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: !item.prepared ? '#fff5f5' : '#ffffff' }}>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <input 
                            type="checkbox" 
                            checked={item.prepared} 
                            onChange={(e) => {
                              const next = [...checklist];
                              next[idx].prepared = e.target.checked;
                              setChecklist(next);
                            }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <strong>{item.product_name}</strong> <span style={{ color: '#64748b', fontSize: '11px' }}>({item.product_code})</span>
                        </td>
                        <td style={{ padding: '8px' }}>{item.expected_qty} {item.unit}</td>
                        <td style={{ padding: '8px' }}>
                          <input 
                            type="number" 
                            value={item.actual_qty} 
                            onChange={(e) => {
                              const next = [...checklist];
                              next[idx].actual_qty = parseFloat(e.target.value) || 0;
                              setChecklist(next);
                            }}
                            style={{ width: '70px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'right' }}
                          /> {item.unit}
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input 
                            type="text" 
                            placeholder="특이사항 메모..."
                            value={item.note || ''} 
                            onChange={(e) => {
                              const next = [...checklist];
                              next[idx].note = e.target.value;
                              setChecklist(next);
                            }}
                            style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section ③: 시공 일정 및 작업자 배정 + Google Calendar */}
            <div className="op-section-card" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  ③ 시공 일정 · 작업자 배정 · Google Calendar 연동
                </h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleSaveSchedule} disabled={isSaving} style={{ padding: '6px 14px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                    일정 저장
                  </button>
                </div>
              </div>

              {/* Google Calendar 연동 스마트 서브 바 */}
              <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', padding: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarDays size={18} style={{ color: '#0284c7' }} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0369a1' }}>Google Calendar 연동 상태: </strong>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: calendarStatus === '등록 완료' ? '#15803d' : '#0369a1' }}>
                      {calendarStatus}
                    </span>
                    {calendarSyncedAt && <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>({formatDate(calendarSyncedAt)} 동기화)</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {calendarStatus === "미연결" || calendarStatus === "동기화 실패" ? (
                    <button onClick={handleCalendarSync} disabled={isSaving} style={{ padding: '6px 12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                      [Google Calendar에 등록]
                    </button>
                  ) : (
                    <>
                      <button onClick={handleCalendarSync} disabled={isSaving} style={{ padding: '6px 12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                        [캘린더 일정 업데이트]
                      </button>
                      <button onClick={handleCalendarCancel} disabled={isSaving} style={{ padding: '6px 12px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                        [캘린더 일정 취소]
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 시공일정 및 작업자 선택 그리드 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>시공 예정일</label>
                  <input type="date" value={constructionDate} onChange={(e) => setConstructionDate(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>시간대</label>
                  <select value={constructionTimeSlot} onChange={(e) => setConstructionTimeSlot(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}>
                    <option value="오전 8시~9시 시작">오전 8시~9시 시작</option>
                    <option value="오전 10시~11시 시작">오전 10시~11시 시작</option>
                    <option value="오후 1시~2시 시작">오후 1시~2시 시작</option>
                    <option value="시간 사전협의">시간 사전협의</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>주 시공 담당자 (체계적 배정)</label>
                  <select 
                    value={assignedWorkerId} 
                    onChange={(e) => handleWorkerSelect(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px', backgroundColor: '#ffffff' }}
                  >
                    <option value="">-- 작업자 선택 --</option>
                    {workersList.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.team_name || '개인'}) - {Array.isArray(w.specialty) ? w.specialty.join(',') : (w.specialty || '전공종')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>보조 작업자 (선택)</label>
                  <select 
                    value={assignedAssistantWorkerId} 
                    onChange={(e) => setAssignedAssistantWorkerId(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}
                  >
                    <option value="">-- 보조 작업자 없음 --</option>
                    {workersList.filter(w => w.id !== assignedWorkerId).map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.team_name || '개인'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>시공 팀명</label>
                  <input type="text" placeholder="예: 동경 1팀" value={assignedTeam} onChange={(e) => setAssignedTeam(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>담당자 연락처</label>
                  <input type="text" placeholder="010-0000-0000" value={constructionPhone} onChange={(e) => setConstructionPhone(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }} />
                </div>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={handleSaveWorkerAssignment} disabled={isSaving} style={{ padding: '7px 14px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                  [작업자 배정 저장]
                </button>
              </div>

              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>현장 시공 메모</label>
                <input type="text" placeholder="엘리베이터 사용 가능 여부, 주차 안내, 기존 바닥 상태 메모..." value={constructionMemo} onChange={(e) => setConstructionMemo(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }} />
              </div>
            </div>

            {/* Section ④: 현장 진행 상태 단계 및 타임스탬프 */}
            <div className="op-section-card" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  ④ 현장 진행 상태 제어 (현재: <span style={{ color: '#0284c7' }}>{constructionStatus}</span>)
                </h4>
                <button onClick={() => setShowCompletionCert(true)} style={{ padding: '6px 12px', backgroundColor: '#b3925f', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                  [시공확인서 발급]
                </button>
              </div>

              {/* 진행 상태 버튼 바 */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <button onClick={() => handleStatusStep('일정 확정')} style={{ padding: '8px 12px', backgroundColor: constructionStatus === '일정 확정' ? '#0f172a' : '#f1f5f9', color: constructionStatus === '일정 확정' ? '#fff' : '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                  1. 일정 확정
                </button>
                <button onClick={() => handleStatusStep('출고 준비')} style={{ padding: '8px 12px', backgroundColor: constructionStatus === '출고 준비' ? '#0f172a' : '#f1f5f9', color: constructionStatus === '출고 준비' ? '#fff' : '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                  2. 출고 준비
                </button>
                <button onClick={() => handleStatusStep('출고 완료')} style={{ padding: '8px 12px', backgroundColor: constructionStatus === '출고 완료' ? '#0f172a' : '#f1f5f9', color: constructionStatus === '출고 완료' ? '#fff' : '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                  3. 출고 완료
                </button>
                <button onClick={() => handleStatusStep('현장 도착', 'arrived_at')} style={{ padding: '8px 12px', backgroundColor: constructionStatus === '현장 도착' ? '#0284c7' : '#e0f2fe', color: constructionStatus === '현장 도착' ? '#fff' : '#0369a1', border: '1px solid #bae6fd', borderRadius: '6px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                  4. [현장 도착]
                </button>
                <button onClick={() => handleStatusStep('시공 중', 'construction_started_at')} style={{ padding: '8px 12px', backgroundColor: constructionStatus === '시공 중' ? '#d97706' : '#fef3c7', color: constructionStatus === '시공 중' ? '#fff' : '#b45309', border: '1px solid #fde68a', borderRadius: '6px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                  5. [시공 시작]
                </button>
                <button onClick={() => handleStatusStep('시공 완료', 'construction_completed_at')} style={{ padding: '8px 12px', backgroundColor: constructionStatus === '시공 완료' ? '#16a34a' : '#dcfce7', color: constructionStatus === '시공 완료' ? '#fff' : '#15803d', border: '1px solid #86efac', borderRadius: '6px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                  6. [시공 완료]
                </button>
                <button onClick={() => handleStatusStep('고객 확인', 'customer_confirmed_at')} style={{ padding: '8px 12px', backgroundColor: constructionStatus === '고객 확인' ? '#7c3aed' : '#f3e8ff', color: constructionStatus === '고객 확인' ? '#fff' : '#6d28d9', border: '1px solid #ddd6fe', borderRadius: '6px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                  7. [고객 확인]
                </button>
                <button onClick={() => handleStatusStep('종결')} style={{ padding: '8px 12px', backgroundColor: constructionStatus === '종결' ? '#334155' : '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                  8. 종결
                </button>
              </div>

              {/* 타임스탬프 기록 표시 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', fontSize: '11.5px', color: '#64748b', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                <div>현장도착: {order.arrived_at ? formatDate(order.arrived_at) : '-'}</div>
                <div>시공시작: {order.construction_started_at ? formatDate(order.construction_started_at) : '-'}</div>
                <div>시공완료: {order.construction_completed_at ? formatDate(order.construction_completed_at) : '-'}</div>
                <div>고객확인: {order.customer_confirmed_at ? formatDate(order.customer_confirmed_at) : '-'}</div>
              </div>
            </div>

            {/* Section ⑤: 수금 & 미수금 경과일 관리 */}
            <div className="op-section-card" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  ⑤ 수금 & 최종 청구금액 산정
                </h4>
                <button onClick={handleSaveBilling} disabled={isSaving} style={{ padding: '6px 14px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                  청구금액 수정 저장
                </button>
              </div>

              {/* 최종 청구 공식 대시보드 배너 */}
              <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: '16px 20px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      기존 견적 ({(order.approved_amount || order.total_amount || 0).toLocaleString()}원) + 추가 비용 ({extraChargeAmount.toLocaleString()}원) - 추가 할인 ({extraDiscountAmount.toLocaleString()}원)
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>
                      최종 청구금액: {finalBilling.toLocaleString()}원
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>누적 입금액: {totalPaid.toLocaleString()}원</div>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: outstanding > 0 ? '#fca5a5' : '#4ade80' }}>
                      {outstanding > 0 ? `미수금 ${outstanding.toLocaleString()}원` : `완납 (잔액 0원)`}
                    </div>
                    {outstanding > 0 && (
                      <div style={{ fontSize: '12px', color: '#fef08a', marginTop: '2px', fontWeight: '700' }}>
                        ⏱️ {overdueInfo.text}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 청구금액 조정 입력폼 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>추가 작업 비용 (+원)</label>
                  <input type="number" value={extraChargeAmount} onChange={(e) => setExtraChargeAmount(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'right', fontWeight: '700' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>추가 비용 사유</label>
                  <input type="text" placeholder="예: 기존 장판 철거 10평 추가" value={extraChargeReason} onChange={(e) => setExtraChargeReason(e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>추가 네고/할인 (-원)</label>
                  <input type="number" value={extraDiscountAmount} onChange={(e) => setExtraDiscountAmount(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'right', fontWeight: '700' }} />
                </div>
              </div>

              {/* 입금 내역 및 입금 등록 폼 */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <h5 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
                  💳 입금 이력 관리 ({paymentHistory.length}건)
                </h5>

                {/* 입금 이력 목록 테이블 */}
                {paymentHistory.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '12px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                        <th style={{ padding: '6px 8px' }}>입금일시</th>
                        <th style={{ padding: '6px 8px' }}>방식</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>입금 금액</th>
                        <th style={{ padding: '6px 8px' }}>메모</th>
                        <th style={{ padding: '6px 8px' }}>처리자</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '6px 8px' }}>{formatDate(p.paid_at)}</td>
                          <td style={{ padding: '6px 8px' }}><span style={{ backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>{p.payment_method}</span></td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '700', color: '#16a34a' }}>+{parseFloat(p.amount).toLocaleString()}원</td>
                          <td style={{ padding: '6px 8px', color: '#64748b' }}>{p.memo || '-'}</td>
                          <td style={{ padding: '6px 8px', color: '#94a3b8' }}>{p.created_by || 'admin'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '12px' }}>
                    아직 등록된 입금 이력이 없습니다.
                  </div>
                )}

                {/* 입금 등록 폼 */}
                <form onSubmit={handleAddPayment} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end', backgroundColor: '#f0fdf4', padding: '12px', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
                  <div style={{ flex: '1', minWidth: '130px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#166534', marginBottom: '2px' }}>입금 금액</label>
                    <input type="number" placeholder="예: 500000" value={newPayAmount} onChange={(e) => setNewPayAmount(e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #86efac', borderRadius: '4px', textAlign: 'right', fontWeight: '700' }} />
                  </div>
                  <div style={{ flex: '1', minWidth: '110px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#166534', marginBottom: '2px' }}>결제 수단</label>
                    <select value={newPayMethod} onChange={(e) => setNewPayMethod(e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #86efac', borderRadius: '4px' }}>
                      <option value="계좌이체">계좌이체</option>
                      <option value="현장결제">현장결제</option>
                      <option value="카드">카드결제</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                  <div style={{ flex: '1', minWidth: '130px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#166534', marginBottom: '2px' }}>입금 일자</label>
                    <input type="date" value={newPayDate} onChange={(e) => setNewPayDate(e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #86efac', borderRadius: '4px' }} />
                  </div>
                  <div style={{ flex: '2', minWidth: '160px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#166534', marginBottom: '2px' }}>입금 메모</label>
                    <input type="text" placeholder="예: 1차 계약금 입금" value={newPayMemo} onChange={(e) => setNewPayMemo(e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #86efac', borderRadius: '4px' }} />
                  </div>
                  <button type="submit" disabled={isSaving} style={{ padding: '7px 16px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '700', cursor: 'pointer' }}>
                    [입금 기록 추가]
                  </button>
                </form>
              </div>
            </div>

          </div>

          {/* 시스템 관리자 메모 및 기본 상태 셀렉터 */}
          <div className="info-block-admin-control" style={{ marginTop: '24px' }}>
            <h4>시스템 종합 상태 및 메모</h4>
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
                <label>관리자 비밀 메모 (고객에게 절대 노출되지 않음)</label>
                <textarea 
                  value={adminMemo}
                  onChange={(e) => setAdminMemo(e.target.value)}
                  placeholder="업무 특이사항, 내부 원가, 시공팀 전달사항 등..."
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

              <div className="admin-actions-row" style={{ display: 'flex', gap: '8px' }}>
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
                  {isSaving ? "상태 저장 중..." : "상태 및 메모 저장"}
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 출고증 문서 모달 */}
      <ReleaseNoteModal
        isOpen={showReleaseNote}
        onClose={() => setShowReleaseNote(false)}
        order={order}
      />

      {/* 시공확인서 문서 모달 */}
      <CompletionCertificateModal
        isOpen={showCompletionCert}
        onClose={() => setShowCompletionCert(false)}
        order={order}
      />
    </div>
  );
}


