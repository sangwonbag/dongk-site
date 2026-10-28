const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const DATA_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'materials.db.js');
const SAMPLE_DATA_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'samplebooks.db.js');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'imageManifest.js');

const COVER_DIR = path.join(PUBLIC_DIR, 'images', 'cover');
const THUMB_DIR = path.join(PUBLIC_DIR, 'images', 'Thumbnail_Image');
const THUMB_MATERIALS_DIR = path.join(THUMB_DIR, 'materials');

// Supabase Storage 설정 (이미지가 GitHub에 포함되지 않으므로 Supabase URL 사용)
const SUPABASE_URL = 'https://ymoshkaiwvnmhhcglpjj.supabase.co';
const SUPABASE_BUCKET = 'materials';

// Helper: Normalize (Strict) for matching
const normalize = (str) => str ? str.replace(/[^a-zA-Z0-9가-힣]/g, '').toUpperCase() : "";

function slugifyPath(input) {
  return input
    .replace(/\\/g, '/')
    .split('/')
    .map((part) =>
      part
        .trim()
        .toLowerCase()
        // 대분류
        .replace(/데코타일/g, 'deco_tile')
        .replace(/장판/g, 'jangpan')
        .replace(/마루/g, 'maru')
        .replace(/벽지/g, 'wallpaper')
        .replace(/카페트타일/g, 'carpet_tile')
        // LX 장판 (두께 중심)
        .replace(/lx하우시스_.*_1\.8t/g, 'lx_18t')
        .replace(/lx하우시스_.*_2\.0t/g, 'lx_20t')
        .replace(/lx하우시스_.*_2\.2t/g, 'lx_22t')
        .replace(/lx하우시스_.*_2\.7t/g, 'lx_27t')
        .replace(/lx하우시스_.*_3\.2t/g, 'lx_32t')
        .replace(/lx하우시스_.*_4\.5t/g, 'lx_45t')
        .replace(/lx하우시스_.*_5\.0t/g, 'lx_50t')
        // 브랜드명 치환
        .replace(/동신/g, 'dongshin')
        .replace(/녹수/g, 'noksu')
        .replace(/재영/g, 'jaeyoung')
        .replace(/현대/g, 'hyundai')
        .replace(/동화/g, 'dongwha')
        .replace(/구정/g, 'kujung')
        .replace(/개나리/g, 'gaenari')
        .replace(/서울/g, 'seoul')
        .replace(/제일/g, 'jeil')
        .replace(/디아이디/g, 'did')
        .replace(/신한/g, 'shinhan')
        .replace(/스완/g, 'swan')
        .replace(/아반/g, 'avan')
        // 정규화 (공백 등)
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9가-힣._-]/g, '_') // Allow Korean characters
        .replace(/_+/g, '_')
    )
    .join('/');
}

// 1. Extract Codes from databases
const materialsContent = fs.readFileSync(DATA_FILE, 'utf8');
const sampleBooksContent = fs.readFileSync(SAMPLE_DATA_FILE, 'utf8');
const generatedContentPath = path.join(PROJECT_ROOT, 'src', 'data', 'generatedMaterials.js');
const generatedContent = fs.existsSync(generatedContentPath) ? fs.readFileSync(generatedContentPath, 'utf8') : '';
const combinedContent = materialsContent + '\n' + sampleBooksContent + '\n' + generatedContent;
const items = new Set();

// Strategy A: Find all property values for "id" or "code"
// Handles "id": "code", id: "code", 'code': 'code', etc.
const propRegex = /(?:"?id"?|"?code"?):\s*["']([^"']+)["']/g;
let match;
while ((match = propRegex.exec(combinedContent)) !== null) {
    if (match[1]) items.add(match[1].trim());
}

// Strategy B: Find any quoted string that looks like a product code (5-30 chars, alphanumeric/spaces/dashes)
// This catches codes in arrays like "TW 5104G"
const stringRegex = /["']([A-Z0-9\s._-]{5,30})["']/gi;
while ((match = stringRegex.exec(combinedContent)) !== null) {
    const val = match[1].trim();
    // Filter out common metadata/labels
    if (["장판", "벽지", "데코타일", "마루", "카페트타일", "엑스컴포트", "지아소리잠", "지아사랑애"].includes(val)) continue;
    if (val.length >= 5) items.add(val);
}

console.log(`Extracted ${items.size} unique potential codes from database.`);

// 2. Scan Directories
function getFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(filePath));
        } else if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
            results.push(filePath);
        }
    });
    return results;
}

