import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import NewsBannerSlider from "../../components/ui/NewsBannerSlider";
import { materials } from "../../data/materials.db";
import { imageManifest } from "../../data/imageManifest";
import homeBanners from "../../data/homeBanners.json";
import MaterialCard from "../../components/material/MaterialCard";
import "./Home.css";

export default function Home() {
  const nav = useNavigate();

  // Get random KCC recommended items
  const recommendedMaterials = useMemo(() => {
    const normalize = (str) => str ? str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : "";
    
    // 1. Filter: 브랜드 KCC + 카테고리 데코타일 + 실이미지 존재 + 중복 코드 제외
    const seenCodes = new Set();
    const pool = materials.filter(m => {
      if (m.brand !== 'KCC' || m.category !== '데코타일') return false;
      if (seenCodes.has(m.code)) return false;
      
      const key = normalize(m.code);
      const entry = imageManifest[key];
      const hasImage = !!(entry?.cover);
      
      if (hasImage) {
        // Exclude placeholders if they have a specific path
        if (entry.cover.includes("no-image") || entry.cover.includes("placeholder")) return false;
        
        seenCodes.add(m.code);
        return true;
      }
      return false;
    });

    if (pool.length === 0) return [];

    // 2. Weighting & Priority
    // - 실제 공간 시공 이미지가 있는 상품 우선 (gallery length > 1인 경우 시공 이미지 있을 확률 높음)
    // - 최근 추가된 상품 가중치 (materials 배열에서의 인덱스 활용)
    const weightedPool = pool.map(m => {
      const key = normalize(m.code);
      const hasSpace = (imageManifest[key]?.gallery?.length > 1) ? 2 : 1; 
      const indexWeight = materials.indexOf(m) / materials.length; 
      return { 
        item: m, 
        weight: (hasSpace * 10) + indexWeight // Space image gets significant boost
      };
    });

    // 3. Shuffle & Select 8
    const shuffled = weightedPool
      .sort((a, b) => (Math.random() * b.weight) - (Math.random() * a.weight))
      .map(entry => entry.item);

    return shuffled.slice(0, 6);
  }, []);

  return (
    <MainLayout>
      <div className="home-page">
        {/* News Banner Slider */}
        <NewsBannerSlider banners={homeBanners} />

        {/* ... remaining content ... */}

        <div className="container">
          {/* Recommended Section */}
          <section className="home-section recommended-section">
            <div className="section-header">
              <h2>추천 자재 (KCC)</h2>
              <button className="more-btn" onClick={() => nav("/materials?brand=KCC")}>
                전체 보기 →
              </button>
            </div>

            <div className="product-grid">
              {recommendedMaterials.map((m) => (
                <MaterialCard key={m.id} material={m} />
              ))}
            </div>
          </section>

          {/* Categories Quick Link */}
          <section className="home-section">
            {/* ... category logic ... */}
            <div className="section-header">
              <h2>카테고리</h2>
            </div>
            <div className="category-chips">
              <button onClick={() => nav("/materials?category=데코타일")}>데코타일</button>
              <button onClick={() => nav("/materials?category=장판")}>장판</button>
              <button onClick={() => nav("/materials?category=마루")}>마루</button>
              <button onClick={() => nav("/materials?category=벽지")}>벽지</button>
              <button onClick={() => nav("/materials?category=카페트타일")}>카페트타일</button>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
