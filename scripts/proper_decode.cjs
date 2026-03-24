const fs = require('fs');
const { TextDecoder } = require('util');

const dbPath = 'C:\\Users\\psw71\\.gemini\\antigravity\\scratch\\tokyo-flooring\\src\\data\\materials.db.js';
const bakPath = dbPath + '.verybak';

// Backup first
if (!fs.existsSync(bakPath)) {
    fs.copyFileSync(dbPath, bakPath);
}

const buffer = fs.readFileSync(bakPath);

// Try to decode as EUC-KR
// Note: Node.js TextDecoder supports 'euc-kr'
try {
    const decoder = new TextDecoder('euc-kr');
    const decoded = decoder.decode(buffer);
    
    // Check if it looks like healthy Korean
    if (decoded.includes('데코타일') || decoded.includes('장판')) {
        console.log('Successfully decoded as EUC-KR!');
        fs.writeFileSync(dbPath, decoded, 'utf8');
        console.log('Database restored to UTF-8.');
    } else {
        console.error('Decoding did not yield "데코타일" or "장판". Result preview:');
        console.log(decoded.substring(0, 200));
    }
} catch (e) {
    console.error('Decoding failed:', e);
}
