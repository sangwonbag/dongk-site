import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { getComputedBrand, getMaterialTypeAndLine, formatShapeOrPattern, JANGPAN_STANDARD_THICKNESSES, FLOORING_THICKNESS_BY_BRAND, normalizeBrandName, isSentenceDescription, getKccLineup, KCC_DECOTILE_LINEUPS, resolveKccLineupName, resolveKccLineupSlug, KCC_LINEUP_NAME_TO_SLUG, getKccLineupPriority } from "../../utils/brandUtils";
import { DONGSHIN_MAJOR_CATEGORIES, DONGSHIN_DETAILED_LINEUPS_MAP, getDongshinMajorCategory, getDongshinDetailedLineup } from "../../utils/dongshinUtils";
import { 
  EAGON_MAJOR_CATEGORIES, 
  EAGON_LINEUPS_BY_MAJOR, 
  EAGON_SPECS_BY_LINEUP, 
  EAGON_SPEC_LABEL_MAP, 
  isEagonProduct, 
  getEagonLineupGroup, 
  getEagonSpecKey, 
  getEagonMaterialType, 
  getEagonColorName 
} from "../../utils/eagonUtils";
import MaterialCard from "../../components/material/MaterialCard";
import { fetchFilteredProducts, searchMaterials, withTimeout } from "../../utils/supabaseFetcher";
import { getSearchScore, isProductNumberQuery, generateAutocompleteSuggestions, POPULAR_KEYWORDS, parseSearchQuery } from "../../utils/searchUtils";
import { sortProducts, SORT_OPTIONS } from "../../utils/sortUtils";
import { Skeleton, EmptyState, ErrorState } from "../../components/ui";
import MobileFilterSheet from "../../components/material/MobileFilterSheet";
import { X, Search } from "lucide-react";
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
  마루: ["이건마루", "동화", "구정"],
  벽지: ["LX", "개나리", "서울", "제일", "신한", "현대벽지"],
  카페트타일: ["스완", "어반"],
  부자재: []
};

