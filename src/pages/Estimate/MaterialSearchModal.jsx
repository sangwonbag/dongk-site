import React, { useState, useMemo, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { fetchAllProducts } from '../../utils/supabaseFetcher';
import { useEstimateCart } from '../../contexts/EstimateCartContext';
import { getComputedBrand } from '../../utils/brandUtils';
import { getSearchScore, normalizeSearchText } from '../../utils/searchUtils';
import { getSupabaseImageUrl } from '../../utils/getSupabaseImageUrl';
import './MaterialSearchModal.css';

export default function MaterialSearchModal({ onClose }) {
  const { addToCart } = useEstimateCart();
  const [query, setQuery] = useState('');
  const [dbMaterials, setDbMaterials] = useState([]);

  useEffect(() => {
    console.log("[Debug] Search modal mounted. Pre-fetching all materials from Supabase...");
    fetchAllProducts().then(setDbMaterials).catch(console.error);
  }, []);

  const searchResults = useMemo(() => {
    const q = normalizeSearchText(query);
    if (!q || dbMaterials.length === 0) return [];
    
    return dbMaterials
      .map(m => ({ item: m, score: getSearchScore(m, query) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30) // Top 30 results
      .map(x => x.item);
  }, [query, dbMaterials]);

  const handleAdd = (item) => {
    addToCart({ ...item, quantity: 1 });
    // Keep modal open to add more, or close? The requirement says "add to cart", we can just show a quick alert or toast.
    // The toast is already triggered inside `addToCart`.
  };

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-modal-header">
          <h2>자재 직접 추가</h2>
          <button onClick={onClose} className="btn-close-modal"><X size={24}/></button>
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
          </div>

          <div className="search-modal-results">
            {query && searchResults.length === 0 ? (
              <div className="no-results">검색 결과가 없습니다.</div>
            ) : (
              searchResults.map(item => (
                <div key={item.id} className="search-item-card">
                  <img 
                    src={getSupabaseImageUrl(item.thumbnail)} 
                    alt={item.name} 
                    className="search-item-thumb"
                    onError={(e) => { e.target.onerror = null; e.target.src = "/images/no-image.svg"; }}
                  />
                  <div className="search-item-info">
                    <div className="search-item-meta">{item.category} &gt; {getComputedBrand(item)}</div>
                    <div className="search-item-name">{item.name}</div>
                    <div className="search-item-code">{item.code}</div>
                  </div>
                  <button className="btn-add-item" onClick={() => handleAdd(item)}>
                    담기
                  </button>
                </div>
              ))
            )}
            {!query && (
              <div className="search-guide">검색어를 입력하시면 상품이 나타납니다.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
