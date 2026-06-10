import React, { useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { getTermsOfServiceText } from "../../data/termsText";
import { COMPANY_CONFIG } from "../../data/companyConfig";
import "../PrivacyPolicy/PrivacyPolicy.css";

export default function TermsOfService() {
    const text = getTermsOfServiceText(COMPANY_CONFIG);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <MainLayout>
            <div className="policy-page-container">
                <div className="policy-card">
                    <h1 className="policy-title">서비스 이용약관</h1>
                    <p className="policy-date">시행일자: 2026년 6월 10일</p>
                    <div className="policy-divider"></div>
                    <div className="policy-content">
                        {text.split("\n\n").map((paragraph, idx) => {
                            const trimmed = paragraph.trim();
                            if (trimmed.startsWith("-") || trimmed.includes("\n-")) {
                                return (
                                    <ul key={idx} className="policy-list">
                                        {trimmed.split("\n").map((item, itemIdx) => (
                                            <li key={itemIdx}>{item.replace(/^-\s*/, "")}</li>
                                        ))}
                                    </ul>
                                );
                            }
                            // Header styled paragraphs (e.g. 제1조 목적 또는 1. 수집 목적)
                            if (/^(제\d+조|\d+\.)/.test(trimmed)) {
                                return <h3 key={idx} className="policy-section-subtitle">{trimmed}</h3>;
                            }
                            return <p key={idx} className="policy-text-p">{trimmed}</p>;
                        })}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
