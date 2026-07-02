import React from "react";
import { KAKAO_CHAT_URL } from "../../constants/contact";
import "./FloatingPhoneButton.css";

export default function FloatingPhoneButton() {
    return (
        <div className="floating-buttons-container">
            <a 
              href={KAKAO_CHAT_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="floating-kakao-btn"
            >
                <span className="kakao-icon">💬</span>
                <span className="kakao-text">카톡 문의</span>
            </a>
            <a href="tel:024879775" className="floating-phone-btn">
                <span className="phone-icon">📞</span>
                <span className="phone-text">전화 문의</span>
            </a>
        </div>
    );
}
