const fs = require('fs');
const FILE = 'C:\\Users\\psw71\\.gemini\\antigravity\\scratch\\tokyo-flooring\\src\\data\\materials.db.js';
const content = fs.readFileSync(FILE, 'utf8');
const idx = content.indexOf('TW 5104G');
console.log(`Index of 'TW 5104G': ${idx}`);
if (idx !== -1) {
    console.log(`Snippet: "${content.substring(idx - 10, idx + 20)}"`);
} else {
    // Try without space
    const idx2 = content.indexOf('TW5104G');
    console.log(`Index of 'TW5104G': ${idx2}`);
}
