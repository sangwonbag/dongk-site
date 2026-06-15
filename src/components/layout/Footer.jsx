import React from "react";
import { Link } from "react-router-dom";
import { COMPANY_CONFIG } from "../../data/companyConfig";
import "./Footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-links">
                    <Link to="/terms-of-service">서비스 이용약관</Link>
                    <span className="footer-link-divider">|</span>
                    <Link to="/privacy-policy" className="privacy-policy-link">개인정보처리방침</Link>
                </div>
                <div className="footer-info">
                    <p className="footer-corp">{COMPANY_CONFIG.serviceName}</p>
                    <div className="footer-details">
                        {/* TODO: 실제 사업자 정보 및 법무 검토 필요 */}
                        <p>사업자등록번호: {COMPANY_CONFIG.businessNumber}</p>
                        <p>대표: {COMPANY_CONFIG.ownerName}</p>
                        <p>주소: {COMPANY_CONFIG.address}</p>
                        <p>전화: {COMPANY_CONFIG.phone}</p>
                        <p>팩스: {COMPANY_CONFIG.fax}</p>
                        <p>이메일: {COMPANY_CONFIG.email}</p>
                        <p>운영시간: 평일 07:00 ~ 18:00 / 주말 07:00 ~ 12:00</p>
                    </div>
                    <p className="footer-bank">
                        무통장 입금: {COMPANY_CONFIG.bankAccount}
                    </p>
                </div>
                <p className="footer-copyright">
                    ⓒ 2025 DongKyung Flooring. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
