import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load generated materials & generated manifest
const genManifestPath = path.join(__dirname, '../src/data/materialImageManifest.generated.js');
const genManifest = (await import(`file://${genManifestPath}`)).imageManifest || [];

console.log(`Loaded ${genManifest.length} items from materialImageManifest.generated.js`);

const targetCodes = ['TW 5119G', 'TW 5120G', 'B3192J', 'B3183J', 'B0122J', 'B0114J', 'TS5552P', 'TS5542P'];

function normalizeCode(code) {
  if (!code) return '';
  return String(code).replace(/[^a-zA-Z0-9가-힣]/g, '').toUpperCase();
}

for (const code of targetCodes) {
  const codeNorm = normalizeCode(code);
  const match = genManifest.find(img => normalizeCode(img.extractedCode) === codeNorm || normalizeCode(img.fileName?.split('.')[0]) === codeNorm);

  if (match) {
    const fullPath = path.join(__dirname, '../public', match.fullPublicPath);
    const exists = fs.existsSync(fullPath);
    console.log(`[FOUND] Code '${code}' -> Path: '${match.fullPublicPath}' | Exists: ${exists}`);
  } else {
    console.log(`[NOT FOUND] Code '${code}' in generated manifest`);
  }
}
