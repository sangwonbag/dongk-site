// scripts/append_lx_prestige_to_materials_db.mjs
import fs from 'fs';
import path from 'path';

async function main() {
  const mod = await import('../src/data/lxPrestige14.js');
  const items = mod.LX_PRESTIGE_14;
  console.log(`Loaded ${items.length} LX Prestige items.`);

  const dbPath = path.resolve('src/data/materials.db.js');
  const content = fs.readFileSync(dbPath, 'utf8');

  if (content.includes('데코타일-lx-프레스티지-600각-PTT6952-샌드베이지')) {
    console.log('LX Prestige items already in materials.db.js, skipping append.');
    return;
  }

  const lastBracketIndex = content.lastIndexOf('];');
  if (lastBracketIndex === -1) {
    console.error('Could not find ending ]; in materials.db.js');
    process.exit(1);
  }

  const jsonSnippet = items.map(obj => '  ' + JSON.stringify(obj, null, 2).replace(/\n/g, '\n  ')).join(',\n');
  const newContent = content.slice(0, lastBracketIndex) + ',\n' + jsonSnippet + '\n' + content.slice(lastBracketIndex);

  fs.writeFileSync(dbPath, newContent, 'utf8');
  console.log(`Successfully appended ${items.length} LX Prestige items to materials.db.js!`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

