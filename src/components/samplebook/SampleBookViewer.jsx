import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { safeEncodeURI, getSampleBookTarget, openCatalogWindow, getAutoMatchedCover } from "../../utils/samplebookResolver";
import { getComputedBrand } from "../../utils/brandUtils";
import "./SampleBookViewer.css";

export default function SampleBookViewer({ book, onClose }) {
  // Body scroll lock & ESC key binding
  useEffect(() => {
    const origStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = origStyle;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

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
              {target.isVerified ? (
                <span className="sb-viewer-status-badge verified">공식 E-카탈로그 인증</span>
              ) : (
                <span className="sb-viewer-status-badge unverified">공식 카탈로그 확인 중</span>
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
                  <strong>제조사 공식 온라인 E-카탈로그</strong>
                </div>
                <p className="sb-notice-desc">
                  제조사({target.provider})에서 직접 제공하는 공식 웹 뷰어로 이동하여 고해상도 샘플북과 제품 스펙을 열람하실 수 있습니다.
                </p>
                <div className="sb-viewer-actions">
                  <button className="sb-modal-btn primary" onClick={handleOpenCatalog}>
                    공식 카탈로그 새 창 열기 ↗
                  </button>
                  <Link
                    to={`/materials?search=${encodeURIComponent(book.title)}`}
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
                  <a href="tel:010-3392-7440" className="sb-modal-btn gold">
                    📞 고객센터 문의 (010-3392-7440)
                  </a>
                  <Link
                    to={`/materials?search=${encodeURIComponent(book.title)}`}
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
