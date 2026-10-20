import { getUniqueProductImages } from './galleryNormalizer.js';

import { imageManifest as syncGeneratedManifest } from '../data/materialImageManifest.generated.js';

let mappedImageManifestCache = null;
let generatedImageManifestCache = syncGeneratedManifest;
let manifestPromise = null;

let generatedManifestCodeIndex = null;
let generatedManifestNameIndex = null;

export function getGeneratedManifestIndices() {
  if (generatedManifestCodeIndex && generatedManifestNameIndex) {
    return { codeIndex: generatedManifestCodeIndex, nameIndex: generatedManifestNameIndex };
  }
  generatedManifestCodeIndex = new Map();
  generatedManifestNameIndex = new Map();

  const manifest = generatedImageManifestCache;
  if (Array.isArray(manifest)) {
    for (let i = 0; i < manifest.length; i++) {
      const img = manifest[i];
      if (img.extractedCode) {
        const cKey = normalizeCode(img.extractedCode);
        if (cKey) {
          const isSceneOrExtra = /(?:사무실|시공|거실|침실|카페|매장|office|scene|_\d+$)/i.test(img.fileName || '');
          const existing = generatedManifestCodeIndex.get(cKey);
          if (!existing) {
            generatedManifestCodeIndex.set(cKey, img);
          } else if (/(?:사무실|시공|거실|침실|카페|매장|office|scene|_\d+$)/i.test(existing.fileName || '') && !isSceneOrExtra) {
            // Replace scene image with actual product swatch image as primary
            generatedManifestCodeIndex.set(cKey, img);
          }
        }
      }
      if (img.fileName) {
        const lastDot = img.fileName.lastIndexOf('.');
        const namePart = lastDot !== -1 ? img.fileName.slice(0, lastDot) : img.fileName;
        const nKey = normalizeCode(namePart);
        if (nKey && !generatedManifestNameIndex.has(nKey)) {
          generatedManifestNameIndex.set(nKey, img);
        }
      }
    }
  }
  return { codeIndex: generatedManifestCodeIndex, nameIndex: generatedManifestNameIndex };
}

export function prefetchProductImage(url) {
  if (!url || typeof url !== 'string' || url === '/images/no-image.svg') return;
  try {
    const img = new Image();
    img.src = url;
  } catch {
    // ignore
  }
}

/**
 * Lazy loads image manifests only when a product lacks a valid direct DB image URL.
 */
export async function ensureManifestsLoaded() {
  if (mappedImageManifestCache && generatedImageManifestCache) {
    return { mapped: mappedImageManifestCache, generated: generatedImageManifestCache };
  }
  if (!manifestPromise) {
    manifestPromise = Promise.all([
      import('../data/imageManifest.js').then(m => m.imageManifest || {}).catch(() => ({})),
      Promise.resolve(syncGeneratedManifest)
    ]).then(([mapped, generated]) => {
      mappedImageManifestCache = mapped;
      generatedImageManifestCache = generated;
      return { mapped, generated };
    });
  }
  return manifestPromise;
}

const SUPABASE_PUBLIC_URL_PREFIX = "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/";

/**
 * Safely normalizes any input image URL string.
 * Handles URI decoding, double slashes, Supabase storage URLs, and local relative paths.
 */
export function normalizeProductImageUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '/images/no-image.svg';

  let str = rawUrl.trim();
  if (!str || str === 'null' || str === 'undefined' || str === '/images/no-image.svg' || str === '/images/deco_tile.png') {
    return '/images/no-image.svg';
  }

  // Already a full HTTP/HTTPS URL
  if (str.startsWith('http://') || str.startsWith('https://')) {
    return str;
  }

  // Local static relative paths under /images/ (e.g. /images/Thumbnail_Image/...)
  if (str.startsWith('/images/')) {
    return str;
  }

  if (str.startsWith('Thumbnail_Image/')) {
    return `/${str}`;
  }

  // Supabase Storage paths
  if (str.startsWith('materials/')) {
    const cleanPath = str.replace(/^materials\//, '');
    return `${SUPABASE_PUBLIC_URL_PREFIX}${cleanPath}`;
  }

  // Local/relative paths starting with /
  if (str.startsWith('/')) {
    return str;
  }

  return `/${str}`;
}

