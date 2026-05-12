import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { getCurrentUser, logout } from "../../lib/auth";
import "./MyPage.css";

export default function MyPage() {
    const nav = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert("로그인이 필요합니다.");
            nav("/login");
            return;
        }
        setUser(currentUser);
    }, [nav]);

    const handleLogout = () => {
        logout();
        nav("/login");
    };

    if (!user) return <MainLayout><div className="mypage-loading">로딩 중...</div></MainLayout>;

    return (
        <MainLayout>
            <div className="mypage-container">
                <div className="mypage-header">
                    <h1 className="mypage-title">마이페이지</h1>
                    <button className="btn-mypage-logout" onClick={handleLogout}>로그아웃</button>
                </div>
                
                <div className="mypage-content">
                    {/* User Info Section */}
                    <section className="mypage-section">
                        <h2 className="section-title">내 정보</h2>
                        <div className="info-card">
                            <div className="info-row">
                                <span className="info-label">이름</span>
                                <span className="info-value">{user.name}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">아이디</span>
                                <span className="info-value">{user.username}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">전화번호</span>
                                <span className="info-value">{user.phone}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">회원 구분</span>
                                <span className="info-value">{user.user_type}</span>
                            </div>
                            {user.company_name && (
                                <div className="info-row">
                                    <span className="info-label">업체명</span>
                                    <span className="info-value">{user.company_name}</span>
                                </div>
                            )}
                            {user.address && (
                                <div className="info-row">
                                    <span className="info-label">주소</span>
                                    <span className="info-value">{user.address}</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Estimate History Placeholder */}
                    <section className="mypage-section">
                        <h2 className="section-title">견적요청 내역</h2>
                        <div className="empty-state">
                            <div className="empty-icon">📄</div>
                            <p>견적요청 내역은 준비 중입니다.</p>
                        </div>
                    </section>
                </div>
            </div>
        </MainLayout>
    );
}
