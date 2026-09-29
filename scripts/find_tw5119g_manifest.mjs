import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genManifestPath = path.join(__dirname, '../src/data/materialImageManifest.generated.js');
const genManifest = (await import(`file://${genManifestPath}`)).imageManifest || [];

console.log('Searching manifest for TW5119G...');

for (const img of genManifest) {
  if (img.fileName && img.fileName.includes('TW5119')) {
    console.log('TW5119 item:', img);
  }
}
