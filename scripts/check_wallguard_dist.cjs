const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'data', 'materials.db.js');
const content = fs.readFileSync(filePath, 'utf8');

// Find all list declarations
const listRegex = /(?:const|let|var|export\s+const)\s+(\w+)\s*=\s*\[([\s\S]*?)\];/g;
let match;

const results = [];

while ((match = listRegex.exec(content)) !== null) {
    const listName = match[1];
    const listItems = match[2];
    
    // Find items starting with W
    const wItems = [];
    const itemRegex = /\{[^}]*?id\s*:\s*["'](W\d+[^"']*)["'][^}]*?\}/g;
    let itemMatch;
    while ((itemMatch = itemRegex.exec(listItems)) !== null) {
        wItems.push(itemMatch[1]);
    }

    if (wItems.length > 0) {
        results.push({ listName, count: wItems.length, firstFew: wItems.slice(0, 5) });
    }
}

console.log('--- Wallguard Distribution ---');
results.forEach(res => {
    console.log(`${res.listName}: ${res.count} items (e.g., ${res.firstFew.join(', ')})`);
});
console.log('------------------------------');
