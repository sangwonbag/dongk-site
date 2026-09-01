import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabaseClient';
import { fetchAllProducts, clearProductCache } from '../../utils/supabaseFetcher';
import { getProductImageUrl } from '../../utils/productImageResolver';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, Plus, Search, Edit2, Trash2, Save, X, Upload, 
  Eye, EyeOff, Star, StarOff, Image as ImageIcon, Loader2, RefreshCw
} from 'lucide-react';
import { LoadingSpinner, EmptyState } from '../../components/ui';
import './AdminProducts.css';

export default function AdminProducts() {
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
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, hidden, featured
  const [visibleCount, setVisibleCount] = useState(50);

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
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [imageUrl, setImageUrl] = useState('');

  // Fetch metadata
  const fetchMetadata = async () => {
    try {
      if (!supabase) return;
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      setCategories(catData || []);

      const { data: brandData } = await supabase
        .from('brands')
        .select('*')
        .order('sort_order', { ascending: true });
      setBrands(brandData || []);
    } catch (err) {
      console.error('[AdminProducts Meta Error]', err);
    }
  };

  // Fetch products from database
  const fetchProducts = async (force = false) => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (force) {
        clearProductCache();
      }
      if (!supabase) throw new Error('Supabase client is not initialized.');
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories ( id, name ),
          brands ( id, name )
        `)
        .order('sort_order', { ascending: true })
        .order('id', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('[AdminProducts Fetch Error]', err);
      setErrorMsg(err.message || '상품 목록을 가져오는데 실패했습니다.');
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

  // Reset page pagination on filter changes
  useEffect(() => {
    setVisibleCount(50);
  }, [searchTerm, selectedCategoryName, selectedBrandName, statusFilter]);

  // Dynamically filter brand options in form
  const formAvailableBrands = useMemo(() => {
    if (!categoryId) return [];
    return brands.filter(b => b.category_id === parseInt(categoryId));
  }, [categoryId, brands]);

  useEffect(() => {
    if (formAvailableBrands.length > 0) {
      if (editingProduct && editingProduct.brand_id && formAvailableBrands.some(b => b.id === editingProduct.brand_id)) {
        // keep it
      } else {
        setBrandId(formAvailableBrands[0].id);
      }
    } else {
      setBrandId('');
    }
  }, [categoryId, formAvailableBrands, editingProduct]);

  // Filter products list for rendering
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory =
        selectedCategoryName === '전체' ||
        p.categories?.name === selectedCategoryName;

      const matchBrand =
        selectedBrandName === '전체' ||
        p.brands?.name === selectedBrandName;

      let matchStatus = true;
      if (statusFilter === 'active') matchStatus = p.is_active;
      else if (statusFilter === 'hidden') matchStatus = !p.is_active;
      else if (statusFilter === 'featured') matchStatus = p.is_featured;

      return matchSearch && matchCategory && matchBrand && matchStatus;
    });
  }, [products, searchTerm, selectedCategoryName, selectedBrandName, statusFilter]);

  // Available brands in the filters toolbar
  const filterToolbarBrands = useMemo(() => {
    if (selectedCategoryName === '전체') {
      const uniqueNames = new Set(brands.map(b => b.name));
      return Array.from(uniqueNames).sort();
    }
    const cat = categories.find(c => c.name === selectedCategoryName);
    if (!cat) return [];
    return brands.filter(b => b.category_id === cat.id).map(b => b.name);
  }, [selectedCategoryName, categories, brands]);

  useEffect(() => {
    if (selectedBrandName !== '전체' && filterToolbarBrands.length > 0 && !filterToolbarBrands.includes(selectedBrandName)) {
      setSelectedBrandName('전체');
    }
  }, [selectedCategoryName, filterToolbarBrands, selectedBrandName]);

  // Fast visibility/featured updates
  const toggleActive = async (product) => {
    try {
      const newActive = !product.is_active;
      const { error } = await supabase
        .from('products')
        .update({ is_active: newActive, updated_at: new Date().toISOString() })
        .eq('id', product.id);

      if (error) throw error;
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: newActive } : p));
      clearProductCache();
    } catch (err) {
      alert('설정 변경에 실패했습니다: ' + err.message);
    }
  };

  const toggleFeatured = async (product) => {
    try {
      const newFeatured = !product.is_featured;
      const { error } = await supabase
        .from('products')
        .update({ is_featured: newFeatured, updated_at: new Date().toISOString() })
        .eq('id', product.id);

      if (error) throw error;
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_featured: newFeatured } : p));
      clearProductCache();
    } catch (err) {
      alert('설정 변경에 실패했습니다: ' + err.message);
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      if (!supabase) throw new Error('Supabase client not initialized.');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const cat = categories.find(c => c.id === parseInt(categoryId));
      const brandObj = brands.find(b => b.id === parseInt(brandId));
      const catSlug = cat ? cat.slug : 'generic';
      const brandSlug = brandObj ? brandObj.slug : 'generic';
      
      const filePath = `materials/${catSlug}/${brandSlug}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('materials')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('materials')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
    } catch (err) {
      alert('이미지 업로드 실패: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Submit Handler
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
      if (!supabase) throw new Error('Supabase client not initialized.');

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
        description: description || null,
        is_active: isActive,
        is_featured: isFeatured,
        sort_order: parseInt(sortOrder) || 0,
        image_url: imageUrl || null,
        updated_at: new Date().toISOString()
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);

        if (error) throw error;
        alert('상품이 수정되었습니다.');
      } else {
        // Slug check
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
        alert('신규 상품이 등록되었습니다.');
      }

      setIsModalOpen(false);
      fetchProducts(true);
    } catch (err) {
      alert('저장 실패: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 상품 데이터를 삭제하시겠습니까? 사용자 페이지에서도 노출되지 않습니다.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('삭제 완료되었습니다.');
      fetchProducts(true);
    } catch (err) {
      alert('삭제 실패: ' + err.message);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setProductCode('');
    setPrice(0);
    setDescription('');
    setIsActive(true);
    setIsFeatured(false);
    setSortOrder(0);
    setImageUrl('');
    if (categories.length > 0) setCategoryId(categories[0].id);
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setName(p.name || '');
    setProductCode(p.product_code || '');
    setCategoryId(p.category_id || '');
    setBrandId(p.brand_id || '');
    setPrice(p.price || 0);
    setDescription(p.description || '');
    setIsActive(p.is_active ?? true);
    setIsFeatured(p.is_featured ?? false);
    setSortOrder(p.sort_order || 0);
    setImageUrl(p.image_url || '');
    setIsModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="admin-products-container">
        <span className="back-to-dashboard" onClick={() => navigate('/admin')}>
          <ArrowLeft size={16} />
          대시보드로 돌아가기
        </span>

        <div className="admin-products-header">
          <div>
            <h1>상품 노출 관리</h1>
            <p>소비자 화면에 등록되어 판매되는 데코타일, 장판, 마루 등의 상품 정보와 추천 표시 여부를 실시간 제어합니다.</p>
          </div>
          <button className="btn-add-product" onClick={openAddModal}>
            <Plus size={16} />
            상품 등록
          </button>
        </div>

        {errorMsg && <div className="products-error-banner">{errorMsg}</div>}

        {/* Toolbar filter group */}
        <div className="admin-products-toolbar">
          <div className="search-box">
            <Search size={16} className="icon-search" />
            <input 
              type="text" 
              placeholder="상품명, 상품코드로 검색..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="select-filters">
            <select value={selectedCategoryName} onChange={e => setSelectedCategoryName(e.target.value)}>
              <option value="전체">전체 카테고리</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>

            <select value={selectedBrandName} onChange={e => setSelectedBrandName(e.target.value)}>
              <option value="전체">전체 브랜드</option>
              {filterToolbarBrands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">전체 상태</option>
              <option value="active">노출 중</option>
              <option value="hidden">숨김</option>
              <option value="featured">추천(베스트) 상품</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="상품 목록을 가져오고 있습니다..." />
        ) : filteredProducts.length === 0 ? (
          <EmptyState 
            title="검색되거나 등록된 상품이 없습니다" 
            description="필터 조건을 초기화하거나 우측 상단 '상품 등록'을 눌러 첫 판매 상품을 등록해 보세요." 
          />
        ) : (
          <div className="admin-products-grid">
            {filteredProducts.slice(0, visibleCount).map(p => (
              <div key={p.id} className={`product-merchant-card ${p.is_active ? '' : 'disabled'}`}>
                <div className="card-image-box">
                  <img 
                    src={getProductImageUrl(p)} 
                    alt={p.name} 
                    onError={e => {
                      if (e.target.src !== "/images/no-image.svg") {
                        e.target.onerror = null;
                        e.target.src = "/images/no-image.svg";
                      }
                    }}
                  />
                  <div className="card-badge-layer">
                    <span className={`badge-active ${p.is_active ? 'active' : 'hidden'}`}>
                      {p.is_active ? '노출 중' : '숨김'}
                    </span>
                    {p.is_featured && <span className="badge-featured">베스트</span>}
                  </div>
                </div>
                
                <div className="card-info-box">
                  <span className="info-brand-cat">[{p.brands?.name || '자재'}] {p.categories?.name}</span>
                  <h3 className="info-name" title={p.name}>{p.name}</h3>
                  <div className="info-code font-mono">{p.product_code || '코드 없음'}</div>
                  
                  <div className="info-price-row">
                    <span className="lbl">소비자 판매가</span>
                    <strong className="val">{(p.price || 0).toLocaleString()}원 <small>/평</small></strong>
                  </div>

                  {/* Settings quick toggles */}
                  <div className="card-settings-quick">
                    <button 
                      className={`btn-toggle-switch ${p.is_active ? 'on' : ''}`}
                      onClick={() => toggleActive(p)}
                      title={p.is_active ? '숨기기' : '노출하기'}
                    >
                      {p.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                      {p.is_active ? '숨김 전환' : '노출 전환'}
                    </button>
                    <button 
                      className={`btn-toggle-switch ${p.is_featured ? 'on' : ''}`}
                      onClick={() => toggleFeatured(p)}
                      title={p.is_featured ? '추천 해제' : '추천 설정'}
                    >
                      <Star size={14} fill={p.is_featured ? "currentColor" : "none"} />
                      베스트
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="card-actions-row">
                    <button className="btn-edit" onClick={() => openEditModal(p)}>
                      <Edit2 size={13} /> 수정
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(p.id)}>
                      <Trash2 size={13} /> 삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {visibleCount < filteredProducts.length && (
          <div className="load-more-container">
            <button className="btn-load-more" onClick={() => setVisibleCount(c => c + 50)}>
              더보기 ({Math.min(visibleCount, filteredProducts.length)} / {filteredProducts.length})
            </button>
          </div>
        )}

        {/* Modal form */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content-card">
              <div className="modal-header">
                <h2>{editingProduct ? '상품 정보 수정' : '신규 상품 등록'}</h2>
                <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-layout-cols">
                  <div className="form-left">
                    <div className="form-row-two">
                      <div className="field">
                        <label>상품명 *</label>
                        <input 
                          type="text" 
                          required 
                          value={name} 
                          onChange={e => setName(e.target.value)} 
                          placeholder="예: LX 하우시스 에코타일 E5101"
                        />
                      </div>
                      <div className="field">
                        <label>상품코드</label>
                        <input 
                          type="text" 
                          value={productCode} 
                          onChange={e => setProductCode(e.target.value)} 
                          placeholder="예: E5101"
                        />
                      </div>
                    </div>

                    <div className="form-row-two">
                      <div className="field">
                        <label>카테고리 *</label>
                        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="field">
                        <label>브랜드 *</label>
                        <select value={brandId} onChange={e => setBrandId(e.target.value)} required disabled={formAvailableBrands.length === 0}>
                          {formAvailableBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="form-row-two">
                      <div className="field">
                        <label>소비자 판매가 * (원/평)</label>
                        <input 
                          type="number" 
                          required 
                          value={price} 
                          onChange={e => setPrice(parseFloat(e.target.value) || 0)} 
                        />
                      </div>
                      <div className="field">
                        <label>정렬 노출순서</label>
                        <input 
                          type="number" 
                          value={sortOrder} 
                          onChange={e => setSortOrder(parseInt(e.target.value) || 0)} 
                        />
                      </div>
                    </div>

                    <div className="field">
                      <label>상품 상세설명</label>
                      <textarea 
                        rows={3} 
                        value={description} 
                        onChange={e => setDescription(e.target.value)}
                        placeholder="상품 등급 및 사용자에게 제공할 설명 입력..."
                      />
                    </div>

                    <div className="form-checkboxes-row">
                      <label className="checkbox-lbl">
                        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                        <span>쇼핑몰에 상품 노출</span>
                      </label>
                      <label className="checkbox-lbl">
                        <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
                        <span>추천(베스트) 상품으로 지정</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-right">
                    <div className="image-field-uploader">
                      <label>상품 대표 이미지 *</label>
                      <div className="preview-container">
                        {imageUrl ? (
                          <img src={imageUrl} alt="상품 미리보기" />
                        ) : (
                          <div className="empty-box">
                            <ImageIcon size={32} />
                            <span>권장 비율: 1:1 정방향</span>
                          </div>
                        )}
                        {uploading && (
                          <div className="loading-overlay">
                            <Loader2 className="spin" size={20} />
                            <span>업로드 중...</span>
                          </div>
                        )}
                      </div>

                      <div className="uploader-actions">
                        <label className="btn-select-file">
                          <Upload size={13} /> 사진 업로드
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                            style={{display: 'none'}} 
                            disabled={uploading}
                          />
                        </label>
                        <input 
                          type="text" 
                          placeholder="또는 이미지 URL 주소 붙여넣기" 
                          value={imageUrl} 
                          onChange={e => setImageUrl(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                    취소
                  </button>
                  <button type="submit" className="btn-submit" disabled={submitting || uploading}>
                    {submitting ? '저장 중...' : '저장하기'}
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
