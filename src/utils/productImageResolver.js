import { imageManifest } from '../data/materialImageManifest.generated.js';
import { imageManifest as imageManifestMap } from '../data/imageManifest.js';
import { getUniqueProductImages } from './galleryNormalizer.js';

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

  // Handle URI encoded Korean characters safely
  try {
    while (str.includes('%')) {
      const prev = str;
      str = decodeURIComponent(str);
      if (str === prev) break;
    }
  } catch (e) {
    // Keep original string if decoding fails
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

/**
 * Unified resolver for obtaining the primary display image URL for any product object.
 * Inspects all DB field variants (image_url, thumbnail_url, image, imageUrl, etc.)
 * and fallbacks to manifest code/name lookup.
 */
export function getProductImageUrl(product) {
  if (!product) return '/images/no-image.svg';

  // 1. Check all direct database field candidates
  const dbCandidates = [
    product.image_url,
    product.thumbnail_url,
    product.main_image_url,
    product.image,
    product.imageUrl,
    product.imagePath,
    product.thumbnail,
    product.thumbnailUrl,
    product.product_image,
    Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null,
    Array.isArray(product.galleryImages) && product.galleryImages.length > 0 ? product.galleryImages[0] : null,
    Array.isArray(product.detailImages) && product.detailImages.length > 0 ? product.detailImages[0] : null
  ].filter(Boolean);

  for (const candidate of dbCandidates) {
    const candidateStr = String(candidate).trim();
    if (candidateStr && !candidateStr.includes('no-image.svg') && !candidateStr.includes('placeholder')) {
      const normalized = normalizeProductImageUrl(candidateStr);
      if (normalized !== '/images/no-image.svg') {
        return normalized;
      }
    }
  }

  // 2. Manifest Lookup Fallback by Code & Name
  const brand = product.brand || product.brands?.name || '';
  const category = product.category || product.categories?.name || '';
  const code = product.code || product.product_code || '';
  const name = product.name || '';

  const cleanCode = code ? String(code).replace(/[^a-zA-Z0-9가-힣]/g, '').toUpperCase() : '';
  const cleanName = name ? String(name).replace(/[^a-zA-Z0-9가-힣]/g, '').toUpperCase() : '';

  // Lookup in static imageManifestMap (imageManifest.js)
  if (cleanCode && imageManifestMap[cleanCode]) {
    const entry = imageManifestMap[cleanCode];
    const rawMatch = Array.isArray(entry) ? entry[0] : (entry.images?.[0] || entry.thumbnail || entry.cover);
    if (rawMatch) return normalizeProductImageUrl(rawMatch);
  }

  // Lookup in generated manifest (materialImageManifest.generated.js)
  if (imageManifest && imageManifest.length > 0) {
    const matched = imageManifest.find(img => {
      const imgCode = img.extractedCode ? String(img.extractedCode).replace(/[^a-zA-Z0-9가-힣]/g, '').toUpperCase() : '';
      if (cleanCode && imgCode === cleanCode) return true;
      if (cleanName && img.fileName) {
        const cleanFileName = String(img.fileName).replace(/[^a-zA-Z0-9가-힣]/g, '').toUpperCase();
        return cleanFileName.includes(cleanName) || cleanName.includes(cleanFileName);
      }
      return false;
    });

    if (matched && matched.fullPublicPath) {
      return normalizeProductImageUrl(matched.fullPublicPath);
    }
  }

  return '/images/no-image.svg';
}

/**
 * Resolves all available images (main + gallery) for a product object.
 */
export function getAllProductImages(product) {
  if (!product) return [];

  const candidates = [];

  // Direct main image
  const main = getProductImageUrl(product);
  if (main && main !== '/images/no-image.svg') {
    candidates.push(main);
  }

  // Additional gallery arrays
  const arrayFields = [product.images, product.galleryImages, product.detailImages, product.installationImages];
  for (const arr of arrayFields) {
    if (Array.isArray(arr)) {
      arr.forEach(item => {
        if (item) candidates.push(normalizeProductImageUrl(item));
      });
    }
  }

  return getUniqueProductImages(candidates);
}
