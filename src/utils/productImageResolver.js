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
          const imgType = img.imageType || classifyProductImage(img.fileName || '');
          const imgPriority = IMAGE_PRIORITY[imgType] !== undefined ? IMAGE_PRIORITY[imgType] : 99;
          const existing = generatedManifestCodeIndex.get(cKey);
          if (!existing) {
            generatedManifestCodeIndex.set(cKey, img);
          } else {
            const existingType = existing.imageType || classifyProductImage(existing.fileName || '');
            const existingPriority = IMAGE_PRIORITY[existingType] !== undefined ? IMAGE_PRIORITY[existingType] : 99;
            if (imgPriority < existingPriority) {
              // Lower number means higher priority (material swatch 0 > 2x2 1 > 90cross 2 > office 3)
              generatedManifestCodeIndex.set(cKey, img);
            }
          }
        }
      }
      if (img.fileName) {
        const lastDot = img.fileName.lastIndexOf('.');
        const namePart = lastDot !== -1 ? img.fileName.slice(0, lastDot) : img.fileName;
        const nKey = normalizeCode(namePart);
        if (nKey) {
          const imgType = img.imageType || classifyProductImage(img.fileName || '');
          const imgPriority = IMAGE_PRIORITY[imgType] !== undefined ? IMAGE_PRIORITY[imgType] : 99;
          const existing = generatedManifestNameIndex.get(nKey);
          if (!existing) {
            generatedManifestNameIndex.set(nKey, img);
          } else {
            const existingType = existing.imageType || classifyProductImage(existing.fileName || '');
            const existingPriority = IMAGE_PRIORITY[existingType] !== undefined ? IMAGE_PRIORITY[existingType] : 99;
            if (imgPriority < existingPriority) {
              generatedManifestNameIndex.set(nKey, img);
            }
          }
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
    if (!url || typeof url !== 'string') return;
    const norm = normalizeProductImageUrl(url);
    if (!norm || norm === '/images/no-image.svg' || norm.endsWith('/.webp')) return;
    
    const safeDecoded = (str) => {
      try { return decodeURI(str); } catch { return str; }
    };
    const normDecoded = safeDecoded(norm);
    if (candidates.some(c => safeDecoded(c) === normDecoded)) return;

    // Strict lineup boundary checks to prevent cross-lineup image bleed
    if (lineup === 'sensray') {
      if (norm.includes('B0122J') && !codeNorm.includes('B0122')) {
        return; // Prevent B0122J from being assigned to other SenseRay products
      }
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
    return sortProductImagesByType(candidates, rawCode);
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
    return sortProductImagesByType(candidates, rawCode);
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

  return sortProductImagesByType(candidates, rawCode);
}

/**
 * Unified resolver for obtaining the primary display image URL for any product object.
 */
export function getProductImageUrl(product) {
  const candidates = getProductImageCandidates(product);
  return candidates[0] || '/images/no-image.svg';
}

/**
 * Universal Image Priority for the whole Dongkyung Flooring site:
 * 1. material (자재 원본) -> 0
 * 2. 2x2 (2x2 패턴) -> 1
 * 3. 90cross (90cross 교차 배열) -> 2
 * 4. office (사무실 / 상업공간 / 시공 예시) -> 3
 * 5. other (기타 180cross / 보조 각도) -> 4
 */
export const IMAGE_PRIORITY = {
  material: 0,
  "2x2": 1,
  "90cross": 2,
  office: 3,
  other: 4
};

/**
 * Classifies an image URL strictly into one of the four unified types:
 * - 'material': 자재 원본 대표 스와치 이미지
 * - '2x2': 2행 2열 패턴 연결 이미지
 * - '90cross': 90도 교차 시공 배열 이미지
 * - 'office': 사무실 / 상업공간 / 현장 시공 예시
 * - 'other': 180도 회전 또는 기타 보조 컷
 */
export function classifyProductImage(url, productCode = '') {
  if (!url || typeof url !== 'string') return 'other';
  const decoded = decodeURIComponent(url.split('?')[0]);
  const fileName = decoded.split('/').pop() || '';
  const lower = fileName.toLowerCase();

  // 1. 2x2 패턴 이미지 (2x2 / 우드 타일 확장 패턴)
  if (
    lower.includes('2x2') ||
    lower.includes('2_2') ||
    lower.includes('2×2') ||
    lower.includes('확장') ||
    lower.includes('expanded')
  ) {
    return '2x2';
  }

  // 2. 90cross 교차 시공 이미지 (90cross)
  // Strict matching to prevent digits like DLX090 or DBT3090 from false-positive match
  if (
    lower.includes('90cross') ||
    lower.includes('_90cross') ||
    lower.includes('_cross') ||
    lower.includes('크로스') ||
    /(?:^|[_\-\s])90cross(?:[_\-\s.]|$)/i.test(fileName) ||
    /(?:^|[_\-\s])cross(?:[_\-\s.]|$)/i.test(fileName)
  ) {
    return '90cross';
  }

  // 3. 사무실 / 상업공간 / 시공 이미지 (office)
  if (
    lower.includes('사무실') ||
    lower.includes('상업공간') ||
    lower.includes('시공') ||
    lower.includes('시공예시') ||
    lower.includes('거실') ||
    lower.includes('침실') ||
    lower.includes('주거') ||
    lower.includes('매장') ||
    lower.includes('현장') ||
    lower.includes('office') ||
    lower.includes('commercial') ||
    lower.includes('installation') ||
    lower.includes('interior') ||
    lower.includes('scene') ||
    lower.includes('room')
  ) {
    return 'office';
  }

  // 4. 180cross / 회전 / 기타 번호 보조 컷 (other)
  if (
    lower.includes('180cross') ||
    lower.includes('회전') ||
    /_([2-9])\.(jpe?g|png|webp|avif)$/i.test(fileName)
  ) {
    return 'other';
  }

  // 5. 기본 자재 원본 (material)
  return 'material';
}

/**
 * Sorts an array of product image URLs strictly by the universal site order:
 * ① 자재 원본 (0) -> ② 2x2 (1) -> ③ 90cross (2) -> ④ 사무실 (3) -> ⑤ 기타 (4)
 * Also removes true duplicate files (e.g. Code_1.png when Code.png exists).
 */
export function sortProductImagesByType(images, productCode = '') {
  if (!Array.isArray(images) || images.length === 0) return [];

  const seenPaths = new Set();
  const deduped = [];

  const cleanCode = String(productCode || '').replace(/[^a-zA-Z0-9가-힣]/g, '').toUpperCase();

  for (const src of images) {
    if (!src || typeof src !== 'string') continue;
    const clean = src.split('?')[0].trim();
    if (!clean || clean.includes('no-image.svg') || clean.includes('deco_tile.png') || clean.includes('material-placeholder.jpg') || clean.endsWith('/.webp')) {
      continue;
    }

    const safeDecoded = (() => {
      try { return decodeURI(clean); } catch { return clean; }
    })();
    if (seenPaths.has(safeDecoded)) continue;

    // Remove duplicate original filenames (e.g. Code_1.png when Code.png exists)
    const fileName = decodeURIComponent(clean.split('/').pop() || '');
    if (cleanCode) {
      if (fileName.toUpperCase() === `${cleanCode}_1.PNG` && seenPaths.has(safeDecoded.replace('_1.png', '.png'))) {
        continue;
      }
      if (fileName.toUpperCase() === `${cleanCode}.PNG` && seenPaths.has(safeDecoded.replace('.png', '_1.png'))) {
        const oldIdx = deduped.findIndex(x => {
          try { return decodeURI(x).includes(`${cleanCode}_1.png`); } catch { return false; }
        });
        if (oldIdx !== -1) {
          deduped[oldIdx] = clean;
          seenPaths.add(safeDecoded);
          continue;
        }
      }
    }

    seenPaths.add(safeDecoded);
    deduped.push(clean);
  }

  return deduped.sort((a, b) => {
    const typeA = classifyProductImage(a, productCode);
    const typeB = classifyProductImage(b, productCode);
    const rankA = IMAGE_PRIORITY[typeA] !== undefined ? IMAGE_PRIORITY[typeA] : 99;
    const rankB = IMAGE_PRIORITY[typeB] !== undefined ? IMAGE_PRIORITY[typeB] : 99;

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    // Sub-sort for 'other' (e.g. 180cross before secondary angles)
    if (typeA === 'other') {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const aSub = aLower.includes('180') ? 1 : 2;
      const bSub = bLower.includes('180') ? 1 : 2;
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
          (baseCode.length >= 4 && (
            imgKey === baseCode || 
            (imgKey.startsWith(baseCode) && !/\d/.test(imgKey.slice(baseCode.length))) ||
            (baseCode.startsWith(imgKey) && !/\d/.test(baseCode.slice(imgKey.length)))
          ));
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



