import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import LazySection from "../../components/common/LazySection";
import SEO from "../../components/seo/SEO";
import { KAKAO_CHAT_URL, OFFICE_PHONE } from "../../constants/contact";
import { preloadRoute, setupIdlePreload } from "../../utils/routePreloader";
import { 
  ArrowRight, 
  ChevronRight, 
  Play, 
  Pause, 
  ShoppingBag, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  Briefcase, 
  Dumbbell, 
  Home as HomeIcon,
  PhoneCall,
  MessageSquare
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
  "description": "국내 주요 브랜드(KCC, LX, 동신, 재영, 이건 등) 데코타일, 마루, 장판, 벽지 전문 유통. 자재 선택부터 시공 상담까지 한곳에서 진행하는 프리미엄 원스톱 바닥재 서비스",
  "telephone": "02-487-9775",
  "priceRange": "₩₩",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "KR"
  }
};

// KCC Flagship Lineups (Ordered: 센스타일 트랜디 -> 센스타일 프로 -> 센스레이)
const KCC_COLLECTION = [
  {
    id: "trendy",
    code: "TS5502P",
    brand: "KCC",
    lineup: "KCC 센스타일 트랜디",
    subLine: "450각 · 600각 · 우드",
    spec: "457.2 × 457.2mm (450각) · 3.0T",
    packaging: "16매 / 3.34㎡(1BOX)",
    badge: "동경바닥재 PICK",
    description: "감각적인 직물·스톤·우드 질감의 주거 및 상업 공간 베스트셀러 데코타일",
    image: "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5502P.webp",
    detailUrl: "/materials/TS5502P",
    browseUrl: "/materials?category=데코타일&brand=KCC&line=센스타일 트랜디"
  },
  {
    id: "pro",
    code: "30141M",
    brand: "KCC",
    lineup: "KCC 센스타일 프로",
    subLine: "600각 · 대형 타일",
    spec: "600 × 600mm (600각) · 3.0T",
    packaging: "9매 / 3.24㎡(1BOX)",
    badge: "인기 데코타일",
    description: "특수 UV 코팅과 스톤·마블·콘크리트 질감의 고강도 프리미엄 상업용 LVT 바닥재",
    image: "/images/Thumbnail_Image/materials/데코타일/KCC/KCC_pro/30141M.png",
    detailUrl: "/materials/30141M",
    browseUrl: "/materials?category=데코타일&brand=KCC&line=센스타일 프로"
  },
  {
    id: "senselay",
    code: "B0123J",
    brand: "KCC",
    lineup: "KCC 센스레이",
    subLine: "5.0T 고두께 프리미엄",
    spec: "457.2 × 914.4mm · 5.0T (고두께)",
    packaging: "지정 접착제 (센스풀) 시공",
    badge: "추천",
    description: "5mm 고두께 설계로 뛰어난 치수 안정성과 내마모성을 제공하는 프리미엄 LVT",
    image: "/images/Thumbnail_Image/materials/데코타일/KCC/센스레이/KCC센스레이 450각/B0123J.jpg",
    detailUrl: "/materials/B0123J",
    browseUrl: "/materials?category=데코타일&brand=KCC&line=센스레이(내수)"
  }
];

