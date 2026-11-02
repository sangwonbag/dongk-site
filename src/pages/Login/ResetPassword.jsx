import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { supabase } from "../../lib/supabaseClient";
import { updatePasswordWithSession } from "../../lib/auth";
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import SEO from "../../components/seo/SEO";
import "./ResetPassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSessionReady, setIsSessionReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      if (!supabase) {
        setIsChecking(false);
        return;
      }

      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        if (session) {
          setIsSessionReady(true);
        }
        setIsChecking(false);
      }
    }

    checkRecoverySession();

    // Listen to Auth state changes for recovery token detection
    const { data: { subscription } } = supabase?.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" || session) {
        setIsSessionReady(true);
        setIsChecking(false);
      }
    }) || { data: { subscription: null } };

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanPass = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanPass) {
      setErrorMsg("새 비밀번호를 입력해주세요.");
      return;
    }

    if (cleanPass.length < 6) {
      setErrorMsg("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setErrorMsg("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await updatePasswordWithSession(cleanPass);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg(res.message || "비밀번호 변경에 실패했습니다.");
      }
    } catch (err) {
      setErrorMsg(err.message || "비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <SEO title="비밀번호 재설정 | 동경바닥재" noindex={true} canonical="https://dkfloor.co.kr/reset-password" />
      <div className="reset-pwd-container">
        <div className="reset-pwd-box">
          {isSuccess ? (
            <div className="reset-pwd-success-card">
              <div className="success-icon-wrap">
                <CheckCircle size={48} color="#10b981" />
              </div>
              <h2 className="success-title">비밀번호가 변경되었습니다</h2>
              <p className="success-desc">
                새로운 비밀번호로 성공적으로 업데이트되었습니다.<br />
                새 비밀번호로 다시 로그인해 주세요.
              </p>
              <button
                type="button"
                className="btn-primary-reset"
                onClick={() => navigate("/login")}
              >
                로그인 화면으로 이동
              </button>
            </div>
          ) : isChecking ? (
            <div className="reset-pwd-checking">
              <div className="pwd-spinner" />
              <p>인증 상태를 확인하고 있습니다...</p>
            </div>
          ) : !isSessionReady ? (
            <div className="reset-pwd-invalid-card">
              <div className="invalid-icon-wrap">
                <AlertCircle size={44} color="#ef4444" />
              </div>
              <h2 className="invalid-title">만료되거나 유효하지 않은 링크입니다</h2>
              <p className="invalid-desc">
                비밀번호 재설정 링크의 유효시간이 지났거나 이미 사용된 링크입니다.<br />
                로그인 화면에서 비밀번호 찾기를 다시 요청해 주세요.
              </p>
              <button
                type="button"
                className="btn-primary-reset"
                onClick={() => navigate("/login")}
              >
                로그인 화면으로 돌아가기
              </button>
            </div>
          ) : (
            <div className="reset-pwd-form-wrap">
              <div className="reset-pwd-header">
                <button 
                  type="button" 
                  className="btn-back-link" 
                  onClick={() => navigate("/login")}
                  aria-label="로그인으로 돌아가기"
                >
                  <ArrowLeft size={18} />
                  <span>로그인으로 돌아가기</span>
                </button>
                <h1 className="reset-pwd-title">새 비밀번호 설정</h1>
                <p className="reset-pwd-subtitle">
                  동경바닥재 계정의 새로운 비밀번호를 설정해 주세요.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="reset-pwd-form">
                <div className="form-group-pwd">
                  <label htmlFor="newPassword">새 비밀번호</label>
                  <div className="pwd-input-wrapper">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="6자 이상 입력"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pwd-input"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      required
                    />
                    <button
                      type="button"
                      className="pwd-eye-btn"
                      onClick={() => setShowNewPassword(prev => !prev)}
                      aria-label={showNewPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group-pwd">
                  <label htmlFor="confirmPassword">새 비밀번호 확인</label>
                  <div className="pwd-input-wrapper">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="비밀번호를 한 번 더 입력하세요"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pwd-input"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      required
                    />
                    <button
                      type="button"
                      className="pwd-eye-btn"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      aria-label={showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="pwd-error-banner" role="alert">
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary-reset"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "비밀번호 변경 중..." : "비밀번호 변경 완료"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

