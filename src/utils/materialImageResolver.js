import { getUniqueProductImages } from './galleryNormalizer.js';
import { getProductImageUrl, getAllProductImages, getProductImageCandidates, normalizeProductImageUrl } from './productImageResolver.js';

// Helper to clean paths and convert to full URL
function toFullImageUrl(path) {
  return normalizeProductImageUrl(path);
}

// Normalize codes and texts by stripping spaces, special chars, and capitalizing
export function normalizeMaterialCode(code) {
  if (!code) return '';
  return String(code).replace(/[^a-zA-Z0-9가-힣]/g, '').toUpperCase();
}

// Extract product codes from filename
export function extractCodeFromFileName(fileName) {
  if (!fileName) return '';
  
  // Strip extension
  const lastDot = fileName.lastIndexOf('.');
  const nameWithoutExt = lastDot !== -1 ? fileName.slice(0, lastDot).trim() : fileName.trim();
  
  // Remove common image suffix markers: _0, _1, (2) etc.
  let cleanName = nameWithoutExt.replace(/_(\d+)$/, '').replace(/\s*\(\d+\)$/, '').trim();
  
  // 1. Matches patterns like: [Letters 2-5] + [spaces?] + [Numbers 3-5] + [Letters?]
  const codeRegex = /\b([A-Z]{2,5})\s*(\d{3,5}(?:-\d+)?)([A-Z]*)\b/i;
  const match = cleanName.match(codeRegex);
  if (match) {
    return match[0].trim();
  }
  
  // 2. Numeric starting codes (e.g. 90013-1, 25097-1)
  const numericRegex = /^(\d{3,6}(?:-\d+)?)/;
  const numMatch = cleanName.match(numericRegex);
  if (numMatch) {
    return numMatch[1];
  }

  // 3. Loose whitespace pattern
  const looseMatch = cleanName.match(/([A-Z0-9]{2,6})\s+(\d{3,5})/i);
  if (looseMatch) {
    return looseMatch[0].trim();
  }

  return cleanName;
}

export function resolveMaterialImage(material) {
  const matBrand = material?.brand || '';
  const matName = material?.name || '';
  const matCode = material?.code || '';
  const altText = `${matBrand} ${matName} ${matCode}`.trim();

  if (!material) {
    return {
      src: '/images/no-image.svg',
      alt: '자재 이미지 준비중',
      isPlaceholder: true,
      isRepresentativeImage: false,
      matchReason: 'null-input'
    };
  }

  const src = getProductImageUrl(material);
  const isPlaceholder = !src || src === '/images/no-image.svg';

  return {
    src: src || '/images/no-image.svg',
    alt: isPlaceholder ? `${altText} 이미지 준비중` : altText,
    isPlaceholder,
    isRepresentativeImage: false,
    matchReason: isPlaceholder ? 'missing' : 'resolved'
  };
}

export function getMaterialImagePath(material) {
  const result = resolveMaterialImage(material);
  return result.src || '/images/no-image.svg';
}

export function resolveProductImages(material) {
  return getAllProductImages(material);
}

export function resolveProductCardImage(material) {
  return getProductImageUrl(material);
}


