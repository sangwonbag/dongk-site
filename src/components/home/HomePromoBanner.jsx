import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pause, Play, Truck, ShieldCheck, Hammer, ArrowRight } from "lucide-react";
import { getCaseImageUrl } from "../../utils/caseImageUtils";
import { preloadRoute } from "../../utils/routePreloader";
import "./HomePromoBanner.css";

const AUTO_PLAY_MS = 5000;

const VERIFIED_SLIDE_IMAGES = {
  kcc: "/images/시공사례_optimized/thumb-800/25.07.31%20KCC%205518%20%ED%95%9C%EC%96%91%EB%8C%80%20%ED%93%A8%EC%A0%84%ED%85%8C%ED%81%AC%EC%84%BC%ED%84%B0/KakaoTalk_20261113_142105152.webp",
  delivery: "/images/시공사례_optimized/thumb-800/25.07.16%20KCC%205551%20%EA%B0%80%EB%9D%BD%EB%8F%99%20%EC%98%A4%ED%94%BC%EC%8A%A4%ED%85%94/KakaoTalk_20261113_132034837.webp",
  constructionFallback: "/images/시공사례_optimized/thumb-800/25.07.24%20%EB%8F%99%EC%8B%A0%20726%20%EA%B5%AC%EC%9D%98%EB%8F%99%20%EC%95%84%ED%8C%8C%ED%8A%B8/KakaoTalk_20261113_133133183.webp",
};

