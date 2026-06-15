const fs = require('fs');
const path = require('path');

function getPaths(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results.push(fullPath);
            results = results.concat(getPaths(fullPath));
        } else {
            results.push(fullPath);
        }
    });
    return results;
}

const all = getPaths('public/samplebooks/Thumbnail_image');
console.log('Total files/folders on disk:', all.length);
all.forEach(p => {
    if (p.includes('제일') || p.includes('DID') || p.includes('벽지')) {
        console.log(p, '->', Buffer.from(p).toString('hex'));
    }
});
