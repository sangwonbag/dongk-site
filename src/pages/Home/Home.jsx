import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { sampleBooks } from "../../data/samplebooks.db";
import { 
  ChevronRight, 
  Phone, 
  ArrowRight, 
  BookOpen,
  Download
} from "lucide-react";
import "./Home.css";

// Curated featured materials array
const featuredMaterials = [
  {
    id: "장판-lx하우시스-cm21882",
    name: "뉴청맥 오크 (1.8T)",
    brand: "LX하우시스",
    specs: "1.8T | 두께 1.8mm",
    image: "/images/Thumbnail_Image/materials/장판/LX하우시스_뉴청맥_1.8T/CM21882.jpg",
    desc: "보행감이 우수하고 열전도율이 높은 한국 실속형 베스트셀러 장판"
  },
  {
    id: "마루-이건-강마루_세라_세라-n-오크",
    name: "이건 세라 오크",
    brand: "이건마루",
    specs: "7.5T | 95mm x 800mm",
    image: "/images/Thumbnail_Image/materials/마루/이건/강마루/세라/세라-N-오크.jpg",
    desc: "자연스러운 나뭇결과 뛰어난 표면 내구성을 자랑하는 친환경 이건 강마루"
  },
  {
    id: "카페트타일-스완-롤-carpet-rq054",
    name: "스완 롤 카페트 RQ054",
    brand: "스완카페트",
    specs: "롤 형태 | 폭 3.66m",
    image: "/images/Thumbnail_Image/materials/카페트타일/스완/롤-carpet/RQ054.jpg",
    desc: "정숙한 오피스 및 상업용 공간에 최적화된 방음 및 쿠션의 루프식 카페트"
  },
  {
    id: "벽지-개나리-실크-로하스_87424-1-에비뉴-화이트",
    name: "로하스 에비뉴 화이트",
    brand: "개나리벽지",
    specs: "실크 벽지 | 폭 1.06m",
    image: "/samplebooks/Thumbnail_Image/벽지/개나리/실크/로하스/lohas_page1_full.png",
    desc: "화사하고 넓은 공간을 연출하는 프리미엄 친환경 실크 벽지"
  }
];

// Curated realistic construction projects array
const projects = [
  {
    id: 1,
    title: "마포구 아파트 거실 장판 시공",
    category: "주거공간",
    range: "거실 및 방 전면 시공",
    material: "LX하우시스 지아자연애 2.2T",
    image: "/images/home-interior/korea-apt-living-01.png"
  },
  {
    id: 2,
    title: "강남구 오피스 카페트타일 시공",
    category: "사무공간",
    range: "회의실 및 개방형 사무실 전체",
    material: "스완카페트 고급 롤/타일 카페트",
    image: "/images/home-interior/korea-office-01.png"
  },
  {
    id: 3,
    title: "성동구 매장 데코타일 시공",
    category: "상업공간",
    range: "쇼룸 전시실 및 로비 바닥",
    material: "녹수 프리미엄 스톤 데코타일",
    image: "/images/home-interior/korea-store-01.png"
  },
  {
    id: 4,
    title: "용산구 주거공간 벽지 시공",
    category: "주거공간",
    range: "침실 3개소 전체 벽면",
    material: "개나리 로하스 실크 벽지 (에비뉴 화이트)",
    image: "/images/home-interior/korea-bedroom-01.png"
  }
];

