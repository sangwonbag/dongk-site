const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'materials.db.js');
let content = fs.readFileSync(dbPath, 'utf8');

// The ultimate categorization rules:
// 합지: 아이리스, 파인하임
// 실크: 월가드, 파사드, 리빙, 스케치
// 방염: 방염벽지

function getTrueType(nameOrCode) {
    if (!nameOrCode) return null;
    const str = nameOrCode.toUpperCase();
    if (str.includes('아이리스') || str.includes('IRIS') || str.includes('파인하임') || str.includes('PINEHEIM')) return '합지';
    if (str.includes('월가드') || str.includes('WALLGUARD') || str.includes('파사드') || str.includes('FACADE') || str.includes('리빙') || str.includes('LIVING') || str.includes('스케치') || textToSearch.includes('SKETCH')) return '실크';
    if (str.includes('방염')) return '방염';
    return null;
}

// 1. Process explicit arrays first
const arrayMap = {
    'LIST_SHINHAN_IRIS': '합지',
    'LIST_SHINHAN_PINEHEIM': '합지',
    'LIST_SHINHAN_SKETCH': '실크',
    'LIST_SHINHAN_WALLGUARD': '실크',
    'LIST_SHINHAN_LIVING': '실크',
    'LIST_SHINHAN_FACADE': '실크',
    'LIST_SHINHAN_FIRE_RETARDANT': '방염'
};

for (const [arrName, categoryType] of Object.entries(arrayMap)) {
    const regex = new RegExp(`(const\\s+${arrName}\\s*=\\s*\\[)([\\s\\S]*?)(];)`, 'g');
    
    content = content.replace(regex, (match, p1, p2, p3) => {
        // Fix the materialType inside the array's items
        let newItemsContext = p2;
        
        // Items are created via `createMaterial("...", "oldType")`
        newItemsContext = newItemsContext.replace(/createMaterial\s*\(\s*(['"][^'"]+['"])\s*,\s*(['"][^'"]+['"])/g, (m, arg1, arg2) => {
            // arg1 is the code/name, let's see if we can deduce from it over the array default
            let trueType = getTrueType(arg1);
            if (!trueType) trueType = categoryType;
            return `createMaterial(${arg1}, "${trueType}"`;
        });
        
        // Also modify any manually assigned objects within the array block
        newItemsContext = newItemsContext.replace(/materialType:\s*['"][^'"]+['"]/g, `materialType: "${categoryType}"`);
        
        return p1 + newItemsContext + p3;
    });
}

// Ensure `brand` and `materialType` for auto-generated items
// We need to parse every single object in the db that is a Shinhan item and strictly enforce type
content = content.replace(/\{([^{}]*brand:\s*['"]신한(?:\(KCC\))?['"][^{}]*)\}/g, (match, inner) => {
    let nameMatch = inner.match(/name:\s*['"]([^'"]+)['"]/);
    let codeMatch = inner.match(/code:\s*['"]([^'"]+)['"]/);
    let folderMatch = inner.match(/folder:\s*['"]([^'"]+)['"]/);
    
    let textToAnalyze = (nameMatch ? nameMatch[1] : '') + ' ' + (codeMatch ? codeMatch[1] : '') + ' ' + (folderMatch ? folderMatch[1] : '');
    textToAnalyze = textToAnalyze.toUpperCase();
    
    let trueType = '실크'; // Fallback
    
    if (textToAnalyze.includes('방염')) {
        trueType = '방염';
    } else if (textToAnalyze.includes('아이리스') || textToAnalyze.includes('IRIS') || textToAnalyze.includes('파인하임') || textToAnalyze.includes('PINEHEIM')) {
        trueType = '합지';
    } else if (textToAnalyze.includes('월가드') || textToAnalyze.includes('WALLGUARD') || textToAnalyze.includes('파사드') || textToAnalyze.includes('FACADE') || textToAnalyze.includes('리빙') || textToAnalyze.includes('LIVING') || textToAnalyze.includes('스케치') || textToAnalyze.includes('SKETCH')) {
        trueType = '실크';
    }
    
    if (/materialType:\s*['"][^'"]*['"]/.test(inner)) {
        return `{${inner.replace(/materialType:\s*['"][^'"]*['"]/, `materialType: "${trueType}"`)}}`;
    } else {
        return `{${inner}, materialType: "${trueType}"}`;
    }
});

fs.writeFileSync(dbPath, content, 'utf8');
console.log('Strict categorization rules fully enforced for Shinhan Wallpapers.');
