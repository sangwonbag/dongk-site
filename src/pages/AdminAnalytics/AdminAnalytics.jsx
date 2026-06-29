import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, RefreshCw, BarChart2, Users, Eye, Clock, UserCheck } from 'lucide-react';
import './AdminAnalytics.css';

// User-agent parser helper
const parseUA = (ua) => {
  if (!ua) return '알 수 없음';
  if (ua.includes('Mobi') || ua.includes('Android') || ua.includes('iPhone')) {
    if (ua.includes('iPhone')) return '모바일 (iPhone)';
    if (ua.includes('Android')) return '모바일 (Android)';
    return '모바일';
  }
  if (ua.includes('Windows')) return 'PC (Windows)';
  if (ua.includes('Macintosh')) return 'PC (Mac)';
  if (ua.includes('Linux')) return 'PC (Linux)';
  return '기타 기기';
};

// Mask session ID for privacy
const maskSession = (sess) => {
  if (!sess) return '';
  if (sess.length <= 12) return sess;
  return sess.substring(0, 6) + '...' + sess.substring(sess.length - 4);
};

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized.');
      }
      
      const { data, error } = await supabase
        .from('visitor_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000); // Fetch last 1000 logs for client-side aggregation

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('[AdminAnalytics Fetch Error]', err);
      setErrorMsg(err.message || '방문 로그를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      alert('관리자 권한이 없습니다.');
      navigate('/login');
      return;
    }
    fetchLogs();
  }, [user, authLoading, navigate]);

  // Compute stats in useMemo to optimize rendering
  const stats = useMemo(() => {
    if (logs.length === 0) {
      return {
        todayUnique: 0,
        yesterdayUnique: 0,
        last7DaysUnique: 0,
        last30DaysUnique: 0,
        totalUnique: 0,
        topPaths: [],
        recentVisits: []
      };
    }

    const now = new Date();
    // Start of local days
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const startOf7DaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOf30DaysAgo = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filter out administrator visits for unique visitor statistics
    const nonAdminLogs = logs.filter(log => !log.is_admin);

    const getUniqueSessions = (startDate, endDate = null) => {
      const filtered = nonAdminLogs.filter(log => {
        const d = new Date(log.created_at);
        if (endDate) {
          return d >= startDate && d < endDate;
        }
        return d >= startDate;
      });
      return new Set(filtered.map(log => log.session_id)).size;
    };

    const todayUnique = getUniqueSessions(startOfToday);
    const yesterdayUnique = getUniqueSessions(startOfYesterday, startOfToday);
    const last7DaysUnique = getUniqueSessions(startOf7DaysAgo);
    const last30DaysUnique = getUniqueSessions(startOf30DaysAgo);
    const totalUnique = new Set(nonAdminLogs.map(log => log.session_id)).size;

    // Top pages (excluding admin views)
    const pathCounts = {};
    nonAdminLogs.forEach(log => {
      pathCounts[log.page_path] = (pathCounts[log.page_path] || 0) + 1;
    });
    const topPaths = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Recent 50 visits (including admins, for complete auditing)
    const recentVisits = logs.slice(0, 50).map(log => ({
      ...log,
      device: parseUA(log.user_agent),
      maskedSession: maskSession(log.session_id)
    }));

    return {
      todayUnique,
      yesterdayUnique,
      last7DaysUnique,
      last30DaysUnique,
      totalUnique,
      topPaths,
      recentVisits
    };
  }, [logs]);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="admin-analytics-loading">
          <div className="spinner-loader"></div>
          <p>방문자 데이터를 분석하는 중입니다...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="admin-analytics-container">
        {/* Back Link */}
        <span className="back-to-dashboard" onClick={() => navigate('/admin')}>
          <ArrowLeft size={16} />
          관리자 대시보드로 돌아가기
        </span>

        {/* Header */}
        <div className="admin-analytics-header">
          <div>
            <h1>방문자 통계 분석</h1>
            <p>사이트 방문자의 트래픽과 선호 페이지를 모니터링하여 마케팅 및 시공 상품 개선에 활용합니다.</p>
          </div>
          <button className="btn-refresh" onClick={fetchLogs}>
            <RefreshCw size={16} />
            새로고침
          </button>
        </div>

        {errorMsg && <div className="analytics-error-banner">{errorMsg}</div>}

        {/* 1. Summary Tallies */}
        <div className="analytics-summary-grid">
          <div className="analytics-summary-card">
            <div className="card-icon-wrapper bg-blue">
              <Users size={22} />
            </div>
            <div className="card-info">
              <span className="card-label">오늘 방문자</span>
              <strong className="card-value">{stats.todayUnique}명</strong>
            </div>
          </div>

          <div className="analytics-summary-card">
            <div className="card-icon-wrapper bg-indigo">
              <Users size={22} />
            </div>
            <div className="card-info">
              <span className="card-label">어제 방문자</span>
              <strong className="card-value">{stats.yesterdayUnique}명</strong>
            </div>
          </div>

          <div className="analytics-summary-card">
            <div className="card-icon-wrapper bg-teal">
              <Users size={22} />
            </div>
            <div className="card-info">
              <span className="card-label">최근 7일 방문자</span>
              <strong className="card-value">{stats.last7DaysUnique}명</strong>
            </div>
          </div>

          <div className="analytics-summary-card">
            <div className="card-icon-wrapper bg-purple">
              <Users size={22} />
            </div>
            <div className="card-info">
              <span className="card-label">최근 30일 방문자</span>
              <strong className="card-value">{stats.last30DaysUnique}명</strong>
            </div>
          </div>

          <div className="analytics-summary-card">
            <div className="card-icon-wrapper bg-orange">
              <Users size={22} />
            </div>
            <div className="card-info">
              <span className="card-label">전체 누적 방문자</span>
              <strong className="card-value">{stats.totalUnique}명</strong>
            </div>
          </div>
        </div>

        {/* 2. Detailed analytics layout */}
        <div className="analytics-detail-grid">
          {/* Top Page Views Card */}
          <div className="analytics-detail-card">
            <div className="card-header">
              <BarChart2 size={18} />
              <h2>인기 페이지 통계</h2>
            </div>
            <p className="card-subtitle">방문자들이 가장 많이 유입된 페이지 순위 (관리자 제외)</p>
            
            {stats.topPaths.length === 0 ? (
              <div className="empty-analytics-state">데이터가 없습니다.</div>
            ) : (
              <div className="pageviews-bar-list">
                {stats.topPaths.map((pathItem, index) => {
                  const maxCount = stats.topPaths[0]?.count || 1;
                  const pct = Math.max(5, (pathItem.count / maxCount) * 100);
                  return (
                    <div key={pathItem.path} className="bar-row">
                      <div className="bar-meta">
                        <span className="bar-rank">{index + 1}</span>
                        <span className="bar-path" title={pathItem.path}>{pathItem.path}</span>
                        <span className="bar-count">{pathItem.count}회</span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Live Visitor Logs Card */}
          <div className="analytics-detail-card">
            <div className="card-header">
              <Clock size={18} />
              <h2>최근 방문 로그 (50건)</h2>
            </div>
            <p className="card-subtitle">실시간 페이지 진입 내역 및 기기 환경 정보</p>

            <div className="logs-table-wrapper">
              {stats.recentVisits.length === 0 ? (
                <div className="empty-analytics-state">방문 로그가 없습니다.</div>
              ) : (
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>방문 일시</th>
                      <th>세션 ID</th>
                      <th>진입 경로</th>
                      <th>접속 기기</th>
                      <th>구분</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentVisits.map(visit => (
                      <tr key={visit.id} className={visit.is_admin ? 'admin-row' : ''}>
                        <td>{formatDate(visit.created_at)}</td>
                        <td className="font-mono">{visit.maskedSession}</td>
                        <td className="path-cell" title={visit.page_path}>{visit.page_path}</td>
                        <td>{visit.device}</td>
                        <td>
                          {visit.is_admin ? (
                            <span className="badge-admin-visit">
                              <UserCheck size={11} /> 관리자
                            </span>
                          ) : (
                            <span className="badge-user-visit">일반</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
