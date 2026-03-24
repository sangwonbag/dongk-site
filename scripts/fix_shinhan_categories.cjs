const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'materials.db.js');
let content = fs.readFileSync(dbPath, 'utf8');

// 1. Fix the explicit Shinhan arrays
const arrayMap = {
    'LIST_SHINHAN_IRIS': '합지',
    'LIST_SHINHAN_PINEHEIM': '합지',
    'LIST_SHINHAN_SKETCH': '실크',
    'LIST_SHINHAN_WALLGUARD': '실크',
    'LIST_SHINHAN_LIVING': '실크',
    'LIST_SHINHAN_FACADE': '실크',
    'LIST_SHINHAN_FIRE_RETARDANT': '방염'
};

for (const [arrName, correctType] of Object.entries(arrayMap)) {
    const regex = new RegExp(`(const\\s+${arrName}\\s*=\\s*\\[)([\\s\\S]*?)(];)`, 'g');
    
    content = content.replace(regex, (match, p1, p2, p3) => {
        // Replace the materialType argument in createMaterial("...", "oldType")
        // It could also be createMaterial("...", "oldType", "...") so we specifically target the 2nd arg
        const modifiedP2 = p2.replace(/createMaterial\s*\(\s*(['"][^'"]+['"])\s*,\s*(['"][^'"]+['"])/g, `createMaterial($1, "${correctType}"`);
        return p1 + modifiedP2 + p3;
    });
}

// 2. Fix auto-generated objects for Shinhan
// Look for objects containing brand: "신한(KCC)" or "신한"
content = content.replace(/\{([^{}]*brand:\s*['"]신한(?:\(KCC\))?['"][^{}]*)\}/g, (match, inner) => {
    let newMaterialType = '실크'; // default loosely
    
    // Check name or folder text in the object string
    const textToSearch = inner.toUpperCase();
    
    if (textToSearch.includes('방염')) {
        newMaterialType = '방염';
    } else if (textToSearch.includes('아이리스') || textToSearch.includes('IRIS') || textToSearch.includes('파인하임') || textToSearch.includes('PINEHEIM')) {
        newMaterialType = '합지';
    } else if (textToSearch.includes('월가드') || textToSearch.includes('WALLGUARD') || textToSearch.includes('파사드') || textToSearch.includes('FACADE') || textToSearch.includes('리빙') || textToSearch.includes('LIVING') || textToSearch.includes('스케치') || textToSearch.includes('SKETCH')) {
        newMaterialType = '실크';
    } else {
        // User said: 신한_합지 폴더는 합지, 신한_실크는 실크, 신한_방염은 방염.
        // If it's something else, try to deduce from category folders if present
        if (textToSearch.includes('합지')) newMaterialType = '합지';
        if (textToSearch.includes('실크')) newMaterialType = '실크';
    }
    
    // Replace materialType value
    if (/materialType:\s*['"][^'"]*['"]/.test(inner)) {
        return `{${inner.replace(/materialType:\s*['"][^'"]*['"]/, `materialType: "${newMaterialType}"`)}}`;
    } else {
        return `{${inner}, materialType: "${newMaterialType}"}`;
    }
});

fs.writeFileSync(dbPath, content, 'utf8');
console.log('Successfully remapped all Shinhan wallpaper categories.');
