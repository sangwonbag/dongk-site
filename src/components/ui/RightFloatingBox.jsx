import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Phone, X, ChevronUp } from "lucide-react";
import "./RightFloatingBox.css";

export default function RightFloatingBox({ hideOnPaths = [] }) {
    const loc = useLocation();
    const nav = useNavigate();
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);

    const hidden = hideOnPaths.some((p) => loc.pathname.startsWith(p)) || loc.pathname === "/";
    if (hidden) return null;

    return (
        <>
            {/* Desktop Floating Sidebar (Visible above 1100px) */}
            <aside className="right-float-desktop">
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

            {/* Mobile Collapsible Quick Panel (Visible below 1100px) */}
            <div className={`right-float-mobile ${isMobileExpanded ? "expanded" : "collapsed"}`}>
                {isMobileExpanded ? (
                    <div className="rf-mobile-drawer">
                        <div className="rf-mobile-header">
                            <h3>Quick 문의 및 정보</h3>
                            <button className="btn-close-drawer" onClick={() => setIsMobileExpanded(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="rf-mobile-body">
                            <div className="rf-mobile-section">
                                <div className="section-label">📞 고객센터</div>
                                <a href="tel:02-487-9775" className="section-phone-link">02-487-9775</a>
                                <p className="section-subtext">평일 07:00 ~ 18:00 / 주말 07:00 ~ 12:00</p>
                            </div>
                            <div className="rf-mobile-section">
                                <div className="section-label">💳 무통장 입금</div>
                                <p className="section-bank-info">농협 301-0298-9197-81</p>
                                <p className="section-subtext">예금주: (주)동경바닥재</p>
                            </div>
                            <div className="rf-mobile-actions">
                                <button className="btn-mobile-action-estimate" onClick={() => { setIsMobileExpanded(false); nav("/estimate/request"); }}>
                                    온라인 견적 문의
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button className="rf-mobile-trigger" onClick={() => setIsMobileExpanded(true)}>
                        <Phone size={15} /> <span>Quick 문의</span> <ChevronUp size={13} style={{ marginLeft: '4px' }} />
                    </button>
                )}
            </div>
        </>
    );
}
