import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { KAKAO_CHAT_URL } from "../../constants/contact";
import { supabase } from "../../lib/supabaseClient";
import { sampleBooks } from "../../data/samplebooks.db";
import { materials } from "../../data/materials.db";
import { getThumbnailImage } from "../../utils/galleryUtils";
import { fetchAllProducts } from "../../utils/supabaseFetcher";
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
  Users
} from "lucide-react";
import "./Home.css";
import BrandLogosCarousel from "../../components/home/BrandLogosCarousel";

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
      </div>
      <div className="featured-v2-body">
        <div className="featured-v2-meta">
          <span className="featured-v2-brand">{mat.brand}</span>
          {formattedSpecs && <span className="featured-v2-specs">{formattedSpecs}</span>}
        </div>
        <h3 className="featured-v2-name">{mat.name}</h3>
        <p className="featured-v2-desc">{desc}</p>
        <span className="featured-v2-more-link">자재 상세정보 보기 <ArrowRight size={14} /></span>
      </div>
    </div>
  );
};

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

// Space Finder Section component (Redesigned: Alternating stack list with floating navigation)
const SpaceFinderSection = () => {
  const nav = useNavigate();
  const containerRef = useRef(null);
  const sectionRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -40% 0px", // Trigger when the item is in the main viewing zone
      threshold: 0.1
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute("data-index"), 10);
          if (!isNaN(index)) {
            setActiveIndex(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleDotClick = (idx) => {
    const targetElement = sectionRefs.current[idx];
    if (targetElement) {
      const yOffset = -90; // Offset to clear the header
      const y = targetElement.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({
        top: y,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="showroom-space-finder-v2" ref={containerRef}>
      {/* Title Header */}
      <div className="section-header-v2 container reveal">
        <span className="section-subtitle-v2">SPACE FINDER</span>
        <h2 className="section-title-v2">공간별 자재 추천</h2>
        <p className="section-desc-v2">
          주거부터 상업, 공공기관까지 공간의 특성과 활용 목적에 맞는 최적의 바닥재와 벽지를 추천해 드립니다.
        </p>
      </div>

      {/* Desktop Alternating List View */}
      <div className="space-finder-desktop-list">
        {spaceSections.map((sect, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div
              key={sect.id}
              className={`space-finder-row-item reveal ${isEven ? "layout-normal" : "layout-reversed"}`}
              ref={(el) => (sectionRefs.current[idx] = el)}
              data-index={idx}
            >
              <div className="space-finder-item-container container">
                {/* Content block */}
                <div className="space-finder-item-content">
                  <div className="space-finder-index">
                    <strong>{sect.label}</strong> / 05
                  </div>
                  <span className="space-finder-category-tag">{sect.category}</span>
                  <h3 className="space-finder-title">{sect.title}</h3>
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

                {/* Image block */}
                <div className="space-finder-item-img-wrap">
                  <div className="space-finder-item-img-box">
                    <img src={sect.image} alt={sect.title} className="space-finder-item-img" loading="lazy" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Dot Indicators on the Right (Desktop only) */}
      <div className="space-finder-floating-dots">
        {spaceSections.map((sect, idx) => (
          <button
            key={idx}
            className={`space-finder-floating-dot ${idx === activeIndex ? "active" : ""}`}
            onClick={() => handleDotClick(idx)}
            aria-label={`Go to section ${idx + 1}`}
          >
            <span className="dot-hover-label">{sect.category}</span>
          </button>
        ))}
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
                <img src={sect.image} alt={sect.title} className="mobile-card-img" loading="lazy" />
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

const HERO_SLIDES = [
  {
    image: "/images/home/main-hero-interior.webp",
    tag: "PREMIUM WOOD FLOORING",
    title: "공간의 가치를 높이는 프리미엄 마루"
  },
  {
    image: "/images/home-interior/korea-home-living-01.webp",
    tag: "LUXURY DECO TILE",
    title: "트렌디한 감각의 고품격 데코타일"
  },
  {
    image: "/images/home-interior/korea-kitchen-living-01.webp",
    tag: "CUSHION FLOOR",
    title: "보행감이 편안한 친환경 장판"
  },
  {
    image: "/images/home-interior/korea-apt-living-01.webp",
    tag: "MODERN WALLPAPER",
    title: "벽면의 분위기를 살리는 고급 벽지"
  }
];

const RANDOM_CATEGORIES = [
  {
    name: '데코타일',
    desc: '공간에 실용성과 디자인을 더하는 데코타일',
    image: '/images/categories/category-deco-tile.jpg',
    fallback: '/images/categories/category-deco-tile.jpg',
    path: '/materials?category=데코타일'
  },
  {
    name: '마루',
    desc: '공간의 가치를 높이는 프리미엄 마루',
    image: '/images/categories/category-wood-flooring.png',
    fallback: '/images/categories/category-wood-flooring.png',
    path: '/materials?category=마루'
  },
  {
    name: '벽지',
    desc: '공간 분위기를 완성하는 감각적인 벽지',
    image: '/images/categories/category-wallpaper.png',
    fallback: '/images/categories/category-wallpaper.png',
    path: '/materials?category=벽지'
  },
  {
    name: '카페트타일',
    desc: '상업공간에 어울리는 모던 카페트타일',
    image: '/images/categories/category-carpet-tile.png',
    fallback: '/images/categories/category-carpet-tile.png',
    path: '/materials?category=카페트타일'
  }
];

export default function Home() {
  const nav = useNavigate();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dbProjects, setDbProjects] = useState([]);

  // Randomized category selection (persisted during the browser session)
  const [randomCategory] = useState(() => {
    try {
      const cached = sessionStorage.getItem('dk_home_random_category');
      if (cached) {
        const found = RANDOM_CATEGORIES.find(c => c.name === cached);
        if (found) return found;
      }
      const selected = RANDOM_CATEGORIES[Math.floor(Math.random() * RANDOM_CATEGORIES.length)];
      sessionStorage.setItem('dk_home_random_category', selected.name);
      return selected;
    } catch {
      return RANDOM_CATEGORIES[0];
    }
  });

  const [estimateImg, setEstimateImg] = useState("/images/home/consulting-estimate.webp");

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadFeatured() {
      // 1. If Supabase is active, query a tiny subset (limit 20) instead of fetching 4000+ items
      if (supabase) {
        try {
          console.log("[Home] Fetching a light subset of active products for recommend section...");
          const { data: rawChunk, error } = await supabase
            .from("products")
            .select(`
              *,
              categories ( id, name ),
              brands ( id, name )
            `)
            .eq("is_active", true)
            .limit(20);

          if (!error && rawChunk && rawChunk.length > 0) {
            const mapped = rawChunk.map(p => ({
              id: p.slug || String(p.id),
              code: p.product_code || "",
              name: p.name || "",
              brand: p.brands?.name || "",
              category: p.categories?.name || "",
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

            if (isMounted) {
              const shuffled = [...mapped].sort(() => 0.5 - Math.random());
              setFeaturedItems(shuffled.slice(0, 4));
              return;
            }
          }
        } catch (e) {
          console.warn("[Home] Fast featured query failed, falling back to local database:", e);
        }
      }

      // 2. Local fallback: Query instantly from materials.db
      console.log("[Home] Instantly resolving featured items from local database...");
      const kcc = (materials || []).filter(m => m.brand === "KCC");
      const dongshin = (materials || []).filter(m => m.brand === "동신");
      const yuseong = (materials || []).filter(m => m.brand === "유성");

      const selected = [];
      if (kcc.length > 0) selected.push(kcc[Math.floor(Math.random() * kcc.length)]);
      if (dongshin.length > 0) selected.push(dongshin[Math.floor(Math.random() * dongshin.length)]);
      if (yuseong.length > 0) selected.push(yuseong[Math.floor(Math.random() * yuseong.length)]);

      const remaining = (materials || []).filter(m => ["KCC", "동신", "유성"].includes(m.brand) && !selected.map(s => s.id).includes(m.id));
      if (remaining.length > 0 && selected.length < 4) {
        const shuffledRemaining = [...remaining].sort(() => 0.5 - Math.random());
        selected.push(...shuffledRemaining.slice(0, 4 - selected.length));
      }

      const finalShuffled = [...selected].sort(() => 0.5 - Math.random());
      if (isMounted) {
        setFeaturedItems(finalShuffled);
      }
    }

    loadFeatured();
    return () => { isMounted = false; };
  }, []);

  // 5 Material categories
  const categories = [
    { 
      name: "데코타일", 
      engName: "DECO TILE", 
      desc: "상업공간과 주거공간 모두에 어울리는 실용적인 바닥재", 
      image: "/images/categories/category-deco-tile.jpg", 
      fallbackImage: "/images/categories/category-deco-tile.jpg",
      path: "/materials?category=데코타일" 
    },
    { 
      name: "장판", 
      engName: "CUSHION FLOOR", 
      desc: "생활감과 편안함을 고려한 주거용 바닥재", 
      image: "/images/categories/category-cushion-floor.jpg", 
      fallbackImage: "/images/categories/category-cushion-floor.jpg",
      path: "/materials?category=장판" 
    },
    { 
      name: "마루", 
      engName: "WOOD FLOORING", 
      desc: "공간에 따뜻한 결을 더하는 프리미엄 목질 바닥재", 
      image: "/images/categories/category-wood-flooring.png", 
      fallbackImage: "/images/categories/category-wood-flooring.png",
      path: "/materials?category=마루" 
    },
    { 
      name: "벽지", 
      engName: "PREMIUM WALLPAPER", 
      desc: "벽면의 분위기를 완성하는 다양한 패턴 and 질감", 
      image: "/images/categories/category-wallpaper.png", 
      fallbackImage: "/images/categories/category-wallpaper.png",
      path: "/materials?category=벽지" 
    },
    { 
      name: "카페트타일", 
      engName: "CARPET TILE", 
      desc: "오피스와 상업공간에 적합한 모듈형 바닥재", 
      image: "/images/categories/category-carpet-tile.png", 
      fallbackImage: "/images/categories/category-carpet-tile.png",
      path: "/materials?category=카페트타일" 
    }
  ];

  // Select 4 major brand samplebooks for home feature
  const homeSampleBooks = useMemo(() => {
    const targets = ["lx-new-chungmac-2025", "dongshin-polyma-samplebook", "kcc-senstyle-trendy-2025", "gaenari-artbook"];
    return sampleBooks.filter(b => targets.includes(b.id));
  }, []);

  const [heroActive, setHeroActive] = useState(false);

  // Trigger Hero Intro immediately on mount
  useEffect(() => {
    setHeroActive(true);
  }, []);

  // Scroll Reveal Observer (High Performance, unobserves once active)
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target); // Stop tracking once animated to save resources
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    reveals.forEach((el) => observer.observe(el));
    return () => {
      reveals.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  return (
    <MainLayout>
      <div className="showroom-home-layout">
        
        {/* ==========================================
           1. Hero Section (B2B Redesigned: Two Column Layout)
           ========================================== */}
        <section className={`showroom-hero-b2b ${heroActive ? "hero-active" : ""}`}>
          <div className="hero-b2b-bg-wrapper">
            <div className="hero-b2b-bg" />
            <div className="hero-b2b-overlay" />
          </div>
          <div className="hero-b2b-container container">
            {/* Left Content Column */}
            <div className="hero-b2b-content">
              <span className="hero-b2b-badge">바닥재·벽지 자재 유통·시공 전문</span>
              <h1 className="hero-b2b-title">
                바닥재·벽지 자재 공급부터<br />
                시공 연계까지 원스톱 해결
              </h1>
              <p className="hero-b2b-subtitle">
                데코타일, 장판, 마루, 벽지, 카페트타일 등 국내 주요 브랜드의 자재를 빠르게 확인하고 실시간 견적 문의와 발주를 한 번에 진행하세요.
              </p>
              <div className="hero-b2b-actions">
                <button className="btn-b2b-hero primary" onClick={() => nav("/materials")}>
                  자재 보러가기
                </button>
                <button className="btn-b2b-hero secondary" onClick={() => nav("/estimate/request")}>
                  견적 문의하기
                </button>
                <button className="btn-b2b-hero outline" onClick={() => nav("/samplebooks")}>
                  샘플북 보기
                </button>
              </div>
            </div>

            {/* Right Work/Process Cards Column */}
            <div className="hero-b2b-cards">
              {/* Quick Contact & Logistics Card */}
              <div className="b2b-info-card logistics">
                <h3 className="card-lbl">배송 및 현장 시공 안내</h3>
                <ul className="logistics-list">
                  <li>🚚 <strong>전국 화물 배송:</strong> 대신/경동화물 지점 배송 및 현장 직송</li>
                  <li>⚡ <strong>수도권 빠른 출고:</strong> 물류창고 재고 매칭 시 당일/익일 출고</li>
                  <li>🔨 <strong>20년 전문 시공팀:</strong> 수도권 전역 책임 시공 및 AS 보증</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
           2. B2B Material Categories (B단계)
           ========================================== */}
        <section className="showroom-category-v2">
          <div className="section-header-v2 container reveal">
            <span className="section-subtitle-v2">MATERIAL CATEGORIES</span>
            <h2 className="section-title-v2">취급 자재 카테고리</h2>
            <p className="section-desc-v2">
              업계에서 검증된 정품 자재군을 카테고리별로 신속하게 탐색하고 자재 도매 가격을 의뢰하세요.
            </p>
          </div>

          <div className="category-v2-grid container">
            {categories.map((cat, idx) => (
              <div 
                key={idx} 
                className="category-v2-card reveal" 
                style={{ "--delay": `${idx * 80}ms` }}
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
           2.8 Today's Recommended Category Banner (Randomized)
           ========================================== */}
        <section className="showroom-random-banner">
          <div className="random-banner-container container reveal">
            <div className="random-banner-card">
              <div className="random-banner-img-wrap">
                <img 
                  src={randomCategory.image} 
                  alt={randomCategory.name} 
                  className="random-banner-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = randomCategory.fallback;
                  }}
                  loading="lazy"
                />
                <div className="random-banner-overlay"></div>
              </div>
              <div className="random-banner-content">
                <span className="random-banner-tag">TODAY'S SELECTION</span>
                <h2 className="random-banner-title">{randomCategory.name}</h2>
                <p className="random-banner-desc">{randomCategory.desc}</p>
                <button 
                  className="btn-random-banner-go" 
                  onClick={() => nav(randomCategory.path)}
                >
                  자재 보러가기
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
           3. Sample Book Section (Catalog Layout)
           ========================================== */}
        <section className="showroom-samplebooks-v2">
          <div className="section-header-v2 container reveal">
            <span className="section-subtitle-v2">DIGITAL CATALOG</span>
            <h2 className="section-title-v2">브랜드별 샘플북</h2>
            <p className="section-desc-v2">
              KCC, LX, 동신, 개나리 등 주요 브랜드의 샘플북을 온라인 카탈로그로 한눈에 확인하세요.
            </p>
          </div>

          <div className="samplebooks-v2-grid container">
            {homeSampleBooks.map((book, idx) => (
              <div 
                key={book.id} 
                className="samplebook-v2-card reveal"
                style={{ "--delay": `${idx * 80}ms` }}
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
        <section className="showroom-featured-v2">
          <div className="section-header-v2 container reveal">
            <span className="section-subtitle-v2">CURATED LIST</span>
            <h2 className="section-title-v2">추천 자재</h2>
            <p className="section-desc-v2">
              현장에서 선호도가 높고 품질과 시공 편의성이 검증된 도매 유통 자재군을 소개합니다.
            </p>
          </div>

          <div className="featured-v2-grid container">
            {featuredItems.map((mat, idx) => (
              <FeaturedCard key={mat.id} mat={mat} idx={idx} />
            ))}
          </div>
        </section>

        {/* ==========================================
           5. Project / 시공사례 Section
           ========================================== */}
        <section className="showroom-projects-v2">
          <div className="section-header-v2 container reveal">
            <span className="section-subtitle-v2">PORTFOLIO</span>
            <h2 className="section-title-v2">주요 시공사례</h2>
            <p className="section-desc-v2">
              아파트, 상가, 오피스 등 다양한 현장에 공급된 바닥재 및 벽지 시공 사례를 소개합니다.
            </p>
          </div>

          <div className="projects-v2-grid container">
            {(dbProjects.length > 0 ? dbProjects : projects).map((proj, idx) => (
              <div 
                key={proj.id} 
                className="project-v2-card reveal"
                style={{ "--delay": `${idx * 80}ms` }}
              >
                <div className="project-v2-img-frame">
                  <img src={proj.image} alt={proj.title} className="project-v2-img" />
                </div>
                <div className="project-v2-body">
                  <span className="project-v2-cat">{proj.category}</span>
                  <h3 className="project-v2-title">{proj.title}</h3>
                  <div className="project-v2-details">
                    <div className="project-v2-detail-item">
                      <span className="detail-lbl">공급 자재</span>
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
           5.5 Official Partner Brands Carousel (Draggable)
           ========================================== */}
        <BrandLogosCarousel />

        {/* ==========================================
           5.8 Large Text Marquee Section (F단계)
           ========================================== */}
        <section className="showroom-marquee-section">
          <div className="marquee-container">
            <div className="marquee-inner">
              <span>동경바닥재 MATERIAL ORDER · SAMPLE BOOK · QUICK ESTIMATE · FLOORING MATERIAL · WALLPAPER · DECO TILE · </span>
              <span>동경바닥재 MATERIAL ORDER · SAMPLE BOOK · QUICK ESTIMATE · FLOORING MATERIAL · WALLPAPER · DECO TILE · </span>
            </div>
          </div>
        </section>

        {/* ==========================================
           6. B2B Trust Section (D단계 - 스탯 지표 수정)
           ========================================== */}
        <section className="showroom-trust-v2">
          <div className="trust-v2-container container">
            <div className="trust-v2-grid">
              <div className="trust-v2-item reveal" style={{ "--delay": "0ms" }}>
                <span className="trust-v2-num">20+</span>
                <h4 className="trust-v2-title">현장 실무 경력</h4>
                <p className="trust-v2-desc">20년 이상 오직 바닥재와 벽지 한 분야만을 전문으로 다져온 기술력과 자재 선별 노하우</p>
              </div>
              <div className="trust-v2-item reveal" style={{ "--delay": "80ms" }}>
                <span className="trust-v2-num">1,000+</span>
                <h4 className="trust-v2-title">누적 시공·납품 현장</h4>
                <p className="trust-v2-desc">아파트, 빌라, 상가, 사무실, 공공기관 등 다양한 규모와 환경의 성공적인 자재 납품 및 시공 레코드</p>
              </div>
              <div className="trust-v2-item reveal" style={{ "--delay": "160ms" }}>
                <span className="trust-v2-num">주요 브랜드</span>
                <h4 className="trust-v2-title">정품 자재 유통</h4>
                <p className="trust-v2-desc">KCC글라스, LX하우시스, 동신포리마, 현대L&C 등 믿을 수 있는 국내 1군 브랜드 정품 취급</p>
              </div>
              <div className="trust-v2-item reveal" style={{ "--delay": "240ms" }}>
                <span className="trust-v2-num">빠른 상담</span>
                <h4 className="trust-v2-title">견적 및 자재 매칭</h4>
                <p className="trust-v2-desc">상담 접수 시 현장 도면 및 사양 분석을 통해 가장 경제적이고 확실한 자재 선택을 지원</p>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
           6.5 Customer Support, Contact, & Bank Info Section (E단계 결합)
           ========================================== */}
        <section className="showroom-contact-v2 reveal">
          <div className="contact-v2-container container">
            <div className="contact-v2-content-pane">
              <span className="contact-v2-tag">CONSULTING & ESTIMATE</span>
              <h2 className="contact-v2-heading">도매 거래처 및 현장 맞춤 상담<br />도매 견적부터 현장 시공까지</h2>
              <p className="contact-v2-subheading">
                업자, 인테리어 설계사, 시공 현장 책임자분들의 대량 발주 및 시공 연계를 지원합니다.<br />
                도면 송부 시 신속하게 자재별 물량 산출 및 도매 단가 견적을 제안해 드립니다.
              </p>
              
              {/* Combine Customer Center & Bank Info inside Contact Pane */}
              <div className="b2b-contact-grid">
                <div className="b2b-contact-info-card">
                  <h4 className="info-card-lbl">고객센터 안내</h4>
                  <a href="tel:02-487-9775" className="info-card-phone">02-487-9775</a>
                  <p className="info-card-txt">평일 07:00 - 18:00 | 주말 07:00 - 12:00</p>
                  <p className="info-card-txt font-mono">이메일: dongk3089@naver.com</p>
                </div>
                <div className="b2b-contact-info-card">
                  <h4 className="info-card-lbl">무통장 입금 계좌</h4>
                  <p className="info-card-txt font-mono"><strong>농협은행</strong> 301-0298-9197-81</p>
                  <p className="info-card-txt">예금주: 동경바닥재</p>
                </div>
              </div>

              <div className="contact-v2-buttons">
                <a href="tel:02-487-9775" className="btn-contact-v2 btn-contact-v2-primary">
                  전화 상담하기
                </a>
                <Link to="/estimate/request" className="btn-contact-v2 btn-contact-v2-secondary">
                  온라인 견적 문의
                </Link>
                <a 
                  href={KAKAO_CHAT_URL} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-contact-v2 btn-contact-v2-kakao"
                  style={{
                    backgroundColor: '#FEE500',
                    color: '#191919',
                    border: 'none',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none'
                  }}
                >
                  💬 카톡 상담하기
                </a>
                <Link to="/samplebooks" className="btn-contact-v2 btn-contact-v2-outline">
                  디지털 샘플북 확인
                </Link>
              </div>
            </div>

            <div className="contact-v2-image-pane">
              <img 
                src={estimateImg} 
                alt="동경바닥재 자재 유통 및 상담 이미지" 
                className="contact-v2-image"
                onError={() => setEstimateImg("/images/home-interior/korea-home-living-01.png")}
                loading="lazy"
              />
            </div>
          </div>
        </section>

      </div>
    </MainLayout>
  );
}
