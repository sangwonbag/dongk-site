import React, { useState, useEffect } from "react";
import { PdfUnavailable } from "../ui";
import { safeEncodeURI } from "../../utils/samplebookResolver";
import "./SampleBookViewer.css";

export default function SampleBookViewer({ book, onClose }) {
  const [pageIndex, setPageIndex] = useState(0);

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

  const isPdfMode = Boolean(book.pdf && !book.openInNewTab);
  const pdfUrl = isPdfMode ? safeEncodeURI(book.pdf) : "";
  const images = book.pages || [];
  const hasImages = images.length > 0;

  const handleNext = () => {
    setPageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setPageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleOpenNewTab = () => {
    if (book.pdf) {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownload = () => {
    if (book.pdf) {
      const a = document.createElement("a");
      a.href = pdfUrl;
      a.download = `${book.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="sb-viewer-overlay" onClick={onClose}>
      <div className="sb-viewer-content" onClick={(e) => e.stopPropagation()}>
        {/* Top Header Bar */}
        <div className="sb-viewer-header">
          <div className="sb-viewer-header-info">
            <span className="sb-viewer-brand">{book.brand}</span>
            <h3 className="sb-viewer-title">{book.title}</h3>
          </div>
          <div className="sb-viewer-header-actions">
            {isPdfMode && (
              <>
                <button className="sb-action-btn" onClick={handleOpenNewTab} title="새 창에서 열기">
                  <span>새 창 열기</span> ↗
                </button>
                <button className="sb-action-btn secondary" onClick={handleDownload} title="PDF 다운로드">
                  <span>다운로드</span> 📥
                </button>
              </>
            )}
            <button className="sb-close-btn" onClick={onClose} aria-label="닫기">
              ✕
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="sb-viewer-body">
          {isPdfMode ? (
            <div className="sb-pdf-container">
              <iframe
                src={`${pdfUrl}#view=FitH`}
                title={book.title}
                width="100%"
                height="100%"
                style={{ border: "none", display: "block" }}
              />
            </div>
          ) : hasImages ? (
            <div className="sb-slider-container">
              <div className="sb-slide">
                <img src={safeEncodeURI(images[pageIndex])} alt={`${pageIndex + 1}페이지`} />
              </div>

              {images.length > 1 && (
                <>
                  <button className="sb-nav-btn prev" onClick={handlePrev}>‹</button>
                  <button className="sb-nav-btn next" onClick={handleNext}>›</button>
                  <div className="sb-indicators">
                    {images.map((_, i) => (
                      <span
                        key={i}
                        className={`sb-dot ${i === pageIndex ? "active" : ""}`}
                        onClick={() => setPageIndex(i)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="sb-empty-state">
              <PdfUnavailable 
                title="미리보기 준비 중" 
                message="해당 샘플북의 온라인 카탈로그/미리보기가 준비되지 않았습니다. 동경바닥재 고객센터로 문의주시면 실물 샘플북 상담을 도와드립니다." 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