export function cleanProductCode(rawCode) {
  if (!rawCode) return '';
  return String(rawCode)
    .replace(/\s*\(\d+(\.\d+)?T\)/gi, '')
    .replace(/\s*\|\s*/g, ' ')
    .trim();
}

export function normalizeCode(code) {
  if (!code) return '';
  return String(code).replace(/[^a-zA-Z0-9가-힣]/g, '').toUpperCase();
}

export function getKccLineup(product) {
  if (!product) return 'unknown';
  const rawCode = product.code || product.product_code || '';
  const rawName = product.name || product.product_name || '';
  const rawLine = product.line || product.family || product.subLine || '';
  const code = String(rawCode).trim().toUpperCase();
  const name = String(rawName).trim();
  const line = String(rawLine).trim();

  if (code.startsWith('B') || name.startsWith('KCC 센스레이') || line === '센스레이' || line === 'SenseRay') {
    return 'sensray';
  }
  if (name.startsWith('KCC 센스타일 프로') || line === '센스타일 프로' || code.startsWith('GW') || code.startsWith('GS') || /^\d{5}[PMCMG]$/.test(code)) {
    return 'sensestyle-pro';
  }
  if (name.startsWith('KCC 센스타일 트랜디') || line === '센스타일 트랜디' || /^T[SWN]/i.test(code)) {
    return 'sensestyle-trendy';
  }
  if (name.includes('센스레이')) return 'sensray';
  if (name.includes('프로')) return 'sensestyle-pro';
  if (name.includes('트랜디') || name.includes('트렌디')) return 'sensestyle-trendy';

  return 'unknown';
}

/**
 * Returns an ordered list of candidate image URLs for any product object.
 * Candidate priority:
 * 1. Direct DB image fields (image_url, thumbnail_url, main_image_url, etc.)
 * 2. Mapped hash entry in imageManifest.js (Supabase Storage URL)
 * 3. Generated manifest lookup in materialImageManifest.generated.js
 * 4. Sibling code matchers (e.g. 5.0T Sense Lay <-> 3.0T Sense Tile)
 * 5. Default placeholder
 */
export function getProductImageCandidates(product) {
  if (!product) return ['/images/no-image.svg'];

  const candidates = [];

  const rawCode = product.code || product.product_code || '';
  const rawName = product.name || '';
  const cleanedCode = cleanProductCode(rawCode);
  const cleanedName = cleanProductCode(rawName);

  const codeNorm = normalizeCode(cleanedCode);
  const nameNorm = normalizeCode(cleanedName);

  const lineup = getKccLineup(product);

  const addCandidate = (url) => {
    if (!url) return;
    const norm = normalizeProductImageUrl(url);
    if (!norm || norm === '/images/no-image.svg' || candidates.includes(norm)) return;

    // Strict lineup boundary checks to prevent cross-lineup image bleed
    if (lineup === 'sensray') {
      if (norm.includes('/KCC_pro/') || norm.includes('KCC_pro') || norm.includes('센스타일') || norm.includes('TS55') || norm.includes('KCC_square')) {
        return;
      }
    } else if (lineup === 'sensestyle-pro') {
      if (norm.includes('/센스레이/') || norm.includes('sensray')) {
        return;
      }
    } else if (lineup === 'sensestyle-trendy') {
      if (norm.includes('/센스레이/') || norm.includes('sensray')) {
        return;
      }
    }

    candidates.push(norm);
  };

  // 1. Direct DB fields (Highest Priority for server data accuracy)
  const dbFields = [
    product.image_url,
    product.thumbnail_url,
    product.main_image_url,
    product.image,
    product.imageUrl,
    product.imagePath,
    product.thumbnail,
    product.product_image,
    Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null,
    Array.isArray(product.galleryImages) && product.galleryImages.length > 0 ? product.galleryImages[0] : null,
    Array.isArray(product.detailImages) && product.detailImages.length > 0 ? product.detailImages[0] : null
  ];

  for (const field of dbFields) {
    if (field) addCandidate(String(field));
  }

  // Early return if product already has direct, valid DB images (drastically reduces CPU & loop overhead)
  if (candidates.length > 0) {
    return candidates;
  }

  // Trigger background manifest loading if not already cached
  const mappedManifest = mappedImageManifestCache;
  const generatedManifest = generatedImageManifestCache;
  if (!mappedManifest || !generatedManifest) {
    ensureManifestsLoaded().catch(() => {});
  }

  // 2. Mapped Manifest Hash (imageManifest.js) if loaded
  if (mappedManifest) {
    const lookupKeys = [
      rawCode, cleanedCode, codeNorm,
      rawName, cleanedName, nameNorm,
      product.slug, normalizeCode(product.slug)
    ].filter(Boolean);

    for (const k of lookupKeys) {
      const entry = mappedManifest[k];
      if (entry) {
        const hashes = Array.isArray(entry) ? entry : [entry.thumbnail || entry.images?.[0] || entry.cover];
        for (const hash of hashes) {
          if (hash && typeof hash === 'string') {
            const fullUrl = hash.startsWith('http') ? hash : `${SUPABASE_PUBLIC_URL_PREFIX}${hash.replace(/^materials\//, '')}`;
            addCandidate(fullUrl);
          }
        }
      }
    }
  }

  // If candidate found in mappedManifest, return early
  if (candidates.length > 0) {
    return candidates;
  }

  // 3. Fast Indexed Generated manifest lookup (materialImageManifest.generated.js)
  if (generatedManifest && (codeNorm || nameNorm)) {
    const indices = getGeneratedManifestIndices();
    let genMatch = null;

    if (codeNorm) {
      genMatch = indices.codeIndex.get(codeNorm);
    }
    if (!genMatch && nameNorm) {
      genMatch = indices.nameIndex.get(nameNorm);
    }

    if (genMatch && genMatch.fullPublicPath) {
      addCandidate(genMatch.fullPublicPath);
    }
  }

  if (candidates.length === 0) {
    candidates.push('/images/no-image.svg');
  }

  return candidates;
}

