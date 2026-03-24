const fs = require('fs');
const content = fs.readFileSync('src/data/materials.db.js', 'utf8');
const attrMatches = content.match(/(?:id|code):\s*["']([^"']+)["']/g) || [];
console.log('Found structured matches:', attrMatches.length);
let count = 0;
attrMatches.forEach(str => {
    if (str.includes('70287') || str.includes('15053') || str.includes('15120')) {
        console.log('Found:', str);
        count++;
    }
});
console.log('Total specific found:', count);
