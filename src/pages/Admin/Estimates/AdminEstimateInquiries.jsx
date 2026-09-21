import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getEstimateInquiries,
  updateEstimateInquiryStatus,
  updateEstimateInquiryAdminMemo,
  updateEstimateItems,
  confirmEstimateQuote,
  convertEstimateToOrder,
  updateConstructionSchedule
} from '../../../services/estimateInquiryService';
import {
  Search,
  Filter,
  RefreshCw,
  X,
  FileText,
  User,
  Phone,
  MapPin,
  Calendar,
  Layers,
  CheckCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Clock,
  AlertCircle,
  Building,
  Wrench,
  Calculator,
  ShoppingBag,
  ArrowRight,
  Edit3,
  DollarSign,
  UserCheck,
  CalendarCheck
} from 'lucide-react';
import './AdminEstimateInquiries.css';

const STATUS_OPTIONS = ['신규 접수', '상담 중', '견적 안내', '고객 진행 요청', '진행 확정', '보류', '취소'];

export default function AdminEstimateInquiries() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');

  // Detail Modal State
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [adminMemoInput, setAdminMemoInput] = useState('');
  const [statusInput, setStatusInput] = useState('신규 접수');
  const [savingMemo, setSavingMemo] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Item Price/Qty Editing State
  const [editingItems, setEditingItems] = useState([]);
  const [savingItems, setSavingItems] = useState(false);

  // Section ⑤ Final Quote Form State
  const [materialFee, setMaterialFee] = useState(0);
  const [subMaterialFee, setSubMaterialFee] = useState(0);
  const [constructionFee, setConstructionFee] = useState(0);
  const [demolitionFee, setDemolitionFee] = useState(0);
  const [transportFee, setTransportFee] = useState(0);
  const [extraFee, setExtraFee] = useState(0);
  const [discountFee, setDiscountFee] = useState(0);
  const [validUntil, setValidUntil] = useState('');
  const [adminQuoteMemo, setAdminQuoteMemo] = useState('');
  const [confirmingQuote, setConfirmingQuote] = useState(false);

  // Section ⑥ Order Conversion State
  const [convertingOrder, setConvertingOrder] = useState(false);

  // Section ⑧ Construction Schedule State
  const [constructionDate, setConstructionDate] = useState('');
  const [constructionTimeSlot, setConstructionTimeSlot] = useState('오전 (09:00~12:00)');
  const [constructionManager, setConstructionManager] = useState('');
  const [constructionPhone, setConstructionPhone] = useState('');
  const [constructionMemo, setConstructionMemo] = useState('');
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Authentication check
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      navigate('/');
    } else {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await getEstimateInquiries();
      setInquiries(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || '견적문의 목록을 가져오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChangeInList = async (inquiryId, newStatus) => {
    try {
      const updated = await updateEstimateInquiryStatus(inquiryId, newStatus);
      setInquiries(prev => prev.map(item => item.id === inquiryId ? { ...item, ...updated, status: newStatus } : item));
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry(prev => ({ ...prev, ...updated, status: newStatus }));
        setStatusInput(newStatus);
      }
    } catch (err) {
      alert(err.message || '상태 변경에 실패했습니다.');
    }
  };

  const handleSaveAdminControl = async () => {
    if (!selectedInquiry) return;
    setSavingMemo(true);
    setSaveSuccessMsg('');
    try {
      const updated = await updateEstimateInquiryAdminMemo(
        selectedInquiry.id, 
        adminMemoInput,
        {
          expectedUpdatedAt: selectedInquiry.updated_at,
          status: statusInput
        }
      );
      setInquiries(prev => prev.map(item => item.id === selectedInquiry.id ? { ...item, ...updated, status: statusInput } : item));
      setSelectedInquiry(prev => ({ ...prev, ...updated, status: statusInput }));
      setSaveSuccessMsg('상태 및 관리자 메모가 저장되었습니다.');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message || '저장에 실패했습니다.');
    } finally {
      setSavingMemo(false);
    }
  };

  const openModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setAdminMemoInput(inquiry.admin_memo || '');
    setStatusInput(inquiry.status || '신규 접수');
    setSaveSuccessMsg('');

    // Initialize item editing state
    const items = (inquiry.selected_items && inquiry.selected_items.length > 0)
      ? inquiry.selected_items
      : (inquiry.estimate_items || []);

    setEditingItems(items.map(item => ({
      ...item,
      quantity: Math.max(1, Number(item.quantity) || 1),
      unit_price: Math.max(0, Number(item.unit_price) || 0)
    })));

    // Initialize Section ⑤ Final Quote fields
    const matTotal = items.reduce((acc, i) => acc + ((Number(i.quantity) || 1) * (Number(i.unit_price) || 0)), 0);
    setMaterialFee(inquiry.material_fee !== undefined && inquiry.material_fee !== null ? Number(inquiry.material_fee) : matTotal);
    setSubMaterialFee(Number(inquiry.sub_material_fee) || 0);
    setConstructionFee(Number(inquiry.construction_fee) || 0);
    setDemolitionFee(Number(inquiry.demolition_fee) || 0);
    setTransportFee(Number(inquiry.transport_fee) || 0);
    setExtraFee(Number(inquiry.extra_fee) || 0);
    setDiscountFee(Number(inquiry.discount_fee) || 0);
    setValidUntil(inquiry.valid_until ? inquiry.valid_until.substring(0, 10) : '');
    setAdminQuoteMemo(inquiry.admin_quote_memo || '');

    // Initialize Section ⑧ Construction Schedule fields
    setConstructionDate(inquiry.construction_date ? inquiry.construction_date.substring(0, 10) : '');
    setConstructionTimeSlot(inquiry.construction_time_slot || '오전 (09:00~12:00)');
    setConstructionManager(inquiry.construction_manager || '');
    setConstructionPhone(inquiry.construction_phone || '');
    setConstructionMemo(inquiry.construction_memo || '');
  };

  const closeModal = () => {
    setSelectedInquiry(null);
  };

  const handleCopyPhone = (phoneNum) => {
    if (!phoneNum) return;
    navigator.clipboard.writeText(phoneNum);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Helper for updating individual item quantity or price
  const handleItemChange = (index, field, value) => {
    const numericVal = Math.max(0, Number(value) || 0);
    setEditingItems(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: numericVal,
        supply_amount: field === 'quantity'
          ? numericVal * copy[index].unit_price
          : numericVal * copy[index].quantity
      };
      // Auto-recalculate material fee if user hasn't explicitly customized fee breakdown
      const newMatFee = copy.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);
      setMaterialFee(newMatFee);
      return copy;
    });
  };

  // Save Item Qty & Price updates
  const handleSaveItems = async () => {
    if (!selectedInquiry) return;
    setSavingItems(true);
    try {
      const updated = await updateEstimateItems(selectedInquiry.id, editingItems);
      setSelectedInquiry(prev => ({ ...prev, ...updated, selected_items: editingItems }));
      setInquiries(prev => prev.map(i => i.id === selectedInquiry.id ? { ...i, selected_items: editingItems } : i));
      setSaveSuccessMsg('자재 품목 수량 및 단가가 수정되었습니다.');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message || '품목 수정 저장에 실패했습니다.');
    } finally {
      setSavingItems(false);
    }
  };

  // Calculate final amount dynamically
  const calculatedFinalAmount = (
    Number(materialFee) +
    Number(subMaterialFee) +
    Number(constructionFee) +
    Number(demolitionFee) +
    Number(transportFee) +
    Number(extraFee) -
    Number(discountFee)
  );

  // Section ⑤ Confirm Quote
  const handleConfirmQuote = async () => {
    if (!selectedInquiry) return;

    if (!selectedInquiry.customer_name || !selectedInquiry.phone) {
      alert('고객 정보(성함, 연락처)가 누락되어 견적을 확정할 수 없습니다.');
      return;
    }

    if (!editingItems || editingItems.length === 0) {
      alert('선택된 자재 품목이 없어 견적을 확정할 수 없습니다.');
      return;
    }

    const invalidItem = editingItems.find(i => Number(i.quantity) <= 0);
    if (invalidItem) {
      alert(`품목 '${invalidItem.product_name || invalidItem.name}'의 수량이 0 이하입니다. 수량을 확인해 주세요.`);
      return;
    }

    if (calculatedFinalAmount < 0) {
      alert('최종 견적 금액이 0원 미만일 수 없습니다. 할인 금액이나 견적 수치를 확인해 주세요.');
      return;
    }

    if (!window.confirm(`최종 견적 금액 ${calculatedFinalAmount.toLocaleString()}원으로 확정하시겠습니까?\n(견적 수정 확정 시 기존 고객 승인은 무효화되며 최신 버전으로 갱신됩니다.)`)) {
      return;
    }

    setConfirmingQuote(true);
    try {
      const quotePayload = {
        material_fee: Number(materialFee),
        sub_material_fee: Number(subMaterialFee),
        construction_fee: Number(constructionFee),
        demolition_fee: Number(demolitionFee),
        transport_fee: Number(transportFee),
        extra_fee: Number(extraFee),
        discount_fee: Number(discountFee),
        final_amount: calculatedFinalAmount,
        valid_until: validUntil || null,
        admin_quote_memo: adminQuoteMemo || '',
        items: editingItems
      };

      const updated = await confirmEstimateQuote(selectedInquiry.id, quotePayload, user);
      
      const newStatus = (selectedInquiry.status === '신규 접수' || selectedInquiry.status === '상담 중' || selectedInquiry.status === '접수')
        ? '견적 안내'
        : selectedInquiry.status;

      setSelectedInquiry(prev => ({
        ...prev,
        ...updated,
        quote_confirmed: true,
        final_amount: calculatedFinalAmount,
        status: newStatus,
        selected_items: editingItems
      }));

      setStatusInput(newStatus);

      setInquiries(prev => prev.map(i => i.id === selectedInquiry.id ? {
        ...i,
        ...updated,
        quote_confirmed: true,
        final_amount: calculatedFinalAmount,
        status: newStatus,
        selected_items: editingItems
      } : i));

      setSaveSuccessMsg('최종 견적이 확정되었습니다. (고객 안내 가능 상태)');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      alert(err.message || '견적 확정에 실패했습니다.');
    } finally {
      setConfirmingQuote(false);
    }
  };

  // Section ⑥ Convert to Order
  const handleConvertToOrder = async () => {
    if (!selectedInquiry) return;

    if (selectedInquiry.converted_order_id) {
      alert(`이미 주문으로 전환된 상담건입니다. (주문번호: ${selectedInquiry.converted_order_no || 'DK-주문'})`);
      return;
    }

    if (selectedInquiry.status !== '진행 확정' && !selectedInquiry.quote_confirmed && selectedInquiry.customer_response !== 'approved') {
      alert("상담 상태가 '진행 확정'이거나 고객이 진행 요청을 한 상담건만 주문으로 전환할 수 있습니다.");
      return;
    }

    if (!window.confirm("이 시공 상담건을 동경바닥재 '주문 접수'로 전환하시겠습니까?\n주문 전환 후 주문번호가 새로 생성되며 중복 전환은 방지됩니다.")) {
      return;
    }

    setConvertingOrder(true);
    try {
      const result = await convertEstimateToOrder(selectedInquiry.id, user);
      const createdOrder = result.order;
      const updatedEstimate = result.estimate;

      setSelectedInquiry(prev => ({
        ...prev,
        ...updatedEstimate,
        status: '진행 확정',
        converted_order_id: createdOrder.id,
        converted_order_no: createdOrder.order_no,
        converted_at: updatedEstimate.converted_at
      }));

      setStatusInput('진행 확정');

      setInquiries(prev => prev.map(i => i.id === selectedInquiry.id ? {
        ...i,
        ...updatedEstimate,
        status: '진행 확정',
        converted_order_id: createdOrder.id,
        converted_order_no: createdOrder.order_no,
        converted_at: updatedEstimate.converted_at
      } : i));

      setSaveSuccessMsg(`주문 전환이 완료되었습니다. (주문번호: ${createdOrder.order_no})`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert(err.message || '주문 전환에 실패했습니다.');
    } finally {
      setConvertingOrder(false);
    }
  };

  // Section ⑧ Save Construction Schedule
  const handleSaveSchedule = async () => {
    if (!selectedInquiry) return;
    setSavingSchedule(true);
    try {
      const updated = await updateConstructionSchedule(selectedInquiry.id, {
        construction_date: constructionDate,
        construction_time_slot: constructionTimeSlot,
        construction_manager: constructionManager,
        construction_phone: constructionPhone,
        construction_memo: constructionMemo
      }, user);

      setSelectedInquiry(prev => ({ ...prev, ...updated }));
      setInquiries(prev => prev.map(i => i.id === selectedInquiry.id ? { ...i, ...updated } : i));
      setSaveSuccessMsg('시공 일정이 저장되었습니다.');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message || '시공 일정 저장에 실패했습니다.');
    } finally {
      setSavingSchedule(false);
    }
  };

  const filteredInquiries = inquiries.filter(item => {
    let matchStatus = true;
    if (statusFilter !== '전체') {
      if (statusFilter === '고객 진행 요청') {
        matchStatus = item.customer_response === 'approved';
      } else {
        matchStatus = item.status === statusFilter;
      }
    }

    let matchSearch = true;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const firstItem = item.selected_items && item.selected_items.length > 0 ? item.selected_items[0] : null;
      const itemCode = firstItem ? (firstItem.code || firstItem.product_code || '') : '';
      const itemName = firstItem ? (firstItem.name || firstItem.product_name || '') : '';

      matchSearch =
        (item.estimate_no || '').toLowerCase().includes(q) ||
        (item.id || '').toLowerCase().includes(q) ||
        (item.customer_name || '').toLowerCase().includes(q) ||
        (item.phone || '').includes(q) ||
        (item.site_address || item.address || '').toLowerCase().includes(q) ||
        (item.request_memo || item.memo || '').toLowerCase().includes(q) ||
        itemCode.toLowerCase().includes(q) ||
        itemName.toLowerCase().includes(q);
    }
    return matchStatus && matchSearch;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case '신규 접수':
      case '접수대기':
      case '접수': 
        return 'badge-new';
      case '상담 중':
      case '상담중': 
        return 'badge-consult';
      case '견적 안내':
      case '견적완료': 
        return 'badge-quote';
      case '진행 확정':
      case '주문전환': 
        return 'badge-done';
      case '보류': 
        return 'badge-hold';
      case '취소': 
        return 'badge-cancel';
      default: 
        return 'badge-new';
    }
  };

  const newCount = inquiries.filter(i => i.status === '신규 접수' || i.status === '접수대기' || i.status === '접수').length;
  const customerApprovedCount = inquiries.filter(i => i.customer_response === 'approved').length;

  return (
    <MainLayout>
      <div className="admin-inquiries-page-container">
        <div className="admin-header-row">
          <div className="title-area">
            <div className="title-with-badge">
              <h1>시공 상담 접수 관리</h1>
              {newCount > 0 && <span className="new-count-badge">신규 {newCount}건</span>}
              {customerApprovedCount > 0 && <span className="approved-count-badge">고객 진행 요청 {customerApprovedCount}건</span>}
            </div>
            <p>고객이 접수한 시공 상담을 관리하고, 최종 견적 확정 및 고객 승인 후 주문으로 전환합니다.</p>
          </div>
          <button className="btn-refresh" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> 새로고침
          </button>
        </div>

        {errorMsg && <div className="error-banner"><AlertCircle size={18} /> {errorMsg}</div>}

        {/* Filters and Search */}
        <div className="admin-filter-bar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="고객명, 연락처, 제품코드, 주소 검색"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group-admin">
            <label><Filter size={16} /> 상태 필터:</label>
            <div className="filter-chips">
              {['전체', ...STATUS_OPTIONS].map(status => (
                <button
                  key={status}
                  className={`filter-chip ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table View (PC) & Card View (Mobile) */}
        <div className="admin-table-frame">
          {loading ? (
            <div className="admin-loading-indicator">
              <div className="spinner"></div>
              <p>시공 상담 접수 내역을 불러오는 중입니다...</p>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="admin-empty-table-state">
              <FileText size={48} className="empty-icon" />
              <h3>접수된 시공 상담 내역이 없습니다.</h3>
              <p>검색어나 상태 필터를 다르게 지정해 보세요.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <table className="admin-data-table desktop-only-table">
                <thead>
                  <tr>
                    <th>접수일시</th>
                    <th>고객명</th>
                    <th>연락처</th>
                    <th>현장 위치</th>
                    <th>선택 자재 / 코드</th>
                    <th>최종 견적 금액</th>
                    <th>상담 진행 상태</th>
                    <th>상세 관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.map(item => {
                    const firstItem = item.selected_items && item.selected_items.length > 0 ? item.selected_items[0] : null;
                    const materialName = firstItem ? (firstItem.name || firstItem.product_name || '자재 선택') : '선택 자재 없음';
                    const materialCode = firstItem ? (firstItem.code || firstItem.product_code || '') : '';
                    const extraCount = item.selected_items && item.selected_items.length > 1 ? ` 외 ${item.selected_items.length - 1}건` : '';
                    const displayTotal = item.final_amount && Number(item.final_amount) > 0
                      ? Number(item.final_amount)
                      : (item.total && Number(item.total) > 0 ? Number(item.total) : 0);

                    return (
                      <tr key={item.id}>
                        <td className="td-date">
                          {new Date(item.created_at).toLocaleDateString('ko-KR')} <br />
                          <small className="text-muted">{new Date(item.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</small>
                        </td>
                        <td className="td-name font-semibold">
                          {item.customer_name || '미입력'}
                          {item.user_id ? (
                            <span className="badge-member-tag" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', display: 'inline-block' }}>회원 접수</span>
                          ) : (
                            <span className="badge-guest-tag" style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '11px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', display: 'inline-block' }}>비회원 접수</span>
                          )}
                        </td>
                        <td className="td-phone font-mono">{item.phone || '미입력'}</td>
                        <td className="td-address" title={item.site_address || item.address}>
                          {item.site_address || item.address || '미입력'}
                        </td>
                        <td className="td-material">
                          <div className="mat-name-box font-semibold">{materialName}{extraCount}</div>
                          {materialCode && <small className="text-muted">코드: {materialCode}</small>}
                        </td>
                        <td className="td-type font-mono font-semibold">
                          {displayTotal > 0 ? `${displayTotal.toLocaleString()}원` : <span className="text-muted">견적 산정 전</span>}
                        </td>
                        <td className="td-status">
                          <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                            {item.status}
                          </span>
                          {item.customer_response === 'approved' && <span className="customer-approved-badge"><CheckCircle2 size={12} /> 고객 진행 요청</span>}
                          {item.customer_response === 'on_hold' && <span className="customer-hold-badge">고객 보류</span>}
                          {item.converted_order_id && <span className="converted-order-badge">주문전환</span>}
                        </td>
                        <td className="td-action">
                          <button className="btn-table-action" onClick={() => openModal(item)}>
                            상세보기
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile Card List */}
              <div className="mobile-cards-list mobile-only-cards">
                {filteredInquiries.map(item => {
                  const firstItem = item.selected_items && item.selected_items.length > 0 ? item.selected_items[0] : null;
                  const materialName = firstItem ? (firstItem.name || firstItem.product_name || '자재 선택') : '선택 자재 없음';
                  const materialCode = firstItem ? (firstItem.code || firstItem.product_code || '') : '';
                  const displayTotal = item.final_amount && Number(item.final_amount) > 0 ? Number(item.final_amount) : (item.total || 0);

                  return (
                    <div key={item.id} className="mobile-inquiry-card" onClick={() => openModal(item)}>
                      <div className="card-top-row">
                        <span className="card-date">{new Date(item.created_at).toLocaleDateString('ko-KR')}</span>
                        <div className="badge-wrap">
                          <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                            {item.status}
                          </span>
                          {item.customer_response === 'approved' && <span className="customer-approved-badge"><CheckCircle2 size={12} /> 고객 진행 요청</span>}
                          {item.converted_order_id && <span className="converted-order-badge">주문전환</span>}
                        </div>
                      </div>
                      <div className="card-main-info">
                        <strong className="card-cust-name">{item.customer_name || '미입력'}</strong>
                        <span className="card-cust-phone">{item.phone || '미입력'}</span>
                      </div>
                      <div className="card-material-row">
                        <span>선택 자재:</span>
                        <strong>{materialName} {materialCode ? `(${materialCode})` : ''}</strong>
                      </div>
                      <div className="card-location-row">
                        <span>현장:</span>
                        <span>{item.site_address || item.address || '미입력'} ({item.area_pyeong ? `${item.area_pyeong}평` : '미입력'})</span>
                      </div>
                      {displayTotal > 0 && (
                        <div className="card-amount-row font-mono">
                          <span>최종 견적:</span>
                          <strong>{displayTotal.toLocaleString()}원</strong>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Detail Modal */}
        {selectedInquiry && (
          <div className="admin-detail-modal-overlay" onClick={closeModal}>
            <div className="admin-detail-modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header-row">
                <h2>
                  시공 상담 상세 내역 [{selectedInquiry.estimate_no || selectedInquiry.id.substring(0, 8)}]
                  {selectedInquiry.quote_confirmed && <span className="quote-confirmed-tag"><CheckCircle2 size={14} /> 견적 확정됨 (v{selectedInquiry.quote_version || 1})</span>}
                </h2>
                <button className="btn-modal-close" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body-scrollable">
                <div className="modal-split-layout">
                  {/* Left Column: Sections ①, ②, ③, ⑤ */}
                  <div className="modal-left-column">
                    
                    {/* Section ①: 고객 정보 */}
                    <section className="detail-section">
                      <h3><User size={16} /> ① 고객 정보</h3>
                      <table className="detail-info-table">
                        <tbody>
                          <tr>
                            <th>고객명</th>
                            <td>{selectedInquiry.customer_name || '미입력'}</td>
                            <th>연락처</th>
                            <td>
                              <div className="phone-action-cell">
                                <span>{selectedInquiry.phone || '미입력'}</span>
                                {selectedInquiry.phone && (
                                  <div className="phone-btn-group">
                                    <button 
                                      type="button" 
                                      className="btn-tiny-icon" 
                                      onClick={() => handleCopyPhone(selectedInquiry.phone)}
                                      title="연락처 복사"
                                    >
                                      <Copy size={13} /> {copiedPhone ? '복사됨' : '복사'}
                                    </button>
                                    <a 
                                      href={`tel:${selectedInquiry.phone}`} 
                                      className="btn-tiny-icon phone-link"
                                      title="전화 걸기"
                                    >
                                      <Phone size={13} /> 전화연결
                                    </a>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <th>이메일</th>
                            <td>{selectedInquiry.email || '미입력'}</td>
                            <th>고객 구분</th>
                            <td>{selectedInquiry.customer_type || '미선택'}</td>
                          </tr>
                          <tr>
                            <th>선호 상담 방식</th>
                            <td colSpan="3">
                              <strong className="highlight-text">{selectedInquiry.consultation_type || selectedInquiry.extra_options?.consultation_type || '전화 상담'}</strong>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </section>

                    {/* Section ②: 현장 정보 */}
                    <section className="detail-section">
                      <h3><Building size={16} /> ② 현장 정보</h3>
                      <table className="detail-info-table">
                        <tbody>
                          <tr>
                            <th>현장 주소</th>
                            <td colSpan="3">
                              {selectedInquiry.site_address || selectedInquiry.address || '미입력'}
                              {selectedInquiry.site_detail_address && ` (${selectedInquiry.site_detail_address})`}
                            </td>
                          </tr>
                          <tr>
                            <th>시공 면적</th>
                            <td>{selectedInquiry.area_pyeong ? `${selectedInquiry.area_pyeong}평` : '미입력'}</td>
                            <th>희망 일정</th>
                            <td>{selectedInquiry.preferred_date || selectedInquiry.desired_date ? new Date(selectedInquiry.preferred_date || selectedInquiry.desired_date).toLocaleDateString('ko-KR') : '미선택'}</td>
                          </tr>
                          <tr>
                            <th>현장 유형</th>
                            <td>{selectedInquiry.site_type || selectedInquiry.space_type || '미선택'}</td>
                            <th>작업 구분</th>
                            <td>{selectedInquiry.work_type || '미선택'}</td>
                          </tr>
                          <tr>
                            <th>기존 바닥 철거</th>
                            <td>{selectedInquiry.demolition || '미선택'}</td>
                            <th>엘리베이터</th>
                            <td>{selectedInquiry.has_elevator === true ? '있음' : selectedInquiry.has_elevator === false ? '없음' : (selectedInquiry.elevator || '미선택')}</td>
                          </tr>
                          <tr>
                            <th>주차 여부</th>
                            <td>{selectedInquiry.parking_available === true ? '가능' : selectedInquiry.parking_available === false ? '불가' : (selectedInquiry.parking || '미선택')}</td>
                            <th>시공 공간 내 짐</th>
                            <td>{selectedInquiry.has_luggage === true ? '있음' : selectedInquiry.has_luggage === false ? '없음' : (selectedInquiry.luggage || '미선택')}</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Accessories & Custom Input */}
                      {(selectedInquiry.accessory_options?.length > 0 || selectedInquiry.extra_accessory_text) && (
                        <div className="extra-options-box" style={{ marginTop: '12px' }}>
                          {selectedInquiry.accessory_options?.length > 0 && (
                            <div className="option-row">
                              <span>부자재 추천 선택:</span> <strong>{selectedInquiry.accessory_options.join(', ')}</strong>
                            </div>
                          )}
                          {selectedInquiry.extra_accessory_text && (
                            <div className="option-row">
                              <span>직접 입력 부자재:</span> <strong>{selectedInquiry.extra_accessory_text}</strong>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Customer Request Memo */}
                      <div className="customer-memo-box" style={{ marginTop: '12px' }}>
                        <span className="memo-label font-semibold">고객 요청사항:</span>
                        <div className="memo-text">
                          {selectedInquiry.request_memo || selectedInquiry.memo || '고객이 입력한 별도의 요청사항이 없습니다.'}
                        </div>
                      </div>
                    </section>

                    {/* Section ③: 선택 자재 (수량 및 단가 관리자 수정 지원) */}
                    <section className="detail-section">
                      <div className="section-header-flex">
                        <h3><Layers size={16} /> ③ 선택 자재 및 품목 단가 수정</h3>
                        <button
                          type="button"
                          className="btn-save-items-inline"
                          onClick={handleSaveItems}
                          disabled={savingItems}
                        >
                          <Edit3 size={14} /> {savingItems ? '품목 저장 중...' : '수량/단가 저장'}
                        </button>
                      </div>

                      {(!editingItems || editingItems.length === 0) ? (
                        <div className="empty-items-notice">선택한 자재가 없습니다.</div>
                      ) : (
                        <div className="modal-items-editable-list">
                          {editingItems.map((item, idx) => (
                            <div key={idx} className="editable-item-card">
                              <div className="item-thumbnail-wrapper">
                                <img
                                  src={item.thumbnail || item.thumbnail_url || item.image_url || '/images/no-image.svg'}
                                  alt={item.product_name || item.name}
                                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-material.jpg'; }}
                                />
                              </div>
                              <div className="editable-item-main">
                                <div className="item-brand-cat">
                                  <span>[{item.brand || '기타'}]</span> <span>{item.category || '자재'}</span>
                                </div>
                                <h4 className="item-name">{item.product_name || item.name}</h4>
                                <div className="item-specs-sub">
                                  <span>코드: {item.product_code || item.code || '-'}</span> | 
                                  <span> 규격: {item.spec || item.size || '-'}</span> | 
                                  <span> 단위: {item.unit || '평'}</span>
                                </div>
                              </div>
                              <div className="editable-item-inputs">
                                <div className="input-pair">
                                  <label>수량 ({item.unit || '평'})</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                                  />
                                </div>
                                <div className="input-pair">
                                  <label>확정 단가 (원)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={item.unit_price}
                                    onChange={e => handleItemChange(idx, 'unit_price', e.target.value)}
                                  />
                                </div>
                                <div className="calculated-item-total">
                                  <span className="total-label">소계:</span>
                                  <strong className="font-mono">{((Number(item.quantity) || 1) * (Number(item.unit_price) || 0)).toLocaleString()}원</strong>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* Section ⑤: 최종 견적 (관리자 수치 입력, 자동 계산, [견적 확정]) */}
                    <section className="detail-section final-quote-section">
                      <h3><Calculator size={16} /> ⑤ 최종 견적 확정 산정</h3>
                      <p className="section-subtext">상담 후 산정된 항목별 세부 금액을 입력하세요. 최종 금액은 자동 계산됩니다.</p>
                      
                      <div className="quote-grid-inputs">
                        <div className="quote-input-group">
                          <label>자재비 (원)</label>
                          <input
                            type="number"
                            min="0"
                            value={materialFee}
                            onChange={e => setMaterialFee(Math.max(0, Number(e.target.value) || 0))}
                          />
                          <span className="comma-preview">{Number(materialFee).toLocaleString()} 원</span>
                        </div>

                        <div className="quote-input-group">
                          <label>부자재비 (원)</label>
                          <input
                            type="number"
                            min="0"
                            value={subMaterialFee}
                            onChange={e => setSubMaterialFee(Math.max(0, Number(e.target.value) || 0))}
                          />
                          <span className="comma-preview">{Number(subMaterialFee).toLocaleString()} 원</span>
                        </div>

                        <div className="quote-input-group">
                          <label>시공비 (원)</label>
                          <input
                            type="number"
                            min="0"
                            value={constructionFee}
                            onChange={e => setConstructionFee(Math.max(0, Number(e.target.value) || 0))}
                          />
                          <span className="comma-preview">{Number(constructionFee).toLocaleString()} 원</span>
                        </div>

                        <div className="quote-input-group">
                          <label>철거비 (원)</label>
                          <input
                            type="number"
                            min="0"
                            value={demolitionFee}
                            onChange={e => setDemolitionFee(Math.max(0, Number(e.target.value) || 0))}
                          />
                          <span className="comma-preview">{Number(demolitionFee).toLocaleString()} 원</span>
                        </div>

                        <div className="quote-input-group">
                          <label>운반비 (원)</label>
                          <input
                            type="number"
                            min="0"
                            value={transportFee}
                            onChange={e => setTransportFee(Math.max(0, Number(e.target.value) || 0))}
                          />
                          <span className="comma-preview">{Number(transportFee).toLocaleString()} 원</span>
                        </div>

                        <div className="quote-input-group">
                          <label>기타 비용 (원)</label>
                          <input
                            type="number"
                            min="0"
                            value={extraFee}
                            onChange={e => setExtraFee(Math.max(0, Number(e.target.value) || 0))}
                          />
                          <span className="comma-preview">{Number(extraFee).toLocaleString()} 원</span>
                        </div>

                        <div className="quote-input-group highlight-discount">
                          <label>할인 금액 (-원)</label>
                          <input
                            type="number"
                            min="0"
                            value={discountFee}
                            onChange={e => setDiscountFee(Math.max(0, Number(e.target.value) || 0))}
                          />
                          <span className="comma-preview text-red">-{Number(discountFee).toLocaleString()} 원</span>
                        </div>

                        <div className="quote-input-group">
                          <label>견적 유효기간</label>
                          <input
                            type="date"
                            value={validUntil}
                            onChange={e => setValidUntil(e.target.value)}
                          />
                          <span className="comma-preview">{validUntil ? `${validUntil} 까지` : '유효기간 미지정'}</span>
                        </div>
                      </div>

                      {/* Final Calculated Amount Highlight Banner */}
                      <div className="quote-calc-result-banner">
                        <div className="calc-formula">
                          (자재비 {Number(materialFee).toLocaleString()} + 부자재비 {Number(subMaterialFee).toLocaleString()} + 시공비 {Number(constructionFee).toLocaleString()} + 철거비 {Number(demolitionFee).toLocaleString()} + 운반비 {Number(transportFee).toLocaleString()} + 기타 {Number(extraFee).toLocaleString()}) - 할인 {Number(discountFee).toLocaleString()}
                        </div>
                        <div className="calc-final-row">
                          <span className="label">최종 견적 금액:</span>
                          <strong className="final-total-price font-mono">{calculatedFinalAmount.toLocaleString()} 원</strong>
                        </div>
                      </div>

                      <div className="quote-memo-box">
                        <label className="font-semibold">관리자 견적 특이사항 / 견적 메모</label>
                        <textarea
                          rows={3}
                          placeholder="특약 조건, 특이 자재 수급 상황, 고객 조율 내용 등 견적 관련 메모를 입력하세요."
                          value={adminQuoteMemo}
                          onChange={e => setAdminQuoteMemo(e.target.value)}
                        />
                      </div>

                      <div className="confirm-quote-action-row">
                        <button
                          type="button"
                          className="btn-confirm-quote"
                          onClick={handleConfirmQuote}
                          disabled={confirmingQuote}
                        >
                          <CheckCircle2 size={16} /> {confirmingQuote ? '견적 확정 중...' : '최종 견적 확정'}
                        </button>
                      </div>
                    </section>

                    {/* Section ⑧: 시공 일정 확정 영역 */}
                    <section className="detail-section construction-schedule-section">
                      <h3><CalendarCheck size={16} /> ⑧ 시공 일정 확정</h3>
                      <div className="schedule-form-grid">
                        <div className="input-group">
                          <label>시공 예정일</label>
                          <input
                            type="date"
                            value={constructionDate}
                            onChange={e => setConstructionDate(e.target.value)}
                          />
                        </div>
                        <div className="input-group">
                          <label>시공 시간대</label>
                          <select
                            value={constructionTimeSlot}
                            onChange={e => setConstructionTimeSlot(e.target.value)}
                          >
                            <option value="오전 (09:00~12:00)">오전 (09:00~12:00)</option>
                            <option value="오후 (13:00~17:00)">오후 (13:00~17:00)</option>
                            <option value="종일 시공">종일 시공 (09:00~18:00)</option>
                            <option value="상담 후 결정">상담 후 결정</option>
                          </select>
                        </div>
                        <div className="input-group">
                          <label>담당 시공 팀장/기사</label>
                          <input
                            type="text"
                            placeholder="예: 김동경 팀장"
                            value={constructionManager}
                            onChange={e => setConstructionManager(e.target.value)}
                          />
                        </div>
                        <div className="input-group">
                          <label>담당자 연락처</label>
                          <input
                            type="text"
                            placeholder="010-0000-0000"
                            value={constructionPhone}
                            onChange={e => setConstructionPhone(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="input-group full mt-2">
                        <label>시공 일정 메모 / 특이사항</label>
                        <input
                          type="text"
                          placeholder="시공 현장 전력 공급, 자재 대기 장소 등 특이사항 기재"
                          value={constructionMemo}
                          onChange={e => setConstructionMemo(e.target.value)}
                        />
                      </div>
                      <div className="schedule-action-row mt-3">
                        <button
                          type="button"
                          className="btn-save-schedule"
                          onClick={handleSaveSchedule}
                          disabled={savingSchedule}
                        >
                          <CalendarCheck size={14} /> {savingSchedule ? '일정 저장 중...' : '시공 일정 저장'}
                        </button>
                      </div>
                    </section>

                  </div>

                  {/* Right Column: Sections ④, ⑦, ⑥ */}
                  <div className="modal-right-column">
                    <div className="control-sticky-card">
                      <h3>④ 상담 진행 & 관리자 내부 메모</h3>
                      
                      <div className="control-group">
                        <label className="font-semibold">상담 진행 상태</label>
                        <select
                          value={statusInput}
                          onChange={e => setStatusInput(e.target.value)}
                          className={`status-select ${getStatusBadgeClass(statusInput)}`}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div className="control-group">
                        <label className="font-semibold">관리자 전용 내부 메모 (고객 비노출)</label>
                        <textarea
                          rows={6}
                          placeholder="고객과의 유선/카톡 상담 내용, 현장 특이사항 등을 기록하세요."
                          value={adminMemoInput}
                          onChange={e => setAdminMemoInput(e.target.value)}
                        />
                      </div>

                      {selectedInquiry.updated_at && (
                        <div className="last-updated-tag">
                          <Clock size={13} /> 최근 수정: {new Date(selectedInquiry.updated_at).toLocaleString('ko-KR')}
                        </div>
                      )}

                      {saveSuccessMsg && (
                        <div className="save-success-banner">
                          <CheckCircle size={16} /> {saveSuccessMsg}
                        </div>
                      )}

                      <button
                        type="button"
                        className="btn-save-admin-memo"
                        onClick={handleSaveAdminControl}
                        disabled={savingMemo}
                      >
                        {savingMemo ? '저장 중...' : '상태 및 메모 저장'}
                      </button>

                      <hr className="divider-hr" />

                      {/* Section ⑦: 고객 견적 응답 현황 */}
                      <div className="customer-response-card">
                        <h3>⑦ 고객 견적 응답 현황</h3>
                        {selectedInquiry.customer_response === 'approved' ? (
                          <div className="cust-response-box approved">
                            <div className="resp-status">
                              <UserCheck size={16} className="text-green" />
                              <strong>고객 진행 요청 완료</strong>
                            </div>
                            <div className="resp-meta font-mono">
                              <div>승인일시: {selectedInquiry.customer_approved_at ? new Date(selectedInquiry.customer_approved_at).toLocaleString('ko-KR') : '-'}</div>
                              <div>승인금액: {selectedInquiry.approved_amount ? `${Number(selectedInquiry.approved_amount).toLocaleString()}원` : '-'} (v{selectedInquiry.approved_quote_version || 1})</div>
                            </div>
                            {selectedInquiry.schedule_request_note && (
                              <div className="schedule-request-box">
                                <span>고객 일정 변경 요청:</span>
                                <strong>"{selectedInquiry.schedule_request_note}"</strong>
                              </div>
                            )}
                          </div>
                        ) : selectedInquiry.customer_response === 'on_hold' ? (
                          <div className="cust-response-box hold">
                            <div className="resp-status">
                              <Clock size={16} className="text-orange" />
                              <strong>고객 요청으로 보류</strong>
                            </div>
                            <small className="text-muted">고객이 마이페이지에서 견적을 보류 처리했습니다.</small>
                          </div>
                        ) : (
                          <div className="cust-response-box pending">
                            <div className="resp-status">
                              <Clock size={16} className="text-gray" />
                              <strong>고객 응답 대기 중</strong>
                            </div>
                            <small className="text-muted">고객이 마이페이지에서 견적을 확인 중입니다.</small>
                          </div>
                        )}
                      </div>

                      <hr className="divider-hr" />

                      {/* Section ⑥: 주문으로 전환 */}
                      <div className="order-conversion-card">
                        <h3>⑥ 주문 전환 처리</h3>

                        {selectedInquiry.converted_order_id ? (
                          <div className="converted-info-box">
                            <div className="converted-header">
                              <CheckCircle2 size={18} className="text-green" />
                              <strong>주문 전환 완료됨</strong>
                            </div>
                            <div className="converted-meta font-mono">
                              <div>주문번호: <strong>{selectedInquiry.converted_order_no || 'DK-주문'}</strong></div>
                              <div>전환일시: {new Date(selectedInquiry.converted_at || selectedInquiry.updated_at).toLocaleString('ko-KR')}</div>
                            </div>
                            <button
                              type="button"
                              className="btn-view-converted-order"
                              onClick={() => {
                                navigate(`/admin/orders?highlight=${selectedInquiry.converted_order_id}`);
                              }}
                            >
                              <ExternalLink size={14} /> 주문 보기
                            </button>
                          </div>
                        ) : (
                          <div className="conversion-action-box">
                            <p className="conversion-desc">
                              상담 상태가 <strong>[진행 확정]</strong>이거나 고객 진행 요청이 완료된 견적을 정식 주문으로 전환합니다.
                            </p>
                            <button
                              type="button"
                              className="btn-convert-to-order"
                              onClick={handleConvertToOrder}
                              disabled={convertingOrder || (statusInput !== '진행 확정' && selectedInquiry.customer_response !== 'approved')}
                            >
                              <ShoppingBag size={16} /> {convertingOrder ? '주문 생성 중...' : '주문으로 전환'}
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
