import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';
import { logout } from '../../../lib/auth';
import { FileText, Package, Layers, MessageSquare, LogOut } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <MainLayout>
      <div className="admin-dashboard-container">
        <div className="dashboard-header">
          <h1>관리자 대시보드</h1>
          <p>동경바닥재 관리자 시스템에 오신 것을 환영합니다.</p>
        </div>

        <div className="dashboard-menu-grid">
          <button className="dashboard-card" onClick={() => navigate('/admin/estimates')}>
            <FileText size={40} className="card-icon text-blue" />
            <div className="card-title">견적요청 관리</div>
            <div className="card-desc">고객이 접수한 견적요청 확인 및 견적서 출력</div>
          </button>

          <button className="dashboard-card" onClick={() => navigate('/admin/products')}>
            <Package size={40} className="card-icon text-green" />
            <div className="card-title">상품 관리</div>
            <div className="card-desc">사이트에 등록된 추천/기획 상품 관리</div>
          </button>

          <button className="dashboard-card" onClick={() => navigate('/admin/materials')}>
            <Layers size={40} className="card-icon text-purple" />
            <div className="card-title">자재 관리</div>
            <div className="card-desc">전체 자재 DB 관리 및 규격 수정</div>
          </button>

          <button className="dashboard-card" onClick={() => navigate('/admin/inquiries')}>
            <MessageSquare size={40} className="card-icon text-orange" />
            <div className="card-title">고객 문의 관리</div>
            <div className="card-desc">1:1 문의 및 상담 내역 확인</div>
          </button>
        </div>

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
