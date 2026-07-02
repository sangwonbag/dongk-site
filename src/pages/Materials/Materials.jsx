import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { getComputedBrand } from "../../utils/brandUtils";
import { getSearchScore } from "../../utils/searchUtils";
import MaterialCard from "../../components/material/MaterialCard";
import { fetchAllProducts } from "../../utils/supabaseFetcher";
import "./Materials.css";
import "./MaterialsPageSkeleton.css";

// 1. Categories specified by the user
const CATEGORIES = ["데코타일", "장판", "마루", "벽지", "카페트타일", "부자재"];

// 2. Brands specified by the user
const BRANDS_BY_CATEGORY = {
  데코타일: ["KCC", "동신", "재영", "유성", "LX", "녹수", "현대"],
  장판: ["LX"],
  마루: ["이건", "동화", "구정"],
  벽지: ["LX", "개나리", "서울", "제일", "DID", "신한", "현대벽지"],
  카페트타일: ["스완", "어반"],
  부자재: []
};

// Default brand selection for each category to prevent empty listings when tabs switch
const DEFAULT_BRAND_BY_CATEGORY = {
  데코타일: "KCC",
  장판: "LX",
  마루: "이건",
  벽지: "LX",
  카페트타일: "스완",
  부자재: "all"
};

const getNormalizedLine = (m, activeTab, activeBrand) => {
  if (!m || !m.line) return "";
  let line = m.line;
  if (line.includes('_')) {
    const parts = line.split('_').map(p => p.trim());
    if (activeTab === "마루") {
      line = parts[0];
    } else if (activeTab === "벽지") {
      let colName = parts[parts.length - 1];
      colName = colName.replace(/^(LX|신한벽지)_/, '');
      line = colName;
    } else if (activeTab === "데코타일") {
      const b = activeBrand.toUpperCase();
      if (b === "KCC" || b === "LX") {
        line = parts[1] || parts[0];
      } else {
        line = parts[0];
      }
    }
  }
  return line;
};

