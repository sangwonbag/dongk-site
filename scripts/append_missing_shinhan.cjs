const fs = require('fs');
const path = require('path');

const DB_PATH = 'src/data/materials.db.js';
let dbContent = fs.readFileSync(DB_PATH, 'utf8');

const baseDir = 'public/images/cover';

const mapping = [
    { folder: '신한벽지_리빙(LIVING)', listName: 'LIST_SHINHAN_LIVING', type: '실크', prefix: '' },
    { folder: '신한벽지_방염', listName: 'LIST_SHINHAN_FIRE_RETARDANT', type: '방염', prefix: '' },
    { folder: '신한벽지_스케치(SKETCH)', listName: 'LIST_SHINHAN_SKETCH', type: '실크', prefix: '' },
    { folder: '신한벽지_아이리스(IRIS)', listName: 'LIST_SHINHAN_IRIS', type: '합지', prefix: '' }
];

let totalAdded = 0;

mapping.forEach(m => {
    const dir = path.join(baseDir, m.folder);
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    
    // Extract existing codes
    const startStr = `const ${m.listName} = [`;
    const startIndex = dbContent.indexOf(startStr);
    if (startIndex === -1) {
        console.log(`List ${m.listName} not found!`);
        return;
    }
    
    let endIndex = startIndex + startStr.length;
    let bracketCount = 1;
    for (; endIndex < dbContent.length; endIndex++) {
        if (dbContent[endIndex] === '[') bracketCount++;
        if (dbContent[endIndex] === ']') bracketCount--;
        if (bracketCount === 0) break;
    }
    
    const existingListStr = dbContent.slice(startIndex, endIndex + 1);
    const existingCodes = new Set();
    const idMatches = existingListStr.match(/code:\s*["']([^"']+)["']/g);
    if (idMatches) {
        idMatches.forEach(match => {
            const code = match.match(/["']([^"']+)["']/)[1];
            existingCodes.add(code);
        });
    }

    let toAdd = [];
    files.forEach(file => {
        if (!file.endsWith('.jpg') && !file.endsWith('.png')) return;
        
        let code = '';
        let namePart = '';
        
        const spaceIdx = file.indexOf(' ');
        if (spaceIdx !== -1) {
            code = file.substring(0, spaceIdx);
            namePart = file.replace(/\.(jpg|png)$/i, '');
        } else {
            code = file.replace(/\.(jpg|png)$/i, '');
            namePart = code;
        }

        if (code && !existingCodes.has(code)) {
            // Add item
            const itemStr = `\n    { id: "${code}", code: "${code}", name: "${namePart}", brand: "신한(KCC)", category: "벽지", materialType: "${m.type}", price: 0 }`;
            toAdd.push(itemStr);
            existingCodes.add(code);
            totalAdded++;
        }
    });

    if (toAdd.length > 0) {
        // Insert before the closing bracket
        const insertPos = endIndex;
        const insertStr = (existingListStr.trim().endsWith('[') ? '' : ',') + toAdd.join(',');
        
        dbContent = dbContent.slice(0, insertPos) + insertStr + dbContent.slice(insertPos);
        console.log(`Added ${toAdd.length} missing items to ${m.listName}`);
    } else {
        console.log(`All items from ${m.folder} already exist in ${m.listName}`);
    }
});

fs.writeFileSync(DB_PATH, dbContent);
console.log(`Total missing items added: ${totalAdded}`);
