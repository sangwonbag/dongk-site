import React, { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { materials, ALL_BRANDS, BRANDS_BY_CATEGORY } from "../../data/materials.db";
import { getComputedBrand } from "../../utils/brandUtils";
import MaterialCard from "../../components/material/MaterialCard";
import "./Materials.css";
import SampleBookPDF from "../../components/samplebook/SampleBookPDF";
// import DownloadPdfButton from "../components/DownloadPdfButton";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

/** ✅ 상단 탭: 추천 + 카테고리 */
const CATEGORY_TABS = [
  { id: "recommended", label: "추천 자재" },
  { id: "데코타일", label: "데코타일" },
  { id: "장판", label: "장판" },
  { id: "마루", label: "마루" },
  { id: "벽지", label: "벽지" },
  { id: "카페트타일", label: "카페트타일" },
];

export default function Materials() {
  const query = useQuery();

  const searchText = query.get("search") || "";
  const [activeTab, setActiveTab] = useState("recommended");
  const [activeBrand, setActiveBrand] = useState("all");
  const [activeMaterialType, setActiveMaterialType] = useState("all");

  // 카테고리 이동 시 브랜드/재질 필터 초기화
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveBrand("all");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveMaterialType("all");
  }, [activeTab]);

  // 브랜드 변경 시 재질 필터 초기화
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveMaterialType("all");
  }, [activeBrand]);

  /** ✅ 브랜드 목록: 카테고리에 맞춰 가공 (요구사항 반영) */
  const visibleBrands = useMemo(() => {
    if (activeTab === "recommended") return ["all", ...ALL_BRANDS];
    return ["all", ...(BRANDS_BY_CATEGORY[activeTab] || [])];
  }, [activeTab]);

  /** ✅ 재질 목록 (벽지 전용) */
  const MATERIAL_TYPES = ["all", "합지", "실크", "방염"];

  /** ✅ 최종 필터링: (카테고리/추천) + (브랜드) + (재질) + (검색) */
  const filtered = useMemo(() => {
    if (!materials) return [];
    const s = (searchText || "").trim().toLowerCase();

    return materials.filter((m) => {
      if (!m) return false;

      // 1) 탭(카테고리) 필터
      let tabOk = true;
      if (activeTab === "recommended") {
        tabOk = !!m.isRecommended;
        // 추천이 0개면 전체 노출 (선택사항)
        const anyRec = materials.some(x => x && x.isRecommended);
        if (!anyRec) tabOk = true;
      } else {
        tabOk = (m.category === activeTab);
      }

      // 2) 브랜드 필터
      const mComputedBrand = getComputedBrand(m);
      let brandOk =
        activeBrand === "all"
          ? true
          : mComputedBrand === activeBrand;

      // 3) 재질 필터 (벽지일 때만 작동)
      let materialOk = true;
      if (activeTab === "벽지" && activeMaterialType !== "all") {
        materialOk = (m.materialType === activeMaterialType);
      }

      // 4) 검색 필터
      const searchOk = !s
        ? true
        : ((m.name || "").toLowerCase().includes(s) ||
          (m.code || "").toLowerCase().includes(s) ||
          mComputedBrand.toLowerCase().includes(s));

      return tabOk && brandOk && materialOk && searchOk;
    });
  }, [activeTab, activeBrand, activeMaterialType, searchText]);

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

          {/* ✅ 재질 필터 (벽지일 때 브랜드가 선택된 경우 혹은 전체일 때 노출) */}
          {activeTab === "벽지" && (
            <div className="material-type-row">
              {MATERIAL_TYPES.map((t) => (
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
              <div className="materials-grid">
                {filtered.map((m) => (
                  <MaterialCard key={m.id} material={m} />
                ))}
              </div>
            ) : (
              <div className="no-results">검색 결과가 없습니다.</div>
            )}
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
