import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import NewsBannerSlider from "../../components/ui/NewsBannerSlider";
import { materials } from "../../data/materials.db";
import homeBanners from "../../data/homeBanners.json";
import "./Home.css";

export default function Home() {
  const nav = useNavigate();

  // Get 3 random recommended items
  const recommended = materials.slice(0, 6);

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
              <h2>추천 자재</h2>
              <button className="more-btn" onClick={() => nav("/materials")}>
                전체 보기 →
              </button>
            </div>

            <div className="product-grid">
              {recommended.map((m) => (
                <div key={m.id} className="product-card" onClick={() => nav(`/materials`)}>
                  <div className="pc-thumb">
                    {/* Placeholder for real image */}
                    <span>{m.brand}</span>
                  </div>
                  <div className="pc-info">
                    <div className="pc-brand">{m.brand}</div>
                    <div className="pc-name">{m.name}</div>
                    <div className="pc-price">{(m.price || 0).toLocaleString()}원</div>
                    <div className="pc-specs">
                      {m.specs && (
                        <>
                          {m.specs.thickness} / {m.specs.size}
                        </>
                      )}
                    </div>
                  </div>
                </div>
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
