import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genManifestPath = path.join(__dirname, '../src/data/materialImageManifest.generated.js');
const genManifest = (await import(`file://${genManifestPath}`)).imageManifest || [];

console.log('Searching manifest for 5119, 5120, 3192, 5552...');

for (const img of genManifest) {
  if (img.fileName && (img.fileName.includes('5119') || img.fileName.includes('5120') || img.fileName.includes('3192') || img.fileName.includes('5552'))) {
    console.log('Manifest item:', img);
  }
}
