import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { 
  ShieldCheck, 
  Wrench, 
  Truck, 
  Award, 
  ChevronRight, 
  Phone, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Layers,
  FileText,
  BookOpen
} from "lucide-react";
import "./Home.css";

// Dynamic interior reference moodboard items (Mix of image references and brand trust cards)
const homeInteriorImages = [
  {
    id: 1,
    title: "한국 아파트 거실",
    description: "밝은 톤의 바닥재로 넓고 깨끗한 분위기 연출",
    image: "/images/home-interior/korea-apt-living-01.png",
    fallbackImage: "/images/premium_living_room.png",
    type: "image",
    gridSpan: "large"
  },
  {
    id: 2,
    type: "text",
    title: "20년 이상 시공 경험",
    description: "오랜 현장 경험을 바탕으로 자재 선택부터 시공까지 현실적인 기준으로 안내합니다.",
    highlight: "20 YEARS+",
    bgType: "deep-green"
  },
  {
    id: 3,
    title: "아파트 침실",
    description: "아늑하고 차분한 무드의 침실 인테리어와 화이트 벽지 조합",
    image: "/images/home-interior/korea-bedroom-01.png",
    fallbackImage: "/images/panorama_bedroom.png",
    type: "image",
    gridSpan: "medium"
  },
  {
    id: 4,
    title: "오피스텔 원룸",
    description: "수납과 생활 편의성을 갖춘 실용적인 빌트인 구조 원룸",
    image: "/images/home-interior/korea-officetel-01.png",
    fallbackImage: "/images/panorama_entrance.png",
    type: "image",
    gridSpan: "small"
  },
  {
    id: 5,
    type: "text",
    title: "바닥재·벽지 판매 및 시공",
    description: "데코타일, 장판, 마루, 벽지, 카페트타일 등 공간에 맞는 최상의 자재를 제안합니다.",
    highlight: "FLOOR & WALL",
    bgType: "mustard"
  },
  {
    id: 6,
    title: "가정집 거실",
    description: "따뜻한 우드 바닥과 크림색 벽지가 조화를 이루는 안락한 가족 거실",
    image: "/images/home-interior/korea-home-living-01.png",
    fallbackImage: "/images/panorama_living.png",
    type: "image",
    gridSpan: "large"
  },
  {
    id: 7,
    title: "주방/거실 연결 공간",
    description: "대면형 싱크대와 넓은 거실 공간이 이어져 개방감이 높은 아파트 구조",
    image: "/images/home-interior/korea-kitchen-living-01.png",
    fallbackImage: "/images/panorama_kitchen.png",
    type: "image",
    gridSpan: "medium"
  },
  {
    id: 8,
    type: "text",
    title: "주거·상업 공간 모두 대응",
    description: "아파트, 오피스텔, 상가, 사무실, 학원, 병원 등 다양한 현장의 전문 기술력을 보유하고 있습니다.",
    highlight: "ALL SPACES",
    bgType: "charcoal"
  },
  {
    id: 9,
    title: "상가/매장 공간",
    description: "견고하고 보행량이 많은 매장에 특화된 트렌디한 데코타일 바닥",
    image: "/images/home-interior/korea-store-01.png",
    fallbackImage: "/images/carpet_tile.png",
    type: "image",
    gridSpan: "small"
  },
  {
    id: 10,
    title: "사무실 공간",
    description: "소음을 방지하고 깔끔한 업무 분위기를 조성하는 텍스처 카페트 타일",
    image: "/images/home-interior/korea-office-01.png",
    fallbackImage: "/images/living_room.png",
    type: "image",
    gridSpan: "medium"
  },
  {
    id: 11,
    type: "text",
    title: "견적부터 시공까지",
    description: "자재만 단순 판매하는 것이 아니라, 현장 조건에 맞춘 책임 시공 상담을 지향합니다.",
    highlight: "ON-SITE EXPERTS",
    bgType: "ivory"
  },
  {
    id: 12,
    title: "복도 또는 현관 공간",
    description: "집의 첫인상을 결정하는 모던하고 단정한 아파트 복도 인테리어",
    image: "/images/home-interior/korea-hallway-01.png",
    fallbackImage: "/images/panorama_bg.png",
    type: "image",
    gridSpan: "large"
  }
];

