const fs = require('fs');
const path = require('path');

const materialsDbPath = path.join(__dirname, '..', 'src', 'data', 'materials.db.js');
const lxWallpaperDir = path.join(__dirname, '..', 'public', 'images', 'Thumbnail_Image', '벽지', 'LX');

function getFiles(dir, allFiles = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, allFiles);
        } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
            allFiles.push({
                fullPath: name,
                file: file,
                folder: path.basename(dir)
            });
        }
    });
    
    return allFiles;
}

const files = getFiles(lxWallpaperDir);
console.log(`Found ${files.length} LX wallpaper images.`);

const existingContent = fs.readFileSync(materialsDbPath, 'utf8');
const existingCodesRegex = /code:\s*["']([^"']+)["']/g;
const existingCodes = new Set();
let match;
while ((match = existingCodesRegex.exec(existingContent)) !== null) {
    existingCodes.add(match[1]);
}

const newMaterials = [];
const seenCodes = new Set();

files.forEach(f => {
    // Filename: PR002-01.jpg -> code: PR002-01
    const code = path.parse(f.file).name.replace(/^고\)/, '').trim(); 
    
    if (seenCodes.has(code) || existingCodes.has(code)) return;
    seenCodes.add(code);

    let materialType = "실크"; // Default
    if (f.folder.includes('합지')) materialType = "합지";
    
    const collectionName = f.folder.replace('LX_', '');

    newMaterials.push({
        id: `LXW-${code}`,
        code: code,
        name: `${collectionName} ${code}`,
        brand: "LX",
        category: "벽지",
        materialType: materialType,
        collection: collectionName
    });
});

if (newMaterials.length === 0) {
    console.log("No new materials to add.");
    process.exit(0);
}

console.log(`Adding ${newMaterials.length} new LX wallpaper materials...`);

let output = `\n// LX WALLPAPER AUTO-GENERATED\nconst LIST_LX_WALLPAPER = [\n`;
newMaterials.forEach(m => {
    output += `  { id: "${m.id}", code: "${m.code}", name: "${m.name}", brand: "${m.brand}", category: "${m.category}", materialType: "${m.materialType}", price: 0 },\n`;
});
output += `];\n`;

// Append constants
let updatedContent = existingContent.replace(/\/\/\s*AUTO-GENERATED NEW MATERIALS/, output + "\n// AUTO-GENERATED NEW MATERIALS");

// Update materials array
const materialsArrayRegex = /export const materials = \[\s*/;
updatedContent = updatedContent.replace(materialsArrayRegex, `export const materials = [\n    ...LIST_LX_WALLPAPER,\n`);

fs.writeFileSync(materialsDbPath, updatedContent, 'utf8');
console.log("Successfully updated materials.db.js");
