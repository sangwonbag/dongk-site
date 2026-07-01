import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useEstimateCart } from "../../contexts/EstimateCartContext";
import { supabase } from "../../lib/supabaseClient";
import "./Login.css";

export default function Login() {
    const nav = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const { getPendingDirectOrder } = useEstimateCart();
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleKakaoLogin = async () => {
        try {
            setErrorMsg("");
            const searchParams = new URLSearchParams(location.search);
            const redirectUrl = searchParams.get("redirect") || "/";
            
            if (!supabase) {
                throw new Error("Supabase 클라이언트가 초기화되지 않았습니다.");
            }

            await supabase.auth.signInWithOAuth({
                provider: "kakao",
                options: {
                    redirectTo: `${window.location.origin}/login-callback?redirect=${encodeURIComponent(redirectUrl)}`
                }
            });
        } catch (err) {
            console.error("Kakao login request error:", err);
            setErrorMsg(`카카오 로그인 연결 중 오류가 발생했습니다. (${err.message || err.toString()})`);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (!userId.trim() || !password.trim()) {
            setErrorMsg("아이디 또는 비밀번호가 올바르지 않습니다.");
            return;
        }

        const result = await login(userId, password);

        if (result.success) {
            if (result.user.role === "admin" || result.user.role === "staff") {
                nav("/admin");
            } else {
                const pending = getPendingDirectOrder();
                if (pending) {
                    nav("/checkout");
                } else {
                    const searchParams = new URLSearchParams(location.search);
                    const redirectUrl = searchParams.get("redirect") || "/";
                    nav(redirectUrl);
                }
            }
        } else {
            setErrorMsg(result.message);
        }
    };

    return (
        <MainLayout>
            <div className="login-container">
                <div className="login-box">
                    <h1 className="login-title">로그인</h1>
                    
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <input 
                                type="text" 
                                placeholder="아이디를 입력하세요" 
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="login-input"
                            />
                        </div>
                        <div className="form-group">
                            <input 
                                type="password" 
                                placeholder="비밀번호를 입력하세요" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="login-input"
                            />
                        </div>

                        {errorMsg && <div className="login-error">{errorMsg}</div>}

                        <button type="submit" className="btn-login">
                            로그인
                        </button>

                        <div className="login-divider">
                            <span>또는</span>
                        </div>

                        <button 
                            type="button" 
                            className="btn-kakao-login" 
                            onClick={handleKakaoLogin}
                        >
                            <svg className="kakao-icon" viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: '8px' }}>
                                <path fill="currentColor" d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.558 1.707 4.8 4.27 6.054-.189.656-.68 2.361-.778 2.756-.122.499.182.493.385.357.16-.107 2.508-1.56 3.53-2.254.512.071 1.04.11 1.58.11 4.97 0 9-3.186 9-7.115C21 6.185 16.97 3 12 3z"/>
                            </svg>
                            카카오로 로그인
                        </button>
                        
                        <div className="login-footer" style={{ marginTop: '16px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
                            아직 계정이 없으신가요?{" "}
                            <span 
                                onClick={() => {
                                    const searchParams = new URLSearchParams(location.search);
                                    const redirectUrl = searchParams.get("redirect");
                                    nav(`/signup${redirectUrl ? '?redirect=' + encodeURIComponent(redirectUrl) : ''}`);
                                }} 
                                style={{ color: '#111', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', marginLeft: '6px' }}
                            >
                                회원가입
                            </span>
                        </div>

                        <div style={{ marginTop: '24px', fontSize: '12px', color: '#9ca3af', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                            <span onClick={() => nav("/terms-of-service")} style={{ cursor: 'pointer', textDecoration: 'underline' }}>이용약관</span>
                            <span>|</span>
                            <span onClick={() => nav("/privacy")} style={{ cursor: 'pointer', fontWeight: '700', color: '#4b5563', textDecoration: 'underline' }}>개인정보처리방침</span>
                        </div>

                        <button 
                            type="button" 
                            className="btn-go-home" 
                            onClick={() => nav("/")}
                            style={{ marginTop: '12px' }}
                        >
                            홈으로 돌아가기
                        </button>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
}