// LX Flagship Sheet Flooring Lineups (Ordered: 뉴청맥 1.8T -> 지아자연애 2.2T -> 엑스컴포트 5.0T)
const LX_JANGPAN_COLLECTION = [
  {
    id: "newcheongmaek",
    code: "CM21882",
    brand: "LX하우시스",
    lineup: "LX하우시스 뉴청맥",
    subLine: "1.8T · 베스트셀러 륨 장판",
    spec: "1.8mm(T) × 1,830mm · 1.8T",
    packaging: "35m / Roll",
    badge: "동경바닥재 PICK",
    description: "합리적인 가격과 검증된 품질로 대중적인 신뢰를 받는 대표 베스트셀러 1.8T 주거용 륨 장판",
    image: "/images/Thumbnail_Image/materials/장판/LX/LX하우시스_뉴청맥_1.8T/CM21882.jpg",
    detailUrl: "/materials/CM21882",
    browseUrl: "/materials?category=장판&brand=LX하우시스&line=뉴청맥"
  },
  {
    id: "jiazayeonae",
    code: "ZJ43601-22",
    brand: "LX하우시스",
    lineup: "LX하우시스 지아자연애",
    subLine: "2.2T · 친환경 프리미엄",
    spec: "2.2mm(T) × 1,830mm · 2.2T",
    packaging: "30m / Roll",
    badge: "추천",
    description: "옥수수 유래 식물성 지아(Zea) 원료 층 적용, 친환경성과 풍부한 쿠션감을 갖춘 2.2T 프리미엄 장판",
    image: "/images/Thumbnail_Image/materials/장판/LX/LX하우시스_지아자연애_2.2T/ZJ43601-22.jpg",
    detailUrl: "/materials/ZJ43601-22",
    browseUrl: "/materials?category=장판&brand=LX하우시스&line=지아자연애"
  },
  {
    id: "xcomfort",
    code: "XCF3441",
    brand: "LX하우시스",
    lineup: "LX하우시스 엑스컴포트",
    subLine: "5.0T · 최고급 고탄성 쿠션",
    spec: "5.0mm(T) × 1,830mm · 5.0T",
    packaging: "20m / Roll",
    badge: "인기 장판",
    description: "5.0T 고탄성 2중 쿠션층으로 탁월한 충격 흡수와 층간소음 저감 효과를 제공하는 하이엔드 장판",
    image: "/images/Thumbnail_Image/materials/장판/LX/LX하우시스_엑스컴포트_5.0T/XCF3441.jpg",
    detailUrl: "/materials/XCF3441",
    browseUrl: "/materials?category=장판&brand=LX하우시스&line=엑스컴포트"
  }
];

// Real Construction Project Showcase
const REAL_PROJECTS = [
  {
    id: "store",
    space: "상업공간",
    icon: Building2,
    title: "성수동 복합 문화 쇼룸 & 매장",
    material: "KCC 센스타일 트랜디 데코타일",
    desc: "모던한 스톤 질감과 고내구성 바닥재로 완성한 트렌디한 상업 공간",
    image: "/images/home-interior/korea-store-01.webp",
    linkUrl: "/cases?category=상업공간"
  },
  {
    id: "office",
    space: "사무실",
    icon: Briefcase,
    title: "테헤란로 IT 비즈니스 오피스",
    material: "프리미엄 카페트타일 & 데코타일",
    desc: "흡음성과 정온함을 극대화하고 업무 효율을 높이는 스마트 오피스 바닥 시공",
    image: "/images/home-interior/korea-office-01.webp",
    linkUrl: "/cases?category=사무공간"
  },
  {
    id: "gym",
    space: "헬스장 및 GX룸",
    icon: Dumbbell,
    title: "마포구 프리미엄 피트니스 센터",
    material: "고충격 흡수 러버타일 & LVT",
    desc: "웨이트 트레이닝 존 충격 흡수와 GX 룸 미끄럼 방지를 고려한 맞춤 시공",
    image: "/images/home-interior/korea-hallway-01.webp",
    linkUrl: "/cases?category=상업공간"
  },
  {
    id: "residential",
    space: "주거공간",
    icon: HomeIcon,
    title: "마포구 아파트 거실 & 침실",
    material: "친환경 프리미엄 모노륨 장판",
    desc: "보행감과 층간소음 완화, 따뜻한 자연 우드 패턴을 살린 감성 주거 공간",
    image: "/images/home-interior/korea-apt-living-01.webp",
    linkUrl: "/cases?category=주거공간"
  }
];

