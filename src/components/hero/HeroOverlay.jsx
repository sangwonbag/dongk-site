import React from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Wrench, ShieldCheck } from "lucide-react";
import "./HeroOverlay.css";

export default function HeroOverlay() {
  const nav = useNavigate();

  return (
    <div className="hero-overlay-container">
      {/* Dark gradient shadow for high contrast text readability */}
      <div className="hero-text-shadow"></div>

      <div className="hero-content-wrapper">
        <div className="hero-main-content">
          <span className="hero-badge">Flooring & Interior Construction</span>
          <h1 className="hero-title">
            바닥재 시공,<br />
            자재부터 현장까지 한 번에
          </h1>
          <p className="hero-sub">
            동경바닥재는 장판 · 데코타일 · 마루 · 벽지 · 카페트타일을 전문 공급하며,<br />
            한국의 주거 및 상업 공간 환경에 꼭 맞는 완벽한 맞춤 시공 솔루션을 제공합니다.
          </p>
          <div className="hero-actions">
            <button className="hero-btn primary" onClick={() => nav("/estimate/request")}>
              견적 요청하기
            </button>
            <button className="hero-btn secondary" onClick={() => nav("/materials")}>
              자재 둘러보기
            </button>
          </div>
        </div>

        {/* Floating Trust Badges */}
        <div className="hero-trust-badges">
          <div className="badge-card" onClick={() => nav("/materials")}>
            <div className="badge-icon">
              <Truck size={22} />
            </div>
            <div className="badge-text">
              <span className="badge-title">자재 직공급</span>
              <span className="badge-desc">LX, KCC 등 유명 브랜드 친환경 정품 최저가 공급</span>
            </div>
          </div>

          <div className="badge-card" onClick={() => nav("/estimate/request")}>
            <div className="badge-icon">
              <Wrench size={22} />
            </div>
            <div className="badge-text">
              <span className="badge-title">전문 시공팀</span>
              <span className="badge-desc">경력 10년 이상의 베테랑 바닥 도배 전문 시공단 운영</span>
            </div>
          </div>

          <div className="badge-card" onClick={() => nav("/estimate/request")}>
            <div className="badge-icon">
              <ShieldCheck size={22} />
            </div>
            <div className="badge-text">
              <span className="badge-title">현장 맞춤 견적</span>
              <span className="badge-desc">수도권 무료 방문 실측 및 투명한 견적서 제공</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
