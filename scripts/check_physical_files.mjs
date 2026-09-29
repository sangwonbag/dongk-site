import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testPaths = [
  '/images/Thumbnail_Image/materials/데코타일/KCC/KCC_wood/TW 5119G_0.png',
  '/images/Thumbnail_Image/materials/데코타일/KCC/KCC_wood/TW 5120G_0.png',
  '/images/Thumbnail_Image/materials/데코타일/KCC/KCC_pro/B3192J.png',
  '/images/Thumbnail_Image/materials/데코타일/KCC/KCC_pro/B3183J.png',
  '/images/Thumbnail_Image/materials/데코타일/KCC/KCC_pro/B0122J.png',
  '/images/Thumbnail_Image/materials/데코타일/KCC/KCC_pro/B0114J.png',
  '/images/Thumbnail_Image/materials/데코타일/KCC/KCC_square/TS5552P_0.jpg',
  '/images/Thumbnail_Image/materials/데코타일/KCC/KCC_square/TS5542P_0.jpg'
];

async function checkFiles() {
  console.log('=== CHECKING PHYSICAL FILES IN PUBLIC DIR ===');
  const publicDir = path.join(__dirname, '../public');

  for (const relPath of testPaths) {
    const fullPath = path.join(publicDir, relPath);
    const exists = fs.existsSync(fullPath);
    console.log(`${exists ? '[EXISTS]' : '[MISSING]'} ${relPath}`);
  }
}

checkFiles();
