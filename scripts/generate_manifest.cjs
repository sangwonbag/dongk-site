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

// Helper: Normalize (Strict) for matching
const normalize = (str) => str ? str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : "";

// 1. Extract Codes from databases
const materialsContent = fs.readFileSync(DATA_FILE, 'utf8');
const sampleBooksContent = fs.readFileSync(SAMPLE_DATA_FILE, 'utf8');
const combinedContent = materialsContent + '\n' + sampleBooksContent;
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
const convertToPublicPath = (absPath) => '/' + path.relative(PUBLIC_DIR, absPath).split(path.sep).join('/');

items.forEach(code => {
    const nCode = normalize(code);
    if (!nCode) return;

    // Find all files that might match this code
    const fileMatches = allFiles.filter(f => {
        const nameOnly = path.parse(path.basename(f)).name;
        const nFile = normalize(nameOnly);
        
        // Exact match (normalized)
        if (nFile === nCode) return true;
        
        // Code is contained in filename (e.g. "CM24731" in "1. CM24731 내추럴 화이트")
        if (nFile.includes(nCode)) return true;
        
        // Filename is contained in code (less common but possible)
        if (nCode.includes(nFile) && nFile.length >= 5) return true;

        return false;
    }).map(f => {
        const nameOnly = path.parse(path.basename(f)).name;
        const nFile = normalize(nameOnly);
        let index = 99; // Default low priority

        // Determine index/priority
        if (nFile === nCode) {
            index = 0;
        } else {
            // Check for trailing index like _1, _2
            const idxMatch = nameOnly.match(/[_\s](\d+)$/);
            if (idxMatch) {
                index = parseInt(idxMatch[1], 10);
            } else {
                // Check for leading index like "1. ..."
                const prefixMatch = nameOnly.match(/^(\d+)\./);
                if (prefixMatch) {
                    index = parseInt(prefixMatch[1], 10) - 1;
                }
            }
        }
        return { path: f, index, isThumb: f.includes('Thumbnail_Image') };
    });

    if (fileMatches.length === 0) return;

    // Pick best cover: lowest index thumbnail, or lowest index cover
    fileMatches.sort((a, b) => {
        if (a.isThumb !== b.isThumb) return a.isThumb ? -1 : 1;
        return a.index - b.index;
    });

    const cover = convertToPublicPath(fileMatches[0].path);
    
    // Deduplicate gallery by file content (hash) AND path
    // This handles cases where different files are identical copies
    const seenHashes = new Set();
    const uniqueGallery = [];

    for (const m of fileMatches) {
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

    const entry = { cover, gallery: uniqueGallery };
    manifest[code] = entry;
    if (nCode !== code) {
        manifest[nCode] = entry;
    }
});

// 4. Write
const content = `// Auto-generated by scripts/generate_manifest.js
export const imageManifest = ${JSON.stringify(manifest, null, 2)};
`;
fs.writeFileSync(OUTPUT_FILE, content);
console.log(`Manifest written with ${Object.keys(manifest).length} entry keys.`);
