import React, { useState, useEffect } from "react";
import Skeleton from "./Skeleton";
import "./ProductImage.css";

export default function ProductImage({ src, alt, className = "", style = {}, fit = "contain" }) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Check if src is empty or invalid
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
  }, [src]);

  const invalid = isInvalidSrc(src);

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
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.25s ease-in-out",
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
