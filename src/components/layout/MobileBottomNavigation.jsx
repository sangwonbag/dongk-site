import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Layers, FileText, ShoppingCart, User } from "lucide-react";
import { useEstimateCart } from "../../contexts/EstimateCartContext";
import { useAuth } from "../../contexts/AuthContext";
import "./MobileBottomNavigation.css";

export default function MobileBottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useEstimateCart();
  const { user, openLoginModal } = useAuth();

  const pathname = location.pathname;

  // Don't display bottom navigation on checkout screen if direct buy flow requires focused view,
  // or keep it visible with safe bottom spacing.
  const isCheckout = pathname === "/checkout";

  const handleMyPageClick = (e) => {
    e.preventDefault();
    if (user) {
      navigate("/mypage");
    } else {
      openLoginModal();
    }
  };

  const navItems = [
    {
      id: "home",
      label: "홈",
      path: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      id: "materials",
      label: "자재찾기",
      path: "/materials",
      icon: Layers,
      isActive: pathname.startsWith("/materials"),
    },
    {
      id: "estimate",
      label: "자동견적",
      path: "/estimate/request",
      icon: FileText,
      isActive: pathname.startsWith("/estimate"),
    },
    {
      id: "cart",
      label: "장바구니",
      path: "/cart",
      icon: ShoppingCart,
      isActive: pathname === "/cart",
      badge: cartCount,
    },
    {
      id: "mypage",
      label: "마이페이지",
      path: "/mypage",
      icon: User,
      isActive: pathname === "/mypage" || pathname === "/login",
      onClick: handleMyPageClick,
    },
  ];

  return (
    <nav className={`mobile-bottom-nav ${isCheckout ? "hide-on-checkout" : ""}`} aria-label="하단 네비게이션">
      <div className="mobile-bottom-nav-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const activeClass = item.isActive ? "active" : "";

          if (item.onClick) {
            return (
              <button key={item.id} className={`mobile-nav-tab ${activeClass}`} onClick={item.onClick} aria-label={item.label}>
                <div className="mobile-nav-icon-wrapper">
                  <Icon size={22} className="mobile-nav-icon" />
                  {item.badge > 0 && (
                    <span className="mobile-tab-badge">{item.badge > 99 ? "99+" : item.badge}</span>
                  )}
                </div>
                <span className="mobile-nav-label">{item.label}</span>
              </button>
            );
          }

          return (
            <Link key={item.id} to={item.path} className={`mobile-nav-tab ${activeClass}`} aria-label={item.label}>
              <div className="mobile-nav-icon-wrapper">
                <Icon size={22} className="mobile-nav-icon" />
                {item.badge > 0 && (
                  <span className="mobile-tab-badge">{item.badge > 99 ? "99+" : item.badge}</span>
                )}
              </div>
              <span className="mobile-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
