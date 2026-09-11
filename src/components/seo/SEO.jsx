import React, { useEffect } from "react";

/**
 * SEO Component for managing page-level Meta tags, OpenGraph, Twitter Cards, Canonical URL, Robots, and JSON-LD structured data.
 * React 19 automatically hoists <title>, <meta>, <link>, and <script> tags to document <head>.
 * useEffect provides a client-side DOM sync fallback for seamless SPA route updates.
 */
export default function SEO({
  title = "DK Floor | 동경바닥재",
  description = "동경바닥재 - 데코타일, 마루, 장판, 벽지 등 프리미엄 바닥재 전문 브랜드. KCC, LX, 동신 등 전 브랜드 유통.",
  canonical = "https://dkfloor.co.kr/",
  ogImage = "https://dkfloor.co.kr/dk-apple-touch-icon-transparent.png",
  ogType = "website",
  noindex = false,
  jsonLd = null,
}) {
  const fullTitle = title.includes("동경바닥재") ? title : `${title} | 동경바닥재`;
  const robotsText = noindex ? "noindex, nofollow" : "index, follow";

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Document title
    document.title = fullTitle;

    // Helper to create or update head meta
    const setMeta = (selector, attr, attrVal, content) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Helper for link tags
    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // Sync meta tags
    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[name="robots"]', "name", "robots", robotsText);
    setMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:url"]', "property", "og:url", canonical);
    setMeta('meta[property="og:image"]', "property", "og:image", ogImage);
    setMeta('meta[property="og:type"]', "property", "og:type", ogType);
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", "동경바닥재");
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", ogImage);

    // Canonical link
    if (canonical) {
      setLink("canonical", canonical);
    }

    // JSON-LD Script tag
    let scriptEl = document.querySelector('script[data-seo="json-ld"]');
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement("script");
        scriptEl.setAttribute("type", "application/ld+json");
        scriptEl.setAttribute("data-seo", "json-ld");
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [fullTitle, description, canonical, ogImage, ogType, robotsText, jsonLd]);

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsText} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="동경바닥재" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          data-seo="json-ld"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  );
}
