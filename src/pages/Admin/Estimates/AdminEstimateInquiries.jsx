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
  Truck,
  Box,
  Trash2
} from 'lucide-react';
import './AdminEstimateInquiries.css';

export default function AdminEstimateInquiries() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');

  // Detail Modal State
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [adminMemoInput, setAdminMemoInput] = useState('');
  const [savingMemo, setSavingMemo] = useState(false);

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

  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      const updated = await updateEstimateInquiryStatus(inquiryId, newStatus);
      setInquiries(prev => prev.map(item => item.id === inquiryId ? updated : item));
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry(updated);
      }
    } catch (err) {
      alert(err.message || '상태 변경에 실패했습니다.');
    }
  };

  const handleSaveAdminMemo = async (inquiryId) => {
    setSavingMemo(true);
    try {
      const updated = await updateEstimateInquiryAdminMemo(inquiryId, adminMemoInput);
      setInquiries(prev => prev.map(item => item.id === inquiryId ? updated : item));
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry(updated);
      }
      alert('관리자 메모가 성공적으로 저장되었습니다.');
    } catch (err) {
      alert(err.message || '메모 저장에 실패했습니다.');
    } finally {
      setSavingMemo(false);
    }
  };

  const openModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setAdminMemoInput(inquiry.admin_memo || '');
  };

  const closeModal = () => {
    setSelectedInquiry(null);
  };

  const filteredInquiries = inquiries.filter(item => {
    const matchStatus = statusFilter === '전체' ? true : item.status === statusFilter;
    let matchSearch = true;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      matchSearch =
        (item.customer_name || '').toLowerCase().includes(q) ||
        (item.phone || '').includes(q) ||
        (item.address || '').toLowerCase().includes(q) ||
        (item.memo || '').toLowerCase().includes(q);
    }
    return matchStatus && matchSearch;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case '접수대기': return 'badge-wait';
      case '상담중': return 'badge-consult';
      case '견적완료': return 'badge-done';
      case '주문전환': return 'badge-order';
      case '취소': return 'badge-cancel';
      default: return '';
    }
  };

  return (
    <MainLayout>
      <div className="admin-inquiries-page-container">
        <div className="admin-header-row">
          <div className="title-area">
            <h1>견적문의 관리</h1>
            <p>고객이 접수한 견적 상담 요청을 확인하고 상태를 업데이트하세요.</p>
          </div>
          <button className="btn-refresh" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> 새로고침
          </button>
        </div>

        {errorMsg && <div className="error-banner">{errorMsg}</div>}

        {/* Filters and Search */}
        <div className="admin-filter-bar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="고객명, 연락처, 주소, 요청사항 검색"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group-admin">
            <label><Filter size={16} /> 상태 필터:</label>
            <div className="filter-chips">
              {['전체', '접수대기', '상담중', '견적완료', '주문전환', '취소'].map(status => (
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

        {/* Table View */}
        <div className="admin-table-frame">
          {loading ? (
            <div className="admin-loading-indicator">
              <div className="spinner"></div>
              <p>견적문의 내역을 조회하는 중입니다...</p>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="admin-empty-table-state">
              <FileText size={48} className="empty-icon" />
              <h3>접수된 견적문의가 없습니다.</h3>
              <p>검색어나 상태 필터를 다르게 지정해 보세요.</p>
            </div>
          ) : (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>접수일시</th>
                  <th>고객명</th>
                  <th>연락처</th>
                  <th>현장 주소</th>
                  <th>유형/평수</th>
                  <th>예상 총액</th>
                  <th>진행 상태</th>
                  <th>상세 관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map(item => (
                  <tr key={item.id}>
                    <td className="td-date">
                      {new Date(item.created_at).toLocaleDateString('ko-KR')} <br />
                      <small className="text-muted">{new Date(item.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</small>
                    </td>
                    <td className="td-name font-semibold">{item.customer_name || '미기재'}</td>
                    <td className="td-phone font-mono">{item.phone}</td>
                    <td className="td-address" title={item.address}>{item.address || '미기재'}</td>
                    <td className="td-type">
                      {item.space_type || '미기재'} <br />
                      <small className="text-muted">{item.area_pyeong ? `${item.area_pyeong}평` : '평수 미기재'}</small>
                    </td>
                    <td className="td-amount font-semibold">
                      {item.estimated_total ? `${item.estimated_total.toLocaleString()}원` : '상담 문의'}
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
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Modal */}
        {selectedInquiry && (
          <div className="admin-detail-modal-overlay" onClick={closeModal}>
            <div className="admin-detail-modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header-row">
                <h2>견적문의 상세 내역</h2>
                <button className="btn-modal-close" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body-scrollable">
                <div className="modal-split-layout">
                  {/* Left Column: Inquiry details */}
                  <div className="modal-left-column">
                    <section className="detail-section">
                      <h3><User size={16} /> 고객 및 현장 정보</h3>
                      <table className="detail-info-table">
                        <tbody>
                          <tr>
                            <th>고객명</th>
                            <td>{selectedInquiry.customer_name || '미기재'}</td>
                            <th>연락처</th>
                            <td>{selectedInquiry.phone}</td>
                          </tr>
                          <tr>
                            <th>현장 주소</th>
                            <td colSpan="3">{selectedInquiry.address || '미기재'}</td>
                          </tr>
                          <tr>
                            <th>시공 공간</th>
                            <td>{selectedInquiry.space_type || '미기재'}</td>
                            <th>예상 평수</th>
                            <td>{selectedInquiry.area_pyeong ? `${selectedInquiry.area_pyeong}평` : '미기재'}</td>
                          </tr>
                          <tr>
                            <th>철거 여부</th>
                            <td>{selectedInquiry.demolition || '상담 후 결정'}</td>
                            <th>희망 시공일</th>
                            <td>{selectedInquiry.desired_date ? new Date(selectedInquiry.desired_date).toLocaleDateString('ko-KR') : '협의'}</td>
                          </tr>
                          <tr>
                            <th>엘리베이터</th>
                            <td>{selectedInquiry.elevator || '없음'}</td>
                            <th>주차 여부</th>
                            <td>{selectedInquiry.parking || '불가'}</td>
                          </tr>
                          <tr>
                            <th>짐 유무</th>
                            <td>{selectedInquiry.luggage || '없음'}</td>
                            <th>예상 자재액</th>
                            <td className="font-semibold text-accent">
                              {selectedInquiry.estimated_total ? `${selectedInquiry.estimated_total.toLocaleString()}원` : '상담 필요'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </section>

                    {/* Extra options */}
                    {selectedInquiry.extra_options && (
                      <section className="detail-section">
                        <h3><Box size={16} /> 부자재 및 기타 옵션</h3>
                        <div className="extra-options-box">
                          {selectedInquiry.extra_options.customer_type && (
                            <div className="option-row">
                              <span>고객 유형:</span> <strong>{selectedInquiry.extra_options.customer_type}</strong>
                            </div>
                          )}
                          {selectedInquiry.extra_options.consultation_type && (
                            <div className="option-row">
                              <span>선호 상담 방식:</span> <strong>{selectedInquiry.extra_options.consultation_type}</strong>
                            </div>
                          )}
                          {selectedInquiry.extra_options.work_type && (
                            <div className="option-row">
                              <span>작업 구분:</span> <strong>{selectedInquiry.extra_options.work_type}</strong>
                            </div>
                          )}
                          {selectedInquiry.extra_options.accessory_options && selectedInquiry.extra_options.accessory_options.length > 0 && (
                            <div className="option-row">
                              <span>선택 부자재:</span> <strong>{selectedInquiry.extra_options.accessory_options.join(', ')}</strong>
                            </div>
                          )}
                          {selectedInquiry.extra_options.extra_accessory_text && (
                            <div className="option-row">
                              <span>직접 입력 부자재:</span> <strong>{selectedInquiry.extra_options.extra_accessory_text}</strong>
                            </div>
                          )}
                        </div>
                      </section>
                    )}

                    {/* Customer Request Memo */}
                    <section className="detail-section">
                      <h3>요청사항 / 메모</h3>
                      <div className="memo-display-box">
                        {selectedInquiry.memo || '고객이 남긴 별도의 요청사항이 없습니다.'}
                      </div>
                    </section>

                    {/* Selected items */}
                    <section className="detail-section">
                      <h3><Layers size={16} /> 선택된 자재 목록</h3>
                      {(!selectedInquiry.selected_items || selectedInquiry.selected_items.length === 0) ? (
                        <div className="empty-items-notice">선택한 자재가 없습니다.</div>
                      ) : (
                        <div className="modal-items-list">
                          {selectedInquiry.selected_items.map((item, idx) => (
                            <div key={idx} className="modal-item-row-card">
                              <div className="item-thumbnail-wrapper">
                                <img
                                  src={item.thumbnail_url || '/images/no-image.svg'}
                                  alt={item.name}
                                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-material.jpg'; }}
                                />
                              </div>
                              <div className="item-info-wrapper">
                                <div className="item-brand-cat">
                                  <span>[{item.brand}]</span> <span>{item.category}</span>
                                </div>
                                <h4 className="item-name">{item.name}</h4>
                                <div className="item-specs-row">
                                  {item.code && <span>코드: {item.code}</span>}
                                  {item.size && <span>규격/옵션: {item.size}</span>}
                                </div>
                              </div>
                              <div className="item-price-quantity">
                                <span className="item-qty">{item.quantity}박스(M)</span>
                                <span className="item-amount">
                                  {item.unit_price > 0 ? `${(item.unit_price * item.quantity).toLocaleString()}원` : '가격문의'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  </div>

                  {/* Right Column: Admin control center */}
                  <div className="modal-right-column">
                    <div className="control-sticky-card">
                      <h3>관리자 처리 센터</h3>
                      
                      <div className="control-group">
                        <label>진행 상태 관리</label>
                        <select
                          value={selectedInquiry.status}
                          onChange={e => handleStatusChange(selectedInquiry.id, e.target.value)}
                          className={`status-select ${getStatusBadgeClass(selectedInquiry.status)}`}
                        >
                          <option value="접수대기">접수대기</option>
                          <option value="상담중">상담중</option>
                          <option value="견적완료">견적완료</option>
                          <option value="주문전환">주문전환</option>
                          <option value="취소">취소</option>
                        </select>
                      </div>

                      <div className="control-group">
                        <label>관리자 업무 메모</label>
                        <textarea
                          rows={6}
                          placeholder="고객과의 상담 내역, 조율된 단가 및 시공 조건 등을 기록하세요."
                          value={adminMemoInput}
                          onChange={e => setAdminMemoInput(e.target.value)}
                        />
                      </div>

                      <button
                        className="btn-save-admin-memo"
                        onClick={() => handleSaveAdminMemo(selectedInquiry.id)}
                        disabled={savingMemo}
                      >
                        {savingMemo ? '저장 중...' : '관리자 메모 저장'}
                      </button>

                      <div className="consulting-guide-box">
                        <h5>💡 견적 및 상담 관리 팁</h5>
                        <p>
                          고객이 접수한 희망 평수 및 자재 종류를 바탕으로 철거 여부와 주차 환경을 파악하여 
                          양중비/철거비 등이 합산된 시공 견적서를 유선 또는 문자로 안내해 주세요. 
                          최종 조율 후 실제 발주로 이어질 시 상태를 <strong>[주문전환]</strong>으로 변경하시면 효과적입니다.
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
