import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Plus, Search, Edit2, Trash2, Save, X, Upload, Eye, Image as ImageIcon, Loader2 } from 'lucide-react';
import { searchMaterialsForAdmin, findSupabaseProductId } from '../../utils/caseMaterialUtils';
import './AdminConstructionCases.css';

export default function AdminConstructionCases() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // State
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [materialSummary, setMaterialSummary] = useState('');
  const [productId, setProductId] = useState(null);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [materialSearchQuery, setMaterialSearchQuery] = useState('');
  const [materialSearchResults, setMaterialSearchResults] = useState([]);
  const [isSearchingMaterial, setIsSearchingMaterial] = useState(false);
  const materialDropdownRef = useRef(null);
  const [description, setDescription] = useState('');
  const [constructedAt, setConstructedAt] = useState('');
  const [category, setCategory] = useState('주거공간');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [imageUrls, setImageUrls] = useState([]); // array for multiple images

  const categories = ['주거공간', '사무공간', '상업공간'];

  const fetchCases = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (!supabase) throw new Error('Supabase client is not initialized.');

      const { data, error } = await supabase
        .from('construction_cases')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (err) {
      console.error('[AdminCases Fetch Error]', err);
      setErrorMsg(err.message || '시공사례 목록을 가져오는데 실패했습니다.');
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
    fetchCases();
  }, [user, authLoading, navigate]);

  // Handle outside click to close material search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (materialDropdownRef.current && !materialDropdownRef.current.contains(event.target)) {
        setIsSearchingMaterial(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openAddModal = () => {
    setEditingCase(null);
    setTitle('');
    setLocation('');
    setMaterialSummary('');
    setProductId(null);
    setSelectedMaterials([]);
    setMaterialSearchQuery('');
    setMaterialSearchResults([]);
    setIsSearchingMaterial(false);
    setDescription('');
    setCategory('주거공간');
    setIsActive(true);
    setIsFeatured(false);
    setSortOrder(0);
    setMainImageUrl('');
    setImageUrls([]);

    // Set default date to today in YYYY-MM-DD
    const today = new Date().toISOString().substring(0, 10);
    setConstructedAt(today);

    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingCase(item);
    setTitle(item.title || '');
    setLocation(item.location || '');
    setMaterialSummary(item.material_summary || '');
    setProductId(item.product_id || null);
    setSelectedMaterials([]);
    setMaterialSearchQuery('');
    setMaterialSearchResults([]);
    setIsSearchingMaterial(false);
    setDescription(item.description || '');
    setCategory(item.category || '주거공간');
    setIsActive(item.is_active ?? item.is_published ?? true);
    setIsFeatured(item.is_featured ?? false);
    setSortOrder(item.sort_order || 0);
    setMainImageUrl(item.main_image_url || '');
    setConstructedAt(item.constructed_at || '');
    setImageUrls(item.image_urls || []);
    setIsModalOpen(true);
  };

  const handleMaterialSearchChange = (e) => {
    const val = e.target.value;
    setMaterialSearchQuery(val);
    if (val.trim().length >= 1) {
      const results = searchMaterialsForAdmin(val, 12);
      setMaterialSearchResults(results);
      setIsSearchingMaterial(true);
    } else {
      setMaterialSearchResults([]);
      setIsSearchingMaterial(false);
    }
  };

  const handleSelectMaterial = async (materialItem) => {
    if (selectedMaterials.some(m => m.id === materialItem.id)) {
      alert('이미 추가된 자재입니다.');
      return;
    }

    const updated = [...selectedMaterials, materialItem];
    setSelectedMaterials(updated);

    // Sync to materialSummary string
    const labels = updated.map(m => {
      const brand = m.brand ? `${m.brand} ` : '';
      const code = m.code ? ` (${m.code})` : '';
      return `${brand}${m.name || ''}${code}`.trim();
    });
    setMaterialSummary(labels.join(', '));

    // Try finding Supabase numeric product ID for primary item
    if (!productId) {
      const numId = await findSupabaseProductId(supabase, materialItem);
      if (numId) setProductId(numId);
    }

    setMaterialSearchQuery('');
    setMaterialSearchResults([]);
    setIsSearchingMaterial(false);
  };

  const handleRemoveMaterial = (materialId) => {
    const updated = selectedMaterials.filter(m => m.id !== materialId);
    setSelectedMaterials(updated);
    const labels = updated.map(m => {
      const brand = m.brand ? `${m.brand} ` : '';
      const code = m.code ? ` (${m.code})` : '';
      return `${brand}${m.name || ''}${code}`.trim();
    });
    setMaterialSummary(labels.join(', '));
    if (updated.length === 0) {
      setProductId(null);
    }
  };

  const handleImageUpload = async (e, type = 'main') => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      if (!supabase) throw new Error('Supabase client is not initialized.');

      const uploadedUrls = [];
      for (const file of (type === 'main' ? files.slice(0, 1) : files)) {
        if (!file.type.startsWith('image/')) throw new Error('이미지 파일만 업로드할 수 있습니다.');
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
        const filePath = `cases/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('construction-cases')
          .upload(filePath, file, { cacheControl: '3600', upsert: false, contentType: file.type });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('construction-cases').getPublicUrl(filePath);
        uploadedUrls.push(data.publicUrl);
      }
      if (type === 'main') {
        setMainImageUrl(uploadedUrls[0]);
      } else {
        setImageUrls(prev => [...prev, ...uploadedUrls]);
      }
    } catch (err) {
      console.error('[Upload Error]', err);
      alert('이미지 업로드에 실패했습니다: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeGalleryImage = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      if (!supabase) throw new Error('Supabase client is not initialized.');

      let finalProductId = productId;
      if (!finalProductId && selectedMaterials.length > 0) {
        finalProductId = await findSupabaseProductId(supabase, selectedMaterials[0]);
      }

      // Construct payload
      const payload = {
        title,
        location: location || null,
        material_summary: materialSummary || null,
        product_id: finalProductId || null,
        description: description || null,
        category,
        is_active: isActive,
        is_published: isActive, // Maintain both fields dynamically
        is_featured: isFeatured,
        sort_order: sortOrder,
        main_image_url: mainImageUrl || null,
        constructed_at: constructedAt || null,
        image_urls: imageUrls,
        updated_at: new Date().toISOString()
      };

      if (editingCase) {
        // UPDATE
        const { error } = await supabase
          .from('construction_cases')
          .update(payload)
          .eq('id', editingCase.id);

        if (error) throw error;
        alert('시공사례가 성공적으로 수정되었습니다.');
      } else {
        // INSERT
        const { error } = await supabase
          .from('construction_cases')
          .insert({
            ...payload,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
        alert('시공사례가 성공적으로 등록되었습니다.');
      }

      setIsModalOpen(false);
      fetchCases();
    } catch (err) {
      console.error('[Submit Case Error]', err);
      alert('저장에 실패했습니다: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 시공사례를 삭제하시겠습니까? 관련 데이터가 복구되지 않습니다.')) {
      return;
    }

    try {
      if (!supabase) throw new Error('Supabase client is not initialized.');
      const { error } = await supabase
        .from('construction_cases')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('성공적으로 삭제되었습니다.');
      fetchCases();
    } catch (err) {
      console.error('[Delete Case Error]', err);
      alert('삭제에 실패했습니다: ' + err.message);
    }
  };

  // Filter cases based on search and category
  const filteredCases = cases.filter(item => {
    const matchSearch =
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.material_summary?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory =
      selectedCategory === '전체' ||
      item.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  return (
    <MainLayout>
      <div className="admin-cases-container">
        {/* Back Link */}
        <span className="back-to-dashboard" onClick={() => navigate('/admin')}>
          <ArrowLeft size={16} />
          관리자 대시보드로 돌아가기
        </span>

        {/* Header */}
        <div className="admin-cases-header">
          <div>
            <h1>시공사례 관리</h1>
            <p>시공사례 포트폴리오를 직접 등록하고 노출 상태와 세부 스펙을 제어합니다.</p>
          </div>
          <button className="btn-add-case" onClick={openAddModal}>
            <Plus size={16} />
            시공사례 등록
          </button>
        </div>

        {errorMsg && <div className="cases-error-banner">{errorMsg}</div>}

        {/* Search and Filters */}
        <div className="admin-cases-filters-row">
          <div className="filter-tabs">
            {['전체', ...categories].map(cat => (
              <button
                key={cat}
                className={`filter-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="제목, 시공지, 자재로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List of cases */}
        {loading ? (
          <div className="cases-loading">
            <div className="spinner-loader"></div>
            <p>포트폴리오 리스트를 불러오고 있습니다...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="cases-empty-state">
            <ImageIcon size={40} className="icon-empty" />
            <h3>등록된 시공사례가 없습니다.</h3>
            <p>우측 상단의 '시공사례 등록' 버튼을 눌러 첫 항목을 등록해보세요.</p>
          </div>
        ) : (
          <div className="admin-cases-table-wrapper">
            <table className="admin-cases-table">
              <thead>
                <tr>
                  <th>순서</th>
                  <th>대표 이미지</th>
                  <th>제목</th>
                  <th>카테고리</th>
                  <th>현장 위치</th>
                  <th>시공 자재</th>
                  <th>노출</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map(item => (
                  <tr key={item.id}>
                    <td className="sort-cell">{item.sort_order}</td>
                    <td className="img-cell">
                      <img
                        src={item.main_image_url || "/images/no-image.svg"}
                        alt={item.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/no-image.svg";
                        }}
                      />
                    </td>
                    <td className="title-cell">
                      <strong>{item.title}</strong>
                      {item.is_featured && <span className="badge-featured">베스트</span>}
                    </td>
                    <td>{item.category}</td>
                    <td>{item.location || '-'}</td>
                    <td className="material-cell">{item.material_summary || '-'}</td>
                    <td>
                      {item.is_active ? (
                        <span className="badge-visible">노출 중</span>
                      ) : (
                        <span className="badge-hidden">비노출</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <button className="btn-action-edit" onClick={() => openEditModal(item)} title="수정">
                        <Edit2 size={14} />
                      </button>
                      <button className="btn-action-delete" onClick={() => handleDelete(item.id)} title="삭제">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CRUD Form Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content-card">
              <div className="modal-header">
                <h2>{editingCase ? '시공사례 수정' : '시공사례 등록'}</h2>
                <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <form className="modal-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                  {/* Left Column: text inputs */}
                  <div className="form-left-col">
                    <div className="form-input-field">
                      <label>제목 *</label>
                      <input
                        type="text"
                        required
                        placeholder="예: 마포구 아파트 거실 장판 시공"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div className="form-row-two">
                      <div className="form-input-field">
                        <label>카테고리</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div className="form-input-field">
                        <label>시공 연월</label>
                        <input
                          type="date"
                          value={constructedAt}
                          onChange={(e) => setConstructedAt(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row-two">
                      <div className="form-input-field">
                        <label>현장 위치 / 지역</label>
                        <input
                          type="text"
                          placeholder="예: 서울시 마포구"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>

                      <div className="form-input-field material-selector-field" ref={materialDropdownRef}>
                        <label>시공 자재 연결 (DB 검색 & 다중 선택)</label>
                        <div className="material-search-input-wrapper">
                          <input
                            type="text"
                            placeholder="제품 코드(예: TS5534, PTT8698, 726) 또는 자재명 검색..."
                            value={materialSearchQuery}
                            onChange={handleMaterialSearchChange}
                            onFocus={() => {
                              if (materialSearchQuery.trim()) setIsSearchingMaterial(true);
                            }}
                          />
                          {isSearchingMaterial && materialSearchResults.length > 0 && (
                            <div className="material-search-dropdown">
                              {materialSearchResults.map((m) => (
                                <div
                                  key={m.id}
                                  className="material-search-dropdown-item"
                                  onClick={() => handleSelectMaterial(m)}
                                >
                                  <div className="item-meta">
                                    <span className="item-brand">{m.brand}</span>
                                    <span className="item-code">{m.code || m.name}</span>
                                    {m.specs?.size && <span className="item-size">{m.specs.size}</span>}
                                  </div>
                                  <div className="item-name">{m.name}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Selected Materials Chips */}
                        {selectedMaterials.length > 0 && (
                          <div className="selected-materials-chips">
                            {selectedMaterials.map((m) => (
                              <div key={m.id} className="material-chip">
                                <span className="chip-label">{m.brand} {m.code || m.name}</span>
                                <button
                                  type="button"
                                  className="chip-remove"
                                  onClick={() => handleRemoveMaterial(m.id)}
                                  title="자재 제거"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="material-summary-subfield">
                          <span className="subfield-note">시공 자재 요약 텍스트 (사이트 노출용, 직접 수정 가능)</span>
                          <input
                            type="text"
                            placeholder="예: LX하우시스 프레스티지 5T PTT8698 (더스크 브론즈)"
                            value={materialSummary}
                            onChange={(e) => setMaterialSummary(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-input-field">
                      <label>시공 세부 설명</label>
                      <textarea
                        rows={5}
                        placeholder="시공 전/후 상세 설명이나 특징 등을 입력하십시오..."
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
                          id="isActive"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                        />
                        <label htmlFor="isActive">사이트에 노출</label>
                      </div>

                      <div className="form-checkbox-field">
                        <input
                          type="checkbox"
                          id="isFeatured"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                        />
                        <label htmlFor="isFeatured">베스트 사례</label>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: images upload */}
                  <div className="form-right-col">
                    {/* Main image upload */}
                    <div className="image-upload-box">
                      <label>대표 이미지 *</label>
                      <div className="img-preview-frame">
                        {mainImageUrl ? (
                          <img src={mainImageUrl} alt="대표 이미지" />
                        ) : (
                          <div className="empty-preview-icon">
                            <ImageIcon size={40} />
                            <span>대표 이미지를 업로드하세요</span>
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
                          <Upload size={14} /> 대표사진 선택
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'main')}
                            style={{ display: 'none' }}
                            disabled={uploading}
                          />
                        </label>
                        <input
                          type="text"
                          className="img-url-input"
                          placeholder="직접 이미지 URL 입력도 가능"
                          value={mainImageUrl}
                          onChange={(e) => setMainImageUrl(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Gallery upload */}
                    <div className="gallery-upload-section">
                      <label>갤러리 추가 이미지 (여러 장 가능)</label>

                      <div className="gallery-previews-grid">
                        {imageUrls.map((url, idx) => (
                          <div key={idx} className="gallery-thumb-item">
                            <img src={url} alt={`갤러리 ${idx}`} />
                            <button
                              type="button"
                              className="btn-remove-thumb"
                              onClick={() => removeGalleryImage(idx)}
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}

                        <label className="gallery-add-card">
                          <Plus size={20} />
                          <span>추가</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleImageUpload(e, 'gallery')}
                            style={{ display: 'none' }}
                            disabled={uploading}
                          />
                        </label>
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
