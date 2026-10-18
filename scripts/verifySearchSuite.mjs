import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...vals] = trimmed.split('=');
    const val = vals.join('=').trim().replace(/^["']|["']$/g, '');
    if (key.trim() === 'VITE_SUPABASE_URL') supabaseUrl = val;
    if (key.trim() === 'VITE_SUPABASE_ANON_KEY') supabaseKey = val;
  }
}

// Import fetchAllProducts and search engine
import { fetchAllProducts } from '../src/utils/supabaseFetcher.js';
import {
  BRAND_DICTIONARY,
  LINEUP_DATABASE,
  POPULAR_KEYWORDS,
  normalizeSearchText,
  normalizeProductCode,
  tokenizeQuery,
  parseSearchQuery,
  scoreProduct,
  generateAutocompleteSuggestions
} from '../src/utils/materialSearchEngine.js';

async function testSearchSuite() {
  console.log('=== 동경바닥재 자재찾기 통합 검색 검증 시작 ===\n');

  console.log('상품 데이터 로딩 중 (Supabase 및 매핑)...');
  const allProducts = await fetchAllProducts();
  console.log(`총 ${allProducts.length}개 상품 로딩 완료.\n`);

  // Helper search function mirroring supabaseFetcher / materialSearchEngine
  function runSearch(query, filters = {}) {
    const parsed = parseSearchQuery(query);
    const scored = [];

    for (const p of allProducts) {
      // Check filters
      if (filters.category && filters.category !== '전체') {
        if (p.category !== filters.category) continue;
      }
      if (filters.brand && filters.brand !== '전체') {
        const brandNorm = (p.brand || '').toLowerCase().trim();
        const targetBrandNorm = filters.brand.toLowerCase().trim();
        if (brandNorm !== targetBrandNorm && !brandNorm.includes(targetBrandNorm)) continue;
      }
      if (filters.thickness && filters.thickness !== '전체') {
        const pThick = (p.thickness || '').replace(/[^0-9.]/g, '');
        const fThick = filters.thickness.replace(/[^0-9.]/g, '');
        if (pThick !== fThick) continue;
      }

      const score = scoreProduct(p, query, parsed);
      if (score > 0) {
        scored.push({ product: p, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.product);
  }

  // 1. Mandatory Queries Test
  const testCases = [
    { query: '디아망', expectedBrand: 'LX', expectedCountMin: 100, desc: 'LX 디아망 라인업' },
    { query: 'LX 디아망', expectedBrand: 'LX', expectedCountMin: 100, desc: 'LX 디아망 브랜드+라인업' },
    { query: '엘엑스 디아망', expectedBrand: 'LX', expectedCountMin: 100, desc: '엘엑스 한글 브랜드+디아망' },
    { query: 'LG 디아망', expectedBrand: 'LX', expectedCountMin: 100, desc: 'LG 과거 브랜드명+디아망' },
    { query: '베스띠', expectedBrand: 'LX', expectedCountMin: 100, desc: 'LX 베스띠 라인업 (실크_LX_베스트 메타데이터 매핑)' },
    { query: '테라피', expectedBrand: 'LX', expectedCountMin: 90, desc: 'LX 테라피 라인업' },
    { query: '휘앙세', expectedBrand: 'LX', expectedCountMin: 0, checkOmission: true, desc: '휘앙세 벽지 (DB 누락 여부 확인)' },
    { query: '센스타일', expectedBrand: 'KCC', expectedCountMin: 100, desc: 'KCC 센스타일 라인업' },
    { query: '센스레이', expectedBrand: 'KCC', expectedCountMin: 10, desc: 'KCC 센스레이 라인업' },
    { query: '8195', expectedBrand: 'LX', expectedCountMin: 1, desc: '8195 포함 제품번호' },
    { query: '8195-01', expectedBrand: 'LX', expectedExactCode: '8195-01', desc: '8195-01 정확한 제품' },
    { query: '819501', expectedBrand: 'LX', expectedExactCode: '8195-01', desc: '819501 하이픈 제외 제품' },
    { query: '30082P', expectedBrand: 'KCC', expectedExactCode: '30082P', desc: '30082P KCC 데코타일' },
    { query: '30082', expectedBrand: 'KCC', expectedCountMin: 1, desc: '30082 포함 제품' },
    { query: '3086', expectedBrand: '', expectedCountMin: 0, checkOmission: true, desc: '3086 (DB 누락 여부 확인)' },
    { query: '450각', expectedCountMin: 50, desc: '450각 규격 제품' },
    { query: '1.8T', expectedCountMin: 30, desc: '1.8T 장판 제품' },
    { query: '600x600', expectedCountMin: 30, desc: '600x600 규격 제품' },
    { query: '존재하지않는외계어자재123', expectedCountMax: 0, desc: '결과 없음 안내 케이스' }
  ];

  console.log('--- [1] 필수 검색어 및 라인업 매칭 테스트 ---');
  const results = [];
  for (const tc of testCases) {
    const start = Date.now();
    const res = runSearch(tc.query);
    const duration = Date.now() - start;

    let pass = true;
    let detail = '';

    if (tc.expectedExactCode) {
      const top = res[0];
      const codeMatches = top && (top.code === tc.expectedExactCode || top.code?.replace(/[^a-zA-Z0-9]/g, '') === tc.expectedExactCode.replace(/[^a-zA-Z0-9]/g, ''));
      if (!codeMatches) {
        pass = false;
        detail = `Top code: ${top ? top.code : 'None'} (Expected: ${tc.expectedExactCode})`;
      } else {
        detail = `Top code: ${top.code} (${top.brand} / ${top.category}) - ${res.length}건`;
      }
    } else if (tc.checkOmission) {
      if (res.length === 0) {
        detail = `DB에 해당 상품 미등록 상태 확인됨 (0건 반환, 정상 안내 가능)`;
      } else {
        detail = `검색 결과 ${res.length}건`;
      }
    } else if (tc.expectedCountMax !== undefined) {
      if (res.length > tc.expectedCountMax) {
        pass = false;
        detail = `결과 ${res.length}건 (Expected 0건)`;
      } else {
        detail = `정상 결과 없음 (0건)`;
      }
    } else if (tc.expectedCountMin !== undefined) {
      if (res.length < tc.expectedCountMin) {
        pass = false;
        detail = `결과 ${res.length}건 (Expected >= ${tc.expectedCountMin}건)`;
      } else {
        const top = res[0];
        detail = `총 ${res.length}건 (1위: [${top.brand}] ${top.code} ${top.name})`;
      }
    }

    console.log(`[${pass ? 'PASS' : 'FAIL'}] "${tc.query}" -> ${tc.desc}: ${detail} (${duration}ms)`);
    results.push({ ...tc, pass, count: res.length, detail, duration });
  }

  // 2. Filter Combination Tests
  console.log('\n--- [2] 필터 연동 테스트 ---');
  // 벽지 + LX + 디아망
  const f1 = runSearch('디아망', { category: '벽지', brand: 'LX' });
  console.log(`[${f1.length >= 100 ? 'PASS' : 'FAIL'}] 벽지 + LX + 디아망 -> ${f1.length}개 반환 (모두 벽지 및 LX)`);

  // 데코타일 + KCC + 30082P
  const f2 = runSearch('30082P', { category: '데코타일', brand: 'KCC' });
  console.log(`[${f2.length >= 1 ? 'PASS' : 'FAIL'}] 데코타일 + KCC + 30082P -> ${f2.length}개 반환 (1위: ${f2[0]?.code})`);

  // 장판 + 1.8T
  const f3 = runSearch('1.8T', { category: '장판' });
  console.log(`[${f3.length >= 30 ? 'PASS' : 'FAIL'}] 장판 + 1.8T -> ${f3.length}개 반환`);

  // Filter Conflict Test: 데코타일 + KCC + 디아망
  const fConflict = runSearch('디아망', { category: '데코타일', brand: 'KCC' });
  const fNoConflict = runSearch('디아망');
  console.log(`[${fConflict.length === 0 && fNoConflict.length > 100 ? 'PASS' : 'FAIL'}] 필터 충돌 시: 필터 적용 상태 0건, 필터 해제 시 ${fNoConflict.length}건 ("전체 자재에서 검색" 버튼 연동 조건 일치)`);

  // 3. Autocomplete Suggestions Test
  console.log('\n--- [3] 자동완성 추천 테스트 ---');
  const auto1 = generateAutocompleteSuggestions('디아', { products: allProducts });
  console.log(`입력: "디아" -> 추천 ${auto1.length}개:`, auto1.map(a => `[${a.type}] ${a.title}`).join(', '));

  const auto2 = generateAutocompleteSuggestions('센스', { products: allProducts });
  console.log(`입력: "센스" -> 추천 ${auto2.length}개:`, auto2.map(a => `[${a.type}] ${a.title}`).join(', '));

  const auto3 = generateAutocompleteSuggestions('8195', { products: allProducts });
  console.log(`입력: "8195" -> 추천 ${auto3.length}개:`, auto3.map(a => `[${a.type}] ${a.title}`).join(', '));

  console.log('\n=== 모든 검증 완료 ===');
}

testSearchSuite().catch(console.error);
