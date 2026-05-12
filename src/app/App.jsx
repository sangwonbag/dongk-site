import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEstimateCart } from "../contexts/EstimateCartContext";
// Pages
import Home from "../pages/Home/Home";
import SampleBooks from "../pages/Samplebooks/SampleBooks";
import Materials from "../pages/Materials/Materials";
import MaterialDetail from "../pages/MaterialDetail/MaterialDetail";
import Cart from "../pages/Cart/Cart";
import Login from "../pages/Login/Login";
import Inquiries from "../pages/Admin/Inquiries";
import EstimateRequest from "../pages/Estimate/EstimateRequest";
import AdminDashboard from "../pages/Admin/Dashboard/AdminDashboard";
import AdminEstimates from "../pages/Admin/Estimates/AdminEstimates";
import AdminEstimateDetail from "../pages/Admin/Estimates/AdminEstimateDetail";
import AdminRoute from "../components/auth/AdminRoute";

// Global Components
import AIChatWidget from "../components/chat/AIChatWidget";

export default function App() {
  const { toast, hideToast } = useEstimateCart();
  const navigate = useNavigate();

  return (
    <>
      {toast.visible && (
        <div className="estimate-toast">
          <span>{toast.message}</span>
          <div className="estimate-toast-actions">
            <button className="btn-secondary" onClick={hideToast}>계속 둘러보기</button>
            <button className="btn-primary" onClick={() => {
              hideToast();
              navigate('/estimate/request');
            }}>견적요청 작성하기</button>
          </div>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/samplebooks" element={<SampleBooks />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/materials/:id" element={<MaterialDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/estimate/request" element={<EstimateRequest />} />
        <Route path="/login" element={<Login />} />
        
        {/* Admin Protected Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/inquiries" element={<AdminRoute><Inquiries /></AdminRoute>} />
        <Route path="/admin/estimates" element={<AdminRoute><AdminEstimates /></AdminRoute>} />
        <Route path="/admin/estimates/:id" element={<AdminRoute><AdminEstimateDetail /></AdminRoute>} />
        {/* Placeholder for products and materials */}
        <Route path="/admin/products" element={<AdminRoute><div style={{padding: '100px', textAlign: 'center'}}>상품 관리 준비 중</div></AdminRoute>} />
        <Route path="/admin/materials" element={<AdminRoute><div style={{padding: '100px', textAlign: 'center'}}>자재 관리 준비 중</div></AdminRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AIChatWidget />
    </>
  );
}
