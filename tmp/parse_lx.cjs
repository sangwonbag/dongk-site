const fs = require('fs');
const path = require('path');

const lxPath = `C:/Users/psw71/.gemini/antigravity/scratch/dongk-site/public/images/Thumbnail_Image/materials/데코타일/LX`;
const housePath = path.join(lxPath, 'LX하우스');
const decoreyPath = path.join(lxPath, 'LX하우시스_데코레이S');

const lxHouseList = [];
fs.readdirSync(housePath).forEach(file => {
    if (!file.endsWith('.jpg')) return;
    const nameStr = path.basename(file, '.jpg'); // "HOT 0065 라임 스톤 미스트"
    // Extract HOT 0065 as code
    const match = nameStr.match(/^(HOT\s*\d+|HOW\s*\d+)\s*(.*)/i);
    let code = nameStr;
    if (match) {
        code = match[1].replace(/\s+/g, ''); // "HOT0065" or keep spacing? The user's other db has TW 5104G or TS5502P. Let's do HOT0065.
    }
    lxHouseList.push(`    {"id":"LX-${code}","name":"${nameStr}","code":"${code}","brand":"LX","category":"데코타일","price":0,"thickness":"3.0T","specs":{"thickness":"3.0T","size":"확인필요","packing":"확인필요"}}`);
});

const lxDecoreyList = [];
fs.readdirSync(decoreyPath).forEach(file => {
    if (!file.endsWith('.jpg')) return;
    const nameStr = path.basename(file, '.jpg'); // "내지_데코_DLT 3300"
    
    // Ignore multiples if they are duplicate rooms?
    if (nameStr.includes('_1') || nameStr.includes('_4장')) return;

    const match = nameStr.match(/DLT\s*\d+/);
    let code = nameStr;
    if (match) {
        code = match[0].replace(/\s+/g, ''); // "DLT3300"
    }
    lxDecoreyList.push(`    {"id":"LX-${code}","name":"데코레이S ${code}","code":"${code}","brand":"LX","category":"데코타일","price":0,"thickness":"3.0T","specs":{"thickness":"3.0T","size":"확인필요","packing":"확인필요"}}`);
});

console.log('const LIST_LX_HOUSE = [\n' + lxHouseList.join(',\n') + '\n];');
console.log('const LIST_LX_DECOREY_S = [\n' + lxDecoreyList.join(',\n') + '\n];');
