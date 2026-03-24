const fs = require('fs');
const content = fs.readFileSync('src/data/materials.db.js', 'utf8');

// Find all matches of LIST_ variables
const listMatches = content.match(/const\s+(LIST_[A-Z0-9_]+)/g);
console.log('LIST Variables:', listMatches ? [...new Set(listMatches)] : 'None');

// Find lines containing "신한"
const lines = content.split('\n');
const shinhanLines = lines.filter(l => l.includes('신한'));
console.log('\nLines containing "신한":', shinhanLines.slice(0, 10));

// Find Wallguard
const wallguardLines = lines.filter(l => l.toUpperCase().includes('WALLGUARD'));
console.log('\nLines containing "WALLGUARD":', wallguardLines.slice(0, 10));

// Find Sketch
const sketchLines = lines.filter(l => l.toUpperCase().includes('SKETCH'));
console.log('\nLines containing "SKETCH":', sketchLines.slice(0, 10));
