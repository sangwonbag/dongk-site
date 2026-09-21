import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { getCurrentUser, logout } from "../../lib/auth";
import { getCustomerEstimates } from "../../services/estimateInquiryService";
import CustomerEstimateView from "./CustomerEstimateView";
import SEO from "../../components/seo/SEO";
import { FileText, ChevronRight, X, Clock, CheckCircle2 } from "lucide-react";
import "./MyPage.css";

export default function MyPage() {
    const nav = useNavigate();
    const [user, setUser] = useState(null);
    const [estimates, setEstimates] = useState([]);
    const [loadingEst, setLoadingEst] = useState(true);
    const [selectedEstimate, setSelectedEstimate] = useState(null);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert("로그인이 필요합니다.");
            nav("/login");
            return;
        }
        setUser(currentUser);
        fetchUserEstimates(currentUser);
    }, [nav]);

    const fetchUserEstimates = async (currentUser) => {
        setLoadingEst(true);
        try {
            const data = await getCustomerEstimates(currentUser);
            setEstimates(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingEst(false);
        }
    };

    const handleLogout = () => {
        logout();
        nav("/login");
    };

    if (!user) return <MainLayout><SEO title="마이페이지 | 동경바닥재" noindex={true} /><div className="mypage-loading">로딩 중...</div></MainLayout>;

    return (
        <MainLayout>
            <SEO title="마이페이지 | 동경바닥재" noindex={true} canonical="https://dkfloor.co.kr/mypage" />
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

                    {/* Customer Estimate Inquiry List Section */}
                    <section className="mypage-section">
                        <div className="section-title-row">
                            <h2 className="section-title">내 시공 상담 및 견적 확인</h2>
                            <span className="count-badge">{estimates.length}건</span>
                        </div>

                        {loadingEst ? (
                            <div className="mypage-loading-sm">시공 견적 내역을 불러오는 중...</div>
                        ) : estimates.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon"><FileText size={32} /></div>
                                <p>접수된 시공 상담 및 견적 내역이 없습니다.</p>
                                <button className="btn-go-estimate mt-2" onClick={() => nav('/estimate/request')}>
                                    시공 상담 신청하기
                                </button>
                            </div>
                        ) : (
                            <div className="mypage-estimate-list">
                                {estimates.map(item => {
                                    const firstItem = item.selected_items && item.selected_items.length > 0 ? item.selected_items[0] : null;
                                    const matName = firstItem ? (firstItem.product_name || firstItem.name) : '선택 자재';
                                    const displayTotal = item.final_amount && Number(item.final_amount) > 0 ? Number(item.final_amount) : (item.total || 0);

                                    return (
                                        <div key={item.id} className="mypage-estimate-card" onClick={() => setSelectedEstimate(item)}>
                                            <div className="card-top font-mono">
                                                <span>접수일: {new Date(item.created_at).toLocaleDateString('ko-KR')}</span>
                                                <span className="est-no">[{item.estimate_no || item.id.substring(0, 8)}]</span>
                                            </div>
                                            <div className="card-mid">
                                                <strong className="mat-title">{matName} {item.selected_items?.length > 1 ? `외 ${item.selected_items.length - 1}건` : ''}</strong>
                                                <div className="badge-wrap">
                                                    {item.customer_response === 'approved' ? (
                                                        <span className="badge-status badge-approved"><CheckCircle2 size={12} /> 진행 요청 완료</span>
                                                    ) : item.customer_response === 'on_hold' ? (
                                                        <span className="badge-status badge-hold">고객 보류</span>
                                                    ) : (
                                                        <span className="badge-status badge-ready">{item.status || '상담 진행 중'}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="card-bot">
                                                <div className="location-text">현장: {item.site_address || '주소 미입력'} ({item.area_pyeong ? `${item.area_pyeong}평` : '-'})</div>
                                                <div className="amount-text font-mono">
                                                    {displayTotal > 0 ? `${displayTotal.toLocaleString()}원` : '견적 산정 중'}
                                                    <ChevronRight size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* Customer Quote Detail Modal */}
            {selectedEstimate && (
                <div className="customer-modal-overlay" onClick={() => setSelectedEstimate(null)}>
                    <div className="customer-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="customer-modal-header">
                            <h2>시공 견적 상세서</h2>
                            <button className="btn-modal-close" onClick={() => setSelectedEstimate(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="customer-modal-body">
                            <CustomerEstimateView
                                estimateData={selectedEstimate}
                                isModal={true}
                                onClose={() => setSelectedEstimate(null)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
