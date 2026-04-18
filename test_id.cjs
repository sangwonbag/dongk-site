
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname);
const DATA_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'materials.db.js');
const SAMPLE_DATA_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'samplebooks.db.js');
const generatedContentPath = path.join(PROJECT_ROOT, 'src', 'data', 'generatedMaterials.js');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const THUMB_DIR = path.join(PUBLIC_DIR, 'images', 'Thumbnail_Image');
const COVER_DIR = path.join(PUBLIC_DIR, 'images', 'cover');
const THUMB_MATERIALS_DIR = path.join(THUMB_DIR, 'materials');

const normalize = (str) => str ? str.replace(/[^a-zA-Z0-9가-힣]/g, '').toUpperCase() : "";

const convertToPublicPath = (absPath) => {
    if (absPath.startsWith(THUMB_MATERIALS_DIR)) {
        const relPath = path.relative(THUMB_MATERIALS_DIR, absPath).replace(/\\/g, '/');
        const hash = crypto.createHash('md5').update(relPath, 'utf8').digest('hex');
        const ext = path.extname(absPath).toLowerCase();
        return hash + ext;
    }
    return '/' + path.relative(PUBLIC_DIR, absPath).split(path.sep).join('/');
};

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

const allFiles = getFiles(THUMB_MATERIALS_DIR);

const code = 'ZS80021-11';
const nCode = normalize(code);

console.log('nCode:', nCode);
const fileMatches = allFiles.filter(f => {
    const nameOnly = path.parse(path.basename(f)).name;
    const nFile = normalize(nameOnly);
    if (nFile === nCode) return true;
    if (nFile.includes(nCode)) return true;
    if (nCode.includes(nFile) && nFile.length >= 5) return true;
    return false;
}).map(f => {
    const nameOnly = path.parse(path.basename(f)).name;
    const nFile = normalize(nameOnly);
    let index = 99;
    if (nFile === nCode) index = 0;
    else if (nFile.startsWith(nCode)) index = 1;
    else if (nFile.includes(nCode)) index = 2;
    return { path: f, index, isThumb: f.includes('Thumbnail_Image'), isCover: f.includes('cover') };
});

console.log('fileMatches:', fileMatches);

if (fileMatches.length === 0) {
    console.log('No matches found for', code);
    process.exit(1);
}

fileMatches.sort((a, b) => {
    if (a.isThumb !== b.isThumb) return a.isThumb ? 1 : -1;
    return a.index - b.index;
});

const thumbMatches = fileMatches.filter(f => f.isThumb);
console.log('thumbMatches:', thumbMatches);

if (thumbMatches.length === 0) {
    console.log('No thumbMatches, returning');
    process.exit(1);
}

const thumbnail = convertToPublicPath(thumbMatches[0].path);
console.log('thumbnail generated:', thumbnail);

let entry = { thumbnail, images: [thumbnail] };
console.log('FINAL ENTRY:', entry);
