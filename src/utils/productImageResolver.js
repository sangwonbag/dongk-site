import { getUniqueProductImages } from './galleryNormalizer.js';

import { imageManifest as syncGeneratedManifest } from '../data/materialImageManifest.generated.js';

let mappedImageManifestCache = null;
let generatedImageManifestCache = syncGeneratedManifest;
let manifestPromise = null;

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
  const brand = product.brand || '';
  const line = product.line || product.subLine || '';
  const cleanedCode = cleanProductCode(rawCode);
  const cleanedName = cleanProductCode(rawName);

  const codeNorm = normalizeCode(cleanedCode);
  const nameNorm = normalizeCode(cleanedName);
  const brandNorm = normalizeCode(brand);
  const lineNorm = normalizeCode(line);

  // Check if product is KCC SenseRay (센스레이)
  const isSenseRay = (brandNorm === 'KCC' || (!brandNorm && codeNorm.startsWith('B'))) &&
    (lineNorm.includes('센스레이') || nameNorm.includes('센스레이') || lineNorm.includes('SENSERAY') || nameNorm.includes('SENSERAY') || codeNorm.startsWith('B'));

  const addCandidate = (url) => {
    if (!url) return;
    const norm = normalizeProductImageUrl(url);
    if (!norm || norm === '/images/no-image.svg' || candidates.includes(norm)) return;

    // For SenseRay products: reject any non-existent /KCC_pro/ dummy paths or SenStyle image paths/codes
    if (isSenseRay) {
      if (norm.includes('/KCC_pro/') || norm.includes('KCC_pro') || norm.includes('센스타일') || norm.includes('TS55') || norm.includes('KCC_square')) {
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

  // 3. Generated manifest lookup (materialImageManifest.generated.js)
  if (generatedManifest && (codeNorm || nameNorm)) {
    const categoryNorm = normalizeCode(product.category);
    let genMatch = generatedManifest.find(img => {
      if (categoryNorm && normalizeCode(img.category) && normalizeCode(img.category) !== categoryNorm) return false;
      const imgCode = normalizeCode(img.extractedCode);
      if (codeNorm && imgCode === codeNorm) return true;
      if (nameNorm && img.fileName) {
        const cleanFileName = normalizeCode(img.fileName.slice(0, img.fileName.lastIndexOf('.')));
        return cleanFileName === nameNorm || cleanFileName.includes(nameNorm);
      }
      return false;
    });

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
 * Resolves all available images (main + gallery) for a product object.
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

  return getUniqueProductImages(candidates);
}


