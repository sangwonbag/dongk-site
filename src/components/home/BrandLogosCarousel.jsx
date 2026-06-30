import React, { useRef, useState, useEffect } from 'react';
import './BrandLogosCarousel.css';

const BRANDS = [
  { name: 'KCC', logo: '/images/brand logo/KCC.png' },
  { name: 'LX Z:IN', logo: '/images/brand logo/lxzin.png' },
  { name: '구정마루', logo: '/images/brand logo/구정마루로고.jpg' },
  { name: '녹수', logo: '/images/brand logo/녹수로고.png' },
  { name: '대진 데코리아', logo: '/images/brand logo/대진 데코리아로고.jpg' },
  { name: '동신포리마', logo: '/images/brand logo/동신포리마.png' },
  { name: '동화자연마루', logo: '/images/brand logo/동화마루.jpg' },
  { name: '유성', logo: '/images/brand logo/유성.png' },
  { name: '이건마루', logo: '/images/brand logo/이건마루로고.png' },
  { name: '재영타일', logo: '/images/brand logo/재영타일로고.jpg' },
  { name: '현대 L&C', logo: '/images/brand logo/현대L&C로고.jpg' }
];

export default function BrandLogosCarousel() {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const requestRef = useRef(null);

  // Triple the items to make infinite scroll seamless
  const displayBrands = [...BRANDS, ...BRANDS, ...BRANDS];

  // Auto-scroll loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastTime = performance.now();

    const animate = (time) => {
      if (!isHovered && !isDragging) {
        const delta = time - lastTime;
        // Speed: 0.03px per millisecond (extremely smooth slow panning)
        container.scrollLeft += 0.03 * delta;

        // Loop reset boundaries (seamless wrap around)
        const maxScroll = (container.scrollWidth / 3);
        if (container.scrollLeft >= maxScroll * 2) {
          container.scrollLeft -= maxScroll;
        } else if (container.scrollLeft <= 0) {
          container.scrollLeft += maxScroll;
        }
      }
      lastTime = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isHovered, isDragging]);

  // Handle Drag Start
  const handleStart = (e) => {
    const container = containerRef.current;
    if (!container) return;
    setIsDragging(true);
    const pageX = e.pageX || (e.touches && e.touches[0].pageX);
    if (pageX !== undefined) {
      setStartX(pageX - container.offsetLeft);
      setScrollLeft(container.scrollLeft);
    }
  };

  // Handle Drag Move
  const handleMove = (e) => {
    if (!isDragging) return;
    const container = containerRef.current;
    if (!container) return;
    const pageX = e.pageX || (e.touches && e.touches[0].pageX);
    if (pageX !== undefined) {
      const x = pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5; // Drag sensitivity multiplier
      container.scrollLeft = scrollLeft - walk;

      // Real-time loop wrapping while dragging to prevent running out of items
      const maxScroll = container.scrollWidth / 3;
      if (container.scrollLeft >= maxScroll * 2) {
        container.scrollLeft -= maxScroll;
        setStartX(x - (container.scrollLeft - scrollLeft) / 1.5);
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += maxScroll;
        setStartX(x - (container.scrollLeft - scrollLeft) / 1.5);
      }
    }
  };

  // Handle Drag End
  const handleEnd = () => {
    setIsDragging(false);
  };

  return (
    <section className="brand-logos-section reveal">
      <div className="container">
        <div className="brand-logos-header">
          <span className="brand-logos-tag">OFFICIAL PARTNERS</span>
          <h2 className="brand-logos-title">동경바닥재 공식 파트너 브랜드</h2>
          <p className="brand-logos-desc">국내외 최고 품질의 친환경 바닥재 및 벽지 정품 브랜드만을 취급합니다.</p>
        </div>
        
        <div 
          className={`brand-logos-viewport ${isDragging ? 'grabbing' : ''}`}
          ref={containerRef}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => { setIsHovered(false); handleEnd(); }}
        >
          <div className="brand-logos-track">
            {displayBrands.map((brand, idx) => (
              <div key={idx} className="brand-logo-item">
                <div className="brand-logo-card">
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    draggable="false"
                    className="brand-logo-img"
                  />
                  <span className="brand-logo-name">{brand.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
