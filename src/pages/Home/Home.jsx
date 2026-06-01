import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { 
  ShieldCheck, 
  Wrench, 
  Truck, 
  Award, 
  ChevronRight 
} from "lucide-react";
import "./Home.css";

export default function Home() {
  const nav = useNavigate();

  // 6 main categories with images and paths
  const categories = [
    { name: "데코타일", image: "/images/deco_tile.png", path: "/materials?category=데코타일" },
    { name: "장판", image: "/images/cross_section.png", path: "/materials?category=장판" },
    { name: "마루", image: "/images/spc_flooring.png", path: "/materials?category=마루" },
    { name: "벽지", image: "/images/premium_wallpaper.png", path: "/materials?category=벽지" },
    { name: "카페트타일", image: "/images/carpet_tile.png", path: "/materials?category=카페트타일" },
    { name: "부자재", image: "/images/interlocking_profile.png", path: "/materials?category=부자재" }
  ];

  return (
    <MainLayout>
      <div className="home-page-container">
        
        {/* ==========================================
           1. Main Hero Section
           ========================================== */}
        <section className="premium-hero-section">
          <div className="hero-content-row">
            
            {/* Left Content Column */}
            <div className="hero-left-column">
              <span className="hero-eyebrow-label">FLOORING & INTERIOR MATERIALS</span>
              <h1 className="hero-main-title">
                바닥재 시공,<br />
                자재부터 현장까지 한 번에
              </h1>
              <p className="hero-description-paragraph">
                동경바닥재는 장판 · 데코타일 · 마루 · 벽지 · 카페트타일을 전문 공급하며,<br />
                전국의 시공 현장에 맞는 자재 제안과 시공 솔루션을 제공합니다.
              </p>
              
              <div className="hero-action-buttons">
                <button className="btn-hero-primary" onClick={() => nav("/estimate/request")}>
                  견적 요청하기 <span className="arrow-icon">&gt;</span>
                </button>
                <button className="btn-hero-secondary" onClick={() => nav("/materials")}>
                  자재 둘러보기 <span className="arrow-icon">&gt;</span>
                </button>
              </div>

              {/* Feature Points inside Hero section */}
              <div className="hero-feature-points-row">
                <div className="feat-item">
                  <div className="feat-icon-circle">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="feat-texts">
                    <span className="feat-title">정품 자재 공급</span>
                    <span className="feat-desc">검증된 브랜드 · 품질 보장</span>
                  </div>
                </div>

                <div className="feat-item">
                  <div className="feat-icon-circle">
                    <Wrench size={18} />
                  </div>
                  <div className="feat-texts">
                    <span className="feat-title">전문 시공팀</span>
                    <span className="feat-desc">경험 많은 시공 전문가</span>
                  </div>
                </div>

                <div className="feat-item">
                  <div className="feat-icon-circle">
                    <Truck size={18} />
                  </div>
                  <div className="feat-texts">
                    <span className="feat-title">전국 시공 지원</span>
                    <span className="feat-desc">전국 어디든 빠른 대응</span>
                  </div>
                </div>

                <div className="feat-item">
                  <div className="feat-icon-circle">
                    <Award size={18} />
                  </div>
                  <div className="feat-texts">
                    <span className="feat-title">맞춤 견적 서비스</span>
                    <span className="feat-desc">현장 맞춤 · 합리적 견적</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Image Column */}
            <div className="hero-right-column">
              <div className="hero-image-frame">
                <img 
                  src="/images/premium_living_room.png" 
                  alt="Premium interior living room finished with luxury wood flooring and clean minimalist decor" 
                  className="hero-display-image"
                />
              </div>
            </div>

          </div>
        </section>

        {/* ==========================================
           2. Main Category Section
           ========================================== */}
        <section className="premium-category-section">
          <div className="category-layout-row">
            
            {/* Title block */}
            <div className="category-title-block">
              <h2 className="cat-section-title">주요 자재 카테고리</h2>
              <p className="cat-section-desc">현장에 딱 맞는 자재를 빠르게 찾아보세요.</p>
              <div className="cat-arrow-circle" onClick={() => nav("/materials")}>
                <ChevronRight size={18} />
              </div>
            </div>

            {/* Grid block */}
            <div className="category-cards-grid">
              {categories.map((cat, idx) => (
                <div key={idx} className="category-card-item" onClick={() => nav(cat.path)}>
                  <div className="cat-img-box">
                    <img src={cat.image} alt={`${cat.name} material sample texture preview`} className="cat-bg-img" />
                  </div>
                  <div className="cat-card-info">
                    <span className="cat-card-name">{cat.name}</span>
                    <span className="cat-card-link">보기 &gt;</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ==========================================
           3. Brand Value Section
           ========================================== */}
        <section className="premium-value-section">
          <div className="value-cards-row">
            
            <div className="value-card-box">
              <div className="value-icon-wrapper">
                <Truck size={24} />
              </div>
              <h3 className="value-card-title">자재 직공급</h3>
              <p className="value-card-desc">
                LX, KCC 등 주요 브랜드<br />
                신뢰할 수 있는 정품 자재만 공급
              </p>
            </div>

            <div className="value-card-box">
              <div className="value-icon-wrapper">
                <Wrench size={24} />
              </div>
              <h3 className="value-card-title">전문 시공팀</h3>
              <p className="value-card-desc">
                경력 10년 이상의 베테랑<br />
                체계적인 시공으로 완성도 높은 결과 제공
              </p>
            </div>

            <div className="value-card-box">
              <div className="value-icon-wrapper">
                <ShieldCheck size={24} />
              </div>
              <h3 className="value-card-title">현장 맞춤 견적</h3>
              <p className="value-card-desc">
                수도권 무료 방문 실측 및<br />
                투명한 견적 시스템
              </p>
            </div>

          </div>
        </section>

      </div>
    </MainLayout>
  );
}
