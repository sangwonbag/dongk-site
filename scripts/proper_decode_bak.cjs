const fs = require('fs');
const { TextDecoder } = require('util');

const bakPath = 'C:\\Users\\psw71\\.gemini\\antigravity\\scratch\\tokyo-flooring\\src\\data\\materials.db.js.bak';
const outPath = 'C:\\Users\\psw71\\.gemini\\antigravity\\scratch\\tokyo-flooring\\src\\data\\materials.db.js.healthy';

const buffer = fs.readFileSync(bakPath);

try {
    const decoder = new TextDecoder('euc-kr');
    const decoded = decoder.decode(buffer);
    
    // Check for common Korean words in the decoded stream
    if (decoded.includes('데코타일') || decoded.includes('장판') || decoded.includes('오크')) {
        console.log('Successfully decoded materials.db.js.bak as EUC-KR!');
        fs.writeFileSync(outPath, decoded, 'utf8');
        console.log('Healthy version written to:', outPath);
    } else {
        console.error('Decoding did not yield clean Korean. Preview:');
        console.log(decoded.substring(0, 500));
    }
} catch (e) {
    console.error('Decoding failed:', e);
}
