import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './Inquiries.css';

export default function Inquiries() {
    const navigate = useNavigate();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('inquiries')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setInquiries(data || []);
        } catch (error) {
            console.error('Error fetching inquiries:', error);
            alert('상담 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('inquiries')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            
            // Update local state
            setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
        } catch (error) {
            console.error('Error updating status:', error);
            alert('상태 변경에 실패했습니다.');
        }
    };

    const STATUS_OPTIONS = ['신규', '상담중', '견적완료', '시공완료', '보류'];

    if (loading) {
        return (
            <MainLayout>
                <div className="admin-container" style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
                    <p>로딩 중...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="admin-container">
                <span className="back-to-dashboard" onClick={() => navigate('/admin')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6366f1', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '500', transition: 'color 0.2s' }}>
                    <ArrowLeft size={16} />
                    관리자 대시보드로 돌아가기
                </span>
            <h2>AI 상담 접수 목록</h2>
            
            <div className="inquiries-list">
                {inquiries.length === 0 ? (
                    <p className="no-data">접수된 상담 내역이 없습니다.</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="inquiries-table">
                            <thead>
                                <tr>
                                    <th>접수일</th>
                                    <th>이름/상호</th>
                                    <th>연락처</th>
                                    <th>현장주소</th>
                                    <th>평수</th>
                                    <th>관심자재</th>
                                    <th>문의내용</th>
                                    <th>상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inquiries.map(inq => (
                                    <tr key={inq.id}>
                                        <td>{new Date(inq.created_at).toLocaleString('ko-KR')}</td>
                                        <td>{inq.name || '-'}</td>
                                        <td>{inq.phone || '-'}</td>
                                        <td>{inq.address || '-'}</td>
                                        <td>{inq.area || '-'}</td>
                                        <td>{inq.material_of_interest || '-'}</td>
                                        <td className="inquiry-details">{inq.inquiry_details || '-'}</td>
                                        <td>
                                            <select 
                                                value={inq.status || '신규'} 
                                                onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                                                className={`status-select status-${(inq.status || '신규').replace(' ', '')}`}
                                            >
                                                {STATUS_OPTIONS.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            </div>
        </MainLayout>
    );
}
