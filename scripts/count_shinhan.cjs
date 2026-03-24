const fs = require('fs');
const code = fs.readFileSync('src/data/materials.db.js', 'utf8');

function countItems(listName) {
    const listRegex = new RegExp(`const\\s+${listName}\\s*=\\s*\\[([\\s\\S]*?)\\];`);
    const match = code.match(listRegex);
    if (!match) return 0;
    // Count `{ id:` occurences in the array string
    return (match[1].match(/\{/g) || []).length;
}

console.log('LIVING count in DB:', countItems('LIST_SHINHAN_LIVING'));
console.log('FIRE_RETARDANT count in DB:', countItems('LIST_SHINHAN_FIRE_RETARDANT'));
console.log('SKETCH count in DB:', countItems('LIST_SHINHAN_SKETCH'));
