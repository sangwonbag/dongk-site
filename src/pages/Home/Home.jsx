import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
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
const FeaturedCard = ({ mat }) => {
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
      className="featured-v2-card"
      onClick={() => navigate(`/materials/${mat.id}`)}
    >
      <div className="featured-v2-img-frame">
        <img 
          src={imgUrl || "/images/no-image.svg"} 
          alt={mat.name} 
          className="featured-v2-img" 
          onError={(e) => { e.target.onerror = null; e.target.src = "/images/no-image.svg"; }}
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
                    <img src={sect.image} alt={sect.title} className="space-finder-item-img" />
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
                <img src={sect.image} alt={sect.title} className="mobile-card-img" />
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
      />
    </div>
  );
};

const HERO_SLIDES = [
  {
    image: "/images/home/main-hero-interior.png",
    tag: "PREMIUM WOOD FLOORING",
    title: "공간의 가치를 높이는 프리미엄 마루"
  },
  {
    image: "/images/home-interior/korea-home-living-01.png",
    tag: "LUXURY DECO TILE",
    title: "트렌디한 감각의 고품격 데코타일"
  },
  {
    image: "/images/home-interior/korea-kitchen-living-01.png",
    tag: "CUSHION FLOOR",
    title: "보행감이 편안한 친환경 장판"
  },
  {
    image: "/images/home-interior/korea-apt-living-01.png",
    tag: "MODERN WALLPAPER",
    title: "벽면의 분위기를 살리는 고급 벽지"
  }
];

