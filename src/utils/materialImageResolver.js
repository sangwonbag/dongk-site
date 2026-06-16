import { imageManifest } from '../data/materialImageManifest.generated.js';

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

export function resolveMaterialImage(material) {
  if (!material) return '/images/no-image.svg';

  // 1st Priority: If product data has an existing non-empty image/thumbnail URL:
  const fields = [
    material.image,
    material.imageUrl,
    material.imagePath,
    material.thumbnail
  ].filter(Boolean);

  for (const field of fields) {
    const fieldStr = String(field);
    if (fieldStr.startsWith('http')) {
      return fieldStr;
    }
    
    // Check if the path exists in the generated manifest
    const normalizedField = decodeURIComponent(fieldStr).replace(/\\/g, '/').replace(/^\/?/, '/');
    const matchedByPath = imageManifest.find(img => {
      const decodedManifestPath = decodeURIComponent(img.fullPublicPath).replace(/^\/?/, '/');
      return decodedManifestPath === normalizedField;
    });
    
    if (matchedByPath) {
      return matchedByPath.fullPublicPath;
    }
  }

  const matBrand = material.brand || '';
  const matCategory = material.category || '';

  // Filter manifest by brand and category to restrict matching domain and prevent mismatch collisions
  const scopedImages = imageManifest.filter(img => 
    brandsMatch(img.brand, matBrand) && categoriesMatch(img.category, matCategory)
  );

  // 2nd Priority: Match exact code (case insensitive, trimmed)
  if (material.code) {
    const targetCode = String(material.code).trim().toUpperCase();
    const matchedByCode = scopedImages.find(img => 
      img.extractedCode && img.extractedCode.toUpperCase() === targetCode
    );
    if (matchedByCode) {
      return matchedByCode.fullPublicPath;
    }
  }

  // 3rd Priority: Match normalized code (ignoring whitespace and special characters)
  if (material.code) {
    const normCode = normalizeMaterialCode(material.code);
    if (normCode) {
      const matchedByNormCode = scopedImages.find(img => 
        normalizeMaterialCode(img.extractedCode) === normCode
      );
      if (matchedByNormCode) {
        return matchedByNormCode.fullPublicPath;
      }
    }
  }

  // 4th Priority: Match normalized name keyword (fuzzy matching)
  if (material.name || material.code) {
    const normName = normalizeMaterialCode(material.name || material.code);
    if (normName) {
      // Find files where filename contains normalized product name/code or vice versa
      const matchedByName = scopedImages.find(img => 
        img.normalizedFileName && 
        (img.normalizedFileName.includes(normName) || normName.includes(img.normalizedFileName))
      );
      if (matchedByName) {
        return matchedByName.fullPublicPath;
      }
    }
  }

  // 5th Priority: Fallback to placeholder image
  return '/images/no-image.svg';
}

export function getMaterialImagePath(material) {
  return resolveMaterialImage(material);
}