export default function Home() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const userPausedRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [recommendedCategory, setRecommendedCategory] = useState("decotile");

  // Setup idle preload for seamless route switching
  useEffect(() => {
    const cleanupIdle = setupIdlePreload();
    return () => {
      if (cleanupIdle) cleanupIdle();
    };
  }, []);

  // Video Autoplay and Viewport Intersection Observer
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Browser policy: muted autoplay
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Video autoplay prevented by browser policy:", err);
          setIsPlaying(false);
        });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!userPausedRef.current && video.paused) {
              video.play().catch(() => {});
              setIsPlaying(true);
            }
          } else {
            if (!video.paused) {
              video.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // Scroll Motion Transformation
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY || 0;
          // Progress from 0 to 1 over first 450px of scroll
          const progress = Math.min(1, Math.max(0, y / 450));
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Video Play / Pause Toggle
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      userPausedRef.current = false;
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      userPausedRef.current = true;
      video.pause();
      setIsPlaying(false);
    }
  };

  // Dynamic Scroll Styles for Hero Video Frame and Overlay Text
  const heroTextOpacity = Math.max(0, 1 - scrollProgress * 1.3);
  const heroTextTranslateY = -scrollProgress * 40;
  const heroVideoScale = Math.max(0.94, 1 - scrollProgress * 0.06);
  const heroVideoRadius = Math.min(28, scrollProgress * 28);

  return (
    <MainLayout>
      <SEO 
        title="동경바닥재 | KCC 프리미엄 바닥재 쇼룸 · 데코타일·마루·장판 유통 및 시공"
        description="동경바닥재 - KCC 주력 센스타일 트랜디, 센스타일 프로, 센스레이 공식 공급. 자재 구매부터 견적 상담, 전문 시공 연계까지 한곳에서 진행하세요."
        canonical="https://dkfloor.co.kr/"
        jsonLd={HOME_JSON_LD}
      />

      <div className="premium-showroom-home">

        {/* ================= 1. PREMIUM FULLSCREEN VIDEO HERO ================= */}
        <section className="showroom-hero-section">
          {/* Transforming Video Stage Container */}
          <div 
            className="hero-video-stage"
            style={{
              transform: `scale(${heroVideoScale})`,
              borderRadius: `${heroVideoRadius}px`,
              boxShadow: scrollProgress > 0.08 ? `0 24px 60px rgba(0, 0, 0, ${scrollProgress * 0.4})` : 'none'
            }}
          >
            {/* HTML5 Video Element */}
            {!videoError ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="home-hero-video"
                onError={() => setVideoError(true)}
              >
                <source src="/videos/home-hero.mp4" type="video/mp4" />
              </video>
            ) : (
              <div className="hero-video-fallback">
                <img 
                  src="/images/home-interior/korea-apt-living-01.webp" 
                  alt="동경바닥재 프리미엄 인테리어 쇼룸" 
                  className="fallback-image"
                />
              </div>
            )}

            {/* Cinematic Gradient Tint Overlay */}
            <div className="hero-cinematic-overlay" />

            {/* Video Play / Pause Toggle Button */}
            {!videoError && (
              <button 
                type="button"
                className="hero-video-toggle-btn"
                onClick={togglePlay}
                aria-label={isPlaying ? "영상 일시정지" : "영상 재생"}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                <span>{isPlaying ? "PAUSE" : "PLAY"}</span>
              </button>
            )}

            {/* Central Brand Headline & Call to Action (Fades on Scroll) */}
            <div 
              className="hero-content-wrap"
              style={{
                opacity: heroTextOpacity,
                transform: `translate3d(0, ${heroTextTranslateY}px, 0)`,
                pointerEvents: heroTextOpacity < 0.15 ? 'none' : 'auto'
              }}
            >
              <div className="container hero-inner-container">
                {/* 0.2s: Brand Fade In */}
                <div className="hero-brand-tag">
                  <span className="brand-dot" />
                  <span>DONGKYUNG FLOORING</span>
                </div>

                {/* 0.6s: Main Title Slide Up */}
                <h1 className="hero-main-title">
                  공간의 가치를 완성하는 바닥재
                </h1>

                {/* 1.1s: Subtitle Appear */}
                <p className="hero-sub-description">
                  좋은 공간의 시작, 자재 선택부터 시공까지.
                </p>

                {/* 1.5s: Action Buttons Appear */}
                <div className="hero-cta-group">
                  <Link 
                    to="/materials" 
                    className="btn-hero-primary"
                    onMouseEnter={() => preloadRoute('/materials')}
                    onTouchStart={() => preloadRoute('/materials')}
                  >
                    <ShoppingBag size={18} />
                    <span>자재 찾기 →</span>
                  </Link>

                  <Link 
                    to="/estimate/request" 
                    className="btn-hero-glass"
                    onMouseEnter={() => preloadRoute('/estimate')}
                    onTouchStart={() => preloadRoute('/estimate')}
                  >
                    <FileText size={18} />
                    <span>견적문의 →</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Subtle Scroll Cue */}
            <div 
              className="hero-scroll-cue"
              style={{ opacity: heroTextOpacity }}
            >
              <span className="cue-line" />
              <span className="cue-text">SCROLL</span>
            </div>
          </div>
        </section>

        {/* ================= 2. RECOMMENDED COLLECTION (데코타일: KCC / 장판: LX) ================= */}
        <section className="showroom-collection-section">
          <div className="container">
            <div className="section-head-block center">
              <span className="section-eyebrow">OUR COLLECTION</span>
              <h2 className="section-primary-title">
                공간에 어울리는 바닥재를 만나보세요.
              </h2>
              <p className="section-sub-copy">
                {recommendedCategory === "decotile"
                  ? "동경바닥재가 추천하는 KCC 대표 상업·주거용 데코타일 라인업"
                  : "동경바닥재가 추천하는 LX하우시스 대표 친환경·고기능 륨 장판 라인업"}
              </p>

              {/* Category Switcher Tabs */}
              <div className="collection-category-tabs">
                <button
                  type="button"
                  className={`collection-tab-btn ${recommendedCategory === "decotile" ? "active" : ""}`}
                  onClick={() => setRecommendedCategory("decotile")}
                  aria-pressed={recommendedCategory === "decotile"}
                >
                  <span className="tab-badge">KCC 최우선</span>
                  <span>데코타일 추천</span>
                </button>
                <button
                  type="button"
                  className={`collection-tab-btn ${recommendedCategory === "jangpan" ? "active" : ""}`}
                  onClick={() => setRecommendedCategory("jangpan")}
                  aria-pressed={recommendedCategory === "jangpan"}
                >
                  <span className="tab-badge">LX하우시스 최우선</span>
                  <span>장판 추천</span>
                </button>
              </div>
            </div>

            {/* Flagship Cards Grid */}
            <div className="collection-cards-grid">
              {(recommendedCategory === "decotile" ? KCC_COLLECTION : LX_JANGPAN_COLLECTION).map((item, idx) => (
                <article key={item.id} className="collection-card">
                  {/* Card Thumbnail Image with Hover Zoom */}
                  <div className="collection-card-media">
                    <img 
                      src={item.image} 
                      alt={item.lineup} 
                      loading="lazy"
                      decoding="async"
                      width="420"
                      height="340"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/no-image.svg";
                      }}
                    />
                    <div className="collection-card-badge">
                      <Sparkles size={13} />
                      <span>{item.badge}</span>
                    </div>
                    <span className="collection-index-pill">0{idx + 1}</span>
                  </div>

                  {/* Card Content & Details */}
                  <div className="collection-card-body">
                    <div className="card-brand-row">
                      <span className="brand-chip">{item.brand || "KCC"}</span>
                      <span className="subline-chip">{item.subLine}</span>
                    </div>

                    <h3 className="card-lineup-title">{item.lineup}</h3>
                    <p className="card-description">{item.description}</p>

                    <div className="card-spec-meta">
                      <div className="spec-meta-item">
                        <span className="spec-meta-label">규격</span>
                        <span className="spec-meta-val">{item.spec}</span>
                      </div>
                      <div className="spec-meta-item">
                        <span className="spec-meta-label">포장단위</span>
                        <span className="spec-meta-val">{item.packaging}</span>
                      </div>
                    </div>

                    <div className="card-action-bar">
                      <Link 
                        to={item.detailUrl} 
                        className="btn-card-detail"
                        onMouseEnter={() => preloadRoute(item.detailUrl)}
                      >
                        자세히 보기 <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Quick Filter Navigation Sub-bar */}
            {recommendedCategory === "decotile" ? (
              <div className="kcc-quick-pills-bar">
                <span className="quick-bar-label">라인업별 바로가기:</span>
                <div className="quick-pills-wrap">
                  <Link 
                    to="/materials?category=데코타일&brand=KCC&shape=450각" 
                    className="quick-pill"
                  >
                    센스타일 트랜디 450각
                  </Link>
                  <Link 
                    to="/materials?category=데코타일&brand=KCC&shape=600각" 
                    className="quick-pill"
                  >
                    센스타일 트랜디 600각
                  </Link>
                  <Link 
                    to="/materials?category=데코타일&brand=KCC&shape=일반 우드" 
                    className="quick-pill"
                  >
                    센스타일 트랜디 우드
                  </Link>
                  <Link 
                    to="/materials?category=데코타일&brand=KCC&line=센스타일 프로" 
                    className="quick-pill"
                  >
                    센스타일 프로
                  </Link>
                  <Link 
                    to="/materials?category=데코타일&brand=KCC&line=센스레이(내수)" 
                    className="quick-pill"
                  >
                    센스레이 (5.0T)
                  </Link>
                  <Link 
                    to="/materials?category=데코타일&brand=KCC" 
                    className="quick-pill highlight"
                  >
                    KCC 데코타일 전체 보기 →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="kcc-quick-pills-bar">
                <span className="quick-bar-label">두께별 바로가기:</span>
                <div className="quick-pills-wrap">
                  <Link 
                    to="/materials?category=장판&brand=LX하우시스&thickness=1.8T" 
                    className="quick-pill"
                  >
                    뉴청맥 (1.8T)
                  </Link>
                  <Link 
                    to="/materials?category=장판&brand=LX하우시스&thickness=2.2T" 
                    className="quick-pill"
                  >
                    지아자연애 (2.2T)
                  </Link>
                  <Link 
                    to="/materials?category=장판&brand=LX하우시스&thickness=3.2T" 
                    className="quick-pill"
                  >
                    지아사랑애 (2.7/3.2T)
                  </Link>
                  <Link 
                    to="/materials?category=장판&brand=LX하우시스&thickness=4.5T" 
                    className="quick-pill"
                  >
                    지아소리잠 (4.5T)
                  </Link>
                  <Link 
                    to="/materials?category=장판&brand=LX하우시스&thickness=5.0T" 
                    className="quick-pill"
                  >
                    엑스컴포트 (5.0T)
                  </Link>
                  <Link 
                    to="/materials?category=장판&brand=LX하우시스" 
                    className="quick-pill highlight"
                  >
                    LX하우시스 장판 전체 보기 →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================= 3. REAL PROJECTS (CONSTRUCTION CASES) ================= */}
        <LazySection minHeight="480px">
          <section className="showroom-projects-section">
            <div className="container">
              <div className="section-head-block row-header">
                <div>
                  <span className="section-eyebrow">REAL PROJECTS</span>
                  <h2 className="section-primary-title">우리가 완성한 공간들</h2>
                  <p className="section-sub-copy">
                    동경바닥재 자재로 완성된 실제 시공 포트폴리오를 확인해보세요.
                  </p>
                </div>
                <Link 
                  to="/cases" 
                  className="link-projects-all"
                  onMouseEnter={() => preloadRoute('/cases')}
                >
                  <span>시공사례 전체 보기</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Real Project Showcase Grid (4 Types of Spaces) */}
              <div className="projects-cards-grid">
                {REAL_PROJECTS.map((item) => {
                  const SpaceIcon = item.icon;
                  return (
                    <article 
                      key={item.id} 
                      className="project-case-card"
                      onClick={() => navigate(item.linkUrl)}
                    >
                      <div className="project-media-wrap">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          loading="lazy"
                          decoding="async"
                          width="560"
                          height="360"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/home-interior/korea-apt-living-01.webp";
                          }}
                        />
                        <div className="project-space-tag">
                          <SpaceIcon size={14} />
                          <span>{item.space}</span>
                        </div>
                      </div>

                      <div className="project-body-wrap">
                        <span className="project-material-summary">{item.material}</span>
                        <h3 className="project-case-title">{item.title}</h3>
                        <p className="project-case-desc">{item.desc}</p>
                        <span className="project-view-more">
                          현장 시공사례 보기 <ChevronRight size={15} />
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        </LazySection>

        {/* ================= 4. ABOUT DONGKYUNG BRAND STORY ================= */}
        <LazySection minHeight="420px">
          <section className="showroom-about-section">
            <div className="container">
              <div className="about-editorial-wrap">
                <div className="about-header-column">
                  <span className="section-eyebrow">ABOUT DONGKYUNG</span>
                  <h2 className="about-editorial-title">
                    좋은 자재가<br />
                    좋은 공간을 만듭니다.
                  </h2>
                </div>

                <div className="about-body-column">
                  <p className="about-lead-paragraph">
                    동경바닥재는 다양한 바닥재와 벽지를 공급하며, 공간의 용도와 현장 조건에 맞는 자재 선택 및 시공 상담을 도와드립니다.
                  </p>
                  <p className="about-sub-paragraph">
                    주거 공간부터 상업용 매장, 대형 오피스 및 특수 시설까지 — 공간마다 요구되는 내마모성, 쿠션감, 수밀성을 정밀히 분석하여 최적의 솔루션을 제안합니다.
                  </p>

                  <div className="about-values-grid">
                    <div className="value-item">
                      <div className="value-num">01</div>
                      <h4>정품 자재 직공급</h4>
                      <p>KCC, LX, 동신, 동화, 이건 등 국내 주요 제조사 100% 정품 바닥재 공급</p>
                    </div>

                    <div className="value-item">
                      <div className="value-num">02</div>
                      <h4>현장 맞춤 견적</h4>
                      <p>공간 유형, 면적, 용도에 맞춘 정확한 소요량 산출과 투명한 견적</p>
                    </div>

                    <div className="value-item">
                      <div className="value-num">03</div>
                      <h4>원스톱 시공 연계</h4>
                      <p>자재 구매부터 숙련된 시공팀의 정밀 책임 시공까지 원스톱 관리</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </LazySection>

        {/* ================= 5. ESTIMATE INQUIRY CTA ================= */}
        <section className="showroom-estimate-cta-section">
          <div className="container">
            <div className="estimate-cta-inner">
              <div className="estimate-text-block">
                <span className="estimate-eyebrow">ESTIMATE CONSULTATION</span>
                <h2 className="estimate-main-title">
                  공간의 변화, 지금 시작하세요.
                </h2>
                <p className="estimate-sub-title">
                  자재 선택부터 시공 상담까지, 동경바닥재 전문가가 친절히 상담해 드립니다.
                </p>
              </div>

              <div className="estimate-actions-block">
                <Link 
                  to="/estimate/request" 
                  className="btn-estimate-gold"
                  onMouseEnter={() => preloadRoute('/estimate')}
                  onTouchStart={() => preloadRoute('/estimate')}
                >
                  <FileText size={18} />
                  <span>견적문의 하기 →</span>
                </Link>

                <div className="estimate-contact-links">
                  <a 
                    href={KAKAO_CHAT_URL} 
                    target="_blank" 
                    rel="noreferrer noopener" 
                    className="contact-pill kakao"
                  >
                    <MessageSquare size={16} />
                    <span>카카오톡 1:1 상담</span>
                  </a>

                  <a 
                    href={`tel:${OFFICE_PHONE.replace(/[^0-9]/g, '')}`} 
                    className="contact-pill phone"
                  >
                    <PhoneCall size={16} />
                    <span>전화 문의: {OFFICE_PHONE}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </MainLayout>
  );
}