// Default brand selection for each category to prevent empty listings when tabs switch
const DEFAULT_BRAND_BY_CATEGORY = {
  데코타일: "KCC",
  장판: "LX",
  마루: "이건마루",
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
  if ((m.brand === "KCC" || (m.brand || "").includes("KCC")) && m.category === "데코타일") {
    return getKccLineup(m);
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

  // Unified Search State
  const initialSearch = (searchParams.get("q") || searchParams.get("search") || "").trim();
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedQuery, setDebouncedQuery] = useState(initialSearch);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputWrapperRef = useRef(null);

  // Sync state if URL changes (back/forward navigation)
  useEffect(() => {
    const currentQ = (searchParams.get("q") || searchParams.get("search") || "").trim();
    if (currentQ !== searchQuery) {
      setSearchQuery(currentQ);
      setDebouncedQuery(currentQ);
    }
  }, [searchParams]);

  // 200ms Debounce for instant live search while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searching = !!debouncedQuery;

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || !isSearchFocused) return [];
    return generateAutocompleteSuggestions(searchQuery);
  }, [searchQuery, isSearchFocused]);

  // Close autocomplete on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchInputWrapperRef.current && !searchInputWrapperRef.current.contains(e.target)) {
        setIsSearchFocused(false);
        setSelectedSuggestionIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Category & Brand resolution
  const urlCategory = searchParams.get("category");
  const urlBrand = searchParams.get("brand");

  const activeTab = urlCategory || (searching ? "all" : "데코타일");
  const defaultBrand = urlCategory ? "all" : (searching ? "all" : "KCC");
  const activeBrand = urlBrand || defaultBrand;
  
  const isKccDecotile = (activeTab === "데코타일" && (activeBrand === "KCC" || activeBrand.includes("KCC")));

  const activeMaterialType = searchParams.get("type") || "all";
  const rawLineParam = searchParams.get("line");
  let activeLine = "all";
  if (rawLineParam !== null) {
    activeLine = resolveKccLineupName(rawLineParam);
  } else if (!searching && isKccDecotile) {
    activeLine = "센스타일 트랜디 450각";
  }
  if (activeLine && activeLine.toUpperCase().includes("MACOSX")) {
    activeLine = "all";
  }

  const isEagonBrand = (activeTab === "마루" && (activeBrand === "이건마루" || activeBrand === "이건"));
  const activeEagonMajor = isEagonBrand ? (searchParams.get("type") || "all") : "all";
  const activeEagonLine = isEagonBrand ? (searchParams.get("line") || "all") : "all";
  const activeEagonSpec = isEagonBrand ? (searchParams.get("spec") || "all") : "all";

  const activeDongshinMajor = (activeTab === "데코타일" && (activeBrand === "동신" || activeBrand === "동신포리마"))
    ? (searchParams.get("line") || "all")
    : "all";
  const activeDongshinDetail = (activeTab === "데코타일" && (activeBrand === "동신" || activeBrand === "동신포리마"))
    ? (searchParams.get("detail") || "all")
    : "all";

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
    if (activeBrand !== "all" && activeBrand !== "KCC" && activeBrand !== "이건마루") count++;
    if (activeThickness !== "all") count++;
    if (activeShape !== "all") count++;
    if (isEagonBrand) {
      if (activeEagonMajor !== "all") count++;
      if (activeEagonLine !== "all") count++;
      if (activeEagonSpec !== "all") count++;
    } else {
      if (activeLine !== "all" && activeBrand !== "동신" && activeBrand !== "동신포리마") count++;
      if (activeDongshinMajor !== "all") count++;
      if (activeDongshinDetail !== "all") count++;
    }
    if (sortOption !== "default") count++;
    if (debouncedQuery.trim()) count++;
    return count;
  }, [activeBrand, activeThickness, activeShape, activeLine, activeDongshinMajor, activeDongshinDetail, isEagonBrand, activeEagonMajor, activeEagonLine, activeEagonSpec, sortOption, debouncedQuery]);

  const handleResetFilters = useCallback(() => {
    updateParams({ search: null, q: null, brand: "all", type: null, line: null, detail: null, shape: null, thickness: null, spec: null, sort: null });
    setSearchQuery("");
    setDebouncedQuery("");
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setDebouncedQuery("");
    setIsSearchFocused(false);
    setSelectedSuggestionIndex(-1);
    updateParams({ q: null, search: null });
  }, []);

  const handleKeywordClick = useCallback((kw) => {
    setSearchQuery(kw);
    setDebouncedQuery(kw);
    setIsSearchFocused(false);
    updateParams({ q: kw, search: null });
  }, []);

  const handleSuggestionClick = useCallback((suggestion) => {
    setSearchQuery(suggestion.query);
    setDebouncedQuery(suggestion.query);
    setIsSearchFocused(false);
    setSelectedSuggestionIndex(-1);
    const updates = { q: suggestion.query, search: null };
    if (suggestion.category && activeTab === "all") {
      updates.category = suggestion.category;
    }
    if (suggestion.brand && activeBrand === "all") {
      updates.brand = suggestion.brand;
    }
    updateParams(updates);
  }, [activeTab, activeBrand]);

  const handleSearchKeyDown = useCallback((e) => {
    if (suggestions.length === 0) {
      if (e.key === "Enter") {
        updateParams({ q: searchQuery.trim() || null, search: null });
        setIsSearchFocused(false);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
        handleSuggestionClick(suggestions[selectedSuggestionIndex]);
      } else {
        updateParams({ q: searchQuery.trim() || null, search: null });
        setIsSearchFocused(false);
      }
    } else if (e.key === "Escape") {
      setIsSearchFocused(false);
      setSelectedSuggestionIndex(-1);
    }
  }, [suggestions, selectedSuggestionIndex, searchQuery, handleSuggestionClick]);

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
      setLoading(true);
      setError(null);
      
      try {
        const res = debouncedQuery ? await searchMaterials(debouncedQuery, {
          category: activeTab,
          brand: activeBrand,
          thickness: activeThickness,
          signal: controller.signal
        }) : await fetchFilteredProducts({
          category: activeTab,
          brand: activeBrand,
          thickness: activeThickness,
          page: 0,
          pageSize: 2000,
          signal: controller.signal
        });

        if (requestId === fetchRequestIdRef.current) {
          const items = Array.isArray(res) ? res : (res.items || []);
          setMaterialsList(items);
          if (res && typeof res.totalCount === 'number') {
            setTotalCount(res.totalCount);
          } else {
            setTotalCount(items.length);
          }
        }
      } catch (err) {
        if (err.name === 'AbortError' || err.message === 'aborted') {
          return;
        }
        console.error("[Materials] load error:", err);
        if (requestId === fetchRequestIdRef.current) {
          setError(err.message || "자재 정보를 불러오지 못했습니다.");
        }
      } finally {
        if (requestId === fetchRequestIdRef.current) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      controller.abort();
    };
  }, [activeTab, activeBrand, activeThickness, debouncedQuery]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => prev + PRODUCTS_PER_LOAD);
  }, []);

  // Reset visibleCount to 30 whenever any filter, search input, or sort option changes
  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_LOAD);
  }, [activeTab, activeBrand, activeMaterialType, activeLine, activeDongshinMajor, activeDongshinDetail, isEagonBrand, activeEagonMajor, activeEagonLine, activeEagonSpec, activeShape, activeThickness, debouncedQuery, sortOption]);

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
        if (val === null || (val === "all" && !(key === "line" && isKccDecotile))) {
          newParams.delete(key);
        } else {
          newParams.set(key, val);
        }
      });
      return newParams;
    }, { replace: true });
  };

  // Sync URL for KCC decotile default lineup (센스타일 트랜디 450각)
  useEffect(() => {
    if (!searching && isKccDecotile && !searchParams.has("line")) {
      updateParams({
        category: "데코타일",
        brand: "KCC",
        line: "trendy-450"
      });
    }
  }, [searching, isKccDecotile, searchParams]);

  const handleCategoryChange = (category) => {
    // Switch category and reset brand to its default corresponding brand
    const defaultBrand = DEFAULT_BRAND_BY_CATEGORY[category] || "all";
    if (category === "데코타일" && (defaultBrand === "KCC" || defaultBrand.includes("KCC"))) {
      updateParams({ category, brand: "KCC", line: "trendy-450", type: null, shape: null, thickness: null, spec: null, detail: null });
    } else {
      updateParams({ category, brand: defaultBrand, type: null, line: null, shape: null, thickness: null, spec: null, detail: null });
    }
  };

  const setActiveBrand = (brand) => {
    if ((brand === "KCC" || brand.includes("KCC")) && activeTab === "데코타일") {
      updateParams({ brand: "KCC", line: "trendy-450", type: null, shape: null, thickness: null, spec: null, detail: null });
    } else {
      updateParams({ brand, type: null, line: null, shape: null, thickness: null, spec: null, detail: null });
    }
  };

  const setActiveMaterialType = (type) => updateParams({ type });
  const setActiveLine = (line) => {
    const slug = KCC_LINEUP_NAME_TO_SLUG[line] || line;
    updateParams({ line: slug === "all" ? (isKccDecotile ? "all" : null) : slug, shape: null });
  };
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
    
    if (activeTab === "데코타일" && (activeBrand === "KCC" || activeBrand.includes("KCC"))) {
      const kccLines = new Set();
      materialsList.forEach((m) => {
        if (!m) return;
        const b = (m.brand || "").toUpperCase();
        if ((b === "KCC" || b.includes("KCC")) && m.category === "데코타일") {
          const l = getKccLineup(m);
          if (l) kccLines.add(l);
        }
      });
      const sortedKccLines = Array.from(kccLines).sort((a, b) => {
        return getKccLineupPriority(a) - getKccLineupPriority(b);
      });
      return ["all", ...sortedKccLines];
    }

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

  const dongshinMajorCounts = useMemo(() => {
    if (activeTab !== "데코타일" || (activeBrand !== "동신" && activeBrand !== "동신포리마") || !materialsList) return {};
    const counts = { "전체": 0 };
    DONGSHIN_MAJOR_CATEGORIES.forEach(cat => {
      if (cat !== "전체") counts[cat] = 0;
    });

    materialsList.forEach(m => {
      if (!m || m.category !== "데코타일" || (m.brand !== "동신" && m.brand !== "동신포리마")) return;
      const major = getDongshinMajorCategory(m);
      counts["전체"] = (counts["전체"] || 0) + 1;
      if (major && counts[major] !== undefined) {
        counts[major] = (counts[major] || 0) + 1;
      }
    });

    return counts;
  }, [materialsList, activeTab, activeBrand]);

  const dongshinDetailCounts = useMemo(() => {
    if (activeTab !== "데코타일" || (activeBrand !== "동신" && activeBrand !== "동신포리마") || !materialsList) return {};
    const counts = { "전체": 0 };

    const targetItems = materialsList.filter(m => {
      if (!m || m.category !== "데코타일" || (m.brand !== "동신" && m.brand !== "동신포리마")) return false;
      if (activeDongshinMajor !== "all" && getDongshinMajorCategory(m) !== activeDongshinMajor) {
        return false;
      }
      return true;
    });

    counts["전체"] = targetItems.length;

    targetItems.forEach(m => {
      const detail = getDongshinDetailedLineup(m);
      if (detail) {
        counts[detail] = (counts[detail] || 0) + 1;
      }
    });

    return counts;
  }, [materialsList, activeTab, activeBrand, activeDongshinMajor]);

  // Eagon Major, Lineup, and Spec Counts
  const eagonMajorCounts = useMemo(() => {
    if (!isEagonBrand || !materialsList) return {};
    const counts = { "전체": 0, "원목마루": 0, "천연마루": 0, "강마루": 0 };
    materialsList.forEach(m => {
      if (!m || !isEagonProduct(m)) return;
      counts["전체"]++;
      const type = getEagonMaterialType(m);
      if (counts[type] !== undefined) counts[type]++;
    });
    return counts;
  }, [isEagonBrand, materialsList]);

  const visibleEagonLineups = useMemo(() => {
    if (!isEagonBrand) return [];
    return EAGON_LINEUPS_BY_MAJOR[activeEagonMajor] || EAGON_LINEUPS_BY_MAJOR["전체"];
  }, [isEagonBrand, activeEagonMajor]);

  const eagonLineCounts = useMemo(() => {
    if (!isEagonBrand || !materialsList) return {};
    const counts = { "전체": 0 };
    materialsList.forEach(m => {
      if (!m || !isEagonProduct(m)) return;
      if (activeEagonMajor !== "all" && getEagonMaterialType(m) !== activeEagonMajor) return;
      counts["전체"]++;
      const group = getEagonLineupGroup(m);
      counts[group] = (counts[group] || 0) + 1;
    });
    return counts;
  }, [isEagonBrand, materialsList, activeEagonMajor]);

  const visibleEagonSpecs = useMemo(() => {
    if (!isEagonBrand || activeEagonLine === "all") return [];
    return EAGON_SPECS_BY_LINEUP[activeEagonLine] || [];
  }, [isEagonBrand, activeEagonLine]);

  const eagonSpecCounts = useMemo(() => {
    if (!isEagonBrand || activeEagonLine === "all" || !materialsList) return {};
    const counts = { "all": 0 };
    materialsList.forEach(m => {
      if (!m || !isEagonProduct(m)) return;
      if (getEagonLineupGroup(m) !== activeEagonLine) return;
      counts["all"]++;
      const spec = getEagonSpecKey(m);
      counts[spec] = (counts[spec] || 0) + 1;
    });
    return counts;
  }, [isEagonBrand, activeEagonLine, materialsList]);

  const visibleDongshinDetails = useMemo(() => {
    if (activeTab !== "데코타일" || (activeBrand !== "동신" && activeBrand !== "동신포리마")) return [];
    const list = DONGSHIN_DETAILED_LINEUPS_MAP[activeDongshinMajor] || DONGSHIN_DETAILED_LINEUPS_MAP["전체"];
    return ["전체", ...list.filter(item => item !== "전체")];
  }, [activeTab, activeBrand, activeDongshinMajor]);

  // KCC Decotile specific options (Shape & Pattern)
  const visibleShapes = useMemo(() => {
    if (activeTab !== "데코타일" || (activeBrand !== "KCC" && activeBrand !== "all") || !materialsList) return [];
    
    if (activeLine === "센스레이(내수)") {
      return ["all", "라지 우드", "일반 우드", "라지 타일", "일반 타일", "텍스타일 플랭크"];
    }

    const shapes = new Set();
    materialsList.forEach(m => {
      if ((m.brand === "KCC" || m.brand === "KCC글라스" || (m.brand && m.brand.includes("KCC"))) && m.category === "데코타일") {
        const line = getNormalizedLine(m, activeTab, activeBrand);
        if (activeLine !== "all" && line !== activeLine && m.line !== activeLine) return;
        if (m.shape) shapes.add(m.shape);
      }
    });
    const orderMap = { "일반 우드": 1, "600각": 2, "450각": 3, "와이드 우드": 4 };
    const sortedShapes = Array.from(shapes).sort((a, b) => (orderMap[a] || 99) - (orderMap[b] || 99));
    return ["all", ...sortedShapes];
  }, [materialsList, activeTab, activeBrand, activeLine]);


  // Wall paper material types
  const MATERIAL_TYPES = ["all", "프리미엄", "디아망", "합지(소폭)", "합지(장폭)", "합지", "실크", "방염"];

  // Filter items
  const filtered = useMemo(() => {
    if (!materialsList || materialsList.length === 0) return [];
    
    let result = materialsList.filter((m) => {
      if (!m || m.active === false || m.is_active === false) return false;

      // When searching, match score must be > 0
      if (searching && getSearchScore(m, debouncedQuery) <= 0) {
        return false;
      }

      // Category tab check (if activeTab is 'all', all categories pass)
      const tabOk = (activeTab === "all" || m.category === activeTab);

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
        } else if (b.includes("이건")) {
          brandOk = isEagonProduct(m);
        } else {
          brandOk = itemBrand === b || compBrand === b || itemBrand.includes(b) || compBrand.includes(b);
        }
      }

      // Eagon specific hierarchical check (대분류 -> 라인업 -> 규격)
      if (isEagonBrand) {
        if (!isEagonProduct(m)) return false;
        if (activeEagonMajor !== "all" && getEagonMaterialType(m) !== activeEagonMajor) {
          return false;
        }
        if (activeEagonLine !== "all" && getEagonLineupGroup(m) !== activeEagonLine) {
          return false;
        }
        if (activeEagonSpec !== "all" && getEagonSpecKey(m) !== activeEagonSpec) {
          return false;
        }
        return tabOk && brandOk;
      }

      // Material Type check (only for 마루)
      let typeOk = true;
      if (activeTab === "마루" && activeMaterialType !== "all") {
        typeOk = (m.materialType === activeMaterialType);
      }

      // Line check
      let lineOk = true;
      if (activeTab === "데코타일" && (activeBrand === "동신" || activeBrand === "동신포리마")) {
        if (activeDongshinMajor !== "all") {
          const mMajor = getDongshinMajorCategory(m);
          if (mMajor !== activeDongshinMajor) lineOk = false;
        }
        if (activeDongshinDetail !== "all") {
          const mDetail = getDongshinDetailedLineup(m);
          if (mDetail !== activeDongshinDetail) lineOk = false;
        }
      } else if (activeLine !== "all") {
        const line = activeTab === "마루" ? m.displayLine : getNormalizedLine(m, activeTab, activeBrand);
        if (activeTab === "마루" && m.brand === "구정" && m.series === "노블레스") {
          lineOk = (line === activeLine || (m.sizeOptions && m.sizeOptions.some(o => o.label === activeLine)));
        } else {
          lineOk = (line === activeLine);
        }
      }

      // Shape check (only for KCC decotiles)
      let shapeOk = true;
      if (activeTab === "데코타일" && (activeBrand === "KCC" || activeBrand === "all") && activeShape !== "all") {
        if (activeLine === "센스레이(내수)" || (m.line || "").includes("센스레이")) {
          const sizeText = m.spec || m.specs?.size || m.size_text || "";
          const s = String(sizeText).replace(/\s+/g, "");
          if (activeShape === "라지 우드") shapeOk = s.includes("1524") || s.includes("228.6");
          else if (activeShape === "일반 우드") shapeOk = s.includes("1219") || s.includes("177.8");
          else if (activeShape === "라지 타일") shapeOk = s.includes("914.4") || s.includes("914");
          else if (activeShape === "일반 타일") shapeOk = s.includes("457.2x457.2") || s.includes("457.2×457.2");
          else if (activeShape === "텍스타일 플랭크") shapeOk = s.includes("184") || s.includes("950");
        } else {
          shapeOk = (m.shape === activeShape);
        }
      }

      // Thickness check (only for 장판)
      let thicknessOk = true;
      if (activeTab === "장판" && activeThickness !== "all") {
        thicknessOk = (m.thickness === activeThickness);
      }

      return tabOk && brandOk && typeOk && lineOk && shapeOk && thicknessOk;
    });

    return result;
  }, [materialsList, activeTab, activeBrand, isEagonBrand, activeEagonMajor, activeEagonLine, activeEagonSpec, activeMaterialType, activeLine, activeDongshinMajor, activeDongshinDetail, activeShape, activeThickness, visibleLines, searching, debouncedQuery]);

  // Apply sorting pipeline on filtered products (Immutably using useMemo)
  const sortedProducts = useMemo(() => {
    if (searching && sortOption === "default") {
      return [...filtered].sort((a, b) => getSearchScore(b, debouncedQuery) - getSearchScore(a, debouncedQuery));
    }
    return sortProducts(filtered, sortOption);
  }, [filtered, sortOption, searching, debouncedQuery]);

  const isFilteredSearch = useMemo(() => {
    return activeLine !== "all" || activeDongshinMajor !== "all" || activeDongshinDetail !== "all" || activeShape !== "all" || activeThickness !== "all" || activeMaterialType !== "all" || (isEagonBrand && (activeEagonMajor !== "all" || activeEagonLine !== "all" || activeEagonSpec !== "all")) || searching;
  }, [activeLine, activeDongshinMajor, activeDongshinDetail, activeShape, activeThickness, activeMaterialType, isEagonBrand, activeEagonMajor, activeEagonLine, activeEagonSpec, searching]);

  const displayTotalCount = useMemo(() => {
    if (searching || isFilteredSearch) return sortedProducts.length;
    return totalCount || sortedProducts.length;
  }, [searching, isFilteredSearch, sortedProducts.length, totalCount]);

  const visibleProducts = useMemo(() => {
    return sortedProducts.slice(0, visibleCount);
  }, [sortedProducts, visibleCount]);

  const hasMoreItems = useMemo(() => {
    return visibleCount < sortedProducts.length;
  }, [visibleCount, sortedProducts.length]);

  // Retry handler for user-initiated retry action
  const handleRetry = useCallback(() => {
    const requestId = ++fetchRequestIdRef.current;
    setError(null);
    setLoading(true);

    (debouncedQuery ? searchMaterials(debouncedQuery) : fetchFilteredProducts({
      category: activeTab,
      brand: activeBrand,
      thickness: activeThickness,
      page: 0,
      pageSize: 2000
    }))
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
  }, [activeTab, activeBrand, activeThickness, debouncedQuery]);

  const seoTitle = searching ? `“${debouncedQuery}” 자재 검색 | 동경바닥재` : activeTab
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

            {/* 통합 검색창 (Unified Search Bar & Autocomplete & Popular Tags) */}
            <div className="materials-unified-search-section" ref={searchInputWrapperRef}>
              <div className={`materials-search-input-wrapper ${isSearchFocused ? 'focused' : ''}`}>
                <Search size={20} className="materials-search-icon" />
                <input
                  type="text"
                  className="materials-search-input"
                  placeholder="제품명, 브랜드, 제품번호, 라인업 검색 (예: 디아망, 8195, 30082P)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onKeyDown={handleSearchKeyDown}
                  autoComplete="off"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    className="materials-search-clear-btn" 
                    onClick={handleClearSearch}
                    aria-label="검색어 지우기"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Autocomplete Suggestions Dropdown */}
              {isSearchFocused && suggestions.length > 0 && (
                <div className="materials-autocomplete-dropdown" role="listbox">
                  {suggestions.map((item, idx) => {
                    let badgeClass = 'badge-lineup';
                    if (item.type === 'brand') badgeClass = 'badge-brand';
                    else if (item.type === 'product') badgeClass = 'badge-product';
                    else if (item.type === 'category') badgeClass = 'badge-category';
                    else if (item.type === 'spec') badgeClass = 'badge-spec';

                    return (
                      <div
                        key={item.title + idx}
                        className={`autocomplete-item ${selectedSuggestionIndex === idx ? 'selected' : ''}`}
                        onClick={() => handleSuggestionClick(item)}
                        onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                        role="option"
                        aria-selected={selectedSuggestionIndex === idx}
                      >
                        <div className="autocomplete-item-left">
                          <span className={`autocomplete-badge ${badgeClass}`}>{item.badge}</span>
                          <div className="autocomplete-text-group">
                            <span className="autocomplete-title">{item.title}</span>
                            {item.subtitle && <span className="autocomplete-subtitle">{item.subtitle}</span>}
                          </div>
                        </div>
                        <span className="autocomplete-action-hint">선택 ↵</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Popular Search Keywords */}
              <div className="search-popular-keywords-bar">
                <span className="popular-label">인기 검색:</span>
                {POPULAR_KEYWORDS.map(kw => (
                  <button
                    key={kw}
                    type="button"
                    className="popular-tag-btn"
                    onClick={() => handleKeywordClick(kw)}
                  >
                    {kw}
                  </button>
                ))}
              </div>
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

                {isEagonBrand ? (
                  <>
                    {activeEagonMajor !== "all" && (
                      <span className="active-chip">
                        대분류: {activeEagonMajor}
                        <X size={14} className="chip-remove" onClick={() => updateParams({ type: null, line: null, spec: null })} />
                      </span>
                    )}
                    {activeEagonLine !== "all" && (
                      <span className="active-chip">
                        라인업: {activeEagonLine}
                        <X size={14} className="chip-remove" onClick={() => updateParams({ line: null, spec: null })} />
                      </span>
                    )}
                    {activeEagonSpec !== "all" && (
                      <span className="active-chip">
                        규격: {activeEagonSpec}
                        <X size={14} className="chip-remove" onClick={() => updateParams({ spec: null })} />
                      </span>
                    )}
                  </>
                ) : activeTab === "데코타일" && (activeBrand === "동신" || activeBrand === "동신포리마") ? (
                  <>
                    {activeDongshinMajor !== "all" && (
                      <span className="active-chip">
                        대분류: {activeDongshinMajor}
                        <X size={14} className="chip-remove" onClick={() => updateParams({ line: null, detail: null })} />
                      </span>
                    )}
                    {activeDongshinDetail !== "all" && (
                      <span className="active-chip">
                        세부 라인업: {activeDongshinDetail}
                        <X size={14} className="chip-remove" onClick={() => updateParams({ detail: null })} />
                      </span>
                    )}
                  </>
                ) : (
                  activeLine !== "all" && (
                    <span className="active-chip">
                      라인업: {formatShapeOrPattern(activeLine)}
                      <X size={14} className="chip-remove" onClick={() => setActiveLine("all")} />
                    </span>
                  )
                )}
                {debouncedQuery.trim() && (
                  <span className="active-chip">
                    검색어: {debouncedQuery}
                    <X size={14} className="chip-remove" onClick={handleClearSearch} />
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
              {activeTab === "마루" && !isEagonBrand && visibleMaterialTypes.length > 2 && (
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
            {/* Search Results Summary Header Bar */}
            {searching && (
              <div className="search-results-summary-bar">
                <div className="search-results-headline">
                  <span className="search-query-highlight">“{debouncedQuery}”</span> 검색 결과: 총 <strong>{displayTotalCount}</strong>개 상품
                </div>
                {(activeTab !== "all" || activeBrand !== "all" || activeThickness !== "all") && (
                  <div className="search-active-filter-tags">
                    {activeTab !== "all" && (
                      <span className="search-filter-tag">
                        카테고리: {activeTab}
                        <X size={12} onClick={() => updateParams({ category: "all" })} />
                      </span>
                    )}
                    {activeBrand !== "all" && (
                      <span className="search-filter-tag">
                        브랜드: {activeBrand}
                        <X size={12} onClick={() => updateParams({ brand: "all" })} />
                      </span>
                    )}
                    {activeThickness !== "all" && (
                      <span className="search-filter-tag">
                        두께: {activeThickness}
                        <X size={12} onClick={() => updateParams({ thickness: null })} />
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Filter Conflict Notice */}
            {searching && sortedProducts.length === 0 && (activeTab !== "all" || activeBrand !== "all" || activeThickness !== "all") && (
              <div className="search-filter-conflict-notice">
                <div className="conflict-icon">🔍</div>
                <div className="conflict-message">현재 선택한 필터에서 검색 결과가 없습니다.</div>
                <div className="conflict-subtext">
                  선택하신 조건({activeTab !== 'all' ? `카테고리: ${activeTab} ` : ''}{activeBrand !== 'all' ? `브랜드: ${activeBrand}` : ''})에서는 “{debouncedQuery}” 검색 결과가 없습니다.
                </div>
                <button 
                  type="button" 
                  className="conflict-search-all-btn"
                  onClick={() => {
                    updateParams({ category: "all", brand: "all", thickness: null, type: null, line: null, detail: null, shape: null, spec: null });
                  }}
                >
                  전체 자재에서 검색
                </button>
              </div>
            )}

            {/* Dongshin 2-Tier Lineup Filter */}
            {!loading && activeTab === "데코타일" && (activeBrand === "동신" || activeBrand === "동신포리마") && (
              <>
                <div className="materials-lineup-filter dongshin-major-group">
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', alignSelf: 'center', marginRight: '6px' }}>대분류:</span>
                  {DONGSHIN_MAJOR_CATEGORIES.map((catName) => (
                    <button
                      key={catName}
                      className={`material-type-chip ${activeDongshinMajor === catName ? "active" : ""}`}
                      onClick={() => updateParams({ line: catName === "전체" ? null : catName, detail: null })}
                    >
                      {catName === "전체"
                        ? `전체 (${dongshinMajorCounts["전체"] || 130})`
                        : `${catName} (${dongshinMajorCounts[catName] || 0})`}
                    </button>
                  ))}
                </div>

                {visibleDongshinDetails.length > 0 && (
                  <div className="materials-lineup-filter dongshin-detail-group" style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', alignSelf: 'center', marginRight: '6px' }}>세부 라인업:</span>
                    {visibleDongshinDetails.map((detailName) => (
                      <button
                        key={detailName}
                        className={`material-type-chip ${activeDongshinDetail === detailName ? "active" : ""}`}
                        onClick={() => updateParams({ detail: detailName === "전체" ? null : detailName })}
                      >
                        {detailName === "전체"
                          ? `전체 (${dongshinDetailCounts["전체"] || 0})`
                          : `${detailName} (${dongshinDetailCounts[detailName] || 0})`}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Eagon 3-Tier Lineup & Spec Filter */}
            {!loading && isEagonBrand && (
              <>
                <div className="materials-lineup-filter eagon-major-group">
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', alignSelf: 'center', marginRight: '6px' }}>대분류:</span>
                  {EAGON_MAJOR_CATEGORIES.map((catName) => (
                    <button
                      key={catName}
                      className={`material-type-chip ${activeEagonMajor === (catName === "전체" ? "all" : catName) ? "active" : ""}`}
                      onClick={() => updateParams({ type: catName === "전체" ? null : catName, line: null, spec: null })}
                    >
                      {catName === "전체"
                        ? `전체 (${eagonMajorCounts["전체"] || 122})`
                        : `${catName} (${eagonMajorCounts[catName] || 0})`}
                    </button>
                  ))}
                </div>

                {visibleEagonLineups.length > 0 && (
                  <div className="materials-lineup-filter eagon-lineup-group" style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', alignSelf: 'center', marginRight: '6px' }}>라인업:</span>
                    {visibleEagonLineups.map((lineName) => (
                      <button
                        key={lineName}
                        className={`material-type-chip ${activeEagonLine === (lineName === "전체" ? "all" : lineName) ? "active" : ""}`}
                        onClick={() => updateParams({ line: lineName === "전체" ? null : lineName, spec: null })}
                      >
                        {lineName === "전체"
                          ? `전체 (${eagonLineCounts["전체"] || 0})`
                          : `${lineName} (${eagonLineCounts[lineName] || 0})`}
                      </button>
                    ))}
                  </div>
                )}

                {visibleEagonSpecs.length > 1 && (
                  <div className="materials-lineup-filter eagon-spec-group" style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', alignSelf: 'center', marginRight: '6px' }}>규격:</span>
                    {visibleEagonSpecs.map((specKey) => {
                      let specLabel = specKey;
                      if (specKey === "all") specLabel = `전체 규격 (${eagonSpecCounts["all"] || 0})`;
                      else if (activeEagonLine === "그린") specLabel = `${specKey}폭 (${eagonSpecCounts[specKey] || 0})`;
                      else if (activeEagonLine === "그린 스퀘어") specLabel = specKey === "597" ? `597각 (4)` : `395각 (4)`;
                      else if (activeEagonLine === "세라 플렉스 S") specLabel = specKey === "395" ? `395 스톤 (4)` : `165 우드 (14)`;
                      else specLabel = `${specKey} (${eagonSpecCounts[specKey] || 0})`;

                      return (
                        <button
                          key={specKey}
                          className={`material-type-chip ${activeEagonSpec === specKey ? "active" : ""}`}
                          onClick={() => updateParams({ spec: specKey === "all" ? null : specKey })}
                        >
                          {specLabel}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Lineup Filter (Non-Dongshin, Non-Eagon) */}
            {!loading && !(activeTab === "데코타일" && (activeBrand === "동신" || activeBrand === "동신포리마")) && !isEagonBrand && visibleLines.length > 1 && (
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
                    debouncedQuery
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
        activeDongshinMajor={activeDongshinMajor}
        onDongshinMajorChange={(cat) => updateParams({ line: cat === "전체" ? null : cat, detail: null })}
        visibleDongshinDetails={visibleDongshinDetails}
        activeDongshinDetail={activeDongshinDetail}
        onDongshinDetailChange={(det) => updateParams({ detail: det === "전체" ? null : det })}
        sortOption={sortOption}
        onSortChange={(val) => updateParams({ sort: val === "default" ? null : val })}
        totalCount={sortedProducts.length}
        onResetFilters={handleResetFilters}
      />
    </MainLayout>
  );
}

