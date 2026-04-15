const fs = require('fs');
const content = fs.readFileSync('src/data/materials.db.js', 'utf8');
const propRegex = /(?:"?id"?|"?code"?):\s*["']([^"']+)["']/g;
const items = new Set();
let match;
while ((match = propRegex.exec(content)) !== null) items.add(match[1].trim());

console.log('AB_6711 in items:', items.has('AB_6711'));
console.log('DS-AB_6711 in items:', items.has('DS-AB_6711'));

const normalize = (str) => str ? str.replace(/[^a-zA-Z0-9가-힣]/g, '').toUpperCase() : '';
const nCode = normalize('AB_6711');
console.log('nCode:', nCode);
const filename = 'AB_6711_original';
const nFile = normalize(filename);
console.log('nFile:', nFile);
console.log('includes:', nFile.includes(nCode));
