import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin } from '../../lib/auth';

export default function AdminRoute({ children }) {
  if (!isAdmin()) {
    alert('관리자만 접근할 수 있는 페이지입니다.');
    return <Navigate to="/login" replace />;
  }

  return children;
}
