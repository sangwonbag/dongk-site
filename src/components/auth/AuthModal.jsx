import React, { useState, useRef } from "react";
import { X, Eye, EyeOff, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { findUsernameByEmail, requestPasswordReset } from "../../lib/auth";
import "./AuthModal.css";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const { login: authLogin, signup: authSignup } = useAuth();
  const [activeTab, setActiveTab] = useState("login"); // "login" | "signup" | "find-id" | "find-password"

  // 로그인 상태
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginButtonStatus, setLoginButtonStatus] = useState("idle"); // "idle" | "submitting" | "auth_failed" | "network_error" | "timeout"
  const isSubmittingRef = useRef(false);

  // 아이디 찾기 상태
  const [findIdEmail, setFindIdEmail] = useState("");
  const [isSearchingId, setIsSearchingId] = useState(false);
  const [findIdResult, setFindIdResult] = useState(null);

  // 비밀번호 찾기 상태
  const [resetEmail, setResetEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetResult, setResetResult] = useState(null);

  // 회원가입 상태
  const [signUpData, setSignUpData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [signUpError, setSignUpError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleKakaoLogin = async () => {
    try {
      if (!supabase) throw new Error("Supabase 클라이언트가 초기화되지 않았습니다.");
      setLoginError("");
      const isLocalhost = typeof window !== "undefined" && 
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      const baseRedirectUrl = isLocalhost 
        ? `${window.location.origin}/login-callback` 
        : "https://dkfloor.co.kr/login-callback";
      
      const currentPath = window.location.pathname + window.location.search;
      await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${baseRedirectUrl}?redirect=${encodeURIComponent(currentPath)}`,
          scopes: "profile_nickname profile_image"
        }
      });
    } catch (err) {
      console.error("Kakao login error:", err);
      setLoginError(`카카오 로그인 연결 중 오류가 발생했습니다. (${err.message || err.toString()})`);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (loading || isSubmittingRef.current) return;

    setLoginError("");

    const submittedId = (loginId || e.currentTarget?.elements?.loginId?.value || "").trim();
    const submittedPw = (loginPw || e.currentTarget?.elements?.loginPw?.value || "").trim();

    if (!submittedId || !submittedPw) {
      setLoginError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);
    setLoginButtonStatus("submitting");

    try {
      const res = await authLogin(submittedId, submittedPw);
      if (res.success && res.user) {
        if (onSuccess) onSuccess(res.user);
        onClose();
      } else {
        setLoginError(res.message || "아이디 또는 비밀번호가 올바르지 않습니다.");
        if (res.statusType === "network_error") {
          setLoginButtonStatus("network_error");
        } else if (res.statusType === "timeout") {
          setLoginButtonStatus("timeout");
        } else {
          setLoginButtonStatus("auth_failed");
        }
        // 비밀번호 초기화 및 아이디 유지
        setLoginPw("");
      }
    } catch (err) {
      console.error(err);
      setLoginError("서버와 연결할 수 없습니다. 인터넷 연결을 확인한 후 다시 시도해 주세요.");
      setLoginButtonStatus("network_error");
      setLoginPw("");
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

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
      console.error(err);
      setFindIdResult({ success: false, message: "아이디 조회 중 오류가 발생했습니다." });
    } finally {
      setIsSearchingId(false);
    }
  };

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
      console.error(err);
      setResetResult({ success: false, message: "비밀번호 재설정 요청 중 오류가 발생했습니다." });
    } finally {
      setIsSendingReset(false);
    }
  };

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

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setSignUpError("");

    const { username, password, confirmPassword, name, phone } = signUpData;

    if (!username.trim() || !password || !confirmPassword || !name.trim() || !phone.trim()) {
      setSignUpError("필수 항목(*)을 모두 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setSignUpError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!agreeTerms) {
      setSignUpError("이용약관 및 개인정보 처리방침에 동의해주세요.");
      return;
    }

    setLoading(true);
    try {
      const nowStr = new Date().toISOString();
      const res = await authSignup({
        username: username.trim(),
        password: password,
        name: name.trim(),
        phone: phone.trim(),
        company_name: null,
        user_type: "일반",
        marketing_agree: false,
        terms_agreed_at: nowStr,
        privacy_agreed_at: nowStr,
        age_confirmed_at: nowStr,
      });

      if (res.success) {
        // 가입 성공 시 자동 로그인 시도
        const loginRes = await authLogin(username.trim(), password);
        if (loginRes.success) {
          if (onSuccess) onSuccess(loginRes.user);
          onClose();
        } else {
          setActiveTab("login");
          setLoginId(username);
          setLoginError("회원가입이 완료되었습니다. 로그인을 진행해주세요.");
        }
      } else {
        setSignUpError(res.message || "회원가입 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error(err);
      setSignUpError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>동경바닥재</h2>
          <button className="auth-modal-close" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        {(activeTab === "login" || activeTab === "signup") && (
          <div className="auth-modal-tabs">
            <button
              className={`auth-tab-btn ${activeTab === "login" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("login");
                setLoginError("");
              }}
            >
              로그인
            </button>
            <button
              className={`auth-tab-btn ${activeTab === "signup" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("signup");
                setSignUpError("");
              }}
            >
              회원가입
            </button>
          </div>
        )}

        <div className="auth-modal-body">
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              {/* 1. 아이디 입력 */}
              <div className="auth-form-group">
                <label>아이디</label>
                <input
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={loginId}
                  onChange={(e) => {
                    setLoginId(e.target.value);
                    if (loginButtonStatus !== "idle") setLoginButtonStatus("idle");
                    if (loginError) setLoginError("");
                  }}
                  disabled={loading}
                  autoComplete="username"
                />
              </div>

              {/* 2. 비밀번호 입력 & 보기/숨기기 */}
              <div className="auth-form-group">
                <label>비밀번호</label>
                <div className="auth-password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호를 입력하세요"
                    value={loginPw}
                    onChange={(e) => {
                      setLoginPw(e.target.value);
                      if (loginButtonStatus !== "idle") setLoginButtonStatus("idle");
                      if (loginError) setLoginError("");
                    }}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {loginError && <div className="auth-error-msg">{loginError}</div>}

              {/* 3. 일반 로그인 버튼 */}
              <button 
                type="submit" 
                className={`btn-auth-submit ${loginButtonStatus !== 'idle' ? loginButtonStatus : ''}`} 
                disabled={loading}
              >
                {getLoginButtonText()}
              </button>

              {/* 4. 아이디 찾기 | 비밀번호 찾기 */}
              <div className="auth-recovery-links">
                <button
                  type="button"
                  className="auth-recovery-link-btn"
                  onClick={() => {
                    setActiveTab("find-id");
                    setFindIdResult(null);
                    setFindIdEmail("");
                  }}
                >
                  아이디 찾기
                </button>
                <span className="auth-recovery-divider">|</span>
                <button
                  type="button"
                  className="auth-recovery-link-btn"
                  onClick={() => {
                    setActiveTab("find-password");
                    setResetResult(null);
                    setResetEmail("");
                  }}
                >
                  비밀번호 찾기
                </button>
              </div>

              {/* 5. 구분선 '또는' */}
              <div className="auth-divider">
                <span>또는</span>
              </div>

              {/* 6. 노란색 카카오 로그인 버튼 (카카오로 시작하기) */}
              <button
                type="button"
                className="btn-kakao-auth"
                onClick={handleKakaoLogin}
                disabled={loading}
              >
                <svg className="kakao-icon" viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: '8px' }}>
                  <path fill="currentColor" d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.558 1.707 4.8 4.27 6.054-.189.656-.68 2.361-.778 2.756-.122.499.182.493.385.357.16-.107 2.508-1.56 3.53-2.254.512.071 1.04.11 1.58.11 4.97 0 9-3.186 9-7.115C21 6.185 16.97 3 12 3z"/>
                </svg>
                카카오로 시작하기
              </button>
            </form>
          )}

          {/* 아이디 찾기 서브뷰 */}
          {activeTab === "find-id" && (
            <div className="auth-subview">
              <button
                type="button"
                className="auth-btn-back"
                onClick={() => {
                  setActiveTab("login");
                  setFindIdResult(null);
                }}
              >
                <ArrowLeft size={16} />
                <span>로그인으로 돌아가기</span>
              </button>
              <h3 className="auth-subview-title">아이디 찾기</h3>
              <p className="auth-subview-desc">
                가입 시 등록하신 이메일 주소를 입력하시면<br />
                해당 계정의 아이디를 안내해 드립니다.
              </p>

              {!findIdResult?.success ? (
                <form onSubmit={handleFindIdSubmit} className="auth-form">
                  <div className="auth-form-group">
                    <label>등록된 이메일</label>
                    <div className="auth-input-with-icon">
                      <Mail size={16} className="auth-field-icon" />
                      <input
                        type="email"
                        placeholder="example@email.com"
                        value={findIdEmail}
                        onChange={(e) => setFindIdEmail(e.target.value)}
                        disabled={isSearchingId}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {findIdResult && !findIdResult.success && (
                    <div className="auth-error-msg" role="alert">
                      {findIdResult.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-auth-submit"
                    disabled={isSearchingId}
                  >
                    {isSearchingId ? "조회 중..." : "아이디 찾기"}
                  </button>
                </form>
              ) : (
                <div className="auth-result-box">
                  <div className="auth-result-icon">
                    <CheckCircle size={36} color="#10b981" />
                  </div>
                  {findIdResult.isKakao ? (
                    <>
                      <h4 className="auth-result-title">카카오 간편가입 계정</h4>
                      <p className="auth-result-desc">
                        해당 이메일은 카카오 간편 로그인으로 가입된 계정입니다.<br />
                        아래 버튼을 눌러 카카오로 로그인해 주세요.
                      </p>
                      <button
                        type="button"
                        className="btn-kakao-auth"
                        onClick={handleKakaoLogin}
                      >
                        <svg className="kakao-icon" viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: '8px' }}>
                          <path fill="currentColor" d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.558 1.707 4.8 4.27 6.054-.189.656-.68 2.361-.778 2.756-.122.499.182.493.385.357.16-.107 2.508-1.56 3.53-2.254.512.071 1.04.11 1.58.11 4.97 0 9-3.186 9-7.115C21 6.185 16.97 3 12 3z"/>
                        </svg>
                        카카오로 시작하기
                      </button>
                    </>
                  ) : (
                    <>
                      <h4 className="auth-result-title">가입된 아이디 안내</h4>
                      <div className="auth-masked-badge">
                        {findIdResult.maskedId}
                      </div>
                      {findIdResult.createdAt && (
                        <p className="auth-result-sub">가입일: {findIdResult.createdAt}</p>
                      )}
                      <button
                        type="button"
                        className="btn-auth-submit"
                        onClick={() => {
                          setActiveTab("login");
                          if (findIdResult?.maskedId) {
                            setLoginId(findIdResult.maskedId.replace(/\*/g, ""));
                          }
                          setFindIdResult(null);
                        }}
                      >
                        로그인하러 가기
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 비밀번호 찾기 서브뷰 */}
          {activeTab === "find-password" && (
            <div className="auth-subview">
              <button
                type="button"
                className="auth-btn-back"
                onClick={() => {
                  setActiveTab("login");
                  setResetResult(null);
                }}
              >
                <ArrowLeft size={16} />
                <span>로그인으로 돌아가기</span>
              </button>
              <h3 className="auth-subview-title">비밀번호 찾기</h3>
              <p className="auth-subview-desc">
                가입 시 등록하신 이메일 주소를 입력하시면<br />
                비밀번호 재설정 링크를 보내드립니다.
              </p>

              {!resetResult?.success ? (
                <form onSubmit={handleResetPasswordSubmit} className="auth-form">
                  <div className="auth-form-group">
                    <label>등록된 이메일</label>
                    <div className="auth-input-with-icon">
                      <Mail size={16} className="auth-field-icon" />
                      <input
                        type="email"
                        placeholder="example@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        disabled={isSendingReset}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {resetResult && !resetResult.success && (
                    <div className="auth-error-msg" role="alert">
                      {resetResult.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-auth-submit"
                    disabled={isSendingReset}
                  >
                    {isSendingReset ? "발송 중..." : "비밀번호 재설정 링크 발송"}
                  </button>
                </form>
              ) : (
                <div className="auth-result-box">
                  <div className="auth-result-icon">
                    <CheckCircle size={36} color="#10b981" />
                  </div>
                  <h4 className="auth-result-title">재설정 링크 발송 완료</h4>
                  <p className="auth-result-desc">
                    {resetResult.message}
                  </p>
                  <button
                    type="button"
                    className="btn-auth-submit"
                    onClick={() => {
                      setActiveTab("login");
                      setResetResult(null);
                    }}
                  >
                    로그인 화면으로
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 회원가입 탭 */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignUpSubmit} className="auth-form scrollable-form">
              <div className="auth-form-group">
                <label>아이디 <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="아이디 입력 (최소 4자)"
                  value={signUpData.username}
                  onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="auth-form-group">
                <label>비밀번호 <span className="req">*</span></label>
                <input
                  type="password"
                  placeholder="비밀번호 입력"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="auth-form-group">
                <label>비밀번호 확인 <span className="req">*</span></label>
                <input
                  type="password"
                  placeholder="비밀번호 확인"
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="auth-form-group">
                <label>이름 / 상호명 <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="이름 또는 상호명 입력"
                  value={signUpData.name}
                  onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="auth-form-group">
                <label>연락처 <span className="req">*</span></label>
                <input
                  type="tel"
                  placeholder="010-0000-0000"
                  value={signUpData.phone}
                  onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="auth-terms-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    disabled={loading}
                  />
                  <span>이용약관 및 개인정보 처리방침에 동의합니다.</span>
                </label>
              </div>

              {signUpError && <div className="auth-error-msg">{signUpError}</div>}

              <button type="submit" className="btn-auth-submit" disabled={loading}>
                {loading ? "가입 처리 중..." : "회원가입 완료"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