export default function Materials() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Supabase Data States
  const [materialsList, setMaterialsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Read state directly from URL query parameters (or default)
  const activeTab = searchParams.get("category") || "데코타일";
  
  // If there's an explicit category query, but no brand query: default to "all" (to show all brands).
  // If there's no category query either (first load): default to "KCC".
  const defaultBrand = searchParams.get("category") ? "all" : "KCC";
  const activeBrand = searchParams.get("brand") || defaultBrand;
  
  const activeMaterialType = searchParams.get("type") || "all";
  const activeLine = searchParams.get("line") || "all";
  const searchText = searchParams.get("search") || "";

  // Local input state for the search bar (for responsiveness while typing)
  const [searchInput, setSearchInput] = useState(searchText);

  // Pagination state (Optimized default to 24 for faster render)
  const [visibleCount, setVisibleCount] = useState(24);

  // Fetch from Supabase on mount
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        console.log("[Debug] Fetching all materials from Supabase...");
        const data = await fetchAllProducts();
        setMaterialsList(data);
      } catch (err) {
        console.error("[Debug] Supabase load error:", err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Sync search input state with URL search param changes
  useEffect(() => {
    setSearchInput(searchText);
  }, [searchText]);

  // Debounced search parameter update
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== searchText) {
        updateParams({ search: searchInput || null });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput, searchText]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(24);
  }, [activeTab, activeBrand, activeMaterialType, activeLine, searchText]);

  // Update query params helper
  const updateParams = (updates) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === "all") {
          newParams.delete(key);
        } else {
          newParams.set(key, val);
        }
      });
      return newParams;
    }, { replace: true });
  };

  const handleCategoryChange = (category) => {
    // Switch category and reset brand to its default corresponding brand
    const defaultBrand = DEFAULT_BRAND_BY_CATEGORY[category] || "all";
    updateParams({ category, brand: defaultBrand, type: null, line: null });
  };

  const setActiveBrand = (brand) => updateParams({ brand, type: null, line: null });
  const setActiveMaterialType = (type) => updateParams({ type });
  const setActiveLine = (line) => updateParams({ line });

  // Scroll restoration on return
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("materialsScrollY");
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll, 10));
        sessionStorage.removeItem("materialsScrollY");
      }, 50);
    }
  }, []);

  // Visible brands based on current category tab selection
  const visibleBrands = useMemo(() => {
    const list = BRANDS_BY_CATEGORY[activeTab] || [];
    return ["all", ...list];
  }, [activeTab]);

  // Visible lineups based on current category and brand selection
  const visibleLines = useMemo(() => {
    if (!materialsList || materialsList.length === 0 || activeTab === "all" || activeBrand === "all") return [];
    
    const linesSet = new Set();
    materialsList.forEach((m) => {
      if (!m) return;
      
      const mComputedBrand = getComputedBrand(m);
      const b = activeBrand.toUpperCase();
      const itemBrand = (m.brand || "").toUpperCase();
      const compBrand = mComputedBrand.toUpperCase();
      
      let matchesBrand = false;
      if (b === "LX") {
        matchesBrand = itemBrand.includes("LX") || itemBrand.includes("LG") || compBrand.includes("LX");
      } else if (b === "DID") {
        matchesBrand = itemBrand.includes("DID") || itemBrand.includes("디아이디");
      } else if (b === "신한") {
        matchesBrand = itemBrand.includes("신한");
      } else if (b === "현대벽지" || b === "현대") {
        matchesBrand = itemBrand.includes("현대");
      } else if (b === "어반") {
        matchesBrand = itemBrand.includes("어반") || itemBrand.includes("URBAN");
      } else {
        matchesBrand = itemBrand === b || compBrand === b || itemBrand.includes(b) || compBrand.includes(b);
      }
      
      if (m.category === activeTab && matchesBrand && m.line) {
        const line = getNormalizedLine(m, activeTab, activeBrand);
        if (line) {
          linesSet.add(line);
        }
      }
    });
    
    return ["all", ...Array.from(linesSet).sort()];
  }, [materialsList, activeTab, activeBrand]);

  // Wall paper material types
  const MATERIAL_TYPES = ["all", "프리미엄", "디아망", "합지(소폭)", "합지(장폭)", "합지", "실크", "방염"];

  // Filter items
  const filtered = useMemo(() => {
    if (!materialsList || materialsList.length === 0) return [];
    const s = (searchText || "").trim();

    if (s) {
      // If search text exists, ignore UI tab filters and search globally
      const searched = materialsList
        .map((m) => ({ item: m, score: getSearchScore(m, s) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.item);
      return searched;
    }

    return materialsList.filter((m) => {
      if (!m) return false;

      // Category tab check
      const tabOk = (m.category === activeTab);

      // Brand check with normalization rules
      let brandOk = false;
      if (activeBrand === "all") {
        brandOk = true;
      } else {
        const b = activeBrand.toUpperCase();
        const itemBrand = (m.brand || "").toUpperCase();
        const mComputedBrand = getComputedBrand(m);
        const compBrand = mComputedBrand.toUpperCase();
        
        if (b === "LX") {
          brandOk = itemBrand.includes("LX") || itemBrand.includes("LG") || compBrand.includes("LX");
        } else if (b === "DID") {
          brandOk = itemBrand.includes("DID") || itemBrand.includes("디아이디");
        } else if (b === "신한") {
          brandOk = itemBrand.includes("신한");
        } else if (b === "현대벽지" || b === "현대") {
          brandOk = itemBrand.includes("현대");
        } else if (b === "어반") {
          brandOk = itemBrand.includes("어반") || itemBrand.includes("URBAN");
        } else {
          brandOk = itemBrand === b || compBrand === b || itemBrand.includes(b) || compBrand.includes(b);
        }
      }

      // Line check
      let lineOk = true;
      if (activeLine !== "all" && visibleLines.length > 2) {
        const line = getNormalizedLine(m, activeTab, activeBrand);
        lineOk = (line === activeLine);
      }

      return tabOk && brandOk && lineOk;
    });
  }, [materialsList, activeTab, activeBrand, activeMaterialType, activeLine, searchText, visibleLines]);

  // Error View
  if (error) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: "100px 0", textAlign: "center", fontSize: "16px" }}>
          <h2 style={{ color: "#d9534f" }}>자료를 불러오지 못했습니다.</h2>
          <p style={{ marginTop: "10px", fontSize: "14px", color: "#6B6B6B" }}>
            <strong>오류 내용:</strong> {error}
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="materials-container container">
        <main className="materials-content full">
          
          {/* ✅ 1. Page Header (Title & Description) */}
          <div className="materials-page-header">
            <div className="header-text">
              <h1 className="materials-title">자재찾기</h1>
              <p className="materials-desc">
                동경바닥재가 엄선한 고품격 바닥재 및 벽지 자재군을 쉽고 빠르게 검색하고 비교해 보세요.
              </p>
            </div>
            {/* Search Box on the Page */}
            <div className="materials-search-box">
              <input
                type="text"
                placeholder="제품번호, 브랜드 또는 자재명 검색..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="materials-search-input-field"
              />
              {searchInput && (
                <button className="search-clear-btn" onClick={() => setSearchInput("")}>
                  &times;
                </button>
              )}
            </div>
          </div>
          
          {/* ✅ 2. Category and Brand Filter Section */}
          <div className="material-filter-section">
            
            {/* Category tabs */}
            <div className="material-filter-row">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  className={`material-filter-chip ${activeTab === category ? "active" : ""}`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Brand tabs (visible brands filter rows) */}
            {visibleBrands.length > 1 && (
              <div className="material-brand-row">
                {visibleBrands.map((brand) => (
                  <button
                    key={brand}
                    className={`material-brand-chip ${activeBrand === brand ? "active" : ""}`}
                    onClick={() => setActiveBrand(brand)}
                  >
                    {brand === "all" ? "전체" : brand}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ✅ 3. Lineup Filter (Dynamic - Shows only when multiple lines are loaded) */}
          {!loading && visibleLines.length > 2 && (
            <div className="material-type-row">
              {visibleLines.map((lineName) => (
                <button
                  key={lineName}
                  className={`material-type-chip ${activeLine === lineName ? "active" : ""}`}
                  onClick={() => setActiveLine(lineName)}
                >
                  {lineName === "all" ? "전체 라인업" : lineName}
                </button>
              ))}
            </div>
          )}

          {/* ✅ 4. Products grid display wrapper */}
          <div className="materials-wrapper">
            <div className="results-header">
              <div className="results-info">
                {loading ? (
                  <span>자재 정보를 불러오는 중입니다...</span>
                ) : (
                  <span>
                    총 <strong>{filtered.length}</strong>개 상품
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <div className="materials-grid">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="material-card-skeleton">
                    <div className="card-thumb-skeleton skeleton-shimmer" />
                    <div className="card-info-skeleton">
                      <div className="skeleton-line-meta skeleton-shimmer" />
                      <div className="skeleton-line-title skeleton-shimmer" />
                      <div className="skeleton-line-spec skeleton-shimmer" />
                      <div className="skeleton-line-price skeleton-shimmer" />
                      <div className="skeleton-buttons">
                        <div className="skeleton-button skeleton-shimmer" />
                        <div className="skeleton-button skeleton-shimmer" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <>
                <div className="materials-grid">
                  {filtered.slice(0, visibleCount).map((m) => (
                    <MaterialCard key={m.id} material={m} />
                  ))}
                </div>
                
                {visibleCount < filtered.length && (
                  <div className="load-more-container">
                    <button 
                      className="load-more-btn" 
                      onClick={() => setVisibleCount(prev => prev + 24)}
                    >
                      더보기 ({Math.min(visibleCount, filtered.length)} / {filtered.length})
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-results">
                {searchText ? `"${searchText}"에 대한 검색 결과가 없습니다.` : "선택하신 카테고리 및 브랜드의 상품이 준비 중입니다."}
              </div>
            )}
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
