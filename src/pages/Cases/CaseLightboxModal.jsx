import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { getCaseImageUrl } from '../../utils/caseImageUtils';
import './CaseLightboxModal.css';

export default function CaseLightboxModal({
  isOpen,
  onClose,
  title,
  images = [],
  currentIndex = 0,
  onIndexChange
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && images.length > 1) {
        onIndexChange((currentIndex - 1 + images.length) % images.length);
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        onIndexChange((currentIndex + 1) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, currentIndex, images.length, onClose, onIndexChange]);

  if (!isOpen || images.length === 0) return null;

  const currentRawUrl = images[currentIndex];
  const previewUrl = getCaseImageUrl(currentRawUrl, '1600');
  const originalUrl = getCaseImageUrl(currentRawUrl, 'original');

  return (
    <div className="case-lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="시공사진 크게 보기">
      <div className="case-lightbox-container" onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="case-lightbox-header">
          <div className="case-lightbox-title-wrap">
            <span className="case-lightbox-counter">{currentIndex + 1} / {images.length}</span>
            <span className="case-lightbox-title">{title}</span>
          </div>
          <div className="case-lightbox-actions">
            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="case-lightbox-btn"
              title="원본 이미지 보기"
              download
            >
              <Download size={18} />
              <span className="btn-label">원본</span>
            </a>
            <button className="case-lightbox-btn close" onClick={onClose} title="닫기 (ESC)">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Image View */}
        <div className="case-lightbox-body">
          {images.length > 1 && (
            <button
              className="case-lightbox-nav prev"
              onClick={() => onIndexChange((currentIndex - 1 + images.length) % images.length)}
              aria-label="이전 사진 보기"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          <div className="case-lightbox-img-wrap">
            <img
              src={previewUrl}
              alt={`${title} 현장 사진 ${currentIndex + 1}`}
              className="case-lightbox-img"
              decoding="async"
              onError={(e) => {
                if (e.target.dataset.triedRaw !== 'true' && currentRawUrl && currentRawUrl !== previewUrl) {
                  e.target.dataset.triedRaw = 'true';
                  e.target.src = currentRawUrl;
                } else {
                  e.target.onerror = null;
                  e.target.src = "/images/no-image.svg";
                }
              }}
            />
          </div>

          {images.length > 1 && (
            <button
              className="case-lightbox-nav next"
              onClick={() => onIndexChange((currentIndex + 1) % images.length)}
              aria-label="다음 사진 보기"
            >
              <ChevronRight size={28} />
            </button>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="case-lightbox-strip">
            {images.map((url, idx) => {
              const stripThumb = getCaseImageUrl(url, '400');
              return (
                <button
                  key={`${url}-${idx}`}
                  className={`strip-thumb-btn ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => onIndexChange(idx)}
                >
                  <img src={stripThumb} alt={`썸네일 ${idx + 1}`} loading="lazy" decoding="async" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

