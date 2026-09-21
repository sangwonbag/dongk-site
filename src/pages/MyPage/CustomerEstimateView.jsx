import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { getCurrentUser } from '../../lib/auth';
import {
  getCustomerEstimateById,
  approveEstimateByCustomer,
  holdEstimateByCustomer
} from '../../services/estimateInquiryService';
import {
  FileText,
  User,
  MapPin,
  Calendar,
  Building,
  Layers,
  Calculator,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  Search,
  Check,
  X
} from 'lucide-react';
import './CustomerEstimateView.css';

export default function CustomerEstimateView({ estimateData: propEstimate, isModal = false, onClose }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [estimate, setEstimate] = useState(propEstimate || null);
  const [loading, setLoading] = useState(!propEstimate);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal / Confirm state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [scheduleNoteInput, setScheduleNoteInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Guest lookup modal state
  const [guestEstNo, setGuestEstNo] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (propEstimate) {
      setEstimate(propEstimate);
      setLoading(false);
      return;
    }

    if (id) {
      fetchEstimate(id);
    }
  }, [id, propEstimate]);

  const fetchEstimate = async (targetId, guestCreds = null) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await getCustomerEstimateById(targetId || id, currentUser, guestCreds);
      setEstimate(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || '견적 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSearch = async (e) => {
    e.preventDefault();
    if (!guestPhone.trim()) {
      alert('연락처를 입력해주세요.');
      return;
    }
    await fetchEstimate(id, { estimate_no: guestEstNo.trim(), phone: guestPhone.trim() });
  };

  const handleApprove = async () => {
    if (!estimate) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const updated = await approveEstimateByCustomer(
        estimate.id,
        {
          schedule_request_note: scheduleNoteInput,
          expected_version: estimate.quote_version || 1
        },
        currentUser,
        guestPhone ? { phone: guestPhone } : null
      );
      setEstimate(updated);
      setShowConfirmModal(false);
      setSuccessMsg('시공 진행 요청이 성공적으로 완료되었습니다. 관리자 확인 후 일정이 확정됩니다.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || '승인 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHold = async () => {
    if (!estimate) return;
    if (!window.confirm('견적 건을 보류 상태로 변경하시겠습니까? 추후 언제든지 상담원과 재조율이 가능합니다.')) {
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const updated = await holdEstimateByCustomer(estimate.id, currentUser, guestPhone ? { phone: guestPhone } : null);
      setEstimate(updated);
      setSuccessMsg('견적건이 보류로 변경되었습니다.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || '보류 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status, response) => {
    if (response === 'approved') return 'badge-customer-approved';
    if (response === 'on_hold') return 'badge-customer-hold';
    switch (status) {
      case '견적 안내': return 'badge-quote-ready';
      case '진행 확정': return 'badge-confirmed';
      case '보류': return 'badge-customer-hold';
      default: return 'badge-default';
    }
  };

  const itemsList = (estimate?.selected_items && estimate.selected_items.length > 0)
    ? estimate.selected_items
    : (estimate?.estimate_items || []);

  const displayTotal = estimate?.final_amount && Number(estimate.final_amount) > 0
    ? Number(estimate.final_amount)
    : (estimate?.total && Number(estimate.total) > 0 ? Number(estimate.total) : 0);

  const viewContent = (
    <div className="customer-quote-card-wrapper">
      {!isModal && (
        <div className="quote-nav-header">
          <button className="btn-back" onClick={() => navigate('/mypage')}>
            <ChevronLeft size={18} /> 마이페이지로 돌아가기
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="quote-error-banner">
          <AlertTriangle size={20} />
          <div>
            <strong>견적 조회 오류:</strong> {errorMsg}
          </div>
        </div>
      )}

      {/* Guest Authentication Form if unauthorized */}
      {!estimate && !loading && errorMsg.includes('접근 권한') && (
        <div className="guest-lookup-box">
          <h3>비회원 시공 견적 조회</h3>
          <p>접수 당시 입력하신 연락처와 견적번호로 조회하실 수 있습니다.</p>
          <form onSubmit={handleGuestSearch} className="guest-lookup-form">
            <div className="form-group">
              <label>연락처 (- 없이 입력)</label>
              <input
                type="text"
                placeholder="01012345678"
                value={guestPhone}
                onChange={e => setGuestPhone(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-guest-search">
              <Search size={16} /> 견적 조회
            </button>
          </form>
        </div>
      )}

      {estimate && (
        <div className="quote-document-container">
          {/* Document Header */}
          <div className="quote-doc-header">
            <div className="doc-brand">
              <span className="brand-badge font-bold">동경바닥재</span>
              <h2>시공 견적 확인서</h2>
              <span className="quote-no-tag font-mono">[{estimate.estimate_no || estimate.id.substring(0, 8)}]</span>
            </div>
            <div className="doc-status-block">
              <span className={`status-pill ${getStatusBadgeClass(estimate.status, estimate.customer_response)}`}>
                {estimate.customer_response === 'approved' ? '진행 요청 완료' : (estimate.customer_response === 'on_hold' ? '고객 보류' : (estimate.status || '견적 안내'))}
              </span>
              {estimate.quote_version && <small className="version-tag">버전 v{estimate.quote_version}</small>}
            </div>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="quote-success-banner">
              <CheckCircle2 size={18} /> {successMsg}
            </div>
          )}

          {/* Expiration Notice Banner */}
          {estimate.is_expired && (
            <div className="quote-warning-banner">
              <Clock size={18} /> 견적 유효기간({estimate.valid_until ? new Date(estimate.valid_until).toLocaleDateString('ko-KR') : '만료됨'})이 경과하여 진행 요청이 불가합니다. 관리자에게 재견적을 요청해 주세요.
            </div>
          )}

          {/* Version Mismatch Banner */}
          {estimate.version_mismatch && (
            <div className="quote-warning-banner">
              <AlertTriangle size={18} /> 견적 수량/금액 항목이 수정되어 최신 버전(v{estimate.quote_version})으로 갱신되었습니다. 내용을 확인하신 후 다시 진행 요청을 클릭해 주세요.
            </div>
          )}

          {/* Section 1: Customer & Site Info */}
          <div className="quote-section-grid">
            <div className="quote-info-card">
              <h4><User size={15} /> 고객 및 신청 정보</h4>
              <div className="info-kv-row">
                <span>성함:</span> <strong>{estimate.customer_name || '고객'}님</strong>
              </div>
              <div className="info-kv-row">
                <span>연락처:</span> <strong className="font-mono">{estimate.phone || '-'}</strong>
              </div>
              <div className="info-kv-row">
                <span>접수일자:</span> <span>{new Date(estimate.created_at).toLocaleDateString('ko-KR')}</span>
              </div>
              {estimate.quote_confirmed_at && (
                <div className="info-kv-row">
                  <span>견적확정일:</span> <span>{new Date(estimate.quote_confirmed_at).toLocaleDateString('ko-KR')}</span>
                </div>
              )}
              {estimate.valid_until && (
                <div className="info-kv-row">
                  <span>유효기간:</span> <strong className="text-blue">{new Date(estimate.valid_until).toLocaleDateString('ko-KR')} 까지</strong>
                </div>
              )}
            </div>

            <div className="quote-info-card">
              <h4><Building size={15} /> 현장 및 시공 정보</h4>
              <div className="info-kv-row">
                <span>현장주소:</span> <strong>{estimate.site_address || estimate.address || '미입력'} {estimate.site_detail_address || ''}</strong>
              </div>
              <div className="info-kv-row">
                <span>시공면적:</span> <strong>{estimate.area_pyeong ? `${estimate.area_pyeong}평` : '미입력'}</strong>
              </div>
              <div className="info-kv-row">
                <span>희망시공일:</span> <strong>{estimate.preferred_date ? new Date(estimate.preferred_date).toLocaleDateString('ko-KR') : '상담 후 결정'}</strong>
              </div>
              <div className="info-kv-row">
                <span>현장유형:</span> <span>{estimate.site_type || '아파트/주택'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Selected Items */}
          <div className="quote-items-section">
            <h4><Layers size={15} /> 선택 자재 및 구성 품목</h4>
            {itemsList.length === 0 ? (
              <div className="empty-items-text">선택된 자재 품목이 없습니다.</div>
            ) : (
              <div className="table-responsive-wrapper">
                <table className="customer-items-table">
                  <thead>
                    <tr>
                      <th>자재명</th>
                      <th>제품코드</th>
                      <th>규격</th>
                      <th>수량</th>
                      <th>단가</th>
                      <th>소계</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsList.map((item, idx) => (
                      <tr key={idx}>
                        <td className="td-item-name">
                          <strong>{item.product_name || item.name}</strong>
                          {item.brand && <small className="text-muted"> [{item.brand}]</small>}
                        </td>
                        <td className="td-code font-mono">{item.product_code || item.code || '-'}</td>
                        <td className="td-spec">{item.spec || item.size || '-'}</td>
                        <td className="td-qty font-mono">{item.quantity} {item.unit || '평'}</td>
                        <td className="td-price font-mono">{(Number(item.unit_price) || 0).toLocaleString()}원</td>
                        <td className="td-total font-mono font-bold">{((Number(item.quantity) || 1) * (Number(item.unit_price) || 0)).toLocaleString()}원</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: Final Quote Breakdown & Grand Total */}
          <div className="quote-breakdown-section">
            <h4><Calculator size={15} /> 최종 견적 세부 항목</h4>
            <div className="breakdown-grid">
              <div className="breakdown-row">
                <span>자재비</span>
                <strong className="font-mono">{(Number(estimate.material_fee) || 0).toLocaleString()} 원</strong>
              </div>
              <div className="breakdown-row">
                <span>부자재비</span>
                <strong className="font-mono">{(Number(estimate.sub_material_fee) || 0).toLocaleString()} 원</strong>
              </div>
              <div className="breakdown-row">
                <span>시공비 (인건비)</span>
                <strong className="font-mono">{(Number(estimate.construction_fee) || 0).toLocaleString()} 원</strong>
              </div>
              <div className="breakdown-row">
                <span>철거비</span>
                <strong className="font-mono">{(Number(estimate.demolition_fee) || 0).toLocaleString()} 원</strong>
              </div>
              <div className="breakdown-row">
                <span>운반비 (물류)</span>
                <strong className="font-mono">{(Number(estimate.transport_fee) || 0).toLocaleString()} 원</strong>
              </div>
              <div className="breakdown-row">
                <span>기타 비용</span>
                <strong className="font-mono">{(Number(estimate.extra_fee) || 0).toLocaleString()} 원</strong>
              </div>
              {Number(estimate.discount_fee) > 0 && (
                <div className="breakdown-row discount-row">
                  <span>할인 금액</span>
                  <strong className="font-mono text-red">-(Number(estimate.discount_fee)).toLocaleString() 원</strong>
                </div>
              )}
            </div>

            {/* GRAND TOTAL HIGHLIGHT BANNER */}
            <div className="customer-grand-total-banner">
              <div className="banner-left">
                <span className="total-title">최종 시공 견적 금액</span>
                <small className="total-desc">VAT 포함 / 맞춤 시공 서비스 일체 포함</small>
              </div>
              <div className="banner-right font-mono">
                <strong className="grand-total-price">{displayTotal.toLocaleString()} 원</strong>
              </div>
            </div>
          </div>

          {/* Customer Actions Area */}
          <div className="quote-customer-actions-area">
            {estimate.customer_response === 'approved' ? (
              <div className="approved-badge-banner">
                <CheckCircle2 size={20} className="text-green" />
                <div>
                  <strong>시공 진행 요청 완료</strong>
                  <p>
                    승인일시: {estimate.customer_approved_at ? new Date(estimate.customer_approved_at).toLocaleString('ko-KR') : '-'}
                    {estimate.approved_amount && ` (승인금액: ${Number(estimate.approved_amount).toLocaleString()}원)`}
                  </p>
                  <small className="text-muted">담당 직원이 확인 후 유선 연락하여 정식 계약 체결 및 일정을 확정해 드립니다.</small>
                </div>
              </div>
            ) : (
              <div className="buttons-action-row">
                <button
                  type="button"
                  className="btn-customer-hold"
                  onClick={handleHold}
                  disabled={submitting || estimate.is_expired}
                >
                  <Clock size={16} /> 조금 더 고민할게요
                </button>

                <button
                  type="button"
                  className="btn-customer-approve"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={submitting || estimate.is_expired}
                >
                  <CheckCircle2 size={18} /> 이 견적으로 진행하기
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="confirm-modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="confirm-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h3>최종 견적 승인 및 진행 요청</h3>
              <button className="btn-close" onClick={() => setShowConfirmModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p className="confirm-highlight-text">
                최종 견적 <strong>{displayTotal.toLocaleString()}원</strong>으로 시공을 진행하시겠습니까?
              </p>
              <div className="form-group mt-3">
                <label className="font-semibold text-sm">희망 일정 변경 요청사항 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 9월 25일 오전 9시로 희망일정 변경 요청합니다."
                  value={scheduleNoteInput}
                  onChange={e => setScheduleNoteInput(e.target.value)}
                />
              </div>
              <small className="notice-text">
                💡 승인 시 결제가 즉시 발생하지 않으며, 관리자가 확인 후 최종 계약 체결 및 일정을 안내해 드립니다.
              </small>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setShowConfirmModal(false)}>취소</button>
              <button type="button" className="btn-confirm-submit" onClick={handleApprove} disabled={submitting}>
                {submitting ? '처리 중...' : '확인 및 진행 요청'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return viewContent;
  }

  return (
    <MainLayout>
      <div className="customer-estimate-page-container">
        {viewContent}
      </div>
    </MainLayout>
  );
}
