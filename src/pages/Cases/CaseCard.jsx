import React, { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Box, Calendar, Edit2, Eye, EyeOff, ArrowUpRight, ZoomIn } from 'lucide-react';
import { getCaseImageUrl, getCaseImageSrcSet } from '../../utils/caseImageUtils';
import { resolveCaseMaterialLinks } from '../../utils/caseMaterialUtils';

const MAX_VISIBLE_GALLERY = 3;

function CaseCardComponent({
  item,
  index,
  isAdmin,
  onOpenLightbox,
  onEdit,
  onTogglePublish
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [item.main_image_url]);

  const isFirst = index === 0;
  const mainThumbUrl = useMemo(() => getCaseImageUrl(item.main_image_url, '800'), [item.main_image_url]);
  const mainSrcSet = useMemo(() => getCaseImageSrcSet(item.main_image_url), [item.main_image_url]);
  const galleryImages = useMemo(() => (Array.isArray(item.image_urls) ? item.image_urls : []), [item.image_urls]);
  const materialLinks = useMemo(() => resolveCaseMaterialLinks(item), [item]);

  const hasMoreGallery = galleryImages.length > MAX_VISIBLE_GALLERY;
  const displayGallery = useMemo(() => {
    return hasMoreGallery ? galleryImages.slice(0, MAX_VISIBLE_GALLERY) : galleryImages;
  }, [galleryImages, hasMoreGallery]);

  const handleMainClick = useCallback(() => {
    onOpenLightbox(item, 0);
  }, [onOpenLightbox, item]);

  return (
    <article className="case-portfolio-card">
      {/* Media Wrap */}
      <div 
        className="case-img-wrapper"
        onClick={handleMainClick}
        title="클릭하여 현장 사진 크게 보기"
      >
        {isAdmin && (
          <span className={`case-admin-status-badge ${item.is_published ? 'published' : 'unpublished'}`}>
            {item.is_published ? '노출 중' : '비노출'}
          </span>
        )}

        {/* Skeleton placeholder while loading */}
        {!imageLoaded && !imageError && (
          <div className="case-img-skeleton" aria-hidden="true">
            <div className="skeleton-shimmer"></div>
          </div>
        )}

        <img
          src={imageError ? "/images/no-image.svg" : mainThumbUrl}
          srcSet={imageError ? undefined : mainSrcSet}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
          alt={item.title}
          className={`case-image ${imageLoaded ? 'loaded' : ''}`}
          loading={isFirst ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={isFirst ? "high" : "auto"}
          width="800"
          height="500"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />

        <div className="case-zoom-hint" aria-hidden="true">
          <ZoomIn size={16} />
          <span>크게 보기</span>
        </div>

        {item.category && <span className="case-tag-badge">{item.category}</span>}
      </div>

      {/* Body Info */}
      <div className="case-body-info">
        <h3 className="case-title-text">{item.title}</h3>
        {item.description && <p className="case-desc-text">{item.description}</p>}

        {/* Optimized Gallery Thumbnails (Max 3 in card preview, all accessible in Lightbox) */}
        {displayGallery.length > 0 && (
          <div className="case-gallery" aria-label={`${item.title} 현장 사진 목록`}>
            {displayGallery.map((rawUrl, idx) => {
              const thumbUrl = getCaseImageUrl(rawUrl, '400');
              const isLastMore = hasMoreGallery && idx === MAX_VISIBLE_GALLERY - 1;
              const moreCount = galleryImages.length - MAX_VISIBLE_GALLERY + 1;

              return (
                <button
                  type="button"
                  key={`${rawUrl}-${idx}`}
                  className="case-gallery-item-btn"
                  onClick={() => onOpenLightbox(item, idx)}
                  aria-label={`${item.title} 현장 사진 ${idx + 1} 크게 보기`}
                >
                  <img
                    src={thumbUrl}
                    alt={`${item.title} 현장 사진 ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    width="120"
                    height="90"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/no-image.svg";
                    }}
                  />
                  {isLastMore && (
                    <span className="case-gallery-more-overlay" aria-hidden="true">
                      +{moreCount}장
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Specs List */}
        <div className="case-specs-list">
          {item.location && (
            <div className="spec-row">
              <MapPin size={14} className="spec-icon" />
              <span className="spec-label">시공 지역</span>
              <span className="spec-value">{item.location}</span>
            </div>
          )}

          {item.material_summary && (
            <div className="spec-row spec-row-material">
              <Box size={14} className="spec-icon" />
              <span className="spec-label">사용 자재</span>
              <div className="case-material-links-wrap">
                {materialLinks.length > 0 ? (
                  materialLinks.map((linkItem, idx) => (
                    <Link
                      key={idx}
                      to={linkItem.path}
                      className="case-material-link highlighted"
                      title={`${linkItem.label} ${linkItem.isDirectDetail ? '상세페이지로 이동' : '자재 검색 결과로 이동'}`}
                    >
                      <span className="material-link-text">{linkItem.label}</span>
                      <ArrowUpRight size={13} className="material-link-icon" />
                    </Link>
                  ))
                ) : (
                  <span className="spec-value highlighted">{item.material_summary}</span>
                )}
              </div>
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

        {/* Admin Inline Actions */}
        {isAdmin && (
          <div className="case-admin-actions">
            <button 
              className="btn-admin-action edit"
              onClick={() => onEdit(item)}
              title="어드민에서 편집"
            >
              <Edit2 size={12} /> 편집
            </button>
            <button 
              className={`btn-admin-action toggle ${item.is_published ? 'hide' : 'show'}`}
              onClick={() => onTogglePublish(item.id, item.is_published ?? true)}
              title={item.is_published ? "숨기기" : "노출하기"}
            >
              {item.is_published ? <EyeOff size={12} /> : <Eye size={12} />}
              {item.is_published ? "숨기기" : "노출하기"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export const CaseCard = memo(CaseCardComponent);
export default CaseCard;

