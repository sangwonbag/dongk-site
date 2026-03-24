
const { materials } = require('../src/data/materials.db.js');

const shinhanNames = ["아이리스", "스케치", "리빙", "패브릭", "월가드", "조이", "해피", "꿈꾸는애", "꿈꾸는", "꿈꾸"];

const mislabeled = materials.filter(m => {
    if (!m) return false;
    if (m.brand !== "LX") return false;
    const name = m.name || "";
    return shinhanNames.some(sn => name.includes(sn));
});

if (mislabeled.length > 0) {
    console.log(`Found ${mislabeled.length} items with brand 'LX' that mention Shinhan collection names:`);
    mislabeled.forEach(m => {
        console.log(`  ID: ${m.id}, Brand: ${m.brand}, Name: ${m.name}`);
    });
} else {
    console.log("No mislabeled items found by name comparison.");
}
