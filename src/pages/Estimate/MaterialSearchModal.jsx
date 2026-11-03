import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search, Loader2, Plus, Check } from 'lucide-react';
import { useEstimateCart } from '../../contexts/EstimateCartContext';
import { getComputedBrand } from '../../utils/brandUtils';
import { searchProductsServer, fetchBrands } from '../../utils/supabaseFetcher';
import { getProductImageCandidates } from '../../utils/productImageResolver';
import { HIDE_SUB_MATERIALS, isSubMaterialCategory } from '../../config/categoryConfig';
import { ProductImage } from '../../components/ui';
import './MaterialSearchModal.css';

// Client-side memory cache for search terms and filters
const localSearchCache = new Map();

const POPULAR_KEYWORDS = [
  '베이지', '콘크리트', '밝은 우드', '그레이 600각', '따뜻한 분위기', '카페트바닥재', '디아망', '센스타일'
];

const CATEGORIES = ['전체', '데코타일', '장판', '마루', '벽지', '카페트타일'];

const BRANDS_BY_CATEGORY = {
  '전체': ['전체', '동화', '한솔', 'LX', 'KCC', '이건', '구정', '현대', '대진', '신한', '코오롱'],
  '데코타일': ['전체', 'KCC', 'LX', '현대', '녹수', '대진', '동신', '유성'],
  '장판': ['전체', 'KCC', 'LX', '현대', '재영'],
  '마루': ['전체', '동화', '한솔', '이건', '구정', 'LX'],
  '벽지': ['전체', 'LX', '신한', '개나리', '디아이디', '현대'],
  '카페트타일': ['전체', '스완', '코오롱']
};

