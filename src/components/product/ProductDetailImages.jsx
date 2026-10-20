// src/components/product/ProductDetailImages.jsx
import React, { useState } from 'react';
import ImageLightboxModal from '../common/ImageLightboxModal';
import { ZoomIn } from 'lucide-react';
import './ProductDetailImages.css';

export default function ProductDetailImages({ images = [], productName = '', sectionTitle = '제품 상세 이미지' }) {
  const [selectedZoomImg, setSelectedZoomImg] = useState(null);

  // 이미지가 없는 경우 빈 영역을 일체 표시하지 않음
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <section className="detail-doc-section product-detail-images-section">
      <div className="section-title-with-badge">
        <h2 className="doc-section-title">{sectionTitle}</h2>
        <span className="section-badge-detail">상세 안내</span>
      </div>
      <div className="doc-accent-bar"></div>
      <p className="detail-images-lead-text">
        자재의 실제 패턴, 텍스처, 시공 상세 정보 및 특장점을 확인하실 수 있습니다. (이미지 클릭 시 확대)
      </p>

      {/* 쇼핑몰형 순차 상세 이미지 스택 */}
      <div className="detail-images-stack">
        {images.map((item, idx) => {
          const imgUrl = typeof item === 'string' ? item : (item.url || item.image_url);
          const altText = item.alt_text || `${productName || '제품'} 상세 이미지 ${idx + 1}`;

          if (!imgUrl) return null;

          return (
            <div 
              key={item.id || idx}
              className="detail-image-card"
              onClick={() => setSelectedZoomImg({ url: imgUrl, alt: altText })}
              role="button"
              tabIndex={0}
              aria-label={`${altText} 확대 보기`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedZoomImg({ url: imgUrl, alt: altText });
                }
              }}
            >
              <img 
                src={imgUrl} 
                alt={altText}
                loading={idx === 0 ? "eager" : "lazy"}
                decoding="async"
                className="detail-content-img"
              />
              <div className="detail-image-hover-cue">
                <span className="cue-pill">
                  <ZoomIn size={14} /> 클릭하여 원본 확대
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 이미지 확대 라이트박스 모달 */}
      {selectedZoomImg && (
        <ImageLightboxModal 
          imageUrl={selectedZoomImg.url} 
          altText={selectedZoomImg.alt} 
          onClose={() => setSelectedZoomImg(null)} 
        />
      )}
    </section>
  );
}
