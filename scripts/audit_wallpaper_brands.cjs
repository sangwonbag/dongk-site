
const { materials } = require('../src/data/materials.db.js');

const wallpaper = materials.filter(m => m && m.category === "벽지");
const brands = [...new Set(wallpaper.map(m => m.brand))];

console.log("Unique brands in '벽지' category:");
brands.forEach(b => {
    const count = wallpaper.filter(m => m.brand === b).length;
    console.log(`  - "${b}": ${count} items`);
});

console.log("\nItems with brand 'LX' that might be Shinhan (checking ID):");
wallpaper.filter(m => m.brand === "LX" && !m.id.startsWith("LXW")).forEach(m => {
    console.log(`  ID: ${m.id}, Name: ${m.name}`);
});
