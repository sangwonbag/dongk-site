import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Send, CheckCircle } from 'lucide-react';

export default function ChatContactForm({ sessionId, onCancel, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        area: '',
        material_of_interest: '',
        inquiry_details: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('inquiries')
                .insert([{
                    session_id: sessionId,
                    ...formData,
                    status: '신규'
                }]);

            if (error) throw error;
            
            setIsSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (error) {
            console.error('Error saving inquiry:', error);
            alert('상담 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="chat-contact-form-success">
                <CheckCircle size={48} className="success-icon" />
                <h3>상담 접수가 완료되었습니다!</h3>
                <p>담당자가 내용을 확인한 후 연락드리겠습니다.</p>
            </div>
        );
    }

    return (
        <form className="chat-contact-form" onSubmit={handleSubmit}>
            <div className="form-header">
                <h3>상담 접수</h3>
                <p>자세한 안내를 원하시면 남겨주세요.</p>
            </div>
            
            <div className="form-group">
                <label>이름 / 상호</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="홍길동" />
            </div>
            <div className="form-group">
                <label>연락처</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="010-0000-0000" />
            </div>
            <div className="form-group">
                <label>현장 주소 (동까지만)</label>
                <input type="text" name="address" required value={formData.address} onChange={handleChange} placeholder="서울시 강남구" />
            </div>
            <div className="form-group">
                <label>시공 평수</label>
                <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="예: 32평" />
            </div>
            <div className="form-group">
                <label>관심 자재</label>
                <input type="text" name="material_of_interest" value={formData.material_of_interest} onChange={handleChange} placeholder="장판, 데코타일 등" />
            </div>
            <div className="form-group">
                <label>문의 내용</label>
                <textarea name="inquiry_details" rows="3" value={formData.inquiry_details} onChange={handleChange} placeholder="궁금하신 점을 남겨주세요"></textarea>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={onCancel} disabled={isSubmitting}>취소</button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                    {isSubmitting ? '접수중...' : '접수하기'} <Send size={16} />
                </button>
            </div>
        </form>
    );
}
