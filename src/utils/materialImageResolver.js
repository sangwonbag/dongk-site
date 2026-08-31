import { imageManifest } from '../data/materialImageManifest.generated.js';
import { imageManifest as imageManifestMap } from '../data/imageManifest.js';
import { getUniqueProductImages } from './galleryNormalizer.js';

const SUPABASE_PUBLIC_URL_PREFIX = "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/";

// Helper to clean paths and convert to full URL
function toFullImageUrl(path) {
  if (!path) return '';
  let str = String(path).trim();
  try {
    if (str.includes('%')) {
      str = decodeURIComponent(str);
    }
  } catch (e) {}

  if (str.startsWith('http')) return str;
  if (str.startsWith('/')) return str;
  return SUPABASE_PUBLIC_URL_PREFIX + str;
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

// Helper to determine if brands align (e.g. "LX" and "LX하우시스" or "동신" and "동신포리마")
function brandsMatch(b1, b2) {
  if (!b1 || !b2) return false;
  const norm1 = normalizeMaterialCode(b1);
  const norm2 = normalizeMaterialCode(b2);
  return norm1.includes(norm2) || norm2.includes(norm1);
}

// Helper to determine if categories align (e.g. "데코타일" and "데코타일")
function categoriesMatch(c1, c2) {
  if (!c1 || !c2) return false;
  return normalizeMaterialCode(c1) === normalizeMaterialCode(c2);
}

// Helper to extract design name inside parentheses
function extractDesignName(name) {
  if (!name) return '';
  const match = name.match(/\(([^)]+)\)/);
  if (match) return match[1].trim();
  return '';
}

export function resolveMaterialImage(material) {
  const matBrand = material?.brand || '';
  const matName = material?.name || '';
  const matCode = material?.code || '';
  const matCategory = material?.category || '';
  
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

  // 1st Priority: If product data has an existing non-empty image/thumbnail URL in DB
  const dbFields = [
    material.image_url,
    material.thumbnail_url,
    material.main_image_url,
    material.image,
    material.imageUrl,
    material.imagePath,
    material.thumbnail
  ].filter(Boolean);

  for (const field of dbFields) {
    const fieldStr = String(field).trim();
    if (fieldStr && !fieldStr.includes('no-image.svg') && !fieldStr.includes('placeholder')) {
      return {
        src: toFullImageUrl(fieldStr),
        alt: altText,
        isPlaceholder: false,
        isRepresentativeImage: false,
        matchReason: 'db-url'
      };
    }
  }

  // Filter manifest by brand and category to restrict matching domain and prevent mismatch collisions
  const scopedImages = imageManifest.filter(img => 
    brandsMatch(img.brand, matBrand) && categoriesMatch(img.category, matCategory)
  );

  // 2nd Priority: Match exact code (case insensitive, trimmed) in manifest
  const normTargetCode = normalizeMaterialCode(matCode);
  if (normTargetCode) {
    const matchedByCode = scopedImages.find(img => 
      normalizeMaterialCode(img.extractedCode) === normTargetCode
    );
    if (matchedByCode) {
      return {
        src: matchedByCode.fullPublicPath,
        alt: altText,
        isPlaceholder: false,
        isRepresentativeImage: false,
        matchReason: 'exact-code'
      };
    }
  }

  // 3rd Priority: Match exact name in manifest
  if (matName) {
    const normTargetName = normalizeMaterialCode(matName);
    if (normTargetName) {
      const matchedByName = scopedImages.find(img => {
        const cleanFileName = normalizeMaterialCode(img.fileName.slice(0, img.fileName.lastIndexOf('.')));
        return cleanFileName === normTargetName || cleanFileName.includes(normTargetName) || normTargetName.includes(cleanFileName);
      });
      if (matchedByName) {
        return {
          src: matchedByName.fullPublicPath,
          alt: altText,
          isPlaceholder: false,
          isRepresentativeImage: false,
          matchReason: 'exact-name'
        };
      }
    }
  }

  // 4th Priority: Fallback to placeholder image (representative fallback disabled per strict matching request)

  // 5th Priority: Fallback to placeholder image
  return {
    src: '/images/no-image.svg',
    alt: `${altText} 이미지 준비중`,
    isPlaceholder: true,
    isRepresentativeImage: false,
    matchReason: 'missing'
  };
}

export function getMaterialImagePath(material) {
  const result = resolveMaterialImage(material);
  return result.src || '/images/no-image.svg';
}

export function resolveProductImages(material) {
  if (!material) return [];

  const candidates = [];
  const matBrand = material.brand || '';
  const matName = material.name || '';
  const matCode = material.code || '';
  const matCategory = material.category || '';

  // 1. Direct database fields
  const dbFields = [
    material.image_url,
    material.thumbnail_url,
    material.main_image_url,
    material.image,
    material.imageUrl,
    material.imagePath,
    material.thumbnail,
    material.thumbnailImage,
    material.mainImage
  ].filter(Boolean);

  for (const field of dbFields) {
    const fieldStr = String(field).trim();
    if (fieldStr && !fieldStr.includes('no-image.svg') && !fieldStr.includes('placeholder')) {
      candidates.push(toFullImageUrl(fieldStr));
    }
  }

  // 2. Lookup in imageManifestMap (code-to-images map from src/data/imageManifest.js)
  const normTargetCode = normalizeMaterialCode(matCode);
  const normTargetName = normalizeMaterialCode(matName);
  
  const lookupKeys = [normTargetCode, normTargetName].filter(Boolean);
  for (const key of lookupKeys) {
    const entry = imageManifestMap[key];
    if (entry) {
      if (Array.isArray(entry)) {
        candidates.push(...entry.map(toFullImageUrl));
      } else if (entry.images) {
        candidates.push(...entry.images.map(toFullImageUrl));
      } else if (entry.thumbnail) {
        candidates.push(toFullImageUrl(entry.thumbnail));
      } else if (entry.cover) {
        candidates.push(toFullImageUrl(entry.cover));
      }
    }
  }

  // 3. Search in raw file manifest (materialImageManifest.generated.js)
  // Check exact code match in the generated manifest list
  if (normTargetCode) {
    const scopedImages = imageManifest.filter(img => 
      brandsMatch(img.brand, matBrand) && categoriesMatch(img.category, matCategory)
    );
    const matchedByCode = scopedImages.find(img => 
      normalizeMaterialCode(img.extractedCode) === normTargetCode
    );
    if (matchedByCode && matchedByCode.fullPublicPath) {
      candidates.push(toFullImageUrl(matchedByCode.fullPublicPath));
    }
  }

  // 4. Object array fields
  if (Array.isArray(material.images)) {
    candidates.push(...material.images.map(toFullImageUrl));
  }
  if (Array.isArray(material.galleryImages)) {
    candidates.push(...material.galleryImages.map(toFullImageUrl));
  }
  if (Array.isArray(material.detailImages)) {
    candidates.push(...material.detailImages.map(toFullImageUrl));
  }
  if (Array.isArray(material.installationImages)) {
    candidates.push(...material.installationImages.map(toFullImageUrl));
  }

  // Deduplicate and filter out placeholders
  return getUniqueProductImages(candidates);
}

export function resolveProductCardImage(material) {
  const images = resolveProductImages(material);
  
  if (images.length > 0) {
    return images[0];
  }
  
  // Fallback to local image resolving logic
  const localPath = getMaterialImagePath(material);
  if (localPath && localPath !== '/images/no-image.svg') {
    return localPath;
  }
  
  return '/images/no-image.svg';
}

