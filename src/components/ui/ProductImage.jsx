import React, { useState, useEffect, useMemo } from "react";
import "./ProductImage.css";

const isInvalidSrc = (val) => {
  if (val === undefined || val === null) return true;
  if (Array.isArray(val)) return val.length === 0;
  if (typeof val === "string") {
    const trimmed = val.trim();
    return (
      trimmed === "" ||
      trimmed === "/images/no-image.svg" ||
      trimmed === "/images/deco_tile.png" ||
      trimmed === "null" ||
      trimmed === "undefined"
    );
  }
  return false;
};

export default function ProductImage({
  src,
  candidates = null,
  alt,
  className = "",
  style = {},
  fit = "contain",
  priority = false
}) {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Build ordered list of candidate URLs
  const urlsList = useMemo(() => {
    const list = [];
    if (typeof src === "string" && src.trim() && !isInvalidSrc(src)) {
      list.push(src.trim());
    } else if (Array.isArray(src)) {
      src.forEach(item => {
        if (item && typeof item === "string" && !isInvalidSrc(item)) {
          const trimmed = item.trim();
          if (!list.includes(trimmed)) list.push(trimmed);
        }
      });
    }

    if (Array.isArray(candidates) && candidates.length > 0) {
      candidates.forEach(item => {
        if (item && typeof item === "string" && !isInvalidSrc(item)) {
          const trimmed = item.trim();
          if (!list.includes(trimmed)) list.push(trimmed);
        }
      });
    }

    return list;
  }, [src, candidates]);

  useEffect(() => {
    setCandidateIndex(0);
    setHasError(false);
  }, [src, candidates]);

  const currentSrc = urlsList[candidateIndex] || null;

  const handleImgError = () => {
    if (candidateIndex + 1 < urlsList.length) {
      setCandidateIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };

  const isInvalid = !currentSrc || isInvalidSrc(currentSrc);

  return (
    <div
      className="product-image-container"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...style
      }}
    >
      {isInvalid || hasError ? (
        <div
          className="product-image-fallback-container"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%"
          }}
        >
          <div className="product-image-placeholder">
            이미지 준비중
          </div>
        </div>
      ) : (
        <div
          className="product-image-wrapper"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            overflow: "hidden",
            backgroundColor: "#f8fafc"
          }}
        >
          <img
            key={currentSrc}
            src={currentSrc}
            alt={alt || "상품 이미지"}
            className={className}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            onError={handleImgError}
            style={{
              width: "100%",
              height: "100%",
              objectFit: fit,
              objectPosition: "center",
              padding: fit === "contain" ? "4px" : "0",
              boxSizing: "border-box",
              display: "block"
            }}
          />
        </div>
      )}
    </div>
  );
}

