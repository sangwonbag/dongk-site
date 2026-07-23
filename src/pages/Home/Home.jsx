import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { KAKAO_CHAT_URL } from "../../constants/contact";
import { supabase } from "../../lib/supabaseClient";
import { sampleBooks } from "../../data/samplebooks.db";
import { materials } from "../../data/materials.db";
import { getThumbnailImage } from "../../utils/galleryUtils";
import { resolveMaterialImage } from "../../utils/materialImageResolver";
import { fetchAllProducts } from "../../utils/supabaseFetcher";
import { Skeleton } from "../../components/ui";
import { 
  ChevronRight, 
  Phone, 
  ArrowRight, 
  BookOpen,
  Download,
  Award,
  ShieldCheck,
  FileText,
  CheckCircle,
  Users,
  MapPin,
  Clock,
  Mail,
  Search,
  Layers,
  Wrench,
  Sparkles
} from "lucide-react";
import "./Home.css";
import BrandLogosCarousel from "../../components/home/BrandLogosCarousel";

// Mobile App Home View
const MobileHomeView = ({ nav, featuredItems, loading }) => {
  return (
    <div className="mobile-home-view">
      {/* 1. Top Search Bar */}
      <div className="mobile-home-search-section">
        <div className="mobile-home-search-bar" onClick={() => nav("/materials")}>
          <Search size={18} className="search-icon" />
          <span className="search-placeholder">상품명 또는 상품코드를 검색하세요</span>
        </div>
      </div>

      {/* 2. Category 4-Col Icon Grid */}
      <section className="mobile-app-category-section">
        <div className="mobile-app-category-grid">
          <Link to="/materials?category=데코타일" className="mobile-cat-icon-card">
            <div className="cat-icon-box bg-tile">🔳</div>
            <span className="cat-label">데코타일</span>
          </Link>
          <Link to="/materials?category=장판" className="mobile-cat-icon-card">
            <div className="cat-icon-box bg-jangpan">📜</div>
            <span className="cat-label">장판</span>
          </Link>
          <Link to="/materials?category=마루" className="mobile-cat-icon-card">
            <div className="cat-icon-box bg-maru">🪵</div>
            <span className="cat-label">마루</span>
          </Link>
          <Link to="/materials?category=벽지" className="mobile-cat-icon-card">
            <div className="cat-icon-box bg-wallpaper">🎨</div>
            <span className="cat-label">벽지</span>
          </Link>
          <Link to="/materials?category=카페트타일" className="mobile-cat-icon-card">
            <div className="cat-icon-box bg-carpet">🟩</div>
            <span className="cat-label">카페트타일</span>
          </Link>
          <Link to="/materials?category=부자재" className="mobile-cat-icon-card">
            <div className="cat-icon-box bg-sub">🧪</div>
            <span className="cat-label">부자재</span>
          </Link>
          <Link to="/samplebooks" className="mobile-cat-icon-card">
            <div className="cat-icon-box bg-sample">📖</div>
            <span className="cat-label">샘플북</span>
          </Link>
          <Link to="/cases" className="mobile-cat-icon-card">
            <div className="cat-icon-box bg-cases">🏢</div>
            <span className="cat-label">시공사례</span>
          </Link>
        </div>
      </section>

      {/* 3. Core Banners */}
      <section className="mobile-home-banners-section">
        <div className="mobile-banners-carousel">
          <div className="mobile-banner-card banner-experience">
            <span className="banner-badge">20년+ 노하우</span>
            <h3>20년 이상 전문 시공 경험</h3>
            <p>자재 이해와 현장 노하우로 정확하게 추천해 드립니다.</p>
          </div>
          <div className="mobile-banner-card banner-shipping">
            <span className="banner-badge badge-gold">데코타일 혜택</span>
            <h3>데코타일 50평 이상 무료배송</h3>
            <p>동일 브랜드 데코타일 50평 주문 시 화물지점/배송 혜택</p>
          </div>
          <div className="mobile-banner-card banner-consult">
            <span className="banner-badge">맞춤 서비스</span>
            <h3>자재 판매 & 전문 시공 상담</h3>
            <p>자재 구매부터 전문 시공 연계까지 원스톱 지원</p>
          </div>
        </div>
      </section>

      {/* 4. Recommended Materials */}
      <section className="mobile-home-products-section">
        <div className="mobile-section-header">
          <h2>추천 자재</h2>
          <Link to="/materials" className="link-more">전체보기 <ChevronRight size={16} /></Link>
        </div>
        <div className="mobile-product-grid">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            featuredItems.slice(0, 6).map((mat, idx) => (
              <FeaturedCard key={mat.id || idx} mat={mat} idx={idx} />
            ))
          )}
        </div>
      </section>

      {/* 5. Estimate Banner CTA */}
      <section className="mobile-home-cta-card">
        <h3>공간에 딱 맞는 자재 견적이 필요하신가요?</h3>
        <p>평수와 조건을 선택하면 1분 만에 자동견적을 산출해 드립니다.</p>
        <button className="btn-mobile-cta" onClick={() => nav("/estimate/request")}>
          자동견적 바로가기
        </button>
      </section>

      {/* 6. Brand Carousel Section */}
      <section className="mobile-home-brand-section">
        <div className="mobile-section-header">
          <h2>주요 취급 브랜드</h2>
        </div>
        <BrandLogosCarousel />
      </section>
    </div>
  );
};

