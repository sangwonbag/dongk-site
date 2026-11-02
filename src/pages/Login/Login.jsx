import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useEstimateCart } from "../../contexts/EstimateCartContext";
import { supabase } from "../../lib/supabaseClient";
import { findUsernameByEmail, requestPasswordReset } from "../../lib/auth";
import SEO from "../../components/seo/SEO";
import { Eye, EyeOff, Mail, X, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import "./Login.css";

import { getSafeRedirectUrl } from "../../utils/urlUtils";

export default function Login() {
    const nav = useNavigate();
    const location = useLocation();
    const { user, login } = useAuth();
    const { getPendingDirectOrder } = useEstimateCart();


    // Auto-redirect if already logged in or right after authentication succeeds
    React.useEffect(() => {
        if (user && user.isLoggedIn) {
            const searchParams = new URLSearchParams(location.search);
            const rawRedirect = searchParams.get("redirect");
            let target = (user.role === "admin" || user.role === "staff") ? "/admin" : "/";
            if (rawRedirect) {
                const safe = getSafeRedirectUrl(rawRedirect, target);
                if (safe !== "/login" && !safe.startsWith("/login?") && !safe.startsWith("/login/")) {
                    target = safe;
                }
            }
            nav(target, { replace: true });
        }
    }, [user, location.search, nav]);

    // Login Form State
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isKakaoHint, setIsKakaoHint] = useState(false);
    const [loginButtonStatus, setLoginButtonStatus] = useState("idle"); // "idle" | "submitting" | "auth_failed" | "network_error" | "timeout"
    const isSubmittingRef = React.useRef(false);

    const getLoginButtonText = () => {
        switch (loginButtonStatus) {
            case "submitting":
                return "로그인 중...";
            case "auth_failed":
                return "아이디 또는 비밀번호 오류";
            case "network_error":
                return "연결 오류 및 다시 시도";
            case "timeout":
                return "응답 지연 안내 및 다시 시도";
            default:
                return "로그인";
        }
    };

    // Modal State: null | 'find-id' | 'find-password'
    const [activeModal, setActiveModal] = useState(() => {
        const search = new URLSearchParams(location.search);
        const tab = search.get("tab");
        if (tab === "find-id") return "find-id";
        if (tab === "find-password" || tab === "reset") return "find-password";
        return null;
    });

    // Find ID State
    const [findIdEmail, setFindIdEmail] = useState("");
    const [isSearchingId, setIsSearchingId] = useState(false);
    const [findIdResult, setFindIdResult] = useState(null); // { success, maskedId, isKakao, message, createdAt }

    // Find Password State
    const [resetEmail, setResetEmail] = useState("");
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [resetResult, setResetResult] = useState(null); // { success, message, isKakao }

    const handleKakaoLogin = async () => {
        try {
            setErrorMsg("");
            const searchParams = new URLSearchParams(location.search);
            const redirectUrl = getSafeRedirectUrl(searchParams.get("redirect"), "/");
            
            if (!supabase) {
                throw new Error("Supabase 클라이언트가 초기화되지 않았습니다.");
            }

            const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
            const baseRedirectUrl = isLocalhost 
                ? `${window.location.origin}/login-callback` 
                : "https://dkfloor.co.kr/login-callback";

            await supabase.auth.signInWithOAuth({
                provider: "kakao",
                options: {
                    redirectTo: `${baseRedirectUrl}?redirect=${encodeURIComponent(redirectUrl)}`,
                    scopes: "profile_nickname profile_image"
                }
            });
        } catch (err) {
            console.error("Kakao login request error:", err);
            setErrorMsg(`카카오 로그인 연결 중 오류가 발생했습니다. (${err.message || err.toString()})`);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (isSubmitting || isSubmittingRef.current) return;

        setErrorMsg("");
        setIsKakaoHint(false);

        // Autofill-safe credential reading from state or form elements
        const form = e.currentTarget;
        const submittedId = (userId || form.elements?.username?.value || form.elements?.userId?.value || "").trim();
        const submittedPassword = (password || form.elements?.password?.value || "").trim();

        if (!submittedId) {
            setErrorMsg("아이디 또는 이메일을 입력해 주세요.");
            return;
        }

        if (!submittedPassword) {
            setErrorMsg("비밀번호를 입력해 주세요.");
            return;
        }

        isSubmittingRef.current = true;
        setIsSubmitting(true);
        setLoginButtonStatus("submitting");

        const watchdogTimer = setTimeout(() => {
            if (isSubmittingRef.current) {
                isSubmittingRef.current = false;
                setIsSubmitting(false);
                setLoginButtonStatus("timeout");
                setErrorMsg("인증 서버 응답 시간이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.");
            }
        }, 10000);

        try {
            const result = await login(submittedId, submittedPassword);

            if (result.success && result.user) {
                const searchParams = new URLSearchParams(location.search);
                const rawRedirect = searchParams.get("redirect");
                let destination = (result.user.role === "admin" || result.user.role === "staff") ? "/admin" : "/";

                const pending = getPendingDirectOrder();
                if (pending) {
                    destination = "/checkout";
                } else if (rawRedirect) {
                    const safe = getSafeRedirectUrl(rawRedirect, destination);
                    if (safe !== "/login" && !safe.startsWith("/login?") && !safe.startsWith("/login/")) {
                        destination = safe;
                    }
                }

                // If destination points back to login, safely redirect to home or admin
                if (destination === "/login" || destination.startsWith("/login?") || destination.startsWith("/login/")) {
                    destination = (result.user.role === "admin" || result.user.role === "staff") ? "/admin" : "/";
                }

                nav(destination, { replace: true });
            } else {
                setErrorMsg(result.message || "아이디 또는 비밀번호가 올바르지 않습니다.");
                if (result.statusType === "network_error") {
                    setLoginButtonStatus("network_error");
                } else if (result.statusType === "timeout") {
                    setLoginButtonStatus("timeout");
                } else {
                    setLoginButtonStatus("auth_failed");
                }
                if (result.isKakaoAccount) {
                    setIsKakaoHint(true);
                }
                // 비밀번호 입력란만 초기화하고 아이디는 유지
                setPassword("");
            }
        } catch (err) {
            console.error("Login submit error:", err);
            setErrorMsg("서버와 연결할 수 없습니다. 인터넷 연결을 확인한 후 다시 시도해 주세요.");
            setLoginButtonStatus("network_error");
            setPassword("");
        } finally {
            clearTimeout(watchdogTimer);
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    // Find ID Submission Handler
    const handleFindIdSubmit = async (e) => {
        e.preventDefault();
        const email = findIdEmail.trim();
        if (!email) {
            setFindIdResult({ success: false, message: "이메일 주소를 입력해 주세요." });
            return;
        }

        setIsSearchingId(true);
        setFindIdResult(null);

        try {
            const res = await findUsernameByEmail(email);
            setFindIdResult(res);
        } catch (err) {
            setFindIdResult({ success: false, message: "아이디 조회 중 오류가 발생했습니다." });
        } finally {
            setIsSearchingId(false);
        }
    };

    // Find & Reset Password Submission Handler
    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        const email = resetEmail.trim();
        if (!email) {
            setResetResult({ success: false, message: "이메일 주소를 입력해 주세요." });
            return;
        }

        setIsSendingReset(true);
        setResetResult(null);

        try {
            const res = await requestPasswordReset(email);
            setResetResult(res);
        } catch (err) {
            setResetResult({ success: false, message: "비밀번호 재설정 요청 중 오류가 발생했습니다." });
        } finally {
            setIsSendingReset(false);
        }
    };

    const closeModal = () => {
        setActiveModal(null);
        setFindIdResult(null);
        setResetResult(null);
        setFindIdEmail("");
        setResetEmail("");
    };

    return (
        <MainLayout>
            <SEO title="로그인 | 동경바닥재" noindex={true} canonical="https://dkfloor.co.kr/login" />
            <div className="login-container">
                <div className="login-box">
                    <h1 className="login-title">로그인</h1>
                    
                    <form onSubmit={handleLogin} className="login-form" noValidate>
                        <div className="login-form-group">
                            <label className="login-label" htmlFor="login-username">아이디 또는 이메일</label>
                            <div className="login-input-wrapper">
                                <input 
                                    id="login-username"
                                    name="username"
                                    type="text" 
                                    placeholder="아이디 또는 이메일을 입력하세요" 
                                    value={userId}
                                    onChange={(e) => {
                                        setUserId(e.target.value);
                                        if (loginButtonStatus !== "idle") setLoginButtonStatus("idle");
                                        if (errorMsg) setErrorMsg("");
                                    }}
                                    className="login-input"
                                    autoComplete="username"
                                    autoCapitalize="none"
                                    spellCheck="false"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                        </div>

                        <div className="login-form-group">
                            <label className="login-label" htmlFor="login-password">비밀번호</label>
                            <div className="login-input-wrapper">
                                <input 
                                    id="login-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="비밀번호를 입력하세요" 
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (loginButtonStatus !== "idle") setLoginButtonStatus("idle");
                                        if (errorMsg) setErrorMsg("");
                                    }}
                                    className="login-input with-eye"
                                    autoComplete="current-password"
                                    disabled={isSubmitting}
                                    required
                                />
                                <button
                                    type="button"
                                    className="login-eye-btn"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {errorMsg && (
                            <div className={`login-error-banner ${isKakaoHint ? "kakao-hint" : ""}`} role="alert">
                                <AlertCircle size={16} className="error-icon" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className={`btn-login ${isSubmitting ? "loading" : ""} ${loginButtonStatus !== "idle" ? loginButtonStatus : ""}`}
                            disabled={isSubmitting}
                        >
                            {getLoginButtonText()}
                        </button>

                        {/* Account Recovery Links */}
                        <div className="login-recovery-links">
                            <button
                                type="button"
                                className="recovery-link-btn"
                                onClick={() => {
                                    setActiveModal("find-id");
                                    setFindIdResult(null);
                                }}
                            >
                                아이디 찾기
                            </button>
                            <span className="recovery-divider">|</span>
                            <button
                                type="button"
                                className="recovery-link-btn"
                                onClick={() => {
                                    setActiveModal("find-password");
                                    setResetResult(null);
                                }}
                            >
                                비밀번호 찾기
                            </button>
                        </div>

                        <div className="login-divider">
                            <span>또는</span>
                        </div>

                        <button 
                            type="button" 
                            className={`btn-kakao-login ${isKakaoHint ? "highlight-kakao" : ""}`} 
                            onClick={handleKakaoLogin}
                            disabled={isSubmitting}
                        >
                            <svg className="kakao-icon" viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: '8px' }}>
                                <path fill="currentColor" d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.558 1.707 4.8 4.27 6.054-.189.656-.68 2.361-.778 2.756-.122.499.182.493.385.357.16-.107 2.508-1.56 3.53-2.254.512.071 1.04.11 1.58.11 4.97 0 9-3.186 9-7.115C21 6.185 16.97 3 12 3z"/>
                            </svg>
                            카카오로 시작하기
                        </button>
                        
                        <div className="login-footer">
                            아직 계정이 없으신가요?{" "}
                            <span 
                                onClick={() => {
                                    const searchParams = new URLSearchParams(location.search);
                                    const redirectUrl = searchParams.get("redirect");
                                    nav(`/signup${redirectUrl ? '?redirect=' + encodeURIComponent(redirectUrl) : ''}`);
                                }} 
                                className="signup-link-text"
                            >
                                회원가입
                            </span>
                        </div>

                        <div className="login-legal-links">
                            <span onClick={() => nav("/terms-of-service")}>이용약관</span>
                            <span>|</span>
                            <span onClick={() => nav("/privacy")} className="bold">개인정보처리방침</span>
                        </div>

                        <button 
                            type="button" 
                            className="btn-go-home" 
                            onClick={() => nav("/")}
                        >
                            홈으로 돌아가기
                        </button>
                    </form>
                </div>
            </div>

            {/* Modal: 아이디 찾기 */}
            {activeModal === "find-id" && (
                <div className="auth-modal-backdrop" onClick={closeModal}>
                    <div className="auth-modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="modal-id-title">
                        <button type="button" className="auth-modal-close" onClick={closeModal} aria-label="닫기">
                            <X size={20} />
                        </button>
                        
                        <h2 id="modal-id-title" className="auth-modal-title">아이디 찾기</h2>
                        <p className="auth-modal-desc">
                            가입 시 등록하신 이메일 주소를 입력하시면<br />
                            해당 계정의 아이디를 확인해 드립니다.
                        </p>

                        {!findIdResult?.success ? (
                            <form onSubmit={handleFindIdSubmit} className="auth-modal-form">
                                <div className="modal-input-group">
                                    <label htmlFor="find-id-email">등록된 이메일 주소</label>
                                    <div className="modal-input-wrap">
                                        <Mail size={18} className="modal-icon" />
                                        <input
                                            id="find-id-email"
                                            type="email"
                                            placeholder="example@email.com"
                                            value={findIdEmail}
                                            onChange={(e) => setFindIdEmail(e.target.value)}
                                            className="modal-input"
                                            disabled={isSearchingId}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {findIdResult && !findIdResult.success && (
                                    <div className="modal-error-text" role="alert">
                                        <AlertCircle size={15} />
                                        <span>{findIdResult.message}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn-modal-action"
                                    disabled={isSearchingId}
                                >
                                    {isSearchingId ? "조회 중..." : "아이디 찾기"}
                                </button>
                            </form>
                        ) : (
                            <div className="auth-modal-result-box">
                                <div className="result-icon-check">
                                    <CheckCircle size={40} color="#10b981" />
                                </div>
                                <h3 className="result-headline">계정 정보를 찾았습니다</h3>
                                
                                {findIdResult.isKakao ? (
                                    <div className="result-account-badge kakao">
                                        <span className="badge-tag">카카오 간편 로그인 계정</span>
                                        <div className="account-masked-val">{findIdResult.maskedId}</div>
                                        <p className="account-note">카카오 계정으로 가입된 회원입니다. '카카오로 로그인'을 이용해 주세요.</p>
                                    </div>
                                ) : (
                                    <div className="result-account-badge standard">
                                        <span className="badge-tag">일반 회원 아이디</span>
                                        <div className="account-masked-val">{findIdResult.maskedId}</div>
                                        {findIdResult.createdAt && (
                                            <p className="account-date">가입일: {findIdResult.createdAt}</p>
                                        )}
                                    </div>
                                )}

                                <div className="modal-result-actions">
                                    <button
                                        type="button"
                                        className="btn-modal-action"
                                        onClick={() => {
                                            if (!findIdResult.isKakao && !findIdResult.maskedId.includes("*")) {
                                                setUserId(findIdResult.maskedId);
                                            }
                                            closeModal();
                                        }}
                                    >
                                        로그인하기
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal: 비밀번호 찾기 */}
            {activeModal === "find-password" && (
                <div className="auth-modal-backdrop" onClick={closeModal}>
                    <div className="auth-modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="modal-pwd-title">
                        <button type="button" className="auth-modal-close" onClick={closeModal} aria-label="닫기">
                            <X size={20} />
                        </button>
                        
                        <h2 id="modal-pwd-title" className="auth-modal-title">비밀번호 찾기</h2>
                        <p className="auth-modal-desc">
                            가입하신 이메일 주소를 입력하시면<br />
                            비밀번호를 재설정할 수 있는 안전한 링크를 발송해 드립니다.
                        </p>

                        {!resetResult?.success ? (
                            <form onSubmit={handleResetPasswordSubmit} className="auth-modal-form">
                                <div className="modal-input-group">
                                    <label htmlFor="reset-pwd-email">등록된 이메일 주소</label>
                                    <div className="modal-input-wrap">
                                        <Mail size={18} className="modal-icon" />
                                        <input
                                            id="reset-pwd-email"
                                            type="email"
                                            placeholder="example@email.com"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            className="modal-input"
                                            disabled={isSendingReset}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {resetResult && !resetResult.success && (
                                    <div className="modal-error-text" role="alert">
                                        <AlertCircle size={15} />
                                        <span>{resetResult.message}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn-modal-action"
                                    disabled={isSendingReset}
                                >
                                    {isSendingReset ? "발송 중..." : "비밀번호 재설정 링크 받기"}
                                </button>
                            </form>
                        ) : (
                            <div className="auth-modal-result-box">
                                <div className="result-icon-check">
                                    <CheckCircle size={40} color="#10b981" />
                                </div>
                                <h3 className="result-headline">안내 메일이 발송되었습니다</h3>
                                <p className="result-detail-text">
                                    <strong>{resetEmail}</strong>으로 비밀번호 재설정 링크를 전송했습니다.<br />
                                    메일함(스팸함 포함)의 링크를 클릭하여 새 비밀번호를 설정해 주세요.
                                </p>
                                <div className="modal-result-actions">
                                    <button
                                        type="button"
                                        className="btn-modal-action"
                                        onClick={closeModal}
                                    >
                                        확인
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
