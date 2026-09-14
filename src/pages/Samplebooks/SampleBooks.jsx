import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { sampleBooks } from "../../data/samplebooks.db";
import { BRANDS_BY_CATEGORY } from "../../data/categoryMap";
import { getComputedBrand } from "../../utils/brandUtils";
import SampleBookViewer from "../../components/samplebook/SampleBookViewer";
import SampleBookCard from "../../components/samplebook/SampleBookCard";
import { EmptyState } from "../../components/ui";
import SEO from "../../components/seo/SEO";
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
  { id: "러버타일", label: "러버타일" },
];

export default function SampleBooks() {
  const query = useQuery();

  const [activeTab, setActiveTab] = useState("recommended");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedMaterialType, setSelectedMaterialType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    // Check for deep-linked book
    const bookId = query.get("bookId");
    if (bookId) {
      const book = sampleBooks.find(b => b.id === bookId);
      if (book) setSelectedBook(book);
    }
  }, [query]);

  // 카테고리 이동 시 브랜드/검색 필터 초기화
  useEffect(() => {
    setSelectedBrand("all");
    setSelectedMaterialType("all");
  }, [activeTab]);

  // 브랜드 변경 시 재질 필터 초기화
  useEffect(() => {
    setSelectedMaterialType("all");
  }, [selectedBrand]);

  /** ✅ 해당 카테고리에 속한 브랜드 목록 (자재 페이지와 동일하게) */
  const brands = useMemo(() => {
    if (activeTab === "recommended") {
      return ["all", "LX", "KCC", "동신", "동화", "이건", "구정", "유성", "녹수", "현대", "스완"];
    }
    let categoryBrands = [...(BRANDS_BY_CATEGORY[activeTab] || [])];
    return ["all", ...categoryBrands];
  }, [activeTab]);

  /** ✅ 최종 필터링: 카테고리 + 브랜드 + 재질 + 검색어 */
  const filtered = useMemo(() => {
    const queryTerm = searchQuery.trim().toLowerCase();

    return sampleBooks.filter(sb => {
      let categoryOk = false;
      let sbComputedBrand = getComputedBrand(sb);

      if (activeTab === "recommended") {
        categoryOk = sb.isRecommended || ["LX", "KCC", "동신", "유성", "이건", "구정", "동화"].includes(sbComputedBrand) || ["LX", "KCC", "동신", "유성", "이건", "구정", "동화"].includes(sb.brand);
      } else {
        categoryOk = sb.category === activeTab;
      }

      let brandOk = false;
      if (selectedBrand === "all") {
        brandOk = true;
      } else {
        brandOk =
          sbComputedBrand === selectedBrand ||
          sb.brand === selectedBrand ||
          (selectedBrand === "LX하우시스" && (sb.brand === "LX" || sb.brand === "LX하우시스"));
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

      let searchOk = true;
      if (queryTerm) {
        const titleMatch = (sb.title || "").toLowerCase().includes(queryTerm);
        const brandMatch = (sb.brand || "").toLowerCase().includes(queryTerm) || sbComputedBrand.toLowerCase().includes(queryTerm);
        const catMatch = (sb.category || "").toLowerCase().includes(queryTerm);
        const descMatch = (sb.description || "").toLowerCase().includes(queryTerm);
        searchOk = titleMatch || brandMatch || catMatch || descMatch;
      }

      return categoryOk && brandOk && materialOk && searchOk;
    });
  }, [activeTab, selectedBrand, selectedMaterialType, searchQuery]);

  const handleBookClick = (book) => {
    if (book.openInNewTab) {
      window.open(book.pdf || "#", "_blank", "noopener,noreferrer");
    } else {
      setSelectedBook(book);
    }
  };

  return (
    <MainLayout className="samplebooks-page">
      <SEO 
        title="샘플북 조회 | 동경바닥재 - 브랜드별 E-카탈로그 및 Sample Book"
        description="KCC, LX, 동신, 재영, 이건, 구정 등 바닥재 대표 제조사의 E-카탈로그 및 샘플북을 고해상도로 편리하게 조회하세요."
        canonical="https://dkfloor.co.kr/samplebooks"
      />
      <div className="samplebooks-container">
        <main className="sb-content full">
          <div className="samplebooks-filter-section">
            {/* ✅ 헤더 & 검색창 */}
            <div className="sb-header-search-bar">
              <div className="sb-search-box">
                <span className="sb-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="샘플북 명칭, 브랜드 (예: 뉴청맥, 디아망, 엑스컴포트, 마뷸러스) 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="sb-search-input"
                />
                {searchQuery && (
                  <button className="sb-search-clear" onClick={() => setSearchQuery("")}>
                    ✕
                  </button>
                )}
              </div>
            </div>

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
                {(selectedBrand === "all" ? ["all"] : selectedBrand === "개나리" ? ["all", "프리미엄", "합지(소폭)", "합지(장폭)", "실크", "방염"] : selectedBrand === "LX" ? ["all", "디아망", "합지", "실크", "방염"] : selectedBrand === "서울" ? ["all", "프리미엄", "합지", "실크", "방염"] : ["all", "합지", "실크", "방염"]).map((t) => (
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
          </div>

          <div className="results-header samplebooks-count">
            <div className="results-info">
              <span>총 <strong>{filtered.length}</strong>권의 샘플북</span>
              {searchQuery && <span className="sb-search-tag"> 검색어: "{searchQuery}"</span>}
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
            <EmptyState 
              title={searchQuery ? `'${searchQuery}' 검색 결과가 없습니다` : "샘플북이 준비 중입니다"} 
              description="선택하신 조건에 해당하는 브랜드 샘플북이 아직 준비되지 않았거나 검색어와 일치하는 항목이 없습니다." 
            />
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
