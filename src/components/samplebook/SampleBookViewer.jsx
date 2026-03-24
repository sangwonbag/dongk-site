import React, { useState } from "react";
import "./SampleBookViewer.css";

export default function SampleBookViewer({ book, onClose }) {
  const [pageIndex, setPageIndex] = useState(0);

  // If book has a PDF and openInNewTab is FALSE, we show it in an iframe
  // If openInNewTab is TRUE, the parent component handles window.open
  const isPdfMode = book.pdf && !book.openInNewTab;

  // If not PDF, we assume image slider (pages array)
  const images = book.pages || [];
  const hasImages = images.length > 0;

  const handleNext = () => {
    setPageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setPageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="sb-viewer-overlay">
      <div className="sb-viewer-content">
        <button className="sb-close-btn" onClick={onClose}>
          ✕
        </button>

        {isPdfMode ? (
          <div className="sb-pdf-container">
            <iframe
              src={book.pdf + "#view=FitH"}
              title={book.title}
              width="100%"
              height="100%"
              style={{ border: "none", display: "block" }}
            />
          </div>
        ) : hasImages ? (
          <div className="sb-slider-container">
            <div className="sb-slide">
              <img src={images[pageIndex]} alt={`${pageIndex + 1}페이지`} />
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
            <p>이 샘플북은 미리보기 이미지가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
