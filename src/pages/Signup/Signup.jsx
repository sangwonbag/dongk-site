import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { checkDuplicateUsername } from "../../lib/auth";
import { useAuth } from "../../contexts/AuthContext";
import "./Signup.css";
import { getTermsContent } from "../../data/termsText";
import { COMPANY_CONFIG } from "../../data/companyConfig";

const TERMS_CONTENT = getTermsContent(COMPANY_CONFIG);

export default function Signup() {
    const nav = useNavigate();
    const location = useLocation();
    const { signup } = useAuth();
    
    // Form fields
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [addressDetail, setAddressDetail] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    // Agreement checkbox states
    const [agreeAll, setAgreeAll] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [agreeMarketing, setAgreeMarketing] = useState(false);

    // Agreement error states
    const [agreeTermsError, setAgreeTermsError] = useState("");
    const [agreePrivacyError, setAgreePrivacyError] = useState("");

    // Modal state for viewing terms
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState("");

    // Verification & duplicate check states
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameError, setUsernameError] = useState("");
    const [usernameSuccess, setUsernameSuccess] = useState("");

    // Individual input error states
    const [passwordError, setPasswordError] = useState("");
    const [passwordConfirmError, setPasswordConfirmError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [emailError, setEmailError] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // Auto format phone number
    const formatPhoneNumber = (value) => {
        const cleaned = value.replace(/\D/g, "");
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    };

    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhone(formatted);
        setPhoneError("");
    };

    const handlePhoneBlur = () => {
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.length < 10) {
            setPhoneError("휴대전화 번호를 정확히 입력해주세요.");
        } else {
            setPhoneError("");
        }
    };

    // Username validation check
    const validateUsername = (val) => {
        const hasLetter = /[a-zA-Z]/.test(val);
        const hasNumber = /[0-9]/.test(val);
        const hasNoKoreanOrSpecial = /^[a-zA-Z0-9]+$/.test(val);

        if (!val) {
            setUsernameError("아이디를 입력해주세요.");
            return false;
        }
        if (!hasLetter || !hasNumber || val.length < 4 || !hasNoKoreanOrSpecial) {
            setUsernameError("아이디는 영문과 숫자를 조합해서 4자 이상 입력해주세요.");
            return false;
        }
        setUsernameError("");
        return true;
    };

    const handleUsernameBlur = async () => {
        const val = username.trim();
        if (!validateUsername(val)) {
            setUsernameSuccess("");
            return;
        }

        setIsCheckingUsername(true);
        setUsernameError("");
        setUsernameSuccess("");

        try {
            const check = await checkDuplicateUsername(val);
            if (check.error) {
                setUsernameError(check.error);
            } else if (check.isDuplicate) {
                setUsernameError("이미 가입된 아이디입니다.");
            } else {
                setUsernameSuccess("사용 가능한 아이디입니다.");
            }
        } catch {
            setUsernameError("중복 확인에 실패했습니다.");
        } finally {
            setIsCheckingUsername(false);
        }
    };

    const handleUsernameChange = (e) => {
        const val = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
        setUsername(val);
        setUsernameError("");
        setUsernameSuccess("");
    };

    // Password validation check
    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setPassword(val);
        setPasswordError("");
        
        if (passwordConfirm && val !== passwordConfirm) {
            setPasswordConfirmError("비밀번호가 일치하지 않습니다.");
        } else {
            setPasswordConfirmError("");
        }
    };

    const handlePasswordBlur = () => {
        if (!password) {
            setPasswordError("비밀번호를 입력해주세요.");
            return;
        }
        if (password.length < 4) {
            setPasswordError("비밀번호는 4자 이상 입력해주세요.");
        } else {
            setPasswordError("");
        }
    };

    // Password Confirm check
    const handlePasswordConfirmChange = (e) => {
        const val = e.target.value;
        setPasswordConfirm(val);
        setPasswordConfirmError("");
    };

    const handlePasswordConfirmBlur = () => {
        if (!passwordConfirm) {
            setPasswordConfirmError("비밀번호 확인을 입력해주세요.");
            return;
        }
        if (password !== passwordConfirm) {
            setPasswordConfirmError("비밀번호가 일치하지 않습니다.");
        } else {
            setPasswordConfirmError("");
        }
    };

    // Email validation check
    const handleEmailBlur = () => {
        if (!email) {
            setEmailError("");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError("올바른 이메일 형식을 입력해주세요.");
        } else {
            setEmailError("");
        }
    };

    // Address Search popup
    const handleAddressSearch = () => {
        const mockAddress = prompt("검색할 주소를 입력하세요 (예: 서울 강남구 테헤란로 123):");
        if (mockAddress) {
            setAddress(mockAddress);
        }
    };

    // Agreement group control
    const handleAgreeAllChange = (e) => {
        const val = e.target.checked;
        setAgreeAll(val);
        setAgreeTerms(val);
        setAgreePrivacy(val);
        setAgreeMarketing(val);

        if (val) {
            setAgreeTermsError("");
            setAgreePrivacyError("");
        }
    };

    const handleAgreeTermsChange = (checked) => {
        setAgreeTerms(checked);
        if (checked) setAgreeTermsError("");
    };

    const handleAgreePrivacyChange = (checked) => {
        setAgreePrivacy(checked);
        if (checked) setAgreePrivacyError("");
    };

    useEffect(() => {
        if (agreeTerms && agreePrivacy && agreeMarketing) {
            setAgreeAll(true);
        } else {
            setAgreeAll(false);
        }
    }, [agreeTerms, agreePrivacy, agreeMarketing]);

    // Open terms modal helper
    const openTermsModal = (key) => {
        const termsObj = TERMS_CONTENT[key];
        if (termsObj) {
            setModalTitle(termsObj.title);
            setModalContent(termsObj.text);
            setModalOpen(true);
        }
    };

    // Validation check
    const isFormValid = () => {
        const cleanedPhone = phone.replace(/\D/g, "");

        const isUsernameOk = username.trim().length >= 4 && !usernameError && usernameSuccess;
        const isPasswordOk = password.length >= 4 && !passwordError;
        const isPasswordConfirmOk = password === passwordConfirm && !passwordConfirmError;
        const isNameOk = name.trim().length >= 1;
        const isPhoneOk = cleanedPhone.length >= 10 && !phoneError;
        const isEmailOk = !email.trim() || !emailError;

        return (
            isUsernameOk &&
            isPasswordOk &&
            isPasswordConfirmOk &&
            isNameOk &&
            isPhoneOk &&
            isEmailOk
        );
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");
        setAgreeTermsError("");
        setAgreePrivacyError("");

        let hasAgreementError = false;
        if (!agreeTerms) {
            setAgreeTermsError("이용약관에 동의해주세요.");
            hasAgreementError = true;
        }
        if (!agreePrivacy) {
            setAgreePrivacyError("개인정보 수집 및 이용에 동의해주세요.");
            hasAgreementError = true;
        }

        if (hasAgreementError) {
            setSubmitError("필수 약관에 동의해야 회원가입이 가능합니다.");
            return;
        }

        if (!isFormValid()) {
            setSubmitError("모든 필수 입력 필드를 정확히 입력해 주세요.");
            return;
        }

        setIsSubmitting(true);

        const now = new Date().toISOString();
        const dataToSave = {
            username: username.trim(),
            password: password,
            name: name.trim(),
            phone: phone,
            company_name: null,
            user_type: "일반",
            address: address.trim() || null,
            address_detail: addressDetail.trim() || null,
            business_number: null,
            marketing_agree: agreeMarketing,
            marketing_agreed: agreeMarketing,
            terms_agreed_at: now,
            privacy_agreed_at: now,
            age_confirmed_at: now,
            memo: email.trim() ? `이메일: ${email.trim()}` : null,
            role: 'user'
        };

        try {
            const res = await signup(dataToSave);
            if (res.success) {
                alert("회원가입이 완료되었습니다. 로그인 화면으로 이동합니다.");
                nav(`/login${location.search}`);
            } else {
                setSubmitError(res.message || "회원가입 처리 중 실패했습니다.");
            }
        } catch {
            setSubmitError("서버 에러가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MainLayout>
            <div className="signup-page-container">
                <div className="signup-card">
                    {/* Header */}
                    <div className="signup-header">
                        <div className="logo-area" onClick={() => nav("/")}>
                            <span className="logo-main">DK Floor</span>
                            <span className="logo-sub">동경바닥재</span>
                        </div>
                        <h2>회원가입</h2>
                        <p className="description">
                            동경바닥재 회원가입을 통해 편리한 온라인 주문 서비스를 이용해보세요.
                        </p>
                    </div>

                    <form onSubmit={handleSignupSubmit} className="signup-korean-form">
                        
                        {/* 1. 아이디 */}
                        <div className="form-group-korean">
                            <label className="korean-label" htmlFor="username">
                                아이디 <span className="red-star">*</span>
                            </label>
                            <input
                                type="text"
                                id="username"
                                placeholder="영문+숫자 조합 4자 이상"
                                value={username}
                                onChange={handleUsernameChange}
                                onBlur={handleUsernameBlur}
                                className={`korean-input ${usernameError ? "error" : ""} ${usernameSuccess ? "success" : ""}`}
                                maxLength={20}
                            />
                            {isCheckingUsername && <span className="help-text">중복 확인 중...</span>}
                            {usernameError && <span className="error-text">{usernameError}</span>}
                            {usernameSuccess && <span className="success-text">{usernameSuccess}</span>}
                        </div>

                        {/* 2. 비밀번호 */}
                        <div className="form-group-korean">
                            <label className="korean-label" htmlFor="password">
                                비밀번호 <span className="red-star">*</span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                placeholder="비밀번호 4자 이상"
                                value={password}
                                onChange={handlePasswordChange}
                                onBlur={handlePasswordBlur}
                                className={`korean-input ${passwordError ? "error" : ""}`}
                                maxLength={30}
                            />
                            {passwordError && <span className="error-text">{passwordError}</span>}
                        </div>

                        {/* 3. 비밀번호 확인 */}
                        <div className="form-group-korean">
                            <label className="korean-label" htmlFor="passwordConfirm">
                                비밀번호 확인 <span className="red-star">*</span>
                            </label>
                            <input
                                type="password"
                                id="passwordConfirm"
                                placeholder="비밀번호 재입력"
                                value={passwordConfirm}
                                onChange={handlePasswordConfirmChange}
                                onBlur={handlePasswordConfirmBlur}
                                className={`korean-input ${passwordConfirmError ? "error" : ""}`}
                                maxLength={30}
                            />
                            {passwordConfirmError && <span className="error-text">{passwordConfirmError}</span>}
                        </div>

                        {/* 4. 이름 */}
                        <div className="form-group-korean">
                            <label className="korean-label" htmlFor="name">
                                이름 <span className="red-star">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                placeholder="실명을 입력해주세요"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="korean-input"
                                maxLength={30}
                            />
                        </div>

                        {/* 5. 주소 */}
                        <div className="form-group-korean">
                            <label className="korean-label">
                                주소 <span className="opt">(선택)</span>
                            </label>
                            <div className="input-with-btn">
                                <input
                                    type="text"
                                    placeholder="주소를 입력해주세요"
                                    value={address}
                                    readOnly
                                    className="korean-input read-only-addr"
                                    onClick={handleAddressSearch}
                                />
                                <button
                                    type="button"
                                    className="action-btn"
                                    onClick={handleAddressSearch}
                                >
                                    주소 검색
                                </button>
                            </div>
                            <input
                                type="text"
                                id="addressDetail"
                                placeholder="상세주소를 입력해주세요"
                                value={addressDetail}
                                onChange={(e) => setAddressDetail(e.target.value)}
                                className="korean-input"
                                style={{ marginTop: "10px" }}
                                maxLength={100}
                                disabled={!address}
                            />
                        </div>

                        {/* 6. 휴대전화 */}
                        <div className="form-group-korean">
                            <label className="korean-label" htmlFor="phone">
                                휴대전화 <span className="red-star">*</span>
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                placeholder="예: 010-1234-5678"
                                value={phone}
                                onChange={handlePhoneChange}
                                onBlur={handlePhoneBlur}
                                className={`korean-input ${phoneError ? "error" : ""}`}
                                maxLength={13}
                            />
                            {phoneError && <span className="error-text">{phoneError}</span>}
                        </div>

                        {/* 7. 이메일 */}
                        <div className="form-group-korean">
                            <label className="korean-label" htmlFor="email">
                                이메일 <span className="opt">(선택)</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                                onBlur={handleEmailBlur}
                                className={`korean-input ${emailError ? "error" : ""}`}
                                maxLength={50}
                            />
                            {emailError && <span className="error-text">{emailError}</span>}
                        </div>

                        {/* 8. 약관동의 영역 */}
                        <div className="agreements-section">
                            <label className="korean-label">약관 동의</label>
                            
                            <div className="agree-card">
                                <label className="check-label-all">
                                    <input
                                        type="checkbox"
                                        checked={agreeAll}
                                        onChange={handleAgreeAllChange}
                                    />
                                    <strong>이용약관 및 개인정보 수집 전체 동의</strong>
                                </label>
                                
                                <div className="divider-line" />

                                <div className="agree-wrapper">
                                    <div className="agree-item-container">
                                        <div className="agree-item">
                                            <label className="check-label-sub">
                                                <input
                                                    type="checkbox"
                                                    checked={agreeTerms}
                                                    onChange={(e) => handleAgreeTermsChange(e.target.checked)}
                                                />
                                                <span><span className="required-txt">[필수]</span> 이용약관 동의</span>
                                            </label>
                                            <button type="button" className="view-terms-btn" onClick={() => openTermsModal("terms")}>보기</button>
                                        </div>
                                        {agreeTermsError && <div className="agree-error-text">{agreeTermsError}</div>}
                                    </div>

                                    <div className="agree-item-container">
                                        <div className="agree-item">
                                            <label className="check-label-sub">
                                                <input
                                                    type="checkbox"
                                                    checked={agreePrivacy}
                                                    onChange={(e) => handleAgreePrivacyChange(e.target.checked)}
                                                />
                                                <span><span className="required-txt">[필수]</span> 개인정보 수집 및 이용 동의</span>
                                            </label>
                                            <button type="button" className="view-terms-btn" onClick={() => openTermsModal("privacy")}>보기</button>
                                        </div>
                                        {agreePrivacyError && <div className="agree-error-text">{agreePrivacyError}</div>}
                                    </div>

                                    <div className="agree-item-container">
                                        <div className="agree-item">
                                            <label className="check-label-sub">
                                                <input
                                                    type="checkbox"
                                                    checked={agreeMarketing}
                                                    onChange={(e) => setAgreeMarketing(e.target.checked)}
                                                />
                                                <span><span className="optional-txt">[선택]</span> 마케팅 정보 수신 동의</span>
                                            </label>
                                            <button type="button" className="view-terms-btn" onClick={() => openTermsModal("marketing")}>보기</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {submitError && <div className="submit-error-msg">{submitError}</div>}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn-signup-korean"
                            disabled={isSubmitting || !isFormValid()}
                        >
                            {isSubmitting ? "가입 처리 중..." : "회원가입 완료"}
                        </button>
                    </form>

                    {/* Bottom login link */}
                    <div className="signup-footer-korean">
                        이미 계정이 있으신가요?{" "}
                        <span onClick={() => nav(`/login${location.search}`)}>
                            로그인
                        </span>
                    </div>
                </div>
            </div>

            {/* Terms Modal Overlay */}
            {modalOpen && (
                <div className="terms-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="terms-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="terms-modal-header">
                            <h3>{modalTitle}</h3>
                            <button 
                                type="button" 
                                className="terms-modal-close-btn" 
                                onClick={() => setModalOpen(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="terms-modal-body">
                            <pre className="terms-modal-text">{modalContent}</pre>
                        </div>
                        <div className="terms-modal-footer">
                            <button 
                                type="button" 
                                className="terms-modal-action-close" 
                                onClick={() => setModalOpen(false)}
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
