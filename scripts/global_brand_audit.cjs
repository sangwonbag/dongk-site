
const { materials } = require('../src/data/materials.db.js');

const categories = [...new Set(materials.map(m => m ? m.category : null).filter(Boolean))];

categories.forEach(cat => {
    console.log(`Category: ${cat}`);
    const items = materials.filter(m => m && m.category === cat);
    const brands = [...new Set(items.map(m => m.brand))];
    brands.forEach(b => {
        const count = items.filter(m => m.brand === b).length;
        console.log(`  - "${b}": ${count} items`);
        
        if (b === "LX") {
            const nonLXItems = items.filter(m => m.brand === b && !m.id.startsWith("LX"));
            if (nonLXItems.length > 0) {
                console.log(`    WARNING: Found ${nonLXItems.length} items with brand 'LX' but ID doesn't start with 'LX':`);
                nonLXItems.slice(0, 5).forEach(m => console.log(`      ID: ${m.id}, Name: ${m.name}`));
            }
        }
    });
});
