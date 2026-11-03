import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, X } from "lucide-react";
import "./CookieConsentBanner.css";

const COOKIE_CONSENT_KEY = "dk_cookie_consent";

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        // Show banner after brief delay to avoid layout shift
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage access disabled or in private browsing
    }
  }, []);

  const handleConsent = (allAccepted = true) => {
    try {
      const consentData = {
        necessary: true,
        analytics: allAccepted,
        marketing: false,
        consentedAt: new Date().toISOString()
      };
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    } catch {
      // Ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="cookie-banner-wrapper" 
      role="region" 
      aria-label="쿠키 및 데이터 저장 동의 안내"
    >
      <div className="cookie-banner-content">
        <div className="cookie-banner-icon" aria-hidden="true">
          <ShieldCheck size={24} color="#D4AF37" />
        </div>
        <div className="cookie-banner-text">
          <p className="cookie-banner-title">
            동경바닥재는 원활한 서비스 제공을 위해 필수 쿠키 및 로컬 저장소를 사용합니다.
          </p>
          <p className="cookie-banner-desc">
            로그인 세션 유지, 장바구니 및 견적 임시 저장 등 필수적인 기능에 활용되며, 마케팅 추적 목적으로는 이용되지 않습니다.{" "}
            <Link to="/cookie-policy" className="cookie-link">
              쿠키정책 보기
            </Link>
          </p>
        </div>
        <div className="cookie-banner-actions">
          <button 
            type="button" 
            className="cookie-btn-secondary" 
            onClick={() => handleConsent(false)}
          >
            필수 항목만 수락
          </button>
          <button 
            type="button" 
            className="cookie-btn-primary" 
            onClick={() => handleConsent(true)}
          >
            모두 수락
          </button>
          <button 
            type="button" 
            className="cookie-btn-close" 
            onClick={() => handleConsent(false)}
            aria-label="쿠키 안내 닫기"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

