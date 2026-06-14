import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { 
  ChevronRight, 
  Phone, 
  ArrowRight, 
  BookOpen,
  FileText,
  CheckCircle,
  Layers,
  Inbox,
  Briefcase
} from "lucide-react";
import "./Home.css";

export default function Home() {
  const nav = useNavigate();

  // Scroll Reveal Observer for Premium Micro-Animations
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
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    reveals.forEach((el) => observer.observe(el));
    return () => {
      reveals.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Section D. Categories Data
  const categories = [
    { 
      name: "데코타일", 
      desc: "450각, 600각, 우드, 사각 제품", 
      path: "/materials?category=데코타일" 
    },
    { 
      name: "장판", 
      desc: "주거공간에 많이 쓰이는 PVC 바닥재", 
      path: "/materials?category=장판" 
    },
    { 
      name: "마루", 
      desc: "강마루, 강화마루, 원목 느낌 바닥재", 
      path: "/materials?category=마루" 
    },
    { 
      name: "벽지", 
      desc: "실크벽지, 합지, 프리미엄 벽지", 
      path: "/materials?category=벽지" 
    },
    { 
      name: "카페트타일", 
      desc: "상업공간, 사무실 바닥재", 
      path: "/materials?category=카페트타일" 
    },
    { 
      name: "부자재", 
      desc: "본드, 실리콘, 걸레받이, 분리대", 
      path: "/materials?category=부자재" 
    }
  ];

  // Section E. Recommendations Data
  const recommendations = [
    {
      brand: "KCC",
      type: "데코타일",
      name: "KCC 데코타일 센스타일",
      desc: "우수한 충격 흡수와 내마모성을 갖춘 고내구형 상업용 데코타일",
      path: "/materials?category=데코타일&brand=KCC"
    },
    {
      brand: "동신",
      type: "데코타일",
      name: "동신 데코타일 아코하우스",
      desc: "자연스러운 질감과 변형 없는 안정을 자랑하는 친환경 주거용 데코타일",
      path: "/materials?category=데코타일&brand=동신"
    },
    {
      brand: "유성",
      type: "데코타일",
      name: "유성 데코타일 피오네",
      desc: "대리석 느낌의 모던한 공간을 연출하는 프리미엄 사각 데코타일",
      path: "/materials?category=데코타일&brand=유성"
    },
    {
      brand: "LX하우시스",
      type: "벽지",
      name: "LX 벽지 지아패브릭",
      desc: "옥수수 유래 식물성 수지를 코팅한 친환경 프리미엄 실크벽지",
      path: "/materials?category=벽지&brand=LX"
    },
    {
      brand: "LX하우시스 (디아망)",
      type: "벽지",
      name: "디아망 벽지 프리미엄",
      desc: "입체적인 엠보가 살아있어 도장벽 같은 우아함을 주는 하이엔드 실크벽지",
      path: "/materials?category=벽지&brand=LX&line=디아망_LX_디아망"
    },
    {
      brand: "LX하우시스 (디아망)",
      type: "벽지",
      name: "디아망포티스 벽지",
      desc: "긁힘과 충격에 강한 특수 코팅이 추가된 프리미엄 디아망 벽지",
      path: "/materials?category=벽지&brand=LX"
    }
  ];

  return (
    <MainLayout>
      <div className="showroom-home-layout">
        
        {/* ==========================================
           A. Hero Section & B. Hero 우측 비주얼
           ========================================== */}
        <section className="showroom-hero-v4">
          <div className="hero-v4-container container">
            
            {/* Left Content Col */}
            <div className="hero-v4-content-col">
              <span className="hero-v4-eyebrow">DONGKYUNG FLOORING</span>
              <h1 className="hero-v4-title">
                공간을 바꾸는<br />
                바닥재·벽지 솔루션
              </h1>
              <p className="hero-v4-subtitle">
                동경바닥재는 데코타일, 장판, 마루, 벽지, 카페트타일 자재 판매부터 시공 상담까지 한 번에 연결합니다.
              </p>
              <p className="hero-v4-emphasis">
                20년 이상 현장 경험을 바탕으로 업자와 시공 현장에 맞는 자재를 빠르게 찾을 수 있습니다.
              </p>
              <div className="hero-v4-buttons">
                <button className="btn-hero-v4-dark" onClick={() => nav("/materials")}>
                  자재찾기
                </button>
                <button className="btn-hero-v4-beige" onClick={() => nav("/samplebooks")}>
                  샘플북 보기
                </button>
                <button className="btn-hero-v4-white" onClick={() => nav("/estimate/request")}>
                  자동견적 요청
                </button>
              </div>
            </div>

            {/* Right Visual Col (B - CSS-only elegant interior board panels) */}
            <div className="hero-v4-visual-col">
              <div className="interior-mood-board">
                <div className="board-decor-circle"></div>
                
                {/* Board 1: Deco Tile Board */}
                <div className="mood-panel deco-panel">
                  <span className="panel-badge">Deco Tile</span>
                  <div className="panel-texture tile-texture"></div>
                  <div className="panel-meta">
                    <h5>Modern Concrete Grey</h5>
                    <span>600 x 600 mm</span>
                  </div>
                </div>

                {/* Board 2: Wood Flooring Board */}
                <div className="mood-panel wood-panel">
                  <span className="panel-badge">Wood Floor</span>
                  <div className="panel-texture wood-texture"></div>
                  <div className="panel-meta">
                    <h5>Natural Oak Classic</h5>
                    <span>7.5T | Premium Wood</span>
                  </div>
                </div>

                {/* Board 3: Wallpaper Board */}
                <div className="mood-panel wallpaper-panel">
                  <span className="panel-badge gold-badge">Wallpaper</span>
                  <div className="panel-texture paper-texture"></div>
                  <div className="panel-meta">
                    <h5>Cream Plaster Silk</h5>
                    <span>Premium Diadem Line</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ==========================================
           C. Hero 하단 핵심 카드 3개
           ========================================== */}
        <section className="hero-bottom-cards container">
          <div className="bottom-cards-grid">
            <div className="bottom-card reveal">
              <div className="bottom-card-icon-box">
                <Layers size={22} />
              </div>
              <h3 className="bottom-card-title">자재 판매</h3>
              <p className="bottom-card-desc">데코타일, 장판, 마루, 벽지, 카페트타일을 현장에 맞게 확인할 수 있습니다.</p>
            </div>

            <div className="bottom-card reveal">
              <div className="bottom-card-icon-box">
                <BookOpen size={22} />
              </div>
              <h3 className="bottom-card-title">샘플북 확인</h3>
              <p className="bottom-card-desc">브랜드별 PDF 샘플북으로 색상과 제품 번호를 빠르게 비교합니다.</p>
            </div>

            <div className="bottom-card reveal">
              <div className="bottom-card-icon-box">
                <Briefcase size={22} />
              </div>
              <h3 className="bottom-card-title">시공 상담</h3>
              <p className="bottom-card-desc">현장 조건, 평수, 일정에 맞춰 자재와 시공 방향을 정리합니다.</p>
            </div>
          </div>
        </section>

        {/* ==========================================
           D. 자재 카테고리 섹션
           ========================================== */}
        <section className="home-category-section reveal">
          <div className="section-header-v4 container">
            <h2 className="section-title-v4">자재 카테고리</h2>
            <p className="section-desc-v4">
              현장에서 자주 찾는 바닥재와 벽지 자재를 빠르게 확인하세요.
            </p>
          </div>

          <div className="category-grid-v4 container">
            {categories.map((cat, idx) => (
              <div 
                key={idx} 
                className="category-card-v4" 
                onClick={() => nav(cat.path)}
              >
                <div className="category-card-header">
                  <span className="category-card-num">0{idx + 1}</span>
                  <h3 className="category-card-title">{cat.name}</h3>
                </div>
                <p className="category-card-desc">{cat.desc}</p>
                <span className="category-card-link">
                  자재 바로가기 <ChevronRight size={13} />
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ==========================================
           E. 추천 자재 섹션
           ========================================== */}
        <section className="home-recommend-section reveal">
          <div className="section-header-v4 container">
            <h2 className="section-title-v4">오늘의 추천 자재</h2>
            <p className="section-desc-v4">
              동경바닥재에서 자주 찾는 브랜드와 제품군입니다.
            </p>
          </div>

          <div className="recommend-grid-v4 container">
            {recommendations.map((rec, idx) => (
              <div 
                key={idx} 
                className="recommend-card-v4"
                onClick={() => nav(rec.path)}
              >
                <div className="recommend-card-header">
                  <span className="recommend-card-brand">{rec.brand}</span>
                  <span className="recommend-card-type">{rec.type}</span>
                </div>
                <h3 className="recommend-card-name">{rec.name}</h3>
                <p className="recommend-card-desc">{rec.desc}</p>
                <button className="btn-recommend-card-link">
                  자세히 보기 <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ==========================================
           F. 동경바닥재 소개 섹션
           ========================================== */}
        <section className="home-about-section reveal">
          <div className="about-container-v4 container">
            
            {/* Left intro text block */}
            <div className="about-text-col">
              <h2 className="about-title-v4">동경바닥재가<br />현장에 맞게 도와드립니다.</h2>
              <p className="about-desc-v4">
                자재 선택부터 시공 일정, 현장 조건 확인까지 바닥재와 벽지 작업에 필요한 과정을 더 쉽고 빠르게 정리합니다. 업자와 시공 현장에서 바로 사용할 수 있는 실용적인 구조를 목표로 합니다.
              </p>
            </div>

            {/* Right checklist highlights block */}
            <div className="about-points-col">
              <div className="about-point-item">
                <div className="about-point-icon">
                  <CheckCircle size={20} />
                </div>
                <span className="about-point-text">20년 이상 시공 경험</span>
              </div>

              <div className="about-point-item">
                <div className="about-point-icon">
                  <CheckCircle size={20} />
                </div>
                <span className="about-point-text">브랜드별 자재 비교</span>
              </div>

              <div className="about-point-item">
                <div className="about-point-icon">
                  <CheckCircle size={20} />
                </div>
                <span className="about-point-text">샘플북 PDF 확인</span>
              </div>

              <div className="about-point-item">
                <div className="about-point-icon">
                  <CheckCircle size={20} />
                </div>
                <span className="about-point-text">빠른 견적 요청</span>
              </div>

              <div className="about-point-item">
                <div className="about-point-icon">
                  <CheckCircle size={20} />
                </div>
                <span className="about-point-text">현장 중심 상담</span>
              </div>
            </div>

          </div>
        </section>

        {/* ==========================================
           G. 우측 고정 상담 박스 (Quick Floating Consult Box)
           ========================================== */}
        <div className="floating-consult-box-v4">
          <div className="floating-box-header">
            <h4>동경바닥재 상담</h4>
          </div>
          <div className="floating-box-body">
            <div className="consult-quick-links">
              <div className="quick-link-item">
                <span className="quick-bullet"></span>
                <span>자재 문의</span>
              </div>
              <div className="quick-link-item" onClick={() => nav("/samplebooks")}>
                <span className="quick-bullet"></span>
                <span className="clickable-link">샘플북 확인</span>
              </div>
              <div className="quick-link-item" onClick={() => nav("/estimate/request")}>
                <span className="quick-bullet"></span>
                <span className="clickable-link">자동견적 요청</span>
              </div>
            </div>
            <button className="btn-floating-action" onClick={() => nav("/estimate/request")}>
              견적 요청하기
            </button>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
