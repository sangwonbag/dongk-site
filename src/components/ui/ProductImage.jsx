import React, { useState, useEffect, useRef } from "react";
import Skeleton from "./Skeleton";
import "./ProductImage.css";

export default function ProductImage({ src, alt, className = "", style = {}, fit = "contain" }) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  // Clean URI encoded paths safely
  const cleanSrc = (() => {
    if (!src || typeof src !== "string") return src;
    try {
      return decodeURIComponent(src);
    } catch (e) {
      return src;
    }
  })();

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

  useEffect(() => {
    setHasError(false);
    setLoaded(false);

    // If image is already cached and loaded by browser, mark as loaded
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [cleanSrc]);

  const invalid = isInvalidSrc(cleanSrc);

  if (invalid || hasError) {
    return (
      <div className="product-image-fallback-container" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", ...style }}>
        <div className="product-image-placeholder">
          이미지 준비 중입니다.
        </div>
      </div>
    );
  }

  return (
    <div className="product-image-wrapper" style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", backgroundColor: "#f8fafc", ...style }}>
      {!loaded && (
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1 }}>
          <Skeleton height="100%" radius="0" />
        </div>
      )}
      <img
        ref={imgRef}
        src={cleanSrc}
        alt={alt}
        className={className}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.2s ease-in-out",
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
  );
}
