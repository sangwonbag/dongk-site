import { getUniqueProductImages } from './galleryNormalizer.js';

let mappedImageManifestCache = null;
let generatedImageManifestCache = null;
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
      import('../data/materialImageManifest.generated.js').then(m => m.imageManifest || []).catch(() => ([]))
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

  // Supabase Storage paths embedded with /images/ prefix (e.g. /images/Thumbnail_Image/... or /images/materials/...)
  if (str.startsWith('/images/Thumbnail_Image/') || str.startsWith('/images/materials/')) {
    const cleanPath = str.replace(/^\/images\//, '');
    return `${SUPABASE_PUBLIC_URL_PREFIX}${cleanPath}`;
  }

  if (str.startsWith('Thumbnail_Image/') || str.startsWith('materials/')) {
    const cleanPath = str.replace(/^materials\//, '');
    return `${SUPABASE_PUBLIC_URL_PREFIX}${cleanPath}`;
  }

  // Local/relative paths
  if (str.startsWith('/')) {
    if (str.includes('Thumbnail_Image') || str.includes('데코타일') || str.includes('장판') || str.includes('마루') || str.includes('벽지') || str.includes('KCC')) {
      const cleanPath = str.replace(/^\/images\//, '').replace(/^\//, '');
      return `${SUPABASE_PUBLIC_URL_PREFIX}${cleanPath}`;
    }
    return str;
  }

  const cleanPath = str.replace(/^materials\//, '');
  return `${SUPABASE_PUBLIC_URL_PREFIX}${cleanPath}`;
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
  const cleanedCode = cleanProductCode(rawCode);
  const cleanedName = cleanProductCode(rawName);

  const codeNorm = normalizeCode(cleanedCode);
  const nameNorm = normalizeCode(cleanedName);

  const addCandidate = (url) => {
    if (!url) return;
    const norm = normalizeProductImageUrl(url);
    if (norm && norm !== '/images/no-image.svg' && !candidates.includes(norm)) {
      candidates.push(norm);
    }
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

  // 3. Generated manifest lookup (materialImageManifest.generated.js) if loaded
  if (generatedManifest && (codeNorm || nameNorm)) {
    const genMatch = generatedManifest.find(img => {
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

  // 4. Code / Name sibling fallback attempt (e.g., B3192J <-> 33192P, B3183J <-> 33183P)
  if (mappedManifest && codeNorm.startsWith('B') && codeNorm.endsWith('J')) {
    const siblingCode = '3' + codeNorm.slice(1, -1) + 'P';
    const siblingEntry = mappedManifest[siblingCode];
    if (siblingEntry) {
      const hashes = Array.isArray(siblingEntry) ? siblingEntry : [siblingEntry.thumbnail || siblingEntry.images?.[0]];
      for (const hash of hashes) {
        if (hash) addCandidate(hash.startsWith('http') ? hash : `${SUPABASE_PUBLIC_URL_PREFIX}${hash.replace(/^materials\//, '')}`);
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