/**
 * Unified resolver for obtaining the primary display image URL for any product object.
 */
export function getProductImageUrl(product) {
  const candidates = getProductImageCandidates(product);
  return candidates[0] || '/images/no-image.svg';
}

/**
 * Classifies an image URL into one of four types:
 * - 'original': 기본 원장 자재 이미지 (단품 타일)
 * - 'pattern2x2': 2x2 패턴 연결 이미지
 * - 'installation': 실제 공간 시공 이미지 (사무실, 상업공간, 거실, 주거, 매장 등)
 * - 'other': 교차 시공, 90도/180도 크로스, 회전 등 기타 이미지
 */
export function classifyProductImage(url, productCode = '') {
  if (!url || typeof url !== 'string') return 'other';
  const decoded = decodeURIComponent(url.split('?')[0]);
  const fileName = decoded.split('/').pop() || '';
  const lower = fileName.toLowerCase();

  // 1. 2x2 패턴 이미지 (pattern2x2)
  if (
    lower.includes('2x2') ||
    lower.includes('2_2') ||
    lower.includes('2×2') ||
    lower.includes('pattern') ||
    lower.includes('패턴')
  ) {
    return 'pattern2x2';
  }

  // 2. 시공 이미지 (installation)
  if (
    lower.includes('시공') ||
    lower.includes('사무실') ||
    lower.includes('상업공간') ||
    lower.includes('거실') ||
    lower.includes('주거') ||
    lower.includes('매장') ||
    lower.includes('현장') ||
    lower.includes('office') ||
    lower.includes('commercial') ||
    lower.includes('installation') ||
    lower.includes('interior') ||
    lower.includes('scene')
  ) {
    return 'installation';
  }

  // 3. 기타 패턴/교차/회전 이미지 (other)
  if (
    lower.includes('cross') ||
    lower.includes('크로스') ||
    lower.includes('90') ||
    lower.includes('180') ||
    lower.includes('회전') ||
    /_([2-9])\.(jpe?g|png|webp|avif)$/i.test(fileName)
  ) {
    return 'other';
  }

  // 4. 원장 이미지 (original)
  return 'original';
}

/**
 * Sorts an array of product image URLs strictly by image type:
 * 1) original (원장) -> 2) pattern2x2 (2x2) -> 3) installation (시공) -> 4) other (기타)
 * Also removes true duplicate files (e.g. Code_1.png when Code.png exists).
 */
