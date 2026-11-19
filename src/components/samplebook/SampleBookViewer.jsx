import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, ZoomIn, ZoomOut, Search, FileText } from "lucide-react";
import { safeEncodeURI, getSampleBookTarget, openCatalogWindow, getAutoMatchedCover } from "../../utils/samplebookResolver";
import { getComputedBrand } from "../../utils/brandUtils";
import { OFFICE_PHONE } from "../../constants/contact";
import "./SampleBookViewer.css";

export default function SampleBookViewer({ book, onClose }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const filmstripRef = useRef(null);
  const modalRef = useRef(null);

  const hasPages = Boolean(book?.pages && Array.isArray(book.pages) && book.pages.length > 0);
  const totalPages = hasPages ? book.pages.length : 0;

  // Reset page when book changes
  useEffect(() => {
    setCurrentPage(0);
    setIsZoomed(false);
  }, [book?.id]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!hasPages || !filmstripRef.current) return;
    const thumbEl = filmstripRef.current.children[currentPage];
    if (thumbEl) {
      thumbEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [currentPage, hasPages]);

  // Preload adjacent images
  useEffect(() => {
    if (!hasPages) return;
    const preload = (idx) => {
      if (idx >= 0 && idx < totalPages) {
        const img = new Image();
        img.src = safeEncodeURI(book.pages[idx]);
      }
    };
    preload(currentPage + 1);
    preload(currentPage - 1);
  }, [currentPage, hasPages, totalPages, book]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
  }, [totalPages]);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    const origStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (hasPages) {
        if (e.key === "ArrowLeft") {
          handlePrev();
        } else if (e.key === "ArrowRight") {
          handleNext();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = origStyle;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, hasPages, handlePrev, handleNext, isFullscreen]);

  if (!book) return null;

  const target = getSampleBookTarget(book);
  const brandName = getComputedBrand(book);
  const autoCover = getAutoMatchedCover(book);
  const coverSrc = book.cover || autoCover ? safeEncodeURI(book.cover || autoCover) : null;

  const handleOpenCatalog = () => {
    if (target.url) {
      openCatalogWindow(target.url);
    }
  };

  // 1. Multi-Page Reader Mode
  if (hasPages) {
    const curPageUrl = safeEncodeURI(book.pages[currentPage]);

    return (
      <div 
        className={`sb-viewer-overlay ${isFullscreen ? "is-fullscreen-overlay" : ""}`} 
        onClick={onClose} 
        role="dialog" 
        aria-modal="true"
      >
        <div 
          ref={modalRef}
          className={`sb-viewer-modal is-pages-mode ${isFullscreen ? "is-fullscreen" : ""}`} 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="sb-viewer-header">
            <div className="sb-viewer-header-info">
              <span className="sb-viewer-brand">{brandName}</span>
              <h3 className="sb-viewer-title">{book.title}</h3>
              <span className="sb-viewer-pages-badge">
                {currentPage + 1} / {totalPages}
              </span>
            </div>

            <div className="sb-viewer-header-actions">
              {/* Material Search Link */}
              <Link
                to={`/materials?category=${encodeURIComponent(book.category || '')}&brand=${encodeURIComponent(brandName)}`}
                className="sb-header-tool-btn"
                title="관련 자재 찾기"
                onClick={onClose}
              >
                <Search size={15} />
                <span>자재찾기</span>
              </Link>

              {/* Estimate Request Link */}
              <Link
                to="/estimate/request"
                className="sb-header-tool-btn highlight"
                title="견적 문의하기"
                onClick={onClose}
              >
                <FileText size={15} />
                <span>견적문의</span>
              </Link>

              {/* Zoom Button */}
              <button 
                type="button" 
                className="sb-header-icon-btn" 
                onClick={() => setIsZoomed((prev) => !prev)}
                title={isZoomed ? "원래 크기로" : "확대"}
                aria-label={isZoomed ? "원래 크기로" : "확대"}
              >
                {isZoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
              </button>

              {/* Fullscreen Toggle */}
              <button 
                type="button" 
                className="sb-header-icon-btn" 
                onClick={() => setIsFullscreen((prev) => !prev)}
                title={isFullscreen ? "전체화면 해제" : "전체화면"}
                aria-label={isFullscreen ? "전체화면 해제" : "전체화면"}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>

              {/* Close Button */}
              <button className="sb-close-btn" onClick={onClose} aria-label="닫기">
                ✕
              </button>
            </div>
          </div>

          {/* Main Viewer Area */}
          <div className="sb-page-viewer-stage">
            {/* Prev Page Floating Button */}
            <button
              type="button"
              className="sb-nav-arrow-btn left"
              onClick={handlePrev}
              disabled={currentPage === 0}
              aria-label="이전 페이지"
            >
              <ChevronLeft size={32} />
            </button>

            {/* Main Page Image */}
            <div className={`sb-page-image-wrapper ${isZoomed ? "zoomed" : ""}`}>
              <img
                src={curPageUrl}
                alt={`${book.title} ${currentPage + 1}페이지`}
                className="sb-current-page-img"
                loading="eager"
                onClick={() => setIsZoomed((prev) => !prev)}
              />
            </div>

            {/* Next Page Floating Button */}
            <button
              type="button"
              className="sb-nav-arrow-btn right"
              onClick={handleNext}
              disabled={currentPage === totalPages - 1}
              aria-label="다음 페이지"
            >
              <ChevronRight size={32} />
            </button>
          </div>

          {/* Thumbnail Strip / Filmstrip */}
          <div className="sb-filmstrip-bar">
            <div className="sb-filmstrip-scroll" ref={filmstripRef}>
              {book.pages.map((pageUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`sb-thumb-item ${idx === currentPage ? "active" : ""}`}
                  onClick={() => {
                    setCurrentPage(idx);
                    setIsZoomed(false);
                  }}
                  title={`${idx + 1}페이지로 이동`}
                >
                  <img
                    src={safeEncodeURI(pageUrl)}
                    alt={`${idx + 1}p`}
                    loading="lazy"
                  />
                  <span className="sb-thumb-page-num">{idx + 1}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Standard Single Cover Modal Mode
  return (
    <div className="sb-viewer-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="sb-viewer-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="sb-viewer-header">
          <div className="sb-viewer-header-info">
            <span className="sb-viewer-brand">{brandName}</span>
            <h3 className="sb-viewer-title">{book.title}</h3>
          </div>
          <button className="sb-close-btn" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="sb-viewer-modal-body">
          <div className="sb-viewer-card-preview">
            {coverSrc ? (
              <img src={coverSrc} alt={book.title} className="sb-viewer-cover-img" />
            ) : (
              <div className="sb-viewer-cover-placeholder">
                <span className="sb-viewer-placeholder-brand">{brandName}</span>
                <span className="sb-viewer-placeholder-title">{book.title}</span>
              </div>
            )}
          </div>

          <div className="sb-viewer-details">
            <div className="sb-viewer-meta">
              <span className="sb-viewer-category-tag">{book.category}</span>
              {book.materialType && (
                <span className="sb-viewer-material-tag">{book.materialType}</span>
              )}
              {!target.isVerified && (
                <span className="sb-viewer-status-badge unverified">샘플북 확인 중</span>
              )}
            </div>

            <h2 className="sb-viewer-product-title">{book.title}</h2>
            <p className="sb-viewer-product-desc">
              {book.description || `${brandName} ${book.category} 샘플북`}
            </p>

            {target.isVerified ? (
              <div className="sb-viewer-notice-box verified">
                <div className="sb-notice-header">
                  <span className="sb-notice-icon">✓</span>
                  <strong>샘플북 열람 안내</strong>
                </div>
                <p className="sb-notice-desc">
                  제조사({target.provider})에서 직접 제공하는 공식 웹 뷰어로 이동하여 고해상도 샘플북과 제품 스펙을 열람하실 수 있습니다.
                </p>
                <div className="sb-viewer-actions">
                  <button className="sb-modal-btn primary" onClick={handleOpenCatalog}>
                    공식 카탈로그 새 창 열기 ↗
                  </button>
                  <Link
                    to={`/materials?category=${encodeURIComponent(book.category || '')}&brand=${encodeURIComponent(brandName)}`}
                    className="sb-modal-btn secondary"
                    onClick={onClose}
                  >
                    관련 자재 찾기
                  </Link>
                </div>
              </div>
            ) : (
              <div className="sb-viewer-notice-box unverified">
                <div className="sb-notice-header">
                  <span className="sb-notice-icon info">ℹ</span>
                  <strong>공식 카탈로그 확인 중 안내</strong>
                </div>
                <p className="sb-notice-desc">
                  본 제품은 제조사에서 별도 온라인 웹 뷰어를 제공하지 않거나 최신 개정판 카탈로그를 준비 중인 품목입니다.
                </p>
                <p className="sb-notice-sub">
                  실물 샘플북 확인이나 자재 스펙 상담이 필요하신 고객님께서는 동경바닥재 고객센터로 문의해 주시기 바랍니다.
                </p>
                <div className="sb-viewer-actions">
                  <a href={`tel:${OFFICE_PHONE}`} className="sb-modal-btn gold">
                    📞 고객센터 문의 ({OFFICE_PHONE})
                  </a>
                  <Link
                    to={`/materials?category=${encodeURIComponent(book.category || '')}&brand=${encodeURIComponent(brandName)}`}
                    className="sb-modal-btn secondary"
                    onClick={onClose}
                  >
                    관련 자재 찾기
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
