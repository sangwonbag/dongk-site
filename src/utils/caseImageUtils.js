/**
 * Image optimization utilities for Construction Cases (시공사례).
 * Eliminates massive 50MB raw camera payload and enables blazing fast loading.
 */

/**
 * Returns optimized WebP image URL based on target usage size.
 * @param {string} rawUrl - Original image URL
 * @param {'400'|'800'|'1600'|'thumb'|'main'|'preview'|'original'} size
 * @returns {string} Optimized URL
 */
export function getCaseImageUrl(rawUrl, size = '800') {
  if (!rawUrl || typeof rawUrl !== 'string') return '/images/no-image.svg';

  // Decode URI first to handle encoded Korean paths
  let cleanUrl = rawUrl;
  try {
    cleanUrl = decodeURIComponent(rawUrl);
  } catch {
    // keep as is
  }

  // 1. Local /images/시공사례/ path
  const caseMatch = cleanUrl.match(/\/images\/시공사례\/(.+?)\/([^/]+?)\.(jpe?g|png|webp)$/i);
  if (caseMatch) {
    let [, folderName, baseName] = caseMatch;
    // Normalize legacy 4-digit year folder names (e.g. 2025.07.14 -> 25.07.14, 2026.11.11 -> 26.11.11)
    folderName = folderName.replace(/^20(2[56]\.)/, '$1');

    let variant = 'thumb-800';
    if (size === '400' || size === 'thumb') variant = 'thumb-400';
    else if (size === '1600' || size === 'preview') variant = 'preview-1600';
    else if (size === 'original') return rawUrl;

    return `/images/시공사례_optimized/${variant}/${encodeURIComponent(folderName)}/${encodeURIComponent(baseName)}.webp`;
  }

  // 2. Supabase Storage transform support (if uploaded via Supabase bucket)
  if (cleanUrl.includes('/storage/v1/object/public/')) {
    if (size === 'original') return cleanUrl;
    const width = (size === '400' || size === 'thumb') ? 400 : (size === '1600' || size === 'preview') ? 1600 : 800;
    // Replace object/public with render/image/public for on-the-fly transformation if enabled
    const transformed = cleanUrl.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    return `${transformed}?width=${width}&quality=80&format=origin`;
  }

  return rawUrl;
}

/**
 * Returns responsive srcSet string for case main images.
 * @param {string} rawUrl
 * @returns {string}
 */
export function getCaseImageSrcSet(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const url400 = getCaseImageUrl(rawUrl, '400');
  const url800 = getCaseImageUrl(rawUrl, '800');
  const url1600 = getCaseImageUrl(rawUrl, '1600');

  if (url400 === rawUrl) return ''; // fallback to standard src
  return `${url400} 400w, ${url800} 800w, ${url1600} 1600w`;
}