export function sortProductImagesByType(images, productCode = '') {
  if (!Array.isArray(images) || images.length === 0) return [];

  const rankMap = {
    original: 1,
    pattern2x2: 2,
    installation: 3,
    other: 4
  };

  const seenPaths = new Set();
  const deduped = [];

  const cleanCode = String(productCode || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  for (const src of images) {
    if (!src || typeof src !== 'string') continue;
    const clean = src.split('?')[0].trim();
    if (!clean || clean.includes('no-image.svg') || clean.includes('deco_tile.png') || clean.includes('material-placeholder.jpg')) {
      continue;
    }

    if (seenPaths.has(clean)) continue;

    // Remove duplicate original filenames (e.g. Code_1.png when Code.png exists)
    const fileName = decodeURIComponent(clean.split('/').pop() || '');
    if (cleanCode) {
      if (fileName.toUpperCase() === `${cleanCode}_1.PNG` && seenPaths.has(clean.replace('_1.png', '.png'))) {
        continue;
      }
      if (fileName.toUpperCase() === `${cleanCode}.PNG` && seenPaths.has(clean.replace('.png', '_1.png'))) {
        const oldIdx = deduped.findIndex(x => x.includes(`${cleanCode}_1.png`));
        if (oldIdx !== -1) {
          deduped[oldIdx] = clean;
          seenPaths.add(clean);
          continue;
        }
      }
    }

    seenPaths.add(clean);
    deduped.push(clean);
  }

  return deduped.sort((a, b) => {
    const typeA = classifyProductImage(a, productCode);
    const typeB = classifyProductImage(b, productCode);
    const rankA = rankMap[typeA] || 99;
    const rankB = rankMap[typeB] || 99;

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    // Sub-sort for 'other' (e.g. 90cross / _2 before 180cross / _3)
    if (typeA === 'other') {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const aSub = (aLower.includes('90') || aLower.includes('_2.')) ? 1 : (aLower.includes('180') || aLower.includes('_3.')) ? 2 : 3;
      const bSub = (bLower.includes('90') || bLower.includes('_2.')) ? 1 : (bLower.includes('180') || bLower.includes('_3.')) ? 2 : 3;
      if (aSub !== bSub) return aSub - bSub;
    }

    return 0;
  });
}

/**
 * Resolves all available images (main + gallery) for a product object.
 * Strictly sorted by: original (원장) -> pattern2x2 (2x2) -> installation (시공) -> other (기타)
 */
export function getAllProductImages(product) {
  if (!product) return [];

  const candidates = getProductImageCandidates(product);

  const arrayFields = [product.images, product.galleryImages, product.detailImages, product.installationImages];
  for (const arr of arrayFields) {
    if (Array.isArray(arr)) {
      arr.forEach(item => {
        if (item) {
          const normalized = normalizeProductImageUrl(item);
          if (normalized !== '/images/no-image.svg' && !candidates.includes(normalized)) {
            candidates.push(normalized);
          }
        }
      });
    }
  }

  // Also collect all matching images from generated manifest for this product code
  const rawCode = product.code || product.product_code || product.productCode || product.name || '';
  const cKey = normalizeCode(rawCode);
  const baseCode = cKey.replace(/[^A-Z0-9]/g, '');

  if (Array.isArray(generatedImageManifestCache) && baseCode) {
    for (let i = 0; i < generatedImageManifestCache.length; i++) {
      const img = generatedImageManifestCache[i];
      if (img.extractedCode && img.fullPublicPath) {
        const imgKey = normalizeCode(img.extractedCode);
        const match = imgKey === cKey || 
          (baseCode.length >= 4 && (imgKey.startsWith(baseCode) || baseCode.startsWith(imgKey)));
        if (match) {
          const norm = normalizeProductImageUrl(img.fullPublicPath);
          if (norm !== '/images/no-image.svg' && !candidates.includes(norm)) {
            candidates.push(norm);
          }
        }
      }
    }
  }

  // Deduplicate and sort by image type: original -> pattern2x2 -> installation -> other
  return sortProductImagesByType(candidates, rawCode);
}



