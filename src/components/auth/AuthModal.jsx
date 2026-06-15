import React, { useState } from "react";
import { X } from "lucide-react";
import { login, signup } from "../../lib/auth";
import "./AuthModal.css";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState("login"); // "login" | "signup"
  
  // 로그인 상태
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [loginError, setLoginError] = useState("");

  // 회원가입 상태
  const [signUpData, setSignUpData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    company_name: "",
    user_type: "일반", // 일반 | 사업자
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [signUpError, setSignUpError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!loginId.trim() || !loginPw.trim()) {
      setLoginError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(loginId.trim(), loginPw);
      if (res.success) {
        onSuccess(res.user);
        onClose();
      } else {
        setLoginError(res.message || "로그인에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      setLoginError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setSignUpError("");

    const { username, password, confirmPassword, name, phone, company_name, user_type } = signUpData;

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
      const res = await signup({
        username: username.trim(),
        password: password,
        name: name.trim(),
        phone: phone.trim(),
        company_name: company_name.trim() || null,
        user_type: user_type,
        marketing_agree: false,
        terms_agreed_at: nowStr,
        privacy_agreed_at: nowStr,
        age_confirmed_at: nowStr,
      });

      if (res.success) {
        // 가입 성공 시 자동 로그인 시도
        const loginRes = await login(username.trim(), password);
        if (loginRes.success) {
          onSuccess(loginRes.user);
          onClose();
        } else {
          // 가입은 성공했으나 자동 로그인 실패 시 로그인 탭으로 전환
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
          <button className="auth-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

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

        <div className="auth-modal-body">
          {activeTab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="auth-form-group">
                <label>아이디</label>
                <input
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="auth-form-group">
                <label>비밀번호</label>
                <input
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={loginPw}
                  onChange={(e) => setLoginPw(e.target.value)}
                  disabled={loading}
                />
              </div>

              {loginError && <div className="auth-error-msg">{loginError}</div>}

              <button type="submit" className="btn-auth-submit" disabled={loading}>
                {loading ? "로그인 중..." : "로그인"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="auth-form scrollable-form">
              <div className="auth-form-group">
                <label>가입 구분</label>
                <div className="auth-type-selector">
                  <button
                    type="button"
                    className={`type-btn ${signUpData.user_type === "일반" ? "active" : ""}`}
                    onClick={() => setSignUpData({ ...signUpData, user_type: "일반" })}
                  >
                    일반 개인
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${signUpData.user_type === "사업자" ? "active" : ""}`}
                    onClick={() => setSignUpData({ ...signUpData, user_type: "사업자" })}
                  >
                    사업자/시공업체
                  </button>
                </div>
              </div>

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
                  placeholder="비밀번호 재입력"
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="auth-form-group">
                <label>이름 <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="실명을 입력하세요"
                  value={signUpData.name}
                  onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="auth-form-group">
                <label>연락처 <span className="req">*</span></label>
                <input
                  type="tel"
                  placeholder="예: 01012345678"
                  value={signUpData.phone}
                  onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="auth-form-group">
                <label>업체명 {signUpData.user_type === "사업자" && <span className="req">*</span>}</label>
                <input
                  type="text"
                  placeholder="업체명을 입력하세요 (선택)"
                  value={signUpData.company_name}
                  onChange={(e) => setSignUpData({ ...signUpData, company_name: e.target.value })}
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
                  <span>이용약관 및 개인정보 처리방침에 동의합니다. (필수)</span>
                </label>
              </div>

              {signUpError && <div className="auth-error-msg">{signUpError}</div>}

              <button type="submit" className="btn-auth-submit" disabled={loading}>
                {loading ? "가입 중..." : "회원가입 및 로그인"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
