import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const SOURCE_DIR = path.resolve(process.cwd(), 'public/images/Thumbnail_Image/materials');
const OUTPUT_DIR = path.resolve(process.cwd(), 'src/generated');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'imageManifest.json');

console.log('Scanning images to generate SHA-256 manifest from:', SOURCE_DIR);

function collectFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file.toUpperCase().includes('MACOSX') || file.startsWith('._')) {
      return;
    }
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...collectFiles(fullPath));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) && file !== 'desktop.ini') {
        results.push(fullPath);
      }
    }
  });
  return results;
}

// Simple pure Node dimensions parser for JPEG and PNG
function getImageDimensions(buffer, ext) {
  try {
    if (ext === '.png') {
      if (buffer.length >= 24) {
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        return { width, height };
      }
    } else if (ext === '.jpg' || ext === '.jpeg') {
      let i = 2;
      while (i < buffer.length) {
        if (buffer[i] === 0xFF) {
          const marker = buffer[i + 1];
          // SOF0 (Start Of Frame 0) marker is 0xC0
          // SOF2 (Start Of Frame 2) marker is 0xC2
          if (marker === 0xC0 || marker === 0xC2) {
            const height = buffer.readUInt16BE(i + 5);
            const width = buffer.readUInt16BE(i + 7);
            return { width, height };
          }
          i += 2 + buffer.readUInt16BE(i + 2);
        } else {
          i++;
        }
      }
    } else if (ext === '.gif') {
      if (buffer.length >= 10) {
        const width = buffer.readUInt16LE(6);
        const height = buffer.readUInt16LE(8);
        return { width, height };
      }
    }
  } catch (err) {
    // Silently ignore dimensions parsing errors
  }
  return { width: 0, height: 0 };
}

const allFiles = collectFiles(SOURCE_DIR);
console.log(`Found ${allFiles.length} image files.`);

const manifest = {};

allFiles.forEach(fullPath => {
  try {
    const buffer = fs.readFileSync(fullPath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    
    const ext = path.extname(fullPath).toLowerCase();
    const dimensions = getImageDimensions(buffer, ext);
    
    // Relative path from public directory: e.g. /images/Thumbnail_Image/materials/데코타일/KCC/KCC_square/TS5545P_0.jpg
    const relativeFromPublic = '/' + path.relative(path.resolve(process.cwd(), 'public'), fullPath).replace(/\\/g, '/');
    const decodedPath = decodeURIComponent(relativeFromPublic);
    
    // Relative path from materials directory to compute the Supabase MD5 file hash name
    const relFromMaterials = path.relative(SOURCE_DIR, fullPath).replace(/\\/g, '/');
    const md5Hash = crypto.createHash('md5').update(relFromMaterials, 'utf8').digest('hex');
    const supabaseFilename = md5Hash + ext;

    const entry = {
      hash,
      width: dimensions.width,
      height: dimensions.height
    };

    // Add keys in all expected lookup formats
    manifest[relativeFromPublic] = entry;
    manifest[relativeFromPublic.toLowerCase()] = entry;
    manifest[decodedPath] = entry;
    manifest[decodedPath.toLowerCase()] = entry;
    manifest[supabaseFilename] = entry;
    manifest[supabaseFilename.toLowerCase()] = entry;
  } catch (err) {
    console.error(`Error processing file ${fullPath}:`, err);
  }
});

// Ensure output directory exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2), 'utf8');

console.log(`Successfully generated image SHA-256 manifest at: ${OUTPUT_FILE}`);
console.log(`Total unique files in manifest: ${Object.keys(manifest).length}`);
