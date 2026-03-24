const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'data', 'materials.db.js');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('--- Lines with "W or \'W in materials.db.js ---');
lines.forEach((line, index) => {
    if (line.includes('"W') || line.includes("'W")) {
        console.log(`${index + 1}: ${line.trim()}`);
    }
});
console.log('--- End of Report ---');
