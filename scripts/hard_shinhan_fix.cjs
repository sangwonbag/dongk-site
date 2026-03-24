const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'materials.db.js');
let content = fs.readFileSync(dbPath, 'utf8');

// 1. Remove ANY shinhan-related auto-generated material to avoid duplicates or misclassifications
const autoRegex = /\{[^}]*brand:\s*['"]신한(?:\(KCC\))?['"][^}]*\}[,]?/g;
content = content.replace(autoRegex, '');
// Clean up trailing commas in lists
content = content.replace(/,\s*]/g, '\n]');

// 2. We will generate the strict lists from the thumbnail folders directly
const baseThumbDir = path.join(__dirname, '..', 'public', 'images', 'Thumbnail_Image', '벽지', '신한');
const folders = [];

function collectFolders(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const fullPath = path.join(dir, entry.name);
            folders.push({ name: entry.name, path: fullPath });
            collectFolders(fullPath);
        }
    }
}
collectFolders(baseThumbDir);

const shinhanData = {
    '합지': {
        'LIST_SHINHAN_IRIS': [],
        'LIST_SHINHAN_PINEHEIM': []
    },
    '실크': {
        'LIST_SHINHAN_SKETCH': [],
        'LIST_SHINHAN_WALLGUARD': [],
        'LIST_SHINHAN_LIVING': [],
        'LIST_SHINHAN_FACADE': []
    },
    '방염': {
        'LIST_SHINHAN_FIRE_RETARDANT': []
    }
};

// Map folder to array name and type
function getArrayInfo(folder) {
    if (folder.includes('아이리스') || folder.includes('IRIS')) return ['합지', 'LIST_SHINHAN_IRIS'];
    if (folder.includes('파인하임')) return ['합지', 'LIST_SHINHAN_PINEHEIM'];
    
    if (folder.includes('스케치') || folder.includes('SKETCH')) return ['실크', 'LIST_SHINHAN_SKETCH'];
    if (folder.includes('월가드') || folder.includes('WALLGUARD')) return ['실크', 'LIST_SHINHAN_WALLGUARD'];
    if (folder.includes('리빙') || folder.includes('LIVING')) return ['실크', 'LIST_SHINHAN_LIVING'];
    if (folder.includes('파사드') || folder.includes('FACADE')) return ['실크', 'LIST_SHINHAN_FACADE'];
    
    if (folder.includes('방염')) return ['방염', 'LIST_SHINHAN_FIRE_RETARDANT'];
    
    return [null, null];
}

folders.forEach(folderObj => {
    const [matType, arrName] = getArrayInfo(folderObj.name);
    if (!matType) return;
    
    const files = fs.readdirSync(folderObj.path);
    files.forEach(file => {
        if (!/\.(jpg|jpeg|png)$/i.test(file)) return;
        
        // e.g. "15104-1 화이트.jpg" -> name: "15104-1 화이트", code: "15104-1"
        let name = path.parse(file).name;
        // Strip _1, _2
        name = name.replace(/_[0-9]+$/, '');
        
        let code = name.split(' ')[0];
        
        shinhanData[matType][arrName].push({
            code: code,
            name: name,
            brand: '신한(KCC)',
            category: '벽지',
            materialType: matType,
            folder: folderObj.name
        });
    });
});

// Deduplicate arrays
for (const type in shinhanData) {
    for (const arrName in shinhanData[type]) {
         const unique = [];
         const codes = new Set();
         for (const item of shinhanData[type][arrName]) {
             if (!codes.has(item.code)) {
                 unique.push(item);
                 codes.add(item.code);
             }
         }
         shinhanData[type][arrName] = unique;
    }
}

// Check if these array declarations exist and wipe them
const arrNames = [
    'LIST_SHINHAN_IRIS', 'LIST_SHINHAN_PINEHEIM',
    'LIST_SHINHAN_SKETCH', 'LIST_SHINHAN_WALLGUARD',
    'LIST_SHINHAN_LIVING', 'LIST_SHINHAN_FACADE',
    'LIST_SHINHAN_FIRE_RETARDANT'
];

arrNames.forEach(arrName => {
    // We want to replace the whole block `const LIST_SHINHAN_... = [ ... ];`
    const regex = new RegExp(`const\\s+${arrName}\\s*=\\s*\\[[\\s\\S]*?\\];`, 'g');
    content = content.replace(regex, '');
});

// Create the new string block to inject
let newDeclarations = '\n// ====== STRICT SHINHAN WALLPAPER ARRAYS ======\n';
for (const type in shinhanData) {
    for (const arrName in shinhanData[type]) {
         newDeclarations += `const ${arrName} = [\n`;
         shinhanData[type][arrName].forEach(item => {
             newDeclarations += `  { id: "${item.code}", code: "${item.code}", name: "${item.name}", brand: "${item.brand}", category: "${item.category}", materialType: "${item.materialType}", price: 0 },\n`;
         });
         newDeclarations += `];\n\n`;
    }
}

// Inject right before export const materials = [
content = content.replace(/export const materials = \[/g, newDeclarations + 'export const materials = [');

fs.writeFileSync(dbPath, content, 'utf8');
console.log('Strict Shinhan arrays generated and hardcoded into materials.db.js.');
