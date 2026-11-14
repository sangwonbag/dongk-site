import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabaseClient';
import SEO from '../../components/seo/SEO';
import CaseCard from './CaseCard';
import CaseLightboxModal from './CaseLightboxModal';
import { FALLBACK_CASES } from '../../data/fallbackCases';
import { invalidateCasesCache } from '../../utils/constructionCasesService';
import './Cases.css';

// In-memory cache for instant zero-lag re-visits
let cachedCasesData = null;


export default function Cases() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const isAdmin = useMemo(() => Boolean(user && (user.role === 'admin' || user.role === 'staff')), [user?.role]);

  const [casesList, setCasesList] = useState(() => cachedCasesData || FALLBACK_CASES);
  const [loading, setLoading] = useState(() => !cachedCasesData && !FALLBACK_CASES.length);
  const categoryFilter = searchParams.get('category') || '전체';

  // Lightbox Modal State
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    title: '',
    images: [],
    currentIndex: 0
  });

  const setCategoryFilter = useCallback((cat) => {
    if (cat === '전체') {
      searchParams.delete('category');
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ category: cat }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const loadCases = useCallback(async (forceRefresh = false) => {
    // If cached in-memory and not a forced admin refresh, avoid redundant network round-trip & re-render
    if (cachedCasesData && !forceRefresh) {
      return;
    }

    try {
      if (!cachedCasesData || forceRefresh) {
        setLoading(true);
      }

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      let query = supabase
        .from('construction_cases')
        .select('id, title, slug, location, material_summary, product_id, main_image_url, description, constructed_at, sort_order, is_published, category, image_urls, products:product_id ( id, name, slug, product_code )');

      // 일반 사용자에게는 노출된 사례만 표시
      if (!isAdmin) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        cachedCasesData = data;
        setCasesList(data);
      } else {
        setCasesList(FALLBACK_CASES);
      }
    } catch (err) {
      console.error('[Cases] Failed to fetch construction cases, using verified fallback list.', err);
      setCasesList(prev => (prev && prev.length > 0 ? prev : FALLBACK_CASES));
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const handleTogglePublish = useCallback(async (id, currentStatus) => {
    try {
      const nextStatus = !currentStatus;
      const { error } = await supabase
        .from('construction_cases')
        .update({
          is_published: nextStatus,
          is_active: nextStatus
        })
        .eq('id', id);

      if (error) throw error;
      invalidateCasesCache();
      alert('노출 상태가 성공적으로 변경되었습니다.');
      loadCases(true);
    } catch (err) {
      alert('상태 변경에 실패했습니다: ' + err.message);
    }
  }, [loadCases]);

  const handleOpenLightbox = useCallback((item, index = 0) => {
    const images = Array.isArray(item.image_urls) && item.image_urls.length > 0
      ? item.image_urls
      : (item.main_image_url ? [item.main_image_url] : []);

    setLightboxState({
      isOpen: true,
      title: item.title,
      images,
      currentIndex: Math.max(0, Math.min(index, images.length - 1))
    });
  }, []);

  // Direct case focus/lightbox if ?id= or ?caseId= is passed in URL
  useEffect(() => {
    const targetId = searchParams.get('id') || searchParams.get('caseId');
    if (!targetId || casesList.length === 0) return;

    const found = casesList.find(c => String(c.id) === String(targetId) || c.slug === targetId);
    if (found) {
      handleOpenLightbox(found, 0);
      setTimeout(() => {
        const el = document.getElementById(`case-card-${found.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  }, [searchParams, casesList, handleOpenLightbox]);

  const handleCloseLightbox = useCallback(() => {
    setLightboxState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleLightboxIndexChange = useCallback((newIdx) => {
    setLightboxState(prev => ({ ...prev, currentIndex: newIdx }));
  }, []);

  const handleEditCase = useCallback((item) => {
    navigate('/admin/construction-cases');
  }, [navigate]);

  const categories = useMemo(() => ['전체', '주거공간', '사무공간', '상업공간'], []);

  const filteredCases = useMemo(() => {
    return casesList.filter(item => {
      if (categoryFilter === '전체') return true;
      return item.category === categoryFilter;
    });
  }, [casesList, categoryFilter]);

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
        {loading && casesList.length === 0 ? (
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
            {filteredCases.map((item, idx) => (
              <CaseCard
                key={item.id || item.slug}
                item={item}
                index={idx}
                isAdmin={isAdmin}
                onOpenLightbox={handleOpenLightbox}
                onEdit={handleEditCase}
                onTogglePublish={handleTogglePublish}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal (mounted only on demand when open) */}
      {lightboxState.isOpen && (
        <CaseLightboxModal
          isOpen={lightboxState.isOpen}
          onClose={handleCloseLightbox}
          title={lightboxState.title}
          images={lightboxState.images}
          currentIndex={lightboxState.currentIndex}
          onIndexChange={handleLightboxIndexChange}
        />
      )}
    </MainLayout>
  );
}
