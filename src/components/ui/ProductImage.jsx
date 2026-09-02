import React, { useState, useEffect } from "react";
import "./ProductImage.css";

export default function ProductImage({ src, alt, className = "", style = {}, fit = "contain" }) {
  const [hasError, setHasError] = useState(false);

  // Clean URI encoded paths safely
  const cleanSrc = (() => {
    if (!src || typeof src !== "string") return src;
    let str = src.trim();
    try {
      while (str.includes('%')) {
        const prev = str;
        str = decodeURIComponent(str);
        if (str === prev) break;
      }
    } catch (e) {}
    return str;
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
  }, [cleanSrc]);

  const invalid = isInvalidSrc(cleanSrc);

  return (
    <div className="product-image-container" style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", ...style }}>
      {invalid || hasError ? (
        <div className="product-image-fallback-container" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          <div className="product-image-placeholder">
            이미지 준비중
          </div>
        </div>
      ) : (
        <div className="product-image-wrapper" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden", backgroundColor: "#f8fafc" }}>
          <img
            src={cleanSrc}
            alt={alt || "상품 이미지"}
            className={className}
            loading="lazy"
            decoding="async"
            onError={() => setHasError(true)}
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
