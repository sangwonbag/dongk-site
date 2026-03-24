
const { materials } = require('../src/data/materials.db.js');

const idMap = new Map();
const duplicates = [];

materials.forEach((m, index) => {
    if (!m || !m.id) return;
    if (idMap.has(m.id)) {
        duplicates.push({
            id: m.id,
            first: idMap.get(m.id),
            second: { brand: m.brand, name: m.name, index }
        });
    } else {
        idMap.set(m.id, { brand: m.brand, name: m.name, index });
    }
});

if (duplicates.length > 0) {
    console.log(`Found ${duplicates.length} duplicate IDs:`);
    duplicates.slice(0, 10).forEach(d => {
        console.log(`ID: ${d.id}`);
        console.log(`  1: Index ${d.first.index}, Brand: ${d.first.brand}, Name: ${d.first.name}`);
        console.log(`  2: Index ${d.second.index}, Brand: ${d.second.brand}, Name: ${d.second.name}`);
    });
} else {
    console.log("No duplicate IDs found.");
}
