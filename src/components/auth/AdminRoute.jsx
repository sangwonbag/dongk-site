import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../lib/auth';
import SEO from '../seo/SEO';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 세션 복원 중일 때는 조기 튕김 방지 (스피너 대기)
  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <LoadingSpinner />
        <p style={{ color: '#64748b', fontSize: '14px' }}>관리자 권한을 확인하고 있습니다...</p>
      </div>
    );
  }

  const isUserAdmin = (user && user.isLoggedIn && (user.role === 'admin' || user.role === 'staff')) || isAdmin();

  if (!isUserAdmin) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return (
    <>
      <SEO title="관리자 | 동경바닥재" noindex={true} />
      {children}
    </>
  );
}
