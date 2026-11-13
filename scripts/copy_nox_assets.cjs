const fs = require('fs');
const path = require('path');

const srcBase = path.join(__dirname, '..', 'temp_nox_extract');
const destBase = path.join(__dirname, '..', 'public', 'images', 'Thumbnail_Image', 'materials', '데코타일', '녹수');

const lineups = ['오키드3000', '프라임1500', '에코홈2000'];

// 1. Copy PDF Swatches
lineups.forEach(line => {
  const srcSwatches = path.join(srcBase, line, 'PDF견본_제품코드별');
  const destSwatches = path.join(destBase, 'pdf_swatches', line);
  if (!fs.existsSync(destSwatches)) fs.mkdirSync(destSwatches, { recursive: true });

  const files = fs.readdirSync(srcSwatches);
  files.forEach(f => {
    fs.copyFileSync(path.join(srcSwatches, f), path.join(destSwatches, f));
  });
  console.log(`Copied ${files.length} swatches for ${line}`);
});

// 2. Copy Catalog Scenes
lineups.forEach(line => {
  const srcScenes = path.join(srcBase, line, '카탈로그_공간연출_제품연결검수');
  const destScenes = path.join(destBase, 'catalog_scenes', line);
  if (!fs.existsSync(destScenes)) fs.mkdirSync(destScenes, { recursive: true });

  if (fs.existsSync(srcScenes)) {
    const files = fs.readdirSync(srcScenes);
    files.forEach(f => {
      fs.copyFileSync(path.join(srcScenes, f), path.join(destScenes, f));
    });
    console.log(`Copied ${files.length} scenes for ${line}`);
  }
});

console.log('All assets copied successfully.');

