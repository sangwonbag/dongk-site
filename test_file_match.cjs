const { sampleBooks } = require('./src/data/samplebooks.db.js');
const fs = require('fs');
const path = require('path');

// Recursively get files
function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(fullPath));
        } else {
            if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const allFiles = getFiles('public/samplebooks').map(f => {
    return f.replace(/\\/g, '/').replace(/^public/, '');
});

console.log('Total images found in public/samplebooks:', allFiles.length);

let matchedCount = 0;
let totalCoverless = 0;

sampleBooks.forEach(book => {
    if (!book.cover) {
        totalCoverless++;
        // Try to match a file in allFiles
        // Check if file path contains brand and parts of title or materialType
        const brand = book.brand.toLowerCase();
        const cat = book.category.toLowerCase();
        const type = (book.materialType || "").toLowerCase();
        
        const matchedFile = allFiles.find(f => {
            const low = f.toLowerCase();
            // Must contain brand and cat (or brand in path)
            if (!low.includes(brand)) return false;
            
            // If wallpaper, check type
            if (book.category === '벽지') {
                if (type && !low.includes(type)) return false;
            }
            
            return true;
        });

        if (matchedFile) {
            matchedCount++;
            console.log(`MATCHED FILE: "${book.title}" -> ${matchedFile}`);
        } else {
            console.log(`FAILED FILE: "${book.title}"`);
        }
    }
});

console.log(`Summary: Matched ${matchedCount}/${totalCoverless} coverless books via files.`);
