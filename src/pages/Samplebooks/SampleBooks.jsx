import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { sampleBooks } from "../../data/samplebooks.db";
import { BRANDS_BY_CATEGORY } from "../../data/categoryMap";
import { getComputedBrand } from "../../utils/brandUtils";
import { getSampleBookTarget, openCatalogWindow } from "../../utils/samplebookResolver";
import SampleBookViewer from "../../components/samplebook/SampleBookViewer";
import SampleBookCard from "../../components/samplebook/SampleBookCard";
import { sortBrandsByPriority, compareSampleBookPriority, getDisplayBrandName } from "../../constants/brandPriority";
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

  // 카테고리 이동 시 브랜드/재질 필터 초기화
  useEffect(() => {
    setSelectedBrand("all");
    setSelectedMaterialType("all");
  }, [activeTab]);

  // 브랜드 변경 시 재질 필터 초기화
  useEffect(() => {
    setSelectedMaterialType("all");
  }, [selectedBrand]);

  /** ✅ 해당 카테고리에 속한 브랜드 목록 (카테고리별 차등 순서 적용) */
  const brands = useMemo(() => {
    if (activeTab === "recommended") {
      return sortBrandsByPriority(["all", "KCC", "LX", "동신", "동화", "이건", "구정", "유성", "녹수", "현대", "스완"]);
    }
    let categoryBrands = [...(BRANDS_BY_CATEGORY[activeTab] || [])];
    return sortBrandsByPriority(["all", ...categoryBrands], activeTab);
  }, [activeTab]);

  /** ✅ 최종 필터링: 카테고리 + 브랜드 + 재질 + 스마트 다중 토큰 검색 */
  const filtered = useMemo(() => {
    const queryTerm = searchQuery.trim().toLowerCase();
    const queryTokens = queryTerm.split(/\s+/).filter(Boolean);

    // 검색어 매칭 함수 (다중 토큰 및 두께/특수문자 유연 매칭)
    const matchesSearch = (sb) => {
      if (queryTokens.length === 0) return true;
      const sbComputedBrand = getComputedBrand(sb);
      const text = [
        sb.title,
        sb.brand,
        sbComputedBrand,
        sb.category,
        sb.materialType,
        sb.description,
        sb.id,
        sb.catalogProvider
      ].filter(Boolean).join(" ").toLowerCase();

      // 특수문자/괄호 제거 정규화 텍스트 (예: (2.0T) -> 2 0t)
      const textClean = text.replace(/[()\-_.,/]/g, " ");

      return queryTokens.every(token => {
        const tokenClean = token.replace(/[()\-_.,/]/g, " ").trim();
        return text.includes(token) || (tokenClean && textClean.includes(tokenClean));
      });
    };

    return sampleBooks.filter(sb => {
      let sbComputedBrand = getComputedBrand(sb);

      // KCC 러버타일 샘플북 비노출 처리
      if ((sb.brand === 'KCC' || sbComputedBrand === 'KCC' || (sb.title && sb.title.includes('KCC'))) && ((sb.title && sb.title.includes('러버')) || (sb.description && sb.description.includes('러버')) || sb.category === '러버타일')) {
        return false;
      }

      // 1. 검색어 매칭 검사
      const searchOk = matchesSearch(sb);
      if (!searchOk) return false;

      // 2. 카테고리 필터 검사
      let categoryOk = false;
      if (queryTerm) {
        if (activeTab === "recommended") {
          // 추천 탭에서 검색 시 전 카테고리 검색 지원
          categoryOk = true;
        } else {
          // 특정 탭에서 검색 시 해당 탭 내 결과가 있으면 탭 우선, 없으면 전 카테고리 결과 지원
          const hasMatchesInActiveTab = sampleBooks.some(item => 
            item.category === activeTab && matchesSearch(item)
          );
          categoryOk = hasMatchesInActiveTab ? sb.category === activeTab : true;
        }
      } else {
        if (activeTab === "recommended") {
          categoryOk = sb.isRecommended || ["LX", "KCC", "동신", "유성", "이건", "구정", "동화"].includes(sbComputedBrand) || ["LX", "KCC", "동신", "유성", "이건", "구정", "동화"].includes(sb.brand);
        } else {
          categoryOk = sb.category === activeTab;
        }
      }

      // 3. 브랜드 필터 검사
      let brandOk = false;
      if (selectedBrand === "all") {
        brandOk = true;
      } else {
        const brandMatches = (
          sbComputedBrand === selectedBrand ||
          sb.brand === selectedBrand ||
          (selectedBrand === "LX하우시스" && (sb.brand === "LX" || sb.brand === "LX하우시스"))
        );
        if (queryTerm) {
          // 검색어가 있는 경우 선택된 브랜드 내 일치 항목 유무 확인
          const hasMatchesInBrand = sampleBooks.some(item => 
            (getComputedBrand(item) === selectedBrand || item.brand === selectedBrand) && matchesSearch(item)
          );
          brandOk = hasMatchesInBrand ? brandMatches : true;
        } else {
          brandOk = brandMatches;
        }
      }

      // 4. 벽지 재질 필터 검사
      let materialOk = false;
      if (activeTab === "벽지" && !queryTerm) {
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
  }, [activeTab, selectedBrand, selectedMaterialType, searchQuery]);

  /** ✅ 최종 정렬: 카테고리별 우선순위 반영 (데코타일: KCC 트랜디->프로->센스레이 / 장판: LX->KCC->현대) */
  const sortedSampleBooks = useMemo(() => {
    const list = [...filtered];
    const queryTerm = searchQuery.trim().toLowerCase();

    return list.sort((a, b) => {
      if (queryTerm) {
        const titleA = (a.title || "").toLowerCase();
        const titleB = (b.title || "").toLowerCase();
        const brandA = (a.brand || "").toLowerCase();
        const brandB = (b.brand || "").toLowerCase();

        const matchTitleA = titleA.includes(queryTerm);
        const matchTitleB = titleB.includes(queryTerm);
        if (matchTitleA !== matchTitleB) return matchTitleA ? -1 : 1;

        const matchBrandA = brandA.includes(queryTerm);
        const matchBrandB = brandB.includes(queryTerm);
        if (matchBrandA !== matchBrandB) return matchBrandA ? -1 : 1;
      }

      return compareSampleBookPriority(a, b, activeTab);
    });
  }, [filtered, searchQuery, activeTab]);

  /** ✅ 샘플북 클릭 시: 공식 카탈로그 검증 제품은 직접 새 창 열기, 미확인은 알림 모달 */
  const handleBookClick = (book) => {
    const target = getSampleBookTarget(book);
    if (target.isVerified && target.url) {
      openCatalogWindow(target.url);
    } else {
      setSelectedBook(book);
    }
  };

  return (
    <MainLayout className="samplebooks-page">
      <SEO 
        title="샘플북 조회 | 동경바닥재 - 브랜드별 E-카탈로그 및 Sample Book"
        description="KCC, LX, 현대L&C, 동신, 이건, 구정 등 바닥재 대표 제조사의 공식 E-카탈로그 및 샘플북을 고해상도로 편리하게 조회하세요."
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
                  placeholder="샘플북 명칭, 브랜드 (예: 뉴청맥, 보타닉, KCC 센스타일, 신한 벽지) 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="sb-search-input"
                />
                {searchQuery && (
                  <button className="sb-search-clear" onClick={() => setSearchQuery("")} aria-label="검색어 지우기">
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
                  {b === "all" ? "전체 브랜드" : getDisplayBrandName(b, activeTab)}
                </button>
              ))}
            </div>

            {/* ✅ 벽지인 경우 재질 필터 추가 */}
            {activeTab === "벽지" && !searchQuery && (
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
              <span>총 <strong>{sortedSampleBooks.length}</strong>권의 샘플북</span>
              {searchQuery && <span className="sb-search-tag"> 검색어: "{searchQuery}"</span>}
            </div>
          </div>

          {sortedSampleBooks.length > 0 ? (
            <div className="sb-grid">
              {sortedSampleBooks.map(book => (
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

      {/* Viewer Modal (미확인 샘플북 안내 또는 딥링크 조회용) */}
      {selectedBook && (
        <SampleBookViewer book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </MainLayout>
  );
}
