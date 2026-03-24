const fs = require('fs');

const dbPath = 'C:\\Users\\psw71\\.gemini\\antigravity\\scratch\\tokyo-flooring\\src\\data\\materials.db.js';
const content = fs.readFileSync(dbPath, 'utf8');

// Use a regex to extract the ALL_BRANDS array
const allBrandsMatch = content.match(/export const ALL_BRANDS = \[([\s\S]*?)\];/);
if (!allBrandsMatch) {
    console.error('ALL_BRANDS not found');
    process.exit(1);
}
const allBrandsStr = allBrandsMatch[1];
const allBrands = allBrandsStr.split(',').map(b => b.trim().replace(/["']/g, ''));

// Find one item from LIST_LX_2_0T
const lx20ItemMatch = content.match(/"brand":"(.*?)"/); // first match for brand
// Wait, we want LX 2.0T specifically
const lx20Regex = /"brand":"(LX 2\.0T)"/;
const match = content.match(lx20Regex);
const itemBrand = match ? match[1] : 'NOT FOUND';

console.log(`Brand in ALL_BRANDS: "${allBrands.find(b => b.includes('2.0T'))}"`);
console.log(`Brand in Data:       "${itemBrand}"`);

const chipBrand = allBrands.find(b => b.includes('2.0T'));
if (chipBrand === itemBrand) {
    console.log('THEY ARE EQUAL');
} else {
    console.log('THEY ARE NOT EQUAL!');
    console.log('Chip length:', chipBrand.length);
    console.log('Item length:', itemBrand.length);
    for (let i = 0; i < Math.max(chipBrand.length, itemBrand.length); i++) {
        console.log(`Index ${i}: charCode at Chip: ${chipBrand.charCodeAt(i)}, at Item: ${itemBrand.charCodeAt(i)}`);
    }
}
