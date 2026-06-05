import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { BRANDS_BY_CATEGORY } from "../../data/materials.db";
import { getComputedBrand } from "../../utils/brandUtils";
import { getSearchScore } from "../../utils/searchUtils";
import MaterialCard from "../../components/material/MaterialCard";
import { fetchAllProducts } from "../../utils/supabaseFetcher";
import "./Materials.css";

const CATEGORY_TABS = [
  { id: "all", label: "전체보기" },
  { id: "데코타일", label: "데코타일" },
  { id: "장판", label: "장판" },
  { id: "마루", label: "마루" },
  { id: "벽지", label: "벽지" },
  { id: "카페트타일", label: "카페트타일" },
  { id: "러버타일", label: "러버타일" },
];

export default function Materials() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Supabase Data States
  const [materialsList, setMaterialsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Read state directly from URL query parameters
  const activeTab = searchParams.get("category") || "all";
  const activeBrand = searchParams.get("brand") || "all";
  const activeMaterialType = searchParams.get("type") || "all";
  const activeLine = searchParams.get("line") || "all";
  const searchText = searchParams.get("search") || "";

  // Pagination state
  const [visibleCount, setVisibleCount] = useState(100);

  // Fetch from Supabase on mount
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        console.log("[Debug] Fetching all materials from Supabase...");
        
        const data = await fetchAllProducts();
        
        console.log("[Debug] Supabase response data size:", data ? data.length : 0);
        console.log("[Debug] Current filters state:", { activeTab, activeBrand, searchText });
        
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

  // Debugging logs requested by the user
  useEffect(() => {
    if (materialsList && materialsList.length > 0) {
      const jangpan = materialsList.filter(m => m.category === "장판");
      const lxJangpan = materialsList.filter(m => m.category === "장판" && (m.brand === "LX하우시스" || m.brand === "LX"));
      const firstJangpan = jangpan[0];

      console.log("=== [Debug materials stats] ===");
      console.log("전체 상품 개수 (from fetcher):", materialsList.length);
      console.log("장판 상품 개수:", jangpan.length);
      console.log("LX하우시스 장판 상품 개수:", lxJangpan.length);
      console.log("첫 번째 장판 상품 이미지 경로:", firstJangpan ? (firstJangpan.thumbnail || firstJangpan.image) : "없음");
      console.log("현재 URL query category:", activeTab);
      console.log("현재 URL query brand:", activeBrand);
      console.log("===============================");
    }
  }, [materialsList, activeTab, activeBrand]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(100);
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

  const setActiveTab = (tab) => {
    if (tab === "all") {
      updateParams({ category: null, brand: null, type: null, line: null }); // Default view
    } else {
      updateParams({ category: tab, brand: null, type: null, line: null });
    }
  };

  const setActiveBrand = (brand) => updateParams({ brand, type: null, line: null });
  const setActiveMaterialType = (type) => updateParams({ type });
  const setActiveLine = (line) => updateParams({ line });

  // Scroll restoration on return
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("materialsScrollY");
    if (savedScroll) {
      setTimeout(() => { // slight delay to allow rendering
        window.scrollTo(0, parseInt(savedScroll, 10));
        sessionStorage.removeItem("materialsScrollY");
      }, 50);
    }
  }, []);

  /** ✅ 브랜드 목록: 카테고리에 맞춰 가공 (요구사항 반영) */
  const visibleBrands = useMemo(() => {
    if (activeTab === "all") {
      const allUniqueBrands = new Set();
      Object.values(BRANDS_BY_CATEGORY).forEach((brandsList) => {
        if (Array.isArray(brandsList)) {
          brandsList.forEach((b) => allUniqueBrands.add(b));
        }
      });
      return ["all", ...Array.from(allUniqueBrands)];
    }
    return ["all", ...(BRANDS_BY_CATEGORY[activeTab] || [])];
  }, [activeTab]);

  /** ✅ 라인업 목록: 선택된 카테고리와 브랜드에 따라 동적으로 생성 (폴더 구조 반영) */
  const visibleLines = useMemo(() => {
    if (!materialsList || materialsList.length === 0 || activeTab === "all" || activeBrand === "all") return [];
    
    const linesSet = new Set();
    materialsList.forEach((m) => {
      const matchesBrand =
        getComputedBrand(m) === activeBrand ||
        m.brand === activeBrand ||
        (activeBrand === "LX하우시스" && (m.brand === "LX" || m.brand === "LX하우시스"));
      
      if (m && m.category === activeTab && matchesBrand && m.line) {
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
            if (activeBrand === "KCC") {
              line = parts[1] || parts[0];
            } else if (activeBrand === "LX") {
              line = parts[1] || parts[0];
            } else if (activeBrand === "현대") {
              line = parts[0];
            } else if (activeBrand === "녹수" || activeBrand === "동신" || activeBrand === "재영" || activeBrand === "유성") {
              line = parts[0];
            }
          }
        }
        linesSet.add(line);
      }
    });
    
    return ["all", ...Array.from(linesSet).sort()];
  }, [materialsList, activeTab, activeBrand]);

  /** ✅ 재질 목록 (벽지 전용) */
  const MATERIAL_TYPES = ["all", "프리미엄", "디아망", "합지(소폭)", "합지(장폭)", "합지", "실크", "방염"];

  /** ✅ 최종 필터링: (카테고리/추천) + (브랜드) + (재질) + (검색) */
  const filtered = useMemo(() => {
    if (!materialsList || materialsList.length === 0) return [];
    const s = (searchText || "").trim();

    // 1) 검색어가 있으면 모든 UI 필터 무시하고 전체 상품에서 검색
    if (s) {
      const searched = materialsList
        .map((m) => ({ item: m, score: getSearchScore(m, s) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.item);
      console.log("[Debug] Search results:", { searchText: s, count: searched.length });
      return searched;
    }

    // 2) 검색어가 없을 때만 UI 필터 강제 적용 (URL 기준)
    let results = materialsList.filter((m) => {
      if (!m) return false;

      // 탭(카테고리) 필터
      let tabOk = true;
      if (activeTab !== "all") {
        tabOk = (m.category === activeTab);
      }

      // 브랜드 필터
      const mComputedBrand = getComputedBrand(m);
      let brandOk =
        activeBrand === "all"
          ? true
          : (mComputedBrand === activeBrand ||
             m.brand === activeBrand ||
             (activeBrand === "LX하우시스" && (m.brand === "LX" || m.brand === "LX하우시스")));

      // 재질 필터 (벽지일 때만 작동)
      let materialOk = true;
      if (activeTab === "벽지" && activeMaterialType !== "all") {
        materialOk = (m.materialType === activeMaterialType);
      }

      // 라인 필터 (동적 라인 적용 - 실제 라인이 2개 이상일 때만 필터 작동)
      let lineOk = true;
      if (activeLine !== "all" && visibleLines.length > 2) {
        lineOk = (m.line || "").includes(activeLine);
      }

      return tabOk && brandOk && materialOk && lineOk;
    });

    console.log("[Debug] Filtering results:", { category: activeTab, brand: activeBrand, count: results.length });
    return results;
  }, [materialsList, activeTab, activeBrand, activeMaterialType, activeLine, searchText, visibleLines]);

  // Loading View
  if (loading) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: "100px 0", textAlign: "center", fontSize: "16px", color: "#6B6B6B" }}>
          자료를 불러오는 중입니다.
        </div>
      </MainLayout>
    );
  }

  // Error View with full diagnostic instructions
  if (error) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: "100px 0", textAlign: "center", fontSize: "16px" }}>
          <h2 style={{ color: "#d9534f" }}>자료를 불러오지 못했습니다.</h2>
          <p style={{ marginTop: "10px", fontSize: "14px", color: "#6B6B6B" }}>
            <strong>오류 내용:</strong> {error}
          </p>
          <div style={{ marginTop: "24px", display: "inline-block", background: "#f8d7da", border: "1px solid #f5c6cb", padding: "20px", borderRadius: "8px", color: "#721c24", textAlign: "left", fontSize: "14px", maxWidth: "600px", lineHeight: "1.6" }}>
            <strong>💡 디버그 체크리스트:</strong><br />
            1. <strong>환경변수 문제:</strong> <code>.env.local</code> 파일의 <code>VITE_SUPABASE_URL</code> 및 <code>VITE_SUPABASE_ANON_KEY</code>가 비어 있거나 올바르지 않은지 확인하십시오.<br />
            2. <strong>테이블명 문제:</strong> 데이터베이스에 <code>public.products</code> 테이블이 존재하지 않거나 캐시 불일치가 발생했는지 확인하십시오.<br />
            3. <strong>RLS 권한 문제:</strong> Supabase RLS 정책에서 anonymous 권한에 대한 SELECT를 비활성화했는지 확인하십시오.<br />
            4. <strong>필터링 문제:</strong> 컬럼명 맵핑 또는 PostgREST join이 실패했는지 개발자 도구 콘솔 로그를 확인하십시오.
          </div>
        </div>
      </MainLayout>
    );
  }

  // No products in DB View
  if (materialsList.length === 0) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: "100px 0", textAlign: "center", fontSize: "16px", color: "#6B6B6B" }}>
          등록된 자재가 없습니다.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="materials-container container">
        <main className="materials-content full">
          {/* ✅ 상단 카테고리 탭 */}
          <div className="materials-tabs">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                className={`mat-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ✅ 브랜드 필터 (칩 형태) */}
          <div className="brand-row">
            {visibleBrands.map((b) => (
              <button
                key={b}
                className={`brand-chip ${activeBrand === b ? "active" : ""}`}
                onClick={() => setActiveBrand(b)}
              >
                {b === "all" ? "전체 브랜드" : b}
              </button>
            ))}
          </div>

          {/* ✅ 라인업 필터 (동적 라인 적용 - 실제 라인이 2개 이상일 때만 노출) */}
          {visibleLines.length > 2 && (
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

          {/* ✅ 재질 필터 (벽지일 때 브랜드가 선택된 경우 혹은 전체일 때 노출) */}
          {activeTab === "벽지" && (
            <div className="material-type-row">
              {(activeBrand === "all" ? ["all"] : activeBrand === "개나리" ? ["all", "프리미엄", "합지(소폭)", "합지(장폭)", "실크", "방염"] : activeBrand === "LX" ? ["all", "디아망", "합지", "실크", "방염"] : activeBrand === "서울" ? ["all", "프리미엄", "합지", "실크", "방염"] : ["all", "합지", "실크", "방염"]).map((t) => (
                <button
                  key={t}
                  className={`material-type-chip ${activeMaterialType === t ? "active" : ""}`}
                  onClick={() => setActiveMaterialType(t)}
                >
                  {t === "all" ? "전체 재질" : t}
                </button>
              ))}
            </div>
          )}

          <div className="materials-wrapper">
            <div className="results-header">
              <div className="results-info">
                <span>
                  총 <strong>{filtered.length}</strong>개 상품
                </span>
              </div>
            </div>

            {filtered.length > 0 ? (
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
                      onClick={() => setVisibleCount(prev => prev + 100)}
                    >
                      더보기 ({Math.min(visibleCount, filtered.length)} / {filtered.length})
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-results">상품 준비중입니다.</div>
            )}
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
