const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'data', 'materials.db.js');
const content = fs.readFileSync(filePath, 'utf8');

const listRegex = /(?:const|let|var|export\s+const)\s+(\w+)\s*=\s*\[([\s\S]*?)\];/g;
let match;

console.log('--- Diagnostic Report ---');
while ((match = listRegex.exec(content)) !== null) {
    const listName = match[1];
    const listContent = match[2];
    
    if (listName === 'LIST_SHINHAN_WALLGUARD') continue;

    const items = listContent.split('},');
    items.forEach(item => {
        if (/id\s*:\s*["']W\d+/i.test(item) || /code\s*:\s*["']W\d+/i.test(item)) {
            console.log(`Found Wallguard item in ${listName}: ${item.trim().substring(0, 100)}...`);
        }
    });
}
console.log('--- End of Report ---');
