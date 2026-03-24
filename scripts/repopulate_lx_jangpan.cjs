const fs = require('fs');
const path = require('path');

const dbPath = 'C:\\Users\\psw71\\.gemini\\antigravity\\scratch\\tokyo-flooring\\src\\data\\materials.db.js';
const thumbBase = 'C:\\Users\\psw71\\.gemini\\antigravity\\scratch\\tokyo-flooring\\public\\images\\Thumbnail_Image\\장판';

const configs = [
    { folder: 'LX하우시스_뉴청맥_1.8T', varName: 'LIST_LX_1_8T', brand: 'LX 1.8T', namePrefix: '뉴청맥', price: 11000, thickness: '1.8T', subfolder: '' },
    { folder: 'LX하우시스_은행목_2.0T', varName: 'LIST_LX_2_0T', brand: 'LX 2.0T', namePrefix: '은행목', price: 17000, thickness: '2.0T', subfolder: '' },
    { folder: 'LX하우시스_지아사랑애_2.7T', varName: 'LIST_LX_2_7T', brand: 'LX 2.7T', namePrefix: '지아사랑애', price: 32000, thickness: '2.7T', subfolder: '' },
    { folder: 'LX하우시스_지아사랑애_3.2T', varName: 'LIST_LX_3_2T', brand: 'LX 3.2T', namePrefix: '지아사랑애', price: 36000, thickness: '3.2T', subfolder: '' },
    { folder: 'LX하우시스_지아소리잠_4.5T', varName: 'LIST_LX_4_5T', brand: 'LX 4.5T', namePrefix: '지아소리잠', price: 48000, thickness: '4.5T', subfolder: '' },
    { folder: 'LX하우시스_엑스컴포트_5.0T', varName: 'LIST_LX_5_0T', brand: 'LX 5.0T', namePrefix: '엑스컴포트', price: 55000, thickness: '5.0T', subfolder: '엑스컴포트' },
];

let dbContent = fs.readFileSync(dbPath, 'utf8');

function parseFilename(file) {
    // Remove extension
    const nameOnly = file.replace(/\.(jpg|png)$/i, '');
    
    // Pattern 1: "1. CM24731 내추럴 화이트" or "1. EH14721 클라우드 크림 (1)"
    // Group 1: Number (optional)
    // Group 2: Code
    // Group 3: Display Name
    const p1 = nameOnly.match(/^(\d+\.)?\s*([A-Z0-9-]{3,})\s+(.+?)(?:\s+\(\d+\))?$/);
    if (p1) {
        return { code: p1[2].trim(), disp: p1[3].trim() };
    }

    // Pattern 2: "CODE-NAME" or "CODE_NAME"
    if (nameOnly.includes('-')) {
        const parts = nameOnly.split('-');
        return { code: parts[0].trim(), disp: parts[1].trim() };
    }
    if (nameOnly.includes('_')) {
        const parts = nameOnly.split('_');
        return { code: parts[0].trim(), disp: parts[1].trim() };
    }

    // fallback
    return { code: nameOnly.trim(), disp: '' };
}

for (const config of configs) {
    const dirPath = path.join(thumbBase, config.folder, config.subfolder);
    if (!fs.existsSync(dirPath)) {
        console.warn(`Directory not found: ${dirPath}`);
        continue;
    }

    const files = fs.readdirSync(dirPath);
    const items = [];
    const seenCodes = new Set();

    for (const file of files) {
        if (!file.toLowerCase().endsWith('.jpg') && !file.toLowerCase().endsWith('.png')) continue;
        
        // Skip variant files like CODE_1.jpg if they aren't the primary descriptor
        // but wait, some primary files MIGHT have _ or -
        // If it's just "CODE_1.jpg", "CODE_2.jpg" with no description, skip.
        if (file.match(/^[A-Z0-9-]+_\d\.(jpg|png)$/i)) continue;

        const { code, disp } = parseFilename(file);
        
        if (seenCodes.has(code)) continue;
        seenCodes.add(code);

        const fullName = disp ? `${config.namePrefix} ${disp}` : config.namePrefix;

        items.push({
            id: `LX-${code}`,
            name: fullName,
            code: code,
            brand: config.brand,
            category: '장판',
            price: config.price,
            thickness: config.thickness,
            specs: {
                thickness: config.thickness,
                size: '1.83m x 롤단위',
                packing: 'm 단위 절단 판매'
            }
        });
    }

    // Generate the block
    const itemsStr = items.map(item => `    ${JSON.stringify(item)}`).join(',\n');
    const newListBlock = `const ${config.varName} = [\n${itemsStr}\n];`;

    // Replace the existing block in dbContent
    const blockRegex = new RegExp(`const\\s+${config.varName}\\s*=\\s*\\[[\\s\\S]*?\\n\\];`, 'm');
    
    if (dbContent.match(blockRegex)) {
        dbContent = dbContent.replace(blockRegex, newListBlock);
        console.log(`Updated ${config.varName}`);
    } else {
        // Fallback insertion
        dbContent = dbContent.replace('// --- STUBS FOR MISSING LISTS ---', `// --- STUBS FOR MISSING LISTS ---\n${newListBlock}\n`);
        console.log(`Inserted ${config.varName}`);
    }
}

// Final standardization of brands (just in case)
const brandsToFix = ["1.8T", "2.0T", "2.2T", "2.7T", "3.2T", "4.5T", "5.0T"];
for (const t of brandsToFix) {
    const target = `LX ${t}`;
    const mistake = `LX${t}`;
    dbContent = dbContent.split(`"brand":"${mistake}"`).join(`"brand":"${target}"`);
}

fs.writeFileSync(dbPath, dbContent, 'utf8');
console.log('Successfully repopulated LX Jangpan lists with robust parsing.');
