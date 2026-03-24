const fs = require('fs');
const path = require('path');

const DATA_FILE = 'C:\\Users\\psw71\\.gemini\\antigravity\\scratch\\tokyo-flooring\\src\\data\\materials.db.js';
const materialsContent = fs.readFileSync(DATA_FILE, 'utf8');

const items = new Set();

// 1. Match "id": "..." or code: "..." (unquoted or quoted keys)
const propRegex = /(?:"?id"?|"?code"?):\s*["']([^"']+)["']/g;
let m;
while ((m = propRegex.exec(materialsContent)) !== null) {
    if (m[1]) items.add(m[1].trim());
}

// 2. Match plain strings in arrays or elsewhere if they look like codes (at least 5 chars)
const stringRegex = /["']([^"']{5,})["']/g;
while ((m = stringRegex.exec(materialsContent)) !== null) {
    const val = m[1].trim();
    items.add(val);
}

const twItems = Array.from(items).filter(i => i.startsWith('TW'));
console.log(`TW items count: ${twItems.length}`);
console.log("TW items:", twItems);

// Check hex of "TW 5104G" in the file
const buf = fs.readFileSync(DATA_FILE);
const str = buf.toString('utf8');
const idx = str.indexOf('TW 5104G');
if (idx !== -1) {
    console.log(`Found 'TW 5104G' at index ${idx}`);
    const slice = buf.slice(idx - 1, idx + 9);
    console.log("Hex around it:", slice.toString('hex'));
} else {
    console.log("'TW 5104G' NOT found in raw string!");
}
