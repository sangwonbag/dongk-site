const fs = require('fs');
const path = require('path');

const materialsDbPath = path.join(__dirname, '..', 'src', 'data', 'materials.db.js');
const thumbDir = path.join(__dirname, '..', 'public', 'images', 'Thumbnail_Image');

let content = fs.readFileSync(materialsDbPath, 'utf8');

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
    
    if (folder.includes('방염')) return { brand: '신한(KCC)', category: '벽지', materialType: '방염' };
    if (folder.includes('실크') || folder.includes('LIVING') || folder.includes('SKETCH') || folder.includes('WALLGUARD') || folder.includes('파인하임')) return { brand: '신한(KCC)', category: '벽지', materialType: '실크' };
    if (folder.includes('IRIS') || folder.includes('아이리스') || folder.includes('합지')) return { brand: '신한(KCC)', category: '벽지', materialType: '합지' };
    if (folder.includes('신한')) return { brand: '신한(KCC)', category: '벽지', materialType: '실크' }; 

    if (folder.includes('1.8T')) return { brand: 'LX 1.8T', category: '장판' };
    if (folder.includes('2.0T') || folder.includes('2T')) return { brand: 'LX 2.0T', category: '장판' };
    if (folder.includes('2.7T')) return { brand: 'LX 2.7T', category: '장판' };
    if (folder.includes('3.2T')) return { brand: 'LX 3.2T', category: '장판' };
    if (folder.includes('4.5T')) return { brand: 'LX 4.5T', category: '장판' };

    if (folder.includes('LX')) return { brand: 'LX', category: '데코타일' };

    return { brand: '기타', category: '기타' };
}

folders.forEach(folder => {
    const { brand, category, materialType } = getBrandAndCategory(folder);
    const files = fs.readdirSync(path.join(thumbDir, folder));
    
    // Group files by base name
    const items = new Map();
    
    files.forEach(file => {
        if (!/\.(jpg|jpeg|png)$/i.test(file)) return;
        
        let name = path.parse(file).name;
        
        if (brand === 'KCC') {
            if (!name.endsWith('_0')) return; // KCC condition
            name = name.replace(/_0$/, '');
        } else {
            // strip _1, _2, _4장 etc.
            name = name.replace(/_[0-9]+[장가-힣]*$/, '');
            name = name.replace(/_[0-9]+$/, '');
        }
        
        // Parsing code
        let code = name;
        // If it starts with a number and a dot, like "1. CM24731 내추럴 화이트"
        if (/^\d+\.\s*/.test(code)) {
            code = code.replace(/^\d+\.\s*/, '');
        }
        
        // For '내지_데코_DLT 3300'
        if (code.startsWith('내지_데코_')) {
            code = code.replace('내지_데코_', '');
        }
        
        // Usually code is the first one or two words.
        // E.g. "HOT 0068 라임 스톤" -> "HOT 0068"
        // E.g. "TS5502P 우븐" -> "TS5502P"
        // E.g. "ZS83011-11 크레마" -> "ZS83011-11"
        const words = code.split(' ');
        if (words[0].match(/^[a-zA-Z]+$/) && words.length > 1 && words[1].match(/^\d+$/)) {
            // like "HOT 0068"
            code = words[0] + ' ' + words[1];
        } else if (words.length > 1) {
             let potentialCode = words[0];
             // check if words[0] has numbers. If it doesn't, it might not be a code.
             // But usually it is. e.g. "TS5502P"
             if (/\d/.test(words[0])) {
                 code = words[0];
             } else {
                 code = words[0] + (words.length > 1 && /\d/.test(words[1]) ? ' ' + words[1] : '');
             }
        }
        
        // remove weird characters for code string just in case
        let cleanCode = code.replace(/[^a-zA-Z0-9\-\_ ]/g, '').trim();
        if (!cleanCode) cleanCode = name.replace(/[^a-zA-Z0-9\-\_ ]/g, '').trim(); // fallback

        const normalizedForMatch = cleanCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        
        if (!existingCodes.has(normalizedForMatch)) {
            // temporarily add to existing to avoid duplicates across files
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

console.log(`Generating ${newMaterials.length} new materials...`);

// Format them into a JS array
let jsArrayOutput = `\n// AUTO-GENERATED NEW MATERIALS \nconst LIST_AUTO_GENERATED = [\n`;
newMaterials.forEach(m => {
    let matTypeStr = m.materialType ? `, materialType: "${m.materialType}"` : '';
    let categoryStr = m.category ? `, category: "${m.category}"` : '';
    jsArrayOutput += `  { id: "${m.code}", code: "${m.code}", name: "${m.name}", brand: "${m.brand}"${categoryStr}${matTypeStr}, price: 0 },\n`;
});
jsArrayOutput += `];\n\n`;

// Append LIST_AUTO_GENERATED and inject it into export const materials
const exportRegex = /export const materials = \[\s*/;
content = content.replace(exportRegex, jsArrayOutput + `export const materials = [\n    ...LIST_AUTO_GENERATED,\n`);

fs.writeFileSync(materialsDbPath, content, 'utf8');
console.log('Appended auto-generated materials to src/data/materials.db.js.');
