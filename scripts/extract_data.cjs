const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-uK4mjEjT.js', 'utf8');

const searchString = 'TS 5502P';
const matchIndex = content.indexOf(searchString);

if (matchIndex !== -1) {
    const start = Math.max(0, matchIndex - 50000);
    const end = Math.min(content.length, matchIndex + 200000);
    const chunk = content.slice(start, end);
    fs.writeFileSync('extracted_chunk.js', chunk, 'utf8');
    console.log(`Successfully extracted ${chunk.length} bytes to extracted_chunk.js at offset ${start}`);
} else {
    console.log('String not found');
}
