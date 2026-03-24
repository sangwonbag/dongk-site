const fs = require('fs');
const file = 'src/data/materials.db.js';
let content = fs.readFileSync(file, 'utf8');

const listsToRemove = [
    'LIST_SHINHAN_IRIS',
    'LIST_SHINHAN_PINEHEIM',
    'LIST_SHINHAN_SKETCH',
    'LIST_SHINHAN_WALLGUARD',
    'LIST_SHINHAN_LIVING',
    'LIST_SHINHAN_FACADE',
    'LIST_SHINHAN_FIRE_RETARDANT',
    'LIST_GAENARI_2025'
];

listsToRemove.forEach(listName => {
    const rx = new RegExp(`\\.\\.\\.${listName},?\\s*`, 'g');
    content = content.replace(rx, '');
});

fs.writeFileSync(file, content, 'utf8');
console.log('Removed wallpaper lists from materials export.');
