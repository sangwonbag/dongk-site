import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import LazySection from "../../components/common/LazySection";
import SEO from "../../components/seo/SEO";
import { KAKAO_CHAT_URL, OFFICE_PHONE } from "../../constants/contact";
import { supabase } from "../../lib/supabaseClient";
import { preloadRoute, setupIdlePreload } from "../../utils/routePreloader";
import { 
  ArrowRight, 
  ChevronRight, 
  CheckCircle2, 
  Calculator, 
  ShoppingBag, 
  PhoneCall, 
  MessageSquare,
  Sparkles,
  Layers,
  Building,
  ShieldCheck,
  FileText
} from "lucide-react";
import "./Home.css";

const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "동경바닥재 (DK Floor)",
  "alternateName": "DK Floor",
  "url": "https://dkfloor.co.kr",
  "logo": "https://dkfloor.co.kr/dk-apple-touch-icon-transparent.png",
  "image": "https://dkfloor.co.kr/dk-apple-touch-icon-transparent.png",
  "description": "국내 주요 브랜드(KCC, LX, 동신, 재영, 이건 등) 데코타일, 마루, 장판, 벽지 전문 유통. 자재 선택부터 시공 상담까지 한곳에서 진행하는 원스톱 서비스",
  "telephone": "02-487-9775",
  "priceRange": "₩₩",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "KR"
  }
};

