const fs = require('fs');

const dbPath = 'C:\\Users\\psw71\\.gemini\\antigravity\\scratch\\tokyo-flooring\\src\\data\\materials.db.js';
let content = fs.readFileSync(dbPath, 'utf8');

// 1. Fix truncated names like "은행목 1" or "지아사랑애 1"
// These were caused by matching code with suffix. 
// Logic: If name ends with " 1", " 2", " 3", remove it.
content = content.replace(/"name":\s*"(은행목|지아사랑애|뉴청맥|지아소리잠|엑스컴포트)\s+\d"/g, (match, p1) => {
    return `"name":"${p1}"`;
});

// 2. Standardize brand strings for LX Jangpan
// Ensure they all have the space and match the chips exactly.
const brandsToFix = [
    { from: 'LX1.8T', to: 'LX 1.8T' },
    { from: 'LX2.0T', to: 'LX 2.0T' },
    { from: 'LX2.2T', to: 'LX 2.2T' },
    { from: 'LX2.7T', to: 'LX 2.7T' },
    { from: 'LX3.2T', to: 'LX 3.2T' },
    { from: 'LX4.5T', to: 'LX 4.5T' },
    { from: 'LX5.0T', to: 'LX 5.0T' }
];

for (const b of brandsToFix) {
    // Replace with double quotes to match chips
    content = content.split(`'brand':'${b.from}'`).join(`'brand':'${b.to}'`);
    content = content.split(`'brand': '${b.from}'`).join(`'brand': '${b.to}'`);
    content = content.split(`"brand":"${b.from}"`).join(`"brand":"${b.to}"`);
    content = content.split(`"brand": "${b.from}"`).join(`"brand": "${b.to}"`);
    
    // Also catch any without spaces if they exist
    content = content.split(`brand:"${b.from}"`).join(`brand:"${b.to}"`);
    content = content.split(`brand: "${b.from}"`).join(`brand: "${b.to}"`);
}

// 3. Ensure materials export includes everything and is clean
if (!content.includes('...LIST_LX_5_0T')) {
    // Add it after 4.5T
    content = content.replace('...LIST_LX_4_5T', '...LIST_LX_4_5T,\n    ...LIST_LX_5_0T');
}
if (!content.includes('...LIST_GAENARI_2025')) {
    content = content.replace('...LIST_LX_WALLPAPER,', '...LIST_LX_WALLPAPER,\n    ...LIST_GAENARI_2025,');
}

// 4. Final deduplication of export array just in case
// (Not strictly necessary if I'm careful, but good to have)

fs.writeFileSync(dbPath, content, 'utf8');
console.log('Final surgical polish applied: Names fixed, Brands standardized, Export updated.');
