
const { materials, LIST_LX_WALLPAPER } = require('../src/data/materials.db.js');

console.log(`LIST_LX_WALLPAPER length: ${LIST_LX_WALLPAPER.length}`);
console.log("First 5 items:");
LIST_LX_WALLPAPER.slice(0, 5).forEach(m => console.log(`  ID: ${m.id}, Brand: ${m.brand}, Name: ${m.name}`));

console.log("Last 5 items:");
LIST_LX_WALLPAPER.slice(-5).forEach(m => console.log(`  ID: ${m.id}, Brand: ${m.brand}, Name: ${m.name}`));

console.log("\nSearching for W2201 in LIST_LX_WALLPAPER:");
const found = LIST_LX_WALLPAPER.filter(m => m.id.includes("W2201"));
console.log(`Found ${found.length} matches.`);
found.forEach(m => console.log(`  ID: ${m.id}, Brand: ${m.brand}, Name: ${m.name}`));
