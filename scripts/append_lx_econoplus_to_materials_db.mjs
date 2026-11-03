// scripts/append_lx_econoplus_to_materials_db.mjs
import fs from 'fs';
import path from 'path';

async function main() {
  const mod = await import('../src/data/lxEconoPlus104.js');
  const items = mod.LX_ECONO_PLUS_104;
  console.log(`Loaded ${items.length} LX EconoPlus items.`);

  const dbPath = path.resolve('src/data/materials.db.js');
  let content = fs.readFileSync(dbPath, 'utf8');

  if (content.includes('데코타일-lx-에코노플러스-600각-det6553-클레이-콘크리트')) {
    console.log('LX EconoPlus items already in materials.db.js, skipping append.');
    return;
  }

  const lastBracketIndex = content.lastIndexOf('];');
  if (lastBracketIndex === -1) {
    console.error('Could not find ending ]; in materials.db.js');
    process.exit(1);
  }

  const jsonSnippet = items.map(obj => '  ' + JSON.stringify(obj, null, 2).replace(/\n/g, '\n  ')).join(',\n');

  const newContent = content.slice(0, lastBracketIndex) + ',\n' + jsonSnippet + '\n' + content.slice(lastBracketIndex);

  // Backup
  fs.writeFileSync('src/data/materials.db.js.bak_econoplus', content, 'utf8');
  fs.writeFileSync(dbPath, newContent, 'utf8');

  console.log(`Successfully appended ${items.length} LX EconoPlus items to materials.db.js!`);
}

main().catch(console.error);

