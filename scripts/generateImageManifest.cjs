const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.resolve(process.cwd(), 'public/images/Thumbnail_Image/materials');
const OUTPUT_FILE = path.resolve(process.cwd(), 'src/data/materialImageManifest.generated.js');

console.log('Scanning images from:', SOURCE_DIR);

function collectFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file.toUpperCase().includes('MACOSX') || file.startsWith('._')) {
      return;
    }
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...collectFiles(fullPath));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext) && file !== 'desktop.ini') {
        results.push(fullPath);
      }
    }
  });
  return results;
}

// Normalize brand names using the same rules as the materials generator
function getNormalizedBrand(folderBrand, category) {
  if (category === '장판') {
    if (folderBrand.includes('현대')) return '현대';
    if (folderBrand.includes('KCC')) return 'KCC';
    return 'LX하우시스';
  }
  
  if (folderBrand.includes('KCC')) return 'KCC';
  if (folderBrand.includes('LX')) return 'LX';
  if (folderBrand.includes('녹수')) return '녹수';
  if (folderBrand.includes('대진')) return '대진';
  if (folderBrand.includes('동신')) return '동신';
  if (folderBrand.includes('유성')) return '유성';
  if (folderBrand.includes('재영')) return '재영';
  if (folderBrand.includes('현대')) return '현대';
  if (folderBrand.includes('구정')) return '구정';
  if (folderBrand.includes('동화')) return '동화';
  if (folderBrand.includes('이건')) return '이건';
  if (folderBrand.includes('개나리')) return '개나리';
  if (folderBrand.includes('디아이디')) return '디아이디';
  if (folderBrand.includes('서울')) return '서울';
  if (folderBrand.includes('신한')) return '신한';
  if (folderBrand.includes('제일')) return '제일';
  if (folderBrand.includes('스완')) return '스완';
  if (folderBrand.includes('코오롱')) return '코오롱';
  
  return folderBrand;
}

// Classify image role strictly according to universal site order:
// 1. material (자재 원본)
// 2. 2x2 (2x2 패턴)
// 3. 90cross (90cross 교차)
// 4. office (사무실 / 상업공간 / 시공)
// 5. other (180cross 등 기타 보조 컷)
function classifyProductImage(fileName) {
  const lower = fileName.toLowerCase();

  // 1. 2x2 패턴 및 우드 타일 확장 패턴
  if (
    lower.includes('2x2') ||
    lower.includes('2_2') ||
    lower.includes('2×2') ||
    lower.includes('확장') ||
    lower.includes('expanded')
  ) {
    return '2x2';
  }

  // 2. 90cross (strict matching to prevent DLX090 or DBT3090 from false-positive)
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

  // 3. 사무실 / 상업공간 / 시공
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

  // 4. 180cross / 회전 / 기타
  if (
    lower.includes('180cross') ||
    lower.includes('회전') ||
    /_([2-9])\.(jpe?g|png|webp|avif)$/i.test(fileName)
  ) {
    return 'other';
  }

  // 5. 자재 원본
  return 'material';
}

