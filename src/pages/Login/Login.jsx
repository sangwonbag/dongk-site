import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { login } from "../../lib/auth";
import "./Login.css";

export default function Login() {
    const nav = useNavigate();
    const location = useLocation();
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (!userId.trim() || !password.trim()) {
            setErrorMsg("아이디 또는 비밀번호가 올바르지 않습니다.");
            return;
        }

        const result = await login(userId, password);

        if (result.success) {
            if (result.user.role === "admin") {
                nav("/admin");
            } else {
                const searchParams = new URLSearchParams(location.search);
                const redirectUrl = searchParams.get("redirect") || "/";
                nav(redirectUrl);
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
