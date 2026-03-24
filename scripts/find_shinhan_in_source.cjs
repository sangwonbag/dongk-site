const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'shinhan_silk_data.js');
const content = fs.readFileSync(filePath, 'utf8');

// Find all matches of LIST_ variables
const listMatches = content.match(/export\s+const\s+(LIST_[A-Z0-9_가-힣]+)/g);
console.log('LIST Variables:', listMatches ? [...new Set(listMatches)] : 'None');

// Find all collection names
const collections = [...new Set(content.match(/"collection":\s*"(.*?)"/g))];
console.log('\nCollections found:', collections);
