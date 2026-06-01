import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { signup, checkDuplicateUsername } from "../../lib/auth";
import { Check, Search, MapPin } from "lucide-react";
import "./Signup.css";

export default function Signup() {
    const nav = useNavigate();
    const location = useLocation();
    
    // Form states
    const [userType, setUserType] = useState("인테리어 업체"); // Default: 인테리어 업체
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [phone, setPhone] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [address, setAddress] = useState("");
    const [addressDetail, setAddressDetail] = useState("");
    const [businessNumber, setBusinessNumber] = useState("");
    
    // Agreements state
    const [agreeAll, setAgreeAll] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [agreeMarketing, setAgreeMarketing] = useState(false);

    // Verification states
    const [otpSent, setOtpSent] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameError, setUsernameError] = useState("");
    const [usernameSuccess, setUsernameSuccess] = useState("");

    // Form errors
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // Setup redirect path
    const searchParams = new URLSearchParams(location.search);
    const redirectUrl = searchParams.get("redirect") || "/login";

    // Auto format phone number: 010-XXXX-XXXX
    const formatPhoneNumber = (value) => {
        const cleaned = value.replace(/\D/g, "");
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    };

    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhone(formatted);
        
        // Reset verification if phone changes
        if (otpSent || isPhoneVerified) {
            setOtpSent(false);
            setIsPhoneVerified(false);
            setOtpCode("");
        }
        
        if (errors.phone) {
            setErrors(prev => ({ ...prev, phone: "" }));
        }
    };

    // Auto format business number: XXX-XX-XXXXX
    const formatBusinessNumber = (value) => {
        const cleaned = value.replace(/\D/g, "");
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 10)}`;
    };

    const handleBusinessNumberChange = (e) => {
        const formatted = formatBusinessNumber(e.target.value);
        setBusinessNumber(formatted);
        if (errors.businessNumber) {
            setErrors(prev => ({ ...prev, businessNumber: "" }));
        }
    };

    // Username duplicate check (debounce or direct checking)
    const handleUsernameBlur = async () => {
        const val = username.trim();
        if (!val) {
            setUsernameError("아이디를 입력해주세요.");
            setUsernameSuccess("");
            return;
        }
        if (val.length < 4) {
            setUsernameError("아이디는 4자 이상 입력해주세요.");
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
        } catch (e) {
            setUsernameError("중복 확인에 실패했습니다.");
        } finally {
            setIsCheckingUsername(false);
        }
    };

    const handleUsernameChange = (e) => {
        setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, "")); // Limit to alphanumeric
        setUsernameError("");
        setUsernameSuccess("");
    };

    // Simulated Phone OTP Send
    const handleSendOtp = () => {
        const cleanedPhone = phone.replace(/\D/g, "");
        if (cleanedPhone.length !== 11 || !phone.startsWith("010")) {
            setErrors(prev => ({ ...prev, phone: "올바른 휴대폰 번호(010으로 시작하는 11자리 숫자)를 입력해주세요." }));
            return;
        }

        setErrors(prev => ({ ...prev, phone: "" }));
        setOtpSent(true);
        alert("인증번호가 발송되었습니다. (테스트 인증번호: 123456)");
        
        /* 
        실제 Supabase OTP 인증 연동 코드 예시:
        
        try {
            const { data, error } = await supabase.auth.signInWithOtp({
                phone: `+82${cleanedPhone.slice(1)}` // +821012345678 형식
            });
            if (error) throw error;
            setOtpSent(true);
        } catch (e) {
            setErrors(prev => ({ ...prev, phone: "인증번호 발송 실패: " + e.message }));
        }
        */
    };

    // Simulated Phone OTP Verify
    const handleVerifyOtp = () => {
        if (otpCode === "123456") {
            setIsPhoneVerified(true);
            setErrors(prev => ({ ...prev, otpCode: "" }));
            alert("휴대폰 인증이 성공적으로 완료되었습니다.");
        } else {
            setErrors(prev => ({ ...prev, otpCode: "인증번호가 일치하지 않습니다. 다시 확인해주세요." }));
        }

        /*
        실제 Supabase OTP 검증 연동 코드 예시:
        
        try {
            const cleanedPhone = phone.replace(/\D/g, "");
            const { data, error } = await supabase.auth.verifyOtp({
                phone: `+82${cleanedPhone.slice(1)}`,
                token: otpCode,
                type: 'sms'
            });
            if (error) throw error;
            setIsPhoneVerified(true);
        } catch (e) {
            setErrors(prev => ({ ...prev, otpCode: "인증 실패: " + e.message }));
        }
        */
    };

    // Fake Address Search popup
    const handleAddressSearch = () => {
        // Create simple window prompt for mockup address search
        const mockAddress = prompt("검색할 주소를 입력하세요 (예: 서울 강동구 천호대로 100):");
        if (mockAddress) {
            setAddress(mockAddress);
        }
        
        /*
        향후 Daum 우편번호 서비스(Postcode API) 연동 계획:
        
        new window.daum.Postcode({
            oncomplete: function(data) {
                let fullAddr = data.address;
                let extraAddr = '';
                
                if (data.addressType === 'R') {
                    if (data.bname !== '') extraAddr += data.bname;
                    if (data.buildingName !== '') extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                    fullAddr += (extraAddr !== '' ? ' ('+ extraAddr +')' : '');
                }
                
                setAddress(fullAddr);
                document.getElementById('addressDetail').focus();
            }
        }).open();
        */
    };

    // Agreement group control
    const handleAgreeAllChange = (e) => {
        const val = e.target.checked;
        setAgreeAll(val);
        setAgreeTerms(val);
        setAgreePrivacy(val);
        setAgreeMarketing(val);
    };

    useEffect(() => {
        if (agreeTerms && agreePrivacy && agreeMarketing) {
            setAgreeAll(true);
        } else {
            setAgreeAll(false);
        }
    }, [agreeTerms, agreePrivacy, agreeMarketing]);

    // Validation for Signup Button activation
    const isFormValid = () => {
        const cleanedPhone = phone.replace(/\D/g, "");
        const cleanedBiz = businessNumber.replace(/\D/g, "");

        const isUserTypeOk = !!userType;
        const isUsernameOk = username.trim().length >= 4 && !usernameError && usernameSuccess;
        const isNameOk = name.trim().length >= 1;
        const isPhoneOk = cleanedPhone.length === 11 && isPhoneVerified;
        const isPasswordOk = password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
        const isPasswordConfirmOk = password === passwordConfirm;
        const isRequiredAgreementsOk = agreeTerms && agreePrivacy;

        // Conditional validation based on user type
        let isBizOk = true;
        if (userType === "인테리어 업체") {
            isBizOk = cleanedBiz.length === 10;
        }

        return (
            isUserTypeOk &&
            isUsernameOk &&
            isNameOk &&
            isPhoneOk &&
            isPasswordOk &&
            isPasswordConfirmOk &&
            isRequiredAgreementsOk &&
            isBizOk
        );
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");

        // Final sanity checks
        if (!isFormValid()) {
            setSubmitError("모든 필수 입력 필드를 채우고 형식에 맞게 입력해 주세요.");
            return;
        }

        setIsSubmitting(true);

        const dataToSave = {
            username: username.trim(),
            password: password,
            name: name.trim(),
            phone: phone,
            company_name: userType !== "일반 고객" ? companyName.trim() : "",
            user_type: userType,
            address: address.trim(),
            address_detail: addressDetail.trim(),
            business_number: userType === "인테리어 업체" ? businessNumber : "",
            marketing_agree: agreeMarketing,
            memo: `주소 상세: ${addressDetail}. 가입 시 메모`
        };

        try {
            const res = await signup(dataToSave);
            if (res.success) {
                alert("회원가입이 완료되었습니다. 새로운 계정으로 로그인해 주세요!");
                nav(`/login${location.search}`); // Carry forward redirect query parameter
            } else {
                setSubmitError(res.message || "회원가입 처리 중 실패했습니다.");
            }
        } catch (err) {
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
                            자재 주문, 견적문의, 샘플북 이용을 위해 회원가입을 진행해주세요.
                        </p>
                    </div>

                    <form onSubmit={handleSignupSubmit} className="signup-korean-form">
                        
                        {/* 1. 회원 구분 (Tab buttons) */}
                        <div className="form-group-korean">
                            <label className="korean-label">회원 유형 <span className="red-star">*</span></label>
                            <div className="user-type-tabs">
                                {["인테리어 업체", "시공 기사", "일반 고객"].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        className={`tab-btn ${userType === type ? "active" : ""}`}
                                        onClick={() => {
                                            setUserType(type);
                                            // Reset company info if general user
                                            if (type === "일반 고객") {
                                                setCompanyName("");
                                                setBusinessNumber("");
                                            }
                                        }}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. 아이디 (Login username) */}
                        <div className="form-group-korean">
                            <label className="korean-label" htmlFor="username">아이디 <span className="red-star">*</span></label>
                            <input
                                type="text"
                                id="username"
                                placeholder="아이디를 입력해주세요 (영문/숫자 4자 이상)"
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

                        {/* 3. 이름 / 담당자명 */}
                        <div className="form-group-korean">
                            <label className="korean-label" htmlFor="name">이름 / 담당자명 <span className="red-star">*</span></label>
                            <input
                                type="text"
                                id="name"
                                placeholder="이름 또는 담당자명을 입력해주세요"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="korean-input"
                                maxLength={30}
                            />
                        </div>

                        {/* 4. 업체명 (일반 고객 아닐 때만 표시) */}
                        {userType !== "일반 고객" && (
                            <div className="form-group-korean">
                                <label className="korean-label" htmlFor="companyName">업체명 <span className="red-star">*</span></label>
                                <input
                                    type="text"
                                    id="companyName"
                                    placeholder="업체명을 입력해주세요"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="korean-input"
                                    maxLength={50}
                                />
                            </div>
                        )}

                        {/* 5. 사업자등록번호 (인테리어 업체만 표시) */}
                        {userType === "인테리어 업체" && (
                            <div className="form-group-korean">
                                <label className="korean-label" htmlFor="businessNumber">사업자등록번호 <span className="red-star">*</span></label>
                                <input
                                    type="text"
                                    id="businessNumber"
                                    placeholder="000-00-00000"
                                    value={businessNumber}
                                    onChange={handleBusinessNumberChange}
                                    className={`korean-input ${businessNumber && businessNumber.replace(/\D/g, "").length !== 10 ? "error" : ""}`}
                                    maxLength={12}
                                />
                                {businessNumber && businessNumber.replace(/\D/g, "").length !== 10 && (
                                    <span className="error-text">사업자등록번호 10자리를 정확히 입력해주세요.</span>
                                )}
                            </div>
                        )}

                        {/* 6. 전화번호 & OTP */}
                        <div className="form-group-korean">
                            <label className="korean-label" htmlFor="phone">전화번호 인증 <span className="red-star">*</span></label>
                            <div className="input-with-btn">
                                <input
                                    type="tel"
                                    id="phone"
                                    placeholder="010-0000-0000"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    className={`korean-input ${errors.phone ? "error" : ""} ${isPhoneVerified ? "verified" : ""}`}
                                    disabled={isPhoneVerified}
                                    maxLength={13}
                                />
                                <button
                                    type="button"
                                    className="action-btn"
                                    onClick={handleSendOtp}
                                    disabled={isPhoneVerified || phone.replace(/\D/g, "").length < 10}
                                >
                                    {otpSent ? "재전송" : "인증요청"}
                                </button>
                            </div>
                            {errors.phone && <span className="error-text">{errors.phone}</span>}

                            {/* OTP 입력란 */}
                            {otpSent && !isPhoneVerified && (
                                <div className="input-with-btn" style={{ marginTop: "10px" }}>
                                    <input
                                        type="text"
                                        placeholder="인증번호 6자리 입력 (123456)"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                                        className={`korean-input ${errors.otpCode ? "error" : ""}`}
                                        maxLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="action-btn verify-btn"
                                        onClick={handleVerifyOtp}
                                        disabled={otpCode.length !== 6}
                                    >
                                        확인
                                    </button>
                                </div>
                            )}
                            {errors.otpCode && <span className="error-text">{errors.otpCode}</span>}

                            {isPhoneVerified && (
                                <div className="verified-success-msg">
                                    <Check size={16} />
                                    <span>전화번호 인증이 완료되었습니다.</span>
                                </div>
                            )}
                        </div>

                        {/* 7. 비밀번호 */}
                        <div className="form-group-korean">
                            <label className="korean-label" htmlFor="password">비밀번호 <span className="red-star">*</span></label>
                            <input
                                type="password"
                                id="password"
                                placeholder="8자 이상 영문, 숫자 조합"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`korean-input ${password && (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) ? "error" : ""}`}
                                maxLength={30}
                            />
                            {password && (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) && (
                                <span className="error-text">비밀번호는 최소 8자 이상, 영문자와 숫자를 모두 포함해야 합니다.</span>
                            )}
                        </div>

                        {/* 8. 비밀번호 확인 */}
                        <div className="form-group-korean">
                            <label className="korean-label" htmlFor="passwordConfirm">비밀번호 확인 <span className="red-star">*</span></label>
                            <input
                                type="password"
                                id="passwordConfirm"
                                placeholder="비밀번호를 한 번 더 입력해주세요"
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                className={`korean-input ${passwordConfirm && password !== passwordConfirm ? "error" : ""}`}
                                maxLength={30}
                            />
                            {passwordConfirm && password !== passwordConfirm && (
                                <span className="error-text">비밀번호가 일치하지 않습니다.</span>
                            )}
                        </div>

                        {/* 9. 주소 입력 */}
                        <div className="form-group-korean">
                            <label className="korean-label">주소</label>
                            <div className="input-with-btn">
                                <input
                                    type="text"
                                    placeholder="주소를 검색해주세요"
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

                        {/* 10. 약관동의 영역 */}
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

                                <div className="agree-item">
                                    <label className="check-label-sub">
                                        <input
                                            type="checkbox"
                                            checked={agreeTerms}
                                            onChange={(e) => setAgreeTerms(e.target.checked)}
                                        />
                                        <span>[필수] 이용약관 동의</span>
                                    </label>
                                    <span className="view-terms-link">보기</span>
                                </div>

                                <div className="agree-item">
                                    <label className="check-label-sub">
                                        <input
                                            type="checkbox"
                                            checked={agreePrivacy}
                                            onChange={(e) => setAgreePrivacy(e.target.checked)}
                                        />
                                        <span>[필수] 개인정보 수집 및 이용 동의</span>
                                    </label>
                                    <span className="view-terms-link">보기</span>
                                </div>

                                <div className="agree-item">
                                    <label className="check-label-sub">
                                        <input
                                            type="checkbox"
                                            checked={agreeMarketing}
                                            onChange={(e) => setAgreeMarketing(e.target.checked)}
                                        />
                                        <span>[선택] 마케팅 정보 수신 동의</span>
                                    </label>
                                    <span className="view-terms-link">보기</span>
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
        </MainLayout>
    );
}
