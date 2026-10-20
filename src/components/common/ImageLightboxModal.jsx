// src/components/common/ImageLightboxModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import './ImageLightboxModal.css';

export default function ImageLightboxModal({ imageUrl, altText = '상세 이미지', onClose }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const imgRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const handleZoomIn = (e) => {
    e?.stopPropagation();
    setScale((prev) => Math.min(prev + 0.3, 3.0));
  };

  const handleZoomOut = (e) => {
    e?.stopPropagation();
    setScale((prev) => {
      const next = Math.max(prev - 0.3, 1.0);
      if (next === 1.0) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = (e) => {
    e?.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Toggle 1x / 1.8x on double click
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (scale > 1) {
      handleReset();
    } else {
      setScale(1.8);
    }
  };

  // Mouse Drag / Pan when zoomed
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  }, [isDragging, scale]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Drag for Mobile
  const handleTouchStart = (e) => {
    if (scale <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y
    };
  };

  const handleTouchMove = (e) => {
    if (!isDragging || scale <= 1 || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y
    });
  };

  if (!imageUrl) return null;

  return (
    <div 
      className="img-lightbox-overlay" 
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      role="dialog"
      aria-modal="true"
      aria-label="상세 이미지 확대 보기"
    >
      {/* Top Floating Controls */}
      <div className="img-lightbox-toolbar" onClick={(e) => e.stopPropagation()}>
        <div className="zoom-btn-group">
          <button 
            type="button" 
            className="lightbox-tool-btn" 
            onClick={handleZoomIn}
            title="확대 (+)"
            aria-label="이미지 확대"
          >
            <ZoomIn size={18} />
          </button>
          <button 
            type="button" 
            className="lightbox-tool-btn" 
            onClick={handleZoomOut}
            disabled={scale <= 1}
            title="축소 (-)"
            aria-label="이미지 축소"
          >
            <ZoomOut size={18} />
          </button>
          <button 
            type="button" 
            className="lightbox-tool-btn" 
            onClick={handleReset}
            disabled={scale === 1 && position.x === 0 && position.y === 0}
            title="원래 크기로 (100%)"
            aria-label="이미지 원위치"
          >
            <RotateCcw size={16} />
            <span className="scale-text">{Math.round(scale * 100)}%</span>
          </button>
        </div>

        <button 
          type="button" 
          className="lightbox-close-btn" 
          onClick={onClose}
          title="닫기 (ESC)"
          aria-label="닫기"
        >
          <X size={20} />
          <span className="btn-text">닫기</span>
        </button>
      </div>

      {/* Main Centered Image Container */}
      <div 
        className={`img-lightbox-stage ${scale > 1 ? 'is-zoomed' : ''} ${isDragging ? 'is-dragging' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div 
          className="img-wrapper"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        >
          <img 
            ref={imgRef}
            src={imageUrl} 
            alt={altText} 
            className="lightbox-target-img"
            draggable={false}
          />
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="img-lightbox-hint" onClick={(e) => e.stopPropagation()}>
        <span>더블클릭 또는 버튼으로 확대 가능 · ESC 키 또는 배경 클릭 시 닫기</span>
      </div>
    </div>
  );
}