export default function HomePromoBanner({ recentCases = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(
    () => typeof document !== "undefined" && document.hidden
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [failedImages, setFailedImages] = useState({});

  const touchStartRef = useRef({ x: 0, y: 0, active: false });

  // Use the latest real published construction case image for Slide 3 if available
  const slide3Image = useMemo(() => {
    const firstCase = Array.isArray(recentCases) && recentCases.length > 0 ? recentCases[0] : null;
    if (firstCase?.main_image_url) {
      const optimized = getCaseImageUrl(firstCase.main_image_url, "800");
      if (optimized && optimized !== "/images/no-image.svg") return optimized;
    }
    return VERIFIED_SLIDE_IMAGES.constructionFallback;
  }, [recentCases]);

  const slides = useMemo(
    () => [
      {
        id: "kcc-distributor",
        theme: "theme-navy",
        badge: "KCC 바닥재 총판",
        badgeIcon: ShieldCheck,
        title: "KCC 바닥재, 동경바닥재에서 만나보세요.",
        highlight: "",
        description: "센스타일 트랜디 · 프로 · 센스레이 등 다양한 KCC 데코타일을 확인하세요.",
        ctaLabel: "KCC 자재 보러가기",
        ctaTo: "/materials?category=%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC&brand=KCC",
        preloadPath: "/materials",
        imageUrl: VERIFIED_SLIDE_IMAGES.kcc,
        imageAlt: "KCC 바닥재 시공 현장 이미지",
        visualTag: "KCC 센스타일 트랜디 · 프로 · 센스레이",
      },
      {
        id: "free-delivery-50",
        theme: "theme-blue",
        badge: "배송 혜택 안내",
        badgeIcon: Truck,
        title: "데코타일 50평 이상 주문 시",
        highlight: "무료배송!",
        description:
          "동일 브랜드 기준 50평 이상 주문 시 무료배송 혜택을 제공합니다. 50평 미만 주문은 화물 착불 배송이며, 사무실 직접수령 및 당일 퀵 배송도 선택할 수 있습니다.",
        ctaLabel: "데코타일 주문하기",
        ctaTo: "/materials?category=%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC",
        preloadPath: "/materials",
        imageUrl: VERIFIED_SLIDE_IMAGES.delivery,
        imageAlt: "데코타일 50평 이상 무료배송 안내",
        visualTag: "50평 이상 무료배송 · 화물 / 직접수령 / 퀵",
        showTruckBadge: true,
      },
      {
        id: "pro-construction",
        theme: "theme-charcoal",
        badge: "시공 전문업체 연계",
        badgeIcon: Hammer,
        title: "바닥재 선택부터 전문 시공까지",
        highlight: "",
        description:
          "아파트 · 주택 · 사무실 · 상가 · 학원 · 헬스장 등 다양한 공간의 바닥재 시공을 상담하세요. 자재 상담부터 현장에 맞는 시공업체 연계까지 도와드립니다.",
        ctaLabel: "시공사례 확인하기",
        ctaTo: "/cases",
        preloadPath: "/cases",
        imageUrl: slide3Image,
        imageAlt: "동경바닥재 실제 바닥재 시공 완공 현장",
        visualTag: "실제 동경바닥재 완공 현장",
      },
    ],
    [slide3Image]
  );

  const slideCount = slides.length;

  const goToSlide = useCallback(
    (index) => {
      setActiveIndex(((index % slideCount) + slideCount) % slideCount);
    },
    [slideCount]
  );

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  // Listen for prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener?.("change", handleChange);
    return () => mq.removeEventListener?.("change", handleChange);
  }, []);

  // Pause auto-rotation when browser tab is hidden
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const handleVisibility = () => setIsTabHidden(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Auto-advance every 5 seconds; timer resets whenever activeIndex changes (including manual navigation)
  const shouldAutoPlay = !isPaused && !isHovered && !isTabHidden && !prefersReducedMotion;
  useEffect(() => {
    if (!shouldAutoPlay) return undefined;
    const timer = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }, AUTO_PLAY_MS);
    return () => window.clearTimeout(timer);
  }, [shouldAutoPlay, activeIndex, slideCount]);

  // Mobile touch swipe handlers (distinguish horizontal swipe from vertical page scroll)
  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, active: true };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current.active || !e.changedTouches || e.changedTouches.length === 0) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    touchStartRef.current.active = false;

    // Trigger slide change only on deliberate horizontal swipe
    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  };

  return (
    <section
      className="home-promo-banner-section"
      aria-roledescription="carousel"
      aria-label="동경바닥재 주요 홍보 배너"
    >
      <div className="container">
        <div
          className="home-promo-banner-frame"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slides Track */}
          <div
            className={`home-promo-track ${prefersReducedMotion ? "is-reduced-motion" : ""}`}
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {slides.map((slide, idx) => {
              const BadgeIcon = slide.badgeIcon;
              const isImgFailed = Boolean(failedImages[slide.id]);
              return (
                <div
                  key={slide.id}
                  className={`home-promo-slide ${slide.theme}`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${idx + 1} / ${slideCount}: ${slide.title}`}
                  aria-hidden={activeIndex !== idx}
                >
                  {/* Text Content */}
                  <div className="promo-slide-content">
                    <div className="promo-slide-badge">
                      <BadgeIcon size={14} aria-hidden="true" />
                      <span>{slide.badge}</span>
                    </div>

                    <h2 className="promo-slide-title">
                      {slide.highlight ? (
                        <>
                          <span className="promo-title-lead">{slide.title}</span>{" "}
                          <strong className="promo-title-highlight">{slide.highlight}</strong>
                        </>
                      ) : (
                        slide.title
                      )}
                    </h2>

                    <p className="promo-slide-desc">{slide.description}</p>

                    <div className="promo-slide-cta-row">
                      <Link
                        to={slide.ctaTo}
                        className="promo-slide-cta-btn"
                        tabIndex={activeIndex === idx ? 0 : -1}
                        onMouseEnter={() => preloadRoute(slide.preloadPath)}
                      >
                        <span>{slide.ctaLabel}</span>
                        <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>

                  {/* Visual Media Panel */}
                  <div className="promo-slide-visual" aria-hidden="true">
                    {!isImgFailed && slide.imageUrl && (
                      <img
                        src={slide.imageUrl}
                        alt={slide.imageAlt}
                        className="promo-slide-img"
                        loading={idx === 0 ? "eager" : "lazy"}
                        fetchPriority={idx === 0 ? "high" : "auto"}
                        decoding="async"
                        width="640"
                        height="320"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [slide.id]: true }))
                        }
                      />
                    )}
                    <div className="promo-slide-visual-overlay" />
                    {slide.showTruckBadge && (
                      <div className="promo-truck-pill">
                        <Truck size={20} />
                        <div>
                          <strong>50평 이상 무료배송</strong>
                          <span>화물 · 직접수령 · 당일 퀵</span>
                        </div>
                      </div>
                    )}
                    <span className="promo-visual-caption">{slide.visualTag}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prev / Next Controls */}
          <button
            type="button"
            className="promo-nav-btn promo-nav-prev"
            onClick={goPrev}
            aria-label="이전 배너"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="promo-nav-btn promo-nav-next"
            onClick={goNext}
            aria-label="다음 배너"
          >
            <ChevronRight size={20} />
          </button>

          {/* Bottom Controls: Counter + Dots + Pause/Play */}
          <div className="promo-bottom-controls">
            <span className="promo-counter" aria-live="polite">
              {activeIndex + 1} / {slideCount}
            </span>

            <div className="promo-dots" role="tablist" aria-label="배너 슬라이드 선택">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={activeIndex === idx}
                  aria-label={`${idx + 1}번 배너로 이동`}
                  className={`promo-dot ${activeIndex === idx ? "is-active" : ""}`}
                  onClick={() => goToSlide(idx)}
                />
              ))}
            </div>

            <button
              type="button"
              className="promo-pause-btn"
              onClick={() => setIsPaused((p) => !p)}
              aria-label={isPaused ? "자동 전환 재생" : "자동 전환 일시 정지"}
              title={isPaused ? "자동 전환 재생" : "자동 전환 일시 정지"}
            >
              {isPaused ? <Play size={12} /> : <Pause size={12} />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
