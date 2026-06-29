import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabaseClient';
import { MapPin, Box, Calendar } from 'lucide-react';
import './Cases.css';

// Curated fallback portfolio cases
const STATIC_PROJECTS = [
  {
    id: 1,
    title: "마포구 아파트 거실 장판 시공",
    category: "주거공간",
    location: "마포구 아파트",
    material_summary: "LX하우시스 지아자연애 2.2T",
    description: "거실 및 방 전면 친환경 지아자연애 장판 시공으로 따뜻하고 정갈한 실내 분위기를 완성했습니다.",
    main_image_url: "/images/home-interior/korea-apt-living-01.png",
    constructed_at: "2026-03-12"
  },
  {
    id: 2,
    title: "강남구 오피스 카페트타일 시공",
    category: "사무공간",
    location: "강남구 테헤란로 빌딩",
    material_summary: "스완카페트 고급 롤/타일 카페트",
    description: "회의실 및 개방형 사무실 전체에 흡음과 보온성이 우수한 스완 카페트타일을 정밀 재단 시공했습니다.",
    main_image_url: "/images/home-interior/korea-office-01.png",
    constructed_at: "2026-04-18"
  },
  {
    id: 3,
    title: "성동구 매장 데코타일 시공",
    category: "상업공간",
    location: "성동구 성수동 쇼룸",
    material_summary: "녹수 프리미엄 스톤 데코타일",
    description: "유동인구가 많은 쇼룸 전시실과 로비에 내구성이 우수한 녹수 스톤 데코타일을 시공하여 모던하고 감각적인 바닥을 완성했습니다.",
    main_image_url: "/images/home-interior/korea-store-01.png",
    constructed_at: "2026-05-02"
  },
  {
    id: 4,
    title: "용산구 주거공간 벽지 시공",
    category: "주거공간",
    location: "용산구 주택",
    material_summary: "개나리 로하스 실크 벽지 (에비뉴 화이트)",
    description: "침실 3개소의 노후된 벽면을 걷어내고 실크 화이트 톤의 개나리 벽지를 도배하여 모던 화이트 홈 스타일을 구현했습니다.",
    main_image_url: "/images/home-interior/korea-bedroom-01.png",
    constructed_at: "2026-05-20"
  }
];

export default function Cases() {
  const [casesList, setCasesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('전체');

  useEffect(() => {
    async function loadCases() {
      try {
        setLoading(true);
        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }
        
        // Fetch only active/public cases sorted by sort_order
        const { data, error } = await supabase
          .from('construction_cases')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setCasesList(data);
        } else {
          // Use fallback
          setCasesList(STATIC_PROJECTS);
        }
      } catch (err) {
        console.warn('[Cases] Failed to fetch from Supabase. Falling back to static data.', err);
        setCasesList(STATIC_PROJECTS);
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, []);

  // Filtering options
  const categories = ['전체', '주거공간', '사무공간', '상업공간'];

  const filteredCases = casesList.filter(item => {
    if (categoryFilter === '전체') return true;
    return item.category === categoryFilter;
  });

  return (
    <MainLayout>
      <div className="cases-page-container container">
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
                  <img
                    src={item.main_image_url || "/images/no-image.svg"}
                    alt={item.title}
                    className="case-image"
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