// Helper component for moodboard image with safe error fallback
const MoodboardImage = ({ src, fallback, alt }) => {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <img
      src={imgSrc}
      alt={alt}
      className="moodboard-img"
      onError={() => {
        if (imgSrc !== fallback) {
          setImgSrc(fallback);
        }
      }}
    />
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
      desc: "뛰어난 가성비와 견고한 표면의 실용적 바닥재", 
      image: "/images/categories/category-deco-tile.png", 
      fallbackImage: "/images/deco_tile.png",
      path: "/materials?category=데코타일" 
    },
    { 
      name: "장판", 
      engName: "CUSHION FLOOR", 
      desc: "보행감이 우수하고 틈새가 없는 밀폐형 시공 자재", 
      image: "/images/categories/category-cushion-floor.png", 
      fallbackImage: "/images/cross_section.png",
      path: "/materials?category=장판" 
    },
    { 
      name: "마루", 
      engName: "WOOD FLOORING", 
      desc: "자연 그대로의 고급스러운 질감을 선사하는 친환경 목재 마루", 
      image: "/images/categories/category-wood-flooring.png", 
      fallbackImage: "/images/spc_flooring.png",
      path: "/materials?category=마루" 
    },
    { 
      name: "벽지", 
      engName: "PREMIUM WALLPAPER", 
      desc: "공간의 면적감을 극대화하는 친환경 실크 및 합지 벽지", 
      image: "/images/categories/category-wallpaper.png", 
      fallbackImage: "/images/premium_wallpaper.png",
      path: "/materials?category=벽지" 
    },
    { 
      name: "카페트타일", 
      engName: "CARPET TILE", 
      desc: "탁월한 방음성과 고급스러운 질감의 오피스 전문 마감재", 
      image: "/images/categories/category-carpet-tile.png", 
      fallbackImage: "/images/carpet_tile.png",
      path: "/materials?category=카페트타일" 
    },
    { 
      name: "부자재", 
      engName: "ACCESSORIES", 
      desc: "시공의 밀착력을 높여주는 접착제, 실리콘 및 걸레받이 마감재", 
      image: "/images/categories/category-accessories.png", 
      fallbackImage: "/images/interlocking_profile.png",
      path: "/materials?category=부자재" 
    }
  ];

  // Space recommendations
  const spaceCategories = [
    { name: "주거공간", engName: "RESIDENTIAL", tags: ["장판", "마루", "벽지"], image: "/images/home-interior/korea-apt-living-01.png" },
    { name: "상업공간", engName: "COMMERCIAL", tags: ["데코타일", "카페트타일"], image: "/images/home-interior/korea-store-01.png" },
    { name: "사무실", engName: "OFFICE", tags: ["카페트타일", "데코타일"], image: "/images/home-interior/korea-office-01.png" },
    { name: "원룸/오피스텔", engName: "STUDIO", tags: ["장판", "데코타일"], image: "/images/home-interior/korea-officetel-01.png" }
  ];

  // Brand partners
  const brands = [
    "KCC", "동신", "LX", "녹수", "현대", "재영", "구정", "동화", "개나리", "서울", "제일", "디아이디", "신한"
  ];

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
      { threshold: 0.15 }
    );

    reveals.forEach((el) => observer.observe(el));
    return () => {
      reveals.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <MainLayout>
      <div className="showroom-home-layout">
        
        {/* ==========================================
           1. Hero Section (Bright Showcase)
           ========================================== */}
        <section className="showroom-hero">
          <div className="hero-img-mask"></div>
          <img 
            src="/images/premium_living_room.png" 
            alt="Artis Style Premium Floor Visual" 
            className="hero-background-image"
          />
          <div className="hero-interior-card container">
            <span className="hero-top-eyebrow">PREMIUM FLOORING & WALLCOVERING</span>
            <h1 className="hero-main-title">
              공간의 완성은<br />
              바닥에서 시작됩니다
            </h1>
            <p className="hero-sub-text">
              20년 이상 경력의 시공 전문가들이 제안하는 바닥재·벽지 솔루션.<br />
              동경바닥재는 신뢰도 높은 시공력과 세련된 감성으로 주거부터 상업공간까지 프리미엄 쇼룸으로 탈바꿈시킵니다.
            </p>
            <div className="hero-buttons-strip">
              <button className="btn-mustard-yellow" onClick={() => nav("/materials")}>
                자재 둘러보기
              </button>
              <button className="btn-white-card" onClick={() => nav("/samplebooks")}>
                샘플북 보기
              </button>
              <button className="btn-white-card text-charcoal" onClick={() => nav("/estimate/request")}>
                견적 문의하기
              </button>
            </div>
          </div>
        </section>

        {/* ==========================================
           *NEW* 1.5. Intro Text Section
           ========================================== */}
        <section className="home-intro-text-section reveal">
          <div className="container">
            <h2 className="home-intro-title">좋은 공간은 바닥과 벽에서 시작됩니다.</h2>
            <p className="home-intro-subtitle">
              동경바닥재는 <span className="highlight-dot">20년 이상 경력</span>의 시공 전문가들과 함께 주거공간, 상업공간, 사무실, 오피스텔에 어울리는 바닥재와 벽지를 제안합니다.
            </p>
          </div>
        </section>

        {/* ==========================================
           *NEW* 1.6. Pinterest/Cosmos Style Moodboard Masonry Section
           ========================================== */}
        <section className="showroom-moodboard-block reveal">
          <div className="container">
            <div className="moodboard-masonry">
              {homeInteriorImages.map((item) => {
                if (item.type === "image") {
                  return (
                    <div 
                      key={item.id} 
                      className={`moodboard-card card-image card-span-${item.gridSpan}`}
                      onClick={() => nav("/materials")}
                    >
                      <div className="moodboard-img-frame">
                        <MoodboardImage 
                          src={item.image} 
                          fallback={item.fallbackImage} 
                          alt={item.title} 
                        />
                        <div className="moodboard-img-overlay">
                          <div className="moodboard-overlay-info">
                            <h4 className="moodboard-overlay-title">{item.title}</h4>
                            <p className="moodboard-overlay-desc">{item.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="moodboard-card-caption">
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div 
                      key={item.id} 
                      className={`moodboard-card card-text bg-${item.bgType}`}
                    >
                      <span className="card-highlight">{item.highlight}</span>
                      <div className="card-text-body">
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </section>

        {/* ==========================================
           *NEW* 1.7. Service Explain Section
           ========================================== */}
        <section className="home-service-section reveal">
          <div className="container">
            <div className="section-header">
              <span className="section-subtitle">OUR SERVICES</span>
              <h2 className="section-title">동경바닥재가 공간에 맞는 자재를 제안합니다</h2>
              <div className="header-divider"></div>
              <p className="section-description">
                단순 자재 판매를 넘어, 현장 상황과 시공 환경에 꼭 맞는 완성도 높은 마감을 제안합니다.
              </p>
            </div>

            <div className="service-explain-grid">
              <div className="service-explain-card">
                <span className="service-num-badge">01</span>
                <h3>자재 선택</h3>
                <p>브랜드, 규격, 용도에 맞춰 원하는 자재를 꼼꼼하게 비교하고 직접 고를 수 있습니다.</p>
              </div>

              <div className="service-explain-card">
                <span className="service-num-badge">02</span>
                <h3>시공 상담</h3>
                <p>현장 수평 상태, 기존 바닥 평수, 철거 여부 및 엘리베이터/주차 진입 조건까지 다각도로 고려합니다.</p>
              </div>

              <div className="service-explain-card">
                <span className="service-num-badge">03</span>
                <h3>전문 시공</h3>
                <p>20년 이상 현장 경험이 풍부한 전문 시공기사분들과 정교한 밀착 마감을 완성합니다.</p>
              </div>

              <div className="service-explain-card">
                <span className="service-num-badge">04</span>
                <h3>견적 문의</h3>
                <p>원하는 제품과 물량을 선택하여 온라인으로 신속하고 합리적인 견적 접수가 가능합니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
           2. Category Showcase Section (Beige Cards)
           ========================================== */}
        <section id="category-section" className="showroom-category-block reveal">
          <div className="section-header container">
            <span className="section-subtitle">COLLECTIONS</span>
            <h2 className="section-title">주요 자재 카테고리</h2>
            <div className="header-divider"></div>
            <p className="section-description">
              용도와 디자인에 맞춰 엄선한 최고급 마감재 라인업을 소개합니다.
            </p>
          </div>

          <div className="showroom-category-grid container">
            {categories.map((cat, idx) => (
              <div 
                key={idx} 
                className="home-category-card" 
                onClick={() => nav(cat.path)}
                style={{ transitionDelay: `${idx * 0.08}s` }}
              >
                <div className="card-thumb-frame">
                  <CategoryCardImage 
                    src={cat.image} 
                    fallback={cat.fallbackImage} 
                    alt={cat.name} 
                  />
                </div>
                <div className="card-desc-holder">
                  <span className="card-sub-tag">{cat.engName}</span>
                  <h3 className="card-title-txt">{cat.name}</h3>
                  <p className="card-details-txt">{cat.desc}</p>
                  <button className="btn-card-reveal">
                    둘러보기 <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* ==========================================
           3. Premium Material Section (Space Recommendation Grid)
           ========================================== */}
        <section className="showroom-spaces-block reveal">
          <div className="section-header container">
            <span className="section-subtitle">SPACE FINDER</span>
            <h2 className="section-title">공간에 맞는 자재를 더 쉽게 찾으세요</h2>
            <div className="header-divider"></div>
            <p className="section-description">
              각 공간별 마모도와 보행 환경에 알맞은 최적의 자재 추천 조합입니다.
            </p>
          </div>

          <div className="spaces-matrix-grid container">
            {spaceCategories.map((sc, idx) => (
              <div 
                key={idx} 
                className="space-matrix-card"
                onClick={() => nav("/materials")}
              >
                <div className="space-img-frame">
                  <img src={sc.image} alt={sc.name} className="space-img" />
                  <div className="space-overlay-shade"></div>
                </div>
                <div className="space-meta-holder">
                  <span className="space-eng-label">{sc.engName}</span>
                  <h3 className="space-name-title">{sc.name}</h3>
                  <div className="space-rec-tags">
                    {sc.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="space-tag-badge">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* ==========================================
           4. Brand Section (Mustard Hover Partners)
           ========================================== */}
        <section className="showroom-brand-block reveal">
          <div className="section-header container">
            <span className="section-subtitle">PARTNER BRANDS</span>
            <h2 className="section-title">브랜드</h2>
            <div className="header-divider"></div>
          </div>

          <div className="brand-matrix container">
            {brands.map((bName, idx) => (
              <div 
                key={idx} 
                className="brand-matrix-item"
                onClick={() => nav(`/materials?brand=${bName}`)}
              >
                <span className="brand-logo-text">{bName}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ==========================================
           *NEW* 5. Home CTA Buttons Section
           ========================================== */}
        <section className="home-cta-buttons-section reveal">
          <div className="container">
            <span className="cta-tagline">FLOOR & WALL ESTIMATE</span>
            <h2 className="cta-main-heading">
              우리 공간에 맞는 바닥재와 벽지를 찾고 있다면,<br />
              지금 동경바닥재에 문의하세요.
            </h2>
            <div className="hero-buttons-strip" style={{ justifyContent: 'center', marginTop: '32px' }}>
              <button className="btn-mustard-yellow" onClick={() => nav("/materials")}>
                자재 둘러보기
              </button>
              <button className="btn-white-card" onClick={() => nav("/samplebooks")}>
                샘플북 보기
              </button>
              <button className="btn-white-card text-charcoal" onClick={() => nav("/estimate/request")}>
                견적 문의하기
              </button>
              <a href="tel:02-487-9775" className="btn-white-card text-charcoal" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <Phone size={15} /> 전화 문의하기
              </a>
            </div>
            
            <div className="cta-schedule-info">
              <span>
                <strong>대표번호:</strong> 02-487-9775
              </span>
              <span className="bullet-divider">•</span>
              <span>
                <strong>평일:</strong> 07:00 ~ 18:00
              </span>
              <span className="bullet-divider">•</span>
              <span>
                <strong>주말/공휴일:</strong> 07:00 ~ 12:00
              </span>
            </div>
          </div>
        </section>

        {/* ==========================================
           6. Contact CTA Section (Charcoal background)
           ========================================== */}
        <section className="showroom-contact-block reveal">
          <div className="contact-container container">
            
            {/* Call Info Card */}
            <div className="contact-details-box">
              <span className="contact-sub-eyebrow">CONSULTING & ESTIMATE</span>
              <h2 className="contact-main-title">시공 견적 및 상담안내</h2>
              <div className="contact-header-line"></div>
              <p className="contact-description-txt">
                수도권 전역 무료 현장 방문 실측 상담을 지원합니다. 주거 공간 도면 매칭 및 상업공간 맞춤 자재 검토 서비스를 간편하게 예약하세요.
              </p>

              <div className="contact-card-list-bright">
                <div className="contact-bright-card">
                  <Phone className="contact-card-icon" />
                  <div className="contact-card-text">
                    <span className="card-lbl">실시간 직통 견적 전화</span>
                    <span className="card-val highlight-gold">02-487-9775</span>
                  </div>
                </div>

                <div className="contact-bright-card">
                  <MapPin className="contact-card-icon" />
                  <div className="contact-card-text">
                    <span className="card-lbl">공식 본사 전시장</span>
                    <span className="card-val">경기 하남시 서하남로 37</span>
                  </div>
                </div>

                <div className="contact-bright-card">
                  <Clock className="contact-card-icon" />
                  <div className="contact-card-text">
                    <span className="card-lbl">상담 및 운영 시간</span>
                    <span className="card-val">평일 07:00 - 18:00 / 주말 07:00 - 12:00</span>
                  </div>
                </div>
              </div>

              <div className="contact-actions-row">
                <a href="tel:02-487-9775" className="btn-contact-gold">
                  <Phone size={16} /> 전화 문의
                </a>
                <button className="btn-contact-outline" onClick={() => nav("/estimate/request")}>
                  <FileText size={16} /> 온라인 견적요청
                </button>
                <button className="btn-contact-outline" onClick={() => nav("/samplebooks")}>
                  <BookOpen size={16} /> 샘플북 보기
                </button>
              </div>
            </div>

            {/* Quick Consultation Booking Form */}
            <div className="contact-form-box-bright">
              <h3>간편 상담 접수</h3>
              <p>기본 연락처와 현장 정보를 남겨주시면 시공 부서 담당자가 즉시 연락을 드립니다.</p>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                alert("상담 접수가 신속하게 완료되었습니다. 담당실장이 곧 연락드리겠습니다.");
                e.target.reset();
              }} className="showroom-quick-form">
                <div className="form-group-bright">
                  <label htmlFor="user-name">이름 / 상호명</label>
                  <input type="text" id="user-name" required placeholder="성함 또는 기업명을 입력하세요" />
                </div>
                <div className="form-group-bright">
                  <label htmlFor="user-phone">연락처</label>
                  <input type="tel" id="user-phone" required placeholder="연락처를 입력하세요 (예: 010-0000-0000)" />
                </div>
                <div className="form-group-bright">
                  <label htmlFor="user-content">시공 및 견적 메모 (선택)</label>
                  <textarea id="user-content" rows="4" placeholder="시공하실 평수나 자재 등을 간단히 적어주세요."></textarea>
                </div>
                <button type="submit" className="form-submit-gold-btn">
                  상담 신청하기
                </button>
              </form>
            </div>

          </div>
        </section>

      </div>
    </MainLayout>
  );
}
