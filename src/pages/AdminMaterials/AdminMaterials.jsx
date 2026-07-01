import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabaseClient';
import { fetchAllProducts, clearProductCache } from '../../utils/supabaseFetcher';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Plus, Search, Edit2, Trash2, Save, X, Upload, Layers, Image as ImageIcon, Loader2 } from 'lucide-react';
import './AdminMaterials.css';

export default function AdminMaterials() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Data States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('전체');
  const [selectedBrandName, setSelectedBrandName] = useState('전체');
  const [selectedStatus, setSelectedStatus] = useState('전체');
  const [visibleCount, setVisibleCount] = useState(100); // pagination in admin grid

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [productCode, setProductCode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [price, setPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [retailPrice, setRetailPrice] = useState(0);
  const [thickness, setThickness] = useState('');
  const [sizeText, setSizeText] = useState('');
  const [unit, setUnit] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [imageUrl, setImageUrl] = useState('');

  // Fetch all categories and brands
  const fetchMetadata = async () => {
    try {
      if (!supabase) return;
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (catErr) throw catErr;
      setCategories(catData || []);

      const { data: brandData, error: brandErr } = await supabase
        .from('brands')
        .select('*')
        .order('sort_order', { ascending: true });
      if (brandErr) throw brandErr;
      setBrands(brandData || []);
    } catch (err) {
      console.error('[AdminMaterials Meta Error]', err);
    }
  };

  const fetchProducts = async (force = false) => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (force) {
        clearProductCache();
      }
      if (!supabase) throw new Error('Supabase client is not initialized.');
      
      let allProducts = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: pageProducts, error: dbErr } = await supabase
          .from('products')
          .select(`
            *,
            categories ( id, name ),
            brands ( id, name )
          `)
          .order('id', { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (dbErr) throw dbErr;
        
        if (pageProducts && pageProducts.length > 0) {
          allProducts = [...allProducts, ...pageProducts];
          page++;
        }
        
        if (!pageProducts || pageProducts.length < pageSize) {
          hasMore = false;
        }
      }

      setProducts(allProducts);
    } catch (err) {
      console.error('[AdminMaterials Fetch Error]', err);
      setErrorMsg(err.message || '자재 목록을 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      alert('관리자 권한이 없습니다.');
      navigate('/login');
      return;
    }
    fetchMetadata();
    fetchProducts();
  }, [user, authLoading, navigate]);

  // Reset pagination when filter changes
  useEffect(() => {
    setVisibleCount(100);
  }, [searchTerm, selectedCategoryName, selectedBrandName, selectedStatus]);

  // Dynamically filter brands based on selected category in the form
  const formAvailableBrands = useMemo(() => {
    if (!categoryId) return [];
    return brands.filter(b => b.category_id === parseInt(categoryId));
  }, [categoryId, brands]);

  // Automatically set default brand when category changes in the form
  useEffect(() => {
    if (formAvailableBrands.length > 0) {
      // If editing and editing brand fits, keep it. Otherwise default to first available
      if (editingProduct && editingProduct.brand_id && formAvailableBrands.some(b => b.id === editingProduct.brand_id)) {
        // do nothing
      } else {
        setBrandId(formAvailableBrands[0].id);
      }
    } else {
      setBrandId('');
    }
  }, [categoryId, formAvailableBrands, editingProduct]);

  // Filter products list for display
  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter(p => {
      const matchSearch = !term ? true : (
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.product_code && p.product_code.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        (p.brands?.name && p.brands.name.toLowerCase().includes(term)) ||
        (p.categories?.name && p.categories.name.toLowerCase().includes(term)) ||
        (p.thickness && p.thickness.toLowerCase().includes(term)) ||
        (p.size_text && p.size_text.toLowerCase().includes(term)) ||
        (p.unit && p.unit.toLowerCase().includes(term))
      );

      const matchCategory =
        selectedCategoryName === '전체' ||
        p.categories?.name === selectedCategoryName;

      const matchBrand =
        selectedBrandName === '전체' ||
        p.brands?.name === selectedBrandName;

      const matchStatus =
        selectedStatus === '전체' ||
        (selectedStatus === '노출' && p.is_active === true) ||
        (selectedStatus === '숨김' && p.is_active === false);

      return matchSearch && matchCategory && matchBrand && matchStatus;
    });
  }, [products, searchTerm, selectedCategoryName, selectedBrandName, selectedStatus]);

  // Calculate statistics for each category
  const categoryStats = useMemo(() => {
    const stats = {};
    categories.forEach(c => {
      stats[c.name] = products.filter(p => p.category_id === c.id).length;
    });
    return stats;
  }, [categories, products]);

  // Brands list for filtering in the toolbar (corresponds to selected category)
  const filterToolbarBrands = useMemo(() => {
    if (selectedCategoryName === '전체') {
      // unique brands
      const uniqueNames = new Set(brands.map(b => b.name));
      return Array.from(uniqueNames).sort();
    }
    const cat = categories.find(c => c.name === selectedCategoryName);
    if (!cat) return [];
    return brands.filter(b => b.category_id === cat.id).map(b => b.name);
  }, [selectedCategoryName, categories, brands]);

  // Reset brand filter if selected category doesn't support the current active brand filter
  useEffect(() => {
    if (selectedBrandName !== '전체' && filterToolbarBrands.length > 0 && !filterToolbarBrands.includes(selectedBrandName)) {
      setSelectedBrandName('전체');
    }
  }, [selectedCategoryName, filterToolbarBrands, selectedBrandName]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategoryName('전체');
    setSelectedBrandName('전체');
    setSelectedStatus('전체');
    setVisibleCount(100);
  };

  // Modal open handlers
  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setProductCode('');
    setPrice(0);
    setCostPrice(0);
    setRetailPrice(0);
    setThickness('');
    setSizeText('');
    setUnit('');
    setDescription('');
    setIsActive(true);
    setIsFeatured(false);
    setSortOrder(0);
    setImageUrl('');
    
    if (categories.length > 0) {
      setCategoryId(categories[0].id);
    }
    
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setName(p.name || '');
    setProductCode(p.product_code || '');
    setCategoryId(p.category_id || '');
    setBrandId(p.brand_id || '');
    setPrice(p.price || 0);
    setCostPrice(p.cost_price || 0);
    setRetailPrice(p.retail_price || 0);
    setThickness(p.thickness || '');
    setSizeText(p.size_text || '');
    setUnit(p.unit || '');
    setDescription(p.description || '');
    setIsActive(p.is_active ?? true);
    setIsFeatured(p.is_featured ?? false);
    setSortOrder(p.sort_order || 0);
    setImageUrl(p.image_url || '');
    
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      if (!supabase) throw new Error('Supabase client is not initialized.');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const cat = categories.find(c => c.id === parseInt(categoryId));
      const brandObj = brands.find(b => b.id === parseInt(brandId));
      const catSlug = cat ? cat.slug : 'generic';
      const brandSlug = brandObj ? brandObj.slug : 'generic';
      
      const filePath = `materials/${catSlug}/${brandSlug}/${fileName}`;

      // Upload to bucket 'materials'
      const { error: uploadError } = await supabase.storage
        .from('materials')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('materials')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
    } catch (err) {
      console.error('[Upload Error]', err);
      alert('이미지 업로드에 실패했습니다: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('상품명을 입력해주세요.');
      return;
    }
    if (!categoryId || !brandId) {
      alert('카테고리와 브랜드를 선택해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      if (!supabase) throw new Error('Supabase client is not initialized.');

      // Generate slug from name & brand
      const cat = categories.find(c => c.id === parseInt(categoryId));
      const brandObj = brands.find(b => b.id === parseInt(brandId));
      const cleanName = name.replace(/[^a-zA-Z0-9가-힣]/g, '-').toLowerCase();
      const cleanBrand = brandObj ? brandObj.name.toLowerCase() : 'etc';
      const baseSlug = `${cleanBrand}-${cleanName}`;
      
      const payload = {
        name,
        product_code: productCode.trim() || null,
        category_id: parseInt(categoryId),
        brand_id: parseInt(brandId),
        price: parseFloat(price) || 0,
        cost_price: parseFloat(costPrice) || 0,
        retail_price: parseFloat(retailPrice) || 0,
        thickness: thickness || null,
        size_text: sizeText || null,
        unit: unit || null,
        description: description || null,
        is_active: isActive,
        is_featured: isFeatured,
        sort_order: parseInt(sortOrder) || 0,
        image_url: imageUrl || null,
        updated_at: new Date().toISOString()
      };

      if (editingProduct) {
        // UPDATE
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);

        if (error) throw error;
        alert('자재 정보가 성공적으로 수정되었습니다.');
      } else {
        // INSERT
        // Find if slug duplicates
        let slug = baseSlug;
        let counter = 1;
        let duplicate = true;
        
        while (duplicate) {
          const { data: dupData } = await supabase
            .from('products')
            .select('id')
            .eq('slug', slug)
            .maybeSingle();
          if (!dupData) {
            duplicate = false;
          } else {
            slug = `${baseSlug}-${counter}`;
            counter++;
          }
        }

        const { error } = await supabase
          .from('products')
          .insert({
            ...payload,
            slug,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
        alert('신규 자재가 성공적으로 등록되었습니다.');
      }

      setIsModalOpen(false);
      fetchProducts(true); // force cache clearing and reload
    } catch (err) {
      console.error('[Submit Product Error]', err);
      alert('저장에 실패했습니다: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 자재 데이터를 영구히 삭제하시겠습니까?')) {
      return;
    }

    try {
      if (!supabase) throw new Error('Supabase client is not initialized.');
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('성공적으로 삭제되었습니다.');
      fetchProducts(true); // force clear cache and refresh
    } catch (err) {
      console.error('[Delete Product Error]', err);
      alert('삭제에 실패했습니다: ' + err.message);
    }
  };

  return (
    <MainLayout>
      <div className="admin-materials-container">
        {/* Back Link */}
        <span className="back-to-dashboard" onClick={() => navigate('/admin')}>
          <ArrowLeft size={16} />
          관리자 대시보드로 돌아가기
        </span>

        {/* Header */}
        <div className="admin-materials-header">
          <div>
            <h1>자재 DB 관리</h1>
            <p>사이트에 등록된 장판, 마루, 데코타일, 벽지, 카페트타일 등의 자재 규격과 단가를 일괄 제어합니다.</p>
          </div>
          <button className="btn-add-material" onClick={openAddModal}>
            <Plus size={16} />
            자재 등록
          </button>
        </div>

        {errorMsg && <div className="materials-error-banner">{errorMsg}</div>}

        {/* Statistics Dashboard */}
        {!loading && products.length > 0 && (
          <div className="admin-materials-stats-dashboard">
            <div className="stats-card total">
              <span className="stats-label">전체 자재</span>
              <span className="stats-value">{products.length.toLocaleString()}개</span>
              <span className="stats-sub">노출 {products.filter(p => p.is_active).length} / 숨김 {products.filter(p => !p.is_active).length}</span>
            </div>
            
            <div className="stats-card filtered">
              <span className="stats-label">현재 검색/필터 결과</span>
              <span className="stats-value">{filteredProducts.length.toLocaleString()}개</span>
              <span className="stats-sub highlight">매칭 항목 수</span>
            </div>

            {categories.map(c => {
              const count = categoryStats[c.name] || 0;
              return (
                <div key={c.id} className="stats-card category-stat">
                  <span className="stats-label">{c.name}</span>
                  <span className="stats-value">{count.toLocaleString()}개</span>
                  <span className="stats-sub">
                    노출 {products.filter(p => p.category_id === c.id && p.is_active).length} / 숨김 {products.filter(p => p.category_id === c.id && !p.is_active).length}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Filters and Search Row */}
        <div className="admin-materials-filters-card">
          <div className="filters-grid">
            <div className="filter-group">
              <label>카테고리</label>
              <select
                value={selectedCategoryName}
                onChange={(e) => setSelectedCategoryName(e.target.value)}
              >
                <option value="전체">전체 카테고리</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label>브랜드</label>
              <select
                value={selectedBrandName}
                onChange={(e) => setSelectedBrandName(e.target.value)}
              >
                <option value="전체">전체 브랜드</option>
                {filterToolbarBrands.map(bName => <option key={bName} value={bName}>{bName}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label>노출 상태</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="전체">전체 상태</option>
                <option value="노출">노출 중</option>
                <option value="숨김">숨김</option>
              </select>
            </div>

            <div className="filter-group search">
              <label>검색</label>
              <div className="search-input-box">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="상품명, 상품코드로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group reset-btn-group">
              <label>&nbsp;</label>
              <button type="button" className="btn-filter-reset" onClick={handleResetFilters}>
                필터 초기화
              </button>
            </div>
          </div>
        </div>

        {/* Materials Table Grid */}
        {loading ? (
          <div className="materials-loading">
            <div className="spinner-loader"></div>
            <p>자재 데이터베이스를 조회하고 있습니다...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="materials-empty-state">
            <ImageIcon size={40} className="icon-empty" />
            <h3>등록된 자재가 없습니다.</h3>
            <p>필터 조건을 확인하거나 우측 상단의 '자재 등록' 버튼을 눌러 첫 항목을 등록해보세요.</p>
          </div>
        ) : (
          <div className="admin-materials-table-wrapper">
            <div className="table-header-info">
              <span>검색 결과: <strong>{filteredProducts.length}</strong>개 상품</span>
            </div>
            
            <table className="admin-materials-table">
              <thead>
                <tr>
                  <th>대표사진</th>
                  <th>상품코드</th>
                  <th>상품명</th>
                  <th>카테고리</th>
                  <th>브랜드</th>
                  <th>두께/규격</th>
                  <th>매입단가</th>
                  <th>판매단가</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.slice(0, visibleCount).map(p => (
                  <tr key={p.id}>
                    <td className="img-cell">
                      <img
                        src={p.image_url || "/images/no-image.svg"}
                        alt={p.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/no-image.svg";
                        }}
                      />
                    </td>
                    <td className="code-cell font-mono">{p.product_code || '-'}</td>
                    <td className="name-cell">
                      <strong>{p.name}</strong>
                      {p.is_featured && <span className="badge-featured">추천</span>}
                    </td>
                    <td>{p.categories?.name || '-'}</td>
                    <td>{p.brands?.name || '-'}</td>
                    <td>
                      <div className="spec-sub-info">
                        <span>{p.thickness ? `${p.thickness}` : ''}</span>
                        <span className="size-lbl">{p.size_text || ''}</span>
                      </div>
                    </td>
                    <td className="price-cell font-mono">{(p.cost_price || 0).toLocaleString()}원</td>
                    <td className="price-cell font-mono highlighted">{(p.price || 0).toLocaleString()}원</td>
                    <td>
                      {p.is_active ? (
                        <span className="badge-visible">노출 중</span>
                      ) : (
                        <span className="badge-hidden">숨김</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <button className="btn-action-edit" onClick={() => openEditModal(p)} title="수정">
                        <Edit2 size={14} />
                      </button>
                      <button className="btn-action-delete" onClick={() => handleDelete(p.id)} title="삭제">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Load More pagination button */}
            {visibleCount < filteredProducts.length && (
              <div className="load-more-box">
                <button
                  className="btn-load-more"
                  onClick={() => setVisibleCount(prev => prev + 100)}
                >
                  더보기 ({Math.min(visibleCount, filteredProducts.length)} / {filteredProducts.length})
                </button>
              </div>
            )}
          </div>
        )}

        {/* CRUD Form Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content-card">
              <div className="modal-header">
                <h2>{editingProduct ? '자재 정보 수정' : '신규 자재 등록'}</h2>
                <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <form className="modal-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                  {/* Left Column */}
                  <div className="form-left-col">
                    <div className="form-row-two">
                      <div className="form-input-field">
                        <label>상품명 *</label>
                        <input
                          type="text"
                          required
                          placeholder="예: KCC 센스타일 TS5502P"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>

                      <div className="form-input-field">
                        <label>상품코드</label>
                        <input
                          type="text"
                          placeholder="예: TS5502P"
                          value={productCode}
                          onChange={(e) => setProductCode(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row-two">
                      <div className="form-input-field">
                        <label>카테고리 *</label>
                        <select
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                          required
                        >
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>

                      <div className="form-input-field">
                        <label>브랜드 *</label>
                        <select
                          value={brandId}
                          onChange={(e) => setBrandId(e.target.value)}
                          required
                          disabled={formAvailableBrands.length === 0}
                        >
                          {formAvailableBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="form-row-three">
                      <div className="form-input-field">
                        <label>매입 단가 (원)</label>
                        <input
                          type="number"
                          value={costPrice}
                          onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div className="form-input-field">
                        <label>도매 단가 (원)</label>
                        <input
                          type="number"
                          value={retailPrice}
                          onChange={(e) => setRetailPrice(parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div className="form-input-field">
                        <label>소비자가 / 견적단가 * (원)</label>
                        <input
                          type="number"
                          required
                          value={price}
                          onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div className="form-row-three">
                      <div className="form-input-field">
                        <label>두께 (T)</label>
                        <input
                          type="text"
                          placeholder="예: 3.0T 또는 2.2T"
                          value={thickness}
                          onChange={(e) => setThickness(e.target.value)}
                        />
                      </div>

                      <div className="form-input-field">
                        <label>사이즈 규격</label>
                        <input
                          type="text"
                          placeholder="예: 450mm x 450mm"
                          value={sizeText}
                          onChange={(e) => setSizeText(e.target.value)}
                        />
                      </div>

                      <div className="form-input-field">
                        <label>단위 / 포장 규격</label>
                        <input
                          type="text"
                          placeholder="예: 1박스(1평) 또는 1롤"
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-input-field">
                      <label>라인업 / 자재 설명</label>
                      <textarea
                        rows={3}
                        placeholder="자재 등급, 시리즈명, 제품 라인 설명..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="form-row-three">
                      <div className="form-input-field">
                        <label>정렬 순서</label>
                        <input
                          type="number"
                          value={sortOrder}
                          onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                        />
                      </div>

                      <div className="form-checkbox-field">
                        <input
                          type="checkbox"
                          id="isMaterialActive"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                        />
                        <label htmlFor="isMaterialActive">자재 노출</label>
                      </div>

                      <div className="form-checkbox-field">
                        <input
                          type="checkbox"
                          id="isMaterialFeatured"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                        />
                        <label htmlFor="isMaterialFeatured">추천 자재</label>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="form-right-col">
                    <div className="image-upload-box">
                      <label>자재 이미지 (썸네일) *</label>
                      <div className="img-preview-frame">
                        {imageUrl ? (
                          <img src={imageUrl} alt="자재 이미지" />
                        ) : (
                          <div className="empty-preview-icon">
                            <ImageIcon size={40} />
                            <span>자재 이미지를 업로드하세요</span>
                          </div>
                        )}
                        {uploading && (
                          <div className="upload-loader-overlay">
                            <Loader2 className="spin" size={24} />
                            <span>업로드 중...</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="upload-actions">
                        <label className="btn-upload-file">
                          <Upload size={14} /> 자재사진 선택
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                            disabled={uploading}
                          />
                        </label>
                        <input
                          type="text"
                          className="img-url-input"
                          placeholder="직접 이미지 URL 입력도 가능"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setIsModalOpen(false)}
                    disabled={submitting}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={submitting || uploading}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="spin" size={14} /> 저장 중...
                      </>
                    ) : (
                      <>
                        <Save size={14} /> 저장하기
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