export default function MaterialSearchModal({ onClose, defaultQuantity = 1 }) {
  const { cartItems, addToCart } = useEstimateCart();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedBrand, setSelectedBrand] = useState('전체');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const abortControllerRef = useRef(null);
  const latestRequestIdRef = useRef(0);

  // Pre-load brands on mount
  useEffect(() => {
    fetchBrands().catch(console.error);
  }, []);

  // Debounce the input query (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // When category changes, reset brand to '전체'
  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setSelectedBrand('전체');
  };

  // Available brand tabs for current category
  const brandTabs = useMemo(() => {
    return BRANDS_BY_CATEGORY[selectedCategory] || ['전체'];
  }, [selectedCategory]);

  // Execute search / browse
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    const cacheKey = `${trimmed.toLowerCase()}|${selectedCategory}|${selectedBrand}`;

    if (localSearchCache.has(cacheKey)) {
      setResults(localSearchCache.get(cacheKey));
      setLoading(false);
      return;
    }

    const currentRequestId = ++latestRequestIdRef.current;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);

    const searchOptions = {
      category: selectedCategory === '전체' ? null : selectedCategory,
      brand: selectedBrand === '전체' ? null : selectedBrand,
      limit: 60
    };

    searchProductsServer(trimmed, controller.signal, searchOptions)
      .then((data) => {
        if (controller.signal.aborted || currentRequestId !== latestRequestIdRef.current) return;
        
        const finalData = HIDE_SUB_MATERIALS ? (data || []).filter(item => !isSubMaterialCategory(item)) : (data || []);
        localSearchCache.set(cacheKey, finalData);
        setResults(finalData);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted || currentRequestId !== latestRequestIdRef.current || err.name === 'AbortError' || err.message === 'aborted') return;
        console.error('[Search Modal Error]:', err);
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery, selectedCategory, selectedBrand]);

  const handleAdd = (item) => {
    const existing = cartItems.find(i => String(i.id) === String(item.id));
    const addQty = existing ? 1 : defaultQuantity;
    addToCart({ 
      ...item, 
      quantity: addQty
    });
  };

  const getCartItem = (itemId) => {
    return cartItems.find(i => String(i.id) === String(itemId));
  };

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="search-modal-header">
          <div className="modal-title-wrap">
            <h2>견적 자재 검색 및 추가</h2>
            <span className="modal-subtitle">원하시는 바닥재·벽지를 검색하고 견적에 추가하세요</span>
          </div>
          <button onClick={onClose} className="btn-close-modal" aria-label="닫기">
            <X size={24}/>
          </button>
        </div>
        
        {/* Modal Controls: Search & Filters */}
        <div className="search-modal-controls">
          {/* Search Input */}
          <div className="search-modal-input-wrap">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="상품코드(예: TS 5502P, 6202), 상품명, 패턴, 분위기 검색..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button 
                type="button" 
                className="btn-clear-search" 
                onClick={() => setQuery('')}
                aria-label="검색어 지우기"
              >
                <X size={16} />
              </button>
            )}
            {loading && (
              <Loader2 size={18} className="search-loading-spinner animate-spin" />
            )}
          </div>

          {/* Popular Keywords */}
          <div className="popular-keywords-bar">
            <span className="keywords-label">인기 검색:</span>
            <div className="keywords-list">
              {POPULAR_KEYWORDS.map(kw => (
                <button
                  key={kw}
                  type="button"
                  className={`keyword-chip ${query === kw ? 'active' : ''}`}
                  onClick={() => setQuery(kw)}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="filter-tabs-row">
            <span className="filter-label">카테고리:</span>
            <div className="tabs-list">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Tabs */}
          <div className="filter-tabs-row brand-row">
            <span className="filter-label">브랜드:</span>
            <div className="tabs-list">
              {brandTabs.map(brand => (
                <button
                  key={brand}
                  type="button"
                  className={`filter-tab-btn ${selectedBrand === brand ? 'active' : ''}`}
                  onClick={() => setSelectedBrand(brand)}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="search-summary-bar">
            <span className="result-count">총 <strong>{results.length}</strong>개 상품</span>
            {defaultQuantity > 1 && (
              <span className="default-qty-info">추가 시 예상 평수(<strong>{defaultQuantity}평</strong>)로 담깁니다</span>
            )}
          </div>
        </div>

        {/* Modal Results Grid */}
        <div className="search-modal-body">
          {loading && results.length === 0 ? (
            <div className="modal-state-box">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p>상품 목록을 불러오는 중입니다...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="modal-state-box empty">
              <div className="empty-icon">🔍</div>
              <h4>검색 결과가 없습니다</h4>
              <p>검색어를 바르게 입력하셨는지 확인하시거나 카테고리/브랜드 필터를 변경해 보세요.</p>
            </div>
          ) : (
            <div className="search-product-grid">
              {results.map(item => {
                const candidates = getProductImageCandidates(item);
                const cartItem = getCartItem(item.id);
                const isAdded = Boolean(cartItem);
                const computedBrand = getComputedBrand(item);

                // Build spec text
                const specText = item.spec || item.size_text || (item.specs?.size) || (item.thickness ? `${item.thickness}T` : '표준규격');
                const unitText = item.unit || '평';

                return (
                  <div key={item.id} className={`search-material-card ${isAdded ? 'is-added' : ''}`}>
                    {/* Fixed 1:1 Aspect Ratio Thumbnail Wrapper - Prevents image enlargement */}
                    <div className="search-card-thumb-wrap">
                      <ProductImage 
                        src={candidates[0]} 
                        candidates={candidates}
                        alt={item.name || item.code} 
                        className="search-card-thumb-img"
                      />
                      {isAdded && (
                        <div className="added-badge">
                          <Check size={14} /> 추가됨
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="search-card-content">
                      <div className="search-card-header-tag">
                        <span className="brand-tag">{computedBrand}</span>
                        <span className="divider">·</span>
                        <span className="cat-tag">{item.subCategory || item.category || '바닥재'}</span>
                      </div>

                      <h4 className="search-card-title" title={item.name || item.code}>
                        {item.name || item.code}
                      </h4>

                      {/* Hashtags */}
                      <div className="search-card-hashtags">
                        <span className="tag">#{item.category}</span>
                        {item.line && !item.line.includes(' ') && <span className="tag">#{item.line}</span>}
                        {item.pattern && <span className="tag">#{item.pattern}</span>}
                      </div>

                      {/* Specs */}
                      <div className="search-card-specs">
                        <div className="spec-row">
                          <span className="spec-name">코드</span>
                          <span className="spec-val code-val">{item.code || '-'}</span>
                        </div>
                        <div className="spec-row">
                          <span className="spec-name">규격</span>
                          <span className="spec-val">{specText}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button 
                        type="button"
                        className={`btn-card-add ${isAdded ? 'added' : ''}`}
                        onClick={() => handleAdd(item)}
                      >
                        {isAdded ? (
                          <>
                            <Check size={16} /> 견적에 추가됨 ({cartItem.quantity}{unitText})
                          </>
                        ) : (
                          <>
                            <Plus size={16} /> 견적에 추가
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="search-modal-footer">
          <div className="footer-left">
            <span>선택된 견적 자재: <strong>{cartItems.length}</strong>종류</span>
          </div>
          <button type="button" className="btn-modal-done" onClick={onClose}>
            선택 완료 (닫기)
          </button>
        </div>
      </div>
    </div>
  );
}
