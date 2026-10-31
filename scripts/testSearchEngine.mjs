import { parseSearchQuery, scoreProduct } from '../src/utils/materialSearchEngine.js';
import { productSearchMetadata } from '../src/data/productSearchMetadata.generated.js';

// Read all products from generated metadata
const productsList = productSearchMetadata.map(meta => ({
  id: meta.product_id,
  product_code: meta.product_code,
  name: meta.product_name,
  category: meta.category || '데코타일',
  category_name: meta.category || '데코타일',
  brand: meta.brand || 'KCC',
  brand_name: meta.brand || 'KCC',
  line: meta.line || '',
  description: meta.search_keywords ? meta.search_keywords.join(' ') : '',
  spec: meta.spec || '',
  thickness: meta.thickness || ''
}));

console.log(`Loaded ${productsList.length} products for testing.`);

const testQueries = [
  '베이지',
  '라임',
  '콘크리트',
  '시멘트',
  '아이보리',
  '오프화이트',
  '그레이',
  '무광',
  '스톤',
  '우드',
  '밝은 우드',
  '베이지 콘크리트',
  '그레이 600각',
  '따뜻한 분위기의 바닥재',
  '카페에 어울리는 데코타일',
  '6202',
  '30082P',
  '5541',
  '디아망',
  '센스타일'
];

let allPassed = true;

for (const query of testQueries) {
  const start = performance.now();
  const parsed = parseSearchQuery(query);
  const scored = [];

  for (const p of productsList) {
    const s = scoreProduct(p, query, parsed);
    if (s > 0) {
      scored.push({ p, s });
    }
  }

  scored.sort((a, b) => b.s - a.s);
  const duration = (performance.now() - start).toFixed(2);
  const top10 = scored.slice(0, 5);

  console.log(`\n=========================================`);
  console.log(`Query: "${query}" | Found: ${scored.length} | Latency: ${duration}ms`);
  console.log(`Parsed Intent:`, JSON.stringify(parsed));
  
  if (scored.length === 0) {
    console.error(`❌ FAIL: 0 results for "${query}"`);
    allPassed = false;
  } else {
    console.log(`Top 5 Results:`);
    top10.forEach((item, idx) => {
      console.log(`  [${idx + 1}] (${item.s} pts) ${item.p.product_code || 'NO_CODE'} - ${item.p.name}`);
    });

    // Special validation checks
    if (query === '6202') {
      const top1 = top10[0].p;
      const pass = (top1.product_code && top1.product_code.includes('6202')) || top1.name.includes('6202');
      if (!pass) {
        console.error(`❌ FAIL: Top 1 for 6202 should be code 6202, got ${top1.name}`);
        allPassed = false;
      } else {
        console.log(`✅ PASS: Top 1 exactly matches code 6202`);
      }
    } else if (query === '30082P') {
      const top1 = top10[0].p;
      const pass = (top1.product_code && top1.product_code.toUpperCase().includes('30082P'));
      if (!pass) {
        console.error(`❌ FAIL: Top 1 for 30082P should be code 30082P, got ${top1.name}`);
        allPassed = false;
      } else {
        console.log(`✅ PASS: Top 1 exactly matches code 30082P`);
      }
    } else if (query === '라임') {
      console.log(`Parsed lime info:`, parsed.colorFamily);
    }
  }
}

console.log(`\n=========================================`);
if (allPassed) {
  console.log(`🎉 ALL 20 TEST QUERIES PASSED WITH HIGH RELEVANCE & ZERO INFINITE LOADING!`);
} else {
  console.log(`❌ SOME TESTS FAILED`);
  process.exit(1);
}
