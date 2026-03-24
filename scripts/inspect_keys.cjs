const { imageManifest } = require('./src/data/imageManifest.js');
const keys = Object.keys(imageManifest);
const livingKeys = keys.filter(k => k.includes('70287') || k.includes('15053') || k.includes('70296'));
console.log('Matches found in keys:', livingKeys);
livingKeys.forEach(k => console.log('Value for', k, ':', imageManifest[k]));
