import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, BookOpen, Layers } from "lucide-react";
import { materials } from "../../data/materials.db";
import { getSearchScore, RECOMMENDATIONS, normalizeSearchText } from "../../utils/searchUtils";
import { getSupabaseImageUrl } from "../../utils/getSupabaseImageUrl";
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

export default function Header() {
  const nav = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);

  const debouncedQ = useDebounce(q, 300);

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
    if (materials && materials.length > 0) {
      scored = materials
        .map(m => ({ item: m, score: getSearchScore(m, query) }))
        .filter(x => x.score < Infinity)
        .sort((a, b) => a.score - b.score);
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
  }, [debouncedQ]);

  // Original onSearch for enter key -> navigates to /materials?search=...
  const onSearch = (e) => {
    e.preventDefault();
    const keyword = q.trim();
    if (!keyword) return;
    nav(`/materials?search=${encodeURIComponent(keyword)}`);
    setIsFocused(false);
  };

  const handleProductClick = (item) => {
    nav(`/materials/${item.id}`);
    setIsFocused(false);
    setQ("");
  };

  const handleRecommendationClick = (rec) => {
    if (rec.type === "brand") nav(`/materials?brand=${encodeURIComponent(rec.query)}`);
    else if (rec.type === "size") nav(`/materials?search=${encodeURIComponent(rec.query)}`);
    else if (rec.type === "pattern") nav(`/materials?search=${encodeURIComponent(rec.query)}`);
    else nav(`/materials?search=${encodeURIComponent(rec.query)}`);
    setIsFocused(false);
    setQ("");
  };

  return (
    <header className="mall-header">
      <div className="container header-row">
        {/* Logo */}
        <div className="header-logo" onClick={() => nav("/")}>
          DK Floor
        </div>

        {/* Search */}
        <div className="header-search" ref={dropdownRef}>
          <form onSubmit={onSearch}>
            <input
              type="text"
              placeholder="제품번호, 브랜드, 규격, 자재명을 검색하세요"
              value={q}
              onChange={(e) => setQ(e.target.value)}
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
                        <div className="search-code">{item.code || item.name}</div>
                        <div className="search-meta">{item.brand} &gt; {item.category}</div>
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
          <button onClick={() => nav("/samplebooks")}>
            <BookOpen size={20} />
            <span>샘플북</span>
          </button>
          <button onClick={() => nav("/materials")}>
            <Layers size={20} />
            <span>자재</span>
          </button>
          <button onClick={() => nav("/cart")}>
            <ShoppingCart size={20} />
            <span>장바구니</span>
          </button>
          <button onClick={() => nav("/login")}>
            <User size={20} />
            <span>로그인</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
