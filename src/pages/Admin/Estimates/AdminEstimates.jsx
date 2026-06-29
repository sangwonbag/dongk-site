import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';
import { supabase } from '../../../lib/supabase';
import { Search, Filter, FileText } from 'lucide-react';
import './AdminEstimates.css';

export default function AdminEstimates() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Reset filters if highlighted item is requested
  useEffect(() => {
    if (highlightId) {
      setSearchQuery('');
      setStatusFilter('all');
    }
  }, [highlightId]);

  useEffect(() => {
    fetchEstimates();
  }, []);

  // Scroll to highlighted row when estimates list completes rendering
  useEffect(() => {
    if (highlightId && estimates.length > 0) {
      const timer = setTimeout(() => {
        const row = document.getElementById(`estimate-row-${highlightId}`);
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [highlightId, estimates]);

  const fetchEstimates = async () => {
    setLoading(true);
    try {
      // Need to adjust policy to allow reading if necessary, for now we assume admin can read
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setEstimates(data || []);
    } catch (err) {
      console.error('Error fetching estimates:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = estimates.filter(est => {
    let matchStatus = statusFilter === 'all' ? true : est.status === statusFilter;
    let matchSearch = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      matchSearch = 
        (est.estimate_no || '').toLowerCase().includes(q) ||
        (est.customer_name || '').toLowerCase().includes(q) ||
        (est.phone || '').includes(q) ||
        (est.site_address || '').toLowerCase().includes(q);
    }
    return matchStatus && matchSearch;
  });

  const getStatusClass = (status) => {
    switch(status) {
      case '접수': return 'st-new';
      case '확인중': return 'st-progress';
      case '견적완료': return 'st-done';
      case '연락완료': return 'st-done';
      case '보류': return 'st-hold';
      case '취소': return 'st-cancel';
      default: return '';
    }
  };

  return (
    <MainLayout>
      <div className="admin-container est-admin-list">
        <div className="admin-header">
          <h1>견적요청 관리</h1>
          <button className="btn-secondary" onClick={fetchEstimates}>새로고침</button>
        </div>

        <div className="admin-filters">
          <div className="filter-group">
            <Search size={18} className="filter-icon" />
            <input 
              type="text" 
              placeholder="접수번호, 이름, 연락처, 주소 검색" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <Filter size={18} className="filter-icon" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">전체 상태</option>
              <option value="접수">접수</option>
              <option value="확인중">확인중</option>
              <option value="견적완료">견적완료</option>
              <option value="연락완료">연락완료</option>
              <option value="보류">보류</option>
              <option value="취소">취소</option>
            </select>
          </div>
        </div>

        <div className="admin-table-wrapper">
          {loading ? (
            <div className="admin-loading">목록을 불러오는 중...</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>접수번호</th>
                  <th>상태</th>
                  <th>접수일시</th>
                  <th>고객명 (유형)</th>
                  <th>연락처</th>
                  <th>현장 주소</th>
                  <th>상담 방식</th>
                  <th>자세히</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-row">검색 결과가 없습니다.</td>
                  </tr>
                ) : (
                  filtered.map(est => (
                    <tr 
                      key={est.id} 
                      id={`estimate-row-${est.id}`}
                      className={highlightId === est.id ? 'highlighted-row-pulse' : ''}
                    >
                      <td className="td-no">{est.estimate_no}</td>
                      <td><span className={`status-badge ${getStatusClass(est.status)}`}>{est.status}</span></td>
                      <td>{new Date(est.created_at).toLocaleString('ko-KR')}</td>
                      <td>{est.customer_name} <br/><small className="text-gray">({est.customer_type})</small></td>
                      <td>{est.phone}</td>
                      <td className="td-addr" title={est.site_address}>{est.site_address}</td>
                      <td>{est.consultation_type}</td>
                      <td>
                        <button 
                          className="btn-sm btn-outline" 
                          onClick={() => navigate(`/admin/estimates/${est.id}`)}
                        >
                          상세보기
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
