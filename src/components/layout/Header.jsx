import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Search, ShoppingCart, User, BookOpen, Layers, X } from "lucide-react";
import { searchMaterials } from "../../utils/supabaseFetcher";
import { getSearchScore, generateAutocompleteSuggestions, normalizeSearchText, tokenizeSearchQuery, handleSearchRedirect } from "../../utils/searchUtils";
import { getSupabaseImageUrl } from "../../utils/getSupabaseImageUrl";
import { useEstimateCart } from "../../contexts/EstimateCartContext";
import { FileText, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { preloadRoute } from "../../utils/routePreloader";
import "./Header.css";

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Simple highlighter component for search results
const HighlightText = ({ text, highlight }) => {
  if (!highlight || !text) return <>{text}</>;
  const tokens = tokenizeSearchQuery(highlight);
  if (tokens.length === 0) return <>{text}</>;

  // Escape regex special chars
  const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'gi');
  
  const parts = text.toString().split(regex);
  return (
    <>
      {parts.map((part, i) =>
        tokens.some(t => t.toLowerCase() === part.toLowerCase()) ? (
          <b key={i} style={{ color: 'var(--point-gold)', fontWeight: '700' }}>{part}</b>
        ) : (
          part
        )
      )}
    </>
  );
};

export default function Header() {
  const nav = useNavigate();
  const location = useLocation();

  const [q, setQ] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("search") || "";
  });
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);
  const mallHeaderRef = useRef(null);
  const noticeRef = useRef(null);
  const { cartCount, clearCart } = useEstimateCart();
  const estimateCount = cartCount;

  const { user: currentUser, logout: authLogout, openLoginModal } = useAuth();

  const handleLogout = async () => {
    await clearCart({ clearAll: true });
    authLogout();
    nav('/');
    window.location.reload();
  };

  const prefetchMaterials = () => {
    preloadRoute('/materials');
  };

  const handleEstimateNav = () => {
    preloadRoute('/estimate');
    nav('/estimate/request');
  };

  // Scroll responsive styling states
  const isHome = location.pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isHome) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsScrolled(true);
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 50) {
            setIsScrolled(true);
          } else {
            setIsScrolled(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  // Close mobile menu on path changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const debouncedQ = useDebounce(q, 300);
  const [dbMaterials, setDbMaterials] = useState([]);

  // Search the catalogue, not only the first 100 home-page products.
  useEffect(() => {
    const controller = new AbortController();
    setDbMaterials([]);
    if (!isFocused || !debouncedQ.trim()) return () => controller.abort();
    searchMaterials(debouncedQ, controller.signal)
      .then(items => { if (!controller.signal.aborted) setDbMaterials(items); })
      .catch(error => { if (error.name !== 'AbortError') console.warn(error); });
    return () => controller.abort();
  }, [isFocused, debouncedQ]);

  // Sync search input with URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("q") || params.get("search");
    if (searchParam !== null && searchParam !== q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQ(searchParam);
    } else if (searchParam === null && q !== "") {
      setQ("");
    }
  }, [location.search]);

  // Close dropdown when clicking outside or navigating
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFocused(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Handle ESC key to close search dropdown and mobile menu drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsFocused(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Measure header & notice heights dynamically and set CSS custom properties
  useEffect(() => {
    const updateHeights = () => {
      const mallHeader = mallHeaderRef.current;
      const noticeBar = noticeRef.current;

      const headerHeight = mallHeader ? mallHeader.getBoundingClientRect().height : 80;
      const noticeHeight = noticeBar ? noticeBar.getBoundingClientRect().height : 0;

      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
      document.documentElement.style.setProperty('--notice-height', `${noticeHeight}px`);
      
      // Keep --mobile-header-height for backwards compatibility
      document.documentElement.style.setProperty('--mobile-header-height', `${headerHeight + noticeHeight}px`);
    };

    updateHeights();

    const observer = new ResizeObserver(updateHeights);
    if (mallHeaderRef.current) observer.observe(mallHeaderRef.current);
    if (noticeRef.current) observer.observe(noticeRef.current);

    window.addEventListener("resize", updateHeights);
    window.addEventListener("orientationchange", updateHeights);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeights);
      window.removeEventListener("orientationchange", updateHeights);
    };
  }, [mobileMenuOpen, isScrolled, isHome, location.pathname]);

  // Compute search results based on debounced query
  const searchResults = useMemo(() => {
    const query = debouncedQ.trim();
    if (!query) return { type: "none", items: [] };

    // Check if there are matching products
    let scored = [];
    if (dbMaterials && dbMaterials.length > 0) {
      scored = dbMaterials
        .map(m => ({ item: m, score: getSearchScore(m, query) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score);
    }

    if (scored.length > 0) {
      // Top 8 results for performance and elegance
      return { type: "products", items: scored.slice(0, 8).map(x => x.item) };
    }

    // Check recommendations if no direct product matches
    const recommendations = generateAutocompleteSuggestions(query);
    if (recommendations.length > 0) {
      return { type: "recommendations", items: recommendations };
    }

    return { type: "empty", items: [] };
  }, [debouncedQ, dbMaterials]);

  const onSearch = (e) => {
    e.preventDefault();
    const keyword = q.trim();
    if (!keyword) {
      if (location.pathname === "/materials") {
        const sp = new URLSearchParams(location.search);
        sp.delete("search");
        sp.delete("q");
        nav(`/materials?${sp.toString()}`);
      }
      setIsFocused(false);
      return;
    }
    
    handleSearchRedirect(keyword, nav);
    setIsFocused(false);
  };

  const handleProductClick = (item) => {
    nav(`/materials/${encodeURIComponent(item.slug || item.id)}`);
    setIsFocused(false);
  };

  const handleRecommendationClick = (rec) => {
    handleSearchRedirect(rec.query, nav);
    setIsFocused(false);
  };

  return (
    <div className={`header-wrapper ${isHome ? "is-home" : ""} ${isHome && !isScrolled ? "is-home-transparent" : "is-scrolled"}`}>
      {/* Top Banner Notice */}
      {!location.pathname.startsWith('/admin') && (
        <div className="top-notice-bar">
          <div className="container notice-container">
            <div className="notice-text">
              <span className="speaker-icon">📢</span>
              <span>전문 시공팀과 함께 자재 공급부터 시공까지 원스톱 서비스를 제공합니다.</span>
            </div>
          </div>
        </div>
      )}

      <header ref={mallHeaderRef} className="mall-header">
        <div className="container header-row">
          {/* Logo */}
          <Link to="/" className="header-logo" onMouseEnter={() => preloadRoute('/')}>
            <span className="logo-title">DK Floor</span>
            <span className="logo-subtitle">동경바닥재</span>
          </Link>

          {/* Desktop Navigation Links - Spruce Showroom Style */}
          <nav className="header-menu-links">
            <Link 
              to="/materials"
              className={`menu-link ${location.pathname === '/materials' ? 'active' : ''}`} 
              onMouseEnter={prefetchMaterials}
              onTouchStart={prefetchMaterials}
            >
              자재찾기
            </Link>

            <Link 
              to="/samplebooks"
              className={`menu-link ${location.pathname === '/samplebooks' ? 'active' : ''}`} 
              onMouseEnter={() => preloadRoute('/samplebooks')}
              onTouchStart={() => preloadRoute('/samplebooks')}
            >
              샘플북
            </Link>

            <Link 
              to="/guide"
              className={`menu-link ${location.pathname.startsWith('/guide') ? 'active' : ''}`} 
              onMouseEnter={() => preloadRoute('/guide')}
              onTouchStart={() => preloadRoute('/guide')}
            >
              바닥재 가이드
            </Link>

            <Link 
              to="/estimate/request"
              className={`menu-link ${location.pathname === '/estimate/request' || location.pathname === '/estimate' ? 'active' : ''}`} 
              onMouseEnter={() => preloadRoute('/estimate')}
              onTouchStart={() => preloadRoute('/estimate')}
            >
              견적문의
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="header-search" ref={dropdownRef}>
            <form onSubmit={onSearch}>
              <input
                type="text"
                placeholder="제품번호, 브랜드, 자재명 검색"
                value={q}
                onChange={(e) => {
                  const val = e.target.value;
                  setQ(val);
                  if (val.trim() === "" && location.pathname === "/materials") {
                    const sp = new URLSearchParams(location.search);
                    if (sp.has("search") || sp.has("q")) {
                      sp.delete("search");
                      sp.delete("q");
                      nav(`/materials?${sp.toString()}`);
                    }
                  }
                }}
                onFocus={() => setIsFocused(true)}
              />
              {q && (
                <button
                  type="button"
                  className="header-search-clear-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQ("");
                    if (location.pathname === "/materials") {
                      const sp = new URLSearchParams(location.search);
                      sp.delete("search");
                      sp.delete("q");
                      nav(`/materials?${sp.toString()}`);
                    }
                  }}
                  aria-label="검색어 지우기"
                >
                  <X size={15} />
                </button>
              )}
              <button type="submit" aria-label="검색 실행">
                <Search size={18} />
              </button>
            </form>

            {/* Autocomplete Dropdown */}
            {isFocused && q.trim().length > 0 && (
              <div className="search-dropdown">
                {searchResults.type === "products" && (
                  <div className="search-results-list">
                    {searchResults.items.map(item => (
                      <div key={item.id} className="search-result-item" onClick={() => handleProductClick(item)}>
                        <div className="search-thumb">
                          <img src={getSupabaseImageUrl(item.thumbnail)} alt={item.name} />
                        </div>
                        <div className="search-info">
                          <div className="search-title-row">
                            <span className="search-brand-tag">{item.brand}</span>
                            <span className="search-code-text">
                              <HighlightText text={item.code || item.name} highlight={q} />
                            </span>
                            {item.line && <span className="search-line-tag">{item.line}</span>}
                          </div>
                          <div className="search-desc-row">
                            <span className="search-name-text">
                              <HighlightText text={item.name} highlight={q} />
                            </span>
                            {(item.thickness || item.specs?.size) && (
                              <span className="search-spec-text">
                                {[item.thickness, item.specs?.size].filter(Boolean).join(' · ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.type === "recommendations" && (
                  <div className="search-recommendations-list">
                    <div className="search-recommendation-title">추천 검색어</div>
                    {searchResults.items.map((rec, i) => (
                      <div key={i} className="search-recommendation-item" onClick={() => handleRecommendationClick(rec)}>
                        {rec.badge && <span className="search-rec-badge">{rec.badge}</span>}
                        <div className="search-rec-content">
                          <div className="search-rec-title">
                            <HighlightText text={rec.title || rec.query} highlight={q} />
                          </div>
                          {rec.subtitle && <div className="search-rec-sub">{rec.subtitle}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.type === "empty" && debouncedQ === q && (
                  <div className="search-empty">
                    검색 결과가 없습니다.
                  </div>
                )}
                {searchResults.type === "empty" && debouncedQ !== q && (
                  <div className="search-empty loading">
                    검색 중...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Nav Icons / Account Controls */}
          <nav className="header-nav">
            <button className="cart-nav-btn" onClick={() => nav("/cart")} style={{ position: 'relative' }}>
              <ShoppingCart size={20} />
              <span>장바구니</span>
              {currentUser && estimateCount > 0 && <span className="estimate-badge">{estimateCount}</span>}
            </button>
            
            {currentUser ? (
              <>
                {currentUser.role === 'admin' && (
                  <button onClick={() => nav("/admin")}>
                    <Settings size={20} />
                    <span>관리</span>
                  </button>
                )}
                <button onClick={() => nav("/mypage")}>
                  <User size={20} />
                  <span>마이페이지</span>
                </button>
                <button onClick={handleLogout}>
                  <LogOut size={20} />
                  <span>로그아웃</span>
                </button>
              </>
            ) : (
              <button className="login-nav-btn" onClick={openLoginModal}>
                <User size={20} />
                <span>로그인</span>
              </button>
            )}
          </nav>

          {/* Hamburger menu for mobile */}
          <button 
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="drawer-menu-links">
          <span className="drawer-link" onClick={() => { nav("/"); setMobileMenuOpen(false); }}>홈</span>
          <span 
            className="drawer-link" 
            onClick={() => { nav("/materials"); setMobileMenuOpen(false); }}
            onTouchStart={prefetchMaterials}
          >
            자재찾기
          </span>
          <span className="drawer-link" onClick={() => { nav("/samplebooks"); setMobileMenuOpen(false); }}>샘플북</span>
          <span className="drawer-link" onClick={() => { nav("/guide"); setMobileMenuOpen(false); }}>바닥재 가이드</span>
          <span className="drawer-link" onClick={() => { nav("/cases"); setMobileMenuOpen(false); }}>시공사례</span>
          <span className="drawer-link" onClick={() => { handleEstimateNav(); setMobileMenuOpen(false); }}>견적문의</span>
        </div>
        <div className="drawer-actions">
          <button className="drawer-cart-btn" onClick={() => { nav("/cart"); setMobileMenuOpen(false); }}>
            <ShoppingCart size={18} style={{ marginRight: '6px' }} />
            장바구니 ({currentUser ? estimateCount : 0})
          </button>
          {currentUser ? (
            <div className="drawer-account-group">
              {currentUser.role === 'admin' && (
                <button onClick={() => { nav("/admin"); setMobileMenuOpen(false); }}>관리자 패널</button>
              )}
              <button onClick={() => { nav("/mypage"); setMobileMenuOpen(false); }}>마이페이지</button>
              <button className="drawer-logout-btn" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>로그아웃</button>
            </div>
          ) : (
            <button className="drawer-login-btn" onClick={() => { openLoginModal(); setMobileMenuOpen(false); }}>로그인</button>
          )}
        </div>
      </div>
    </div>
  );
}
