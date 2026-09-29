import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, '../public/images/Thumbnail_Image/materials');

function searchFiles(dir, term) {
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      searchFiles(full, term);
    } else {
      if (item.toUpperCase().includes(term.toUpperCase())) {
        console.log(`FOUND '${term}':`, path.relative(baseDir, full));
      }
    }
  }
}

const terms = ['B3192', 'B3183', 'B0122', 'B0114', '3192', '3183', '0122', '0114'];
for (const t of terms) {
  searchFiles(baseDir, t);
}
