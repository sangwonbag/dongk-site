import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { preloadRoute } from "../../utils/routePreloader";
import promoBanner1Kcc from "../../assets/banners/promo-banner-1-kcc.jpg";
import promoBanner2FreeDelivery from "../../assets/banners/promo-banner-2-free-delivery.jpg";
import promoBanner3Construction from "../../assets/banners/promo-banner-3-construction.jpg";
import "./HomePromoBanner.css";

const AUTO_PLAY_MS = 5000;

const PROMO_SLIDES = [
  {
    id: "pro-construction",
    title: "바닥재 전문 시공업체 연계",
    fallbackSubtitle: "주택 · 상가 · 사무실 · 학원 · 헬스장 전문 시공 연계",
    to: "/cases",
    preloadPath: "/cases",
    imageUrl: promoBanner3Construction,
    imageAlt: "동경바닥재 바닥재 전문 시공업체 연계 - 주택 · 상가 · 사무실 · 학원 · 헬스장",
  },
  {
    id: "kcc-distributor",
    title: "KCC 바닥재 총판",
    fallbackSubtitle: "센스타일 트랜디 · 프로 · 센스레이 취급 · 데코타일 상담 · 주문 · 시공 연계 가능",
    to: "/materials?category=%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC&brand=KCC",
    preloadPath: "/materials",
    imageUrl: promoBanner1Kcc,
    imageAlt: "동경바닥재 KCC 바닥재 총판 - 센스타일 트랜디 · 프로 · 센스레이 취급, 데코타일 상담·주문·시공 연계 가능",
  },
  {
    id: "free-delivery-50",
    title: "데코타일 50평 이상 무료배송",
    fallbackSubtitle: "동일 브랜드 기준 50평 이상 주문 시 무료배송",
    to: "/materials?category=%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC",
    preloadPath: "/materials",
    imageUrl: promoBanner2FreeDelivery,
    imageAlt: "동경바닥재 데코타일 50평 이상 무료배송 - 동일 브랜드 기준 50평 이상 주문 시 무료배송",
  },
];

export default function HomePromoBanner() {
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
  const slideCount = PROMO_SLIDES.length;

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

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener?.("change", handleChange);
    return () => mq.removeEventListener?.("change", handleChange);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const handleVisibility = () => setIsTabHidden(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const shouldAutoPlay = !isPaused && !isHovered && !isTabHidden && !prefersReducedMotion;
  useEffect(() => {
    if (!shouldAutoPlay) return undefined;
    const timer = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }, AUTO_PLAY_MS);
    return () => window.clearTimeout(timer);
  }, [shouldAutoPlay, activeIndex, slideCount]);

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
          className="home-promo-banner-shell"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="home-promo-banner-frame">
            <div
              className={`home-promo-track ${prefersReducedMotion ? "is-reduced-motion" : ""}`}
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {PROMO_SLIDES.map((slide, idx) => {
                const isFailed = Boolean(failedImages[slide.id]);
                return (
                  <Link
                    key={slide.id}
                    to={slide.to}
                    className="home-promo-image-slide"
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${idx + 1} / ${slideCount}: ${slide.title}`}
                    aria-hidden={activeIndex !== idx}
                    tabIndex={activeIndex === idx ? 0 : -1}
                    onMouseEnter={() => preloadRoute(slide.preloadPath)}
                  >
                    {!isFailed ? (
                      <>
                        {/* Subtle ambient fill on wide PC screens so 16:9 image never stretches or crops */}
                        <img
                          src={slide.imageUrl}
                          alt=""
                          aria-hidden="true"
                          className="promo-slide-ambient-bg"
                          loading={idx === 0 ? "eager" : "lazy"}
                          decoding="async"
                        />
                        <img
                          src={slide.imageUrl}
                          alt={slide.imageAlt}
                          className="promo-slide-full-img"
                          loading={idx === 0 ? "eager" : "lazy"}
                          fetchPriority={idx === 0 ? "high" : "auto"}
                          decoding="async"
                          width="1024"
                          height="576"
                          onError={() =>
                            setFailedImages((prev) => ({ ...prev, [slide.id]: true }))
                          }
                        />
                      </>
                    ) : (
                      <div className="promo-slide-fallback">
                        <strong>{slide.title}</strong>
                        <span>{slide.fallbackSubtitle}</span>
                      </div>
                    )}
                  </Link>
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
          </div>

          {/* Dedicated Control Strip Below Image (zero overlap with logos/text on all slides) */}
          <div className="promo-control-strip">
            <span className="promo-counter" aria-live="polite">
              {activeIndex + 1} / {slideCount}
            </span>

            <div className="promo-dots" role="tablist" aria-label="배너 슬라이드 선택">
              {PROMO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={activeIndex === idx}
                  aria-label={`${idx + 1}번 배너(${slide.title})로 이동`}
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
