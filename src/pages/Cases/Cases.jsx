import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabaseClient';
import { MapPin, Box, Calendar, Edit2, Trash2, Eye, EyeOff, ArrowUpRight } from 'lucide-react';
import SEO from '../../components/seo/SEO';
import { resolveCaseMaterialLinks } from '../../utils/caseMaterialUtils';
import './Cases.css';

const FALLBACK_CASES = [
  {
    id: 6,
    slug: 'giheung-gym-lx-prestige-8698',
    title: '용인 기흥 헬스장 LX 프레스티지 8698 시공',
    location: '경기도 용인시 기흥구',
    category: '상업공간',
    material_summary: 'LX하우시스 프레스티지 5T PTT8698 (더스크 브론즈) · 457.2×914.4mm · 5.0T',
    product_id: 106078,
    products: {
      id: 106078,
      name: 'LX 프레스티지 5T PTT8698 더스크 브론즈',
      slug: 'decotile-lx-prestige-stone-rect-ptt8698-더스크브론즈',
      product_code: 'PTT8698'
    },
    description: '용인 기흥구 헬스장 현장에 LX하우시스 프리미엄 5.0T 프레스티지 장방형 스톤 PTT8698(더스크 브론즈)을 시공했습니다. 동조엠보(EIR)와 고강도 표면 처리로 헬스기구와 통행량이 많은 상업 공간에 뛰어난 내구성과 고급스러운 호텔급 인테리어를 완성했습니다.',
    main_image_url: '/images/시공사례/2026.11.11 LX 프레스티지 8698 기흥 헬스장/KakaoTalk_20261111_154511524.jpg',
    image_urls: [
      '/images/시공사례/2026.11.11 LX 프레스티지 8698 기흥 헬스장/KakaoTalk_20261111_154511524.jpg',
      '/images/시공사례/2026.11.11 LX 프레스티지 8698 기흥 헬스장/KakaoTalk_20261111_154511524_01.jpg'
    ],
    constructed_at: '2026-11-11',
    is_active: true,
    is_published: true,
    sort_order: 1
  },
  {
    id: 7,
    slug: 'guui-apartment-dongshin-726',
    title: '서울 구의동 아파트 동신 726 데코타일 시공',
    location: '서울특별시 광진구 구의동',
    category: '주거공간',
    material_summary: '동신 아트타일 726 (AH 726 / AB 726) · 3.0T',
    product_id: 101323,
    products: {
      id: 101323,
      name: 'AH 726',
      slug: '데코타일-동신-아트하우스-ah726',
      product_code: 'AH 726'
    },
    description: '서울 광진구 구의동 아파트 주거 공간에 동신 아트타일 726번 자재를 깔끔하고 정교하게 시공한 현장입니다. 밝고 내추럴한 감성의 바닥 마감으로 실내 공간이 더욱 넓고 아늑하게 연출되었습니다.',
    main_image_url: '/images/시공사례/2025.07.24 동신 726 구의동 아파트/KakaoTalk_20261113_133133183.jpg',
    image_urls: [
      '/images/시공사례/2025.07.24 동신 726 구의동 아파트/KakaoTalk_20261113_133133183.jpg',
      '/images/시공사례/2025.07.24 동신 726 구의동 아파트/KakaoTalk_20261113_133133183_01.jpg',
      '/images/시공사례/2025.07.24 동신 726 구의동 아파트/KakaoTalk_20261113_133133183_02.jpg',
      '/images/시공사례/2025.07.24 동신 726 구의동 아파트/KakaoTalk_20261113_133133183_03.jpg',
      '/images/시공사례/2025.07.24 동신 726 구의동 아파트/KakaoTalk_20261113_133133183_04.jpg'
    ],
    constructed_at: '2025-07-24',
    is_active: true,
    is_published: true,
    sort_order: 2
  },
  {
    id: 8,
    slug: 'garak-officetel-kcc-5551',
    title: '서울 가락동 오피스텔 KCC 5551 시공',
    location: '서울특별시 송파구 가락동',
    category: '사무공간',
    material_summary: 'KCC 센스타일 트랜디 450각 TS 5551 · 457.2×457.2mm · 3.0T',
    product_id: 100924,
    products: {
      id: 100924,
      name: 'TS5551P',
      slug: '데코타일-kcc-kcc_square-ts5551p',
      product_code: 'TS5551P'
    },
    description: '서울 송파구 가락동 오피스텔 바닥에 KCC 센스타일 트랜디 TS 5551 사각 데코타일을 시공한 현장입니다. 모던하고 단정한 그레이 톤으로 오피스 및 주거 복합 공간에 세련된 분위기를 제공합니다.',
    main_image_url: '/images/시공사례/2025.07.16 KCC 5551 가락동 오피스텔/KakaoTalk_20261113_132034837.jpg',
    image_urls: [
      '/images/시공사례/2025.07.16 KCC 5551 가락동 오피스텔/KakaoTalk_20261113_132034837.jpg',
      '/images/시공사례/2025.07.16 KCC 5551 가락동 오피스텔/KakaoTalk_20261113_132034837_01.jpg',
      '/images/시공사례/2025.07.16 KCC 5551 가락동 오피스텔/KakaoTalk_20261113_132034837_02.jpg',
      '/images/시공사례/2025.07.16 KCC 5551 가락동 오피스텔/KakaoTalk_20261113_132034837_03.jpg'
    ],
    constructed_at: '2025-07-16',
    is_active: true,
    is_published: true,
    sort_order: 3
  },
  {
    id: 2,
    slug: 'anseong-gym-kcc-ts5534m',
    title: '안성 헬스장 KCC 5534 시공',
    location: '경기도 안성시',
    category: '상업공간',
    material_summary: 'KCC 센스타일 트랜디 TS 5534 · 450각/600각 · 3.0T',
    product_id: 100909,
    products: {
      id: 100909,
      name: 'TS5534M',
      slug: '데코타일-kcc-kcc_square-ts5534m',
      product_code: 'TS5534M'
    },
    description: '경기도 안성시 헬스장 바닥에 KCC 센스타일 트랜디 TS 5534 데코타일을 시공한 현장입니다. 견고한 내구성과 묵직한 다크 톤 질감으로 프리미엄 피트니스 공간에 최적화된 마감을 구현했습니다.',
    main_image_url: '/images/시공사례/2025.07.14 안성헬스장 KCC 5534/KakaoTalk_20261113_131925191.jpg',
    image_urls: [
      '/images/시공사례/2025.07.14 안성헬스장 KCC 5534/KakaoTalk_20261113_131925191.jpg',
      '/images/시공사례/2025.07.14 안성헬스장 KCC 5534/KakaoTalk_20261113_131925191_01.jpg',
      '/images/시공사례/2025.07.14 안성헬스장 KCC 5534/KakaoTalk_20261113_131925191_02.jpg',
      '/images/시공사례/2025.07.14 안성헬스장 KCC 5534/KakaoTalk_20261113_131925191_03.jpg',
      '/images/시공사례/2025.07.14 안성헬스장 KCC 5534/KakaoTalk_20261113_131925191_04.jpg',
      '/images/시공사례/2025.07.14 안성헬스장 KCC 5534/KakaoTalk_20261113_131925191_05.jpg'
    ],
    constructed_at: '2025-07-14',
    is_active: true,
    is_published: true,
    sort_order: 4
  }
];

