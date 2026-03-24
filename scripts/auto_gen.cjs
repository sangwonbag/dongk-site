const fs = require('fs');
const path = require('path');

const materialsDbPath = path.join(__dirname, '..', 'src', 'data', 'materials.db.js');
const thumbDir = path.join(__dirname, '..', 'public', 'images', 'Thumbnail_Image');

let content = fs.readFileSync(materialsDbPath, 'utf8');

// Parse existing codes
const existingCodesRegex = /code:\s*["']([^"']+)["']/g;
const existingCodes = new Set();
let match;
while ((match = existingCodesRegex.exec(content)) !== null) {
    existingCodes.add(match[1].replace(/[^a-zA-Z0-9]/g, '').toUpperCase());
}

const folders = fs.readdirSync(thumbDir).filter(f => fs.statSync(path.join(thumbDir, f)).isDirectory());

const newMaterials = [];

function getBrandAndCategory(folder) {
    if (folder.includes('KCC')) return { brand: 'KCC', category: '데코타일' };
    if (folder.includes('dongshin')) return { brand: '동신', category: '데코타일' };
    
    if (folder.includes('신한벽지')) {
        let matType = "실크";
        if (folder.includes('방염')) matType = "방염";
        if (folder.includes('아이리스') || folder.includes('IRIS')) matType = "합지";
        return { brand: '신한(KCC)', category: '벽지', materialType: matType };
    }

    if (folder.includes('1.8T') || folder.includes('뉴청맥')) return { brand: 'LX 1.8T', category: '장판' };
    if (folder.includes('2.0T') || folder.includes('은행목_2T')) return { brand: 'LX 2.0T', category: '장판' };
    if (folder.includes('2.7T')) return { brand: 'LX 2.7T', category: '장판' };
    if (folder.includes('3.2T')) return { brand: 'LX 3.2T', category: '장판' };
    if (folder.includes('4.5T')) return { brand: 'LX 4.5T', category: '장판' };

    // Other LX folders (LX하우스, LX하우시스_데코레이S)
    if (folder.includes('LX')) return { brand: 'LX', category: '데코타일' };

    return { brand: '기타', category: '기타' };
}

folders.forEach(folder => {
    const { brand, category, materialType } = getBrandAndCategory(folder);
    const files = fs.readdirSync(path.join(thumbDir, folder));
    
    const items = new Map();
    
    files.forEach(file => {
        if (!/\.(jpg|jpeg|png)$/i.test(file)) return;
        
        let name = path.parse(file).name;
        
        if (brand === 'KCC') {
            if (!name.endsWith('_0')) return; // KCC condition
            name = name.replace(/_0$/, '');
        } else {
            // Remove typical suffixes like _1, _2, _4장, (1), etc.
            name = name.replace(/_[0-9]+[장가-힣]*$/, '');
            name = name.replace(/_[0-9]+$/, '');
            name = name.replace(/\s*\(\d+\)$/, ''); // (1)
        }
        
        // Code parsing
        let code = name;
        
        // Remove prefixing numbers like '1. ', '10. '
        if (/^\d+\.\s*/.test(code)) {
            code = code.replace(/^\d+\.\s*/, '');
            name = name.replace(/^\d+\.\s*/, ''); // cleans the name too
        }
        
        // Specific cleanup (내지_데코_DLT 3300)
        if (code.startsWith('내지_데코_')) {
            code = code.replace('내지_데코_', '');
            name = name.replace('내지_데코_', '');
        }

        // Usually code is the first word. Sometimes the first two if it's "HOT 0068"
        const words = code.split(/[\s\_]+/); 
        if (words[0].match(/^[a-zA-Z]+$/) && words.length > 1 && words[1].match(/^\d+$/)) {
            code = words[0] + ' ' + words[1];
        } else {
            // First token is the code
            code = words[0];
            // Just a precaution: if it's purely letters and there's a number next, attach it.
            if (!/\d/.test(words[0]) && words.length > 1 && /\d/.test(words[1])) {
                code = words[0] + ' ' + words[1];
            }
        }
        
        let cleanCode = code.replace(/[^a-zA-Z0-9\-\_ ]/g, '').trim();
        if (!cleanCode) cleanCode = name.replace(/[^a-zA-Z0-9\-\_ ]/g, '').trim();

        const normalizedForMatch = cleanCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        
        if (!existingCodes.has(normalizedForMatch)) {
            existingCodes.add(normalizedForMatch);
            newMaterials.push({
                code: cleanCode,
                name: name,
                brand,
                category,
                materialType: materialType || "",
                folder
            });
        }
    });
});

console.log(`Generating ${newMaterials.length} additional materials...`);

if (newMaterials.length > 0) {
    let jsArrayOutput = `\n// AUTO-GENERATED NEW MATERIALS (PASS 2) \nconst LIST_AUTO_GENERATED_2 = [\n`;
    newMaterials.forEach(m => {
        let matTypeStr = m.materialType ? `, materialType: "${m.materialType}"` : '';
        let categoryStr = m.category ? `, category: "${m.category}"` : '';
        jsArrayOutput += `  { id: "${m.code}", code: "${m.code}", name: "${m.name}", brand: "${m.brand}"${categoryStr}${matTypeStr}, price: 0 },\n`;
    });
    jsArrayOutput += `];\n\n`;

    const exportRegex = /export const materials = \[\s*/;
    content = content.replace(exportRegex, jsArrayOutput + `export const materials = [\n    ...LIST_AUTO_GENERATED_2,\n`);

    fs.writeFileSync(materialsDbPath, content, 'utf8');
    console.log('Appended secondary auto-generated materials to src/data/materials.db.js.');
} else {
    console.log('No new materials found. All images matched with DB codes.');
}
