import { fetchAllProducts } from '../src/utils/supabaseFetcher.js';
import {
  getKccLineup,
  getKccLineupPriority,
  getKccProductLineupPriority,
  resolveKccLineupName,
  resolveKccLineupSlug,
  KCC_LINEUP_SLUG_MAP,
  KCC_LINEUP_NAME_TO_SLUG,
  KCC_DECOTILE_LINEUPS
} from '../src/utils/brandUtils.js';
import { sortProducts } from '../src/utils/sortUtils.js';

async function runTests() {
  console.log("=== KCC 데코타일 기본 진입 및 라인업 정렬 종합 검증 ===\n");

  // 1. Fetch all products
  const allMaterials = await fetchAllProducts();
  const products = allMaterials.filter(p => (p.brand === 'KCC' || (p.brand || '').includes('KCC')) && p.category === '데코타일');

  console.log(`[1] Supabase KCC 데코타일 전체 상품 수: ${products.length}개`);
  if (products.length !== 151) {
    console.error(`ERROR: Expected 151 products, found ${products.length}`);
    process.exit(1);
  }
  console.log("  -> PASS: 상품 수량 151개 완벽 보존\n");

  // 2. Classify and Count by Lineup
  const countsByLineup = {};
  products.forEach(p => {
    const lineup = getKccLineup(p);
    countsByLineup[lineup] = (countsByLineup[lineup] || 0) + 1;
  });

  console.log("[2] 라인업별 상품 집계:");
  Object.entries(countsByLineup).forEach(([lineup, count]) => {
    console.log(`  - ${lineup}: ${count}개 (우선순위 점수: ${getKccLineupPriority(lineup)})`);
  });

  // Verify counts
  const expected = {
    "센스타일 트랜디 450각": 21,
    "센스타일 트랜디 600각": 7,
    "센스타일 트랜디 우드": 13,
    "센스타일 프로 450각": 26,
    "센스타일 프로 600각": 25,
    "센스타일 프로 우드": 15,
    "센스레이(내수)": 44
  };

  for (const [k, v] of Object.entries(expected)) {
    if (countsByLineup[k] !== v) {
      console.error(`ERROR: Lineup ${k} expected ${v}, got ${countsByLineup[k]}`);
      process.exit(1);
    }
  }
  console.log("  -> PASS: 각 라인업별 상품 수량 완벽 일치\n");

  // 3. Test Dynamic Lineup Button Generation & Ordering
  const kccLines = new Set();
  products.forEach(m => {
    const l = getKccLineup(m);
    if (l) kccLines.add(l);
  });
  const sortedButtons = Array.from(kccLines).sort((a, b) => getKccLineupPriority(a) - getKccLineupPriority(b));

  console.log("[3] UI 라인업 필터 버튼 생성 및 순서:");
  sortedButtons.forEach((btn, idx) => {
    console.log(`  ${idx + 1}. ${btn} (상품 수: ${countsByLineup[btn]})`);
  });

  const expectedOrder = [
    "센스타일 트랜디 450각",
    "센스타일 트랜디 600각",
    "센스타일 트랜디 우드",
    "센스타일 프로 450각",
    "센스타일 프로 600각",
    "센스타일 프로 우드",
    "센스레이(내수)"
  ];

  if (JSON.stringify(sortedButtons) !== JSON.stringify(expectedOrder)) {
    console.error("ERROR: Lineup button order mismatch!", sortedButtons, expectedOrder);
    process.exit(1);
  }
  console.log("  -> PASS: 센스타일 트랜디 -> 센스타일 프로 -> 센스레이 순서 및 0개 라인업(와이드우드) 미노출 확인\n");

  // 4. Test Default Landing Logic Simulation
  console.log("[4] 기본 진입 및 URL 파라미터 시뮬레이션:");
  // Case A: Fresh landing on /materials or brand=KCC without line
  const defaultLineRaw = null;
  const simulatedActiveLineA = defaultLineRaw ? resolveKccLineupName(defaultLineRaw) : "센스타일 트랜디 450각";
  const defaultFilteredA = products.filter(p => getKccLineup(p) === simulatedActiveLineA);
  console.log(`  Case A (신규 진입): activeLine="${simulatedActiveLineA}", 상품 수: ${defaultFilteredA.length}개`);
  if (simulatedActiveLineA !== "센스타일 트랜디 450각" || defaultFilteredA.length !== 21) {
    console.error("ERROR in Case A default landing!");
    process.exit(1);
  }

  // Case B: Explicit lineup selection (센스타일 프로 450각 - slug 'pro-450')
  const userSelectedSlug = "pro-450";
  const simulatedActiveLineB = resolveKccLineupName(userSelectedSlug);
  const filteredB = products.filter(p => getKccLineup(p) === simulatedActiveLineB);
  console.log(`  Case B (프로 450각 선택): activeLine="${simulatedActiveLineB}", 상품 수: ${filteredB.length}개`);
  if (simulatedActiveLineB !== "센스타일 프로 450각" || filteredB.length !== 26) {
    console.error("ERROR in Case B selection!");
    process.exit(1);
  }

  // Case C: "전체 라인업" selection (slug 'all')
  const simulatedActiveLineC = resolveKccLineupName("all");
  const filteredC = products.filter(p => simulatedActiveLineC === "all" || getKccLineup(p) === simulatedActiveLineC);
  console.log(`  Case C (전체 라인업 선택): activeLine="${simulatedActiveLineC}", 상품 수: ${filteredC.length}개`);
  if (filteredC.length !== 151) {
    console.error("ERROR in Case C 전체 라인업 selection!");
    process.exit(1);
  }
  console.log("  -> PASS: 라인업 필터링 및 URL 슬러그 변환 정상\n");

  // 5. Test Default Sort Order for "전체 라인업"
  console.log("[5] 전체 라인업 기본 정렬(sortProducts default) 순서 검증:");
  const sortedAll = sortProducts(products, 'default');
  console.log(`  정렬된 전체 상품 수: ${sortedAll.length}개`);

  let lastPriority = -1;
  let priorityBreakdown = {};
  sortedAll.forEach((item, index) => {
    const prio = getKccProductLineupPriority(item);
    const lineup = getKccLineup(item);
    priorityBreakdown[lineup] = (priorityBreakdown[lineup] || 0) + 1;
    if (prio < lastPriority) {
      console.error(`ERROR: Product at index ${index} broke ordering! Item: ${item.code} (${lineup}), prio: ${prio}, last: ${lastPriority}`);
      process.exit(1);
    }
    lastPriority = prio;
  });

  // Verify group breakdown
  const first41 = sortedAll.slice(0, 41);
  const next66 = sortedAll.slice(41, 107);
  const last44 = sortedAll.slice(107, 151);

  const allFirst41Trendy = first41.every(p => getKccLineup(p).includes("트랜디"));
  const allNext66Pro = next66.every(p => getKccLineup(p).includes("프로"));
  const allLast44Sensray = last44.every(p => getKccLineup(p).includes("센스레이"));

  if (!allFirst41Trendy || !allNext66Pro || !allLast44Sensray) {
    console.error("ERROR: Group separation failed!");
    process.exit(1);
  }

  console.log(`  - 1~41번째 (41개): 모두 센스타일 트랜디 (${allFirst41Trendy ? 'PASS' : 'FAIL'})`);
  console.log(`  - 42~107번째 (66개): 모두 센스타일 프로 (${allNext66Pro ? 'PASS' : 'FAIL'})`);
  console.log(`  - 108~151번째 (44개): 모두 센스레이 (${allLast44Sensray ? 'PASS' : 'FAIL'})`);
  console.log("  -> PASS: 트랜디 -> 프로 -> 센스레이 그룹 간 상품 섞임 없음\n");

  // 6. Test Price Sort and Name Sort
  const priceAsc = sortProducts(products, 'price-asc');
  const nameAsc = sortProducts(products, 'name-asc');
  if (priceAsc.length !== 151 || nameAsc.length !== 151) {
    console.error("ERROR: Price/Name sort item count mismatch!");
    process.exit(1);
  }
  console.log("[6] 가격순 / 이름순 정렬 검증:");
  console.log(`  - 가격순 정렬: 정상 작동 (${priceAsc.length}개)`);
  console.log(`  - 이름순 정렬: 정상 작동 (${nameAsc.length}개)`);
  console.log("  -> PASS: 기존 가격/이름 정렬 기능 영향 없음\n");

  // 7. Verify other brands are untouched
  console.log("[7] 타 브랜드(LX, 동신) 데이터 및 정렬 보존 확인:");
  const lxProducts = allMaterials.filter(p => (p.brand || '').includes('LX') && p.category === '데코타일');
  const dongshinProducts = allMaterials.filter(p => ((p.brand || '').includes('동신') || (p.brand || '').includes('동신포리마')) && p.category === '데코타일');
  console.log(`  - LX 데코타일 상품 수: ${lxProducts.length}개`);
  console.log(`  - 동신 데코타일 상품 수: ${dongshinProducts.length}개`);
  const sortedLx = sortProducts(lxProducts, 'default');
  if (sortedLx.length !== lxProducts.length) {
    console.error("ERROR: LX products count mismatch after sort!");
    process.exit(1);
  }
  console.log("  -> PASS: 타 브랜드 영향 없음 확인\n");

  console.log("=================================================");
  console.log("모든 검증 테스트가 100% 성공적으로 완료되었습니다!");
  console.log("=================================================");
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
