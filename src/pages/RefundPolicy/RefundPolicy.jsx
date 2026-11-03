import React, { useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { getRefundPolicyText } from "../../data/termsText";
import { COMPANY_CONFIG } from "../../data/companyConfig";
import SEO from "../../components/seo/SEO";
import "../PrivacyPolicy/PrivacyPolicy.css";

export default function RefundPolicy() {
    const text = getRefundPolicyText(COMPANY_CONFIG);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <MainLayout>
            <SEO 
                title="환불·교환·취소정책 | 동경바닥재"
                description="동경바닥재 주문 취소, 환불 및 교환/반품 규정 안내"
                canonical="https://dkfloor.co.kr/refund-policy"
            />
            <div className="policy-page-container">
                <div className="policy-card">
                    <h1 className="policy-title">환불·교환·취소정책</h1>
                    <p className="policy-date">시행일자: 2026년 7월 1일</p>
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

