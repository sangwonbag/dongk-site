const fs = require('fs');

const dbPath = 'src/data/materials.db.js';
let content = fs.readFileSync(dbPath, 'utf8');

// 1. Add missing DLT3315, DLT3316 to LIST_LX_DECO_S
if (!content.includes('LX-DLT3315')) {
    const insertDeco = `      { id:"LX-DLT3315", brand:"LX", category: "데코타일", line:"데코레이S", code: "DLT3315", name:"DLT 3315", thickness:"3.0T", price: 0 },\n      { id:"LX-DLT3316", brand:"LX", category: "데코타일", line:"데코레이S", code: "DLT3316", name:"DLT 3316", thickness:"3.0T", price: 0 }\n];`;
    content = content.replace(/\];\n\n\/\/\s+\[\[\s+AUTO-GENERATED\s+BLOCK\s+끝\s+\]\]/g, '];\n'); // Some cleanup
    // specifically find the end of LIST_LX_DECO_S
    content = content.replace(/\{\s*id:"LX-DLT3314".*?\n\s*\];/g, `$&`.replace('];', `,\n${insertDeco}`));
}

// 2. Create LIST_LX_HOUSE
if (!content.includes('LIST_LX_HOUSE')) {
    const listHouse = `
const LIST_LX_HOUSE = [
    { id:"LX-HOT0065", brand:"LX", category: "데코타일", line:"하우스", code: "HOT0065", name:"HOT 0065 라임 스톤 미스트", thickness:"3.0T", price: 0 },
    { id:"LX-HOT0066", brand:"LX", category: "데코타일", line:"하우스", code: "HOT0066", name:"HOT 0066 라임 스톤 그레이", thickness:"3.0T", price: 0 },
    { id:"LX-HOT0067", brand:"LX", category: "데코타일", line:"하우스", code: "HOT0067", name:"HOT 0067 라임 스톤 크림", thickness:"3.0T", price: 0 },
    { id:"LX-HOT0068", brand:"LX", category: "데코타일", line:"하우스", code: "HOT0068", name:"HOT 0068 라임 스톤 베이지", thickness:"3.0T", price: 0 },
    { id:"LX-HOT0069", brand:"LX", category: "데코타일", line:"하우스", code: "HOT0069", name:"HOT 0069 오셔너스 스노우", thickness:"3.0T", price: 0 },
    { id:"LX-HOT0070", brand:"LX", category: "데코타일", line:"하우스", code: "HOT0070", name:"HOT 0070 오셔너스 쿨 그레이", thickness:"3.0T", price: 0 },
    { id:"LX-HOT0071", brand:"LX", category: "데코타일", line:"하우스", code: "HOT0071", name:"HOT 0071 오셔너스 블랙", thickness:"3.0T", price: 0 },
    { id:"LX-HOT0072", brand:"LX", category: "데코타일", line:"하우스", code: "HOT0072", name:"HOT 0072 퍼실 화이트", thickness:"3.0T", price: 0 },
    { id:"LX-HOT0073", brand:"LX", category: "데코타일", line:"하우스", code: "HOT0073", name:"HOT 0073 카사 베이직", thickness:"3.0T", price: 0 },
    { id:"LX-HOW0032", brand:"LX", category: "데코타일", line:"하우스", code: "HOW0032", name:"HOW 0032 오크 라이트", thickness:"3.0T", price: 0 },
    { id:"LX-HOW0033", brand:"LX", category: "데코타일", line:"하우스", code: "HOW0033", name:"HOW 0033 오크 내추럴", thickness:"3.0T", price: 0 },
    { id:"LX-HOW0034", brand:"LX", category: "데코타일", line:"하우스", code: "HOW0034", name:"HOW 0034 오크 스노우", thickness:"3.0T", price: 0 },
    { id:"LX-HOW0035", brand:"LX", category: "데코타일", line:"하우스", code: "HOW0035", name:"HOW 0035 오크 베이지", thickness:"3.0T", price: 0 },
    { id:"LX-HOW0036", brand:"LX", category: "데코타일", line:"하우스", code: "HOW0036", name:"HOW 0036 애쉬 라떼", thickness:"3.0T", price: 0 },
    { id:"LX-HOW0037", brand:"LX", category: "데코타일", line:"하우스", code: "HOW0037", name:"HOW 0037 애쉬 그레이", thickness:"3.0T", price: 0 }
];
`;
    // Insert before ALL_MATERIAL_LISTS
    content = content.replace(/const\s+ALL_MATERIAL_LISTS\s*=\s*\[/g, `${listHouse}\nconst ALL_MATERIAL_LISTS = [`);
}

// 3. Add LIST_LX_HOUSE to ALL_MATERIAL_LISTS
if (!content.includes('...LIST_LX_HOUSE')) {
    content = content.replace(/\.\.\.LIST_LX_DECO_S,/g, `...LIST_LX_DECO_S,\n    ...LIST_LX_HOUSE,`);
}

fs.writeFileSync(dbPath, content, 'utf8');
console.log('Successfully updated materials.db.js!');