export default function Home() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCases() {
      try {
        if (!supabase) {
          if (isMounted) setLoadingCases(false);
          return;
        }
        const { data, error } = await supabase
          .from('construction_cases')
          .select('id, title, category, material_summary, main_image_url')
          .eq('is_published', true)
          .order('sort_order', { ascending: true })
          .limit(3);

        if (!error && data && data.length > 0 && isMounted) {
          setCases(data);
        } else if (isMounted) {
          setCases([]);
        }
      } catch (err) {
        console.warn("Home: Supabase cases fetch notice:", err);
        if (isMounted) setCases([]);
      } finally {
        if (isMounted) setLoadingCases(false);
      }
    }
    loadCases();

    const cleanupIdle = setupIdlePreload();
    return () => {
      isMounted = false;
      if (cleanupIdle) cleanupIdle();
    };
  }, []);

  return (
    <MainLayout>
      <SEO 
        title="동경바닥재 | KCC·LX·동신 프리미엄 바닥재·데코타일·마루·장판 유통 및 원스톱 시공"
        description="동경바닥재 - 국내 주요 브랜드(KCC, LX, 동신, 재영, 이건 등) 데코타일, 마루, 장판, 벽지 전문 유통. 자재 구매부터 견적 상담, 시공 연계까지 한곳에서 진행하세요."
        canonical="https://dkfloor.co.kr/"
        jsonLd={HOME_JSON_LD}
      />

      <div className="onestop-home-page">

        {/* ================= 1. HERO SECTION ================= */}
        <section className="onestop-hero-section">
          <div className="container">
            <div className="hero-grid-layout">
              {/* Left Column: Headline & Action Buttons */}
              <div className="hero-text-content">
                <span className="hero-top-tag">
                  바닥재 · 벽지 판매 및 시공
                </span>
                
                <h1 className="hero-main-title">
                  자재 선택부터 시공까지,<br />
                  <span className="highlight-brand">동경바닥재 한곳에서.</span>
                </h1>
                
                <p className="hero-subtext-desc">
                  우리 공간에 맞는 바닥재와 벽지,<br />
                  자재 구매부터 견적 상담, 시공까지 함께하세요.<br />
                  자재만 필요할 때도, 시공까지 필요할 때도 편하게 문의하세요.
                </p>

                <div className="hero-cta-buttons">
                  <Link 
                    to="/materials" 
                    className="btn-hero-primary"
                    onMouseEnter={() => preloadRoute('/materials')} 
                    onTouchStart={() => preloadRoute('/materials')}
                  >
                    <ShoppingBag size={18} />
                    자재 둘러보기
                  </Link>

                  <Link 
                    to="/estimate/request" 
                    className="btn-hero-accent"
                    onMouseEnter={() => preloadRoute('/estimate')} 
                    onTouchStart={() => preloadRoute('/estimate')}
                  >
                    <Calculator size={18} />
                    시공 견적 알아보기
                  </Link>
                </div>

                <div className="hero-secondary-link-wrapper">
                  <Link 
                    to="/cases" 
                    className="hero-secondary-link"
                    onMouseEnter={() => preloadRoute('/cases')} 
                    onTouchStart={() => preloadRoute('/cases')}
                  >
                    시공사례 보기 <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Right Column: Real Finished Construction Image Showcase */}
              <div className="hero-image-showcase">
                <div className="hero-main-img-box">
                  <img 
                    src="/images/home-interior/korea-apt-living-01.webp" 
                    alt="바닥재 및 벽지 시공 공간 연출 예시" 
                    width="600" 
                    height="420"
                    fetchpriority="high"
                    decoding="async"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/living_room.png";
                    }}
                  />
                  <span className="hero-concept-image-label">공간 연출 이미지</span>

                  {/* Concise Status Labels over Image */}
                  <div className="hero-img-badge badge-top-left">
                    <span className="badge-dot"></span> 자재 판매
                  </div>
                  <div className="hero-img-badge badge-mid-right">
                    <span className="badge-dot accent"></span> 견적 상담
                  </div>
                  <div className="hero-img-badge badge-bot-left">
                    <span className="badge-dot dark"></span> 시공 연계
                  </div>

                  {/* Sub Material Texture Image Inset */}
                  <div className="hero-inset-texture">
                    <img 
                      src="/images/categories/category-wood-flooring.webp" 
                      alt="자재 상세 질감" 
                      width="100" 
                      height="100"
                      decoding="async"
                    />
                    <span className="inset-caption">자재 샘플</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 2. DARK CHARCOAL SERVICE BANNER ================= */}
        <section className="onestop-dark-service-bar">
          <div className="container">
            <div className="dark-bar-grid">
              <div className="dark-bar-item">
                <div className="item-step-badge">01</div>
                <div className="item-text-wrap">
                  <h4>자재 선택</h4>
                  <p>공간과 용도에 맞게</p>
                </div>
              </div>

              <div className="dark-bar-item">
                <div className="item-step-badge">02</div>
                <div className="item-text-wrap">
                  <h4>자재 구매</h4>
                  <p>필요한 자재만 편리하게</p>
                </div>
              </div>

              <div className="dark-bar-item">
                <div className="item-step-badge">03</div>
                <div className="item-text-wrap">
                  <h4>견적 상담</h4>
                  <p>면적과 현장 조건에 맞게</p>
                </div>
              </div>

              <div className="dark-bar-item">
                <div className="item-step-badge">04</div>
                <div className="item-text-wrap">
                  <h4>시공 연계</h4>
                  <p>일정과 시공 범위 상담</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 3. CUSTOMER PURPOSE SERVICE AREA ================= */}
        <LazySection minHeight="380px">
          <section className="onestop-purpose-section">
            <div className="container">
              <div className="section-header-block center">
                <h2>자재만 필요해도, 시공까지 필요해도</h2>
                <p>고객님의 상황에 맞춰 가장 편리한 서비스 경로를 제공합니다</p>
              </div>

              <div className="purpose-cards-grid">
                {/* Card A: Material Purchase Only */}
                <div className="purpose-card card-material-only">
                  <div className="card-badge">자재만 구매할 때</div>
                  <h3>자재 구매</h3>
                  <p className="card-desc">
                    필요한 바닥재와 벽지, 부자재를 찾아보세요.<br />
                    제품과 규격을 확인하고 구매할 수 있습니다.
                  </p>
                  <ul className="card-feature-list">
                    <li><CheckCircle2 size={16} /> 데코타일 / 장판 / 마루 / 벽지 / 카페트타일</li>
                    <li><CheckCircle2 size={16} /> 박스단위 및 평수별 자재 정품 판매</li>
                  </ul>
                  <Link 
                    to="/materials" 
                    className="purpose-btn btn-outline"
                    onMouseEnter={() => preloadRoute('/materials')} 
                    onTouchStart={() => preloadRoute('/materials')}
                  >
                    자재 찾기 <ChevronRight size={16} />
                  </Link>
                </div>

                {/* Card B: Material + Installation Consult */}
                <div className="purpose-card card-full-service highlighted">
                  <div className="card-badge accent">자재 + 시공 상담</div>
                  <h3>자재 + 시공 상담</h3>
                  <p className="card-desc">
                    어떤 자재를 골라야 할지 고민되시나요?<br />
                    공간과 면적, 현장 조건에 맞춰 자재와 시공을 함께 상담하세요.
                  </p>
                  <ul className="card-feature-list">
                    <li><CheckCircle2 size={16} /> 면적 기반 시공 예상견적 산출</li>
                    <li><CheckCircle2 size={16} /> 전문 시공팀 일정 및 현장조건 맞춤 상담</li>
                  </ul>
                  <Link 
                    to="/estimate/request" 
                    className="purpose-btn btn-gold"
                    onMouseEnter={() => preloadRoute('/estimate')} 
                    onTouchStart={() => preloadRoute('/estimate')}
                  >
                    견적 알아보기 <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </LazySection>

        {/* ================= 4. MATERIALS CATEGORY AREA ================= */}
        <LazySection minHeight="420px">
          <section className="onestop-category-section">
            <div className="container">
              <div className="section-header-block">
                <h2>공간에 필요한 자재를 한눈에</h2>
                <p>주요 취급 품목 카테고리를 선택하시면 바로 자재 목록으로 이동합니다</p>
              </div>

              <div className="category-tiles-grid">
                <Link 
                  to="/materials?category=데코타일" 
                  className="cat-tile-card"
                  onMouseEnter={() => preloadRoute('/materials')}
                >
                  <div className="cat-thumb-box">
                    <img src="/images/categories/category-deco-tile.webp" alt="데코타일" loading="lazy" decoding="async" width="300" height="200" />
                  </div>
                  <div className="cat-title-bar">
                    <h4>데코타일</h4>
                    <span>우드 / 사각 / 600각</span>
                  </div>
                </Link>

                <Link 
                  to="/materials?category=장판" 
                  className="cat-tile-card"
                  onMouseEnter={() => preloadRoute('/materials')}
                >
                  <div className="cat-thumb-box">
                    <img src="/images/categories/category-cushion-floor.webp" alt="장판" loading="lazy" decoding="async" width="300" height="200" />
                  </div>
                  <div className="cat-title-bar">
                    <h4>장판</h4>
                    <span>1.8T ~ 5.0T 모노륨</span>
                  </div>
                </Link>

                <Link 
                  to="/materials?category=마루" 
                  className="cat-tile-card"
                  onMouseEnter={() => preloadRoute('/materials')}
                >
                  <div className="cat-thumb-box">
                    <img src="/images/categories/category-wood-flooring.webp" alt="마루" loading="lazy" decoding="async" width="300" height="200" />
                  </div>
                  <div className="cat-title-bar">
                    <h4>마루</h4>
                    <span>강마루 / 강화마루 / 스퀘어</span>
                  </div>
                </Link>

                <Link 
                  to="/materials?category=벽지" 
                  className="cat-tile-card"
                  onMouseEnter={() => preloadRoute('/materials')}
                >
                  <div className="cat-thumb-box">
                    <img src="/images/categories/category-wallpaper.webp" alt="벽지" loading="lazy" decoding="async" width="300" height="200" />
                  </div>
                  <div className="cat-title-bar">
                    <h4>벽지</h4>
                    <span>실크 / 합지 / 방염</span>
                  </div>
                </Link>

                <Link 
                  to="/materials?category=카페트타일" 
                  className="cat-tile-card"
                  onMouseEnter={() => preloadRoute('/materials')}
                >
                  <div className="cat-thumb-box">
                    <img src="/images/categories/category-carpet-tile.webp" alt="카페트타일" loading="lazy" decoding="async" width="300" height="200" />
                  </div>
                  <div className="cat-title-bar">
                    <h4>카페트타일</h4>
                    <span>사무실 / 상업용 타일</span>
                  </div>
                </Link>

                <Link 
                  to="/materials?category=부자재" 
                  className="cat-tile-card"
                  onMouseEnter={() => preloadRoute('/materials')}
                >
                  <div className="cat-thumb-box">
                    <img src="/images/categories/category-accessories.webp" alt="부자재" loading="lazy" decoding="async" width="300" height="200" />
                  </div>
                  <div className="cat-title-bar">
                    <h4>부자재</h4>
                    <span>접착제 / 용착제 / 걸레받이</span>
                  </div>
                </Link>
              </div>
            </div>
          </section>
        </LazySection>

        {/* ================= 5. ONE-STOP PROCESS AREA ================= */}
        <LazySection minHeight="400px">
          <section className="onestop-process-section">
            <div className="container">
              <div className="section-header-block center">
                <h2>자재 선택부터 시공까지, 이렇게 진행돼요</h2>
                <p>투명하고 명확한 4단계 원스톱 워크플로우</p>
              </div>

              <div className="process-flow-grid">
                <div className="process-step-card">
                  <div className="step-number-pill">①</div>
                  <h4>자재 선택</h4>
                  <p>원하는 제품을 둘러보거나 공간에 맞춘 추천을 받아보세요.</p>
                </div>

                <div className="process-step-card">
                  <div className="step-number-pill">②</div>
                  <h4>견적 상담</h4>
                  <p>면적과 현장 조건을 바탕으로 예상 비용을 확인해요.</p>
                </div>

                <div className="process-step-card">
                  <div className="step-number-pill">③</div>
                  <h4>일정 협의</h4>
                  <p>자재 수령·배송과 시공 일정을 맞춤 상담해요.</p>
                </div>

                <div className="process-step-card">
                  <div className="step-number-pill">④</div>
                  <h4>시공 진행</h4>
                  <p>협의한 범위와 일정에 따라 전문 시공을 진행해요.</p>
                </div>
              </div>

              {/* Informational Notices */}
              <div className="process-notices-box">
                <p className="notice-line">
                  <CheckCircle2 size={16} className="notice-icon" /> 
                  <strong>자재만 구매하시는 경우:</strong> 시공 상담 없이 필요한 자재만 바로 구매하실 수 있습니다.
                </p>
                <p className="notice-line sub">
                  <FileText size={16} className="notice-icon" /> 
                  <strong>견적 확인 안내:</strong> 자동견적 시스템은 입력하신 면적 기반의 예상 견적입니다. 바탕면 샌딩, 보수, 짐 이동 등 현장 조건에 따라 상담 시 최종 비용이 확정됩니다.
                </p>
              </div>
            </div>
          </section>
        </LazySection>

        {/* ================= 6. REAL CONSTRUCTION CASES ================= */}
        <LazySection minHeight="350px">
          <section className="onestop-cases-section">
            <div className="container">
              <div className="section-header-block row-header">
                <div>
                  <h2>자재가 공간으로 완성된 모습</h2>
                  <p>동경바닥재 자재로 완성된 시공 포트폴리오를 확인해보세요</p>
                </div>
                <Link 
                  to="/cases" 
                  className="link-cases-more"
                  onMouseEnter={() => preloadRoute('/cases')}
                >
                  관련 시공사례 목록 보기 <ArrowRight size={16} />
                </Link>
              </div>

              {loadingCases ? (
                <div className="cases-empty-box">
                  <p>시공사례를 불러오는 중입니다...</p>
                </div>
              ) : cases.length === 0 ? (
                <div className="cases-empty-box">
                  <Building size={32} className="empty-icon" />
                  <h4>현재 등록된 시공사례가 없습니다</h4>
                  <p>동경바닥재 전문 시공팀의 최신 시공 현장이 곧 업데이트될 예정입니다.</p>
                  <div className="empty-actions">
                    <Link to="/estimate/request" className="btn-empty-action">
                      시공 견적 문의하기 <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="cases-cards-grid">
                  {cases.map((item) => (
                    <div 
                      key={item.id} 
                      className="case-item-card"
                      onClick={() => navigate(`/cases?category=${encodeURIComponent(item.category || '전체')}`)}
                    >
                      <div className="case-card-img-wrap">
                        <img 
                          src={item.main_image_url || "/images/home-interior/korea-apt-living-01.webp"} 
                          alt={item.title} 
                          loading="lazy"
                          decoding="async"
                          width="400"
                          height="260"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/no-image.svg";
                          }}
                        />
                        {item.category && <span className="case-card-tag">{item.category}</span>}
                      </div>
                      <div className="case-card-info">
                        <h4>{item.title}</h4>
                        {item.material_summary && (
                          <p className="material-summary-text">{item.material_summary}</p>
                        )}
                        <span className="case-card-link-text">관련 시공사례 보기 →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </LazySection>

        {/* ================= 7. BOTTOM CONSULTATION CTA ================= */}
        <section className="onestop-consultation-section">
          <div className="container">
            <div className="consultation-banner-box">
              <div className="consult-text-wrap">
                <h2>어떤 자재가 맞을지 고민되시나요?</h2>
                <p>
                  자재 선택부터 시공 견적까지,<br />
                  필요한 내용을 동경바닥재에 편하게 문의하세요.
                </p>
              </div>

              <div className="consult-actions-wrap">
                <Link 
                  to="/estimate/request" 
                  className="btn-consult-primary"
                  onMouseEnter={() => preloadRoute('/estimate')}
                >
                  <Calculator size={18} />
                  견적 알아보기
                </Link>

                <a 
                  href={KAKAO_CHAT_URL} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn-consult-kakao"
                >
                  <MessageSquare size={18} />
                  카카오 상담
                </a>
              </div>

              <a href={`tel:${OFFICE_PHONE.replace(/-/g, '')}`} className="consult-phone-info font-phone-link">
                <span>고객센터 문의전화</span>
                <strong>{OFFICE_PHONE}</strong>
              </a>
            </div>
          </div>
        </section>

      </div>
    </MainLayout>
  );
}
