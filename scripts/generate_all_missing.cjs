const fs = require('fs');
const path = require('path');

const materialsDbPath = path.join(__dirname, '..', 'src', 'data', 'materials.db.js');
const thumbDir = path.join(__dirname, '..', 'public', 'images', 'Thumbnail_Image');

let content = fs.readFileSync(materialsDbPath, 'utf8');

const existingCodesRegex = /code:\s*["']([^"']+)["']/g;
const existingCodes = new Set();
let match;
while ((match = existingCodesRegex.exec(content)) !== null) {
    existingCodes.add(match[1].replace(/\s+/g, '').toUpperCase());
}

const folders = fs.readdirSync(thumbDir).filter(f => fs.statSync(path.join(thumbDir, f)).isDirectory());

const newMaterials = [];

// Helper to determine brand and category mapping
function getBrandAndCategory(folder) {
    if (folder.includes('KCC')) return { brand: 'KCC', category: '데코타일' };
    if (folder.includes('dongshin')) return { brand: '동신', category: '데코타일' };
    
    if (folder.includes('신한벽지_방염')) return { brand: '신한(KCC)', category: '벽지', materialType: '방염' };
    if (folder.includes('신한벽지_실크') || folder.includes('LIVING') || folder.includes('SKETCH') || folder.includes('WALLGUARD') || folder.includes('파인하임')) return { brand: '신한(KCC)', category: '벽지', materialType: '실크' };
    if (folder.includes('IRIS') || folder.includes('아이리스')) return { brand: '신한(KCC)', category: '벽지', materialType: '합지' };
    // fallback for other shinhan
    if (folder.includes('신한')) return { brand: '신한(KCC)', category: '벽지', materialType: '실크' };

    if (folder.includes('LX하우시스_뉴청맥_1.8T')) return { brand: 'LX 1.8T', category: '장판' };
    if (folder.includes('LX하우시스_은행목_2.0T') || folder.includes('은행목_2T')) return { brand: 'LX 2.0T', category: '장판' };
    if (folder.includes('LX하우시스_지아사랑애2.7T') || folder.includes('지아사랑애_2.7T')) return { brand: 'LX 2.7T', category: '장판' };
    if (folder.includes('LX하우시스_지아사랑애_3.2T')) return { brand: 'LX 3.2T', category: '장판' };
    if (folder.includes('LX하우시스_지아소리잠_4.5T')) return { brand: 'LX 4.5T', category: '장판' };

    // Other LX stuff
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
        
        let nameWithoutExt = path.parse(file).name;
        let isKccCover = false;
        
        if (brand === 'KCC') {
            if (!nameWithoutExt.endsWith('_0')) return; // KCC condition
            isKccCover = true;
            nameWithoutExt = nameWithoutExt.replace(/_0$/, '');
        } else {
            // For others, strip _1, _2, _0, etc.
            nameWithoutExt = nameWithoutExt.replace(/_[0-9]+$/, '');
            // Shinhan wallpapers often have spaces like "15104-1 화이트" -> "15104-1 화이트"
        }
        
        // Code is usually the first part before space or hyphen if it's a long name, 
        // but for wallpapers it's usually the full first word. Let's just use the first word as code.
        let code = nameWithoutExt.split(' ')[0];
        
        // Some codes in LX are like ZS80021-11
        // Some codes in Dongshin: AB6711
        
        if (!items.has(code)) {
            items.set(code, {
                code: code,
                name: nameWithoutExt,
                brand,
                category,
                materialType: materialType || "",
                folder
            });
        }
    });

    for (const [code, item] of items.entries()) {
        const normalizedCode = code.replace(/\s+/g, '').toUpperCase();
        if (!existingCodes.has(normalizedCode)) {
            newMaterials.push(item);
            existingCodes.add(normalizedCode);
        }
    }
});

console.log(`Generating ${newMaterials.length} new materials...`);

// Format them into a JS array
let jsArrayOutput = `\n// AUTO-GENERATED NEW MATERIALS \nconst LIST_AUTO_GENERATED = [\n`;
newMaterials.forEach(m => {
    jsArrayOutput += `  { id: "${m.code}", code: "${m.code}", name: "${m.name}", brand: "${m.brand}", category: "${m.category}", materialType: "${m.materialType}", price: 0 },\n`;
});
jsArrayOutput += `];\n\n`;

// Append LIST_AUTO_GENERATED and inject it into export const materials
const exportRegex = /export const materials = \[\s*/;
content += jsArrayOutput;
content = content.replace(exportRegex, `export const materials = [\n    ...LIST_AUTO_GENERATED,\n`);

fs.writeFileSync(materialsDbPath, content, 'utf8');
console.log('Appended auto-generated materials to src/data/materials.db.js.');