// Dynamic featured material card component with asynchronous thumbnail resolver
const FeaturedCard = ({ mat, idx }) => {
  const navigate = useNavigate();
  const [imgUrl, setImgUrl] = useState("/images/no-image.svg");

  useEffect(() => {
    if (!mat) return;
    let isMounted = true;
    getThumbnailImage(mat).then((url) => {
      if (isMounted) {
        setImgUrl(url || "/images/no-image.svg");
      }
    }).catch(() => {
      if (isMounted) {
        setImgUrl("/images/no-image.svg");
      }
    });
    return () => { isMounted = false; };
  }, [mat]);

  if (!mat) return null;

  const formattedSpecs = mat.specs
    ? [mat.specs.thickness, mat.specs.size, mat.specs.packing].filter(Boolean).join(" · ")
    : mat.thickness || "";

  const desc = (() => {
    const lineStr = mat.line ? ` [${mat.line}]` : "";
    if (mat.brand === 'KCC') {
      return `KCC의 고품격 기술력이 담긴${lineStr} 데코타일 바닥재입니다.`;
    }
    if (mat.brand === '동신') {
      return `내마모성과 내오염성이 뛰어난 친환경 동신${lineStr} 데코타일입니다.`;
    }
    if (mat.brand === '유성') {
      return `세련된 패턴과 치수 안정성을 갖춘 유성${lineStr} 데코타일입니다.`;
    }
    return `${mat.brand}의 정품 ${mat.category} 자재입니다.`;
  })();

  const formattedPrice = mat.price && mat.price > 0 
    ? `${mat.price.toLocaleString()}원/평` 
    : "견적 문의";

  return (
    <div 
      className="featured-v2-card reveal"
      style={{ '--delay': `${idx * 80}ms` }}
      onClick={() => navigate(`/materials/${mat.id}`)}
    >
      <div className="featured-v2-img-frame">
        <img 
          src={imgUrl || "/images/no-image.svg"} 
          alt={mat.name} 
          className="featured-v2-img" 
          onError={(e) => { e.target.onerror = null; e.target.src = "/images/no-image.svg"; }}
          loading="lazy"
        />
        <span className="featured-v2-brand-badge">{mat.brand}</span>
      </div>
      <div className="featured-v2-body">
        <span className="featured-v2-cat-tag">{mat.category || "데코타일"}</span>
        <h3 className="featured-v2-name">{mat.name}</h3>
        {formattedSpecs && <p className="featured-v2-specs">{formattedSpecs}</p>}
        <p className="featured-v2-desc">{desc}</p>
        
        <div className="featured-v2-price-row">
          <span className="featured-v2-price">{formattedPrice}</span>
          <button className="featured-v2-btn" onClick={(e) => {
            e.stopPropagation();
            navigate(`/estimate/request?materialId=${mat.id}`);
          }}>
            견적 문의
          </button>
        </div>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="featured-v2-card skeleton-loading">
    <div className="featured-v2-img-frame" style={{ overflow: 'hidden', position: 'relative' }}>
      <Skeleton height="100%" />
    </div>
    <div className="featured-v2-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Skeleton width="40%" height="12px" />
      <Skeleton width="70%" height="18px" />
      <Skeleton width="90%" height="14px" />
      <Skeleton width="80%" height="14px" />
      <div className="featured-v2-price-row" style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="50px" height="18px" />
        <Skeleton width="70px" height="32px" radius="4px" />
      </div>
    </div>
  </div>
);

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
        loading="lazy"
      />
    </div>
  );
};

