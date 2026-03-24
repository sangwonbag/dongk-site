const fs = require('fs');
const path = require('path');
const manifestPath = path.join(__dirname, '..', 'src', 'data', 'imageManifest.js');
const manifestContent = fs.readFileSync(manifestPath, 'utf8');

const matchMatches = manifestContent.match(/"70287-1"|"70289-1"|"C8123-1"|"70296-6"/g);
console.log('Manifest entries for LIVING direct match:', matchMatches);

const lines = manifestContent.split('\n');
const livingLines = lines.filter(l => l.includes('70287') || l.includes('C8123') || l.includes('70296'));
console.log('Lines in manifest related to living:', livingLines.length);

console.log('Sample living lines:', livingLines.slice(0, 5));