// Space Finder sections data
const spaceSections = [
  {
    id: 'residential',
    label: '01',
    category: '주거공간',
    title: '매일 머무는 집, 바닥과 벽부터 편안하게',
    description: '거실, 방, 주방까지 생활감과 관리 편의성을 고려한 바닥재와 벽지를 추천합니다.',
    materials: ['장판', '마루', '벽지'],
    filterParams: { category: '장판', brand: 'all' },
    image: '/images/spaces/space-residential.jpg'
  },
  {
    id: 'apartment',
    label: '02',
    category: '아파트 / 오피스텔',
    title: '아파트와 오피스텔에 맞는 실용적인 선택',
    description: '공간 크기와 생활 패턴에 따라 장판, 데코타일, 벽지를 균형 있게 제안합니다.',
    materials: ['장판', '데코타일', '실크벽지'],
    filterParams: { category: '장판', brand: 'all' },
    image: '/images/spaces/space-apartment.jpg'
  },
  {
    id: 'commercial',
    label: '03',
    category: '상업공간',
    title: '매장 분위기를 완성하는 바닥재',
    description: '카페, 음식점, 매장처럼 유동 인구가 많은 공간에는 내구성과 분위기를 함께 고려해야 합니다.',
    materials: ['데코타일', '러버타일', '방염벽지'],
    filterParams: { category: '데코타일', brand: 'all' },
    image: '/images/spaces/space-commercial.jpg'
  },
  {
    id: 'office',
    label: '04',
    category: '사무실 / 오피스',
    title: '업무공간은 깔끔하고 오래가야 합니다',
    description: '오피스, 사무실, 회의실에는 관리가 쉽고 안정감 있는 바닥재 구성이 중요합니다.',
    materials: ['카페트타일', '데코타일', '벽지'],
    filterParams: { category: '카페트타일', brand: 'all' },
    image: '/images/spaces/space-office.jpg'
  },
  {
    id: 'public',
    label: '05',
    category: '학원 / 병원 / 공공공간',
    title: '많은 사람이 오가는 공간에는 내구성이 필요합니다',
    description: '학원, 병원, 공공시설은 청소와 유지관리가 쉬운 자재를 중심으로 추천합니다.',
    materials: ['데코타일', '장판', '방염벽지', '부자재'],
    filterParams: { category: '데코타일', brand: 'all' },
    image: '/images/spaces/space-public.jpg'
  }
];

