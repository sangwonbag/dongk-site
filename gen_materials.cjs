const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/psw71/.gemini/antigravity/scratch/tokyo-flooring/public/images/products';
const JANGPAN_PRICES = {
    "1.8T": 11000,
    "2.0T": 17000,
    "2.2T": 22000,
    "2.7T": 32000,
    "3.2T": 36000,
    "4.5T": 44000,
    "5.0T": 50000
};

const folders = [
    { dir: 'LX하우시스_뉴청맥_1.8T', thickness: '1.8T', brand: 'LX1.8T', line: '뉴청맥' },
    { dir: 'LX하우시스_은행목_2T', thickness: '2.0T', brand: 'LX2.0T', line: '은행목' },
    { dir: 'LX하우시스_지아사랑애2.7T', thickness: '2.7T', brand: 'LX2.7T', line: '지아사랑애' },
    { dir: 'LX하우시스_지아사랑애_3.2T', thickness: '3.2T', brand: 'LX3.2T', line: '지아사랑애' },
    { dir: 'LX하우시스_지아소리잠_4.5T', thickness: '4.5T', brand: 'LX4.5T', line: '지아소리잠' }
];

let allMaterials = {};

folders.forEach(f => {
    const fullPath = path.join(baseDir, f.dir);
    if (!fs.existsSync(fullPath)) return;

    const files = fs.readdirSync(fullPath);
    const listName = `LIST_LX_${f.thickness.replace('.', '_')}`;
    allMaterials[listName] = [];

    const seenCodes = new Set();
    files.forEach(file => {
        if (!file.endsWith('.jpg') && !file.endsWith('.png')) return;

        let code = '';
        let name = '';

        // Pattern 1: "1. CM24731 내추럴 화이트.jpg"
        const dotMatch = file.match(/^\d+\.\s+([^\s]+)\s+(.+)\.(jpg|png)$/);
        // Pattern 2: "ZH50011_오크.jpg"
        const underMatch = file.match(/^([^\s_]+)[_\s](.+)\.(jpg|png)$/);
        // Pattern 3: "50011-오크.jpg"
        const dashMatch = file.match(/^([^\s-]+)-(.+)\.(jpg|png)$/);

        if (dotMatch) {
            code = dotMatch[1];
            name = dotMatch[2];
        } else if (underMatch) {
            code = underMatch[1];
            name = underMatch[2];
        } else if (dashMatch) {
            code = dashMatch[1];
            name = dashMatch[2];
        }

        if (code && !seenCodes.has(code)) {
            seenCodes.add(code);
            allMaterials[listName].push({
                id: `LX-${code}`,
                name: `${f.line} ${name}`,
                code: code,
                brand: f.brand,
                category: "장판",
                price: JANGPAN_PRICES[f.thickness],
                thickness: f.thickness,
                specs: {
                    thickness: f.thickness,
                    size: "1.83m x 롤단위",
                    packing: "m 단위 절단 판매"
                }
            });
        }
    });
});

Object.keys(allMaterials).forEach(key => {
    console.log(`const ${key} = ${JSON.stringify(allMaterials[key], null, 4)};\n`);
});
