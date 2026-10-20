import { getKccProductLineupPriority } from '../utils/brandUtils.js';

/**
 * 동경바닥재 전체 통합 브랜드 노출 순서
 * KCC → LX → 동신 → 동화 → 이건 → 구정 → 우성 → 녹수 → 현대 → 스완 → 기타
 */
export const UNIFIED_BRAND_ORDER = [
  'KCC',
  'LX',
  '동신',
  '동화',
  '이건',
  '구정',
  '우성',
  '녹수',
  '현대',
  '스완'
];

/**
 * 브랜드명 표준 정규화 (별칭 및 계열사 통합)
 */
export function normalizeBrandName(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const s = raw.trim();
  const u = s.toUpperCase();

  if (u.includes('KCC') || s.includes('케이씨씨')) return 'KCC';
  if (u.includes('LX') || u.includes('LG') || s.includes('엘지') || s.includes('하우시스') || s.includes('엘엑스')) return 'LX';
  if (s.includes('동신')) return '동신';
  if (s.includes('동화')) return '동화';
  if (s.includes('이건')) return '이건';
  if (s.includes('구정')) return '구정';
  if (s.includes('우성')) return '우성';
  if (s.includes('녹수')) return '녹수';
  if (s.includes('현대')) return '현대';
  if (s.includes('스완')) return '스완';
  if (s.includes('유성')) return '유성';
  if (s.includes('재영')) return '재영';
  if (s.includes('대진')) return '대진';
  if (s.includes('개나리')) return '개나리';
  if (s.includes('서울')) return '서울';
  if (s.includes('신한')) return '신한';
  if (s.includes('제일')) return '제일';
  if (u.includes('DID') || s.includes('디아이디')) return '디아이디';
  if (s.includes('코오롱')) return '코오롱';
  if (s.includes('어반') || u.includes('URBAN')) return '어반';

  return s;
}

/**
 * 통합 브랜드 우선순위 인덱스 (KCC: 0, LX: 1, ...)
 */
export function getBrandSortPriority(brandOrItem) {
  if (!brandOrItem) return 999;
  const rawBrand = typeof brandOrItem === 'string'
    ? brandOrItem
    : (brandOrItem.brand || brandOrItem.computedBrand || brandOrItem.manufacturer || '');

  const norm = normalizeBrandName(rawBrand);
  const idx = UNIFIED_BRAND_ORDER.indexOf(norm);
  if (idx !== -1) {
    return idx;
  }
  return 100 + (norm ? norm.charCodeAt(0) : 99);
}

/**
 * 브랜드 목록 배열을 통합 우선순위로 정렬 ('all' 또는 '전체'는 맨 앞에 유지)
 */
export function sortBrandsByPriority(brands) {
  if (!Array.isArray(brands) || brands.length === 0) return [];
  const hasAll = brands.includes('all');
  const hasAllKr = brands.includes('전체') || brands.includes('전체 브랜드');

  const filtered = brands.filter(b => b !== 'all' && b !== '전체' && b !== '전체 브랜드');
  filtered.sort((a, b) => {
    const prioA = getBrandSortPriority(a);
    const prioB = getBrandSortPriority(b);
    if (prioA !== prioB) return prioA - prioB;
    return a.localeCompare(b, 'ko');
  });

  if (hasAll) return ['all', ...filtered];
  if (hasAllKr) return ['전체', ...filtered];
  return filtered;
}

/**
 * 상품 추천 배지 표시 여부 공통 기준
 * - 관리자 명시 설정(is_featured === true) 우선
 * - 기본 비즈니스 룰: KCC 주력 브랜드 상품 = 추천(true)
 * - LX 및 기타 브랜드 = 일반 상품(false)
 */
export function isProductRecommended(item) {
  if (!item) return false;

  // 1. 관리자 수동 명시 설정 우선
  if (item.is_featured === true || item.isFeatured === true) {
    return true;
  }

  // 2. KCC 주력 상품 기본 추천
  const brandNorm = normalizeBrandName(item.brand || item.computedBrand || '');
  if (brandNorm === 'KCC') {
    const cat = item.category || '';
    // 데코타일, 장판, 러버타일 등 KCC 주력 바닥재 카테고리
    if (!cat || cat === '데코타일' || cat === '장판' || cat === '러버타일') {
      return true;
    }
  }

  // LX 및 기타 브랜드는 기본 추천 배지 미적용
  return false;
}

