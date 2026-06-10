import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { signup, checkDuplicateUsername } from "../../lib/auth";
import { Check } from "lucide-react";
import "./Signup.css";

import { COMPANY_CONFIG } from "../../data/companyConfig";
import { getTermsContent } from "../../data/termsText";

const TERMS_CONTENT = getTermsContent(COMPANY_CONFIG);

export default function Signup() {
    const nav = useNavigate();
    const location = useLocation();
    
    // Form fields
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [businessNumber, setBusinessNumber] = useState("");
    const [businessAddress, setBusinessAddress] = useState("");
    const [businessAddressDetail, setBusinessAddressDetail] = useState("");
    const [businessType, setBusinessType] = useState("");
    const [businessItem, setBusinessItem] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    // Agreement checkbox states
    const [agreeAll, setAgreeAll] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [agreeAge, setAgreeAge] = useState(false);
    const [agreeMarketing, setAgreeMarketing] = useState(false);

    // Agreement error states
    const [agreeTermsError, setAgreeTermsError] = useState("");
    const [agreePrivacyError, setAgreePrivacyError] = useState("");
    const [agreeAgeError, setAgreeAgeError] = useState("");

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
    const [businessNumberError, setBusinessNumberError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [emailError, setEmailError] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // Setup redirect path

    // Auto format phone number: supports mobile (010-XXXX-XXXX) and landline (02-XXX-XXXX / 031-XXX-XXXX)
    const formatPhoneNumber = (value) => {
        const cleaned = value.replace(/\D/g, "");
        if (cleaned.length <= 2) {
            return cleaned;
        }
        if (cleaned.startsWith("02")) {
            if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
            if (cleaned.length <= 9) return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
            return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
        } else {
            if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
            if (cleaned.length <= 10) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
        }
    };

    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhone(formatted);
        setPhoneError("");
    };

    const handlePhoneBlur = () => {
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.length < 9) {
            setPhoneError("대표 전화번호를 정확히 입력해주세요.");
        } else {
            setPhoneError("");
        }
    };

    // Auto format business number: XXX-XX-XXXXX (strip non-numbers)
    const formatBusinessNumber = (value) => {
        const cleaned = value.replace(/\D/g, "");
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 10)}`;
    };

    const handleBusinessNumberChange = (e) => {
        const formatted = formatBusinessNumber(e.target.value);
        setBusinessNumber(formatted);
        setBusinessNumberError("");
    };

    const handleBusinessNumberBlur = () => {
        const cleaned = businessNumber.replace(/\D/g, "");
        if (cleaned.length !== 10) {
            setBusinessNumberError("사업자등록번호 10자리를 입력해주세요.");
        } else {
            setBusinessNumberError("");
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
            setUsernameError("아이디는 영문과 숫자를 조합해서 입력해주세요.");
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
        // Remove spaces, Korean, and special characters instantly
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
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*?_]/.test(password);
        
        if (!hasLetter || !hasNumber || !hasSpecial || password.length < 8) {
            setPasswordError("비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.");
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
            setEmailError("이메일을 입력해주세요.");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError("올바른 이메일 형식을 입력해주세요.");
        } else {
            setEmailError("");
        }
    };

    // Fake Address Search popup
    const handleAddressSearch = () => {
        const mockAddress = prompt("검색할 사업장 주소를 입력하세요 (예: 서울 강동구 천호대로 100):");
        if (mockAddress) {
            setBusinessAddress(mockAddress);
        }
    };

    // Agreement group control
    const handleAgreeAllChange = (e) => {
        const val = e.target.checked;
        setAgreeAll(val);
        setAgreeTerms(val);
        setAgreePrivacy(val);
        setAgreeAge(val);
        setAgreeMarketing(val);

        if (val) {
            setAgreeTermsError("");
            setAgreePrivacyError("");
            setAgreeAgeError("");
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

    const handleAgreeAgeChange = (checked) => {
        setAgreeAge(checked);
        if (checked) setAgreeAgeError("");
    };

    useEffect(() => {
        if (agreeTerms && agreePrivacy && agreeAge && agreeMarketing) {
            setAgreeAll(true);
        } else {
            setAgreeAll(false);
        }
    }, [agreeTerms, agreePrivacy, agreeAge, agreeMarketing]);

    // Open terms modal helper
    const openTermsModal = (key) => {
        const termsObj = TERMS_CONTENT[key];
        if (termsObj) {
            setModalTitle(termsObj.title);
            setModalContent(termsObj.text);
            setModalOpen(true);
        }
    };

    // Validation for Signup Button activation (Checks inputs only, agreements checked on submit)
    const isFormValid = () => {
        const cleanedPhone = phone.replace(/\D/g, "");
        const cleanedBiz = businessNumber.replace(/\D/g, "");

        const isUsernameOk = username.trim().length >= 4 && !usernameError && usernameSuccess;
        const isPasswordOk = password.length >= 8 && !passwordError;
        const isPasswordConfirmOk = password === passwordConfirm && !passwordConfirmError;
        
        const isCompanyNameOk = companyName.trim().length >= 1;
        const isOwnerNameOk = ownerName.trim().length >= 1;
        const isBusinessNumberOk = cleanedBiz.length === 10 && !businessNumberError;
        const isBusinessAddressOk = businessAddress.trim().length >= 1;
        const isBusinessTypeOk = businessType.trim().length >= 1;
        const isBusinessItemOk = businessItem.trim().length >= 1;
        
        const isPhoneOk = cleanedPhone.length >= 9 && !phoneError;
        const isEmailOk = email.trim().length >= 1 && !emailError;

        return (
            isUsernameOk &&
            isPasswordOk &&
            isPasswordConfirmOk &&
            isCompanyNameOk &&
            isOwnerNameOk &&
            isBusinessNumberOk &&
            isBusinessAddressOk &&
            isBusinessTypeOk &&
            isBusinessItemOk &&
            isPhoneOk &&
            isEmailOk
        );
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");
        setAgreeTermsError("");
        setAgreePrivacyError("");
        setAgreeAgeError("");

        // Check agreements first to display errors inline
        let hasAgreementError = false;
        if (!agreeTerms) {
            setAgreeTermsError("이용약관에 동의해주세요.");
            hasAgreementError = true;
        }
        if (!agreePrivacy) {
            setAgreePrivacyError("개인정보 수집 및 이용에 동의해주세요.");
            hasAgreementError = true;
        }
        if (!agreeAge) {
            setAgreeAgeError("만 14세 이상 확인에 동의해주세요.");
            hasAgreementError = true;
        }

        if (hasAgreementError) {
            setSubmitError("필수 약관에 동의해야 회원가입이 가능합니다.");
            return;
        }

        if (!isFormValid()) {
            setSubmitError("모든 필수 입력 필드를 채우고 형식에 맞게 입력해 주세요.");
            return;
        }

        setIsSubmitting(true);

        const now = new Date().toISOString();
        const dataToSave = {
            username: username.trim(),
            password: password,
            name: ownerName.trim(), // 대표자명
            phone: phone, // 대표 전화번호
            company_name: companyName.trim(), // 상호명
            user_type: "인테리어 업체", // Unified B2B value
            address: businessAddress.trim(), // 사업장 소재지
            address_detail: businessAddressDetail.trim(),
            business_number: businessNumber,
            marketing_agree: agreeMarketing,
            // 추가 약관 동의 데이터 필드 준비
            marketing_agreed: agreeMarketing,
            terms_agreed_at: now,
            privacy_agreed_at: now,
            age_confirmed_at: now,
            memo: `대표자명: ${ownerName.trim()} | 업태: ${businessType.trim()} | 종목: ${businessItem.trim()} | 이메일: ${email.trim()}`
        };

        try {
            // Save to database (Supabase)
            const res = await signup(dataToSave);
            
            // Save complete B2B partner object to localStorage mock database
            try {
                const b2bUsersStr = localStorage.getItem("dk_b2b_users") || "[]";
                const b2bUsers = JSON.parse(b2bUsersStr);
                const newB2BUser = {
                    id: username.trim(),
                    password: password, // plain password for mock reference
                    companyName: companyName.trim(),
                    ownerName: ownerName.trim(),
                    businessNumber: businessNumber,
                    businessAddress: businessAddress.trim(),
                    businessAddressDetail: businessAddressDetail.trim(),
                    businessType: businessType.trim(),
                    businessItem: businessItem.trim(),
                    phone: phone,
                    email: email.trim(),
                    agreeTerms: agreeTerms,
                    agreePrivacy: agreePrivacy,
                    agreeAge: agreeAge,
                    agreeMarketing: agreeMarketing,
                    termsAgreedAt: now,
                    privacyAgreedAt: now,
                    ageConfirmedAt: now,
                    createdAt: now
                };
                b2bUsers.push(newB2BUser);
                localStorage.setItem("dk_b2b_users", JSON.stringify(b2bUsers));
            } catch (storageErr) {
                console.error("Local mock storage failed:", storageErr);
            }

            if (res.success) {
                alert("B2B 회원가입이 완료되었습니다. 승인 및 로그인 화면으로 이동합니다.");
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
                            <span className="logo-sub">동경바닥재 B2B</span>
                        </div>
                        <h2>B2B 회원가입</h2>
                        <p className="description">
                            자재 주문, 도매 견적 문의, 샘플북 열람을 위한 인테리어/시공 파트너 회원가입입니다.
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
                                placeholder="영문+숫자 조합으로 입력해주세요"
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
                                placeholder="영문+숫자+특수문자 포함 8자 이상"
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
                                placeholder="비밀번호를 한 번 더 입력해주세요"
                                value={passwordConfirm}
                                onChange={handlePasswordConfirmChange}
                                onBlur={handlePasswordConfirmBlur}
                                className={`korean-input ${passwordConfirmError ? "error" : ""}`}
                                maxLength={30}
                            />
                            {passwordConfirmError && <span className="error-text">{passwordConfirmError}</span>}
                        </div>

                        {/* 4. 상호명 */}
                        <div className="form-group-korean">
                            <label className="korean-label" htmlFor="companyName">
                                상호명 <span className="red-star">*</span>
                            </label>
                            <input
                                type="text"
                                id="companyName"
                                placeholder="사업자등록증의 상호를 입력해주세요"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="korean-input"
                                maxLength={50}
                            />
                        </div>

                        {/* 5. 대표자명 */}
                        <div className="form-group-korean">
                            <label className="korean-label" htmlFor="ownerName">
                                대표자명 <span className="red-star">*</span>
                            </label>
                            <input
                                type="text"
                                id="ownerName"
                                placeholder="사업자등록증의 대표자명을 입력해주세요"
                                value={ownerName}
                                onChange={(e) => setOwnerName(e.target.value)}
                                className="korean-input"
                                maxLength={30}
                            />
                        </div>

                        {/* 6. 사업자등록번호 */}
                        <div className="form-group-korean">
                            <label className="korean-label" htmlFor="businessNumber">
                                사업자등록번호 <span className="red-star">*</span>
                            </label>
                            <input
                                type="text"
                                id="businessNumber"
                                placeholder="000-00-00000"
                                value={businessNumber}
                                onChange={handleBusinessNumberChange}
                                onBlur={handleBusinessNumberBlur}
                                className={`korean-input ${businessNumberError ? "error" : ""}`}
                                maxLength={12}
                            />
                            {businessNumberError && <span className="error-text">{businessNumberError}</span>}
                        </div>

                        {/* 7. 사업장 소재지 */}
                        <div className="form-group-korean">
                            <label className="korean-label">
                                사업장 소재지 <span className="red-star">*</span>
                            </label>
                            <div className="input-with-btn">
                                <input
                                    type="text"
                                    placeholder="사업자등록증의 사업장 주소를 입력해주세요"
                                    value={businessAddress}
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
                                value={businessAddressDetail}
                                onChange={(e) => setBusinessAddressDetail(e.target.value)}
                                className="korean-input"
                                style={{ marginTop: "10px" }}
                                maxLength={100}
                                disabled={!businessAddress}
                            />
                        </div>

                        {/* 8. 업태 */}
                        <div className="form-group-korean">
                            <label className="korean-label" htmlFor="businessType">
                                업태 <span className="red-star">*</span>
                            </label>
                            <input
                                type="text"
                                id="businessType"
                                placeholder="예: 도매 및 소매업, 건설업"
                                value={businessType}
                                onChange={(e) => setBusinessType(e.target.value)}
                                className="korean-input"
                                maxLength={40}
                            />
                        </div>

                        {/* 9. 종목 */}
                        <div className="form-group-korean">
                            <label className="korean-label" htmlFor="businessItem">
                                종목 <span className="red-star">*</span>
                            </label>
                            <input
                                type="text"
                                id="businessItem"
                                placeholder="예: 바닥재, 인테리어, 장판, 벽지"
                                value={businessItem}
                                onChange={(e) => setBusinessItem(e.target.value)}
                                className="korean-input"
                                maxLength={40}
                            />
                        </div>

                        {/* 10. 대표 전화번호 */}
                        <div className="form-group-korean">
                            <label className="korean-label" htmlFor="phone">
                                대표 전화번호 <span className="red-star">*</span>
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                placeholder="010-0000-0000 또는 02-000-0000"
                                value={phone}
                                onChange={handlePhoneChange}
                                onBlur={handlePhoneBlur}
                                className={`korean-input ${phoneError ? "error" : ""}`}
                                maxLength={13}
                            />
                            {phoneError && <span className="error-text">{phoneError}</span>}
                        </div>

                        {/* 11. 이메일 */}
                        <div className="form-group-korean">
                            <label className="korean-label" htmlFor="email">
                                이메일 <span className="red-star">*</span>
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

                        {/* 12. 약관동의 영역 */}
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
                                                    checked={agreeAge}
                                                    onChange={(e) => handleAgreeAgeChange(e.target.checked)}
                                                />
                                                <span><span className="required-txt">[필수]</span> 만 14세 이상입니다</span>
                                            </label>
                                            <button type="button" className="view-terms-btn" onClick={() => openTermsModal("age")}>보기</button>
                                        </div>
                                        {agreeAgeError && <div className="agree-error-text">{agreeAgeError}</div>}
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
