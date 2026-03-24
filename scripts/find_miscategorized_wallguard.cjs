// Note: This script needs to be able to handle imports/exports.
// Since materials.db.js is likely ESM or CommonJS, we'll try to read it as a string and eval or parse.
// Actually, I'll just use a simple regex-based parser that's even more aggressive.

const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'data', 'materials.db.js');
const content = fs.readFileSync(filePath, 'utf8');

// Find all occurrences of W codes and their materialType
const results = [];
const itemRegex = /\{([^}]*?)\}/g;
let match;

while ((match = itemRegex.exec(content)) !== null) {
    const itemContent = match[1];
    if (/id\s*:\s*["']W\d+/i.test(itemContent) || /code\s*:\s*["']W\d+/i.test(itemContent)) {
        const materialTypeMatch = itemContent.match(/materialType\s*:\s*["']([^"']+)["']/);
        const materialType = materialTypeMatch ? materialTypeMatch[1] : 'unknown';
        const idMatch = itemContent.match(/id\s*:\s*["']([^"']+)["']/);
        const id = idMatch ? idMatch[1] : 'unknown';
        
        if (materialType !== '실크') {
            results.push({ id, materialType });
        }
    }
}

console.log('--- Miscategorized Wallguard (Non-Silk) ---');
if (results.length === 0) {
    console.log('None found.');
} else {
    results.forEach(r => console.log(`ID: ${r.id}, materialType: ${r.materialType}`));
}
console.log('------------------------------------------');