const RANDOM_CATEGORIES = [
  {
    name: '데코타일',
    desc: '공간에 실용성과 디자인을 더하는 데코타일',
    image: '/images/categories/category-deco-tile.png',
    fallback: '/images/deco_tile.png',
    path: '/materials?category=데코타일'
  },
  {
    name: '마루',
    desc: '공간의 가치를 높이는 프리미엄 마루',
    image: '/images/categories/category-wood-flooring.png',
    fallback: '/images/spc_flooring.png',
    path: '/materials?category=마루'
  },
  {
    name: '벽지',
    desc: '공간 분위기를 완성하는 감각적인 벽지',
    image: '/images/categories/category-wallpaper.png',
    fallback: '/images/premium_wallpaper.png',
    path: '/materials?category=벽지'
  },
  {
    name: '카페트타일',
    desc: '상업공간에 어울리는 모던 카페트타일',
    image: '/images/categories/category-carpet-tile.png',
    fallback: '/images/carpet_tile.png',
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

  const [estimateImg, setEstimateImg] = useState("/images/home/consulting-estimate.png");

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
    fetchAllProducts().then((data) => {
      if (!isMounted) return;
      const kcc = (data || []).filter(m => m.brand === 'KCC');
      const dongshin = (data || []).filter(m => m.brand === '동신');
      const yuseong = (data || []).filter(m => m.brand === '유성');

      const selected = [];
      if (kcc.length > 0) selected.push(kcc[Math.floor(Math.random() * kcc.length)]);
      if (dongshin.length > 0) selected.push(dongshin[Math.floor(Math.random() * dongshin.length)]);
      if (yuseong.length > 0) selected.push(yuseong[Math.floor(Math.random() * yuseong.length)]);

      const remaining = (data || []).filter(m => ['KCC', '동신', '유성'].includes(m.brand) && !selected.map(s => s.id).includes(m.id));
      if (remaining.length > 0 && selected.length < 4) {
        const shuffledRemaining = [...remaining].sort(() => 0.5 - Math.random());
        selected.push(...shuffledRemaining.slice(0, 4 - selected.length));
      }

      const finalShuffled = [...selected].sort(() => 0.5 - Math.random());
      setFeaturedItems(finalShuffled);
    }).catch(err => {
      console.error("Failed to load featured items:", err);
      // Fallback local
      const kcc = (materials || []).filter(m => m.brand === 'KCC');
      const dongshin = (materials || []).filter(m => m.brand === '동신');
      const yuseong = (materials || []).filter(m => m.brand === '유성');

      const selected = [];
      if (kcc.length > 0) selected.push(kcc[Math.floor(Math.random() * kcc.length)]);
      if (dongshin.length > 0) selected.push(dongshin[Math.floor(Math.random() * dongshin.length)]);
      if (yuseong.length > 0) selected.push(yuseong[Math.floor(Math.random() * yuseong.length)]);

      const remaining = (materials || []).filter(m => ['KCC', '동신', '유성'].includes(m.brand) && !selected.map(s => s.id).includes(m.id));
      if (remaining.length > 0 && selected.length < 4) {
        const shuffledRemaining = [...remaining].sort(() => 0.5 - Math.random());
        selected.push(...shuffledRemaining.slice(0, 4 - selected.length));
      }
      const finalShuffled = [...selected].sort(() => 0.5 - Math.random());
      setFeaturedItems(finalShuffled);
    });
    return () => { isMounted = false; };
  }, []);

  // 6 Material categories
  const categories = [
    { 
      name: "데코타일", 
      engName: "DECO TILE", 
      desc: "상업공간과 주거공간 모두에 어울리는 실용적인 바닥재", 
      image: "/images/categories/category-deco-tile.png", 
      fallbackImage: "/images/deco_tile.png",
      path: "/materials?category=데코타일" 
    },
    { 
      name: "장판", 
      engName: "CUSHION FLOOR", 
      desc: "생활감과 편안함을 고려한 주거용 바닥재", 
      image: "/images/categories/category-cushion-floor.png", 
      fallbackImage: "/images/cross_section.png",
      path: "/materials?category=장판" 
    },
    { 
      name: "마루", 
      engName: "WOOD FLOORING", 
      desc: "공간에 따뜻한 결을 더하는 프리미엄 목질 바닥재", 
      image: "/images/categories/category-wood-flooring.png", 
      fallbackImage: "/images/spc_flooring.png",
      path: "/materials?category=마루" 
    },
    { 
      name: "벽지", 
      engName: "PREMIUM WALLPAPER", 
      desc: "벽면의 분위기를 완성하는 다양한 패턴과 질감", 
      image: "/images/categories/category-wallpaper.png", 
      fallbackImage: "/images/premium_wallpaper.png",
      path: "/materials?category=벽지" 
    },
    { 
      name: "카페트타일", 
      engName: "CARPET TILE", 
      desc: "오피스와 상업공간에 적합한 모듈형 바닥재", 
      image: "/images/categories/category-carpet-tile.png", 
      fallbackImage: "/images/carpet_tile.png",
      path: "/materials?category=카페트타일" 
    },
    { 
      name: "부자재", 
      engName: "ACCESSORIES", 
      desc: "시공 완성도를 높이는 필수 부자재", 
      image: "/images/categories/category-accessories.png", 
      fallbackImage: "/images/interlocking_profile.png",
      path: "/materials?category=부자재" 
    }
  ];

  // Select 4 major brand samplebooks for home feature
  const homeSampleBooks = useMemo(() => {
    const targets = ["lx-new-chungmac-2025", "dongshin-polyma-samplebook", "kcc-senstyle-trendy-2025", "gaenari-artbook"];
    return sampleBooks.filter(b => targets.includes(b.id));
  }, []);

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
      { threshold: 0.1 }
    );

    reveals.forEach((el) => observer.observe(el));
    return () => {
      reveals.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <MainLayout>
      <div className="showroom-home-layout">
        
        {/* ==========================================
           1. Hero Section (Luxury Wide Image Centered)
           ========================================== */}
        <section className="showroom-hero">
          <div className="showroom-hero-visual">
            <div className="showroom-hero-slider">
              {HERO_SLIDES.map((slide, idx) => (
                <div 
                  key={slide.image}
                  className={`showroom-hero-slide ${idx === currentSlide ? "is-active" : ""}`}
                >
                  <img 
                    src={slide.image} 
                    alt={slide.title || "동경바닥재 바닥 시공 이미지"} 
                    className="showroom-hero-image"
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                  <div className="hero-v3-caption-overlay">
                    <span className="hero-v3-tag">{slide.tag}</span>
                    <h1 className="hero-v3-title">{slide.title}</h1>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Slide dots at bottom center */}
            <div className="hero-v3-dots">
              {HERO_SLIDES.map((_, idx) => (
                <span 
                  key={idx}
                  className={`hero-dot ${idx === currentSlide ? "active" : ""}`}
                  onClick={() => setCurrentSlide(idx)}
                ></span>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================
           2. Quick Navigation Section (Directly under Hero)
           ========================================== */}
        <section className="showroom-quick-menu-v3 container">
          <div className="quick-menu-v3-grid">
            <div className="quick-menu-v3-card" onClick={() => nav("/materials")}>
              <div className="quick-menu-v3-icon-wrap">🧱</div>
              <div className="quick-menu-v3-text">
                <span className="quick-menu-v3-label">자재 보러가기</span>
                <span className="quick-menu-v3-sub">다양한 바닥재 라인업</span>
              </div>
              <ChevronRight size={16} className="quick-menu-arrow" />
            </div>
            <div className="quick-menu-v3-card" onClick={() => nav("/samplebooks")}>
              <div className="quick-menu-v3-icon-wrap">📖</div>
              <div className="quick-menu-v3-text">
                <span className="quick-menu-v3-label">샘플북 보기</span>
                <span className="quick-menu-v3-sub">브랜드별 디지털 카탈로그</span>
              </div>
              <ChevronRight size={16} className="quick-menu-arrow" />
            </div>
            <div className="quick-menu-v3-card" onClick={() => nav("/estimate/request")}>
              <div className="quick-menu-v3-icon-wrap">📝</div>
              <div className="quick-menu-v3-text">
                <span className="quick-menu-v3-label">견적문의</span>
                <span className="quick-menu-v3-sub">수도권 무료 방문 실측</span>
              </div>
              <ChevronRight size={16} className="quick-menu-arrow" />
            </div>
            <div className="quick-menu-v3-card" onClick={() => nav("/cases")}>
              <div className="quick-menu-v3-icon-wrap">🏢</div>
              <div className="quick-menu-v3-text">
                <span className="quick-menu-v3-label">시공사례</span>
                <span className="quick-menu-v3-sub">검증된 완벽한 결과물</span>
              </div>
              <ChevronRight size={16} className="quick-menu-arrow" />
            </div>
          </div>
        </section>

        {/* ==========================================
           1.5 Trust Points Bar / 신뢰 포인트 바
           ========================================== */}
        <section className="showroom-trust-bar">
          <div className="trust-bar-container container">
            <div className="trust-bar-item">
              <div className="trust-bar-icon-wrap">
                <Award size={20} />
              </div>
              <div className="trust-bar-text">
                <h4 className="trust-bar-item-title">20년 이상 시공 경험</h4>
                <p className="trust-bar-item-desc">오직 바닥과 벽만 다져온 노하우</p>
              </div>
            </div>
            <div className="trust-bar-divider"></div>
            
            <div className="trust-bar-item">
              <div className="trust-bar-icon-wrap">
                <ShieldCheck size={20} />
              </div>
              <div className="trust-bar-text">
                <h4 className="trust-bar-item-title">주요 브랜드 취급</h4>
                <p className="trust-bar-item-desc">KCC, LX, 동신 등 정품 자재</p>
              </div>
            </div>
            <div className="trust-bar-divider"></div>

            <div className="trust-bar-item">
              <div className="trust-bar-icon-wrap">
                <FileText size={20} />
              </div>
              <div className="trust-bar-text">
                <h4 className="trust-bar-item-title">맞춤 상담 & 견적</h4>
                <p className="trust-bar-item-desc">현장 특성에 맞춘 자재 추천</p>
              </div>
            </div>
            <div className="trust-bar-divider"></div>

            <div className="trust-bar-item">
              <div className="trust-bar-icon-wrap">
                <CheckCircle size={20} />
              </div>
              <div className="trust-bar-text">
                <h4 className="trust-bar-item-title">정직한 자재 & 시공</h4>
                <p className="trust-bar-item-desc">정량 자재 사용과 책임 AS 보증</p>
              </div>
            </div>
            <div className="trust-bar-divider"></div>

            <div className="trust-bar-item">
              <div className="trust-bar-icon-wrap">
                <Users size={20} />
              </div>
              <div className="trust-bar-text">
                <h4 className="trust-bar-item-title">업자/현장 상담 가능</h4>
                <p className="trust-bar-item-desc">대량 납품 및 전문 시공 지원</p>
              </div>
            </div>
          </div>
        </section>



        {/* ==========================================
           2. Category Showcase Section
           ========================================== */}
        <section className="showroom-category-v2 reveal">
          <div className="section-header-v2 container">
            <span className="section-subtitle-v2">COLLECTIONS</span>
            <h2 className="section-title-v2">주요 자재 카테고리</h2>
            <p className="section-desc-v2">
              상가, 오피스, 아파트 등 용도에 맞추어 구성된 전문 컬렉션입니다.
            </p>
          </div>

          <div className="category-v2-grid container">
            {categories.map((cat, idx) => (
              <div 
                key={idx} 
                className="category-v2-card" 
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
        <section className="showroom-random-banner reveal">
          <div className="random-banner-container container">
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
        <section className="showroom-samplebooks-v2 reveal">
          <div className="section-header-v2 container">
            <span className="section-subtitle-v2">DIGITAL CATALOG</span>
            <h2 className="section-title-v2">브랜드별 샘플북</h2>
            <p className="section-desc-v2">
              KCC, LX, 동신, 개나리 등 주요 브랜드의 샘플북을 한눈에 확인하세요.
            </p>
          </div>

          <div className="samplebooks-v2-grid container">
            {homeSampleBooks.map((book) => (
              <div 
                key={book.id} 
                className="samplebook-v2-card"
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
        <section className="showroom-featured-v2 reveal">
          <div className="section-header-v2 container">
            <span className="section-subtitle-v2">CURATED LIST</span>
            <h2 className="section-title-v2">추천 자재</h2>
            <p className="section-desc-v2">
              현장에서 가장 선호도가 높고 시공 퀄리티가 검증된 자재들을 소개합니다.
            </p>
          </div>

          <div className="featured-v2-grid container">
            {featuredItems.map((mat) => (
              <FeaturedCard key={mat.id} mat={mat} />
            ))}
          </div>
        </section>

        {/* ==========================================
           5. Project / 시공사례 Section
           ========================================== */}
        <section className="showroom-projects-v2 reveal">
          <div className="section-header-v2 container">
            <span className="section-subtitle-v2">PORTFOLIO</span>
            <h2 className="section-title-v2">시공사례</h2>
            <p className="section-desc-v2">
              주거공간, 상업공간, 오피스 현장에서 완성된 바닥과 벽의 완벽한 조화
            </p>
          </div>

          <div className="projects-v2-grid container">
            {(dbProjects.length > 0 ? dbProjects : projects).map((proj) => (
              <div key={proj.id} className="project-v2-card">
                <div className="project-v2-img-frame">
                  <img src={proj.image} alt={proj.title} className="project-v2-img" />
                </div>
                <div className="project-v2-body">
                  <span className="project-v2-cat">{proj.category}</span>
                  <h3 className="project-v2-title">{proj.title}</h3>
                  <div className="project-v2-details">
                    <div className="project-v2-detail-item">
                      <span className="detail-lbl">사용 자재</span>
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
           6. Trust Section (Highlights & Numbers)
           ========================================== */}
        <section className="showroom-trust-v2 reveal">
          <div className="trust-v2-container container">
            <div className="trust-v2-grid">
              <div className="trust-v2-item">
                <span className="trust-v2-num">20+</span>
                <h4 className="trust-v2-title">시공 경험</h4>
                <p className="trust-v2-desc">20년 이상 오직 바닥재와 벽지 한 분야만을 전문으로 다져온 신뢰와 기술력</p>
              </div>
              <div className="trust-v2-item">
                <span className="trust-v2-num">1,000+</span>
                <h4 className="trust-v2-title">누적 시공 현장</h4>
                <p className="trust-v2-desc">아파트, 주택, 사무실, 쇼룸, 상가 등 다양한 규모와 환경의 완벽한 시공 경험</p>
              </div>
              <div className="trust-v2-item">
                <span className="trust-v2-num">100%</span>
                <h4 className="trust-v2-title">정품 자재 시공</h4>
                <p className="trust-v2-desc">KCC, LX, 동신, 개나리 등 국내 최고 브랜드의 공식 대리점 정품만을 사용</p>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
           6.5 Customer Support & Bank Info Section
           ========================================== */}
        <section className="showroom-support-info-v3 container reveal">
          <div className="support-info-v3-grid">
            <div className="support-info-card">
              <h3 className="support-card-title">고객센터 안내</h3>
              <a href="tel:02-487-9775" className="support-card-phone">02-487-9775</a>
              <p className="support-card-info"><strong>평일</strong> 07:00 - 18:00</p>
              <p className="support-card-info"><strong>주말</strong> 07:00 - 12:00</p>
              <p className="support-card-info email">이메일: <a href="mailto:dongk3089@naver.com">dongk3089@naver.com</a></p>
            </div>
            <div className="support-info-card">
              <h3 className="support-card-title">무통장 입금 계좌</h3>
              <p className="support-card-bank">농협은행 (NH Bank)</p>
              <p className="support-card-account">301-0298-9197-81</p>
              <p className="support-card-info depositor">예금주: 동경바닥재</p>
            </div>
          </div>
        </section>

        {/* ==========================================
           7. Contact / 견적문의 Section (V2 Revamped)
           ========================================== */}
        <section className="showroom-contact-v2 reveal">
          <div className="contact-v2-container container">
            <div className="contact-v2-content-pane">
              <span className="contact-v2-tag">CONSULTING & ESTIMATE</span>
              <h2 className="contact-v2-heading">자재 선택이 어렵다면<br />동경바닥재가 도와드립니다.</h2>
              <p className="contact-v2-subheading">
                현장 용도, 평수, 브랜드, 예산에 맞춰 적합한 바닥재와 벽지를 제안합니다.<br />
                수도권 무료 방문 실측 및 자재 샘플 상담을 지금 바로 받아보세요.
              </p>
              
              <div className="contact-v2-info-row">
                <div className="contact-v2-info-item">
                  <span className="info-lbl">대표 문의 번호</span>
                  <a href="tel:02-487-9775" className="info-val-phone">02-487-9775</a>
                </div>
                <div className="contact-v2-info-item">
                  <span className="info-lbl">운영 시간</span>
                  <span className="info-val-text">평일 07:00 ~ 18:00 / 주말 07:00 ~ 12:00</span>
                </div>
              </div>

              <div className="contact-v2-buttons">
                <a href="tel:02-487-9775" className="btn-contact-v2 btn-contact-v2-primary">
                  전화 상담하기
                </a>
                <Link to="/estimate/request" className="btn-contact-v2 btn-contact-v2-secondary">
                  온라인 견적 문의
                </Link>
                <Link to="/materials" className="btn-contact-v2 btn-contact-v2-outline">
                  자재 찾아보기
                </Link>
              </div>
            </div>

            <div className="contact-v2-image-pane">
              <img 
                src={estimateImg} 
                alt="동경바닥재 바닥재 및 벽지 상담 이미지" 
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
