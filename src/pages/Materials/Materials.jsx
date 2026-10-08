import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { getComputedBrand, getMaterialTypeAndLine, formatShapeOrPattern, JANGPAN_STANDARD_THICKNESSES, FLOORING_THICKNESS_BY_BRAND, normalizeBrandName, isSentenceDescription } from "../../utils/brandUtils";
import MaterialCard from "../../components/material/MaterialCard";
import { fetchFilteredProducts, withTimeout } from "../../utils/supabaseFetcher";
import { sortProducts, SORT_OPTIONS } from "../../utils/sortUtils";
import { Skeleton, EmptyState, ErrorState } from "../../components/ui";
import MobileFilterSheet from "../../components/material/MobileFilterSheet";
import { X } from "lucide-react";
import SEO from "../../components/seo/SEO";
import "./Materials.css";
import "./MaterialsPageSkeleton.css";

import { HIDE_SUB_MATERIALS, getVisibleCategories } from "../../config/categoryConfig";

// 1. Categories specified by the user
const ALL_CATEGORIES = ["데코타일", "장판", "마루", "벽지", "카페트타일", "부자재"];
const CATEGORIES = getVisibleCategories(ALL_CATEGORIES);

// 2. Brands specified by the user
const BRANDS_BY_CATEGORY = {
  데코타일: ["KCC", "동신", "재영", "유성", "LX", "녹수", "현대"],
  장판: ["LX", "현대", "KCC"],
  마루: ["이건", "동화", "구정"],
  벽지: ["LX", "개나리", "서울", "제일", "신한", "현대벽지"],
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
  if (!m) return "";
  let line = m.line || "";

  if (isSentenceDescription(line)) {
    line = "";
  }

  const brand = (m.brand || activeBrand || "").toUpperCase();
  const category = m.category || activeTab || "";

  // Special normalization for KCC 장판
  if ((brand.includes("KCC") || brand.includes("KCC글라스")) && category === "장판") {
    const code = (m.code || m.id || m.product_code || "").toUpperCase();
    const name = (m.name || m.product_name || "").toUpperCase();
    const fullText = `${code} ${line} ${name}`;

    if (fullText.includes("NP18") || fullText.includes("NK20") || fullText.includes("그린")) {
      return "그린";
    }
    if (fullText.includes("NJ27") || fullText.includes("NR32") || fullText.includes("도담")) {
      return "도담";
    }
    if (fullText.includes("MN22") || fullText.includes("숲 옥") || fullText.includes("숲옥")) {
      return "숲 옥";
    }
    if (fullText.includes("NC45") || fullText.includes("NV50") || fullText.includes("휴가온")) {
      return "휴가온";
    }
    return line && !isSentenceDescription(line) ? line : "";
  }

  if (m.brand === "동화") {
    return line;
  }
  if (m.brand === "KCC" && m.category === "데코타일") {
    if (line.includes("트랜디") || (m.name && m.name.includes("트랜디"))) return "센스타일 트랜디";
    if (line.includes("프로") || (m.name && m.name.includes("프로"))) return "센스타일 프로";
    if (line.includes("센스레이") || (m.name && m.name.includes("센스레이"))) return "센스레이 5.0";
    return line;
  }
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
      if (b === "LX") {
        line = parts[1] || parts[0];
      } else {
        line = parts[0];
      }
    }
  }
  return isSentenceDescription(line) ? "" : line;
};

const normalizeUrlThickness = (raw) => {
  if (!raw || raw === "all") return "all";
  const clean = String(raw).trim().toUpperCase();
  if (JANGPAN_STANDARD_THICKNESSES.includes(clean)) return clean;
  if (/^1\.8(T|MM)?$/i.test(clean)) return "1.8T";
  if (/^(2|2\.0)(T|MM)?$/i.test(clean)) return "2.0T";
  if (/^2\.2(T|MM)?$/i.test(clean)) return "2.2T";
  if (/^2\.7(T|MM)?$/i.test(clean)) return "2.7T";
  if (/^3\.2(T|MM)?$/i.test(clean)) return "3.2T";
  if (/^4\.5(T|MM)?$/i.test(clean)) return "4.5T";
  if (/^(5|5\.0)(T|MM)?$/i.test(clean)) return "5.0T";
  return null;
};

