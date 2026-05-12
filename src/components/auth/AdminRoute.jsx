import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin } from '../../lib/auth';

export default function AdminRoute({ children }) {
  if (!isAdmin()) {
    // 경고 토스트나 메시지를 띄우려면 여기서 처리 가능
    alert('로그인이 필요하거나 접근 권한이 없습니다.');
    return <Navigate to="/login" replace />;
  }

  return children;
}
