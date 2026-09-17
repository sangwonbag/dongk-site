import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getEstimateInquiries,
  updateEstimateInquiryStatus,
  updateEstimateInquiryAdminMemo
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
  Copy,
  ExternalLink,
  Clock,
  AlertCircle,
  Building,
  Wrench
} from 'lucide-react';
import './AdminEstimateInquiries.css';

const STATUS_OPTIONS = ['신규 접수', '상담 중', '견적 안내', '진행 확정', '보류', '취소'];

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
      setSaveSuccessMsg('저장되었습니다.');
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

  const filteredInquiries = inquiries.filter(item => {
    const matchStatus = statusFilter === '전체' ? true : item.status === statusFilter;
    let matchSearch = true;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const firstItem = item.selected_items && item.selected_items.length > 0 ? item.selected_items[0] : null;
      const itemCode = firstItem ? (firstItem.code || firstItem.product_code || '') : '';
      const itemName = firstItem ? (firstItem.name || firstItem.product_name || '') : '';

      matchSearch =
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

  return (
    <MainLayout>
      <div className="admin-inquiries-page-container">
        <div className="admin-header-row">
          <div className="title-area">
            <div className="title-with-badge">
              <h1>시공 상담 접수 관리</h1>
              {newCount > 0 && <span className="new-count-badge">신규 {newCount}건</span>}
            </div>
            <p>고객이 상품 상세 및 견적 페이지에서 접수한 시공 상담 요청 내역을 확인하고 처리합니다.</p>
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
                    <th>시공 면적</th>
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

                    return (
                      <tr key={item.id}>
                        <td className="td-date">
                          {new Date(item.created_at).toLocaleDateString('ko-KR')} <br />
                          <small className="text-muted">{new Date(item.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</small>
                        </td>
                        <td className="td-name font-semibold">{item.customer_name || '미입력'}</td>
                        <td className="td-phone font-mono">{item.phone || '미입력'}</td>
                        <td className="td-address" title={item.site_address || item.address}>
                          {item.site_address || item.address || '미입력'}
                        </td>
                        <td className="td-material">
                          <div className="mat-name-box font-semibold">{materialName}{extraCount}</div>
                          {materialCode && <small className="text-muted">코드: {materialCode}</small>}
                        </td>
                        <td className="td-type">
                          {item.area_pyeong ? `${item.area_pyeong}평` : '미입력'}
                        </td>
                        <td className="td-status">
                          <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                            {item.status}
                          </span>
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

                  return (
                    <div key={item.id} className="mobile-inquiry-card" onClick={() => openModal(item)}>
                      <div className="card-top-row">
                        <span className="card-date">{new Date(item.created_at).toLocaleDateString('ko-KR')}</span>
                        <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                          {item.status}
                        </span>
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
                <h2>시공 상담 상세 내역 [{selectedInquiry.estimate_no || selectedInquiry.id.substring(0, 8)}]</h2>
                <button className="btn-modal-close" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body-scrollable">
                <div className="modal-split-layout">
                  {/* Left Column: 4 Clear Structured Sections */}
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

                    {/* Section ③: 선택 자재 (접수 당시 정보 기준) */}
                    <section className="detail-section">
                      <h3><Layers size={16} /> ③ 선택 자재 (접수 시점 참고 정보)</h3>
                      {(!selectedInquiry.selected_items || selectedInquiry.selected_items.length === 0) ? (
                        <div className="empty-items-notice">선택한 자재가 없습니다.</div>
                      ) : (
                        <div className="modal-items-list">
                          {selectedInquiry.selected_items.map((item, idx) => (
                            <div key={idx} className="modal-item-row-card">
                              <div className="item-thumbnail-wrapper">
                                <img
                                  src={item.thumbnail || item.thumbnail_url || '/images/no-image.svg'}
                                  alt={item.product_name || item.name}
                                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-material.jpg'; }}
                                />
                              </div>
                              <div className="item-info-wrapper">
                                <div className="item-brand-cat">
                                  <span>[{item.brand || '기타'}]</span> <span>{item.category || '자재'}</span>
                                </div>
                                <h4 className="item-name">{item.product_name || item.name}</h4>
                                <div className="item-specs-row">
                                  {(item.product_code || item.code) && <span>코드: {item.product_code || item.code}</span>}
                                  {(item.spec || item.size) && <span>규격: {item.spec || item.size}</span>}
                                </div>
                              </div>
                              <div className="item-price-quantity">
                                <span className="item-qty">
                                  {item.quantity && item.quantity > 0 ? `${item.quantity} ${item.unit || '개'}` : '수량 상담 후 확정'}
                                </span>
                                <span className="item-amount">
                                  {item.unit_price > 0 ? `자재 단가: ${item.unit_price.toLocaleString()}원` : '상담 문의 단가'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="detail-notice-bar">
                        💡 위 자재 단가는 접수 당시 참고 자재비이며, 최종 시공 견적 금액(시공비, 철거비, 인건비 등 포함)은 현장 확인 후 확정됩니다.
                      </div>
                    </section>

                  </div>

                  {/* Section ④: Right Column - 상담 진행 및 내부 메모 */}
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
                          rows={7}
                          placeholder="고객과의 유선/카톡 상담 내용, 현장 특이사항, 조율된 견적 금액 등을 기록하세요."
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

                      <div className="consulting-guide-box">
                        <h5>💡 시공 상담 관리 안내</h5>
                        <p>
                          내부 메모는 관리자 전용 정보로 고객에게 노출되지 않습니다. 
                          상담 진행 후 견적 안내 완료 시 <strong>[견적 안내]</strong>로, 계약 체결 시 <strong>[진행 확정]</strong>으로 상태를 변경하세요.
                        </p>
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
