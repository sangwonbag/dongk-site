const fs = require('fs');
const content = fs.readFileSync('src/data/materials.db.js', 'utf8');
const idx = content.indexOf('70287-1');
const snippet = content.substring(idx - 5, idx + 10);
console.log('Snippet:', JSON.stringify(snippet));
for (let i=0; i<snippet.length; i++) {
    console.log(snippet[i], snippet.charCodeAt(i));
}
