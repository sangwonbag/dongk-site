const fs = require('fs');
const path = require('path');

const dbPath = 'C:\\Users\\psw71\\.gemini\\antigravity\\scratch\\tokyo-flooring\\src\\data\\materials.db.js';
let content = fs.readFileSync(dbPath, 'utf8');

const mappings = [
    // Categories & Lines
    ['?곗퐫?€딥', '데코타일'],
    ['?곗퐫?€??', '데코타일'],
    ['?λ낫', '장판'],
    ['?ν뙋', '장판'],
    ['?꾨젅스틸떚吏€', '프레스티지'],
    ['?꾨젅?ㅽ떚吏€', '프레스티지'],
    ['?먯퐫?명뵆?ъ뒪', '에코노플러스'],
    [' ? 먯퐫 ? 명뵆 ? ъ뒪', '에코노플러스'],
    ['蹂댄 딥?', '보타닉'],
    ['?몃?', '보타닉'],
    ['?댁껌留?', '뉴청맥'],
    ['?€?됰ぉ', '은행목'],
    ['吏€?꾩궗?묒븷', '지아사랑애'],
    ['吏€?꾩냼由ъ옞', '지아소리잠'],
    ['?숈떊', '동신'],
    ['?쒕줈??', '슈가'],
    ['?대옒??', '클래식'],
    ['?대젅 딥', '클레이'],
    ['诱몄뒪딥', '미스티'],
    ['誘몄뒪딥', '미스티'],
    ['?댁텛 딥', '내추럴'],
    ['?댁텛', '내추럴'],
    ['鍮ꩩ肄?', '베이지'],
    ['踰좎씠吏€', '베이지'],
    ['?뚮뱶', '샌드'],
    ['移 딥', '샌드'],
    ['移?', '샌드'],
    ['而댄룷 딥', '컴포트'],
    ['留덉슫 딥', '마일드'],
    ['?쇰젋泥 ?', '피렌체'],
    ['鍮ꩩ肄 ?', '베이지'],
    ['鍮꾩븞肄 ?', '비앙코'],
    ['鍮꾩븞肄?', '비앙코'],
    ['?뚮씪議 ?', '테라조'],
    ['?뚮씪議?', '테라조'],
    ['洹몃씪 ? 덊듃', '그라니트'],
    ['?먯씠吏€딥? ㅽ떥', '에이지드 스틸'],
    [' ? ㅽ뙆 ? 대쭅', '스파클링'],
    [' ?⑤툕由 ?', '패브릭'],
    [' ? 곕툙', '위브'],
    [' ? 쇱씤 ? 곕툙', '라인 위브'],
    [' ? 붾━딥', '데저트'],
    [' ? 몄텧', '노출'],
    [' ? 고겕', '오크'],
    [' ? 덈땲', '애니'],
    [' ? 뚯씤', '파인'],
    [' ? 뚯떆', '워시'],
    [' ? 뚯폆', '포켓'],
    [' ? 꾪듃 ? ш렇', '아트 러그'],
    [' ? 쇱엫', '라임'],
    [' ? ㅽ넠', '스톤'],
    [' ? 몃씪誘 ?', '세라믹'],
    [' ? 섎쫫', '느티'],
];

// Sort by length to avoid partial matches
mappings.sort((a, b) => b[0].length - a[0].length);

mappings.forEach(([corrupted, fixed]) => {
    content = content.split(corrupted).join(fixed);
});

// Post-processing for specific naming issues
content = content.replace(/ ? 먯퐫 ? 명뵆 ? ъ뒪/g, '에코노플러스');
content = content.replace(/ ? 몃씪誘 \?/g, '세라믹');

// LX Wallpaper Categorization
// Target lines like: { id: "LXW-PR003-01", ..., materialType: "실크", ... }
// We want to change materialType based on the name prefix.
const lines = content.split('\n');
const fixedLines = lines.map(line => {
    if (line.includes('brand: "LX"') && line.includes('category: "벽지"')) {
        if (line.includes('name: "디아망') || line.includes('name: "디아망포티스')) {
            return line.replace('materialType: "실크"', 'materialType: "디아망"');
        }
        if (line.includes('name: "방염')) {
            return line.replace('materialType: "실크"', 'materialType: "방염"');
        }
        if (line.includes('name: "휘앙세')) {
            return line.replace('materialType: "실크"', 'materialType: "합지"');
        }
    }
    return line;
});

fs.writeFileSync(dbPath, fixedLines.join('\n'), 'utf8');
console.log('Database surgically recovered and LX wallpapers categorized.');
