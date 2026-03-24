import React from "react";
import "./FloatingPhoneButton.css";

export default function FloatingPhoneButton() {
    return (
        <a href="tel:024879775" className="floating-phone-btn">
            <span className="phone-icon">📞</span>
            <span className="phone-text">전화 문의</span>
        </a>
    );
}