// Right Floating Quick Menu for Desktop & Bottom bar for Mobile
const QuickMenu = ({ cartCount }) => {
  const navigate = useNavigate();
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="desktop-quick-sidebar">
        <button className="quick-side-btn" onClick={() => navigate("/estimate/request")}>
          <span className="q-icon">📝</span>
          <span className="q-txt">견적 요청</span>
        </button>
        <a href="tel:02-487-9775" className="quick-side-btn">
          <span className="q-icon">📞</span>
          <span className="q-txt">전화 상담</span>
        </a>
        <a href={KAKAO_CHAT_URL} target="_blank" rel="noopener noreferrer" className="quick-side-btn kakao-bg">
          <span className="q-icon">💬</span>
          <span className="q-txt">카톡 상담</span>
        </a>
        <button className="quick-side-btn" onClick={() => navigate("/cart")} style={{ position: 'relative' }}>
          <span className="q-icon">🛒</span>
          <span className="q-txt">장바구니</span>
          {cartCount > 0 && <span className="quick-badge">{cartCount}</span>}
        </button>
        <button className="quick-side-btn scroll-top-btn" onClick={scrollToTop}>
          <span className="q-icon">▲</span>
          <span className="q-txt">맨 위로</span>
        </button>
      </div>

      <div className="mobile-quick-bottom-bar">
        <button className="mob-quick-btn" onClick={() => navigate("/estimate/request")}>
          <span>📝 견적요청</span>
        </button>
        <a href="tel:02-487-9775" className="mob-quick-btn">
          <span>📞 전화상담</span>
        </a>
        <a href={KAKAO_CHAT_URL} target="_blank" rel="noopener noreferrer" className="mob-quick-btn mob-kakao">
          <span>💬 카톡상담</span>
        </a>
        <button className="mob-quick-btn" onClick={() => navigate("/cart")} style={{ position: 'relative' }}>
          <span>🛒 장바구니 {cartCount > 0 && `(${cartCount})`}</span>
        </button>
      </div>
    </>
  );
};

