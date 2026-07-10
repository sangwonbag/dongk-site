import imageHashManifest from "../generated/imageManifest.json";

export function normalizeImagePath(value) {
  if (!value || typeof value !== 'string') return '';

  let src = value.trim();

  try {
    src = decodeURIComponent(src);
  } catch {
    // 디코딩 실패 시 원본 문자열 사용
  }

  src = src
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/')
    .split('?')[0]
    .split('#')[0];

  try {
    const parsed = new URL(src, window.location.origin);
    if (src.includes('supabase.co') && src.includes('/materials/')) {
      const parts = src.split('/materials/');
      src = parts[parts.length - 1];
    } else {
      src = parsed.pathname;
    }
  } catch {
    // 상대 경로면 기존 값 사용
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
    ''
  );
}

export function getUniqueProductImages(images) {
  const seenPaths = new Set();
  const seenHashes = new Set();

  return images.filter((image) => {
    const src = getImageSrc(image);
    const normalizedPath = normalizeImagePath(src);

    if (!normalizedPath) return false;

    // Look up in manifest keys (which contains both full local path and supabase hash filename)
    const manifestEntry =
      imageHashManifest[normalizedPath] ||
      imageHashManifest[`/${normalizedPath}`] ||
      imageHashManifest[normalizedPath.toLowerCase()] ||
      imageHashManifest[`/${normalizedPath.toLowerCase()}`];

    const hash = manifestEntry?.hash || '';

    if (seenPaths.has(normalizedPath)) {
      return false;
    }

    if (hash && seenHashes.has(hash)) {
      return false;
    }

    seenPaths.add(normalizedPath);

    if (hash) {
      seenHashes.add(hash);
    }

    return true;
  });
}
