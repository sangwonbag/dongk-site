import * as mod from '../src/data/generatedMaterials.js';

const list = mod.materials || mod.generatedMaterials || [];
console.log('Total materials:', list.length);

const sample = list.slice(0, 15);
for (const m of sample) {
  console.log({
    id: m.id,
    code: m.code,
    brand: m.brand,
    category: m.category,
    line: m.line
  });
}