// Space Finder Scroll Section component
const SpaceFinderSection = () => {
  const nav = useNavigate();
  const parentRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!parentRef.current) return;
      const rect = parentRef.current.getBoundingClientRect();
      const stickyTopOffset = 80;
      const stickyHeight = window.innerHeight - stickyTopOffset;
      const totalScrollable = rect.height - stickyHeight;
      const scrolled = Math.min(Math.max(stickyTopOffset - rect.top, 0), totalScrollable);
      const progress = totalScrollable > 0 ? scrolled / totalScrollable : 0;

      const nextIndex = Math.min(
        spaceSections.length - 1,
        Math.floor(progress * spaceSections.length)
      );
      setActiveIndex(nextIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentSpace = spaceSections[activeIndex];

  return (
    <section className="showroom-space-finder-v2" ref={parentRef}>
      {/* Desktop Sticky View */}
      <div className="space-finder-desktop">
        <div className="space-finder-sticky-wrapper">
          <div className="space-finder-container container">
            
            {/* Left Content Area */}
            <div className="space-finder-content-left">
              <span className="space-finder-label">SPACE FINDER</span>
              <div className="space-finder-slides-container">
                {spaceSections.map((sect, idx) => (
                  <div 
                    key={sect.id} 
                    className={`space-finder-text-slide ${idx === activeIndex ? "active" : ""}`}
                  >
                    <div className="space-finder-index">
                      <strong>{sect.label}</strong> / 05
                    </div>
                    <span className="space-finder-category-tag">{sect.category}</span>
                    <h2 className="space-finder-title">{sect.title}</h2>
                    <p className="space-finder-description">{sect.description}</p>
                    
                    <div className="space-finder-materials">
                      <span className="materials-label">추천 자재 :</span>
                      <div className="materials-tags-row">
                        {sect.materials.map((mat, i) => (
                          <span key={i} className="space-material-tag-badge">{mat}</span>
                        ))}
                      </div>
                    </div>

                    <div className="space-finder-buttons">
                      <button 
                        className="btn-v2-primary" 
                        onClick={() => nav(`/materials?category=${sect.filterParams.category}`)}
                      >
                        이 공간 자재 보기
                      </button>
                      <button 
                        className="btn-v2-outline" 
                        onClick={() => nav("/estimate/request")}
                      >
                        견적 문의하기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Image Frame */}
            <div className="space-finder-img-right">
              <div className="space-finder-img-box">
                {spaceSections.map((sect, idx) => (
                  <img
                    key={sect.id}
                    src={sect.image}
                    alt={sect.title}
                    className={`space-finder-img-slide ${idx === activeIndex ? "active" : ""}`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Stacked View */}
      <div className="space-finder-mobile container">
        <div className="space-finder-mobile-header">
          <span className="space-finder-label">SPACE FINDER</span>
          <h2 className="space-finder-mobile-heading">공간별 자재 추천</h2>
        </div>
        <div className="space-finder-mobile-list">
          {spaceSections.map((sect) => (
            <div key={sect.id} className="space-finder-mobile-card">
              <div className="mobile-card-img-wrap">
                <img src={sect.image} alt={sect.title} className="mobile-card-img" />
                <span className="mobile-card-index">{sect.label}</span>
              </div>
              <div className="mobile-card-body">
                <span className="mobile-card-cat">{sect.category}</span>
                <h3 className="mobile-card-title">{sect.title}</h3>
                <p className="mobile-card-desc">{sect.description}</p>
                
                <div className="mobile-card-materials">
                  <span className="mobile-materials-lbl">추천 자재:</span>
                  <div className="mobile-materials-tags">
                    {sect.materials.map((mat, i) => (
                      <span key={i} className="mobile-mat-badge">{mat}</span>
                    ))}
                  </div>
                </div>

                <div className="mobile-card-buttons">
                  <button 
                    className="btn-v2-primary" 
                    onClick={() => nav(`/materials?category=${sect.filterParams.category}`)}
                  >
                    이 공간 자재 보기
                  </button>
                  <button 
                    className="btn-v2-outline" 
                    onClick={() => nav("/estimate/request")}
                  >
                    견적 문의하기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Helper component for category card image with loading skeleton and error fallback
const CategoryCardImage = ({ src, fallback, alt }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setLoaded(false);
  }, [src]);

  return (
    <div className="category-img-container">
      {!loaded && <div className="category-img-skeleton" />}
      <img
        src={imgSrc}
        alt={alt}
        className="card-thumb-img"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (imgSrc !== fallback) {
            setImgSrc(fallback);
          }
        }}
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}
      />
    </div>
  );
};

export default function Home() {
  const nav = useNavigate();

  // 6 Material categories
  const categories = [
    { 
      name: "데코타일", 
      engName: "DECO TILE", 
      desc: "상업공간과 주거공간 모두에 어울리는 실용적인 바닥재", 
      image: "/images/categories/category-deco-tile.png", 
      fallbackImage: "/images/deco_tile.png",
      path: "/materials?category=데코타일" 
    },
    { 
      name: "장판", 
      engName: "CUSHION FLOOR", 
      desc: "생활감과 편안함을 고려한 주거용 바닥재", 
      image: "/images/categories/category-cushion-floor.png", 
      fallbackImage: "/images/cross_section.png",
      path: "/materials?category=장판" 
    },
    { 
      name: "마루", 
      engName: "WOOD FLOORING", 
      desc: "공간에 따뜻한 결을 더하는 프리미엄 목질 바닥재", 
      image: "/images/categories/category-wood-flooring.png", 
      fallbackImage: "/images/spc_flooring.png",
      path: "/materials?category=마루" 
    },
    { 
      name: "벽지", 
      engName: "PREMIUM WALLPAPER", 
      desc: "벽면의 분위기를 완성하는 다양한 패턴과 질감", 
      image: "/images/categories/category-wallpaper.png", 
      fallbackImage: "/images/premium_wallpaper.png",
      path: "/materials?category=벽지" 
    },
    { 
      name: "카페트타일", 
      engName: "CARPET TILE", 
      desc: "오피스와 상업공간에 적합한 모듈형 바닥재", 
      image: "/images/categories/category-carpet-tile.png", 
      fallbackImage: "/images/carpet_tile.png",
      path: "/materials?category=카페트타일" 
    },
    { 
      name: "부자재", 
      engName: "ACCESSORIES", 
      desc: "시공 완성도를 높이는 필수 부자재", 
      image: "/images/categories/category-accessories.png", 
      fallbackImage: "/images/interlocking_profile.png",
      path: "/materials?category=부자재" 
    }
  ];

  // Select 4 major brand samplebooks for home feature
  const homeSampleBooks = useMemo(() => {
    const targets = ["lx-new-chungmac-2025", "dongshin-arthouse-2025", "kcc-senstyle-trendy-2025", "gaenari-artbook"];
    return sampleBooks.filter(b => targets.includes(b.id));
  }, []);

  // Scroll Reveal Observer
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.1 }
    );

    reveals.forEach((el) => observer.observe(el));
    return () => {
      reveals.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <MainLayout>
      <div className="showroom-home-layout">
        
        {/* ==========================================
           1. Hero Section (Luxury Minimal Reinterpretation)
           ========================================== */}
        <section className="showroom-hero-v2">
          <div className="hero-v2-bg-frame">
            <img 
              src="/images/home-interior/korea-apt-living-01.png" 
              alt="Premium Living Room Interior" 
              className="hero-v2-bg-img"
            />
            <div className="hero-v2-overlay"></div>
          </div>
          
          <div className="hero-v2-content container">
            <span className="hero-v2-eyebrow">PREMIUM FLOORING & WALLCOVERING SHOWROOM</span>
            <h1 className="hero-v2-title">
              공간의 분위기는<br />
              바닥과 벽에서 시작됩니다.
            </h1>
            <p className="hero-v2-subtitle">
              동경바닥재는 바닥재·벽지 판매부터 시공 상담까지 한 번에 도와드립니다.
            </p>
            <div className="hero-v2-buttons">
              <button className="btn-v2-primary" onClick={() => nav("/materials")}>
                자재 찾기
              </button>
              <button className="btn-v2-secondary" onClick={() => nav("/samplebooks")}>
                샘플북 보기
              </button>
              <button className="btn-v2-outline" onClick={() => nav("/estimate/request")}>
                견적 문의
              </button>
            </div>
          </div>
        </section>

        {/* Space Finder (공간별 자재 추천) Scroll Section */}
        <SpaceFinderSection />

        {/* ==========================================
           2. Category Showcase Section
           ========================================== */}
        <section className="showroom-category-v2 reveal">
          <div className="section-header-v2 container">
            <span className="section-subtitle-v2">COLLECTIONS</span>
            <h2 className="section-title-v2">주요 자재 카테고리</h2>
            <p className="section-desc-v2">
              상가, 오피스, 아파트 등 용도에 맞추어 구성된 전문 컬렉션입니다.
            </p>
          </div>

          <div className="category-v2-grid container">
            {categories.map((cat, idx) => (
              <div 
                key={idx} 
                className="category-v2-card" 
                onClick={() => nav(cat.path)}
              >
                <div className="category-v2-card-img-wrap">
                  <CategoryCardImage 
                    src={cat.image} 
                    fallback={cat.fallbackImage} 
                    alt={cat.name} 
                  />
                </div>
                <div className="category-v2-card-body">
                  <span className="category-v2-card-eng">{cat.engName}</span>
                  <h3 className="category-v2-card-title">{cat.name}</h3>
                  <p className="category-v2-card-desc">{cat.desc}</p>
                  <span className="category-v2-card-link">
                    자재 보기 <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==========================================
           3. Sample Book Section (Catalog Layout)
           ========================================== */}
        <section className="showroom-samplebooks-v2 reveal">
          <div className="section-header-v2 container">
            <span className="section-subtitle-v2">DIGITAL CATALOG</span>
            <h2 className="section-title-v2">브랜드별 샘플북</h2>
            <p className="section-desc-v2">
              KCC, LX, 동신, 개나리 등 주요 브랜드의 샘플북을 한눈에 확인하세요.
            </p>
          </div>

          <div className="samplebooks-v2-grid container">
            {homeSampleBooks.map((book) => (
              <div 
                key={book.id} 
                className="samplebook-v2-card"
                onClick={() => {
                  if (book.openInNewTab) {
                    window.open(book.pdf || "#", "_blank", "noopener,noreferrer");
                  } else {
                    nav(`/samplebooks?bookId=${book.id}`);
                  }
                }}
              >
                <div className="samplebook-v2-cover-frame">
                  <img src={book.cover || "/images/cross_section.png"} alt={book.title} className="samplebook-v2-cover-img" />
                  <div className="samplebook-v2-overlay-btn">
                    <BookOpen size={16} /> <span>샘플북 열기</span>
                  </div>
                </div>
                <div className="samplebook-v2-info">
                  <span className="samplebook-v2-brand">{book.brand}</span>
                  <h3 className="samplebook-v2-title">{book.title}</h3>
                  <p className="samplebook-v2-desc">{book.description}</p>
                  {book.pdf && (
                    <a 
                      href={book.pdf} 
                      download 
                      onClick={(e) => e.stopPropagation()} 
                      className="samplebook-v2-download-btn"
                    >
                      <Download size={13} /> <span>PDF 다운로드</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==========================================
           4. Featured Materials Section (Curation Grid)
           ========================================== */}
        <section className="showroom-featured-v2 reveal">
          <div className="section-header-v2 container">
            <span className="section-subtitle-v2">CURATED LIST</span>
            <h2 className="section-title-v2">추천 자재</h2>
            <p className="section-desc-v2">
              현장에서 가장 선호도가 높고 시공 퀄리티가 검증된 자재들을 소개합니다.
            </p>
          </div>

          <div className="featured-v2-grid container">
            {featuredMaterials.map((mat) => (
              <div 
                key={mat.id} 
                className="featured-v2-card"
                onClick={() => nav(`/materials/${mat.id}`)}
              >
                <div className="featured-v2-img-frame">
                  <img src={mat.image} alt={mat.name} className="featured-v2-img" />
                </div>
                <div className="featured-v2-body">
                  <div className="featured-v2-meta">
                    <span className="featured-v2-brand">{mat.brand}</span>
                    <span className="featured-v2-specs">{mat.specs}</span>
                  </div>
                  <h3 className="featured-v2-name">{mat.name}</h3>
                  <p className="featured-v2-desc">{mat.desc}</p>
                  <span className="featured-v2-more-link">자재 상세정보 보기 <ArrowRight size={14} /></span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==========================================
           5. Project / 시공사례 Section
           ========================================== */}
        <section className="showroom-projects-v2 reveal">
          <div className="section-header-v2 container">
            <span className="section-subtitle-v2">PORTFOLIO</span>
            <h2 className="section-title-v2">시공사례</h2>
            <p className="section-desc-v2">
              주거공간, 상업공간, 오피스 현장에서 완성된 바닥과 벽의 완벽한 조화
            </p>
          </div>

          <div className="projects-v2-grid container">
            {projects.map((proj) => (
              <div key={proj.id} className="project-v2-card">
                <div className="project-v2-img-frame">
                  <img src={proj.image} alt={proj.title} className="project-v2-img" />
                </div>
                <div className="project-v2-body">
                  <span className="project-v2-cat">{proj.category}</span>
                  <h3 className="project-v2-title">{proj.title}</h3>
                  <div className="project-v2-details">
                    <div className="project-v2-detail-item">
                      <span className="detail-lbl">사용 자재</span>
                      <span className="detail-val">{proj.material}</span>
                    </div>
                    <div className="project-v2-detail-item">
                      <span className="detail-lbl">시공 범위</span>
                      <span className="detail-val">{proj.range}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==========================================
           6. Trust Section (Highlights & Numbers)
           ========================================== */}
        <section className="showroom-trust-v2 reveal">
          <div className="trust-v2-container container">
            <div className="trust-v2-grid">
              <div className="trust-v2-item">
                <span className="trust-v2-num">20+</span>
                <h4 className="trust-v2-title">시공 경험</h4>
                <p className="trust-v2-desc">20년 이상 오직 바닥재와 벽지 한 분야만을 전문으로 다져온 신뢰와 기술력</p>
              </div>
              <div className="trust-v2-item">
                <span className="trust-v2-num">1,000+</span>
                <h4 className="trust-v2-title">누적 시공 현장</h4>
                <p className="trust-v2-desc">아파트, 주택, 사무실, 쇼룸, 상가 등 다양한 규모와 환경의 완벽한 시공 경험</p>
              </div>
              <div className="trust-v2-item">
                <span className="trust-v2-num">100%</span>
                <h4 className="trust-v2-title">정품 자재 시공</h4>
                <p className="trust-v2-desc">KCC, LX, 동신, 개나리 등 국내 최고 브랜드의 공식 대리점 정품만을 사용</p>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
           7. Contact / 견적문의 Section
           ========================================== */}
        <section className="showroom-contact-v2 reveal">
          <div className="contact-v2-box container">
            <div className="contact-v2-content">
              <span className="contact-v2-tag">CONSULTING & ESTIMATE</span>
              <h2 className="contact-v2-heading">자재 선택이 어렵다면<br />동경바닥재가 도와드립니다.</h2>
              <p className="contact-v2-subheading">
                현장 용도, 평수, 브랜드, 예산에 맞춰 적합한 바닥재와 벽지를 제안합니다.<br />
                수도권 무료 방문 실측 및 자재 샘플 상담을 지금 바로 받아보세요.
              </p>
              
              <div className="contact-v2-info-row">
                <div className="contact-v2-info-item">
                  <span className="info-lbl">대표 문의 번호</span>
                  <a href="tel:02-487-9775" className="info-val-phone">02-487-9775</a>
                </div>
                <div className="contact-v2-info-item">
                  <span className="info-lbl">운영 시간</span>
                  <span className="info-val-text">평일 07:00 ~ 18:00 / 주말 07:00 ~ 12:00</span>
                </div>
              </div>

              <div className="contact-v2-buttons">
                <a href="tel:02-487-9775" className="btn-contact-v2-primary">
                  전화 상담하기
                </a>
                <button className="btn-contact-v2-secondary" onClick={() => nav("/estimate/request")}>
                  온라인 견적 문의
                </button>
                <button className="btn-contact-v2-outline" onClick={() => nav("/materials")}>
                  자재 찾아보기
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </MainLayout>
  );
}
