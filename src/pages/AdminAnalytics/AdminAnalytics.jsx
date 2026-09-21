import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { getAdminOrders } from '../../services/orderService';
import { getConstructionWorkers } from '../../services/workerService';
import { 
  ArrowLeft, 
  RefreshCw, 
  BarChart2, 
  Users, 
  Clock, 
  UserCheck, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  PieChart, 
  Briefcase,
  Layers,
  HardHat
} from 'lucide-react';
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
  
  const [activeTab, setActiveTab] = useState('operations'); // 'operations' | 'traffic'
  const [logs, setLogs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 기간 필터 상태
  const [periodFilter, setPeriodFilter] = useState('this_month'); // 'this_month', 'last_month', '3months', 'this_year', 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized.');
      }
      
      // Parallel fetch for logs, orders, and workers
      const [logRes, orderData, workerData] = await Promise.all([
        supabase
          .from('visitor_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000),
        getAdminOrders().catch(() => []),
        getConstructionWorkers().catch(() => [])
      ]);

      if (logRes.error) throw logRes.error;

      setLogs(logRes.data || []);
      setOrders(orderData || []);
      setWorkers(workerData || []);
    } catch (err) {
      console.error('[AdminAnalytics Fetch Error]', err);
      setErrorMsg(err.message || '통계 데이터를 가져오는데 실패했습니다.');
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
    fetchAnalyticsData();
  }, [user, authLoading, navigate]);

  // 기간 기준 필터링된 주문 데이터 연산
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    const now = new Date();
    let startLimit = null;
    let endLimit = null;

    if (periodFilter === 'this_month') {
      startLimit = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (periodFilter === 'last_month') {
      startLimit = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endLimit = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (periodFilter === '3months') {
      startLimit = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    } else if (periodFilter === 'this_year') {
      startLimit = new Date(now.getFullYear(), 0, 1);
    } else if (periodFilter === 'custom' && customStartDate) {
      startLimit = new Date(customStartDate);
      if (customEndDate) {
        endLimit = new Date(customEndDate + 'T23:59:59');
      }
    }

    return orders.filter(o => {
      const dateStr = o.created_at || o.construction_date;
      if (!dateStr) return true;
      const d = new Date(dateStr);
      if (startLimit && d < startLimit) return false;
      if (endLimit && d > endLimit) return false;
      return true;
    });
  }, [orders, periodFilter, customStartDate, customEndDate]);

  // 월별 운영 및 매출 통계 연산
  const financialStats = useMemo(() => {
    const validOrders = filteredOrders.filter(o => o.status !== '취소');
    const cancelledOrders = filteredOrders.filter(o => o.status === '취소');

    let totalOrdersCount = validOrders.length;
    let confirmedEstimateTotal = 0;
    let finalBillingTotal = 0; // 매출 = 최종 청구 총액
    let totalPaidAmount = 0;   // 실제 수금액
    let totalUnpaidAmount = 0; // 미수금
    let completedCount = 0;
    let missingShipmentCount = 0;
    let unpaidOrderCount = 0;
    let totalExtraCharge = 0;

    // 카테고리별 집계 (장판, 데코타일, 마루, 벽지, 카페트타일, 기타)
    const categoryStats = {
      '장판': { count: 0, amount: 0 },
      '데코타일': { count: 0, amount: 0 },
      '마루': { count: 0, amount: 0 },
      '벽지': { count: 0, amount: 0 },
      '카페트타일': { count: 0, amount: 0 },
      '기타': { count: 0, amount: 0 }
    };

    // 브랜드별 집계 (KCC, LX, 현대, 동신, 재영, 우성, 녹수, 기타)
    const brandStats = {
      'LX': { count: 0, amount: 0 },
      'KCC': { count: 0, amount: 0 },
      '현대': { count: 0, amount: 0 },
      '동신': { count: 0, amount: 0 },
      '재영': { count: 0, amount: 0 },
      '우성': { count: 0, amount: 0 },
      '녹수': { count: 0, amount: 0 },
      '기타': { count: 0, amount: 0 }
    };

    // 작업자별 실적 집계
    const workerPerformanceMap = {};

    validOrders.forEach(o => {
      const approved = o.approved_amount || o.total_amount || 0;
      const finalBill = o.final_billing_amount || o.total_amount || 0;
      const paid = o.total_paid_amount || 0;
      const unpaid = o.outstanding_balance ?? Math.max(0, finalBill - paid);

      confirmedEstimateTotal += approved;
      finalBillingTotal += finalBill;
      totalPaidAmount += paid;
      totalUnpaidAmount += unpaid;

      if (o.status === '완료' || o.construction_status === '종결' || o.construction_status === '고객 확인') {
        completedCount += 1;
      }

      if (unpaid > 0) {
        unpaidOrderCount += 1;
      }

      if (o.shipment_status === '대기' || o.shipment_status === '준비중') {
        missingShipmentCount += 1;
      }

      if (o.extra_charge_amount) {
        totalExtraCharge += parseFloat(o.extra_charge_amount) || 0;
      }

      // items aggregation
      (o.order_items || []).forEach(item => {
        const name = (item.product_name || '').toLowerCase();
        const code = (item.product_code || '').toLowerCase();
        const category = item.category || (
          name.includes('장판') || code.includes('np') || code.includes('c1') ? '장판' :
          name.includes('데코타일') || code.includes('dt') || code.includes('sw') || code.includes('hw') ? '데코타일' :
          name.includes('마루') || code.includes('mr') ? '마루' :
          name.includes('벽지') ? '벽지' :
          name.includes('카페트') ? '카페트타일' : '기타'
        );

        if (categoryStats[category]) {
          categoryStats[category].count += (item.quantity || 1);
          categoryStats[category].amount += (item.total_price || 0);
        } else {
          categoryStats['기타'].count += (item.quantity || 1);
          categoryStats['기타'].amount += (item.total_price || 0);
        }

        // brand aggregation
        const brand = (
          name.includes('lx') || name.includes('지인') ? 'LX' :
          name.includes('kcc') || name.includes('숲') ? 'KCC' :
          name.includes('현대') || name.includes('L&C') ? '현대' :
          name.includes('동신') ? '동신' :
          name.includes('재영') ? '재영' :
          name.includes('우성') ? '우성' :
          name.includes('녹수') ? '녹수' : '기타'
        );

        if (brandStats[brand]) {
          brandStats[brand].count += (item.quantity || 1);
          brandStats[brand].amount += (item.total_price || 0);
        } else {
          brandStats['기타'].count += (item.quantity || 1);
          brandStats['기타'].amount += (item.total_price || 0);
        }
      });

      // worker aggregation
      const managerName = o.construction_manager || '미배정';
      if (!workerPerformanceMap[managerName]) {
        workerPerformanceMap[managerName] = { name: managerName, count: 0, completedCount: 0, totalAmount: 0 };
      }
      workerPerformanceMap[managerName].count += 1;
      workerPerformanceMap[managerName].totalAmount += finalBill;
      if (o.status === '완료' || o.construction_status === '종결') {
        workerPerformanceMap[managerName].completedCount += 1;
      }
    });

    const settlementRate = finalBillingTotal > 0 ? ((totalPaidAmount / finalBillingTotal) * 100).toFixed(1) : 0;
    const avgOrderAmount = totalOrdersCount > 0 ? Math.round(finalBillingTotal / totalOrdersCount) : 0;
    const avgExtraCharge = totalOrdersCount > 0 ? Math.round(totalExtraCharge / totalOrdersCount) : 0;

    return {
      totalOrdersCount,
      confirmedEstimateTotal,
      finalBillingTotal,
      totalPaidAmount,
      totalUnpaidAmount,
      settlementRate,
      completedCount,
      cancelledCount: cancelledOrders.length,
      unpaidOrderCount,
      missingShipmentCount,
      avgOrderAmount,
      avgExtraCharge,
      categoryStats: Object.entries(categoryStats).map(([name, val]) => ({ name, ...val })),
      brandStats: Object.entries(brandStats).map(([name, val]) => ({ name, ...val })),
      workerPerformance: Object.values(workerPerformanceMap).sort((a, b) => b.count - a.count)
    };
  }, [filteredOrders]);

  // 방문자 데이터 연산
  const trafficStats = useMemo(() => {
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
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const startOf7DaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOf30DaysAgo = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);

    const nonAdminLogs = logs.filter(log => !log.is_admin);

    const getUniqueSessions = (startDate, endDate = null) => {
      const filtered = nonAdminLogs.filter(log => {
        const d = new Date(log.created_at);
        if (endDate) return d >= startDate && d < endDate;
        return d >= startDate;
      });
      return new Set(filtered.map(log => log.session_id)).size;
    };

    const todayUnique = getUniqueSessions(startOfToday);
    const yesterdayUnique = getUniqueSessions(startOfYesterday, startOfToday);
    const last7DaysUnique = getUniqueSessions(startOf7DaysAgo);
    const last30DaysUnique = getUniqueSessions(startOf30DaysAgo);
    const totalUnique = new Set(nonAdminLogs.map(log => log.session_id)).size;

    const pathCounts = {};
    nonAdminLogs.forEach(log => {
      pathCounts[log.page_path] = (pathCounts[log.page_path] || 0) + 1;
    });
    const topPaths = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

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
          <p>통계 데이터를 분석하는 중입니다...</p>
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
            <h1>동경바닥재 운영 통합 통계 대시보드</h1>
            <p>월별 매출, 수금 현황, 자재/브랜드별 실적, 작업자 현황 및 방문 트래픽을 종합 모니터링합니다.</p>
          </div>
          <button className="btn-refresh" onClick={fetchAnalyticsData}>
            <RefreshCw size={16} />
            새로고침
          </button>
        </div>

        {errorMsg && <div className="analytics-error-banner">{errorMsg}</div>}

        {/* 상단 탭 셀렉터 */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
          <button 
            onClick={() => setActiveTab('operations')}
            style={{ 
              padding: '12px 24px', 
              fontSize: '15px', 
              fontWeight: '800', 
              border: 'none', 
              borderBottom: activeTab === 'operations' ? '3px solid #b3925f' : '3px solid transparent', 
              backgroundColor: 'transparent',
              color: activeTab === 'operations' ? '#0f172a' : '#64748b',
              cursor: 'pointer'
            }}
          >
            📊 월별 매출 & 운영 통계
          </button>
          <button 
            onClick={() => setActiveTab('traffic')}
            style={{ 
              padding: '12px 24px', 
              fontSize: '15px', 
              fontWeight: '800', 
              border: 'none', 
              borderBottom: activeTab === 'traffic' ? '3px solid #b3925f' : '3px solid transparent', 
              backgroundColor: 'transparent',
              color: activeTab === 'traffic' ? '#0f172a' : '#64748b',
              cursor: 'pointer'
            }}
          >
            👥 방문자 트래픽 통계
          </button>
        </div>

        {/* =========================================================
            TAB 1: 월별 매출 & 운영 통계
            ========================================================= */}
        {activeTab === 'operations' && (
          <div>
            {/* 기간 필터 바 */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#ffffff', padding: '14px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', marginRight: '8px' }}>📅 조회 기간 설정:</span>
              {[
                { key: 'this_month', label: '이번 달' },
                { key: 'last_month', label: '지난달' },
                { key: '3months', label: '최근 3개월' },
                { key: 'this_year', label: '올해' },
                { key: 'custom', label: '직접 설정' }
              ].map(p => (
                <button
                  key={p.key}
                  onClick={() => setPeriodFilter(p.key)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    border: '1px solid #cbd5e1',
                    backgroundColor: periodFilter === p.key ? '#0f172a' : '#f8fafc',
                    color: periodFilter === p.key ? '#ffffff' : '#334155',
                    cursor: 'pointer'
                  }}
                >
                  {p.label}
                </button>
              ))}

              {periodFilter === 'custom' && (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginLeft: '10px' }}>
                  <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} style={{ padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }} />
                  <span>~</span>
                  <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} style={{ padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }} />
                </div>
              )}
            </div>

            {/* 1. 월 매출 및 수금 요약 카드 (청구금액 = 매출, 입금액 = 실제 수금) */}
            <div className="analytics-summary-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <div className="analytics-summary-card">
                <div className="card-icon-wrapper bg-blue">
                  <Briefcase size={20} />
                </div>
                <div className="card-info">
                  <span className="card-label">주문 건수</span>
                  <strong className="card-value">{financialStats.totalOrdersCount}건</strong>
                </div>
              </div>

              <div className="analytics-summary-card">
                <div className="card-icon-wrapper bg-indigo">
                  <DollarSign size={20} />
                </div>
                <div className="card-info">
                  <span className="card-label">확정 견적 총액</span>
                  <strong className="card-value">{financialStats.confirmedEstimateTotal.toLocaleString()}원</strong>
                </div>
              </div>

              <div className="analytics-summary-card">
                <div className="card-icon-wrapper bg-teal">
                  <TrendingUp size={20} />
                </div>
                <div className="card-info">
                  <span className="card-label">최종 청구 (매출)</span>
                  <strong className="card-value text-blue" style={{ color: '#0284c7' }}>{financialStats.finalBillingTotal.toLocaleString()}원</strong>
                </div>
              </div>

              <div className="analytics-summary-card">
                <div className="card-icon-wrapper bg-purple">
                  <CheckCircle size={20} />
                </div>
                <div className="card-info">
                  <span className="card-label">실제 입금 (수금)</span>
                  <strong className="card-value" style={{ color: '#16a34a' }}>{financialStats.totalPaidAmount.toLocaleString()}원</strong>
                </div>
              </div>

              <div className="analytics-summary-card">
                <div className="card-icon-wrapper bg-orange">
                  <AlertCircle size={20} />
                </div>
                <div className="card-info">
                  <span className="card-label">미수금 총액</span>
                  <strong className="card-value" style={{ color: financialStats.totalUnpaidAmount > 0 ? '#dc2626' : '#16a34a' }}>
                    {financialStats.totalUnpaidAmount.toLocaleString()}원
                  </strong>
                </div>
              </div>

              <div className="analytics-summary-card">
                <div className="card-icon-wrapper bg-teal">
                  <TrendingUp size={20} />
                </div>
                <div className="card-info">
                  <span className="card-label">수금 완납률</span>
                  <strong className="card-value">{financialStats.settlementRate}%</strong>
                </div>
              </div>
            </div>

            {/* 2. 자재별 및 브랜드별 실적 테이블 */}
            <div className="analytics-detail-grid" style={{ marginTop: '24px' }}>
              
              {/* 자재별 실적 */}
              <div className="analytics-detail-card">
                <div className="card-header">
                  <Layers size={18} />
                  <h2>자재 카테고리별 실적</h2>
                </div>
                <p className="card-subtitle">주문 품목 snapshot 기준 카테고리별 매출 및 주문 수량</p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>카테고리</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>주문 수량</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>매출 금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialStats.categoryStats.map(cat => (
                      <tr key={cat.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px', fontWeight: '700', color: '#0f172a' }}>{cat.name}</td>
                        <td style={{ padding: '8px', textAlign: 'right', color: '#475569' }}>{cat.count}건/평</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: '700', color: '#0284c7' }}>{cat.amount.toLocaleString()}원</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 브랜드별 실적 */}
              <div className="analytics-detail-card">
                <div className="card-header">
                  <PieChart size={18} />
                  <h2>브랜드별 실적</h2>
                </div>
                <p className="card-subtitle">주문 품목 snapshot 기준 주요 브랜드별 집계</p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>브랜드명</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>주문 수량</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>매출 금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialStats.brandStats.map(b => (
                      <tr key={b.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px', fontWeight: '700', color: '#0f172a' }}>{b.name}</td>
                        <td style={{ padding: '8px', textAlign: 'right', color: '#475569' }}>{b.count}건/평</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: '700', color: '#16a34a' }}>{b.amount.toLocaleString()}원</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. 시공 운영 지표 & 작업자별 실적 */}
            <div className="analytics-detail-grid" style={{ marginTop: '24px' }}>
              
              {/* 시공 운영 주요 지표 */}
              <div className="analytics-detail-card">
                <div className="card-header">
                  <Calendar size={18} />
                  <h2>시공 운영 핵심 지표</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '16px' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>시공 완료 건수</div>
                    <strong style={{ fontSize: '18px', color: '#16a34a' }}>{financialStats.completedCount}건</strong>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>취소 건수</div>
                    <strong style={{ fontSize: '18px', color: '#dc2626' }}>{financialStats.cancelledCount}건</strong>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>평균 주문금액</div>
                    <strong style={{ fontSize: '16px', color: '#0f172a' }}>{financialStats.avgOrderAmount.toLocaleString()}원</strong>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>평균 추가비용</div>
                    <strong style={{ fontSize: '16px', color: '#0284c7' }}>{financialStats.avgExtraCharge.toLocaleString()}원</strong>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>출고 대기/미완료</div>
                    <strong style={{ fontSize: '18px', color: '#c2410c' }}>{financialStats.missingShipmentCount}건</strong>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>미수 잔액 건수</div>
                    <strong style={{ fontSize: '18px', color: '#b91c1c' }}>{financialStats.unpaidOrderCount}건</strong>
                  </div>
                </div>
              </div>

              {/* 작업자별 시공 현황 */}
              <div className="analytics-detail-card">
                <div className="card-header">
                  <HardHat size={18} />
                  <h2>작업자별 시공 배정 현황</h2>
                </div>
                <p className="card-subtitle">작업자별 배정 건수, 완료 건수 및 담당 현장 금액</p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>작업자명</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>배정 건수</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>완료 건수</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>담당 청구 금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialStats.workerPerformance.map(wp => (
                      <tr key={wp.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px', fontWeight: '700', color: '#0f172a' }}>{wp.name}</td>
                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: '700' }}>{wp.count}건</td>
                        <td style={{ padding: '8px', textAlign: 'center', color: '#16a34a' }}>{wp.completedCount}건</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: '700', color: '#0284c7' }}>{wp.totalAmount.toLocaleString()}원</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: 방문자 트래픽 통계
            ========================================================= */}
        {activeTab === 'traffic' && (
          <div>
            {/* 1. Traffic Tallies */}
            <div className="analytics-summary-grid">
              <div className="analytics-summary-card">
                <div className="card-icon-wrapper bg-blue">
                  <Users size={22} />
                </div>
                <div className="card-info">
                  <span className="card-label">오늘 방문자</span>
                  <strong className="card-value">{trafficStats.todayUnique}명</strong>
                </div>
              </div>

              <div className="analytics-summary-card">
                <div className="card-icon-wrapper bg-indigo">
                  <Users size={22} />
                </div>
                <div className="card-info">
                  <span className="card-label">어제 방문자</span>
                  <strong className="card-value">{trafficStats.yesterdayUnique}명</strong>
                </div>
              </div>

              <div className="analytics-summary-card">
                <div className="card-icon-wrapper bg-teal">
                  <Users size={22} />
                </div>
                <div className="card-info">
                  <span className="card-label">최근 7일 방문자</span>
                  <strong className="card-value">{trafficStats.last7DaysUnique}명</strong>
                </div>
              </div>

              <div className="analytics-summary-card">
                <div className="card-icon-wrapper bg-purple">
                  <Users size={22} />
                </div>
                <div className="card-info">
                  <span className="card-label">최근 30일 방문자</span>
                  <strong className="card-value">{trafficStats.last30DaysUnique}명</strong>
                </div>
              </div>

              <div className="analytics-summary-card">
                <div className="card-icon-wrapper bg-orange">
                  <Users size={22} />
                </div>
                <div className="card-info">
                  <span className="card-label">전체 누적 방문자</span>
                  <strong className="card-value">{trafficStats.totalUnique}명</strong>
                </div>
              </div>
            </div>

            {/* 2. Detailed traffic layout */}
            <div className="analytics-detail-grid">
              <div className="analytics-detail-card">
                <div className="card-header">
                  <BarChart2 size={18} />
                  <h2>인기 페이지 통계</h2>
                </div>
                <p className="card-subtitle">방문자들이 가장 많이 유입된 페이지 순위 (관리자 제외)</p>
                
                {trafficStats.topPaths.length === 0 ? (
                  <div className="empty-analytics-state">데이터가 없습니다.</div>
                ) : (
                  <div className="pageviews-bar-list">
                    {trafficStats.topPaths.map((pathItem, index) => {
                      const maxCount = trafficStats.topPaths[0]?.count || 1;
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

              <div className="analytics-detail-card">
                <div className="card-header">
                  <Clock size={18} />
                  <h2>최근 방문 로그 (50건)</h2>
                </div>
                <p className="card-subtitle">실시간 페이지 진입 내역 및 기기 환경 정보</p>

                <div className="logs-table-wrapper">
                  {trafficStats.recentVisits.length === 0 ? (
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
                        {trafficStats.recentVisits.map(visit => (
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
        )}
      </div>
    </MainLayout>
  );
}
