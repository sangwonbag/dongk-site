import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup, checkDuplicateUsername } from "../../lib/auth";
import { X, Camera, User } from "lucide-react";
import "./Signup.css";

export default function Signup() {
    const nav = useNavigate();
    
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        passwordConfirm: "",
        name: "",
        phone: "",
        company_name: "",
        user_type: "일반 소비자", // Default value
        address: "",
        memo: ""
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.username.trim() || formData.username.length < 4) {
            newErrors.username = "아이디는 4자 이상 입력해주세요.";
        }
        
        if (!formData.password || formData.password.length < 6) {
            newErrors.password = "비밀번호는 6자 이상 입력해주세요.";
        }
        
        if (formData.password !== formData.passwordConfirm) {
            newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
        }
        
        if (!formData.name.trim()) {
            newErrors.name = "이름을 입력해주세요.";
        }
        
        const phoneRegex = /^[0-9-]+$/;
        if (!formData.phone.trim() || !phoneRegex.test(formData.phone)) {
            newErrors.phone = "올바른 전화번호를 입력해주세요 (숫자와 하이픈만 허용).";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        setErrors({});

        const duplicateCheck = await checkDuplicateUsername(formData.username);
        
        if (duplicateCheck.error) {
            setErrors({ submit: duplicateCheck.error });
            setIsSubmitting(false);
            return;
        }

        if (duplicateCheck.isDuplicate) {
            setErrors({ username: "이미 존재하는 아이디입니다." });
            setIsSubmitting(false);
            return;
        }

        const result = await signup(formData);
        
        if (result.success) {
            alert("회원가입이 완료되었습니다. 로그인해주세요.");
            nav("/login");
        } else {
            setErrors({ submit: result.message });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="signup-overlay">
            <div className="signup-modal">
                <button className="btn-close-modal" onClick={() => nav("/login")}>
                    <X size={24} strokeWidth={1} color="#aaa" />
                </button>

                <h1 className="signup-title">회원가입</h1>
                
                <div className="profile-upload-area">
                    <div className="profile-circle">
                        <User size={48} color="#ddd" strokeWidth={1.5} />
                        <div className="camera-badge">
                            <Camera size={14} color="#fff" />
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="signup-form">
                    
                    {/* 계정 정보 그룹 */}
                    <div className="input-group">
                        <input 
                            type="text" 
                            name="username"
                            placeholder="아이디 (4자 이상)" 
                            value={formData.username}
                            onChange={handleChange}
                            className={errors.username ? "input-error" : ""}
                        />
                        <input 
                            type="password" 
                            name="password"
                            placeholder="비밀번호 (6자 이상)" 
                            value={formData.password}
                            onChange={handleChange}
                            className={errors.password ? "input-error" : ""}
                        />
                        <input 
                            type="password" 
                            name="passwordConfirm"
                            placeholder="비밀번호 확인" 
                            value={formData.passwordConfirm}
                            onChange={handleChange}
                            className={errors.passwordConfirm ? "input-error" : ""}
                        />
                    </div>
                    {(errors.username || errors.password || errors.passwordConfirm) && (
                        <div className="group-error">
                            {errors.username || errors.password || errors.passwordConfirm}
                        </div>
                    )}

                    {/* 이름 및 연락처 그룹 */}
                    <div className="form-section">
                        <label className="section-label">기본 정보 <span className="required-dot"></span></label>
                        <div className="input-group">
                            <input 
                                type="text" 
                                name="name"
                                placeholder="이름을(를) 입력하세요" 
                                value={formData.name}
                                onChange={handleChange}
                                className={errors.name ? "input-error" : ""}
                            />
                            <input 
                                type="text" 
                                name="phone"
                                placeholder="전화번호 (숫자/하이픈만)" 
                                value={formData.phone}
                                onChange={handleChange}
                                className={errors.phone ? "input-error" : ""}
                            />
                        </div>
                        {(errors.name || errors.phone) && (
                            <div className="group-error">
                                {errors.name || errors.phone}
                            </div>
                        )}
                    </div>

                    {/* 업체 정보 그룹 */}
                    <div className="form-section">
                        <label className="section-label">회원 구분 및 업체명 <span className="required-dot"></span></label>
                        <div className="input-group">
                            <select 
                                name="user_type" 
                                value={formData.user_type}
                                onChange={handleChange}
                                className="signup-select"
                            >
                                <option value="일반 소비자">일반 소비자</option>
                                <option value="시공업자">시공업자</option>
                                <option value="인테리어 업체">인테리어 업체</option>
                                <option value="기타">기타</option>
                            </select>
                            <input 
                                type="text" 
                                name="company_name"
                                placeholder="업체명 / 상호명 (선택)" 
                                value={formData.company_name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* 추가 정보 그룹 */}
                    <div className="form-section">
                        <label className="section-label">추가 정보</label>
                        <div className="input-group">
                            <input 
                                type="text" 
                                name="address"
                                placeholder="주소 (선택)" 
                                value={formData.address}
                                onChange={handleChange}
                            />
                            <input 
                                type="text" 
                                name="memo"
                                placeholder="메모 / 요청사항 (선택)" 
                                value={formData.memo}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {errors.submit && <div className="submit-error">{errors.submit}</div>}

                    <button 
                        type="submit" 
                        className="btn-signup-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "처리 중..." : "가입하기"}
                    </button>
                </form>
            </div>
        </div>
    );
}
