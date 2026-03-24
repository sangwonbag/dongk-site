
const { materials } = require('../src/data/materials.db.js');
const { getComputedBrand } = require('../src/utils/brandUtils.js');

const activeTab = "벽지";
const activeBrand = "LX";

const filtered = materials.filter(m => {
    if (!m) return false;
    const tabOk = (m.category === activeTab);
    const mComputedBrand = getComputedBrand(m);
    const brandOk = (activeBrand === "all") ? true : (mComputedBrand === activeBrand);
    return tabOk && brandOk;
});

console.log(`Filter Result for category "${activeTab}" and brand "${activeBrand}":`);
console.log(`Total filtered: ${filtered.length}`);

const crossBrand = filtered.filter(m => m.brand === "신한(KCC)");
if (crossBrand.length > 0) {
    console.log(`\nCRITICAL: Found ${crossBrand.length} items with brand '신한(KCC)' that passed the 'LX' filter!`);
    crossBrand.slice(0, 5).forEach(m => {
        console.log(`  ID: ${m.id}, Name: ${m.name}, Computed Brand: ${getComputedBrand(m)}`);
    });
} else {
    console.log("\nNo cross-brand leakage detected in this script.");
}
