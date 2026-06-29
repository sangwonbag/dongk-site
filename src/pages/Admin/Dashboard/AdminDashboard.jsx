import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';
import { supabase } from '../../../lib/supabaseClient';
import { logout } from '../../../lib/auth';
import { 
  FileText, 
  Layers, 
  MessageSquare, 
  LogOut, 
  Clipboard, 
  Wand2, 
  Users, 
  Eye, 
  TrendingUp, 
  Activity, 
  AlertCircle,
  RefreshCw,
  LayoutGrid
} from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Statistics states
  const [stats, setStats] = useState({
    todayVisitors: 0,
    weekVisitors: 0,
    todayNewOrders: 0,
    pendingOrders: 0,
    newEstimates: 0,
    newInquiries: 0,
    totalProducts: 0,
    activeProducts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    let visitorLogs = [];
    let productRows = [];
    let orderRows = [];
    let estimateRows = [];
    let inquiryRows = [];

    try {
      if (!supabase) {
        throw new Error('SUPABASE_NOT_INITIALIZED');
      }

      // Fetch Visitor Logs safely
      try {
        const { data } = await supabase.from('visitor_logs').select('session_id, created_at, is_admin');
        visitorLogs = data || [];
      } catch (err) {
        console.warn('visitor_logs table load fallback:', err);
      }

      // Fetch Products safely
      try {
        const { data } = await supabase.from('products').select('is_active');
        productRows = data || [];
      } catch (err) {
        console.warn('products table load fallback:', err);
      }

      // Fetch Orders safely
      try {
        const { data } = await supabase.from('orders').select('status, created_at');
        orderRows = data || [];
      } catch (err) {
        console.warn('orders table load fallback:', err);
      }

      // Fetch Estimates safely
      try {
        const { data } = await supabase.from('estimates').select('status');
        estimateRows = data || [];
      } catch (err) {
        console.warn('estimates table load fallback:', err);
      }

      // Fetch Inquiries safely
      try {
        const { data } = await supabase.from('inquiries').select('status');
        inquiryRows = data || [];
      } catch (err) {
        console.warn('inquiries table load fallback:', err);
      }

      // Calculate statistics
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOf7DaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

      const nonAdminLogs = visitorLogs.filter(l => !l.is_admin);
      
      const getUniqueSessions = (startDate) => {
        const filtered = nonAdminLogs.filter(log => new Date(log.created_at) >= startDate);
        return new Set(filtered.map(log => log.session_id)).size;
      };

      const todayVisitors = getUniqueSessions(startOfToday);
      const weekVisitors = getUniqueSessions(startOf7DaysAgo);

      const todayNewOrders = orderRows.filter(o => {
        if (!o.created_at) return false;
        return new Date(o.created_at) >= startOfToday;
      }).length;

      const pendingOrders = orderRows.filter(
        o => o.status !== '완료' && o.status !== '취소'
      ).length;

      const newEstimates = estimateRows.filter(e => e.status === '접수' || e.status === '신규').length;
      const newInquiries = inquiryRows.filter(i => i.status === 'new' || i.status === '신규').length;

      const totalProducts = productRows.length;
      const activeProducts = productRows.filter(p => p.is_active).length;

      setStats({
        todayVisitors,
        weekVisitors,
        todayNewOrders,
        pendingOrders,
        newEstimates,
        newInquiries,
        totalProducts,
        activeProducts
      });
    } catch (err) {
      console.error('[Dashboard Fetch Stats Error]', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <MainLayout>
      <div className="admin-dashboard-container">
        {/* Header */}
        <div className="dashboard-header-row">
          <div className="dashboard-header">
            <h1>관리자 대시보드</h1>
            <p>동경바닥재 사이트 현황을 실시간으로 관리하고 처리 내역을 조회합니다.</p>
          </div>
          <button className="btn-dashboard-refresh" onClick={fetchStats} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            새로고침
          </button>
        </div>

        {/* 1. Supabase Environment Warning or Error */}
        {error && (
          <div className="dashboard-error-banner">
            <AlertCircle size={20} className="icon-error" />
            <div className="error-text">
              {error === 'SUPABASE_NOT_INITIALIZED' ? (
                <>
                  <strong>Supabase 연결 실패:</strong> 환경변수(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) 확인이 필요합니다.
                </>
              ) : (
                <>
                  <strong>데이터를 로드하는 도중 오류가 발생했습니다:</strong> {error}
                </>
              )}
            </div>
            {error !== 'SUPABASE_NOT_INITIALIZED' && (
              <button className="btn-retry" onClick={fetchStats}>재시도</button>
            )}
          </div>
        )}

        {/* 2. Summary stats cards */}
        <div className="dashboard-stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-lbl">오늘 유입 트래픽</span>
              <Users size={16} className="stat-icon text-blue" />
            </div>
            <strong className="stat-val">{loading ? '-' : `${stats.todayVisitors}명`}</strong>
            <span className="stat-desc">최근 7일: {loading ? '-' : `${stats.weekVisitors}명`}</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-lbl">자재주문 현황</span>
              <Clipboard size={16} className="stat-icon text-indigo" />
            </div>
            <strong className="stat-val highlighted">{loading ? '-' : `${stats.pendingOrders}건`}</strong>
            <span className="stat-desc">오늘 신규 주문: {loading ? '-' : `${stats.todayNewOrders}건`}</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-lbl">견적 및 상담 현황</span>
              <FileText size={16} className="stat-icon text-emerald" />
            </div>
            <strong className="stat-val">{loading ? '-' : `${stats.newEstimates + stats.newInquiries}건`}</strong>
            <span className="stat-desc">신규 견적: {stats.newEstimates}건 / 고객문의: {stats.newInquiries}건</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-lbl">전체 상품 및 자재</span>
              <Layers size={16} className="stat-icon text-purple" />
            </div>
            <strong className="stat-val">{loading ? '-' : `${stats.totalProducts}종`}</strong>
            <span className="stat-desc">노출(판매) 중인 자재: {loading ? '-' : `${stats.activeProducts}종`}</span>
          </div>
        </div>

        {/* 3. Reorganized menu buttons grid */}
        <div className="dashboard-menu-grid">
          <button className="dashboard-card" onClick={() => navigate('/admin-orders')}>
            <Clipboard size={32} className="card-icon text-indigo" />
            <div className="card-title">자재주문 관리</div>
            <div className="card-desc">고객이 접수한 주문 목록 조회 및 상태 변경</div>
          </button>

          <button className="dashboard-card" onClick={() => navigate('/admin/estimates')}>
            <FileText size={32} className="card-icon text-sky" />
            <div className="card-title">견적요청 관리</div>
            <div className="card-desc">고객의 자동 견적 계산 요청 및 내역 확인</div>
          </button>

          <button className="dashboard-card" onClick={() => navigate('/admin/estimate-inquiries')}>
            <FileText size={32} className="card-icon text-emerald" />
            <div className="card-title">상세견적 접수 관리</div>
            <div className="card-desc">상세 견적문의 및 상담 접수 현황 처리</div>
          </button>

          <button className="dashboard-card" onClick={() => navigate('/admin/products')}>
            <LayoutGrid size={32} className="card-icon text-rose" />
            <div className="card-title">상품 관리</div>
            <div className="card-desc">사이트에 노출되는 판매 상품 목록과 진열 여부 설정</div>
          </button>

          <button className="dashboard-card" onClick={() => navigate('/admin/materials')}>
            <Layers size={32} className="card-icon text-purple" />
            <div className="card-title">자재 관리</div>
            <div className="card-desc">전체 자재 DB 규격, 단가, 브랜드, 카테고리 관리</div>
          </button>

          <button className="dashboard-card" onClick={() => navigate('/admin/inquiries')}>
            <MessageSquare size={32} className="card-icon text-orange" />
            <div className="card-title">견적문의 관리</div>
            <div className="card-desc">일반 고객 문의 내역 확인 및 상담 상태 제어</div>
          </button>

          <button className="dashboard-card" onClick={() => navigate('/admin/prompt-assistant')}>
            <Wand2 size={32} className="card-icon text-violet" />
            <div className="card-title">작업 프롬프트 비서</div>
            <div className="card-desc">디자인 및 코드 변경 요청을 위한 지시서 프롬프트 작성</div>
          </button>

          <button className="dashboard-card" onClick={() => navigate('/admin/construction-cases')}>
            <Activity size={32} className="card-icon text-teal" />
            <div className="card-title">시공사례 관리</div>
            <div className="card-desc">시공 포트폴리오 사례 등록 및 대표 이미지 관리</div>
          </button>

          <button className="dashboard-card" onClick={() => navigate('/admin/analytics')}>
            <TrendingUp size={32} className="card-icon text-blue" />
            <div className="card-title">방문자 통계</div>
            <div className="card-desc">접속 트래픽 집계 및 인기 페이지 실시간 분석</div>
          </button>
        </div>

        {/* Action button */}
        <div className="dashboard-actions">
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={18} />
            로그아웃
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
