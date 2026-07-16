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

// Robust code extractor helper from filename
function extractCode(filename) {
  const ext = path.extname(filename);
  const nameWithoutExt = filename.slice(0, -ext.length).trim();
  
  // 1. Remove suffix indices (e.g. "_0", "_1", " (2)")
  let cleanName = nameWithoutExt.replace(/_thumbnail$/i, '').replace(/_(\d+)$/, '').replace(/\s*\(\d+\)$/, '').trim();
  
  // 2. Try matching standard code patterns: [Letters 2-5] + [spaces?] + [Numbers 3-5] + [Letters?]
  // Examples: HOT 0065, TS5502P, OA 317, DBT3066, ZOT 0761, CM21882, ZS84011-11
  const codeRegex = /\b([A-Z]{2,5})\s*(\d{3,5}(?:-\d+)?)([A-Z]*)\b/i;
  const match = cleanName.match(codeRegex);
  if (match) {
    // Reconstruct normalized code (like HOT 0065 or TS5502P)
    const prefix = match[1].toUpperCase();
    const numbers = match[2];
    const suffix = match[3] ? match[3].toUpperCase() : '';
    // If it was originally written with space, preserve one space, otherwise keep it compact.
    // We'll return the matched string itself as extracted code
    return match[0].trim();
  }
  
  // 3. Try matching numeric code patterns at the start (e.g. 90013-1, 25097-1)
  const numericRegex = /^(\d{3,6}(?:-\d+)?)/;
  const numMatch = cleanName.match(numericRegex);
  if (numMatch) {
    return numMatch[1];
  }

  // 4. Try matching other patterns like OA 317 or DLT 3300
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

  // Create a safe, URL-encoded path for browser loading
  // We want to URL-encode each segment of the path individually to preserve slashes "/"
  const encodedPath = '/' + relativeFromPublic.split('/').map(segment => encodeURIComponent(segment)).join('/');

  return {
    fileName,
    fullPublicPath: encodedPath,
    category,
    brand,
    series,
    extractedCode,
    normalizedFileName
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
