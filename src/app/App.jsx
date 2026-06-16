import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEstimateCart } from "../contexts/EstimateCartContext";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "../components/auth/AuthModal";
// Pages
import Home from "../pages/Home/Home";
import SampleBooks from "../pages/Samplebooks/SampleBooks";
import Materials from "../pages/Materials/Materials";
import MaterialDetail from "../pages/MaterialDetail/MaterialDetail";
import Cart from "../pages/Cart/Cart";
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";
import MyPage from "../pages/MyPage/MyPage";
import PrivacyPolicy from "../pages/PrivacyPolicy/PrivacyPolicy";
import TermsOfService from "../pages/TermsOfService/TermsOfService";
import Inquiries from "../pages/Admin/Inquiries";
import EstimateRequest from "../pages/Estimate/EstimateRequest";
import AdminDashboard from "../pages/Admin/Dashboard/AdminDashboard";
import AdminEstimates from "../pages/Admin/Estimates/AdminEstimates";
import AdminEstimateDetail from "../pages/Admin/Estimates/AdminEstimateDetail";
import AdminRoute from "../components/auth/AdminRoute";

// New Order Flow Pages
import Checkout from "../pages/Cart/Checkout";
import OrderComplete from "../pages/Cart/OrderComplete";
import OrderHistory from "../pages/Cart/OrderHistory";
import AdminOrders from "../pages/Admin/Orders/AdminOrders";

// Global Components
import IntroSplash from "../components/layout/IntroSplash";

export default function App() {
  const { toast, hideToast } = useEstimateCart();
  const { isLoginModalOpen, closeLoginModal } = useAuth();
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(false);

  // Hash route support (#orders, #admin-orders)
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#orders" || hash === "#/orders") {
        navigate("/orders");
      } else if (hash === "#admin-orders" || hash === "#/admin-orders") {
        navigate("/admin-orders");
      }
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [navigate]);

  const handleAuthSuccess = (u) => {
    console.log('Auth success', u);
    const pending = localStorage.getItem("pendingDirectOrder");
    if (pending) {
      navigate("/checkout");
    }
  };

  return (
    <>
      {showIntro && <IntroSplash onFinish={() => setShowIntro(false)} />}
      <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} onSuccess={handleAuthSuccess} />
      {toast.visible && (
        <div className="estimate-toast">
          <span>{toast.message}</span>
          <div className="estimate-toast-actions">
            <button className="btn-secondary" onClick={hideToast}>계속 둘러보기</button>
            <button className="btn-primary" onClick={() => {
              hideToast();
              navigate('/cart');
            }}>장바구니 보기</button>
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
        <Route path="/estimate" element={<EstimateRequest />} />
        <Route path="/quote" element={<EstimateRequest />} />
        <Route path="/company" element={<Home />} />
        <Route path="/cases" element={<Materials />} />
        <Route path="/customer-center" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        
        {/* Admin Protected Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/inquiries" element={<AdminRoute><Inquiries /></AdminRoute>} />
        <Route path="/admin/estimates" element={<AdminRoute><AdminEstimates /></AdminRoute>} />
        <Route path="/admin/estimates/:id" element={<AdminRoute><AdminEstimateDetail /></AdminRoute>} />
        {/* Placeholder for products and materials */}
        <Route path="/admin/products" element={<AdminRoute><div style={{padding: '100px', textAlign: 'center'}}>상품 관리 준비 중</div></AdminRoute>} />
        <Route path="/admin/materials" element={<AdminRoute><div style={{padding: '100px', textAlign: 'center'}}>자재 관리 준비 중</div></AdminRoute>} />
        
        {/* Actual Ordering Routes */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-complete" element={<OrderComplete />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/admin-orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
