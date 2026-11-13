import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabaseClient';
import { MapPin, Box, Calendar, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import SEO from '../../components/seo/SEO';
import './Cases.css';

export default function Cases() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  const [casesList, setCasesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const categoryFilter = searchParams.get('category') || '전체';

  const setCategoryFilter = (cat) => {
    if (cat === '전체') {
      searchParams.delete('category');
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ category: cat }, { replace: true });
    }
  };

  const loadCases = async () => {
    try {
      setLoading(true);
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      let query = supabase
        .from('construction_cases')
        .select('*');

      // 일반 사용자에게는 노출된 사례만 표시
      if (!isAdmin) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCasesList(data || []);
    } catch (err) {
      console.error('[Cases] Failed to fetch construction cases.', err);
      setCasesList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [isAdmin]);

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      const nextStatus = !currentStatus;
      const { error } = await supabase
        .from('construction_cases')
        .update({ 
          is_published: nextStatus,
          is_active: nextStatus // Maintain both fields dynamically
        })
        .eq('id', id);
      
      if (error) throw error;
      alert('노출 상태가 성공적으로 변경되었습니다.');
      loadCases();
    } catch (err) {
      alert('상태 변경에 실패했습니다: ' + err.message);
    }
  };

  const handleDeleteCase = async (id) => {
    if (!window.confirm('이 시공사례를 정말 삭제하시겠습니까?')) return;
    try {
      const { error } = await supabase
        .from('construction_cases')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      alert('성공적으로 삭제되었습니다.');
      loadCases();
    } catch (err) {
      alert('삭제에 실패했습니다: ' + err.message);
    }
  };

  // Filtering options
  const categories = ['전체', '주거공간', '사무공간', '상업공간'];

  const filteredCases = casesList.filter(item => {
    if (categoryFilter === '전체') return true;
    return item.category === categoryFilter;
  });

  return (
    <MainLayout>
      <SEO 
        title="시공사례 | 동경바닥재 - 데코타일·마루·장판 실제 바닥 시공 포트폴리오"
        description="동경바닥재의 실제 주거, 사무, 상업 공간 바닥재(데코타일, 마루, 장판, 카페트타일) 시공사례 포트폴리오를 확인하세요."
        canonical="https://dkfloor.co.kr/cases"
      />
      <div className="cases-page-container container">
        {/* Admin Quick Banner */}
        {isAdmin && (
          <div className="cases-admin-banner">
            <div className="admin-banner-text">
              🛡️ <strong>관리자 계정으로 로그인했습니다.</strong> 시공사례 노출 여부 관리 및 등록/수정/삭제를 인라인으로 처리하거나 관리자 패널로 진입할 수 있습니다.
            </div>
            <button className="btn-admin-manage" onClick={() => navigate('/admin/construction-cases')}>
              시공사례 관리 패널 이동
            </button>
          </div>
        )}

        {/* Banner Section */}
        <div className="cases-banner">
          <div className="banner-content">
            <span className="banner-badge">PORTFOLIO</span>
            <h1>시공사례</h1>
            <p>동경바닥재가 정직하고 정교하게 완성한 주거, 상업, 오피스 공간의 바닥 및 벽지 시공 히스토리입니다.</p>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="cases-category-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cases Grid */}
        {loading ? (
          <div className="cases-loading-wrapper">
            <div className="spinner-loader"></div>
            <p>시공 포트폴리오를 불러오고 있습니다...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="cases-empty">
            <h3>등록된 시공사례가 없습니다.</h3>
            <p>다른 카테고리를 선택해 보시기 바랍니다.</p>
          </div>
        ) : (
          <div className="cases-grid-layout">
            {filteredCases.map(item => (
              <div key={item.id} className="case-portfolio-card">
                <div className="case-img-wrapper">
                  {isAdmin && (
                    <span className={`case-admin-status-badge ${item.is_published ? 'published' : 'unpublished'}`}>
                      {item.is_published ? '노출 중' : '비노출'}
                    </span>
                  )}
                  <img
                    src={item.main_image_url || "/images/no-image.svg"}
                    alt={item.title}
                    className="case-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/no-image.svg";
                    }}
                  />
                  {item.category && <span className="case-tag-badge">{item.category}</span>}
                </div>

                <div className="case-body-info">
                  <h3 className="case-title-text">{item.title}</h3>
                  {item.description && <p className="case-desc-text">{item.description}</p>}
                  {Array.isArray(item.image_urls) && item.image_urls.length > 0 && (
                    <div className="case-gallery" aria-label={`${item.title} 현장 사진`}>
                      {item.image_urls.map((url, index) => (
                        <a href={url} target="_blank" rel="noopener noreferrer" key={`${url}-${index}`} aria-label={`현장 사진 ${index + 1} 크게 보기`}>
                          <img src={url} alt={`${item.title} 현장 사진 ${index + 1}`} loading="lazy" />
                        </a>
                      ))}
                    </div>
                  )}
                  
                  <div className="case-specs-list">
                    {item.location && (
                      <div className="spec-row">
                        <MapPin size={14} className="spec-icon" />
                        <span className="spec-label">시공 지역</span>
                        <span className="spec-value">{item.location}</span>
                      </div>
                    )}
                    {item.material_summary && (
                      <div className="spec-row">
                        <Box size={14} className="spec-icon" />
                        <span className="spec-label">사용 자재</span>
                        <span className="spec-value highlighted">{item.material_summary}</span>
                      </div>
                    )}
                    {item.constructed_at && (
                      <div className="spec-row">
                        <Calendar size={14} className="spec-icon" />
                        <span className="spec-label">시공 연월</span>
                        <span className="spec-value">
                          {new Date(item.constructed_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
                        </span>
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="case-admin-actions">
                      <button 
                        className="btn-admin-action edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/admin/construction-cases');
                        }}
                        title="어드민에서 편집"
                      >
                        <Edit2 size={12} /> 편집
                      </button>
                      <button 
                        className={`btn-admin-action toggle ${item.is_published ? 'hide' : 'show'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePublish(item.id, item.is_published ?? true);
                        }}
                        title={item.is_published ? "숨기기" : "노출하기"}
                      >
                        {item.is_published ? <EyeOff size={12} /> : <Eye size={12} />}
                        {item.is_published ? '숨김' : '노출'}
                      </button>
                      <button 
                        className="btn-admin-action delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCase(item.id);
                        }}
                        title="삭제"
                      >
                        <Trash2 size={12} /> 삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
