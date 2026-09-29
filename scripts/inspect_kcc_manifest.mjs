import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genManifestPath = path.join(__dirname, '../src/data/materialImageManifest.generated.js');
const genManifest = (await import(`file://${genManifestPath}`)).imageManifest || [];

console.log('Inspecting KCC items in generated manifest...');

const kccItems = genManifest.filter(img => img.brand === 'KCC' || img.fullPublicPath?.includes('/KCC/'));

console.log(`Found ${kccItems.length} KCC manifest items:`);
kccItems.forEach(item => {
  console.log(`- file: '${item.fileName}', extractedCode: '${item.extractedCode}', path: '${item.fullPublicPath}'`);
});
