import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEstimateCart } from "../contexts/EstimateCartContext";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "../components/auth/AuthModal";
import LazyErrorBoundary from "../components/ui/LazyErrorBoundary";
import MaterialsPageSkeleton from "../pages/Materials/MaterialsPageSkeleton";
import AdminRoute from "../components/auth/AdminRoute";
import { safeLazy } from "../utils/safeLazy";

const Home = safeLazy(() => import("../pages/Home/Home"));

const SampleBooks = safeLazy(() => import("../pages/Samplebooks/SampleBooks"));
const Materials = safeLazy(() => import("../pages/Materials/Materials"));
const MaterialDetail = safeLazy(() => import("../pages/MaterialDetail/MaterialDetail"));
const Cases = safeLazy(() => import("../pages/Cases/Cases"));
const Cart = safeLazy(() => import("../pages/Cart/Cart"));
const Login = safeLazy(() => import("../pages/Login/Login"));
const Signup = safeLazy(() => import("../pages/Signup/Signup"));
const LoginCallback = safeLazy(() => import("../pages/Login/LoginCallback"));
const MyPage = safeLazy(() => import("../pages/MyPage/MyPage"));
const PrivacyPolicy = safeLazy(() => import("../pages/PrivacyPolicy/PrivacyPolicy"));
const TermsOfService = safeLazy(() => import("../pages/TermsOfService/TermsOfService"));
const Inquiries = safeLazy(() => import("../pages/Admin/Inquiries"));
const EstimateRequest = safeLazy(() => import("../pages/Estimate/EstimateRequest"));

const AdminDashboard = safeLazy(() => import("../pages/Admin/Dashboard/AdminDashboard"));
const AdminEstimates = safeLazy(() => import("../pages/Admin/Estimates/AdminEstimates"));
const AdminEstimateDetail = safeLazy(() => import("../pages/Admin/Estimates/AdminEstimateDetail"));
const AdminEstimateInquiries = safeLazy(() => import("../pages/Admin/Estimates/AdminEstimateInquiries"));
const AdminPromptAssistant = safeLazy(() => import("../pages/AdminPromptAssistant/AdminPromptAssistant"));
const AdminAnalytics = safeLazy(() => import("../pages/AdminAnalytics/AdminAnalytics"));
const AdminConstructionCases = safeLazy(() => import("../pages/AdminConstructionCases/AdminConstructionCases"));
const AdminMaterials = safeLazy(() => import("../pages/AdminMaterials/AdminMaterials"));
const AdminProducts = safeLazy(() => import("../pages/AdminProducts/AdminProducts"));

// New Order Flow Pages
const Checkout = safeLazy(() => import("../pages/Cart/Checkout"));
const OrderComplete = safeLazy(() => import("../pages/Cart/OrderComplete"));
const OrderHistory = safeLazy(() => import("../pages/Cart/OrderHistory"));
const AdminOrders = safeLazy(() => import("../pages/Admin/Orders/AdminOrders"));

// Global Components
import IntroSplash from "../components/layout/IntroSplash";
import { logPageView } from "../lib/analytics";

export default function App() {
  const { toast, hideToast, getPendingDirectOrder } = useEstimateCart();
  const { isLoginModalOpen, closeLoginModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(false);

  // Track page views dynamically
  React.useEffect(() => {
    logPageView(location.pathname);
  }, [location.pathname]);

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
    const pending = getPendingDirectOrder();
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
      <LazyErrorBoundary>
        <React.Suspense fallback={<MaterialsPageSkeleton />}>
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
            <Route path="/cases" element={<Cases />} />
            <Route path="/customer-center" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login-callback" element={<LoginCallback />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            
            {/* Admin Protected Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/inquiries" element={<AdminRoute><Inquiries /></AdminRoute>} />
            <Route path="/admin/estimates" element={<AdminRoute><AdminEstimates /></AdminRoute>} />
            <Route path="/admin/estimates/:id" element={<AdminRoute><AdminEstimateDetail /></AdminRoute>} />
            <Route path="/admin/estimate-inquiries" element={<AdminRoute><AdminEstimateInquiries /></AdminRoute>} />
            <Route path="/admin/prompt-assistant" element={<AdminRoute><AdminPromptAssistant /></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
            <Route path="/admin/construction-cases" element={<AdminRoute><AdminConstructionCases /></AdminRoute>} />
            {/* Placeholder for products and materials */}
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="/admin/materials" element={<AdminRoute><AdminMaterials /></AdminRoute>} />
            
            {/* Actual Ordering Routes */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-complete" element={<OrderComplete />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/admin-orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </LazyErrorBoundary>
    </>
  );
}