export default function Home() {
  const nav = useNavigate();
  const [featuredPool, setFeaturedPool] = useState([]);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [isFeaturedError, setIsFeaturedError] = useState(false);
  const [dbProjects, setDbProjects] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // Fetch cart count from sessionStorage or estimate cart
  useEffect(() => {
    try {
      const cartData = localStorage.getItem("estimate_cart_items");
      if (cartData) {
        const parsed = JSON.parse(cartData);
        if (Array.isArray(parsed)) {
          setCartCount(parsed.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0));
        }
      }
    } catch (e) {
      console.warn("Failed to parse cart items count:", e);
    }
  }, []);

  // Fetch portfolio cases from Supabase
  useEffect(() => {
    async function loadProjects() {
      try {
        if (!supabase) return;
        const { data, error } = await supabase
          .from('construction_cases')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false })
          .limit(4);

        if (!error && data && data.length > 0) {
          const mapped = data.map(item => ({
            id: item.id,
            title: item.title,
            category: item.category || '시공사례',
            range: item.location || '현장 시공',
            material: item.material_summary || '동경바닥재 자재',
            image: item.main_image_url || '/images/home-interior/korea-apt-living-01.png'
          }));
          setDbProjects(mapped);
        }
      } catch (err) {
        console.warn('[Home] Failed to load projects from Supabase:', err);
      }
    }
    loadProjects();
  }, []);

  // Fetch Featured materials from Supabase
  useEffect(() => {
    let isMounted = true;
    setIsFeaturedLoading(true);
    setIsFeaturedError(false);

    async function loadFeatured() {
      let activeProducts = [];
      let fetchErrorOccurred = false;

      if (supabase) {
        try {
          const { data: rawChunk, error } = await supabase
            .from("products")
            .select(`
              *,
              categories ( id, name ),
              brands ( id, name )
            `)
            .eq("is_active", true)
            .in("brand_id", [1, 5, 6])
            .limit(100);

          if (!error && rawChunk && rawChunk.length > 0) {
            activeProducts = rawChunk;
          } else {
            if (error) fetchErrorOccurred = true;
            const { data: fallbackChunk, error: fallbackError } = await supabase
              .from("products")
              .select(`
                *,
                categories ( id, name ),
                brands ( id, name )
              `)
              .eq("is_active", true)
              .limit(100);

            if (!fallbackError && fallbackChunk && fallbackChunk.length > 0) {
              activeProducts = fallbackChunk;
            } else if (fallbackError) {
              fetchErrorOccurred = true;
            }
          }
        } catch (e) {
          fetchErrorOccurred = true;
        }
      }

      let mapped = [];
      if (activeProducts && activeProducts.length > 0) {
        mapped = activeProducts.map(p => ({
          id: p.slug || String(p.id),
          code: p.product_code || "",
          name: p.name || "",
          brand: p.brands?.name || p.brand || "",
          category: p.categories?.name || p.category || "",
          price: p.price || 0,
          thickness: p.thickness || "",
          specs: {
            thickness: p.thickness || "",
            size: p.size_text || "",
            packing: p.unit || ""
          },
          thumbnail: p.image_url || null,
          image: p.image_url || null,
          line: p.description || "",
          description: p.description || "",
          featured: p.is_featured || false,
          active: p.is_active ?? true
        }));
      }

      if (mapped.length === 0) {
        mapped = (materials || []).map(m => ({
          id: m.id || m.code,
          code: m.code || "",
          name: m.name || "",
          brand: m.brand || "",
          category: m.category || "",
          price: m.price || 0,
          thickness: m.thickness || "",
          specs: m.specs || {
            thickness: m.thickness || "",
            size: "",
            packing: ""
          },
          thumbnail: m.thumbnail || null,
          image: m.image || null,
          line: m.line || "",
          description: m.description || "",
          featured: m.featured || false,
          active: m.active ?? true
        }));
      }

      if (isMounted) {
        setFeaturedPool(mapped);
        setIsFeaturedLoading(false);
        if (fetchErrorOccurred) {
          setIsFeaturedError(true);
        }
      }
    }

    loadFeatured();
    return () => { isMounted = false; };
  }, []);

  // Balanced recommendation pool
  const featuredItems = useMemo(() => {
    if (!featuredPool || featuredPool.length === 0) return [];
    
    const kccItems = featuredPool.filter(m => m.brand === "KCC");
    const yuseongItems = featuredPool.filter(m => m.brand === "유성");
    const dongshinItems = featuredPool.filter(m => m.brand === "동신");
    const otherItems = featuredPool.filter(m => !["KCC", "유성", "동신"].includes(m.brand));

    const shuffledKcc = [...kccItems].sort(() => 0.5 - Math.random());
    const shuffledYuseong = [...yuseongItems].sort(() => 0.5 - Math.random());
    const shuffledDongshin = [...dongshinItems].sort(() => 0.5 - Math.random());

    const selected = [];
    const targetKCC = 3;
    const targetDongshin = 3;
    const targetYuseong = 2;

    const takeKCC = Math.min(targetKCC, shuffledKcc.length);
    const takeDongshin = Math.min(targetDongshin, shuffledDongshin.length);
    const takeYuseong = Math.min(targetYuseong, shuffledYuseong.length);

    for (let i = 0; i < takeKCC; i++) selected.push(shuffledKcc[i]);
    for (let i = 0; i < takeDongshin; i++) selected.push(shuffledDongshin[i]);
    for (let i = 0; i < takeYuseong; i++) selected.push(shuffledYuseong[i]);

    const remainingKcc = shuffledKcc.slice(takeKCC);
    const remainingDongshin = shuffledDongshin.slice(takeDongshin);
    const remainingYuseong = shuffledYuseong.slice(takeYuseong);
    const fillPool = [...remainingKcc, ...remainingDongshin, ...remainingYuseong, ...otherItems].sort(() => 0.5 - Math.random());

    while (selected.length < 8 && fillPool.length > 0) {
      const nextItem = fillPool.shift();
      if (!selected.some(s => s.id === nextItem.id || s.code === nextItem.code)) {
        selected.push(nextItem);
      }
    }

    if (selected.length < 8) {
      const remainingFill = featuredPool
        .filter(p => !selected.some(s => s.id === p.id || s.code === p.code))
        .sort(() => 0.5 - Math.random());
      
      while (selected.length < 8 && remainingFill.length > 0) {
        selected.push(remainingFill.shift());
      }
    }

    return selected.slice(0, 8).sort(() => 0.5 - Math.random());
  }, [featuredPool]);

  // Scroll Reveal Observer
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
    );

    reveals.forEach((el) => observer.observe(el));
    return () => {
      reveals.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [featuredItems, dbProjects]);

  return (
    <MainLayout>
      <div className="showroom-home-layout redesign-premium-theme">
        
        {/* Mobile App Home View */}
        <MobileHomeView nav={nav} featuredItems={featuredItems} loading={featuredItems.length === 0} />


        {/* 1. 히어로 섹션 */}
        <section className="showroom-hero-redesign">
          <div className="hero-redesign-bg-wrapper">
            <div className="hero-redesign-overlay" />
            <img src="/images/home/main-hero-interior.webp" alt="동경바닥재 메인 비주얼" className="hero-redesign-img" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/cross_section.png"; }} />
          </div>
          <div className="hero-redesign-container container">
            <div className="hero-redesign-content">
              <span className="hero-redesign-badge">자재 공급 & 전문 시공 파트너</span>
              <h1 className="hero-redesign-title">
                자재 선택부터 전문 시공까지<br />
                <strong>공간의 완성을 함께합니다.</strong>
              </h1>
              <p className="hero-redesign-subtitle">
                데코타일, 장판, 마루, 벽지부터 현장에 필요한 부자재까지<br />
                정확한 제품 정보와 합리적인 자재 공급, 전문 시공 상담을 제공합니다.
              </p>
              <div className="hero-redesign-actions">
                <button className="btn-hero-redesign primary" onClick={() => nav("/materials")}>
                  자재 둘러보기
                </button>
                <button className="btn-hero-redesign secondary" onClick={() => nav("/estimate/request")}>
                  견적 요청하기
                </button>
              </div>
              <div className="hero-redesign-subactions">
                <span onClick={() => nav("/samplebooks")}>📖 샘플북 보기</span>
                <span className="separator">|</span>
                <a href="tel:02-487-9775" style={{ color: 'inherit', textDecoration: 'none' }}>📞 전화 상담 (02-487-9775)</a>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 핵심 신뢰 요소 섹션 */}
        <section className="showroom-trust-redesign">
          <div className="container">
            <div className="trust-redesign-grid">
              <div className="trust-redesign-card">
                <div className="trust-card-icon-box">🏆</div>
                <h3>20년 이상 현장 경험</h3>
                <p>자재 이해와 풍부한 현장 노하우를 바탕으로 정확하게 상담합니다.</p>
              </div>
              <div className="trust-redesign-card">
                <div className="trust-card-icon-box">📦</div>
                <h3>전문 자재 유통</h3>
                <p>주요 브랜드의 바닥재·벽지·부자재를 한곳에서 확인할 수 있습니다.</p>
              </div>
              <div className="trust-redesign-card">
                <div className="trust-card-icon-box">🚚</div>
                <h3>데코타일 50평 이상 무료배송</h3>
                <p>동일 브랜드 데코타일 50평 이상 주문 시 배송 조건에 따라 무료배송이 가능합니다.</p>
                <span className="trust-card-note">* 브랜드, 수량, 지역 및 배송조건에 따라 달라질 수 있음</span>
              </div>
              <div className="trust-redesign-card">
                <div className="trust-card-icon-box">🛠️</div>
                <h3>자재 구매부터 시공까지</h3>
                <p>자재만 구매하거나 시공을 포함한 전체 견적을 한 번에 요청할 수 있습니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 빠른 카테고리 탐색 */}
        <section className="showroom-quick-categories">
          <div className="container">
            <div className="section-header-redesign">
              <span className="sec-sub">QUICK NAVIGATION</span>
              <h2 className="sec-title">빠른 자재 탐색</h2>
              <p className="sec-desc">공간과 용도에 맞춰 취급 자재 종류를 빠르게 둘러보세요.</p>
            </div>
            <div className="quick-categories-grid">
              {[
                { name: "데코타일", desc: "상업용/주거용 하이엔드 바닥재", img: "/images/categories/category-deco-tile.jpg", fallback: "/images/categories/category-deco-tile.jpg" },
                { name: "장판", desc: "보행감이 아늑하고 안전한 시트 바닥재", img: "/images/categories/category-cushion-floor.jpg", fallback: "/images/categories/category-cushion-floor.jpg" },
                { name: "마루", desc: "목재 특유의 내추럴한 프리미엄 바닥재", img: "/images/categories/category-wood-flooring.png", fallback: "/images/categories/category-wood-flooring.png" },
                { name: "벽지", desc: "다양한 질감의 프리미엄 실크/합지 벽지", img: "/images/categories/category-wallpaper.png", fallback: "/images/categories/category-wallpaper.png" },
                { name: "카페트타일", desc: "오피스/상업공간용 모듈형 바닥재", img: "/images/categories/category-carpet-tile.png", fallback: "/images/categories/category-carpet-tile.png" },
                { name: "부자재", desc: "본드, 마감재 등 현장 필수 용품", img: "/images/categories/category-accessories.png", fallback: "/images/cross_section.png" }
              ].map((cat) => (
                <div 
                  key={cat.name} 
                  className="quick-cat-card"
                  onClick={() => nav(`/materials?category=${cat.name}`)}
                >
                  <div className="quick-cat-img-box">
                    <CategoryCardImage src={cat.img} fallback={cat.fallback} alt={cat.name} />
                  </div>
                  <div className="quick-cat-body">
                    <h3>{cat.name}</h3>
                    <p>{cat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. 추천 자재 섹션 */}
        <section className="showroom-recommended-materials">
          <div className="container">
            <div className="section-header-redesign">
              <span className="sec-sub">RECOMMENDED MATERIALS</span>
              <h2 className="sec-title">추천 자재</h2>
              <p className="sec-desc">실제 현장에서 가장 선호도가 높고 사양이 입증된 제품들을 제안합니다.</p>
            </div>
            <div className="recommended-materials-grid">
              {isFeaturedLoading ? (
                Array.from({ length: 8 }).map((_, idx) => <SkeletonCard key={idx} />)
              ) : featuredItems.length > 0 ? (
                featuredItems.map((mat, idx) => (
                  <FeaturedCard key={mat.id || mat.code || idx} mat={mat} idx={idx} />
                ))
              ) : (
                <div className="recommended-empty-box">
                  <p>추천 상품 정보를 확인하는 중입니다.</p>
                  <button className="btn-go-materials" onClick={() => nav("/materials")}>자재 전체보기</button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 5. 주요 브랜드 */}
        <BrandLogosCarousel />

        {/* 6. 배송 방식 안내 */}
        <section className="showroom-delivery-info">
          <div className="container">
            <div className="section-header-redesign">
              <span className="sec-sub">SHIPPING SERVICES</span>
              <h2 className="sec-title">배송 방식 안내</h2>
              <p className="sec-desc">현장 상황과 물량에 최적화된 신속하고 확실한 유통망을 통해 발송됩니다.</p>
            </div>
            <div className="delivery-info-grid">
              <div className="delivery-info-card">
                <div className="delivery-icon-title">
                  <span className="d-icon">🚚</span>
                  <h3>무료배송</h3>
                </div>
                <p className="d-desc">동일 브랜드 데코타일 50평 이상 주문 시 적용 가능하며, 입력하신 현장/배송지 주소로 직접 배송됩니다.</p>
                <span className="d-caution">* 최종 적용 가능 여부는 브랜드, 지역, 제품별 주문 수량 조건에 따라 상담 후 조율됩니다.</span>
              </div>
              <div className="delivery-info-card">
                <div className="delivery-icon-title">
                  <span className="d-icon">🏢</span>
                  <h3>대신화물 배송</h3>
                </div>
                <p className="d-desc">50평 미만 주문 시의 기본 배송 방식입니다. 입력한 배송지 인근 대신화물 영업소 지점으로 발송됩니다.</p>
                <span className="d-caution">* 화물 비용은 지점 내방 수령 시 착불로 청구되며, 주문 검수 후 영업지점과 상세 비용이 안내됩니다.</span>
              </div>
              <div className="delivery-info-card">
                <div className="delivery-icon-title">
                  <span className="d-icon">⚡</span>
                  <h3>퀵 배송</h3>
                </div>
                <p className="d-desc">현장 긴급 자재 수령이 필요한 경우, 재고 현황 및 주문 접수시간 조건에 따라 당일 배송해 드립니다.</p>
                <span className="d-caution">* 배송 거리와 화물 톤수에 비례해 별도 운임(착불)이 책정되며 주문 확인 후 안내됩니다.</span>
              </div>
              <div className="delivery-info-card">
                <div className="delivery-icon-title">
                  <span className="d-icon">📦</span>
                  <h3>직접 수령</h3>
                </div>
                <p className="d-desc">하남에 위치한 동경바닥재 물류창고/사무실에 고객님 또는 배송 기사가 직접 방문하여 인수받는 방식입니다.</p>
                <span className="d-caution">* 방문 전 반드시 해당 자재의 재고 상황과 출고 준비 상태 확인이 사전에 이루어져야 합니다.</span>
              </div>
            </div>
          </div>
        </section>

        {/* 7. 자재별 부자재 안내 */}
        <section className="showroom-accessories-guide">
          <div className="container">
            <div className="section-header-redesign">
              <span className="sec-sub">ACCESSORIES RECOMMENDATION</span>
              <h2 className="sec-title">자재별 필수 부자재 안내</h2>
              <p className="sec-desc">하자 없는 완벽한 시공을 위해 자재와 함께 꼭 준비해야 할 품목들입니다.</p>
            </div>
            <div className="accessories-guide-grid">
              <div className="acc-guide-card">
                <h4>데코타일 시공 부자재</h4>
                <div className="acc-guide-items">
                  {["본드", "분리대", "수지마감재", "돼지본드", "노본"].map(name => (
                    <span key={name} className="acc-guide-tag">{name}</span>
                  ))}
                </div>
                <p className="acc-guide-note">시공 방식 and 바닥 마감 재질에 적합한 본드와 마감재를 선택해 주세요.</p>
              </div>
              <div className="acc-guide-card">
                <h4>장판 시공 부자재</h4>
                <div className="acc-guide-items">
                  {["륨본드", "용착제(시공구)세트", "수지마감재", "논슬립경보", "논슬립중보", "노본"].map(name => (
                    <span key={name} className="acc-guide-tag">{name}</span>
                  ))}
                </div>
                <p className="acc-guide-note">장판 이음부 융착제 시공과 계단/모서리 부분 논슬립 고정에 필수적입니다.</p>
              </div>
              <div className="acc-guide-card">
                <h4>벽지 시공 부자재</h4>
                <div className="acc-guide-items">
                  {["코너각대", "현장풀", "풀네바리", "도배실리콘", "운용지2절", "운용지3절", "부직포(110)", "부직포(120)", "바인다"].map(name => (
                    <span key={name} className="acc-guide-tag">{name}</span>
                  ))}
                </div>
                <p className="acc-guide-note">초배지 및 코너각대 등 정교한 도배 품질과 벽체 보강에 필수적인 부자재 목록입니다.</p>
              </div>
            </div>
            <div className="accessories-guide-footer">
              <div className="acc-guide-footer-box">
                <span className="info-badge">안내</span>
                <p>마루는 별도 부자재 추천 단계를 거치지 않고 현장 사양과 공법에 따라 직접 안내해 드립니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. 시공사례 */}
        <section className="showroom-portfolio">
          <div className="container">
            <div className="section-header-redesign">
              <span className="sec-sub">PORTFOLIO CASE STUDY</span>
              <h2 className="sec-title">주요 시공사례</h2>
              <p className="sec-desc">전국 아파트, 상업공간, 오피스 빌딩 등에 전문 납품/시공된 실적입니다.</p>
            </div>
            <div className="portfolio-grid">
              {(dbProjects.length > 0 ? dbProjects : projects).map((proj) => (
                <div key={proj.id} className="portfolio-card">
                  <div className="portfolio-img-box">
                    <img src={proj.image} alt={proj.title} loading="lazy" />
                    <span className="portfolio-cat-badge">{proj.category}</span>
                  </div>
                  <div className="portfolio-body">
                    <h3>{proj.title}</h3>
                    <div className="portfolio-details">
                      <div className="p-detail">
                        <span className="p-lbl">자재 정보:</span>
                        <span className="p-val">{proj.material}</span>
                      </div>
                      <div className="p-detail">
                        <span className="p-lbl">시공 범위:</span>
                        <span className="p-val">{proj.range}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="portfolio-footer-action">
              <button className="btn-portfolio-more" onClick={() => nav("/cases")}>시공사례 전체보기 <ChevronRight size={16} /></button>
            </div>
          </div>
        </section>

        {/* 9. 견적 요청 진행 과정 */}
        <section className="showroom-est-steps">
          <div className="container">
            <div className="section-header-redesign">
              <span className="sec-sub">ESTIMATION FLOW</span>
              <h2 className="sec-title">견적 요청 진행 과정</h2>
              <p className="sec-desc">몇 번의 선택만으로 정확하고 신속하게 맞춤형 도매 견적을 의뢰할 수 있습니다.</p>
            </div>
            <div className="est-steps-grid">
              {[
                { step: "01", name: "자재 또는 시공 종류 선택", desc: "데코타일, 장판, 마루 등 필요한 자재 종류 및 브랜드를 선택합니다." },
                { step: "02", name: "평수와 현장 정보 입력", desc: "시공 범위 평수 및 현장 사양(엘리베이터 유무 등)을 작성합니다." },
                { step: "03", name: "배송 및 부자재 선택", desc: "무료배송, 대신화물 지점 수령 여부 및 본드 등 부자재를 선택합니다." },
                { step: "04", name: "상담 방식 선택", desc: "전화 상담, 온라인 메일 안내 등 희망하시는 상담 방식을 선택합니다." },
                { step: "05", name: "견적 확인 및 연락", desc: "담당자 검토 후 신속하게 상세 도매 견적서 피드백을 전달해 드립니다." }
              ].map(item => (
                <div key={item.step} className="est-step-card">
                  <div className="step-num">{item.step}</div>
                  <h4>{item.name}</h4>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="est-steps-action">
              <button className="btn-est-flow-go" onClick={() => nav("/estimate/request")}>
                온라인 견적 요청하기 <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* 10. 전문 상담 및 시공 연결 */}
        <section className="showroom-expert-consultation">
          <div className="container">
            <div className="expert-consultation-box">
              <div className="expert-consult-text">
                <h2>어떤 자재를 선택해야 할지 고민되시나요?</h2>
                <p>공간 용도, 평수, 예산과 원하는 분위기를 알려주시면 자재 선택부터 필요한 부자재와 시공 상담까지 함께 안내해 드립니다.</p>
              </div>
              <div className="expert-consult-buttons">
                <button className="btn-expert-action primary" onClick={() => nav("/estimate/request")}>
                  견적 상담 시작하기
                </button>
                <a href="tel:02-487-9775" className="btn-expert-action phone">
                  <Phone size={16} /> 전화로 문의하기 (02-487-9775)
                </a>
                <a href={KAKAO_CHAT_URL} target="_blank" rel="noopener noreferrer" className="btn-expert-action kakao">
                  💬 카카오톡 상담하기
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 11. 오시는 길 및 회사 정보 */}
        <section className="showroom-office-location">
          <div className="container">
            <div className="location-content-grid">
              <div className="location-info-side">
                <span className="loc-sub">OFFICE LOCATION</span>
                <h2>동경바닥재 오시는 길</h2>
                <p className="loc-desc">사무실 내방 및 직접 수령을 원하시는 고객께서는 방문 전에 출고 상태 확인을 부탁드립니다.</p>
                
                <div className="loc-details-list">
                  <div className="loc-detail-item">
                    <MapPin size={18} className="loc-icon" />
                    <div className="loc-text-box">
                      <strong>사무실 및 물류창고</strong>
                      <span>경기 하남시 서하남로 37 (1층)</span>
                    </div>
                  </div>
                  <div className="loc-detail-item">
                    <Clock size={18} className="loc-icon" />
                    <div className="loc-text-box">
                      <strong>운영 시간</strong>
                      <span>평일: 07:00 - 18:00 | 주말: 07:00 - 12:00</span>
                    </div>
                  </div>
                  <div className="loc-detail-item">
                    <Phone size={18} className="loc-icon" />
                    <div className="loc-text-box">
                      <strong>고객센터</strong>
                      <span>전화: 02-487-9775 | 이메일: dongk3089@naver.com</span>
                    </div>
                  </div>
                </div>
                
                <div className="loc-buttons">
                  <a 
                    href="https://map.kakao.com/?q=%EA%B2%BD%EA%B8%B0%20%ED%95%98%EB%82%A8%EC%8B%9C%20%EC%84%9C%ED%95%98%EB%82%A8%EB%A1%9C%2037" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-loc-map-go"
                  >
                    🗺️ 카카오맵에서 길찾기
                  </a>
                </div>
              </div>
              
              <div className="location-visual-side">
                <div className="location-visual-box">
                  <img src="/images/home/storefront.jpg" alt="동경바닥재 오피스 전경" className="loc-office-img" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/cross_section.png"; }} />
                  <div className="loc-office-tag">동경바닥재 하남 물류창고 / 사무실</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 12. 우측 고정 퀵 메뉴 (데스크톱) / 하단 퀵바 (모바일) */}
        <QuickMenu cartCount={cartCount} />

      </div>
    </MainLayout>
  );
}
