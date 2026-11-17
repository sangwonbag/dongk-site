import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { fetchPublishedCases } from '../../utils/constructionCasesService';
import { getCaseImageUrl } from '../../utils/caseImageUtils';
import './ConstructionCaseExamples.css';

const normalizeCode = (value) =>
  String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

const normalizeBrand = (value) => {
  const text = String(value || '').toUpperCase();
  if (/KCC|케이씨씨/.test(text)) return 'KCC';
  if (/LX|LG|하우시스/.test(text)) return 'LX';
  if (/동신/.test(text)) return '동신';
  if (/재영/.test(text)) return '재영';
  if (/현대/.test(text)) return '현대';
  if (/녹수|NOX/.test(text)) return '녹수';
  if (/대진/.test(text)) return '대진';
  if (/우성/.test(text)) return '우성';
  if (/이건/.test(text)) return '이건';
  if (/동화/.test(text)) return '동화';
  if (/한솔/.test(text)) return '한솔';
  if (/유성/.test(text)) return '유성';
  return '';
};

const getMainPhoto = (caseItem) => {
  const gallery = Array.isArray(caseItem.image_urls) ? caseItem.image_urls : [];
  return [caseItem.main_image_url, ...gallery].find(
    (value) => typeof value === 'string' && value.trim().length > 0
  ) || '';
};

/**
 * Match actual case records, never generic product photos.
 * Prefer an explicit Supabase product FK/slug/SKU. Unlinked or multi-material
 * cases may match a bare numeric code only when the brand also matches.
 */
export function isCaseForMaterial(caseItem, material) {
  if (!caseItem || !material || caseItem.is_published === false || caseItem.is_active === false) {
    return false;
  }

  const product = caseItem.products || {};
  const materialId = material.product_id ||
    (/^\d+$/.test(String(material.id || '')) ? material.id : null);
  if (caseItem.product_id != null && materialId != null &&
      String(caseItem.product_id) === String(materialId)) {
    return true;
  }

  const materialSlug = String(material.slug || material.id || '').toLowerCase();
  if (product.slug && materialSlug && product.slug.toLowerCase() === materialSlug) {
    return true;
  }

  const sku = normalizeCode(material.code || material.product_code);
  const linkedSku = normalizeCode(product.product_code || product.code);
  if (sku && linkedSku && sku === linkedSku) {
    return true;
  }
  if (!sku) return false;

  const caseText = [caseItem.title, caseItem.material_summary, product.name]
    .filter(Boolean).join(' ');
  const materialBrand = normalizeBrand(material.brand);
  const caseBrand = normalizeBrand(caseText);
  // A bare number is ambiguous across manufacturers. Never cross-match brands.
  if (!materialBrand || caseBrand !== materialBrand) return false;

  const normalizedText = normalizeCode(caseText);
  if (sku.length >= 4 && normalizedText.includes(sku)) return true;

  const numericCode = sku.match(/\d{3,6}/)?.[0];
  if (!numericCode) return false;
  // Respect digit boundaries, e.g. 5541 must not accidentally match 15541.
  return new RegExp('(^|[^0-9])' + numericCode + '(?![0-9])').test(caseText.toUpperCase());
}

function CasePhoto({ caseItem }) {
  const originalPhoto = getMainPhoto(caseItem);
  const imageUrl = getCaseImageUrl(originalPhoto, '800') || originalPhoto;

  return (
    <Link
      className="real-case-card"
      to={'/cases?id=' + encodeURIComponent(caseItem.id)}
      aria-label={caseItem.title + ' 시공사례 전체 사진 보기'}
    >
      <div className="real-case-photo-wrap">
        <img
          src={imageUrl}
          alt={caseItem.title + ' 실제 시공 사진'}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            const image = event.currentTarget;
            if (image.dataset.caseFallback === 'raw') {
              image.dataset.caseFallback = 'missing';
              image.onerror = null;
              image.src = '/images/no-image.svg';
            } else {
              image.dataset.caseFallback = 'raw';
              image.src = originalPhoto;
            }
          }}
        />
        <span className="real-case-photo-label">실제 시공사례</span>
      </div>
      <div className="real-case-info">
        <h3>{caseItem.title}</h3>
        {caseItem.location && <p><MapPin size={13} aria-hidden="true" />{caseItem.location}</p>}
        <span className="real-case-action">시공 사진 전체 보기 <ArrowUpRight size={15} aria-hidden="true" /></span>
      </div>
    </Link>
  );
}

/**
 * Reuses the existing published-case cache. Loading is deferred until this
 * section mounts, so product photos and purchase controls stay responsive.
 * With no matching real case, the existing clearly labeled simulation remains.
 */
export default function ConstructionCaseExamples({ material, fallback = null }) {
  const [publishedCases, setPublishedCases] = useState([]);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPublishedCases()
      .then((cases) => {
        if (!cancelled) setPublishedCases(Array.isArray(cases) ? cases : []);
      })
      .catch((error) => console.warn('[ConstructionCaseExamples] Failed to load cases', error))
      .finally(() => {
        if (!cancelled) setResolved(true);
      });
    return () => { cancelled = true; };
  }, []);

  const matchingCases = useMemo(() => publishedCases
    .filter((caseItem) =>
      isCaseForMaterial(caseItem, material) && Boolean(getMainPhoto(caseItem)))
    .slice(0, 6), [publishedCases, material?.product_id, material?.id, material?.slug,
      material?.code, material?.product_code, material?.brand]);

  if (!resolved) return null;
  if (matchingCases.length === 0) return fallback;

  return (
    <section className="detail-doc-section real-case-examples" aria-label="실제 시공사례">
      <h2 className="doc-section-title">이 자재가 적용된 실제 시공사례</h2>
      <div className="doc-accent-bar"></div>
      <p className="doc-section-helper">등록된 시공 현장 사진입니다. 사진을 클릭하면 해당 시공사례의 전체 사진을 확인할 수 있습니다.</p>
      <div className="real-case-grid">
        {matchingCases.map((caseItem) =>
          <CasePhoto key={caseItem.id || caseItem.slug} caseItem={caseItem} />)}
      </div>
    </section>
  );
}
