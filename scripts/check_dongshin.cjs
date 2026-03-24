const fs = require('fs');
const content = fs.readFileSync('src/data/materials.db.js', 'utf8');

const baseDir = 'public/images/cover/데코타일/동신/dongshin';
const files = fs.readdirSync(baseDir);

const existingCodes = new Set();
const attrMatches = content.match(/(?:id|code):\s*["']([^"']+)["']/g) || [];
attrMatches.forEach(q => {
    const match = q.match(/["']([^"']+)["']/);
    if (match && match[1]) {
        existingCodes.add(match[1].replace(/[^a-zA-Z0-9]/g, ''));
    }
});

let missing = new Set();
files.forEach(file => {
    if (!file.endsWith('.jpg') && !file.endsWith('.png')) return;
    
    // e.g. AB6711_1.jpg -> AB6711
    let basename = file.replace(/\.(jpg|png)$/i, '');
    let coreCode = basename.split('_')[0]; // AB6711 or AB
    
    // For AB_6711.png, split('_') gives 'AB', so handle it better
    let normalizedFilename = basename.replace(/[^a-zA-Z0-9]/g, '');
    // Usually the code is the first letters+numbers.
    // Let's just find the first letters+numbers part
    let codeMatch = basename.match(/([a-zA-Z]+_*[0-9]+)/);
    if (codeMatch) {
        let codeNorm = codeMatch[1].replace(/[^a-zA-Z0-9]/g, '');
        if (!existingCodes.has(codeNorm)) {
            missing.add(codeNorm);
        }
    }
});

console.log('Missing items:', [...missing]);
