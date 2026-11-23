import React, { useState, useEffect, useMemo } from "react";
import {
  ensureManifestsLoaded,
  getProductImageCandidates,
  isManifestLoaded,
  subscribeManifestLoaded
} from "../../utils/productImageResolver";
import "./ProductImage.css";

// Module-level cache of failed URLs to prevent infinite retries or duplicate broken network requests
const FAILED_IMAGE_URLS = new Set();

const isInvalidSrc = (val) => {
  if (val === undefined || val === null) return true;
  if (Array.isArray(val)) return val.length === 0;
  if (typeof val === "string") {
    const trimmed = val.trim();
    return (
      trimmed === "" ||
      trimmed === "/images/no-image.svg" ||
      trimmed === "/images/deco_tile.png" ||
      trimmed === "/images/placeholder-material.jpg" ||
      trimmed.endsWith("/.webp") ||
      trimmed === "null" ||
      trimmed === "undefined"
    );
  }
  return false;
};

export default function ProductImage({
  src,
  candidates = null,
  product = null,
  alt,
  className = "",
  style = {},
  fit = "contain",
  priority = false
}) {
  const [manifestVersion, setManifestVersion] = useState(() => (isManifestLoaded() ? 1 : 0));
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Subscribe once if manifest is not yet loaded
  useEffect(() => {
    if (isManifestLoaded()) return undefined;
    return subscribeManifestLoaded(() => {
      setManifestVersion((v) => v + 1);
    });
  }, []);

  // Build ordered list of candidate URLs, skipping already-known failed URLs
  const urlsList = useMemo(() => {
    const list = [];
    const pushUrl = (item) => {
      if (!item || typeof item !== "string" || isInvalidSrc(item)) return;
      const trimmed = item.trim();
      if (FAILED_IMAGE_URLS.has(trimmed)) return;
      if (!list.includes(trimmed)) list.push(trimmed);
    };

    if (typeof src === "string") {
      pushUrl(src);
    } else if (Array.isArray(src)) {
      src.forEach(pushUrl);
    }

    if (Array.isArray(candidates) && candidates.length > 0) {
      candidates.forEach(pushUrl);
    }

    if (product) {
      getProductImageCandidates(product).forEach(pushUrl);
    }

    // Prioritize verified HTTPS URLs ahead of legacy migrated /images/Thumbnail_Image/materials/ paths
    const httpsUrls = list.filter((u) => u.startsWith("http://") || u.startsWith("https://"));
    const otherUrls = list.filter((u) => !u.startsWith("http://") && !u.startsWith("https://"));
    return [...httpsUrls, ...otherUrls];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, candidates, product, manifestVersion]);

  const urlsKey = urlsList.join("|");

  // Lazily load imageManifest.js once if we only have a legacy local path or no valid URL yet
  useEffect(() => {
    if (isManifestLoaded()) return;
    const needsManifest =
      urlsList.length === 0 ||
      urlsList.every((u) => u.startsWith("/images/Thumbnail_Image/materials/"));
    if (needsManifest && product) {
      ensureManifestsLoaded();
    }
  }, [urlsKey, urlsList, product]);

  const currentSrc = urlsList[candidateIndex] || null;
  const isInvalid = !currentSrc || isInvalidSrc(currentSrc);

  const handleImgLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleImgError = () => {
    if (currentSrc) {
      FAILED_IMAGE_URLS.add(currentSrc);
    }
    if (!isManifestLoaded() && product) {
      ensureManifestsLoaded();
    }
    if (candidateIndex + 1 < urlsList.length) {
      setIsLoaded(false);
      setCandidateIndex((prev) => prev + 1);
    } else {
      setIsLoaded(true);
      setHasError(true);
    }
  };

  // Reset error/index only when the resolved URL list actually changes
  const [prevUrlsKey, setPrevUrlsKey] = useState(urlsKey);
  if (urlsKey !== prevUrlsKey) {
    setPrevUrlsKey(urlsKey);
    setCandidateIndex(0);
    setIsLoaded(false);
    setHasError(false);
  }

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
        <div className="product-image-fallback-container">
          <div className="product-image-placeholder">
            이미지 준비중
          </div>
        </div>
      ) : (
        <div className="product-image-wrapper">
          {!isLoaded && <div className="product-image-skeleton" aria-hidden="true" />}
          <img
            key={currentSrc}
            src={currentSrc}
            alt={alt || "상품 이미지"}
            className={`${className} ${isLoaded ? "is-loaded" : "is-loading"}`.trim()}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            onLoad={handleImgLoad}
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
