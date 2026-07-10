import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { getComputedBrand, getMaterialTypeAndLine } from "../../utils/brandUtils";
import { getSearchScore } from "../../utils/searchUtils";
import MaterialCard from "../../components/material/MaterialCard";
import { fetchFilteredProducts, fetchAllProducts } from "../../utils/supabaseFetcher";
import { Skeleton, EmptyState, ErrorState } from "../../components/ui";
import "./Materials.css";
import "./MaterialsPageSkeleton.css";

// 1. Categories specified by the user
const CATEGORIES = ["데코타일", "장판", "마루", "벽지", "카페트타일", "부자재"];

// 2. Brands specified by the user
const BRANDS_BY_CATEGORY = {
  데코타일: ["KCC", "동신", "재영", "유성", "LX", "녹수", "현대"],
  장판: ["LX", "현대", "KCC"],
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
  if (m.brand === "동화") {
    return m.line;
  }
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

  // B2B Detailed Search Filters
  const [nameFilter, setNameFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [specFilter, setSpecFilter] = useState("");

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

  // Fetch from Supabase on mount/filter change
  useEffect(() => {
    let isCurrent = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        console.log(`[Debug] Fetching materials for: category=${activeTab}, brand=${activeBrand}, search=${searchText}`);
        const data = await fetchFilteredProducts({
          category: activeTab,
          brand: activeBrand,
          searchText: searchText
        });
        if (isCurrent) {
          setMaterialsList(data);
        }
      } catch (err) {
        console.error("[Debug] Supabase load error:", err);
        if (isCurrent) {
          setError(err.message || String(err));
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      isCurrent = false;
    };
  }, [activeTab, activeBrand, searchText]);

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

  // Normalize legacy line parameters (e.g., line=강마루_듀오텍스쳐_DUO TEXTURE)
  useEffect(() => {
    if (activeTab === "마루" && activeLine && activeLine.includes('_')) {
      const dummyItem = { category: "마루", line: activeLine };
      const { materialType, displayLine } = getMaterialTypeAndLine(dummyItem);
      updateParams({ type: materialType, line: displayLine });
    }
  }, [activeTab, activeLine]);

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
    setNameFilter("");
    setCodeFilter("");
    setSpecFilter("");
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

  // Visible material types (subcategories) for 마루 category
  const visibleMaterialTypes = useMemo(() => {
    if (activeTab !== "마루" || !materialsList || materialsList.length === 0) return [];
    
    const typesSet = new Set();
    materialsList.forEach((m) => {
      if (!m || m.category !== "마루") return;
      
      const mComputedBrand = getComputedBrand(m);
      const b = activeBrand.toUpperCase();
      const itemBrand = (m.brand || "").toUpperCase();
      const compBrand = mComputedBrand.toUpperCase();
      
      let matchesBrand = false;
      if (b === "all") {
        matchesBrand = true;
      } else if (b === "LX") {
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
      
      if (matchesBrand && m.materialType) {
        typesSet.add(m.materialType);
      }
    });
    
    return ["all", ...Array.from(typesSet).sort()];
  }, [materialsList, activeTab, activeBrand]);

  // Visible lineups based on current category, brand and material type selection
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
      if (b === "all") {
        matchesBrand = true;
      } else if (b === "LX") {
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
      
      if (m.category === activeTab && matchesBrand) {
        if (activeTab === "마루" && activeMaterialType !== "all") {
          if (m.materialType !== activeMaterialType) return;
        }
        
        const line = activeTab === "마루" ? m.displayLine : getNormalizedLine(m, activeTab, activeBrand);
        if (line) {
          linesSet.add(line);
        }
      }
    });
    
    return ["all", ...Array.from(linesSet).sort()];
  }, [materialsList, activeTab, activeBrand, activeMaterialType]);

  // Wall paper material types
  const MATERIAL_TYPES = ["all", "프리미엄", "디아망", "합지(소폭)", "합지(장폭)", "합지", "실크", "방염"];

  // Filter items
  const filtered = useMemo(() => {
    if (!materialsList || materialsList.length === 0) return [];
    
    let result = [];
    const s = (searchText || "").trim();

    if (s) {
      // If search text exists, ignore UI tab filters and search globally
      result = materialsList
        .map((m) => ({ item: m, score: getSearchScore(m, s) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.item);
    } else {
      result = materialsList.filter((m) => {
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

        // Material Type check (only for 마루)
        let typeOk = true;
        if (activeTab === "마루" && activeMaterialType !== "all") {
          typeOk = (m.materialType === activeMaterialType);
        }

        // Line check
        let lineOk = true;
        if (activeLine !== "all" && visibleLines.length > 2) {
          const line = activeTab === "마루" ? m.displayLine : getNormalizedLine(m, activeTab, activeBrand);
          if (activeTab === "마루" && m.brand === "구정" && m.series === "노블레스") {
            lineOk = (line === activeLine || (m.sizeOptions && m.sizeOptions.some(o => o.label === activeLine)));
          } else {
            lineOk = (line === activeLine);
          }
        }

        return tabOk && brandOk && typeOk && lineOk;
      });
    }

    // Apply client-side B2B inputs on top of standard filters
    if (nameFilter.trim()) {
      const q = nameFilter.trim().toLowerCase();
      result = result.filter(m => (m.name || "").toLowerCase().includes(q));
    }
    if (codeFilter.trim()) {
      const q = codeFilter.trim().toLowerCase();
      result = result.filter(m => (m.code || "").toLowerCase().includes(q) || (m.product_code || "").toLowerCase().includes(q));
    }
    if (specFilter.trim()) {
      const q = specFilter.trim().toLowerCase();
      result = result.filter(m => {
        const thickness = (m.thickness || "").toLowerCase();
        const size = (m.specs?.size || m.spec || "").toLowerCase();
        return thickness.includes(q) || size.includes(q);
      });
    }

    return result;
  }, [materialsList, activeTab, activeBrand, activeMaterialType, activeLine, searchText, visibleLines, nameFilter, codeFilter, specFilter]);

  // Error View
  if (error) {
    const handleRetry = () => {
      setError(null);
      setLoading(true);
      fetchFilteredProducts({
        category: activeTab,
        brand: activeBrand,
        searchText: searchText
      }).then(data => {
        setMaterialsList(data);
        setLoading(false);
      }).catch(err => {
        setError(err.message || String(err));
        setLoading(false);
      });
    };

    return (
      <MainLayout>
        <div className="container" style={{ padding: "100px 0" }}>
          <ErrorState 
            title="자료를 불러오지 못했습니다" 
            message={error} 
            retryLabel="다시 시도" 
            onRetry={handleRetry} 
          />
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
              <h1 className="materials-title">자재찾기 B2B 구매센터</h1>
              <p className="materials-desc">
                동경바닥재가 엄선한 국내 주요 제조사(KCC, 동신, LX 등) 정품 자재군을 상세한 규격 및 자재 코드별로 조회하여 즉시 발주/견적을 진행하십시오.
              </p>
            </div>
            {/* Search Box on the Page */}
            <div className="materials-search-box">
              <input
                type="text"
                placeholder="통합 검색 (제품번호, 자재명 등)..."
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
          
          {/* ✅ 2. B2B Filter Panel */}
          <div className="b2b-filter-panel">
            
            {/* Category tabs */}
            <div className="b2b-filter-group">
              <span className="b2b-filter-label">카테고리</span>
              <div className="b2b-filter-options">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    className={`b2b-filter-tab ${activeTab === category ? "active" : ""}`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
 
            {/* Brand tabs */}
            {visibleBrands.length > 1 && (
              <div className="b2b-filter-group">
                <span className="b2b-filter-label">브랜드</span>
                <div className="b2b-filter-options">
                  {visibleBrands.map((brand) => (
                    <button
                      key={brand}
                      className={`b2b-filter-tab ${activeBrand === brand ? "active" : ""}`}
                      onClick={() => setActiveBrand(brand)}
                    >
                      {brand === "all" ? "전체" : brand}
                    </button>
                  ))}
                </div>
              </div>
            )}
 
            {/* 마루 세부 분류 (Material Type) */}
            {activeTab === "마루" && visibleMaterialTypes.length > 2 && (
              <div className="b2b-filter-group">
                <span className="b2b-filter-label">세부 분류</span>
                <div className="b2b-filter-options">
                  {visibleMaterialTypes.map((type) => (
                    <button
                      key={type}
                      className={`b2b-filter-tab ${activeMaterialType === type ? "active" : ""}`}
                      onClick={() => setActiveMaterialType(type)}
                    >
                      {type === "all" ? "전체 세부 분류" : type}
                    </button>
                  ))}
                </div>
              </div>
            )}
 
            {/* B2B detailed search inputs */}
            <div className="b2b-search-filters-grid">
              <div className="b2b-search-field">
                <label className="b2b-field-label">제품명 검색</label>
                <input
                  type="text"
                  placeholder="제품명 입력 (예: 오크, 타일)"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="b2b-field-input"
                />
              </div>
              <div className="b2b-search-field">
                <label className="b2b-field-label">상품코드 검색</label>
                <input
                  type="text"
                  placeholder="상품코드 입력 (예: CM21882)"
                  value={codeFilter}
                  onChange={(e) => setCodeFilter(e.target.value)}
                  className="b2b-field-input"
                />
              </div>
              <div className="b2b-search-field">
                <label className="b2b-field-label">규격/두께 검색</label>
                <input
                  type="text"
                  placeholder="규격/두께 입력 (예: 1.8T, 2.2mm)"
                  value={specFilter}
                  onChange={(e) => setSpecFilter(e.target.value)}
                  className="b2b-field-input"
                />
              </div>
            </div>
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
                  <div key={idx} className="material-card-skeleton" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <div className="card-thumb-skeleton" style={{ overflow: 'hidden', position: 'relative', height: '200px' }}>
                      <Skeleton height="100%" />
                    </div>
                    <div className="card-info-skeleton" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <Skeleton width="40%" height="12px" />
                      <Skeleton width="80%" height="18px" />
                      <Skeleton width="60%" height="14px" />
                      <Skeleton width="50%" height="16px" />
                      <div className="skeleton-buttons" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <Skeleton height="34px" />
                        <Skeleton height="34px" />
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
              <EmptyState
                title="검색 결과가 없습니다"
                description={searchText ? `"${searchText}"에 부합하는 자재가 없거나 현재 준비 중입니다.` : "선택하신 분류 및 브랜드의 자재가 준비 중입니다."}
              />
            )}
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