/**
 * 자재찾기 상품 추천 우선순위 비교 함수
 * 1) 브랜드 우선순위 (KCC 0순위 -> LX 1순위 -> 동신 2순위 ...)
 * 2) KCC 데코타일 내부: 센스타일 트랜디 -> 센스타일 프로 -> 센스레이 -> 기타
 * 3) KCC 내부 450각 -> 600각 -> 우드 세부 분류
 * 4) 관리자 sort_order
 * 5) 상품 코드 / 상품명 가나다순
 */
export function compareProductRecommendationPriority(a, b) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;

  // 1. 브랜드 우선순위
  const prioA = getBrandSortPriority(a);
  const prioB = getBrandSortPriority(b);
  if (prioA !== prioB) {
    return prioA - prioB;
  }

  const brandA = normalizeBrandName(a.brand || a.computedBrand || '');
  const brandB = normalizeBrandName(b.brand || b.computedBrand || '');

  // 2. KCC 상품 간의 라인업 정렬
  if (brandA === 'KCC' && brandB === 'KCC') {
    const catA = a.category || '';
    const catB = b.category || '';
    if (catA === '데코타일' || catB === '데코타일' || !catA || !catB) {
      const linePrioA = getKccProductLineupPriority(a);
      const linePrioB = getKccProductLineupPriority(b);
      if (linePrioA !== linePrioB) {
        return linePrioA - linePrioB;
      }
    }
  }

  // 3. 관리자 sort_order
  const sortA = a.sort_order ?? a.sortOrder ?? 999;
  const sortB = b.sort_order ?? b.sortOrder ?? 999;
  if (sortA !== sortB) {
    return sortA - sortB;
  }

  // 4. 상품 코드 / 상품명 정렬
  const codeA = String(a.code || a.product_code || a.name || '');
  const codeB = String(b.code || b.product_code || b.name || '');
  return codeA.localeCompare(codeB, 'ko', { numeric: true });
}

/**
 * 샘플북 정렬 우선순위
 * 1순위: KCC 센스타일 트랜디
 * 2순위: KCC 센스타일 프로
 * 3순위: KCC 센스레이 (등록된 경우)
 * 4순위: 기타 KCC 등록 샘플북 (숲 도담, 숲 휴가온, 홈씨씨 러버타일 등)
 * 5순위: LX 및 나머지 브랜드 (UNIFIED_BRAND_ORDER 기준)
 */
export function getSampleBookPriority(book) {
  if (!book) return 9999;
  const id = String(book.id || '').toLowerCase();
  const title = String(book.title || '').toLowerCase();
  const brand = normalizeBrandName(book.brand || '');

  const isKcc = brand === 'KCC' || title.includes('kcc') || id.startsWith('kcc-');

  if (isKcc) {
    // 1순위: KCC 센스타일 트랜디
    if (id.includes('trendy') || title.includes('트랜디') || title.includes('트렌디')) return 10;
    // 2순위: KCC 센스타일 프로
    if (id.includes('pro') || title.includes('프로')) return 20;
    // 3순위: KCC 센스레이
    if (id.includes('sensray') || id.includes('senseray') || title.includes('센스레이')) return 30;
    // 4순위: 기타 KCC 등록 샘플북
    if (title.includes('도담')) return 40;
    if (title.includes('휴가온')) return 50;
    if (title.includes('러버타일')) return 60;
    return 70;
  }

  // 5순위: LX 및 나머지 브랜드
  const brandRank = getBrandSortPriority(book); // LX: 1, 동신: 2, 동화: 3, 이건: 4, 구정: 5...
  const recBonus = book.isRecommended ? 0 : 50;
  return 1000 + (brandRank * 100) + recBonus;
}

export function compareSampleBookPriority(a, b) {
  const prioA = getSampleBookPriority(a);
  const prioB = getSampleBookPriority(b);
  if (prioA !== prioB) {
    return prioA - prioB;
  }

  const titleA = String(a?.title || '');
  const titleB = String(b?.title || '');
  return titleA.localeCompare(titleB, 'ko');
}
