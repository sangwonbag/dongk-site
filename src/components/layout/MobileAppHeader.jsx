import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft, Search, ShoppingCart, Home } from "lucide-react";
import { useEstimateCart } from "../../contexts/EstimateCartContext";
import "./MobileAppHeader.css";

export default function MobileAppHeader({ onOpenSearchModal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useEstimateCart();

  const isHome = location.pathname === "/";
  const isMaterials = location.pathname === "/materials";
  const isDetail = location.pathname.startsWith("/materials/");
  const isCart = location.pathname === "/cart";
  const isCheckout = location.pathname === "/checkout";
  const isEstimate = location.pathname.startsWith("/estimate");
  const isMyPage = location.pathname === "/mypage";
  const isCases = location.pathname.startsWith("/cases");
  const isSamplebooks = location.pathname.startsWith("/samplebooks");

  // Determine Page Title
  const getPageTitle = () => {
    if (isHome) return "동경바닥재";
    if (isMaterials) return "자재찾기";
    if (isDetail) return "상품 상세";
    if (isCart) return "장바구니";
    if (isCheckout) return "주문/결제";
    if (isEstimate) return "자동견적";
    if (isMyPage) return "마이페이지";
    if (isCases) return "시공사례";
    if (isSamplebooks) return "샘플북";
    return "동경바닥재";
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <header className="mobile-app-header">
      <div className="mobile-app-header-inner">
        {/* Left Action */}
        <div className="mobile-header-left">
          {!isHome ? (
            <button className="mobile-icon-btn back-btn" onClick={handleBack} aria-label="뒤로가기">
              <ArrowLeft size={22} />
            </button>
          ) : (
            <Link to="/" className="mobile-header-logo">
              <span className="logo-main">DK Floor</span>
            </Link>
          )}
        </div>

        {/* Center Title */}
        <div className="mobile-header-center">
          <h1 className="mobile-header-title">{getPageTitle()}</h1>
        </div>

        {/* Right Action Icons */}
        <div className="mobile-header-right">
          <Link to="/materials" className="mobile-icon-btn" aria-label="검색">
            <Search size={20} />
          </Link>

          <Link to="/cart" className="mobile-icon-btn cart-btn" aria-label="장바구니">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="mobile-cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
