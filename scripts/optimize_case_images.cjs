const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_DIR = path.join(process.cwd(), 'public', 'images', '시공사례');
const TARGET_DIR = path.join(process.cwd(), 'public', 'images', '시공사례_optimized');

const VARIANTS = [
  { name: 'thumb-400', maxWidth: 400, quality: 80 },
  { name: 'thumb-800', maxWidth: 800, quality: 82 },
  { name: 'preview-1600', maxWidth: 1600, quality: 85 }
];

async function processDirectory(dir, relPath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullSourcePath = path.join(dir, entry.name);
    const currentRelPath = path.join(relPath, entry.name);

    if (entry.isDirectory()) {
      for (const variant of VARIANTS) {
        const targetSubDir = path.join(TARGET_DIR, variant.name, currentRelPath);
        if (!fs.existsSync(targetSubDir)) {
          fs.mkdirSync(targetSubDir, { recursive: true });
        }
      }
      await processDirectory(fullSourcePath, currentRelPath);
    } else if (entry.isFile() && /\.(jpe?g|png|webp)$/i.test(entry.name)) {
      const baseNameWithoutExt = path.parse(entry.name).name;
      const originalStat = fs.statSync(fullSourcePath);
      const originalSizeMB = (originalStat.size / (1024 * 1024)).toFixed(2);

      let anyMissing = false;
      for (const variant of VARIANTS) {
        const targetSubDir = path.join(TARGET_DIR, variant.name, relPath);
        const targetFilePath = path.join(targetSubDir, `${baseNameWithoutExt}.webp`);
        if (!fs.existsSync(targetFilePath)) {
          anyMissing = true;
          break;
        }
      }

      if (!anyMissing) {
        continue; // Already optimized
      }

      console.log(`Optimizing: ${currentRelPath} (${originalSizeMB} MB)`);

      for (const variant of VARIANTS) {
        const targetSubDir = path.join(TARGET_DIR, variant.name, relPath);
        if (!fs.existsSync(targetSubDir)) {
          fs.mkdirSync(targetSubDir, { recursive: true });
        }

        const targetFilePath = path.join(targetSubDir, `${baseNameWithoutExt}.webp`);

        try {
          await sharp(fullSourcePath)
            .rotate()
            .resize({
              width: variant.maxWidth,
              withoutEnlargement: true,
              fit: 'inside'
            })
            .webp({ quality: variant.quality, effort: 4 })
            .toFile(targetFilePath);

          const newStat = fs.statSync(targetFilePath);
          const newSizeKB = (newStat.size / 1024).toFixed(1);
          console.log(`  -> [${variant.name}] ${newSizeKB} KB`);
        } catch (err) {
          console.error(`  Error processing ${variant.name} for ${entry.name}:`, err.message);
        }
      }
    }
  }
}

async function main() {
  console.log('=== Starting Construction Case Image Optimization ===');
  console.log('Source:', SOURCE_DIR);
  console.log('Target:', TARGET_DIR);

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error('Source directory does not exist:', SOURCE_DIR);
    process.exit(1);
  }

  const startTime = Date.now();
  await processDirectory(SOURCE_DIR);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`=== Done in ${elapsed}s ===`);
}

main().catch(err => {
  console.error('Fatal error in image optimization:', err);
  process.exit(1);
});
