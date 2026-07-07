import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { useEstimateCart } from '../../contexts/EstimateCartContext';
import { getComputedBrand } from '../../utils/brandUtils';
import { getSupabaseImageUrl } from '../../utils/getSupabaseImageUrl';
import { searchProductsServer, fetchBrands } from '../../utils/supabaseFetcher';
import './MaterialSearchModal.css';

// Client-side memory cache for search terms
const localSearchCache = new Map();

export default function MaterialSearchModal({ onClose, defaultQuantity = 1 }) {
  const { addToCart } = useEstimateCart();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const abortControllerRef = useRef(null);
  const latestRequestIdRef = useRef(0);

  // Pre-load brands on mount (ensures fast brand name parsing)
  useEffect(() => {
    fetchBrands().catch(console.error);
  }, []);

  // Debounce the input query (200ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle actual search when debounced query changes
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Check client-side memory cache
    const cacheKey = trimmed.toLowerCase();
    if (localSearchCache.has(cacheKey)) {
      setResults(localSearchCache.get(cacheKey));
      setLoading(false);
      return;
    }

    // Sequence request tracking to prevent race conditions
    const currentRequestId = ++latestRequestIdRef.current;

    // Cancel previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);

    searchProductsServer(trimmed, controller.signal)
      .then((data) => {
        // Stale response guard
        if (controller.signal.aborted || currentRequestId !== latestRequestIdRef.current) return;
        
        localSearchCache.set(cacheKey, data);
        setResults(data);
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
  }, [debouncedQuery]);

  const handleAdd = (item) => {
    // Add to cart with defaultQuantity (pyeong)
    addToCart({ 
      ...item, 
      quantity: defaultQuantity
    });
  };

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-modal-header">
          <h2>자재 직접 추가</h2>
          <button onClick={onClose} className="btn-close-modal" aria-label="닫기"><X size={24}/></button>
        </div>
        
        <div className="search-modal-body">
          <div className="search-modal-input">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="카테고리, 브랜드, 상품명, 모델명 검색..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            {loading && (
              <Loader2 size={18} className="search-loading-spinner animate-spin" style={{ position: 'absolute', right: '12px', color: 'var(--point-orange)' }} />
            )}
          </div>

          <div className="search-modal-results">
            {debouncedQuery && results.length === 0 && !loading ? (
              <div className="no-results">검색 결과가 없습니다.</div>
            ) : (
              results.map(item => (
                <div key={item.id} className="search-item-card">
                  <img 
                    src={getSupabaseImageUrl(item.thumbnail)} 
                    alt={item.name} 
                    className="search-item-thumb"
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = "/images/no-image.svg"; }}
                  />
                  <div className="search-item-info">
                    <div className="search-item-meta">
                      {item.brand === '동화' || item.brand === '구정' 
                        ? `${item.category} > ${getComputedBrand(item)} > ${item.subCategory || '강마루'}${item.series ? ` > ${item.series}` : ''} > ${item.line}` 
                        : `${item.category} > ${getComputedBrand(item)}`
                      }
                    </div>
                    <div className="search-item-name">{item.name}</div>
                    <div className="search-item-code">{item.code}</div>
                  </div>
                  <button className="btn-add-item" onClick={() => handleAdd(item)}>
                    담기
                  </button>
                </div>
              ))
            )}
            {!debouncedQuery && !loading && (
              <div className="search-guide">검색어를 입력하시면 상품이 나타납니다.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
