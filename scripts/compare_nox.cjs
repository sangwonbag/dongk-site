const fs = require('fs');
const { materials } = require('../src/data/materials.db.js');
const jsonDraft = JSON.parse(fs.readFileSync('temp_nox_extract/사이트등록용_상품검수초안.json', 'utf8'));

const dbMap = new Map();
materials.filter(m => m.brand === '녹수').forEach(m => dbMap.set((m.code || '').toUpperCase(), m));

const conflicts = [];
const matches = [];

jsonDraft.forEach(draft => {
  const code = draft.제품코드.toUpperCase();
  const dbItem = dbMap.get(code);
  const catalogM2 = draft['박스면적_㎡_카탈로그'];

  if (!dbItem) {
    conflicts.push({
      code,
      type: '신규 등록 대상 (기존 DB 미등록)',
      lineup: draft.라인업,
      draft: `${draft.라인업} / ${draft.가로_mm}x${draft.세로_mm} / ${draft.포장수량_장}장 / ${catalogM2}m2`,
      db: '없음'
    });
    return;
  }

  const diffs = [];
  // Compare thickness
  const draftThickness = draft.두께_mm + '.0T';
  if (dbItem.thickness && !dbItem.thickness.includes(String(draft.두께_mm))) {
    diffs.push(`두께: DB(${dbItem.thickness}) vs 카탈로그(${draftThickness})`);
  }

  // Compare specs size
  const draftSize = `${draft.가로_mm}x${draft.세로_mm}`;
  if (dbItem.specs && dbItem.specs.size) {
    const cleanDbSize = dbItem.specs.size.replace(/mm/g, '').replace(/\s+/g, '');
    if (!cleanDbSize.includes(draftSize) && !cleanDbSize.includes(`${draft.가로_mm}*${draft.세로_mm}`)) {
      diffs.push(`규격: DB(${dbItem.specs.size}) vs 카탈로그(${draftSize}mm)`);
    }
  }

  // Compare packing
  if (dbItem.specs && dbItem.specs.packing) {
    if (!dbItem.specs.packing.includes(String(draft.포장수량_장))) {
      diffs.push(`포장수량: DB(${dbItem.specs.packing}) vs 카탈로그(${draft.포장수량_장}장)`);
    }
    const m2 = String(catalogM2);
    if (!dbItem.specs.packing.includes(m2)) {
      diffs.push(`박스면적: DB(${dbItem.specs.packing}) vs 카탈로그(${m2}m2)`);
    }
  }

  if (diffs.length > 0) {
    conflicts.push({
      code,
      lineup: draft.라인업,
      diffs
    });
  } else {
    matches.push(code);
  }
});

console.log('Total Draft:', jsonDraft.length);
console.log('Exact Matches:', matches.length);
console.log('Conflicts / Differences:', conflicts.length);
console.log('All differences:');
console.log(JSON.stringify(conflicts, null, 2));
