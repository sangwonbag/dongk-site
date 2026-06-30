import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ScrollRevealMenu.css';

export default function ScrollRevealMenu() {
  const [isVisible, setVisible] = useState(false);
  const { pathname } = useLocation();

  // Hide the reveal menu entirely on admin routes
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/admin-orders');

  useEffect(() => {
    if (isAdminRoute) {
      setVisible(false);
      return;
    }

    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const diff = currentScrollY - lastScrollY;

          // 1. Hide if scrolled near top (less than 80px)
          if (currentScrollY < 80) {
            setVisible(false);
          } 
          // 2. Otherwise detect scroll direction if distance scrolled is over 10px
          else if (Math.abs(diff) > 10) {
            if (diff > 0) {
              // Scrolled down -> reveal menu
              setVisible(true);
            } else {
              // Scrolled up -> hide menu
              setVisible(false);
            }
            lastScrollY = currentScrollY;
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isAdminRoute]);

  if (isAdminRoute) return null;

  return (
    <div className={`scroll-reveal-menu ${isVisible ? 'is-visible' : ''}`}>
      <div className="scroll-reveal-menu-inner">
        <Link to="/" className="scroll-reveal-menu-logo" aria-label="동경바닥재 홈">
          DK Floor
        </Link>
        <nav className="scroll-reveal-menu-nav" aria-label="상단 스크롤 메뉴">
          <Link to="/" className={`scroll-reveal-menu-link ${pathname === '/' ? 'active' : ''}`}>
            홈
          </Link>
          <Link to="/materials" className={`scroll-reveal-menu-link ${pathname.startsWith('/materials') ? 'active' : ''}`}>
            자재찾기
          </Link>
          <Link to="/samplebooks" className={`scroll-reveal-menu-link ${pathname.startsWith('/samplebooks') ? 'active' : ''}`}>
            샘플북
          </Link>
          <Link to="/cases" className={`scroll-reveal-menu-link ${pathname.startsWith('/cases') ? 'active' : ''}`}>
            시공사례
          </Link>
          <Link to="/estimate/request" className={`scroll-reveal-menu-link ${pathname.startsWith('/estimate') ? 'active' : ''}`}>
            견적문의
          </Link>
        </nav>
        <Link to="/estimate/request" className="scroll-reveal-menu-cta">
          빠른 견적 신청
        </Link>
      </div>
    </div>
  );
}
