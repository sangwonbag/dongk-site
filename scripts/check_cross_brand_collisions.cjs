
const { materials } = require('../src/data/materials.db.js');

const lxItems = materials.filter(m => m && m.brand === "LX");
const shinhanItems = materials.filter(m => m && m.brand === "신한(KCC)");

const lxCodes = new Set(lxItems.map(m => m.code).filter(Boolean));
const shinhanCodes = new Set(shinhanItems.map(m => m.code).filter(Boolean));

const intersection = [...lxCodes].filter(c => shinhanCodes.has(c));

if (intersection.length > 0) {
    console.log(`Found ${intersection.length} product codes that exist in BOTH LX and Shinhan brands:`);
    intersection.forEach(code => {
        const lx = lxItems.find(m => m.code === code);
        const shinhan = shinhanItems.find(m => m.code === code);
        console.log(`  Code: ${code}`);
        console.log(`    LX ID: ${lx.id}, Name: ${lx.name}`);
        console.log(`    Shinhan ID: ${shinhan.id}, Name: ${shinhan.name}`);
    });
} else {
    console.log("No cross-brand code collisions found.");
}
