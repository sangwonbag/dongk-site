const fs = require('fs');
const content = fs.readFileSync('src/data/materials.db.js', 'utf8');

const start = content.indexOf('const LIST_DONGSHIN = [');
if (start !== -1) {
    console.log(content.substring(start, start + 500));
}
