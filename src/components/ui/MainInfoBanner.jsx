import React from "react";
import { useNavigate } from "react-router-dom";
import "./MainInfoBanner.css";

export default function MainInfoBanner() {
    const nav = useNavigate();

    return (
        <div className="main-info-banner">
            {/* Top: Text Info */}
            <div className="mib-content">
                <span className="mib-badge">배송 안내</span>
                <h2 className="mib-title">KCC · 동신 배송 및 견적 안내</h2>
                <p className="mib-desc">
                    KCC 데코타일 50평 이상 무료배송<br className="mobile-br" />
                    KCC · 동신 제품 대량 구매 시 배송 가능
                </p>
            </div>

            {/* Bottom: Action Buttons */}
            <div className="mib-actions">
                <button className="mib-btn" onClick={() => nav("/materials")}>
                    <span className="mib-btn-title">자재 보러가기</span>
                    <span className="mib-btn-arrow">→</span>
                </button>
                <div className="mib-divider"></div>
                <button className="mib-btn" onClick={() => nav("/samplebooks")}>
                    <span className="mib-btn-title">샘플북 보기</span>
                    <span className="mib-btn-arrow">→</span>
                </button>
            </div>
        </div>
    );
}
