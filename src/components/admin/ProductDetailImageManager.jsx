// src/components/admin/ProductDetailImageManager.jsx
import React, { useState, useRef } from 'react';
import { 
  Upload, Trash2, ArrowUp, ArrowDown, RefreshCw, Eye, Plus, 
  CheckCircle, Loader2, Image as ImageIcon, AlertCircle 
} from 'lucide-react';
import { uploadDetailImageFile, saveProductDetailImages } from '../../services/productDetailImageService';
import ImageLightboxModal from '../common/ImageLightboxModal';
import './ProductDetailImageManager.css';

export default function ProductDetailImageManager({
  productId,
  productCode,
  images = [],
  onChange,
  onSaved
}) {
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const multiFileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);
  const replaceTargetIndexRef = useRef(null);

  // 다중 파일 업로드 핸들러
  const handleMultipleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setFeedbackMsg(null);
    try {
      const newUploaded = [];
      for (const file of files) {
        const publicUrl = await uploadDetailImageFile(file, productId);
        newUploaded.push({
          id: `new-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          url: publicUrl,
          alt_text: file.name.replace(/\.[^/.]+$/, ''),
          isNew: true
        });
      }

      const updated = [...images, ...newUploaded].map((img, idx) => ({
        ...img,
        sort_order: idx
      }));

      onChange(updated);
      setFeedbackMsg({ type: 'success', text: `${files.length}개의 상세 이미지가 추가되었습니다.` });
    } catch (err) {
      console.error('[Detail Image Upload Error]:', err);
      alert('상세 이미지 업로드 실패: ' + err.message);
    } finally {
      setUploading(false);
      if (multiFileInputRef.current) multiFileInputRef.current.value = '';
    }
  };

  // 개별 이미지 교체
  const triggerReplace = (index) => {
    replaceTargetIndexRef.current = index;
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.click();
    }
  };

  const handleReplaceFile = async (e) => {
    const file = e.target.files?.[0];
    const index = replaceTargetIndexRef.current;
    if (!file || index === null || index === undefined) return;

    setUploading(true);
    try {
      const publicUrl = await uploadDetailImageFile(file, productId);
      const nextList = [...images];
      nextList[index] = {
        ...nextList[index],
        url: publicUrl,
        alt_text: file.name.replace(/\.[^/.]+$/, '')
      };
      onChange(nextList);
      setFeedbackMsg({ type: 'success', text: `#${index + 1} 이미지가 새 파일로 교체되었습니다.` });
    } catch (err) {
      alert('이미지 교체 실패: ' + err.message);
    } finally {
      setUploading(false);
      replaceTargetIndexRef.current = null;
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    }
  };

  // 이미지 삭제
  const handleDelete = (index) => {
    if (!window.confirm(`선택한 #${index + 1} 상세 이미지를 목록에서 삭제하시겠습니까?`)) return;
    const nextList = images.filter((_, idx) => idx !== index).map((img, idx) => ({
      ...img,
      sort_order: idx
    }));
    onChange(nextList);
    setFeedbackMsg({ type: 'info', text: '이미지가 삭제되었습니다. (저장 시 최종 반영)' });
  };

  // 순서 위로 이동
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const nextList = [...images];
    const temp = nextList[index - 1];
    nextList[index - 1] = nextList[index];
    nextList[index] = temp;
    const reindexed = nextList.map((img, idx) => ({ ...img, sort_order: idx }));
    onChange(reindexed);
  };

  // 순서 아래로 이동
  const handleMoveDown = (index) => {
    if (index === images.length - 1) return;
    const nextList = [...images];
    const temp = nextList[index + 1];
    nextList[index + 1] = nextList[index];
    nextList[index] = temp;
    const reindexed = nextList.map((img, idx) => ({ ...img, sort_order: idx }));
    onChange(reindexed);
  };

  // URL 직접 추가
  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const newItem = {
      id: `url-${Date.now()}`,
      url: urlInput.trim(),
      alt_text: `${productCode || '제품'} 상세 이미지`,
      sort_order: images.length
    };
    onChange([...images, newItem]);
    setUrlInput('');
    setFeedbackMsg({ type: 'success', text: '이미지 URL이 추가되었습니다.' });
  };

  // 상세 이미지 즉시 저장
  const handleSaveImmediate = async () => {
    if (!productId) {
      alert('먼저 상품 기본 정보를 저장하여 상품 ID를 생성해주세요.');
      return;
    }

    setSaving(true);
    setFeedbackMsg(null);
    try {
      await saveProductDetailImages(productId, images);
      setFeedbackMsg({ type: 'success', text: '✅ 상세 이미지가 DB에 즉시 저장되었습니다!' });
      if (onSaved) onSaved();
    } catch (err) {
      console.error('[Detail Image Save Error]:', err);
      alert('저장 실패: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="product-detail-image-manager">
      <div className="manager-header">
        <div className="manager-title-wrap">
          <ImageIcon size={18} className="title-icon" />
          <h4>상세 이미지 관리 (쇼핑몰형 상세페이지)</h4>
          <span className="count-badge">{images.length}장</span>
        </div>
        {productId && (
          <button
            type="button"
            className="btn-save-detail-images"
            onClick={handleSaveImmediate}
            disabled={saving || uploading}
          >
            {saving ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
            상세 이미지 즉시 저장
          </button>
        )}
      </div>

      <p className="manager-helper-text">
        상품 상세페이지의 자재 규격표 아래에 순서대로 길게 노출되는 일반 쇼핑몰형 상세 이미지입니다. 
        등록된 순서대로 표시되며, 순서 변경 및 다중 업로드가 지원됩니다.
      </p>

      {feedbackMsg && (
        <div className={`manager-alert-pill ${feedbackMsg.type}`}>
          {feedbackMsg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Upload Drop Zone & Direct URL Form */}
      <div className="upload-toolbar-box">
        <div className="file-upload-block">
          <label className={`btn-upload-multiple ${uploading ? 'disabled' : ''}`}>
            {uploading ? (
              <>
                <Loader2 size={16} className="spin" />
                <span>업로드 중...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>상세 이미지 일괄 업로드 (다중 선택 가능)</span>
              </>
            )}
            <input 
              ref={multiFileInputRef}
              type="file" 
              multiple 
              accept="image/png, image/jpeg, image/jpg, image/webp" 
              onChange={handleMultipleFiles}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
          <span className="file-formats-note">지원 형식: JPG, JPEG, PNG, WEBP</span>
        </div>

        <form className="url-add-inline" onSubmit={handleAddUrl}>
          <input 
            type="text" 
            placeholder="외부 이미지 URL 직접 입력 (https://...)" 
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <button type="submit" className="btn-add-url">
            <Plus size={14} /> 추가
          </button>
        </form>
      </div>

      {/* Hidden file input for single image replacement */}
      <input 
        ref={replaceFileInputRef}
        type="file" 
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleReplaceFile}
        style={{ display: 'none' }}
      />

      {/* Image Items List */}
      {images.length === 0 ? (
        <div className="empty-detail-images">
          <ImageIcon size={32} />
          <p>등록된 상세 이미지가 없습니다.</p>
          <span>상단 버튼을 눌러 상세 이미지를 업로드하면 상세페이지에 자동 노출됩니다.</span>
        </div>
      ) : (
        <div className="detail-images-sort-list">
          {images.map((img, idx) => {
            const imgUrl = img.url || img.image_url;
            return (
              <div key={img.id || idx} className="detail-image-row-item">
                <div className="item-order-tag">#{idx + 1}</div>
                
                <div 
                  className="item-thumb-wrapper"
                  onClick={() => setPreviewModalUrl(imgUrl)}
                  title="클릭하여 크게보기"
                >
                  <img src={imgUrl} alt={`상세 이미지 ${idx + 1}`} />
                  <span className="thumb-zoom-icon"><Eye size={12} /></span>
                </div>

                <div className="item-info">
                  <div className="item-url-text" title={imgUrl}>
                    {imgUrl.split('/').pop()}
                  </div>
                  <input 
                    type="text" 
                    className="item-alt-input"
                    placeholder="이미지 설명 (선택)"
                    value={img.alt_text || ''}
                    onChange={(e) => {
                      const next = [...images];
                      next[idx] = { ...next[idx], alt_text: e.target.value };
                      onChange(next);
                    }}
                  />
                </div>

                <div className="item-actions">
                  <button 
                    type="button" 
                    className="action-btn"
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    title="위로 이동"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button 
                    type="button" 
                    className="action-btn"
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === images.length - 1}
                    title="아래로 이동"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button 
                    type="button" 
                    className="action-btn btn-replace"
                    onClick={() => triggerReplace(idx)}
                    title="다른 파일로 교체"
                  >
                    <RefreshCw size={14} /> 교체
                  </button>
                  <button 
                    type="button" 
                    className="action-btn btn-delete"
                    onClick={() => handleDelete(idx)}
                    title="삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox for Admin preview */}
      {previewModalUrl && (
        <ImageLightboxModal 
          imageUrl={previewModalUrl}
          onClose={() => setPreviewModalUrl(null)}
        />
      )}
    </div>
  );
}
