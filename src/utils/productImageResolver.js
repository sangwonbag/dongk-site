import { getUniqueProductImages } from './galleryNormalizer.js';
import { imageManifest as mappedImageManifest } from '../data/imageManifest.js';
import { imageManifest as generatedImageManifest } from '../data/materialImageManifest.generated.js';

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

  // Already an absolute local path (e.g. /images/...)
  if (str.startsWith('/')) {
    return str;
  }

  // Relative Supabase storage path (e.g. materials/decotile/kcc/123.jpg or decotile/kcc/123.jpg)
  const cleanPath = str.replace(/^materials\//, '');
  return `${SUPABASE_PUBLIC_URL_PREFIX}${cleanPath}`;
}

const normalizeCode = (code) => {
  if (!code) return '';
  return String(code).replace(/[^a-zA-Z0-9가-힣]/g, '').toUpperCase();
};

/**
 * Returns an ordered list of candidate image URLs for any product object.
 * Candidate priority:
 * 1. Mapped hash entry in imageManifest.js (Supabase Storage URL)
 * 2. Direct DB image fields (image_url, thumbnail_url, main_image_url, etc.)
 * 3. Generated manifest lookup in materialImageManifest.generated.js
 * 4. Default placeholder
 */
export function getProductImageCandidates(product) {
  if (!product) return ['/images/no-image.svg'];

  const candidates = [];

  const code = product.code || product.product_code || product.name || '';
  const cleanCode = normalizeCode(code);
  const cleanName = normalizeCode(product.name);
  const cleanSlug = normalizeCode(product.slug);

  // 1. Mapped Manifest Hash (imageManifest.js) - Highest Priority for verified storage assets
  const lookupKeys = [code, cleanCode, product.name, cleanName, product.slug, cleanSlug].filter(Boolean);
  for (const k of lookupKeys) {
    const entry = mappedImageManifest[k];
    if (entry) {
      const hashes = Array.isArray(entry) ? entry : [entry.thumbnail || entry.images?.[0] || entry.cover];
      for (const hash of hashes) {
        if (hash && typeof hash === 'string') {
          const fullUrl = hash.startsWith('http') ? hash : `${SUPABASE_PUBLIC_URL_PREFIX}${hash.replace(/^materials\//, '')}`;
          if (!candidates.includes(fullUrl)) candidates.push(fullUrl);
        }
      }
    }
  }

  // 2. Direct DB fields
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
  ].filter(Boolean);

  for (const candidate of dbFields) {
    const candidateStr = String(candidate).trim();
    if (candidateStr && !candidateStr.includes('no-image.svg') && !candidateStr.includes('placeholder')) {
      const normalized = normalizeProductImageUrl(candidateStr);
      if (normalized !== '/images/no-image.svg' && !candidates.includes(normalized)) {
        candidates.push(normalized);
      }
    }
  }

  // 3. Generated manifest lookup (materialImageManifest.generated.js)
  if (cleanCode || cleanName) {
    const genMatch = generatedImageManifest.find(img => {
      const imgCode = normalizeCode(img.extractedCode);
      if (cleanCode && imgCode === cleanCode) return true;
      if (cleanName && img.fileName) {
        const cleanFileName = normalizeCode(img.fileName.slice(0, img.fileName.lastIndexOf('.')));
        return cleanFileName === cleanName || cleanFileName.includes(cleanName);
      }
      return false;
    });

    if (genMatch && genMatch.fullPublicPath) {
      const normalized = normalizeProductImageUrl(genMatch.fullPublicPath);
      if (normalized !== '/images/no-image.svg' && !candidates.includes(normalized)) {
        candidates.push(normalized);
      }
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

