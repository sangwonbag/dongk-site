import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { fetchAllProducts } from "../../utils/supabaseFetcher";
import { getSupabaseImageUrl } from "../../utils/getSupabaseImageUrl";
import { useEstimateCart } from "../../contexts/EstimateCartContext";
import { 
  ChevronRight, 
  Search, 
  ArrowRight, 
  CheckCircle,
  Calculator,
  ShoppingBag,
  Sparkles,
  Layers,
  Building,
  Home as HomeIcon,
  Shield,
  Truck
} from "lucide-react";
import "./Home.css";

export default function Home() {
  const nav = useNavigate();
  const { addToCart } = useEstimateCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Space recommendation tab state
  const [activeSpaceTab, setActiveSpaceTab] = useState("거실");

  // Auto Estimate Widget State
  const [estSpaceType, setEstSpaceType] = useState("거실");
  const [estPyeong, setEstPyeong] = useState(20);
  const [estMaterialCategory, setEstMaterialCategory] = useState("장판");
  const [estBrand, setEstBrand] = useState("LX");
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchAllProducts();
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to load products for Home:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Popular items (Pick top 8 products across categories)
  const popularProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    // Select diverse products with valid images
    return products.slice(0, 8);
  }, [products]);

  // Space Filtered Products
  const spaceFilteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    if (activeSpaceTab === "사무실") {
      return products.filter(p => p.category === "데코타일" || p.category === "카페트타일").slice(0, 4);
    }
    if (activeSpaceTab === "상업공간" || activeSpaceTab === "학원" || activeSpaceTab === "병원") {
      return products.filter(p => p.category === "데코타일" || p.category === "장판").slice(0, 4);
    }
    if (activeSpaceTab === "원룸") {
      return products.filter(p => p.category === "장판" || p.category === "벽지").slice(0, 4);
    }
    return products.filter(p => p.category === "마루" || p.category === "장판" || p.category === "벽지").slice(0, 4);
  }, [products, activeSpaceTab]);

  // Auto Estimate Calculation
  const estCalculation = useMemo(() => {
    const p = Math.max(1, Number(estPyeong) || 1);
    let basePricePerPyeong = 25000;
    let unitLabel = "평";
    let neededUnits = p;

    if (estMaterialCategory === "장판") {
      basePricePerPyeong = 35000; // LX/KCC 장판 평균
    } else if (estMaterialCategory === "데코타일") {
      basePricePerPyeong = 27000; // 데코타일 평당
    } else if (estMaterialCategory === "마루") {
      basePricePerPyeong = 68000; // 강마루 평당
    } else if (estMaterialCategory === "카페트타일") {
      basePricePerPyeong = 55000;
    } else if (estMaterialCategory === "벽지") {
      basePricePerPyeong = 18000;
    }

    const materialCost = Math.round(p * basePricePerPyeong);
    const subMaterialCost = Math.round(p * 3500); // 본드/부자재 약 평당 3.5천원
    const totalCost = materialCost + subMaterialCost;

    return {
      neededUnits,
      materialCost,
      subMaterialCost,
      totalCost
    };
  }, [estPyeong, estMaterialCategory]);

  const handleAddEstToCart = () => {
    addToCart({
      id: `est-${Date.now()}`,
      name: `${estBrand} ${estMaterialCategory} (${estSpaceType} ${estPyeong}평 견적 세트)`,
      brand: estBrand,
      category: estMaterialCategory,
      code: `EST-${estPyeong}PY`,
      price: estCalculation.totalCost,
      quantity: 1,
      unit: "세트"
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  return (
    <MainLayout>
      <div className="spruce-showroom-home">
        
        {/* ================= 1. HERO SECTION ================= */}
        <section className="spruce-hero-section">
          <div className="hero-bg-overlay"></div>
          <div className="container hero-content">
            <span className="hero-category-tag">장판 · 데코타일 · 마루 · 벽지 · 카페트타일</span>
            <h1 className="hero-headline">
              좋은 공간은<br />
              좋은 바닥에서 시작됩니다.
            </h1>
            <p className="hero-subtext">
              엄선된 고품질 바닥재와 정확한 자재 가격. 동경바닥재 쇼룸에서 공간에 딱 맞는 자재를 찾아보세요.
            </p>
            <div className="hero-actions">
              <button className="spruce-btn-primary" onClick={() => nav("/materials")}>
                자재 찾아보기
              </button>
              <button className="spruce-btn-secondary" onClick={() => nav("/estimate-request")}>
                자동견적
              </button>
            </div>
          </div>
        </section>

        {/* ================= 2. CORE VALUE BARS ================= */}
        <section className="spruce-values-section">
          <div className="container">
            <div className="values-grid">
              <div className="value-card">
                <span className="value-num">01</span>
                <h3>다양한 자재</h3>
                <p>장판부터 마루, 데코타일, 벽지까지 한 곳에서 편리하게 비교하세요.</p>
              </div>
              <div className="value-card">
                <span className="value-num">02</span>
                <h3>정확한 가격</h3>
                <p>실제 투명한 판매단가 기준으로 수량과 예산을 빠르게 확인하세요.</p>
              </div>
              <div className="value-card">
                <span className="value-num">03</span>
                <h3>빠른 주문</h3>
                <p>필요한 자재와 수량을 선택하고 간편하게 바로 주문하세요.</p>
              </div>
              <div className="value-card">
                <span className="value-num">04</span>
                <h3>시공까지</h3>
                <p>자재 단품 공급부터 20년 노하우의 전문 시공까지 한 번에 연결해 드립니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 3. CATEGORY SECTION ("무엇을 찾고 계세요?") ================= */}
        <section className="spruce-category-section">
          <div className="container">
            <div className="section-header">
              <h2>무엇을 찾고 계세요?</h2>
              <p>바닥재와 벽지 형태별 카테고리</p>
            </div>

            <div className="category-showroom-grid">
              <Link to="/materials?category=데코타일" className="cat-card cat-decotile">
                <div className="cat-img-box">
                  <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" alt="데코타일" />
                </div>
                <div className="cat-info">
                  <h3>데코타일</h3>
                  <span>우드 / 사각 / 600각</span>
                </div>
              </Link>

              <Link to="/materials?category=장판" className="cat-card cat-jangpan">
                <div className="cat-img-box">
                  <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80" alt="장판" />
                </div>
                <div className="cat-info">
                  <h3>장판</h3>
                  <span>1.8T / 2.0T / 2.2T / 4.5T</span>
                </div>
              </Link>

              <Link to="/materials?category=마루" className="cat-card cat-maru">
                <div className="cat-img-box">
                  <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80" alt="마루" />
                </div>
                <div className="cat-info">
                  <h3>마루</h3>
                  <span>강마루 / 강화마루 / 스퀘어</span>
                </div>
              </Link>

              <Link to="/materials?category=벽지" className="cat-card cat-wallpaper">
                <div className="cat-img-box">
                  <img src="https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80" alt="벽지" />
                </div>
                <div className="cat-info">
                  <h3>벽지</h3>
                  <span>실크 / 합지 / 방염 / 디아망</span>
                </div>
              </Link>

              <Link to="/materials?category=카페트타일" className="cat-card cat-carpet full-width">
                <div className="cat-img-box">
                  <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80" alt="카페트타일" />
                </div>
                <div className="cat-info">
                  <h3>카페트타일</h3>
                  <span>LX L9300 / L1000 / 스완 / 코오롱</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ================= 4. SPACE RECOMMENDATIONS ("공간별 추천") ================= */}
        <section className="spruce-space-section">
          <div className="container">
            <div className="section-header center">
              <h2>공간에 맞는 자재를 찾아보세요</h2>
              <p>주거 공간부터 상업/사무실까지 최적화된 자재 추천</p>
            </div>

            <div className="space-tabs">
              {["거실", "상업공간", "사무실", "학원", "병원", "원룸"].map(tab => (
                <button
                  key={tab}
                  className={`space-tab-btn ${activeSpaceTab === tab ? "active" : ""}`}
                  onClick={() => setActiveSpaceTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-products-grid">
              {spaceFilteredProducts.map(p => (
                <div key={p.id} className="spruce-product-card" onClick={() => nav(`/materials/${p.id}`)}>
                  <div className="card-thumb">
                    <img src={getSupabaseImageUrl(p.thumbnail)} alt={p.name} />
                    <div className="hover-btn">상세보기</div>
                  </div>
                  <div className="card-body">
                    <span className="brand-name">{p.brand}</span>
                    <h4 className="prod-title">{p.name}</h4>
                    <div className="price-row">
                      <span className="price">{Number(p.price).toLocaleString()}원</span>
                      {p.unit && <span className="unit">/ {p.unit}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-more-btn-row">
              <button className="spruce-btn-outline" onClick={() => nav(`/materials?search=${activeSpaceTab}`)}>
                {activeSpaceTab} 추천 자재 전체보기 <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* ================= 5. POPULAR PRODUCTS ("많이 찾는 자재") ================= */}
        <section className="spruce-popular-section">
          <div className="container">
            <div className="section-header-row">
              <div>
                <h2>많이 찾는 자재</h2>
                <p>인기 브랜드의 검증된 자재들을 만나보세요</p>
              </div>
              <Link to="/materials" className="view-all-link">전체 자재 보기 →</Link>
            </div>

            <div className="popular-products-grid">
              {popularProducts.map(p => (
                <div key={p.id} className="spruce-product-card" onClick={() => nav(`/materials/${p.id}`)}>
                  <div className="card-thumb">
                    <img src={getSupabaseImageUrl(p.thumbnail)} alt={p.name} />
                    <div className="hover-btn">상세보기</div>
                  </div>
                  <div className="card-body">
                    <span className="brand-name">{p.brand}</span>
                    <h4 className="prod-title">{p.name}</h4>
                    <div className="price-row">
                      <span className="price">{Number(p.price).toLocaleString()}원</span>
                      {p.unit && <span className="unit">/ {p.unit}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= 6. BRAND SHOWCASE SECTION ("BRANDS") ================= */}
        <section className="spruce-brands-section">
          <div className="container">
            <div className="section-header center">
              <h2>BRANDS</h2>
              <p>대한민국 대표 바닥재 & 벽지 제조사 공식 브랜드</p>
            </div>

            <div className="brands-showcase-grid">
              <div className="brand-showcase-card">
                <div className="brand-hero-img">
                  <img src="https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80" alt="LX" />
                </div>
                <div className="brand-content">
                  <h3>LX 하우시스</h3>
                  <p>Flooring & Wallpaper</p>
                  <button onClick={() => nav("/materials?brand=LX")}>제품 보기</button>
                </div>
              </div>

              <div className="brand-showcase-card">
                <div className="brand-hero-img">
                  <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80" alt="KCC" />
                </div>
                <div className="brand-content">
                  <h3>KCC 글라스</h3>
                  <p>Flooring & Tile</p>
                  <button onClick={() => nav("/materials?brand=KCC")}>제품 보기</button>
                </div>
              </div>

              <div className="brand-showcase-card">
                <div className="brand-hero-img">
                  <img src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80" alt="동화" />
                </div>
                <div className="brand-content">
                  <h3>동화자연마루</h3>
                  <p>Flooring & Wall</p>
                  <button onClick={() => nav("/materials?brand=동화")}>제품 보기</button>
                </div>
              </div>

              <div className="brand-showcase-card">
                <div className="brand-hero-img">
                  <img src="https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80" alt="신한" />
                </div>
                <div className="brand-content">
                  <h3>신한벽지</h3>
                  <p>Wallpaper</p>
                  <button onClick={() => nav("/materials?brand=신한")}>제품 보기</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 7. HOW IT WORKS ("동경바닥재 이용방법") ================= */}
        <section className="spruce-how-section">
          <div className="container">
            <div className="section-header center">
              <h2>동경바닥재 이용방법</h2>
              <p>빠르고 명확한 자재 구매 및 시공 가이드</p>
            </div>

            <div className="how-steps-grid">
              <div className="how-step-card">
                <span className="step-num">01</span>
                <h3>자재를 찾습니다</h3>
                <p>제품명 / 품번 / 브랜드 / 규격으로 빠르게 검색하고 비교하세요.</p>
              </div>

              <div className="how-step-card">
                <span className="step-num">02</span>
                <h3>수량을 선택합니다</h3>
                <p>시공할 평수 또는 박스 수량을 선택하고 실시간 견적을 확인합니다.</p>
              </div>

              <div className="how-step-card">
                <span className="step-num">03</span>
                <h3>주문합니다</h3>
                <p>계좌이체 또는 매장 방문 결제로 주문을 완료합니다.</p>
              </div>

              <div className="how-step-card">
                <span className="step-num">04</span>
                <h3>배송 및 수령</h3>
                <p>퀵 배송, 화물 수령, 매장 직접 방문수령을 선택합니다.</p>
              </div>

              <div className="how-step-card">
                <span className="step-num">05</span>
                <h3>전문 시공까지</h3>
                <p>자재 단순 구매뿐만 아니라 20년 경력 전문 시공팀 연결까지 한번에.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </MainLayout>
  );
}