// Robust code extractor helper from filename
function extractCode(filename) {
  const ext = path.extname(filename);
  let cleanName = filename.slice(0, -ext.length).trim();
  
  // 1. Remove suffix indices, patterns, and descriptions (e.g. "_detail", "_thumbnail", "_사무실", "_시공", "_시공예시", "_확장", "_2x2", "_90cross")
  cleanName = cleanName
    .replace(/\.jpg_[0-9]+cross$/i, '')
    .replace(/_(?:thumbnail|detail)$/i, '')
    .replace(/_(?:사무실|시공|시공예시|상업공간|패턴|확장|거실|침실|카페|매장|office|scene|room|2x2|90cross|180cross)$/i, '')
    .replace(/_(\d+)$/, '')
    .replace(/\s*\(\d+\)$/, '')
    .trim();
  
  // 2. KCC Jangpan pattern: NK20-4121, NP18-3543, MN22-4151, MN27-4151, MN45-4121, MN50-4121
  const jangpanMatch = cleanName.match(/(?:^|[_\-\s])([A-Z]{2,4}\d{2}-\d{3,5})(?:[_\-\s]|$)/i);
  if (jangpanMatch) {
    return jangpanMatch[1].trim();
  }

  // 3. Try matching standard code patterns: [Letters 2-5] + [spaces?] + [Numbers 3-5] + [Letters?]
  // Support underscore boundaries like KCC_트랜디_TS5502P_사무실, GW1111G, GS1551M, B0122J
  const codeRegex = /(?:^|[_\s])([A-Z]{2,5}\s*\d{3,5}(?:-\d+)?[A-Z]*)(?:[_\s]|$)/i;
  const match = cleanName.match(codeRegex);
  if (match) {
    return match[1].trim();
  }

  const boundaryRegex = /\b([A-Z]{2,5})\s*(\d{3,5}(?:-\d+)?)([A-Z]*)\b/i;
  const bMatch = cleanName.match(boundaryRegex);
  if (bMatch) {
    return bMatch[0].trim();
  }
  
  // 4. Try matching numeric code patterns with letter suffix (e.g. 30082P, 30141M, 90013-1)
  const numericRegex = /^(\d{3,6}(?:-\d+)?[A-Z]*)/i;
  const numMatch = cleanName.match(numericRegex);
  if (numMatch) {
    return numMatch[1].trim();
  }

  // 5. Try matching other patterns like OA 317 or DLT 3300
  const looseMatch = cleanName.match(/([A-Z0-9]{2,6})\s+(\d{3,5})/i);
  if (looseMatch) {
    return looseMatch[0].trim();
  }

  return cleanName;
}

const allFiles = collectFiles(SOURCE_DIR);
console.log(`Found ${allFiles.length} local material image files.`);

const manifestData = allFiles.map(fullPath => {
  // Relative path from public directory: e.g. images/Thumbnail_Image/materials/데코타일/LX/LX하우스/HOT 0065 라임 스톤 미스트.jpg
  const relativeFromPublic = path.relative(path.resolve(process.cwd(), 'public'), fullPath).replace(/\\/g, '/');
  
  // Relative path from materials directory to extract category, brand, series
  const relativeFromMaterials = path.relative(SOURCE_DIR, fullPath).replace(/\\/g, '/');
  const parts = relativeFromMaterials.split('/');
  
  const category = parts[0] || '';
  const folderBrand = parts[1] || '';
  const brand = getNormalizedBrand(folderBrand, category);
  
  // Series is the folders between brand and the filename
  const series = parts.slice(2, parts.length - 1).join('/') || '';
  const fileName = parts[parts.length - 1];
  
  const extractedCode = extractCode(fileName);
  const normalizedFileName = fileName.replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase();
  const imageType = classifyProductImage(fileName);

  // Create a clean unencoded public path for browser loading
  let cleanPublicPath = '/' + relativeFromPublic.replace(/\\/g, '/');
  try {
    while (cleanPublicPath.includes('%')) {
      const prev = cleanPublicPath;
      cleanPublicPath = decodeURIComponent(cleanPublicPath);
      if (cleanPublicPath === prev) break;
    }
  } catch (e) {}

  return {
    fileName,
    fullPublicPath: cleanPublicPath,
    category,
    brand,
    series,
    extractedCode,
    normalizedFileName,
    imageType
  };
});

// Output manifest file as ESM
const outputContent = `// Auto-generated by scripts/generateImageManifest.cjs - DO NOT EDIT DIRECTLY
export const imageManifest = ${JSON.stringify(manifestData, null, 2)};
`;

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, outputContent, 'utf8');
console.log(`Successfully generated image manifest at: ${OUTPUT_FILE}`);
console.log(`Total items in manifest: ${manifestData.length}`);
