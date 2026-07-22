import React, { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { getComputedBrand, getMaterialTypeAndLine } from "../../utils/brandUtils";
import { getSearchScore } from "../../utils/searchUtils";
import MaterialCard from "../../components/material/MaterialCard";
import { fetchFilteredProducts, fetchAllProducts } from "../../utils/supabaseFetcher";
import { Skeleton, EmptyState, ErrorState } from "../../components/ui";
import MobileFilterSheet from "../../components/material/MobileFilterSheet";
import { SlidersHorizontal, X } from "lucide-react";
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

  // Detailed Search Filters
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
  let activeLine = searchParams.get("line") || "all";
  if (activeLine && activeLine.toUpperCase().includes("MACOSX")) {
    activeLine = "all";
  }
  const activeShape = searchParams.get("shape") || "all";
  const activeThickness = searchParams.get("thickness") || "all";
  const searchText = searchParams.get("search") || "";

  // Local input state for the search bar (for responsiveness while typing)
  const [searchInput, setSearchInput] = useState(searchText);

  // Mobile Filter Sheet State
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeBrand !== "all" && activeBrand !== "KCC") count++;
    if (activeThickness !== "all") count++;
    if (activeShape !== "all") count++;
    if (activeLine !== "all") count++;
    if (nameFilter.trim()) count++;
    if (codeFilter.trim()) count++;
    if (specFilter.trim()) count++;
    return count;
  }, [activeBrand, activeThickness, activeShape, activeLine, nameFilter, codeFilter, specFilter]);

  const handleResetFilters = () => {
    updateParams({ brand: "all", type: null, line: null, shape: null, thickness: null });
    setNameFilter("");
    setCodeFilter("");
    setSpecFilter("");
  };

  // Pagination state (Optimized default to 24 for faster render)
  const [visibleCount, setVisibleCount] = useState(24);

  // Redirect if line param contains MACOSX
  useEffect(() => {
    const lineParam = searchParams.get("line");
    if (lineParam && lineParam.toUpperCase().includes("MACOSX")) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("line");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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
  }, [activeTab, activeBrand, activeMaterialType, activeLine, activeShape, activeThickness, searchText]);

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
    updateParams({ category, brand: defaultBrand, type: null, line: null, shape: null, thickness: null });
    setNameFilter("");
    setCodeFilter("");
    setSpecFilter("");
  };

  const setActiveBrand = (brand) => updateParams({ brand, type: null, line: null, shape: null });
  const setActiveMaterialType = (type) => updateParams({ type });
  const setActiveLine = (line) => updateParams({ line });
  const setActiveShape = (shape) => updateParams({ shape });

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

  // Visible thicknesses based on active category tab & brand selection
  const visibleThicknesses = useMemo(() => {
    if (activeTab !== "장판" || !materialsList || materialsList.length === 0) return [];
    
    const thicknessSet = new Set();
    materialsList.forEach((m) => {
      if (!m || m.category !== "장판") return;
      
      const mComputedBrand = getComputedBrand(m);
      const b = activeBrand.toUpperCase();
      const itemBrand = (m.brand || "").toUpperCase();
      const compBrand = mComputedBrand.toUpperCase();
      
      let matchesBrand = false;
      if (b === "ALL") {
        matchesBrand = true;
      } else if (b === "LX") {
        matchesBrand = itemBrand.includes("LX") || itemBrand.includes("LG") || compBrand.includes("LX");
      } else {
        matchesBrand = itemBrand === b || compBrand === b || itemBrand.includes(b) || compBrand.includes(b);
      }
      
      if (matchesBrand && m.thickness && m.thickness !== "두께 정보 없음") {
        thicknessSet.add(m.thickness);
      }
    });
    
    const sorted = Array.from(thicknessSet).sort((a, b) => {
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      return aNum - bNum;
    });
    
    return ["all", ...sorted];
  }, [materialsList, activeTab, activeBrand]);

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
      if (b === "ALL") {
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
      if (b === "ALL") {
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

        if (activeTab === "장판" && activeThickness !== "all") {
          if (m.thickness !== activeThickness) return;
        }
        
        const line = activeTab === "마루" ? m.displayLine : getNormalizedLine(m, activeTab, activeBrand);
        if (line) {
          linesSet.add(line);
        }
      }
    });
    
    return ["all", ...Array.from(linesSet).sort()];
  }, [materialsList, activeTab, activeBrand, activeMaterialType, activeThickness]);

  // Auto-reset activeThickness if it is not present in visibleThicknesses (on brand change)
  useEffect(() => {
    if (activeTab === "장판" && activeThickness !== "all" && visibleThicknesses.length > 0) {
      if (!visibleThicknesses.includes(activeThickness)) {
        updateParams({ thickness: null });
      }
    }
  }, [activeBrand, visibleThicknesses, activeThickness, activeTab]);

  // Auto-reset activeLine if it is not present in visibleLines (on thickness change)
  useEffect(() => {
    if (activeTab === "장판" && activeLine !== "all" && visibleLines.length > 0) {
      if (!visibleLines.includes(activeLine)) {
        updateParams({ line: null });
      }
    }
  }, [activeThickness, visibleLines, activeLine, activeTab]);

  // KCC Decotile specific options (Shape & Pattern)
  const visibleShapes = useMemo(() => {
    if (activeTab !== "데코타일" || activeBrand !== "KCC" || !materialsList) return [];
    const shapes = new Set();
    materialsList.forEach(m => {
      if (m.brand === "KCC" && m.category === "데코타일" && m.shape) {
        if (activeLine !== "all" && m.line !== activeLine) return;
        shapes.add(m.shape);
      }
    });
    return ["all", ...Array.from(shapes).sort()];
  }, [materialsList, activeTab, activeBrand, activeLine]);


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

        // Shape check (only for KCC decotiles)
        let shapeOk = true;
        if (activeTab === "데코타일" && activeBrand === "KCC" && activeShape !== "all") {
          shapeOk = (m.shape === activeShape);
        }

        // Thickness check (only for 장판)
        let thicknessOk = true;
        if (activeTab === "장판" && activeThickness !== "all") {
          thicknessOk = (m.thickness === activeThickness);
        }

        return tabOk && brandOk && typeOk && lineOk && shapeOk && thicknessOk;
      });
    }

    // Apply client-side search inputs on top of standard filters
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
  }, [materialsList, activeTab, activeBrand, activeMaterialType, activeLine, activeShape, activeThickness, searchText, visibleLines, nameFilter, codeFilter, specFilter]);

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
          
          {/* ✅ Section A. Sticky Area (자재찾기 제목 ~ 카테고리/브랜드/형태분류 - PC Sticky) */}
          <section className="materials-sticky-area">
            {/* 1. Page Header (Title, Description, Integrated Search & Active Filter Chips) */}
            <div className="materials-page-header">
              <div className="header-text">
                <h1 className="materials-title">자재찾기</h1>
                <p className="materials-desc">
                  동경바닥재가 엄선한 국내 주요 제조사(KCC, 동신, LX 등)의 자재를 상품명 및 자재 코드별로 조회하여 바로 발주하거나 견적을 요청할 수 있습니다.
                </p>
              </div>

              {/* Integrated Search Box & Mobile Filter Trigger */}
              <div className="materials-search-row-wrap">
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
                <button 
                  className="mobile-filter-trigger-btn"
                  onClick={() => setIsFilterSheetOpen(true)}
                >
                  <SlidersHorizontal size={18} />
                  <span>필터</span>
                  {activeFilterCount > 0 && <span className="trigger-badge">{activeFilterCount}</span>}
                </button>
              </div>

              {/* Active Filter Chips Bar */}
              {activeFilterCount > 0 && (
                <div className="active-filter-chips-bar">
                  {activeBrand !== "all" && (
                    <span className="active-chip">
                      브랜드: {activeBrand}
                      <X size={14} className="chip-remove" onClick={() => setActiveBrand("all")} />
                    </span>
                  )}
                  {activeThickness !== "all" && (
                    <span className="active-chip">
                      두께: {activeThickness}
                      <X size={14} className="chip-remove" onClick={() => updateParams({ thickness: null })} />
                    </span>
                  )}
                  {activeShape !== "all" && (
                    <span className="active-chip">
                      형태: {activeShape}
                      <X size={14} className="chip-remove" onClick={() => updateParams({ shape: null })} />
                    </span>
                  )}
                  {activeLine !== "all" && (
                    <span className="active-chip">
                      라인업: {activeLine}
                      <X size={14} className="chip-remove" onClick={() => updateParams({ line: null })} />
                    </span>
                  )}
                  {nameFilter.trim() && (
                    <span className="active-chip">
                      제품명: {nameFilter}
                      <X size={14} className="chip-remove" onClick={() => setNameFilter("")} />
                    </span>
                  )}
                  {codeFilter.trim() && (
                    <span className="active-chip">
                      코드: {codeFilter}
                      <X size={14} className="chip-remove" onClick={() => setCodeFilter("")} />
                    </span>
                  )}
                  {specFilter.trim() && (
                    <span className="active-chip">
                      규격: {specFilter}
                      <X size={14} className="chip-remove" onClick={() => setSpecFilter("")} />
                    </span>
                  )}
                  <button className="active-chips-reset-btn" onClick={handleResetFilters}>
                    전체 삭제
                  </button>
                </div>
              )}
            </div>
            
            {/* 2. Primary Category/Brand/Shape Tabs Panel */}
            <div className="filter-panel">
              {/* Category tabs */}
              <div className="filter-group">
                <span className="filter-label">카테고리</span>
                <div className="filter-options">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      className={`filter-tab ${activeTab === category ? "active" : ""}`}
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
   
              {/* Brand tabs */}
              {visibleBrands.length > 1 && (
                <div className="filter-group">
                  <span className="filter-label">브랜드</span>
                  <div className="filter-options">
                    {visibleBrands.map((brand) => (
                      <button
                        key={brand}
                        className={`filter-tab ${activeBrand === brand ? "active" : ""}`}
                        onClick={() => setActiveBrand(brand)}
                      >
                        {brand === "all" ? "전체" : brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Thickness tabs (only for 장판) */}
              {activeTab === "장판" && visibleThicknesses.length > 1 && (
                <div className="filter-group thickness-filter-group">
                  <span className="filter-label">두께</span>
                  <div className="filter-options thickness-filter-options" style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: '6px', paddingBottom: '4px' }}>
                    {visibleThicknesses.map((t) => (
                      <button
                        key={t}
                        className={`filter-tab ${activeThickness === t ? "active" : ""}`}
                        onClick={() => updateParams({ thickness: t })}
                        style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        {t === "all" ? "전체 두께" : t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* KCC Decotile specific filters: Shape */}
              {activeTab === "데코타일" && activeBrand === "KCC" && !loading && (
                <>
                  {visibleShapes.length > 1 && (
                    <div className="filter-group">
                      <span className="filter-label">형태 분류</span>
                      <div className="filter-options">
                        {visibleShapes.map((shape) => (
                          <button
                            key={shape}
                            className={`filter-tab ${activeShape === shape ? "active" : ""}`}
                            onClick={() => setActiveShape(shape)}
                          >
                            {shape === "all" ? "전체 형태" : shape}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 마루 세부 분류 (Material Type) */}
              {activeTab === "마루" && visibleMaterialTypes.length > 2 && (
                <div className="filter-group">
                  <span className="filter-label">세부 분류</span>
                  <div className="filter-options">
                    {visibleMaterialTypes.map((type) => (
                      <button
                        key={type}
                        className={`filter-tab ${activeMaterialType === type ? "active" : ""}`}
                        onClick={() => setActiveMaterialType(type)}
                      >
                        {type === "all" ? "전체 세부 분류" : type}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ✅ Section B. Scroll Area (세부 검색창 ~ 상품 목록 - Normal Scroll) */}
          <section className="materials-scroll-area">
            {/* Detailed search inputs */}
            <div className="materials-detail-search-panel">
              <div className="search-filters-grid">
                <div className="search-field">
                  <label className="field-label">제품명 검색</label>
                  <input
                    type="text"
                    placeholder="제품명 입력 (예: 오크, 타일)"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="field-input"
                  />
                </div>
                <div className="search-field">
                  <label className="field-label">상품코드 검색</label>
                  <input
                    type="text"
                    placeholder="상품코드 입력 (예: CM21882)"
                    value={codeFilter}
                    onChange={(e) => setCodeFilter(e.target.value)}
                    className="field-input"
                  />
                </div>
                <div className="search-field">
                  <label className="field-label">규격/두께 검색</label>
                  <input
                    type="text"
                    placeholder="규격/두께 입력 (예: 1.8T, 2.2mm)"
                    value={specFilter}
                    onChange={(e) => setSpecFilter(e.target.value)}
                    className="field-input"
                  />
                </div>
              </div>
            </div>

            {/* Lineup Filter (Dynamic - Shows only when multiple lines are loaded) */}
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

            {/* Products grid display wrapper */}
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
                description={
                  searchText 
                    ? `"${searchText}"에 부합하는 자재가 없거나 현재 준비 중입니다.` 
                    : (activeTab === "장판" && (activeBrand !== "all" || activeThickness !== "all"))
                      ? "선택한 브랜드와 두께에 해당하는 상품이 없습니다."
                      : "선택하신 분류 및 브랜드의 자재가 준비 중입니다."
                }
              />
            )}
          </div>
          </section>
        </main>
      </div>


      {/* Mobile Filter Sheet Modal */}
      <MobileFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        categories={CATEGORIES}
        activeTab={activeTab}
        onCategoryChange={handleCategoryChange}
        visibleBrands={visibleBrands}
        activeBrand={activeBrand}
        onBrandChange={setActiveBrand}
        visibleThicknesses={visibleThicknesses}
        activeThickness={activeThickness}
        onThicknessChange={(t) => updateParams({ thickness: t })}
        visibleShapes={visibleShapes}
        activeShape={activeShape}
        onShapeChange={setActiveShape}
        visibleLines={visibleLines}
        activeLine={activeLine}
        onLineChange={setActiveLine}
        nameFilter={nameFilter}
        setNameFilter={setNameFilter}
        codeFilter={codeFilter}
        setCodeFilter={setCodeFilter}
        specFilter={specFilter}
        setSpecFilter={setSpecFilter}
        totalCount={filtered.length}
        onResetFilters={handleResetFilters}
      />
    </MainLayout>
  );
}