const coverFiles = getFiles(COVER_DIR);
const thumbFiles = getFiles(THUMB_DIR);
const allFiles = [...thumbFiles, ...coverFiles];

console.log(`Found ${coverFiles.length} cover files and ${thumbFiles.length} thumbnail files.`);

// 3. Match
const manifest = {};

/**
 * 절대 경로 → Supabase Storage Public URL 변환
 * Thumbnail_Image/materials 하위 파일:
 *   relPath = 해당 경로에서 THUMB_MATERIALS_DIR 기준 상대경로 (슬래시 구분)
 *   storageKey = md5(relPath).ext  (upload_thumbnails_supabase.cjs 와 동일 로직)
 * 그 외(cover 등) → 로컬 /images/ 경로 (fallback)
 */
const convertToPublicPath = (absPath) => {
    if (absPath.startsWith(THUMB_MATERIALS_DIR)) {
        const relPath = path.relative(THUMB_MATERIALS_DIR, absPath).replace(/\\/g, '/');
        const hash = crypto.createHash('md5').update(relPath, 'utf8').digest('hex');
        const ext = path.extname(absPath).toLowerCase();
        return hash + ext;
    }
    // cover 등 나머지 → 로컬 경로 유지
    return '/' + path.relative(PUBLIC_DIR, absPath).split(path.sep).join('/');
};

// Robust code extractor helper from filename
function extractCodesFromFilename(filename) {
    const ext = path.extname(filename);
    let cleanName = filename.slice(0, -ext.length).trim();
    
    // 1. Remove suffix indices, patterns, and descriptions iteratively
    let prevName;
    do {
        prevName = cleanName;
        cleanName = cleanName
            .replace(/\.jpg_[0-9]+cross$/i, '')
            .replace(/_(?:thumbnail|detail)$/i, '')
            .replace(/_(?:사무실|시공예시|시공|상업공간|패턴|확장|거실|침실|카페|매장|office|scene|room|2x2|90cross|180cross)$/i, '')
            .replace(/_(\d+)$/, '')
            .replace(/\s*\(\d+\)$/, '')
            .trim();
    } while (cleanName !== prevName);

    // If combined like B0156M_B0158M or DS626_DS627 or AS1810_AS1814
    const parts = cleanName.split('_');
    const validCodeRegex = /^[A-Z]{1,5}\s*\d{3,5}(?:-\d+)?[A-Z]*$/i;
    if (parts.length > 1 && parts.every(p => validCodeRegex.test(p.trim()))) {
        return parts.map(p => p.trim());
    }

    // Standard single code matches
    const codeRegex = /(?:^|[_\s])([A-Z]{1,5}\s*\d{3,5}(?:-\d+)?[A-Z]*)(?:[_\s]|$)/i;
    const match = cleanName.match(codeRegex);
    if (match) {
        return [match[1].trim()];
    }

    const boundaryRegex = /\b([A-Z]{1,5})\s*(\d{3,5}(?:-\d+)?)([A-Z]*)\b/i;
    const bMatch = cleanName.match(boundaryRegex);
    if (bMatch) {
        return [bMatch[0].trim()];
    }

    const numericRegex = /^(\d{3,6}(?:-\d+)?[A-Z]*)/i;
    const numMatch = cleanName.match(numericRegex);
    if (numMatch) {
        return [numMatch[1].trim()];
    }

    const looseMatch = cleanName.match(/([A-Z0-9]{2,6})\s+(\d{3,5})/i);
    if (looseMatch) {
        return [looseMatch[0].trim()];
    }

    return [cleanName];
}

