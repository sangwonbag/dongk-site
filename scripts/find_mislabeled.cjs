
const { materials } = require('../src/data/materials.db.js');

const mislabeled = materials.filter(m => {
    if (!m) return false;
    const isBrandLX = m.brand === "LX";
    const nameLooksLikeShinhan = /^[W]\d{4}/.test(m.code || "") || /^[W]\d{4}/.test(m.id || "");
    return isBrandLX && nameLooksLikeShinhan;
});

if (mislabeled.length > 0) {
    console.log(`Found ${mislabeled.length} mislabeled items (Brand LX but looks like Shinhan):`);
    mislabeled.slice(0, 10).forEach(m => {
        console.log(`  ID: ${m.id}, Brand: ${m.brand}, Name: ${m.name}`);
    });
} else {
    console.log("No mislabeled items found.");
}
