import React, { memo, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin, Package } from 'lucide-react';
import { fetchPublishedCases } from '../../utils/constructionCasesService';
import { getCaseImageUrl } from '../../utils/caseImageUtils';
import { getConstructionCaseMatch } from '../../utils/constructionCaseMatcher';
import { formatCaseTitle } from '../../utils/caseTitleUtils';
import './ConstructionCaseExamples.css';

export { isCaseForMaterial } from '../../utils/constructionCaseMatcher';

function getCasePhotos(item) {
  const urls = [item.main_image_url, ...(Array.isArray(item.image_urls) ? item.image_urls : [])];
  return [...new Set(urls.filter((value) => typeof value === 'string' && value.trim()))];
}

function CaseImage({ source, alt, size = '800', eager = false }) {
  const [url, setUrl] = useState(() => getCaseImageUrl(source, size) || source);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setUrl(getCaseImageUrl(source, size) || source);
    setAttempt(0);
  }, [source, size]);

  return (
    <img
      src={url}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => {
        if (attempt === 0 && url !== source) {
          setAttempt(1);
          setUrl(source);
        } else if (attempt < 2) {
          setAttempt(2);
          setUrl('/images/no-image.svg');
        }
      }}
    />
  );
}

function CasePhotoCard({ caseItem, matchType }) {
  const photos = useMemo(() => getCasePhotos(caseItem), [caseItem]);
  const destination = '/cases?id=' + encodeURIComponent(caseItem.id);
  const displayTitle = useMemo(() => formatCaseTitle(caseItem), [caseItem]);

  return (
    <article className="real-case-card">
      <Link to={destination} className="real-case-main-photo" aria-label={displayTitle + ' 전체 시공 사진 보기'}>
        <CaseImage source={photos[0]} alt={displayTitle + ' 실제 시공 사진'} />
        <span className="real-case-photo-label">실제 시공 현장</span>
        {photos.length > 1 && <span className="real-case-photo-count">사진 {photos.length}장</span>}
      </Link>
      <div className="real-case-info">
        {caseItem.category && <span className="real-case-category">{caseItem.category}</span>}
        <h3><Link to={destination}>{displayTitle}</Link></h3>
        {caseItem.description && <p className="real-case-description">{caseItem.description}</p>}

        {photos.length > 1 && (
          <div className="real-case-gallery" aria-label={displayTitle + ' 현장 사진 미리보기'}>
            {photos.slice(0, 3).map((photo, index) => (
              <Link
                key={photo}
                to={destination}
                className="real-case-thumb"
                aria-label={displayTitle + ' 시공사례 전체 사진 보기'}
              >
                <CaseImage source={photo} size="400" alt={displayTitle + ' 사진 ' + (index + 1)} />
                {index === 2 && photos.length > 3 &&
                  <span className="real-case-more-photos">+{photos.length - 3}장</span>}
              </Link>
            ))}
          </div>
        )}

        <dl className="real-case-specs">
          {caseItem.location && (
            <div><dt><MapPin size={14} aria-hidden="true" />시공 지역</dt><dd>{caseItem.location}</dd></div>
          )}
          {caseItem.material_summary && (
            <div><dt><Package size={14} aria-hidden="true" />사용 자재</dt><dd>{caseItem.material_summary}</dd></div>
          )}
        </dl>

        <Link to={destination} className="real-case-action">
          시공사례 전체 보기 <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
        {matchType === 'number' &&
          <span className="real-case-match-note">제조사·자재번호 기준 연결</span>}
      </div>
    </article>
  );
}

/**
 * All published cases are compared against the current product. Each card
 * reuses the original case's pictures, title, text, location, material spec
 * and date; no copies are stored on the products table.
 */
function ConstructionCaseExamples({ material, fallback = null }) {
  const [publishedCases, setPublishedCases] = useState([]);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPublishedCases()
      .then((cases) => {
        if (!cancelled) setPublishedCases(Array.isArray(cases) ? cases : []);
      })
      .catch((error) => console.warn('[ConstructionCaseExamples] Could not load cases', error))
      .finally(() => {
        if (!cancelled) setResolved(true);
      });
    return () => { cancelled = true; };
  }, []);

  const matchingCases = useMemo(() => {
    if (!material) return [];
    return publishedCases
      .map((caseItem) => ({ caseItem, matchType: getConstructionCaseMatch(caseItem, material) }))
      .filter(({ caseItem, matchType }) => matchType && getCasePhotos(caseItem).length > 0);
  }, [publishedCases, material]);

  if (!resolved) return null;
  if (!matchingCases.length) return fallback;

  return (
    <section className="detail-doc-section real-case-examples" aria-label="이 자재의 실제 시공사례">
      <h2 className="doc-section-title">이 자재가 적용된 실제 시공사례</h2>
      <div className="doc-accent-bar"></div>
      <p className="doc-section-helper">
        시공사례에 등록된 실제 현장 사진과 정보를 자재번호에 맞춰 연결했습니다.
        사진 또는 현장명을 선택하면 전체 시공사례를 확인할 수 있습니다.
      </p>
      <div className="real-case-grid">
        {matchingCases.map(({ caseItem, matchType }) => (
          <CasePhotoCard
            key={caseItem.id || caseItem.slug}
            caseItem={caseItem}
            matchType={matchType}
          />
        ))}
      </div>
    </section>
  );
}

export default memo(ConstructionCaseExamples);
