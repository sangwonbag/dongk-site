import React from "react";
import { useLocation } from "react-router-dom";
import { KAKAO_CHAT_URL, OFFICE_PHONE } from "../../constants/contact";
import "./FloatingPhoneButton.css";

export default function FloatingPhoneButton() {
    const location = useLocation();
    
    // Hide floating inquiry buttons only on admin back-office routes
    const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/admin-orders');
    if (isAdminRoute) return null;

    const phoneTel = (OFFICE_PHONE || "02-487-9775").replace(/-/g, "");

    return (
        <aside className="floating-buttons-container" aria-label="빠른 고객 상담 및 문의">
            <a 
              href={KAKAO_CHAT_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="floating-kakao-btn"
              title="카카오톡 1:1 상담 문의"
              aria-label="카카오톡 1:1 상담 문의"
            >
                <svg className="kakao-svg-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path fill="currentColor" d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.558 1.707 4.8 4.27 6.054-.189.656-.68 2.361-.778 2.756-.122.499.182.493.385.357.16-.107 2.508-1.56 3.53-2.254.512.071 1.04.11 1.58.11 4.97 0 9-3.186 9-7.115C21 6.185 16.97 3 12 3z"/>
                </svg>
                <span className="kakao-text">카톡 문의</span>
            </a>
            <a 
              href={`tel:${phoneTel}`} 
              className="floating-phone-btn"
              title="동경바닥재 전화 문의"
              aria-label="동경바닥재 전화 문의"
            >
                <span className="phone-icon" aria-hidden="true">📞</span>
                <span className="phone-text">전화 문의</span>
            </a>
        </aside>
    );
}
