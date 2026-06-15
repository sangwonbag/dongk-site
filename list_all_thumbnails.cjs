const fs = require('fs');
const path = require('path');

function getFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(fullPath));
        } else {
            results.push(fullPath);
        }
    });
    return results;
}

const allFiles = getFiles('public/samplebooks/Thumbnail_image').map(f => f.replace(/\\/g, '/'));
console.log('Total local thumbnail files on disk:', allFiles.length);
allFiles.forEach(f => console.log(f));
