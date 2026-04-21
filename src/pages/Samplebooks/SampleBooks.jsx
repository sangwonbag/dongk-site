import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { sampleBooks } from "../../data/samplebooks.db";
import { CATEGORY_BRAND_MAP } from "../../data/categoryMap";
import { getComputedBrand } from "../../utils/brandUtils";
import SampleBookViewer from "../../components/samplebook/SampleBookViewer";
import SampleBookCard from "../../components/samplebook/SampleBookCard";
import "./SampleBooks.css";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

/** ✅ 상단 탭: 카테고리 (자재 페이지와 동일하게 구성) */
const CATEGORY_TABS = [
  { id: "recommended", label: "추천 자재" },
  { id: "데코타일", label: "데코타일" },
  { id: "장판", label: "장판" },
  { id: "마루", label: "마루" },
  { id: "벽지", label: "벽지" },
  { id: "카페트타일", label: "카페트타일" },
];

export default function SampleBooks() {
  const query = useQuery();

  const [activeTab, setActiveTab] = useState("recommended");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedMaterialType, setSelectedMaterialType] = useState("all");
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    // Check for deep-linked book
    const bookId = query.get("bookId");
    if (bookId) {
      const book = sampleBooks.find(b => b.id === bookId);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (book) setSelectedBook(book);
    }
  }, [query]);

  // 카테고리 이동 시 브랜드 필터 초기화
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedBrand("all");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedMaterialType("all");
  }, [activeTab]);

  // 브랜드 변경 시 재질 필터 초기화
  useEffect(() => {
    setSelectedMaterialType("all");
  }, [selectedBrand]);

  /** ✅ 해당 카테고리에 속한 브랜드 목록 (자재 페이지와 동일하게) */
  const brands = useMemo(() => {
    if (activeTab === "recommended") {
      // 추천 탭인 경우 중복 제거된 전체 브랜드 목록 표시
      const uniqueBrands = [...new Set(Object.values(CATEGORY_BRAND_MAP).flat())];
      return ["all", ...uniqueBrands];
    }
    // 자재 데이터의 브랜드 목록 사용
    let categoryBrands = [...(CATEGORY_BRAND_MAP[activeTab] || [])];

    return ["all", ...categoryBrands];
  }, [activeTab]);

  /** ✅ 최종 필터링: 카테고리 + 브랜드 */
  const filtered = useMemo(() => {
    return sampleBooks.filter(sb => {
      let categoryOk = false;
      if (activeTab === "recommended") {
        categoryOk = sb.isRecommended === true;
      } else {
        categoryOk = sb.category === activeTab;
      }

      let sbComputedBrand = getComputedBrand(sb);
      let brandOk = false;

      if (selectedBrand === "all") {
        brandOk = true;
      } else {
        brandOk = sbComputedBrand === selectedBrand;
      }

      let materialOk = false;
      if (activeTab === "벽지") {
        if (selectedMaterialType === "all") {
          materialOk = true;
        } else {
          materialOk = sb.materialType === selectedMaterialType;
        }
      } else {
        materialOk = true;
      }

      return categoryOk && brandOk && materialOk;
    });
  }, [activeTab, selectedBrand, selectedMaterialType]);

  const handleBookClick = (book) => {
    if (book.openInNewTab) {
      window.open(book.pdf || "#", "_blank", "noopener,noreferrer");
    } else {
      setSelectedBook(book);
    }
  };

  return (
    <MainLayout>
      <div className="samplebooks-container">
        <main className="sb-content full">
          {/* ✅ 상단 카테고리 탭 */}
          <div className="samplebooks-tabs">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                className={`sb-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ✅ 브랜드 필터 (칩 형태) */}
          <div className="brand-filter-row">
            {brands.map((b) => (
              <button
                key={b}
                className={`brand-chip ${selectedBrand === b ? "active" : ""}`}
                onClick={() => setSelectedBrand(b)}
              >
                {b === "all" ? "전체 브랜드" : b}
              </button>
            ))}
          </div>

          {/* ✅ 벽지인 경우 재질 필터 추가 */}
          {activeTab === "벽지" && (
            <div className="brand-filter-row material-type-row">
              {(selectedBrand === "all" ? ["all"] : selectedBrand === "개나리" ? ["all", "프리미엄", "합지", "실크", "방염"] : ["all", "합지", "실크", "방염"]).map((t) => (
                <button
                  key={t}
                  className={`brand-chip material-chip ${selectedMaterialType === t ? "active" : ""}`}
                  onClick={() => setSelectedMaterialType(t)}
                >
                  {t === "all" ? "전체 재질" : t}
                </button>
              ))}
            </div>
          )}

          <div className="results-header">
            <div className="results-info">
              <span>총 <strong>{filtered.length}</strong>권</span>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="sb-grid">
              {filtered.map(book => (
                <SampleBookCard
                  key={book.id}
                  book={book}
                  onClick={handleBookClick}
                />
              ))}
            </div>
          ) : (
            <div className="no-results">상품 준비중입니다.</div>
          )}
        </main>
      </div>

      {/* Viewer Modal */}
      {selectedBook && (
        <SampleBookViewer book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </MainLayout>
  );
}
