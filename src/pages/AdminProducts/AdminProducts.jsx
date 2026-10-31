import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabaseClient';
import { fetchAllProducts, clearProductCache } from '../../utils/supabaseFetcher';
import { getProductImageUrl, getProductImageCandidates } from '../../utils/productImageResolver';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, Plus, Search, Edit2, Trash2, Save, X, Upload, 
  Eye, EyeOff, Star, StarOff, Image as ImageIcon, Loader2, RefreshCw, AlertTriangle, CheckCircle, Sparkles, Tag
} from 'lucide-react';
import { LoadingSpinner, EmptyState } from '../../components/ui';
import ProductDetailImageManager from '../../components/admin/ProductDetailImageManager';
import { getProductDetailImages, saveProductDetailImages } from '../../services/productDetailImageService';
import { metadataByCode, metadataById } from '../../data/productSearchMetadata.generated';
import { COLOR_TAXONOMY, PATTERN_TAXONOMY, FINISH_TAXONOMY } from '../../utils/materialSearchEngine';
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
  const [imageStatusFilter, setImageStatusFilter] = useState('all'); // all, ok, missing, broken
  const [failedImageIds, setFailedImageIds] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(50);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImageError, setPreviewImageError] = useState(false);

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
  const [detailImages, setDetailImages] = useState([]);

  // AI Search Metadata Form States
  const [colorFamily, setColorFamily] = useState('');
  const [colorDetail, setColorDetail] = useState('');
  const [patternType, setPatternType] = useState('');
  const [texture, setTexture] = useState('');
  const [finish, setFinish] = useState('무광');
  const [styleTagsInput, setStyleTagsInput] = useState('');
  const [spaceTagsInput, setSpaceTagsInput] = useState('');
  const [searchAliasesInput, setSearchAliasesInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);

  // Helper: calculate synchronous image status for a product
  const calcImageStatus = (p) => {
    if (!p) return 'missing';
    if (failedImageIds.has(p.id)) return 'broken';
    const rawDbImage = p.image_url || p.thumbnail_url || p.image || p.thumbnail;
    const hasDbImage = Boolean(rawDbImage && rawDbImage !== '/images/no-image.svg');
    const resolved = getProductImageUrl(p);

    if (!resolved || resolved === '/images/no-image.svg') {
      return hasDbImage ? 'broken' : 'missing';
    }
    return 'ok';
  };

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
  }, [searchTerm, selectedCategoryName, selectedBrandName, statusFilter, imageStatusFilter]);

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

      let matchImageStatus = true;
      if (imageStatusFilter !== 'all') {
        const imgStatus = calcImageStatus(p);
        if (imageStatusFilter === 'ok') matchImageStatus = (imgStatus === 'ok');
        else if (imageStatusFilter === 'missing') matchImageStatus = (imgStatus === 'missing');
        else if (imageStatusFilter === 'broken') matchImageStatus = (imgStatus === 'broken');
      }

      return matchSearch && matchCategory && matchBrand && matchStatus && matchImageStatus;
    });
  }, [products, searchTerm, selectedCategoryName, selectedBrandName, statusFilter, imageStatusFilter, failedImageIds]);

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
      setPreviewImageError(false);
    } catch (err) {
      alert('이미지 업로드 실패: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const validateImageUrl = (url) => {
    return new Promise((resolve) => {
      if (!url || url === '/images/no-image.svg') return resolve(true);
      if (url.startsWith('/')) return resolve(true);
      const img = new Image();
      const timer = setTimeout(() => resolve(false), 4000);
      img.onload = () => { clearTimeout(timer); resolve(true); };
      img.onerror = () => { clearTimeout(timer); resolve(false); };
      img.src = url;
    });
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

      if (imageUrl && imageUrl.trim() && imageUrl !== '/images/no-image.svg') {
        const isImgValid = await validateImageUrl(imageUrl.trim());
        if (!isImgValid) {
          const proceed = window.confirm(
            `[이미지 경로 경고]\n입력하신 이미지 URL을 불러올 수 없습니다 (404 또는 로드 오류).\n\n저장 경로:\n${imageUrl}\n\n그래도 저장하시겠습니까?`
          );
          if (!proceed) {
            setSubmitting(false);
            return;
          }
        }
      }

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

      let savedProductId = null;
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);

        if (error) throw error;
        savedProductId = editingProduct.id;
        if (editingProduct?.id) {
          await saveProductDetailImages(editingProduct.id, detailImages).catch(e => console.warn('Detail images save warning:', e));
        }
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

        const { data: newProd, error } = await supabase
          .from('products')
          .insert({
            ...payload,
            slug,
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (error) throw error;
        savedProductId = newProd?.id;
        if (newProd?.id) {
          await saveProductDetailImages(newProd.id, detailImages).catch(e => console.warn('Detail images save warning:', e));
        }
      }

      // Save AI Search Metadata
      if (savedProductId) {
        try {
          const metaPayload = {
            product_id: savedProductId,
            product_code: productCode.trim() || null,
            color_family: colorFamily || null,
            color_detail: colorDetail.trim() || null,
            pattern_type: patternType || null,
            texture: texture.trim() || null,
            finish: finish || null,
            style_tags: styleTagsInput ? styleTagsInput.split(',').map(s => s.trim()).filter(Boolean) : [],
            space_tags: spaceTagsInput ? spaceTagsInput.split(',').map(s => s.trim()).filter(Boolean) : [],
            search_aliases: searchAliasesInput ? searchAliasesInput.split(',').map(s => s.trim()).filter(Boolean) : [],
            is_verified: isVerified,
            updated_at: new Date().toISOString()
          };

          await supabase.from('product_search_metadata').upsert(metaPayload, { onConflict: 'product_id' });

          const updatedMeta = {
            id: savedProductId,
            code: metaPayload.product_code,
            name,
            colorFamily: metaPayload.color_family,
            colorDetail: metaPayload.color_detail,
            patternType: metaPayload.pattern_type,
            texture: metaPayload.texture,
            finish: metaPayload.finish,
            moodTags: metaPayload.style_tags,
            spaceTags: metaPayload.space_tags,
            searchAliases: metaPayload.search_aliases,
            isVerified: metaPayload.is_verified,
            updatedAt: metaPayload.updated_at
          };

          if (metadataById) metadataById.set(String(savedProductId).toLowerCase(), updatedMeta);
          if (metaPayload.product_code && metadataByCode) {
            metadataByCode.set(metaPayload.product_code.toUpperCase(), updatedMeta);
          }
        } catch (mErr) {
          console.warn('Metadata upsert notice:', mErr);
        }
      }

      alert(editingProduct ? '상품이 수정되었습니다.' : '신규 상품이 등록되었습니다.');

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
    setPreviewImageError(false);
    setDetailImages([]);
    setColorFamily('');
    setColorDetail('');
    setPatternType('');
    setTexture('');
    setFinish('무광');
    setStyleTagsInput('');
    setSpaceTagsInput('');
    setSearchAliasesInput('');
    setIsVerified(false);
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
    setPreviewImageError(false);
    setDetailImages([]);

    const codeKey = (p.product_code || '').trim().toUpperCase();
    const meta = metadataByCode.get(codeKey) || metadataById.get(String(p.id).toLowerCase()) || {};
    setColorFamily(meta.color_family && meta.color_family !== 'unknown' ? meta.color_family : '');
    setColorDetail(meta.color_detail || '');
    setPatternType(meta.pattern_type && meta.pattern_type !== 'unknown' ? meta.pattern_type : '');
    setTexture(meta.texture || '');
    setFinish(meta.finish || '무광');
    setStyleTagsInput(Array.isArray(meta.style_tags) ? meta.style_tags.join(', ') : '');
    setSpaceTagsInput(Array.isArray(meta.space_tags) ? meta.space_tags.join(', ') : '');
    setSearchAliasesInput(Array.isArray(meta.search_aliases) ? meta.search_aliases.join(', ') : '');
    setIsVerified(meta.is_verified || false);

    if (p?.id) {
      getProductDetailImages(p.id, p.product_code, p).then(imgs => {
        setDetailImages(imgs || []);
      });
    }
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
              <option value="all">전체 노출 상태</option>
              <option value="active">노출 중</option>
              <option value="hidden">숨김</option>
              <option value="featured">추천(베스트) 상품</option>
            </select>

            <select value={imageStatusFilter} onChange={e => setImageStatusFilter(e.target.value)}>
              <option value="all">이미지 상태: 전체</option>
              <option value="ok">정상</option>
              <option value="missing">이미지 없음</option>
              <option value="broken">이미지 경로 오류</option>
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
            {filteredProducts.slice(0, visibleCount).map(p => {
              const imgStatus = calcImageStatus(p);
              return (
                <div key={p.id} className={`product-merchant-card ${p.is_active ? '' : 'disabled'}`}>
                  <div className="card-image-box">
                    <img 
                      src={getProductImageUrl(p)} 
                      alt={p.name} 
                      onError={e => {
                        if (e.target.src !== "/images/no-image.svg") {
                          e.target.onerror = null;
                          e.target.src = "/images/no-image.svg";
                          setFailedImageIds(prev => new Set(prev).add(p.id));
                        }
                      }}
                    />
                    <div className="card-badge-layer">
                      <div className="badge-group-left">
                        <span className={`badge-active ${p.is_active ? 'active' : 'hidden'}`}>
                          {p.is_active ? '노출 중' : '숨김'}
                        </span>
                        {imgStatus === 'ok' && <span className="badge-img-status ok">이미지 정상</span>}
                        {imgStatus === 'broken' && <span className="badge-img-status broken">경로 오류</span>}
                        {imgStatus === 'missing' && <span className="badge-img-status missing">이미지 누락</span>}
                      </div>
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
            );
          })}
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

                    {/* AI 검색 메타데이터 관리 필드셋 */}
                    <div className="admin-metadata-fieldset" style={{ marginTop: '20px', padding: '16px', background: '#F8F9FA', borderRadius: '8px', border: '1px solid #E9ECEF' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#343A40', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles size={16} color="#E03131" /> AI 검색 속성 & 태그 관리
                        </span>
                        <label className="checkbox-lbl" style={{ margin: 0, fontSize: '12px' }}>
                          <input type="checkbox" checked={isVerified} onChange={e => setIsVerified(e.target.checked)} />
                          <span style={{ color: isVerified ? '#2B8A3E' : '#868E96', fontWeight: isVerified ? '700' : '400' }}>
                            {isVerified ? '✓ 관리자 검수 완료' : '미검수 (자동추출)'}
                          </span>
                        </label>
                      </div>

                      <div className="form-row-two" style={{ marginBottom: '10px' }}>
                        <div className="field">
                          <label style={{ fontSize: '12px' }}>대표 색상군</label>
                          <select value={colorFamily} onChange={e => setColorFamily(e.target.value)}>
                            <option value="">미지정 (Unknown)</option>
                            {Object.keys(COLOR_TAXONOMY).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '12px' }}>보조/세부 색상 (콤마 구분)</label>
                          <input 
                            type="text" 
                            value={colorDetail} 
                            onChange={e => setColorDetail(e.target.value)} 
                            placeholder="예: 아이보리, 크림, 애쉬"
                            style={{ fontSize: '12px' }}
                          />
                        </div>
                      </div>

                      <div className="form-row-two" style={{ marginBottom: '10px' }}>
                        <div className="field">
                          <label style={{ fontSize: '12px' }}>패턴/질감 분류</label>
                          <select value={patternType} onChange={e => setPatternType(e.target.value)}>
                            <option value="">미지정 (Unknown)</option>
                            {Object.keys(PATTERN_TAXONOMY).map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '12px' }}>표면 마감</label>
                          <select value={finish} onChange={e => setFinish(e.target.value)}>
                            {Object.keys(FINISH_TAXONOMY).map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="field" style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: '12px' }}>분위기/스타일 태그 (콤마 구분)</label>
                        <input 
                          type="text" 
                          value={styleTagsInput} 
                          onChange={e => setStyleTagsInput(e.target.value)} 
                          placeholder="예: 따뜻한 분위기, 모던한, 미니멀한, 내추럴한"
                          style={{ fontSize: '12px' }}
                        />
                      </div>

                      <div className="field" style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: '12px' }}>추천 공간/용도 태그 (콤마 구분)</label>
                        <input 
                          type="text" 
                          value={spaceTagsInput} 
                          onChange={e => setSpaceTagsInput(e.target.value)} 
                          placeholder="예: 사무실, 카페, 거실, 헬스장, 상업용"
                          style={{ fontSize: '12px' }}
                        />
                      </div>

                      <div className="field">
                        <label style={{ fontSize: '12px' }}>검색 별칭 (Aliases)</label>
                        <input 
                          type="text" 
                          value={searchAliasesInput} 
                          onChange={e => setSearchAliasesInput(e.target.value)} 
                          placeholder="예: 디아망 회벽, 센스타일 그란데"
                          style={{ fontSize: '12px' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-right">
                    <div className="image-field-uploader">
                      <label>상품 대표 이미지 *</label>
                      <div className="preview-container">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt="상품 미리보기" 
                            onError={() => setPreviewImageError(true)}
                            onLoad={() => setPreviewImageError(false)}
                          />
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

                      {imageUrl && imageUrl !== '/images/no-image.svg' ? (
                        previewImageError ? (
                          <div className="modal-preview-status-box broken">
                            <span><AlertTriangle size={14} /> 이미지를 불러올 수 없습니다.</span>
                            <span className="path-text">저장 경로: {imageUrl}</span>
                          </div>
                        ) : (
                          <div className="modal-preview-status-box ok">
                            <span><CheckCircle size={14} /> [상품 이미지] 이미지 정상</span>
                          </div>
                        )
                      ) : (
                        <div className="modal-preview-status-box missing">
                          <span>ℹ️ 이미지 준비중 (등록된 이미지 없음)</span>
                        </div>
                      )}

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
                          onChange={e => {
                            setImageUrl(e.target.value);
                            setPreviewImageError(false);
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 쇼핑몰형 상세 이미지 관리 */}
                <ProductDetailImageManager
                  productId={editingProduct?.id}
                  productCode={productCode || name}
                  images={detailImages}
                  onChange={setDetailImages}
                />

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
