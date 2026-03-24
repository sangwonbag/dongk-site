const fs = require('fs');
const path = require('path');

const materialsDbPath = path.join(__dirname, '..', 'src', 'data', 'materials.db.js');
const thumbDir = path.join(__dirname, '..', 'public', 'images', 'Thumbnail_Image');

let content = fs.readFileSync(materialsDbPath, 'utf8');

// We want to find all existing codes
// A simple regex might miss some complexities, but we can look for `code: "..."`
const existingCodesRegex = /code:\s*["']([^"']+)["']/g;
const existingCodes = new Set();
let match;
while ((match = existingCodesRegex.exec(content)) !== null) {
    existingCodes.add(match[1].replace(/\s+/g, '').toUpperCase());
}

console.log(`Found ${existingCodes.size} existing unique material codes.`);

// Scan folders
const folders = fs.readdirSync(thumbDir).filter(f => fs.statSync(path.join(thumbDir, f)).isDirectory());

const missingItems = {
    KCC: [],
    Dongshin: [],
    LX: []
};

folders.forEach(folder => {
    let brand = '';
    let category = '';
    if (folder === 'KCC_square') brand = 'KCC';
    else if (folder === 'dongshin') brand = '동신';
    else if (folder.startsWith('LX')) brand = folder; // e.g., LX하우시스_뉴청맥_1.8T
    
    const files = fs.readdirSync(path.join(thumbDir, folder));
    
    files.forEach(file => {
        if (!/\.(jpg|jpeg|png)$/i.test(file)) return;
        
        let code = '';
        let name = path.parse(file).name; // without extension
        
        if (brand === 'KCC') {
            // "KCC는 파일명_0만 사용해"
            if (!name.endsWith('_0')) return;
            // Name: "TS5502P 우븐_0" -> code "TS5502P", name "TS5502P 우븐"
            name = name.replace(/_0$/, '');
            code = name.split(' ')[0]; // Usually the first word is the code
        } else if (brand === '동신') {
            // e.g. "AB_6711.png" -> code "AB_6711"
            // "AB6711_1.jpg"
            if (name.includes('_')) {
                // If it's a detail image like AB6711_1
                const parts = name.split('_');
                if (parts[1].length <= 2 && !isNaN(parts[1])) {
                    // It's an index, the code is before the underscore
                    code = parts[0];
                } else {
                    code = name; // could be AB_6711
                }
            } else {
                code = name;
            }
        } else {
            // LX folders
            // Format: "ZJ43591-22" or "ZJ33051-11_2"
            if (name.includes('_')) {
                 const parts = name.split('_');
                 if (parts[1].length <= 2 && !isNaN(parts[1])) {
                    code = parts[0];
                 } else {
                    code = name;
                 }
            } else {
                code = name;
            }
        }
        
        const normalizedCode = code.replace(/\s+/g, '').toUpperCase();
        
        if (!existingCodes.has(normalizedCode)) {
            // Adding to missing items
            let listGroup = '';
            if (brand === 'KCC') listGroup = 'KCC';
            else if (brand === '동신') listGroup = 'Dongshin';
            else listGroup = brand;
            
            if (!missingItems[listGroup]) missingItems[listGroup] = [];
            
            // Deduplicate missing by code
            if (!missingItems[listGroup].find(i => i.code === code)) {
                 missingItems[listGroup].push({ code, name, file });
                 // temporarily add to existing to avoid duplicates across files
                 existingCodes.add(normalizedCode);
            }
        }
    });
});

for (const group in missingItems) {
    if (missingItems[group].length > 0) {
        console.log(`\n### Missing in ${group} : ${missingItems[group].length}`);
        console.log(missingItems[group].slice(0, 10)); // sample
    }
}

fs.writeFileSync(path.join(__dirname, 'missing_materials.json'), JSON.stringify(missingItems, null, 2));
console.log('\nWrote all missing items to missing_materials.json');
