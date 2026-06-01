import React from "react";
import { useLocation } from "react-router-dom";
import "./RightFloatingBox.css";

export default function RightFloatingBox({ hideOnPaths = [] }) {
    const loc = useLocation();
    const hidden = hideOnPaths.some((p) => loc.pathname.startsWith(p));
    if (hidden) return null;

    return (
        <aside className="right-float">
            <div className="rf-card">
                <div className="rf-title">고객센터</div>
                <div className="rf-value">02-487-9775</div>
                <div className="rf-sub">평일 07:00 - 18:00</div>
                <div className="rf-sub">주말 07:00 - 12:00</div>
                <div className="rf-sub" style={{ marginTop: '8px' }}>이메일: dongk309@naver.com</div>
            </div>

            <div className="rf-card">
                <div className="rf-title">무통장 입금</div>
                <div className="rf-sub">농협</div>
                <div className="rf-value" style={{ fontSize: '15px' }}>301-0298-9197-81</div>
                <div className="rf-sub">예금주 (주) 동경바닥재</div>
                <div className="rf-note">입금 확인 후 순차적으로 견적/배송 처리됩니다.</div>
            </div>
        </aside>
    );
}
