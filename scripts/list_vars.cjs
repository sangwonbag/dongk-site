const fs = require('fs');

const dbPath = 'C:\\Users\\psw71\\.gemini\\antigravity\\scratch\\tokyo-flooring\\src\\data\\materials.db.js';
const content = fs.readFileSync(dbPath, 'utf8');

const regex = /const\s+([A-Z0-9_]+)\s*=/g;
let match;
const vars = [];

while ((match = regex.exec(content)) !== null) {
    vars.push(match[1]);
}

console.log('Variables defined in materials.db.js:');
console.log(JSON.stringify(vars, null, 2));
