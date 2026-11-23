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

const HEADER_SEARCH_CATEGORIES = [
  { value: "all", label: "전체 카테고리" },
  { value: "데코타일", label: "데코타일" },
  { value: "장판", label: "장판" },
  { value: "마루", label: "마루" },
  { value: "벽지", label: "벽지" },
  { value: "카페트타일", label: "카페트타일" },
  { value: "부자재", label: "부자재" }
];

export default function Header() {
  const nav = useNavigate();
  const location = useLocation();

  const [q, setQ] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("q") || params.get("search") || "";
  });
  const [searchCategory, setSearchCategory] = useState("all");
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

      const headerHeight = mallHeader ? mallHeader.getBoundingClientRect().height : 112;
      const noticeHeight = noticeBar ? noticeBar.getBoundingClientRect().height : 0;

      if (headerHeight > 0) {
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        document.documentElement.style.setProperty('--notice-height', `${noticeHeight}px`);
        document.documentElement.style.setProperty('--total-header-height', `${headerHeight + noticeHeight}px`);
      }
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
      if (searchCategory && searchCategory !== "all") {
        nav(`/materials?category=${encodeURIComponent(searchCategory)}`);
      } else if (location.pathname === "/materials") {
        const sp = new URLSearchParams(location.search);
        sp.delete("search");
        sp.delete("q");
        nav(`/materials?${sp.toString()}`);
      } else {
        nav("/materials");
      }
      setIsFocused(false);
      return;
    }

    if (searchCategory && searchCategory !== "all") {
      nav(`/materials?category=${encodeURIComponent(searchCategory)}&q=${encodeURIComponent(keyword)}`);
    } else {
      nav(`/materials?category=all&q=${encodeURIComponent(keyword)}`);
    }
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
    <div className={`header-wrapper ${isHome ? "is-home" : ""} is-scrolled`}>
      <header ref={mallHeaderRef} className="mall-header mall-header-search-centric">
        {/* Row 1: Logo + Large Coupang-style Unified Search Bar + Account/Cart */}
        <div className="container header-row header-top-row">
          {/* Logo */}
          <Link to="/" className="header-logo" onMouseEnter={() => preloadRoute('/')}>
            <span className="logo-title">DK Floor</span>
            <span className="logo-subtitle">동경바닥재</span>
          </Link>

          {/* Large Unified Search Bar */}
          <div className="header-search header-search-wide" ref={dropdownRef}>
            <form onSubmit={onSearch} className="header-search-form-wide">
              <select
                className="header-search-category-select"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                aria-label="검색 카테고리 선택"
              >
                {HEADER_SEARCH_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <span className="header-search-divider" aria-hidden="true" />
              <input
                type="text"
                className="header-search-input-wide"
                placeholder="상품번호, 브랜드, 색상, 자재명을 검색하세요"
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
              <button type="submit" className="header-search-submit-btn" aria-label="검색 실행">
                <span>검색</span>
                <Search size={17} />
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
            <button className="cart-nav-btn" onClick={() => nav("/cart")} style={{ position: 'relative' }} title="장바구니" aria-label="장바구니">
              <ShoppingCart size={20} />
              <span>장바구니</span>
              {currentUser && estimateCount > 0 && <span className="estimate-badge">{estimateCount}</span>}
            </button>
            
            {currentUser ? (
              <>
                {currentUser.role === 'admin' && (
                  <button className="admin-nav-btn" onClick={() => nav("/admin")} title="관리" aria-label="관리">
                    <Settings size={20} />
                    <span>관리</span>
                  </button>
                )}
                <button className="mypage-nav-btn" onClick={() => nav("/mypage")} title="마이페이지" aria-label="마이페이지">
                  <User size={20} />
                  <span>마이페이지</span>
                </button>
                <button className="logout-nav-btn" onClick={handleLogout} title="로그아웃" aria-label="로그아웃">
                  <LogOut size={20} />
                  <span>로그아웃</span>
                </button>
              </>
            ) : (
              <button className="login-nav-btn" onClick={openLoginModal} title="로그인" aria-label="로그인">
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

        {/* Row 2: High-Contrast Primary Navigation Links */}
        <div className="header-subnav-bar">
          <div className="container header-subnav-row">
            <nav className="header-menu-links" aria-label="주요 메뉴">
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

              <Link 
                to="/cases"
                className={`menu-link ${location.pathname.startsWith('/cases') ? 'active' : ''}`} 
                onMouseEnter={() => preloadRoute('/cases')}
                onTouchStart={() => preloadRoute('/cases')}
              >
                시공사례
              </Link>
            </nav>

            <div className="header-subnav-info">
              <span>자재 공급·시공 원스톱</span>
              <span className="header-subnav-sep">·</span>
              <a href="tel:024879775" className="header-subnav-tel">02-487-9775</a>
            </div>
          </div>
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
          <span className="drawer-link" onClick={() => { handleEstimateNav(); setMobileMenuOpen(false); }}>견적문의</span>
          <span className="drawer-link" onClick={() => { nav("/cases"); setMobileMenuOpen(false); }}>시공사례</span>
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
