const { execSync } = require('child_process');

const brands = ['서울', 'LX', '신한', '개나리', '제일'];

for (const brand of brands) {
  try {
    console.log(`Syncing ${brand}...`);
    execSync(`robocopy "public/samplebooks/Thumnail_image/벽지/${brand}" "public/images/Thumbnail_Image/materials/벽지/${brand}" /E /PURGE`);
  } catch (e) {
    if (e.status >= 8) console.error(`Error copying ${brand}`);
  }
}

execSync('node scripts/build_materials_db.cjs', {stdio: 'inherit'});
execSync('node scripts/generate_manifest.cjs', {stdio: 'inherit'});
