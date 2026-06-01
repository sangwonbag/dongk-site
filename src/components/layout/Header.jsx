import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, BookOpen, Layers } from "lucide-react";
import { fetchAllProducts } from "../../utils/supabaseFetcher";
import { getSearchScore, RECOMMENDATIONS, normalizeSearchText, tokenizeSearchQuery, handleSearchRedirect } from "../../utils/searchUtils";
import { getSupabaseImageUrl } from "../../utils/getSupabaseImageUrl";
import { useEstimateCart } from "../../contexts/EstimateCartContext";
import { FileText, Settings, LogOut } from "lucide-react";
import { getCurrentUser, logout } from "../../lib/auth";
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
          <b key={i} style={{ color: '#111', fontWeight: '900' }}>{part}</b>
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

  const scrollToFooter = () => {
    const footer = document.querySelector('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const [q, setQ] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("search") || "";
  });
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);
  const { cartItems } = useEstimateCart();
  const estimateCount = cartItems.length;

  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logout();
    nav('/');
  };

  const debouncedQ = useDebounce(q, 300);
  const [dbMaterials, setDbMaterials] = useState([]);

  // Fetch materials from Supabase on search focus to keep it dynamic and fast
  useEffect(() => {
    if (isFocused && dbMaterials.length === 0) {
      console.log("[Debug] Search input focused. Fetching materials for autocomplete...");
      fetchAllProducts().then(setDbMaterials).catch(console.error);
    }
  }, [isFocused, dbMaterials.length]);

  // Sync search input with URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search");
    if (searchParam !== null && searchParam !== q) {
      setQ(searchParam);
    } else if (searchParam === null && q !== "") {
      setQ("");
    }
  }, [location.search]);

  // Close dropdown when clicking outside or navigating
  useEffect(() => {
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

  // Compute search results based on debounced query
  const searchResults = useMemo(() => {
    const query = debouncedQ.trim();
    if (!query) return { type: "none", items: [] };

    const normQuery = normalizeSearchText(query);
    
    // Check if there are matching products
    let scored = [];
    if (dbMaterials && dbMaterials.length > 0) {
      scored = dbMaterials
        .map(m => ({ item: m, score: getSearchScore(m, query) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score);
    }

    if (scored.length > 0) {
      // Top 20 results for performance
      return { type: "products", items: scored.slice(0, 20).map(x => x.item) };
    }

    // Check recommendations if no product matches
    const recommendations = RECOMMENDATIONS.filter(r => r.trigger === normQuery);
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
        nav(`/materials?${sp.toString()}`);
      }
      setIsFocused(false);
      return;
    }
    
    // Find the best matching product synchronously to determine its category and brand
    let topProduct = null;
    if (dbMaterials && dbMaterials.length > 0) {
      const scored = dbMaterials
        .map(m => ({ item: m, score: getSearchScore(m, keyword) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score);
      
      if (scored.length > 0) {
        topProduct = scored[0].item;
      }
    }

    const customNav = (url) => {
      // If handleSearchRedirect returns a simple search URL
      if (url.startsWith('/materials?search=')) {
        const newParams = new URLSearchParams();
        newParams.set('search', keyword);
        
        // Navigate to the exact category and brand of the top matching product
        if (topProduct) {
          if (topProduct.category) newParams.set('category', topProduct.category);
          if (topProduct.brand) {
            const b = topProduct.brand;
            const brandFormat = b.toLowerCase() === 'lx' ? 'LX' : (b.toLowerCase() === 'kcc' ? 'KCC' : b);
            newParams.set('brand', brandFormat);
          }
          if (topProduct.line) newParams.set('line', topProduct.line);
          if (topProduct.materialType) newParams.set('type', topProduct.materialType);
        } else if (location.pathname === '/materials') {
          // Fallback: preserve existing params if no product found
          const currentParams = new URLSearchParams(location.search);
          if (currentParams.has('category')) newParams.set('category', currentParams.get('category'));
          if (currentParams.has('brand')) newParams.set('brand', currentParams.get('brand'));
          if (currentParams.has('line')) newParams.set('line', currentParams.get('line'));
          if (currentParams.has('type')) newParams.set('type', currentParams.get('type'));
        }
        
        nav(`/materials?${newParams.toString()}`);
      } else {
        nav(url);
      }
    };

    handleSearchRedirect(keyword, customNav);
    setIsFocused(false);
  };

  const handleProductClick = (item) => {
    nav(`/materials/${item.id}`);
    setIsFocused(false);
  };

  const handleRecommendationClick = (rec) => {
    handleSearchRedirect(rec.query, nav);
    setIsFocused(false);
  };

  return (
    <div className="header-wrapper">
      {/* Top Notice Bar */}
      <div className="top-notice-bar">
        <div className="container notice-row">
          <div className="notice-left">
            <span className="speaker-icon">📢</span>
            <span>전문 시공팀과 함께 자재 공급부터 시공까지 원스톱 서비스를 제공합니다.</span>
          </div>
          <div className="notice-links">
            <span className="notice-link" onClick={() => nav("/")}>회사소개</span>
            <span className="notice-separator">|</span>
            <span className="notice-link" onClick={() => nav("/materials")}>시공사례</span>
            <span className="notice-separator">|</span>
            <span className="notice-link" onClick={scrollToFooter}>고객센터</span>
          </div>
        </div>
      </div>

      <header className="mall-header">
        <div className="container header-row">
          {/* Logo */}
          <div className="header-logo" onClick={() => nav("/")}>
            <span className="logo-title">DK Floor</span>
            <span className="logo-subtitle">동경바닥재</span>
          </div>

        {/* Search */}
        <div className="header-search" ref={dropdownRef}>
          <form onSubmit={onSearch}>
            <input
              type="text"
              placeholder="제품번호, 브랜드, 종류, 규격을 검색하세요"
              value={q}
              onChange={(e) => {
                const val = e.target.value;
                setQ(val);
                if (val.trim() === "" && location.pathname === "/materials") {
                  const sp = new URLSearchParams(location.search);
                  if (sp.has("search")) {
                    sp.delete("search");
                    nav(`/materials?${sp.toString()}`);
                  }
                }
              }}
              onFocus={() => setIsFocused(true)}
            />
            <button type="submit">
              <Search size={20} />
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
                        <div className="search-code">
                          <HighlightText text={item.code || item.name} highlight={q} />
                        </div>
                        <div className="search-meta">
                          <HighlightText text={`${item.brand} > ${item.category}`} highlight={q} />
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
                      <Search size={14} /> <span>{rec.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.type === "empty" && debouncedQ === q && (
                <div className="search-empty">
                  검색 결과가 없습니다. 제품번호 또는 브랜드명을 다시 확인해주세요.
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

        {/* Nav Icons */}
        <nav className="header-nav">
          <button onClick={() => nav("/materials")}>
            <Layers size={20} />
            <span>자재</span>
          </button>
          <button onClick={() => nav("/samplebooks")}>
            <BookOpen size={20} />
            <span>샘플북</span>
          </button>
          <button onClick={() => nav("/cart")}>
            <ShoppingCart size={20} />
            <span>장바구니</span>
          </button>
          <button onClick={() => nav("/estimate/request")} style={{ position: 'relative' }}>
            <FileText size={20} />
            <span>견적문의</span>
            {estimateCount > 0 && <span className="estimate-badge">{estimateCount}</span>}
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
            <button onClick={() => nav("/login")}>
              <User size={20} />
              <span>로그인</span>
            </button>
          )}
        </nav>
      </div>
      </header>
    </div>
  );
}
