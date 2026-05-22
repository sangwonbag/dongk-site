import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { materials, BRANDS_BY_CATEGORY } from "../../data/materials.db";
import { getComputedBrand } from "../../utils/brandUtils";
import { getSearchScore } from "../../utils/searchUtils";
import MaterialCard from "../../components/material/MaterialCard";
import "./Materials.css";
import SampleBookPDF from "../../components/samplebook/SampleBookPDF";
// import DownloadPdfButton from "../components/DownloadPdfButton";

// useQuery removed in favor of useSearchParams

/** ✅ 상단 탭: 추천 + 카테고리 */
const CATEGORY_TABS = [
  { id: "recommended", label: "추천 자재" },
  { id: "데코타일", label: "데코타일" },
  { id: "장판", label: "장판" },
  { id: "마루", label: "마루" },
  { id: "벽지", label: "벽지" },
  { id: "카페트타일", label: "카페트타일" },
  { id: "러버타일", label: "러버타일" },
];

export default function Materials() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read state directly from URL query parameters
  const activeTab = searchParams.get("category") || "recommended";
  const activeBrand = searchParams.get("brand") || "all";
  const activeMaterialType = searchParams.get("type") || "all";
  const activeLine = searchParams.get("line") || "all";
  const searchText = searchParams.get("search") || "";

  // Pagination state
  const [visibleCount, setVisibleCount] = useState(100);

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
    if (tab === "recommended") {
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
    if (activeTab === "recommended") return ["all", "KCC", "동신", "유성"];
    return ["all", ...(BRANDS_BY_CATEGORY[activeTab] || [])];
  }, [activeTab]);

  /** ✅ 라인업 목록: 선택된 카테고리와 브랜드에 따라 동적으로 생성 (폴더 구조 반영) */
  const visibleLines = useMemo(() => {
    if (!materials || activeTab === "recommended" || activeBrand === "all") return [];
    
    const linesSet = new Set();
    materials.forEach((m) => {
      if (m && m.category === activeTab && getComputedBrand(m) === activeBrand && m.line) {
        let line = m.line;
        if (line.includes('_')) {
          const parts = line.split('_').map(p => p.trim());
          if (activeTab === "마루") {
            if (activeBrand === "이건") {
              if (parts[0] === '강마루' || parts[0] === '프리미엄 강마루' || parts[0] === '원목마루' || parts[0] === '천연마루') {
                if (parts.length > 2) {
                  line = parts[2];
                } else if (parts.length > 1) {
                  line = parts[1];
                }
              }
            } else if (activeBrand === "구정") {
              if (parts.length > 1) {
                line = parts[1];
              } else {
                line = parts[0];
              }
            } else {
              line = parts[0];
            }
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
  }, [activeTab, activeBrand]);

  /** ✅ 재질 목록 (벽지 전용) */
  const MATERIAL_TYPES = ["all", "프리미엄", "디아망", "합지(소폭)", "합지(장폭)", "합지", "실크", "방염"];

  /** ✅ 최종 필터링: (카테고리/추천) + (브랜드) + (재질) + (검색) */
  const filtered = useMemo(() => {
    if (!materials) return [];
    const s = (searchText || "").trim();

    // 1) 검색어가 있으면 모든 UI 필터 무시하고 전체 상품에서 검색
    if (s) {
      return materials
        .map((m) => ({ item: m, score: getSearchScore(m, s) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.item);
    }

    // 2) 검색어가 없을 때만 UI 필터 강제 적용 (URL 기준)
    let results = materials.filter((m) => {
      if (!m) return false;

      // 탭(카테고리) 필터
      let tabOk = true;
      if (activeTab === "recommended") {
        tabOk = (m.brand === "KCC" || m.brand === "동신" || m.brand === "유성");
      } else {
        tabOk = (m.category === activeTab);
      }

      // 브랜드 필터
      const mComputedBrand = getComputedBrand(m);
      let brandOk =
        activeBrand === "all"
          ? true
          : mComputedBrand === activeBrand;

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

    return results;
  }, [activeTab, activeBrand, activeMaterialType, activeLine, searchText, visibleLines]);

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
              <div className="results-actions">
                {/* <DownloadPdfButton
                  doc={
                    <SampleBookPDF
                      coverImage={pdfCover}
                      materials={filtered}
                      title={`${activeBrand === "all" ? "전체 브랜드" : activeBrand} 샘플북`}
                    />
                  }
                  fileName={pdfFileName}
                /> */}
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