export default function Cases() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  const [casesList, setCasesList] = useState(FALLBACK_CASES);
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
        .select('*, products:product_id ( id, name, slug, product_code )');

      // 일반 사용자에게는 노출된 사례만 표시
      if (!isAdmin) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setCasesList(data);
      } else {
        setCasesList(FALLBACK_CASES);
      }
    } catch (err) {
      console.error('[Cases] Failed to fetch construction cases, using verified fallback list.', err);
      setCasesList(FALLBACK_CASES);
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
                    {item.material_summary && (() => {
                      const materialLinks = resolveCaseMaterialLinks(item);
                      return (
                        <div className="spec-row spec-row-material">
                          <Box size={14} className="spec-icon" />
                          <span className="spec-label">사용 자재</span>
                          <div className="case-material-links-wrap">
                            {materialLinks.length > 0 ? (
                              materialLinks.map((linkItem, idx) => (
                                <Link
                                  key={idx}
                                  to={linkItem.path}
                                  className="case-material-link highlighted"
                                  title={`${linkItem.label} ${linkItem.isDirectDetail ? '상세페이지로 이동' : '자재 검색 결과로 이동'}`}
                                >
                                  <span className="material-link-text">{linkItem.label}</span>
                                  <ArrowUpRight size={13} className="material-link-icon" />
                                </Link>
                              ))
                            ) : (
                              <span className="spec-value highlighted">{item.material_summary}</span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
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