export default function Materials() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [materialsList, setMaterialsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Request counter ref to prevent race conditions and guarantee loading termination
  const fetchRequestIdRef = useRef(0);

  // Filters state (Direct inputs for name, code, spec)
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
  const rawThickness = searchParams.get("thickness");
  const validThickness = normalizeUrlThickness(rawThickness);
  const activeThickness = validThickness || "all";
  const sortOption = searchParams.get("sort") || "default";

  // Mobile Filter Sheet State
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeBrand !== "all" && activeBrand !== "KCC") count++;
    if (activeThickness !== "all") count++;
    if (activeShape !== "all") count++;
    if (activeLine !== "all") count++;
    if (sortOption !== "default") count++;
    if (nameFilter.trim()) count++;
    if (codeFilter.trim()) count++;
    if (specFilter.trim()) count++;
    return count;
  }, [activeBrand, activeThickness, activeShape, activeLine, sortOption, nameFilter, codeFilter, specFilter]);

  const handleResetFilters = useCallback(() => {
    updateParams({ brand: "all", type: null, line: null, shape: null, thickness: null, sort: null });
    setNameFilter("");
    setCodeFilter("");
    setSpecFilter("");
  }, []);

  // Pagination state (30 items per load)
  const PRODUCTS_PER_LOAD = 30;
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_LOAD);

  // Sanitize URL query parameter for category if 부자재 is hidden
  useEffect(() => {
    if (HIDE_SUB_MATERIALS && (searchParams.get("category") === "부자재" || searchParams.get("category") === "부자재류")) {
      updateParams({ category: "데코타일", brand: "KCC" });
    }
  }, [searchParams]);

  // Redirect if line param contains MACOSX
  useEffect(() => {
    const lineParam = searchParams.get("line");
    if (lineParam && lineParam.toUpperCase().includes("MACOSX")) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("line");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Sanitize URL query parameter for thickness if invalid or format mismatch
  useEffect(() => {
    if (activeTab === "장판") {
      const rawT = searchParams.get("thickness");
      if (rawT) {
        const norm = normalizeUrlThickness(rawT);
        if (!norm || norm === "all") {
          updateParams({ thickness: null });
        } else if (norm !== rawT) {
          updateParams({ thickness: norm });
        }
      }
    }
  }, [activeTab, searchParams]);

  // Fetch products from Supabase/cache on mount/filter/pagination change
  useEffect(() => {
    const requestId = ++fetchRequestIdRef.current;
    const controller = new AbortController();

    async function load() {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[Materials] request start', { category: activeTab, brand: activeBrand, thickness: activeThickness, visibleCount, requestId });
      }
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetchFilteredProducts({
          category: activeTab,
          brand: activeBrand,
          thickness: activeThickness,
          page: 0,
          pageSize: visibleCount,
          signal: controller.signal
        });

        if (requestId === fetchRequestIdRef.current) {
          const items = Array.isArray(res) ? res : (res.items || []);
          setMaterialsList(items);
          if (res && typeof res.totalCount === 'number') {
            setTotalCount(res.totalCount);
          }
          if (process.env.NODE_ENV !== 'production') {
            console.debug('[Materials] request success', { count: items.length, totalCount: res?.totalCount, requestId });
          }
        }
      } catch (err) {
        if (err.name === 'AbortError' || err.message === 'aborted') {
          if (process.env.NODE_ENV !== 'production') {
            console.debug('[Materials] request aborted', { requestId });
          }
          return;
        }
        console.error("[Materials] load error:", { category: activeTab, brand: activeBrand, page: 0, error: err });
        if (requestId === fetchRequestIdRef.current) {
          setError(err.message || "자재 정보를 불러오지 못했습니다.");
        }
      } finally {
        if (requestId === fetchRequestIdRef.current) {
          setLoading(false);
          if (process.env.NODE_ENV !== 'production') {
            console.debug('[Materials] request finished', { requestId });
          }
        }
      }
    }

    load();

    return () => {
      controller.abort();
    };
  }, [activeTab, activeBrand, activeThickness, visibleCount]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => prev + PRODUCTS_PER_LOAD);
  }, []);

  // Reset visibleCount to 30 whenever any filter, search input, or sort option changes
  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_LOAD);
  }, [activeTab, activeBrand, activeMaterialType, activeLine, activeShape, activeThickness, nameFilter, codeFilter, specFilter, sortOption]);

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

  // Visible thicknesses based on active category tab & brand selection (from FLOORING_THICKNESS_BY_BRAND)
  const visibleThicknesses = useMemo(() => {
    if (activeTab !== "장판") return [];
    const normBrand = normalizeBrandName(activeBrand);
    const list = FLOORING_THICKNESS_BY_BRAND[normBrand] || FLOORING_THICKNESS_BY_BRAND.all;
    return ["all", ...list];
  }, [activeTab, activeBrand]);

  // Auto-reset activeThickness if selected thickness is not supported by brand (e.g. 현대 + 4.5T)
  useEffect(() => {
    if (activeTab === "장판" && activeThickness !== "all" && visibleThicknesses.length > 0) {
      if (!visibleThicknesses.includes(activeThickness)) {
        updateParams({ thickness: null });
      }
    }
  }, [activeBrand, visibleThicknesses, activeThickness, activeTab]);

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

  // Auto-reset activeLine if it is not present in visibleLines (on thickness change)
  useEffect(() => {
    if (activeTab === "장판" && activeLine !== "all" && visibleLines.length > 0) {
      if (!visibleLines.includes(activeLine)) {
        updateParams({ line: null });
      }
    }
  }, [activeThickness, visibleLines, activeLine, activeTab]);

  // Calculate item counts for each lineup
  const lineCounts = useMemo(() => {
    if (!materialsList || materialsList.length === 0) return {};
    const counts = {};
    materialsList.forEach((m) => {
      if (!m || m.category !== activeTab) return;
      const line = activeTab === "마루" ? m.displayLine : getNormalizedLine(m, activeTab, activeBrand);
      if (line) {
        counts[line] = (counts[line] || 0) + 1;
      }
    });
    return counts;
  }, [materialsList, activeTab, activeBrand]);

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
    
    let result = materialsList.filter((m) => {
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
      if (activeLine !== "all") {
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
  }, [materialsList, activeTab, activeBrand, activeMaterialType, activeLine, activeShape, activeThickness, visibleLines, nameFilter, codeFilter, specFilter]);

  // Apply sorting pipeline on filtered products (Immutably using useMemo)
  const sortedProducts = useMemo(() => {
    return sortProducts(filtered, sortOption);
  }, [filtered, sortOption]);

  const isFilteredSearch = useMemo(() => {
    return activeLine !== "all" || activeShape !== "all" || activeThickness !== "all" || activeMaterialType !== "all" || !!nameFilter.trim() || !!codeFilter.trim() || !!specFilter.trim();
  }, [activeLine, activeShape, activeThickness, activeMaterialType, nameFilter, codeFilter, specFilter]);

  const displayTotalCount = useMemo(() => {
    if (isFilteredSearch) return sortedProducts.length;
    return totalCount || sortedProducts.length;
  }, [isFilteredSearch, sortedProducts.length, totalCount]);

  const visibleProducts = useMemo(() => {
    return sortedProducts.slice(0, visibleCount);
  }, [sortedProducts, visibleCount]);

  const hasMoreItems = useMemo(() => {
    return visibleCount < displayTotalCount;
  }, [visibleCount, displayTotalCount]);

  // Retry handler for user-initiated retry action
  const handleRetry = useCallback(() => {
    const requestId = ++fetchRequestIdRef.current;
    setError(null);
    setLoading(true);

    fetchFilteredProducts({
      category: activeTab,
      brand: activeBrand,
      thickness: activeThickness,
      page: 0,
      pageSize: visibleCount
    })
      .then(res => {
        if (requestId === fetchRequestIdRef.current) {
          const items = Array.isArray(res) ? res : (res.items || []);
          setMaterialsList(items);
          if (res && typeof res.totalCount === 'number') {
            setTotalCount(res.totalCount);
          }
        }
      })
      .catch(err => {
        if (err.name === 'AbortError' || err.message === 'aborted') return;
        if (requestId === fetchRequestIdRef.current) {
          const isTimeout = err.name === 'TimeoutError' || err.message === 'REQUEST_TIMEOUT';
          setError(isTimeout ? "네트워크 응답 시간이 초과되었습니다. [다시 시도]를 눌러주세요." : (err.message || "자재 정보를 불러오지 못했습니다."));
        }
      })
      .finally(() => {
        if (requestId === fetchRequestIdRef.current) {
          setLoading(false);
        }
      });
  }, [activeTab, activeBrand, activeThickness]);

  const seoTitle = activeTab 
    ? `${activeTab}${activeBrand !== 'all' ? ` (${activeBrand})` : ''} 자재조회 | 동경바닥재`
    : "자재찾기 | 동경바닥재 - 데코타일, 장판, 마루, 벽지, 카페트타일 조회";

  const materialsBreadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "홈",
        "item": "https://dkfloor.co.kr/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "자재찾기",
        "item": "https://dkfloor.co.kr/materials"
      }
    ]
  };

  return (
    <MainLayout>
      <SEO 
        title={seoTitle}
        description="동경바닥재 자재찾기 - KCC, LX, 동신, 재영, 이건 등 국내 주요 바닥재 자재를 상품명, 제품코드, 규격별로 편리하게 검색하고 상세 정보를 확인하세요."
        canonical="https://dkfloor.co.kr/materials"
        jsonLd={materialsBreadcrumbJsonLd}
      />
      <div className="materials-container container">
        <main className="materials-content full">
          
          {/* ✅ Section A. Sticky Area (자재찾기 제목 ~ 카테고리/브랜드/형태분류 - PC Sticky) */}
          <section className="materials-sticky-area">
            {/* 1. Title & Description Heading Block */}
            <div className="materials-heading">
              <h1 className="materials-title">자재찾기</h1>
              <p className="materials-description">
                동경바닥재가 엄선한 국내 주요 제조사(KCC, 동신, LX 등)의 자재를 상품명 및 자재 코드별로 조회하고 바로 발주하거나 견적을 요청할 수 있습니다.
              </p>
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

                {activeLine !== "all" && (
                  <span className="active-chip">
                    라인업: {formatShapeOrPattern(activeLine)}
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
                {sortOption !== "default" && (
                  <span className="active-chip">
                    정렬: {SORT_OPTIONS.find(o => o.value === sortOption)?.label || sortOption}
                    <X size={14} className="chip-remove" onClick={() => updateParams({ sort: null })} />
                  </span>
                )}
                <button className="active-chips-reset-btn" onClick={handleResetFilters}>
                  전체 삭제
                </button>
              </div>
            )}
            
            {/* 2. Primary Category / Brand / Shape Filters Panel */}
            <div className="materials-main-filters">
              {/* Category tabs */}
              <div className="materials-filter-row">
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
                <div className="materials-filter-row">
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
                <div className="materials-filter-row thickness-filter-group">
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



              {/* 마루 세부 분류 (Material Type) */}
              {activeTab === "마루" && visibleMaterialTypes.length > 2 && (
                <div className="materials-filter-row">
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

          {/* ✅ Section B. Scroll Area (세부 검색창 ~ 라인업 ~ 상품 목록 - Normal Scroll) */}
          <section className="materials-scroll-area">
            {/* Detailed search inputs */}
            <div className="materials-detail-search">
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

            {/* Lineup Filter */}
            {!loading && visibleLines.length > 1 && (
              <div className="materials-lineup-filter">
                {visibleLines.map((lineName) => (
                  <button
                    key={lineName}
                    className={`material-type-chip ${activeLine === lineName ? "active" : ""}`}
                    onClick={() => setActiveLine(lineName)}
                  >
                    {lineName === "all"
                      ? "전체 라인업"
                      : `${formatShapeOrPattern(lineName)}${lineCounts[lineName] ? ` (${lineCounts[lineName]})` : ''}`}
                  </button>
                ))}
              </div>
            )}

            {/* Shape Filter (For KCC Decotiles: 전체 / 우드 / 450각 / 600각) */}
            {!loading && activeTab === "데코타일" && activeBrand === "KCC" && visibleShapes.length > 1 && (
              <div className="materials-lineup-filter shape-filter-group" style={{ marginTop: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', alignSelf: 'center', marginRight: '6px' }}>형태:</span>
                {visibleShapes.map((shapeName) => (
                  <button
                    key={shapeName}
                    className={`material-type-chip ${activeShape === shapeName ? "active" : ""}`}
                    onClick={() => setActiveShape(shapeName)}
                  >
                    {shapeName === "all" ? "전체 형태" : shapeName}
                  </button>
                ))}
              </div>
            )}

            {/* Products Grid & Display Wrapper */}
            <div className="materials-product-grid">
              <div className="results-header">
                <div className="results-info">
                  {loading ? (
                    <span>자재 정보를 불러오는 중입니다...</span>
                  ) : (
                    <span>
                      총 <strong>{displayTotalCount}</strong>개 상품
                    </span>
                  )}
                </div>
                <div className="results-sort-wrapper">
                  <span className="page-size-badge">30개씩 보기</span>
                  <label htmlFor="materials-sort-select" className="sort-label">정렬</label>
                  <select
                    id="materials-sort-select"
                    value={sortOption}
                    onChange={(e) => updateParams({ sort: e.target.value === "default" ? null : e.target.value })}
                    className="materials-sort-select"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
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
              ) : error && materialsList.length === 0 ? (
                <div style={{ padding: '60px 0' }}>
                  <ErrorState 
                    title="자료를 불러오지 못했습니다" 
                    message={error} 
                    retryLabel="다시 시도" 
                    onRetry={handleRetry} 
                  />
                </div>
              ) : visibleProducts.length > 0 ? (
                <>
                  <div className="materials-grid">
                    {visibleProducts.map((m, idx) => (
                      <MaterialCard key={m.id || `product-${idx}`} material={m} priority={idx < 8} />
                    ))}
                  </div>
                  
                  {hasMoreItems && (
                    <div className="load-more-container">
                      <button 
                        className="load-more-btn" 
                        onClick={handleLoadMore}
                      >
                        {`더보기 (${Math.min(visibleCount, sortedProducts.length)} / ${sortedProducts.length})`}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  title="검색 결과가 없습니다"
                  description={
                    (nameFilter || codeFilter || specFilter)
                      ? "검색 조건에 부합하는 자재가 없거나 현재 준비 중입니다." 
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
        sortOption={sortOption}
        onSortChange={(val) => updateParams({ sort: val === "default" ? null : val })}
        totalCount={sortedProducts.length}
        onResetFilters={handleResetFilters}
      />
    </MainLayout>
  );
}

