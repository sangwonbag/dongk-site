const fs = require('fs');
const path = require('path');

const materialsDbPath = path.join(__dirname, '..', 'src', 'data', 'materials.db.js');
const lxJangpanDir = path.join(__dirname, '..', 'public', 'images', 'cover', 'materials', '장판', 'LX하우시스_지아자연애_2.2T');

const files = fs.readdirSync(lxJangpanDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
console.log(`Found ${files.length} LX 2.2T Jangpan images.`);

const newMaterials = [];

files.forEach(file => {
    const nameWithoutExt = path.parse(file).name;
    // Format: ZJ32981-11-화이트-오크 -> code: ZJ32981-11
    const parts = nameWithoutExt.split('-');
    let code = parts[0];
    if (parts.length > 1 && /^\d+$/.test(parts[1])) {
        code = `${parts[0]}-${parts[1]}`;
    }
    
    // The rest is the descriptive name
    const descriptiveName = parts.slice(code.includes('-') ? 2 : 1).join(' ');

    newMaterials.push({
        id: `LXJ-${code}`,
        code: code,
        name: `지아자연애 ${descriptiveName || code}`,
        brand: "LX 2.2T",
        category: "장판",
        thickness: "2.2T",
        price: 22000
    });
});

console.log(`Generating ${newMaterials.length} LX 2.2T Jangpan materials...`);

let output = `const LIST_LX_2_2T = [\n`;
newMaterials.forEach(m => {
    // USE UNQUOTED KEYS for compatibility with manifest generator regex
    output += `    { id: '${m.id}', name: '${m.name}', code: '${m.code}', brand: '${m.brand}', category: '${m.category}', price: ${m.price}, thickness: '${m.thickness}', specs: { thickness: '${m.thickness}', size: '1.83m x 롤단위', packing: 'm 단위 절단 판매' } },\n`;
});
output += `];\n`;

let content = fs.readFileSync(materialsDbPath, 'utf8');

// Replace the previous LIST_LX_2_2T (might not be empty anymore if I'm rerunning)
const targetRegex = /const LIST_LX_2_2T = \[[\s\S]*?\];/;
if (!targetRegex.test(content)) {
    console.error("Could not find LIST_LX_2_2T in materials.db.js");
    process.exit(1);
}

content = content.replace(targetRegex, output);

fs.writeFileSync(materialsDbPath, content, 'utf8');
console.log("Successfully updated materials.db.js");
