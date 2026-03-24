const fs = require('fs');

const dbPath = 'C:\\Users\\psw71\\.gemini\\antigravity\\scratch\\tokyo-flooring\\src\\data\\materials.db.js';
let content = fs.readFileSync(dbPath, 'utf8');

// 1. Remove all __MACOSX entries from any list
// Logic: find any line containing "__MACOSX" and remove the entire object { ... }
// We can use a regex for this since it's a JS file.
// Example: { id: "...", name: "__MACOSX ...", ... },
const macosxRegex = /^\s*{\s*id:\s*".*?",\s*code:\s*".*?",\s*name:\s*"__MACOSX.*?",.*?},\s*$/gm;
content = content.replace(macosxRegex, '');

// Also remove empty lines that might have been left behind
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

// 2. Fix the LX 3.2T data which was still corrupted in my view
// We'll replace the corrupted bits for 3.2T specifically since they were in a different format
const jangpanMappings = [
    { from: '吏€?꾩궗?묒븷 ?몃껐踰꾨젅딥', to: '지아사랑애 텐더브라운' },
    { from: '吏€?꾩궗?묒븷 洹몃젅?댄딥?', to: '지아사랑애 그레이프' },
    { from: '吏€?꾩궗?묒븷 諛붾땺딥', to: '지아사랑애 바닐라' },
    { from: '吏€?꾩궗?묒븷 소프트 오크', to: '지아사랑애 소프트 오크' }, // (This one was partly OK)
    { from: '吏€?꾩궗?묒븷 오닉스', to: '지아사랑애 오닉스' },
    { from: '吏€?꾩궗?묒븷 鍮꾩뒪?ъ뿕由?', to: '지아사랑애 비스포크' },
    { from: '吏€?꾩궗?묒븷 리버사이드', to: '지아사랑애 리버사이드' },
    { from: '吏€?꾩궗?묒븷 아트 오크', to: '지아사랑애 아트 오크' },
    { from: '吏€?꾩궗?묒븷 내추럴 테라조', to: '지아사랑애 내추럴 테라조' },
    { from: '濡ㅻ떒 딥', to: '롤단위' },
    { from: '? 먮ℓ', to: '판매' },
    { from: '? 덈떒', to: '절단' },
    { from: '?⑥쐞', to: '단위' }
];

for (const m of jangpanMappings) {
    content = content.split(m.from).join(m.to);
}

fs.writeFileSync(dbPath, content, 'utf8');
console.log('Final cleanup and LX Jangpan fixes applied.');
