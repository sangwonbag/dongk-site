import React from "react";
import "./Footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-info">
                    <p className="footer-corp">DK Floor</p>
                    <div className="footer-details">
                        <p>사업자등록번호: 890-88-02243</p>
                        <p>대표: 최화선</p>
                        <p>주소: 경기 하남시 서하남로 37</p>
                        <p>전화: 02-487-9775 <span>|</span> 010-8227-9055</p>
                        <p>팩스: 02-487-9787</p>
                        <p>이메일: dongk3089@naver.com</p>
                        <p>운영시간: 평일 07:00 ~ 18:00 / 주말 07:00 ~ 12:00</p>
                    </div>
                    <p className="footer-bank">
                        무통장 입금: 농협 301-0298-9197-81 (예금주: DK Floor)
                    </p>
                </div>
                <p className="footer-copyright">
                    Copyright © 2026 DK Floor. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
