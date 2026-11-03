import React from "react";
import { Link } from "react-router-dom";
import { COMPANY_CONFIG } from "../../data/companyConfig";
import "./Footer.css";

export default function Footer() {
    return (
        <footer className="footer" role="contentinfo" aria-label="사이트 하단 정보">
            <div className="container">
                <div className="footer-links">
                    <Link to="/terms-of-service">서비스 이용약관</Link>
                    <span className="footer-link-divider">|</span>
                    <Link to="/privacy" className="privacy-policy-link">개인정보처리방침</Link>
                    <span className="footer-link-divider">|</span>
                    <Link to="/refund-policy">환불·교환·취소정책</Link>
                    <span className="footer-link-divider">|</span>
                    <Link to="/cookie-policy">쿠키정책</Link>
                </div>
                <div className="footer-info">
                    <p className="footer-corp">{COMPANY_CONFIG.companyName} ({COMPANY_CONFIG.serviceName})</p>
                    <div className="footer-details">
                        <p>대표자: {COMPANY_CONFIG.ownerName}</p>
                        <p>사업자등록번호: {COMPANY_CONFIG.businessNumber}</p>
                        <p>통신판매업신고: {COMPANY_CONFIG.ecommerceNumber}</p>
                        <p>호스팅서비스 제공: {COMPANY_CONFIG.hostingProvider}</p>
                        <p>사업장 주소: {COMPANY_CONFIG.address}</p>
                        <p>고객센터: {COMPANY_CONFIG.phone}</p>
                        <p>팩스: {COMPANY_CONFIG.fax}</p>
                        <p>이메일: {COMPANY_CONFIG.email}</p>
                        <p>개인정보 보호책임자: {COMPANY_CONFIG.privacyOfficer}</p>
                        <p>운영시간: {COMPANY_CONFIG.operatingHours}</p>
                    </div>
                    <p className="footer-bank">
                        무통장 입금 계좌: {COMPANY_CONFIG.bankAccount}
                    </p>
                </div>
                <p className="footer-copyright">
                    ⓒ 2026 {COMPANY_CONFIG.companyName}. All rights reserved. 본 사이트의 콘텐츠와 상표는 관련 법령에 의해 보호받습니다.
                </p>
            </div>
        </footer>
    );
}
