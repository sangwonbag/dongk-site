const fs = require('fs');
const path = require('path');

const materialsFile = 'src/data/materials.db.js';
const jsonPath = 'shinhan_files_recovery.json';

if (!fs.existsSync(jsonPath)) {
    console.error('shinhan_files_recovery.json not found!');
    process.exit(1);
}

const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
let content = fs.readFileSync(materialsFile, 'utf8');

const shinhanOrder = ['리빙', '방염', '스케치', '아이리스', '월가드', '파사드', '파인하임'];
const shinhanVarNames = {
    '리빙': 'LIST_SHINHAN_LIVING',
    '방염': 'LIST_SHINHAN_FIRE_RETARDANT',
    '스케치': 'LIST_SHINHAN_SKETCH',
    '아이리스': 'LIST_SHINHAN_IRIS',
    '월가드': 'LIST_SHINHAN_WALLGUARD',
    '파사드': 'LIST_SHINHAN_FACADE',
    '파인하임': 'LIST_SHINHAN_PINEHEIM'
};

let shinhanCode = '// --- SHINHAN AUTO GENERATED START ---\n';
shinhanCode += 'const LIST_GAENARI_2025 = []; // TODO: Recover Gaenari data if needed\n\n';

const activeVarNames = [];

shinhanOrder.forEach(name => {
    const data = jsonData[name];
    if (!data) return;

    const varNameFiles = `${shinhanVarNames[name]}_FILES`;
    const varNameList = shinhanVarNames[name];
    activeVarNames.push(varNameList);

    shinhanCode += `const ${varNameFiles} = ${JSON.stringify(data.files, null, 4)};\n`;
    shinhanCode += `const ${varNameList} = ${varNameFiles}.map(file => ({\n`;
    shinhanCode += `    id: 'SH-' + file.split('.')[0],\n`;
    shinhanCode += `    brand: "신한",\n`;
    shinhanCode += `    category: "벽지",\n`;
    shinhanCode += `    collection: "${name}",\n`;
    shinhanCode += `    code: file.split('.')[0],\n`;
    shinhanCode += `    name: file.split('.')[0],\n`;
    shinhanCode += `    price: 0,\n`;
    shinhanCode += `    image: "/images/products/${data.folder}/" + file,\n`;
    shinhanCode += `    thumbnail: "/images/products/${data.folder}/" + file,\n`;
    shinhanCode += `    cover: "/images/products/${data.folder}/" + file\n`;
    shinhanCode += `}));\n\n`;
});

shinhanCode += '// --- SHINHAN AUTO GENERATED END ---\n';

// Find the section to replace: from "// 신한벽지 컬렉션 자동 생성" to the start of "export const materials"
const placeholder = '// --- SHINHAN_SECTION_PLACEHOLDER ---';
const sectionRegex = /\/\/ 신한벽지 컬렉션 자동 생성[\s\S]*?(?=export const materials = \[)/;

if (sectionRegex.test(content)) {
    content = content.replace(sectionRegex, shinhanCode + '\n');
} else {
    // If not found, try to find line 773 area or just before export
    const exportIndex = content.indexOf('export const materials = [');
    if (exportIndex !== -1) {
        content = content.slice(0, exportIndex) + shinhanCode + '\n' + content.slice(exportIndex);
    }
}

// Update the materials export
const exportRegex = /export const materials = \[([\s\S]*?)\];/;
const exportMatch = content.match(exportRegex);

if (exportMatch) {
    let inner = exportMatch[1];

    // Clean up old Shinhan and Gaenari spreads
    inner = inner.replace(/^\s*\.\.\.LIST_SHINHAN_\w+,?\n/gm, '');
    inner = inner.replace(/^\s*\.\.\.LIST_GAENARI_2025,?\n/gm, '');

    // Ensure matKccExtended is there
    if (!inner.includes('...matKccExtended')) {
        inner = '    ...matKccExtended,\n' + inner.trimStart();
    }

    // Prepare new spreads
    const newSpreads = activeVarNames.map(v => `    ...${v}`).join(',\n') + ',\n';
    const gaenariSpread = `    ...LIST_GAENARI_2025,\n`;

    // Insert after matKccExtended
    inner = inner.replace(/(\.\.\.matKccExtended,?\n?)/, `$1${newSpreads}${gaenariSpread}`);

    // Clean up empty lines
    inner = inner.replace(/\n\s*\n/g, '\n');

    content = content.replace(exportRegex, `export const materials = [\n${inner}\n];`);
}

fs.writeFileSync(materialsFile, content, 'utf8');
console.log('Successfully refactored materials.db.js safely');
