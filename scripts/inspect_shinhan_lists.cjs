const fs = require('fs');

const code = fs.readFileSync('src/data/materials.db.js', 'utf8');

function extractList(listName) {
    const startStr = `const ${listName} = [`;
    const startIndex = code.indexOf(startStr);
    if (startIndex === -1) return null;
    
    // find matching bracket
    let bracketCount = 1;
    let endIndex = -1;
    for(let i = startIndex + startStr.length; i < code.length; i++) {
        if (code[i] === '[') bracketCount++;
        else if (code[i] === ']') bracketCount--;
        
        if (bracketCount === 0) {
            endIndex = i;
            break;
        }
    }
    
    if (endIndex !== -1) {
        return code.slice(startIndex, endIndex + 1);
    }
    return null;
}

console.log("=== LIST_SHINHAN_LIVING ===");
console.log(extractList('LIST_SHINHAN_LIVING')?.substring(0, 500));

console.log("\n=== LIST_SHINHAN_FIRE_RETARDANT ===");
console.log(extractList('LIST_SHINHAN_FIRE_RETARDANT')?.substring(0, 500));

console.log("\n=== LIST_SHINHAN_SKETCH ===");
console.log(extractList('LIST_SHINHAN_SKETCH')?.substring(0, 500));
