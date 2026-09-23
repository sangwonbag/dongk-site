import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, '../src/pages/MaterialDetail/MaterialDetail.jsx');
const code = fs.readFileSync(file, 'utf8');

console.log('Read MaterialDetail.jsx, length:', code.length);

// Search for common state setters or variables used without declaration
const identifiers = new Set();
const matches = code.matchAll(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g);
for (const m of matches) {
  identifiers.add(m[1]);
}

console.log('Total unique identifiers:', identifiers.size);

// Check if isSubmitting is in identifiers
if (identifiers.has('isSubmitting')) {
  console.log('isSubmitting is used in code!');
}
