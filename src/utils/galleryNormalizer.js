import imageHashManifest from "../generated/imageManifest.json" with { type: "json" };

/**
 * Clean path to extract canonical relative path, stripping domains, protocols, query strings,
 * and common image root directory prefixes (e.g. /images/Thumbnail_Image/materials/ or Supabase storage prefix).
 */
export function getCanonicalPath(value) {
  if (!value || typeof value !== 'string') return '';

  let src = value.trim();

  try {
    src = decodeURIComponent(src);
  } catch {
    // Keep raw string if decode fails
  }

  // Remove query, hash, backslashes
  src = src
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/')
    .split('?')[0]
    .split('#')[0];

  try {
    if (src.includes('supabase.co') && src.includes('/materials/')) {
      src = src.split('/materials/').pop();
    } else {
      const parsed = new URL(src, window.location.origin);
      src = parsed.pathname;
    }
  } catch {
    // Relative path
  }

  let cleaned = src
    .replace(/^\/+/, '')
    .replace(/\/+/g, '/')
    .toLowerCase();

  // Strip common root prefixes so Supabase URLs and local static paths map to identical relative keys
  cleaned = cleaned
    .replace(/^images\/thumbnail_image\/materials\//, '')
    .replace(/^images\/thumbnail_image\//, '')
    .replace(/^images\/cover\/materials\//, '')
    .replace(/^images\/cover\//, '')
    .replace(/^images\/materials\//, '')
    .replace(/^images\//, '')
    .replace(/^materials\//, '');

  return cleaned;
}

export function normalizeImagePath(value) {
  if (!value || typeof value !== 'string') return '';

  let src = value.trim();

  try {
    src = decodeURIComponent(src);
  } catch {
    // ignore
  }

  src = src
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/')
    .split('?')[0]
    .split('#')[0];

  try {
    if (src.includes('supabase.co') && src.includes('/materials/')) {
      const parts = src.split('/materials/');
      src = parts[parts.length - 1];
    } else {
      const parsed = new URL(src, window.location.origin);
      src = parsed.pathname;
    }
  } catch {
    // ignore
  }

  return src
    .replace(/^\/+/, '')
    .replace(/\/+/g, '/')
    .toLowerCase();
}

export function getImageSrc(image) {
  if (!image) return '';

  if (typeof image === 'string') {
    return image;
  }

  return (
    image.src ||
    image.url ||
    image.image ||
    image.path ||
    image.file ||
    image.detail ||
    image.thumbnail ||
    ''
  );
}

function getFilename(pathStr) {
  if (!pathStr || typeof pathStr !== 'string') return '';
  const lastSlash = pathStr.lastIndexOf('/');
  const name = lastSlash !== -1 ? pathStr.slice(lastSlash + 1) : pathStr;
  return name.trim().toLowerCase();
}

function isProductSpecificFilename(filename) {
  if (!filename) return false;
  const f = filename.toLowerCase();
  if (
    f.includes('no-image.svg') ||
    f.includes('deco_tile.png') ||
    f.includes('material-placeholder.jpg') ||
    f.includes('placeholder')
  ) {
    return false;
  }
  return true;
}

export function getUniqueProductImages(images) {
  if (!Array.isArray(images)) return [];

  const seenPaths = new Set();
  const seenHashes = new Set();
  const seenFilenames = new Set();

  return images.filter((image) => {
    const src = getImageSrc(image);
    if (!src || typeof src !== 'string') return false;

    const norm = src.trim().toLowerCase();
    if (
      norm.includes('no-image.svg') ||
      norm.includes('deco_tile.png') ||
      norm.includes('material-placeholder.jpg')
    ) {
      return false;
    }

    const rawNormalized = normalizeImagePath(src);
    const canonicalPath = getCanonicalPath(src);
    const filename = getFilename(canonicalPath || rawNormalized);

    // Look up SHA-256 hash in imageHashManifest
    let hash = '';
    const lookupKeys = [
      src,
      rawNormalized,
      '/' + rawNormalized,
      canonicalPath,
      '/' + canonicalPath,
      'materials/' + canonicalPath,
      '/materials/' + canonicalPath,
      'images/thumbnail_image/' + canonicalPath,
      '/images/thumbnail_image/' + canonicalPath,
      'images/thumbnail_image/materials/' + canonicalPath,
      '/images/thumbnail_image/materials/' + canonicalPath,
      filename
    ];

    for (const k of lookupKeys) {
      if (k && imageHashManifest[k]?.hash) {
        hash = imageHashManifest[k].hash;
        break;
      }
    }

    // 1. Check content hash (if available)
    if (hash && seenHashes.has(hash)) {
      return false;
    }

    // 2. Check canonical relative path
    if (canonicalPath && seenPaths.has(canonicalPath)) {
      return false;
    }

    // 3. Check raw normalized path
    if (rawNormalized && seenPaths.has(rawNormalized)) {
      return false;
    }

    // 4. Check product-specific filename
    if (filename && isProductSpecificFilename(filename) && seenFilenames.has(filename)) {
      return false;
    }

    // Record as seen
    if (canonicalPath) seenPaths.add(canonicalPath);
    if (rawNormalized) seenPaths.add(rawNormalized);
    if (hash) seenHashes.add(hash);
    if (filename && isProductSpecificFilename(filename)) seenFilenames.add(filename);

    return true;
  });
}
