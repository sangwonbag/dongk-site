import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { materials } from "../../data/materials.db";
import { imageManifest } from "../../data/imageManifest";
import MaterialCard from "../../components/material/MaterialCard";
import InteractiveApartmentHero from "../../components/hero/InteractiveApartmentHero";
import { 
  MapPin, 
  Phone, 
  Clock, 
  Home as HomeIcon, 
  Store, 
  Briefcase, 
  Sparkles,
  Layers,
  FileText,
  ChevronRight
} from "lucide-react";
import "./Home.css";

export default function Home() {
  const nav = useNavigate();

  // Get random KCC/Dongshin recommended items
  const recommendedMaterials = useMemo(() => {
    const normalize = (str) => str ? str.replace(/[^a-zA-Z0-9가-힣]/g, '').toUpperCase() : "";
    
    const seenCodes = new Set();
    const pool = materials.filter(m => {
      if (m.brand !== 'KCC' && m.brand !== '동신') return false;
      if (seenCodes.has(m.code)) return false;
      
      const key = normalize(m.code);
      const entry = imageManifest[key];
      const hasImage = !!(entry?.thumbnail);
      
      if (hasImage) {
        if (entry.thumbnail.includes("no-image") || entry.thumbnail.includes("placeholder")) return false;
        seenCodes.add(m.code);
        return true;
      }
      return false;
    });

    if (pool.length === 0) return [];

    const weightedPool = pool.map(m => {
      const key = normalize(m.code);
      const hasSpace = (imageManifest[key]?.images?.length > 1) ? 2 : 1; 
      const indexWeight = materials.indexOf(m) / materials.length; 
      return { 
        item: m, 
        weight: (hasSpace * 10) + indexWeight
      };
    });

    const shuffled = weightedPool
      .sort((a, b) => (Math.random() * b.weight) - (Math.random() * a.weight))
      .map(entry => entry.item);

    return shuffled.slice(0, 9);
  }, []);

  return (
    <MainLayout>
      <div className="home-page">
        {/* ==========================================
           1. Interactive 3D/Panorama Hero Section
           ========================================== */}
        <InteractiveApartmentHero />

        <div className="container">
          {/* ==========================================
             2. Major Construction Areas (주요 시공 분야)
             ========================================== */}
          <section className="home-section">
            <div className="section-header-centered">
              <span className="section-tag">Construction Areas</span>
              <h2>주요 시공 분야</h2>
              <p>동경바닥재는 각 현장의 목적과 환경에 특화된 다양한 공간 시공 노하우를 갖추고 있습니다.</p>
            </div>

            <div className="area-grid">
              <div className="area-card">
                <div className="area-icon-container">
                  <HomeIcon size={28} />
                </div>
                <h3 className="area-title">주거 공간 시공</h3>
                <p className="area-desc">
                  아파트, 빌라, 단독주택을 위한 시공입니다. 친환경 강마루, 내구성이 뛰어난 소리잠 장판 등 가족의 안전과 편안함을 우선한 바닥 및 벽지를 제안합니다.
                </p>
              </div>

              <div className="area-card">
                <div className="area-icon-container">
                  <Store size={28} />
                </div>
                <h3 className="area-title">상업 공간 시공</h3>
                <p className="area-desc">
                  카페, 식당, 매장, 학원 등 유동인구가 많은 상업 현장입니다. 통행 마찰에 강하고 트렌디한 디자인의 데코타일 및 빈티지 타일을 조화롭게 설계합니다.
                </p>
              </div>

              <div className="area-card">
                <div className="area-icon-container">
                  <Briefcase size={28} />
                </div>
                <h3 className="area-title">사무 공간 시공</h3>
                <p className="area-desc">
                  일반 사무실, 지식산업센터, 오피스 빌딩입니다. 정전기 방지, 소음 차단, 부분 보수가 편리한 프리미엄 카페트타일 및 OA타일 위주로 쾌적한 오피스를 구축합니다.
                </p>
              </div>

              <div className="area-card">
                <div className="area-icon-container">
                  <Sparkles size={28} />
                </div>
                <h3 className="area-title">의료 및 교육 시공</h3>
                <p className="area-desc">
                  병원, 요양원, 어린이집, 학교 등 엄격한 위생 기준이 적용되는 곳입니다. 항균 처리된 방염 장판과 벽지, 미끄럼 방지 안전 러버타일을 전문 시공합니다.
                </p>
              </div>
            </div>
          </section>

          {/* ==========================================
             3. Material Categories (자재 카테고리)
             ========================================== */}
          <section className="home-section">
            <div className="section-header-centered">
              <span className="section-tag">Materials</span>
              <h2>취급 자재 카테고리</h2>
              <p>동경바닥재에서 취급하는 고품질 자재 라인업을 카테고리별로 간편하게 살펴보실 수 있습니다.</p>
            </div>

            <div className="category-card-grid">
              <div className="category-card" onClick={() => nav("/materials?category=데코타일")}>
                <div className="cat-icon"><Layers size={32} /></div>
                <span className="cat-name">데코타일</span>
              </div>
              <div className="category-card" onClick={() => nav("/materials?category=장판")}>
                <div className="cat-icon"><Layers size={32} /></div>
                <span className="cat-name">장판</span>
              </div>
              <div className="category-card" onClick={() => nav("/materials?category=마루")}>
                <div className="cat-icon"><Layers size={32} /></div>
                <span className="cat-name">마루</span>
              </div>
              <div className="category-card" onClick={() => nav("/materials?category=벽지")}>
                <div className="cat-icon"><Layers size={32} /></div>
                <span className="cat-name">벽지</span>
              </div>
              <div className="category-card" onClick={() => nav("/materials?category=카페트타일")}>
                <div className="cat-icon"><Layers size={32} /></div>
                <span className="cat-name">카페트타일</span>
              </div>
              <div className="category-card" onClick={() => nav("/materials?category=러버타일")}>
                <div className="cat-icon"><Layers size={32} /></div>
                <span className="cat-name">러버타일</span>
              </div>
            </div>
          </section>

          {/* ==========================================
             4. Recommended Materials (추천 자재 - 기존 유지)
             ========================================== */}
          <section className="home-section recommended-section">
            <div className="section-header">
              <h2>동경 추천 자재</h2>
              <button className="more-btn" onClick={() => nav("/materials")}>
                전체 자재 보기 <ChevronRight size={16} style={{ verticalAlign: 'middle' }} />
              </button>
            </div>

            <div className="product-grid">
              {recommendedMaterials.map((m) => (
                <MaterialCard key={m.id} material={m} />
              ))}
            </div>
          </section>

          {/* ==========================================
             5. Construction Cases (시공 사례)
             ========================================== */}
          <section className="home-section">
            <div className="section-header-centered">
              <span className="section-tag">Portfolio</span>
              <h2>최신 시공 사례</h2>
              <p>동경바닥재 전문 시공팀이 직접 꼼꼼하게 마감한 실제 인테리어 현장 포트폴리오입니다.</p>
            </div>

            <div className="case-grid">
              <div className="case-card">
                <div className="case-image">
                  <img src="/images/banner1.png" alt="마포 래미안 아파트 마루 시공" />
                  <span className="case-tag">주거 시공</span>
                </div>
                <div className="case-info">
                  <h3 className="case-title">마포 래미안 푸르지오 아파트</h3>
                  <p className="case-desc">이건 강마루 세라 베이직 오크 자재 사용. 편안하고 자연스러운 친환경 거실 원목 무늬 바닥 완공.</p>
                  <div className="case-meta">
                    <span>규격: 112㎡ (34평형)</span>
                    <span>시공: 이건 강마루</span>
                  </div>
                </div>
              </div>

              <div className="case-card">
                <div className="case-image">
                  <img src="/images/banner2.png" alt="성수동 베이커리 카페 데코타일 시공" />
                  <span className="case-tag">상업 시공</span>
                </div>
                <div className="case-info">
                  <h3 className="case-title">성수동 크리에이티브 베이커리 카페</h3>
                  <p className="case-desc">동신 아트타일 600각 콘크리트 디자인 적용. 스크래치와 마모를 최소화하는 강화 코팅 공법 적용.</p>
                  <div className="case-meta">
                    <span>규격: 85㎡ (25평)</span>
                    <span>시공: 동신 데코타일</span>
                  </div>
                </div>
              </div>

              <div className="case-card">
                <div className="case-image">
                  <img src="/images/banner3.png" alt="여의도 오피스 카페트타일 시공" />
                  <span className="case-tag">사무 시공</span>
                </div>
                <div className="case-info">
                  <h3 className="case-title">여의도 금융 핀테크 사무실 회의실</h3>
                  <p className="case-desc">스완 롤카페트 및 사각 카페트타일 하이브리드 교차 시공. 업무 소음을 분산시키고 보행감이 매우 우수함.</p>
                  <div className="case-meta">
                    <span>규격: 150㎡ (45평)</span>
                    <span>시공: 스완 카페트타일</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ==========================================
             6. Estimate CTA Banner (견적 요청 배너)
             ========================================== */}
          <section className="home-section">
            <div className="estimate-cta-banner">
              <div className="cta-content">
                <h2>우리 현장 맞춤형 견적을 받아보세요</h2>
                <p>
                  아파트 거실부터 상가 빌딩 전체 리모델링까지, 전문 실측 가이드와 자재 스펙을 바탕으로 투명하고 직관적인 견적서를 무료로 빠르게 제공합니다.
                </p>
                <button className="btn-cta-estimate" onClick={() => nav("/estimate/request")}>
                  <FileText size={20} style={{ marginRight: '8px' }} /> 무료 현장 견적 상담하기
                </button>
              </div>
            </div>
          </section>

          {/* ==========================================
             7. Directions & Inquiry (오시는 길 / 상담 문의)
             ========================================== */}
          <section className="home-section">
            <div className="section-header-centered">
              <span className="section-tag">Location & Contact</span>
              <h2>찾아오시는 길 & 상담 문의</h2>
              <p>동경바닥재 사무실 방문 예약 및 전화/카카오톡을 통해 빠른 전문 견적 상담을 받아보세요.</p>
            </div>

            <div className="contact-grid">
              <div className="contact-info-card">
                <div className="info-item">
                  <div className="info-icon">
                    <MapPin size={20} />
                  </div>
                  <div className="info-details">
                    <h3>오시는 길 (본사/전시장)</h3>
                    <p>경기도 고양시 덕양구 덕은동 (상세 주소는 방문 예약 시 안내)</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <Phone size={20} />
                  </div>
                  <div className="info-details">
                    <h3>전화/팩스 상담</h3>
                    <p>전화: <a href="tel:01055555555">010-XXXX-XXXX</a> / <a href="tel:0319999999">031-999-9999</a></p>
                    <p>이메일: contact@dongkfloor.com</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <Clock size={20} />
                  </div>
                  <div className="info-details">
                    <h3>상담 및 영업시간</h3>
                    <p>평일: 09:00 ~ 18:00</p>
                    <p>토요일: 09:00 ~ 13:00 (사전 방문 예약 필수)</p>
                    <p>일요일 및 공휴일 휴무</p>
                  </div>
                </div>
              </div>

              {/* Stylish Google Map embed placeholder pointing generally to Deogun-dong */}
              <div className="map-placeholder">
                <iframe 
                  title="Dongkyung Flooring Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12651.986629910543!2d126.86616428616147!3d37.58550186981881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357c994ad5e4dfa9%3A0xe5a3c5a63c6be1e6!2z6rK96riw64-EIOqzoOyWkey5nCDrjZXslpHqtawg642V7J2A64-Z!5e0!3m2!1sko!2skr!4v1716382000000!5m2!1sko!2skr"
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
