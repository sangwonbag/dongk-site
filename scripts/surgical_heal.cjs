const fs = require('fs');

const dbPath = 'C:\\Users\\psw71\\.gemini\\antigravity\\scratch\\tokyo-flooring\\src\\data\\materials.db.js';
let content = fs.readFileSync(dbPath, 'utf8');

const mapping = [
    { from: '?곗퐫?€??', to: '데코타일' },
    { from: '?꾨━誘몄뾼', to: '프리미엄' },
    { from: '?곸꽭 ?뺣낫 ?ы븿', to: '상세 정보 포함' },
    { from: '?곕뱶', to: '우드' },
    { from: '媛€寃??곸닔', to: '가격상수' },
    { from: '媛€寃딥곸닔', to: '가격상수' },
    { from: '?숈떊', to: '동신' },
    { from: '?꾩컻蹂닿린', to: '전체보기' },
    { from: '媛€寃?洹쒓꺽 ?먮룞 ?곸슜', to: '가격 규격 자동 적용' },
    { from: '?먯퐫 ? 명뵆 ? ъ뒪 3T', to: '에코노 플러스 3T' },
    { from: '蹂댄???', to: '보타닉' },
    { from: '?쇱씤 ? 곕툙', to: '라인 우븐' },
    { from: '踰좎씠吏 ?', to: '베이지' },
    { from: '?몄텧 肄섑겕由ы듃', to: '노출 콘크리트' },
    { from: '?대컲 肄섑겕由ы듃', to: '어반 콘크리트' },
    { from: '??肄섑겕由ы듃', to: '딥 콘크리트' },
    { from: '硫뷀깉', to: '메탈' },
    { from: '?뚮뱶', to: '샌드' },
    { from: '?붾━??', to: '더스티' },
    { from: '誘몄뒪??', to: '미스티' },
    { from: '紐⑥뜕', to: '모던' },
    { from: '鍮ꩩ킅肄?', to: '비앙코' },
    { from: '?꾩씠??', to: '앤틱' },
    { from: '?뚯씤', to: '파인' },
    { from: '?대컲', to: '어반' },
    { from: '?꾨찓由ъ뭏', to: '아메리칸' },
    { from: '?뷀듃', to: '소프트' },
    { from: '?⑤툕由 ?', to: '패브릭' },
    { from: '而댄룷 ??', to: '컴포트' },
    { from: '?щ옓', to: '슬랩' },
    { from: ' ?⑦꽩', to: '패턴' },
    { from: ' ? 곕툙', to: '우븐' },
    { from: ' ? ㅽ넠', to: '스톤' },
    { from: ' ? ㅽ겕', to: '오크' },
    { from: ' ? ш렇', to: '러그' },
    { from: ' ? 꾪듃', to: '아트' },
    { from: ' ? 뚯떆', to: '브러쉬' },
    { from: ' ? 붾━??', to: '더스티' },
    { from: ' ? ㅽ뙆 ? 대쭅', to: '스파클링' },
    { from: ' ? 명뵆 ? ъ뒪', to: '플러스' },
    { from: ' ? 먯퐫', to: '에코노' }
];

for (const m of mapping) {
    content = content.split(m.from).join(m.to);
}

// Ensure all missing lists are defined as empty arrays if they don't exist
const missingLists = [
    'LIST_LX_WALLPAPER',
    'LIST_AUTO_GENERATED',
    'LIST_SHINHAN_IRIS',
    'LIST_SHINHAN_PINEHEIM',
    'LIST_SHINHAN_SKETCH',
    'LIST_SHINHAN_WALLGUARD',
    'LIST_SHINHAN_LIVING',
    'LIST_SHINHAN_FACADE',
    'LIST_SHINHAN_FIRE_RETARDANT',
    'LIST_LX_DECO_S',
    'LIST_LX_DECORAY_S_AUTO',
    'PRESTIGE_5T',
    'ECONO_PLUS_3T',
    'BOTANIC_3T',
    'LIST_LX_1_8T',
    'LIST_LX_2_0T',
    'LIST_LX_2_2T',
    'LIST_LX_2_7T',
    'LIST_LX_3_2T',
    'LIST_LX_4_5T',
    'LIST_GAENARI_2025'
];

let stubs = '\n\n// --- STUBS FOR MISSING LISTS ---\n';
for (const list of missingLists) {
    if (!content.includes(`const ${list} =`)) {
        stubs += `const ${list} = [];\n`;
    }
}
stubs += '// -------------------------------\n\n';

// Insert stubs before the first list generation or export
const insertPoint = content.indexOf('// Generate Lists');
if (insertPoint !== -1) {
    content = content.slice(0, insertPoint) + stubs + content.slice(insertPoint);
} else {
    // Fallback to before export
    const exportPoint = content.indexOf('export const materials');
    content = content.slice(0, exportPoint) + stubs + content.slice(exportPoint);
}

fs.writeFileSync(dbPath, content, 'utf8');
console.log('Database healed and stubs added.');
