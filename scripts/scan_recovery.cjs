const fs = require('fs');
const path = require('path');

const baseDir = './public/images/products';
const collections = [
    { name: '리빙', folder: '신한벽지_리빙(LIVING)' },
    { name: '방염', folder: '신한벽지_방염' },
    { name: '스케치', folder: '신한벽지_스케치(SKETCH)' },
    { name: '아이리스', folder: '신한벽지_아이리스(IRIS)' },
    { name: '월가드', folder: '신한벽지_월가드(WALLGUARD)' },
    { name: '파사드', folder: '신한벽지_파사드(FACADE)' },
    { name: '파인하임', folder: '신한벽지_파인하임' }
];

const results = {};

collections.forEach(col => {
    const fullPath = path.join(baseDir, col.folder);
    if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath)
            .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
            .sort();
        results[col.name] = {
            folder: col.folder,
            files: files
        };
    } else {
        console.warn(`Folder not found: ${fullPath}`);
    }
});

fs.writeFileSync('shinhan_files_recovery.json', JSON.stringify(results, null, 4), 'utf8');
console.log('Successfully wrote shinhan_files_recovery.json');