// Pre-index allFiles for instant O(1) lookup
const filesByExact = new Map();
const filesByCode = new Map();
const preprocessedFiles = allFiles.map(f => {
    const fileName = path.basename(f);
    const nameOnly = path.parse(fileName).name;
    const nFile = normalize(nameOnly);
    const extCodes = extractCodesFromFilename(fileName);
    const lower = fileName.toLowerCase();
    
    let index = 0; // Universal IMAGE_PRIORITY: material: 0, 2x2: 1, 90cross: 2, office: 3, other: 4
    if (lower.includes('2x2') || lower.includes('2_2') || lower.includes('2×2')) {
        index = 1;
    } else if (lower.includes('90cross') || lower.includes('_cross') || lower.includes('크로스') || /(?:^|[_\-\s])cross(?:[_\-\s.]|$)/i.test(fileName)) {
        index = 2;
    } else if (lower.includes('사무실') || lower.includes('상업공간') || lower.includes('시공') || lower.includes('시공예시') || lower.includes('installation') || lower.includes('office') || lower.includes('scene')) {
        index = 3;
    } else if (lower.includes('180cross') || lower.includes('회전') || /_([2-9])\.(jpe?g|png|webp)$/i.test(fileName)) {
        index = 4;
    } else {
        index = 0; // Material swatch original
    }

    const obj = { path: f, index, isThumb: f.includes('Thumbnail_Image'), nFile, extCodes, fileName };
    
    if (!filesByExact.has(nFile)) filesByExact.set(nFile, []);
    filesByExact.get(nFile).push(obj);

    for (const code of extCodes) {
        const nExt = normalize(code);
        if (nExt) {
            if (!filesByCode.has(nExt)) filesByCode.set(nExt, []);
            filesByCode.get(nExt).push(obj);
        }
    }

    return obj;
});

items.forEach(code => {
    const nCode = normalize(code);
    if (!nCode) return;

    // Fast indexed match
    let matches = [];
    if (filesByExact.has(nCode)) {
        matches.push(...filesByExact.get(nCode));
    }
    if (filesByCode.has(nCode)) {
        matches.push(...filesByCode.get(nCode));
    }

    // Deduplicate file references
    const seenFiles = new Set();
    const fileMatches = [];
    for (const m of matches) {
        if (!seenFiles.has(m.path)) {
            seenFiles.add(m.path);
            fileMatches.push(m);
        }
    }

    if (fileMatches.length === 0) {
        // Fallback for non-numeric codes > 4 chars: prefix/word boundary match
        const isShortOrNumeric = /^\d+$/.test(nCode) || nCode.length <= 4;
        if (!isShortOrNumeric) {
            for (const f of preprocessedFiles) {
                if (f.nFile.includes(nCode)) {
                    const trailingChar = f.nFile.slice(f.nFile.indexOf(nCode) + nCode.length, f.nFile.indexOf(nCode) + nCode.length + 1);
                    if (!trailingChar || !/\d/.test(trailingChar)) {
                        if (!seenFiles.has(f.path)) {
                            seenFiles.add(f.path);
                            fileMatches.push(f);
                        }
                    }
                }
            }
        }
    }

    if (fileMatches.length === 0) return;

    // Pick best THUMBNAIL: lowest index first (material: 0 > 2x2: 1 > 90cross: 2 > office: 3)
    const thumbMatches = [...fileMatches].sort((a, b) => {
        if (a.index !== b.index) return a.index - b.index;
        if (a.isThumb !== b.isThumb) return a.isThumb ? -1 : 1;
        return 0;
    });

    const thumbnail = convertToPublicPath(thumbMatches[0].path);
    const detail = thumbnail;
    const cover = thumbnail; // Fallback alias
    
    // Deduplicate gallery by file content (hash) AND path
    // Sort strictly by universal index: material (0) -> 2x2 (1) -> 90cross (2) -> office (3)
    const seenHashes = new Set();
    const uniqueGallery = [];

    const sortedFileMatches = [...fileMatches].sort((a, b) => a.index - b.index);

    for (const m of sortedFileMatches) {
        const publicPath = convertToPublicPath(m.path);
        try {
            const hash = crypto.createHash('md5').update(fs.readFileSync(m.path)).digest('hex');
            if (!seenHashes.has(hash)) {
                seenHashes.add(hash);
                uniqueGallery.push(publicPath);
            }
        } catch (e) {
            // Fallback to path unique if hashing fails
            if (!uniqueGallery.includes(publicPath)) {
                uniqueGallery.push(publicPath);
            }
        }
    }

    let entry = { thumbnail, images: uniqueGallery };
    manifest[code] = entry;
    if (nCode !== code) {
        manifest[nCode] = entry;
    }
});

// 4. Write
const content = `// Auto-generated by scripts/generate_manifest.cjs — images served from Supabase Storage
export const imageManifest = ${JSON.stringify(manifest, null, 2)};
`;
fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
console.log(`Manifest written with ${Object.keys(manifest).length} entry keys.`);
console.log(`Image base URL: ${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/`);
