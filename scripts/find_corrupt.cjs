const fs = require('fs');

const dbPath = 'C:\\Users\\psw71\\.gemini\\antigravity\\scratch\\tokyo-flooring\\src\\data\\materials.db.js';
const content = fs.readFileSync(dbPath, 'utf8');

const lines = content.split('\n');
console.log('Scanning for corrupted strings (containing ?) in materials.db.js:');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Check if line contains a string with ? (simple check)
    if (line.includes('?') && (line.includes("'") || line.includes('"'))) {
        console.log(`Line ${i + 1}: ${line.trim()}`);
    }
}
