import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabaseClient';
import { 
  ArrowLeft, Search, Filter, Trash2, FileText, User, Phone, 
  MapPin, Clipboard, CheckCircle, RefreshCw, X, MessageSquare 
} from 'lucide-react';
import './Inquiries.css';

export default function Inquiries() {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');

  // Detail Modal
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [adminMemo, setAdminMemo] = useState('');
  const [savingMemo, setSavingMemo] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (!supabase) throw new Error('Supabase client not initialized.');
      
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      setErrorMsg(error.message || '상담 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      if (!supabase) return;
      const { error } = await supabase
        .from('inquiries')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const handleSaveMemo = async (e) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    
    setSavingMemo(true);
    try {
      if (!supabase) return;
      const { error } = await supabase
        .from('inquiries')
        .update({ admin_memo: adminMemo, updated_at: new Date().toISOString() })
        .eq('id', selectedInquiry.id);

      if (error) throw error;
      
      setInquiries(prev => prev.map(inq => inq.id === selectedInquiry.id ? { ...inq, admin_memo: adminMemo } : inq));
      setSelectedInquiry(prev => ({ ...prev, admin_memo: adminMemo }));
      alert('관리자 메모가 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('Error saving admin memo:', error);
      alert('메모 저장에 실패했습니다.');
    } finally {
      setSavingMemo(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('이 문의 기록을 영구히 삭제하시겠습니까?')) return;
    
    try {
      if (!supabase) return;
      const { error } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setInquiries(prev => prev.filter(inq => inq.id !== id));
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry(null);
      }
      alert('성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const openDetailModal = (inq) => {
    setSelectedInquiry(inq);
    setAdminMemo(inq.admin_memo || '');
  };

  const closeDetailModal = () => {
    setSelectedInquiry(null);
  };

  // Filtered list
  const filteredInquiries = inquiries.filter(inq => {
    const matchStatus = statusFilter === '전체' ? true : (inq.status || '신규') === statusFilter;
    let matchSearch = true;
    
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      matchSearch = 
        (inq.name || '').toLowerCase().includes(q) ||
        (inq.phone || '').includes(q) ||
        (inq.address || '').toLowerCase().includes(q) ||
        (inq.inquiry_details || '').toLowerCase().includes(q) ||
        (inq.material_of_interest || '').toLowerCase().includes(q);
    }
    
    return matchStatus && matchSearch;
  });

  const STATUS_OPTIONS = ['신규', '확인중', '답변완료', '보류', '종료'];

  const getStatusClass = (status) => {
    switch (status) {
      case '신규': return 'badge-new';
      case '확인중': return 'badge-checking';
      case '답변완료': return 'badge-answered';
      case '보류': return 'badge-onhold';
      case '종료': return 'badge-closed';
      default: return 'badge-new';
    }
  };

  return (
    <MainLayout>
      <div className="admin-inquiries-container">
        {/* Back navigation link */}
        <span className="back-to-dashboard" onClick={() => navigate('/admin')}>
          <ArrowLeft size={16} />
          관리자 대시보드로 돌아가기
        </span>

        {/* Header row */}
        <div className="admin-inquiries-header">
          <div>
            <h1>고객 문의 관리</h1>
            <p>AI 아바타 상담 및 일반 고객 문의 내역을 모니터링하고 진행 상태를 기록합니다.</p>
          </div>
          <button className="btn-refresh" onClick={fetchInquiries} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            새로고침
          </button>
        </div>

        {errorMsg && <div className="inquiries-error-banner">{errorMsg}</div>}

        {/* Toolbar filters and search */}
        <div className="inquiries-toolbar-card">
          <div className="search-group">
            <Search size={16} className="icon-search" />
            <input 
              type="text" 
              placeholder="고객명, 연락처, 주소, 문의내용 검색..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-chips-group">
            <span className="lbl"><Filter size={14} /> 분류 필터:</span>
            <div className="chips-wrapper">
              {['전체', ...STATUS_OPTIONS].map(opt => (
                <button
                  key={opt}
                  className={`chip-btn ${statusFilter === opt ? 'active' : ''}`}
                  onClick={() => setStatusFilter(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="inquiries-loading">
            <div className="spinner-loader"></div>
            <p>고객 문의 내역을 가져오고 있습니다...</p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="inquiries-empty-state">
            <MessageSquare size={44} className="icon-empty" />
            <h3>접수된 고객 문의가 없습니다.</h3>
            <p>검색 조건 혹은 필터를 해제해 보세요.</p>
          </div>
        ) : (
          <div className="admin-inquiries-table-wrapper">
            <table className="admin-inquiries-table">
              <thead>
                <tr>
                  <th>접수일시</th>
                  <th>이름/상호</th>
                  <th>연락처</th>
                  <th>현장주소</th>
                  <th>평수</th>
                  <th>관심자재</th>
                  <th>문의내용</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map(inq => (
                  <tr key={inq.id} onClick={() => openDetailModal(inq)} className="clickable-row">
                    <td className="date-cell">
                      {inq.created_at ? new Date(inq.created_at).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '-'}
                    </td>
                    <td className="name-cell font-bold">{inq.name || '비회원'}</td>
                    <td className="phone-cell">{inq.phone || '-'}</td>
                    <td className="addr-cell" title={inq.address}>{inq.address || '-'}</td>
                    <td className="area-cell font-mono">{inq.area ? `${inq.area}평` : '-'}</td>
                    <td className="material-cell">{inq.material_of_interest || '-'}</td>
                    <td className="detail-snippet-cell" title={inq.inquiry_details}>
                      {inq.inquiry_details || '-'}
                    </td>
                    <td>
                      <span className={`status-badge-lbl ${getStatusClass(inq.status || '신규')}`}>
                        {inq.status || '신규'}
                      </span>
                    </td>
                    <td className="actions-cell" onClick={e => e.stopPropagation()}>
                      <button 
                        className="btn-row-delete" 
                        onClick={(e) => handleDelete(inq.id, e)} 
                        title="삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detailed Modal View */}
        {selectedInquiry && (
          <div className="modal-overlay" onClick={closeDetailModal}>
            <div className="inquiry-detail-modal-card" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>고객 문의 상세 내역</h2>
                <button className="btn-close-modal" onClick={closeDetailModal}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body-scroll">
                <div className="detail-layout-cols">
                  {/* Left Column: Inquiry Core Details */}
                  <div className="detail-left-pane">
                    <div className="info-section">
                      <h3><User size={15} /> 고객 및 현장 정보</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="lbl">고객명</span>
                          <span className="val font-bold">{selectedInquiry.name || '비회원'}</span>
                        </div>
                        <div className="info-item">
                          <span className="lbl">연락처</span>
                          <span className="val font-mono">{selectedInquiry.phone || '-'}</span>
                        </div>
                        <div className="info-item">
                          <span className="lbl">현장 주소</span>
                          <span className="val">{selectedInquiry.address || '-'}</span>
                        </div>
                        <div className="info-item">
                          <span className="lbl">시공 평수</span>
                          <span className="val font-mono">{selectedInquiry.area ? `${selectedInquiry.area} 평` : '-'}</span>
                        </div>
                        <div className="info-item">
                          <span className="lbl">관심 자재</span>
                          <span className="val">{selectedInquiry.material_of_interest || '-'}</span>
                        </div>
                        <div className="info-item">
                          <span className="lbl">접수 일시</span>
                          <span className="val">{selectedInquiry.created_at ? new Date(selectedInquiry.created_at).toLocaleString('ko-KR') : '-'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="info-section memo">
                      <h3><Clipboard size={15} /> 문의 상세 내용</h3>
                      <div className="text-content-box">
                        {selectedInquiry.inquiry_details || '상세 접수 내용이 없습니다.'}
                      </div>
                    </div>

                    {/* Render Chat Transcript if exists */}
                    {selectedInquiry.full_transcript && (
                      <div className="info-section chat-log">
                        <h3><MessageSquare size={15} /> AI 상담 대화 기록 (Chat Log)</h3>
                        <div className="chat-transcript-view">
                          {(() => {
                            try {
                              const transcript = typeof selectedInquiry.full_transcript === 'string'
                                ? JSON.parse(selectedInquiry.full_transcript)
                                : selectedInquiry.full_transcript;
                              
                              if (Array.isArray(transcript)) {
                                return transcript.map((msg, idx) => (
                                  <div key={idx} className={`chat-bubble-row ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                                    <div className="sender-lbl">{msg.role === 'user' ? '고객' : 'AI 상담비서'}</div>
                                    <div className="chat-msg">{msg.content}</div>
                                  </div>
                                ));
                              }
                              return <p className="text-gray">대화 기록이 유효한 배열 형식이 아닙니다.</p>;
                            } catch (e) {
                              return <p className="text-gray">대화 기록을 디코딩하지 못했습니다.</p>;
                            }
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Admin status control and note */}
                  <div className="detail-right-pane">
                    <div className="control-block">
                      <h3>진행 상태 제어</h3>
                      <div className="status-select-wrapper">
                        <select
                          value={selectedInquiry.status || '신규'}
                          onChange={e => handleStatusChange(selectedInquiry.id, e.target.value)}
                          className={`modal-status-select status-${(selectedInquiry.status || '신규').replace(' ', '')}`}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <form className="control-block memo-form" onSubmit={handleSaveMemo}>
                      <h3>관리자 전용 업무 메모</h3>
                      <textarea
                        rows={6}
                        placeholder="전화 상담 특이사항, 예약 방문 일정, 자재 안내 사항 등을 기록해 두세요..."
                        value={adminMemo}
                        onChange={e => setAdminMemo(e.target.value)}
                      />
                      <button 
                        type="submit" 
                        className="btn-save-memo"
                        disabled={savingMemo}
                      >
                        {savingMemo ? '저장 중...' : '메모 저장하기'}
                      </button>
                    </form>

                    <div className="danger-zone">
                      <h3>데이터 관리</h3>
                      <button 
                        type="button" 
                        className="btn-modal-delete"
                        onClick={() => handleDelete(selectedInquiry.id)}
                      >
                        <Trash2 size={14} /> 이 문의 전체 영구 삭제
                      </button>
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
