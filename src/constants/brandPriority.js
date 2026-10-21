import { getKccProductLineupPriority, getKccLineup } from '../utils/brandUtils.js';

/**
 * 카테고리별 브랜드 추천 우선순위 설정
 * 데코타일: KCC -> 동신 -> 재영 -> 우성 -> LX -> 녹수 -> 현대 -> 대진
 * 장판: LX -> KCC -> 현대
 * 마루, 벽지, 카페트타일: 기존 정책 유지
 */
export const BRAND_PRIORITY_BY_CATEGORY = {
  데코타일: ['KCC', '동신', '재영', '우성', '유성', 'LX', '녹수', '현대', '대진'],
  장판: ['LX', 'KCC', '현대'],
  마루: ['동화', '이건마루', '이건', '구정'],
  벽지: ['LX', '개나리', '신한', '서울', '제일', '디아이디'],
  카페트타일: ['스완', '어반', '코오롱'],
  러버타일: ['현대', 'KCC'],
  부자재: [],
  // 영문/camelCase 별칭 지원
  decotile: ['KCC', '동신', '재영', '우성', '유성', 'LX', '녹수', '현대', '대진'],
  sheetFlooring: ['LX', 'KCC', '현대'],
  maru: ['동화', '이건마루', '이건', '구정'],
  wallpaper: ['LX', '개나리', '신한', '서울', '제일', '디아이디'],
  carpetTile: ['스완', '어반', '코오롱']
};

/**
 * KCC 데코타일 라인업 추천 순서
 * 1순위: 센스타일 트랜디 (450각 -> 600각 -> 우드)
 * 2순위: 센스타일 프로 (450각 -> 600각 -> 우드 -> 와이드우드)
 * 3순위: 센스레이
 */
export const KCC_LINE_PRIORITY = [
  '센스타일 트랜디 450각',
  '센스타일 트랜디 600각',
  '센스타일 트랜디 우드',
  '센스타일 프로 450각',
  '센스타일 프로 600각',
  '센스타일 프로 우드',
  '센스타일 프로 와이드 우드',
  '센스레이(내수)',
  '센스레이'
];

/**
 * LX 장판 라인업 추천 순서
 * 1순위: 뉴청맥 (1.8T 실속형 대표)
 * 2순위: 지아자연애 (2.2T 인기)
 * 3순위: 지아사랑애 (2.7T/3.2T 안심)
 * 4순위: 지아소리잠 (4.5T)
 * 5순위: 엑스컴포트 (5.0T 하이엔드)
 * 6순위: 은행목 (2.0T)
 */
export const LX_JANGPAN_LINE_PRIORITY = [
  '뉴청맥',
  '지아자연애',
  '지아사랑애',
  '지아소리잠',
  '엑스컴포트',
  '은행목'
];

/**
 * 동경바닥재 전체 기본 브랜드 정렬 순서 (카테고리 미지정 시 fallback)
 */
export const UNIFIED_BRAND_ORDER = [
  'KCC',
  'LX',
  '동신',
  '재영',
  '우성',
  '동화',
  '이건',
  '구정',
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
  if (s.includes('이건')) return '이건마루';
  if (s.includes('구정')) return '구정';
  if (s.includes('재영')) return '재영';
  if (s.includes('우성')) return '우성';
  if (s.includes('유성')) return '우성'; // 유성/우성 통합 처리
  if (s.includes('녹수')) return '녹수';
  if (s.includes('현대')) return '현대';
  if (s.includes('스완')) return '스완';
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
 * 화면 표시용 브랜드명 통일 유틸리티
 * LX, LG, LX하우시스 -> "LX하우시스"로 화면 통일
 */
export function getDisplayBrandName(brandOrItem, category = '') {
  if (!brandOrItem) return '';
  const rawBrand = typeof brandOrItem === 'string'
    ? brandOrItem
    : (brandOrItem.brand || brandOrItem.computedBrand || '');
  
  const norm = normalizeBrandName(rawBrand);
  if (norm === 'LX') {
    return 'LX하우시스';
  }
  if (norm === '우성' || norm === '유성') {
    return '우성';
  }
  if (norm === '이건' || norm === '이건마루') {
    return '이건마루';
  }
  return rawBrand.trim() || norm;
}

/**
 * 카테고리별 브랜드 우선순위 인덱스
 */
export function getBrandSortPriority(brandOrItem, category = '') {
  if (!brandOrItem) return 999;
  const rawBrand = typeof brandOrItem === 'string'
    ? brandOrItem
    : (brandOrItem.brand || brandOrItem.computedBrand || brandOrItem.manufacturer || '');

  const norm = normalizeBrandName(rawBrand);
  const effectiveCategory = category || (typeof brandOrItem === 'object' ? brandOrItem.category : '') || '';

  const categoryOrder = BRAND_PRIORITY_BY_CATEGORY[effectiveCategory];
  if (categoryOrder) {
    const idx = categoryOrder.indexOf(norm);
    if (idx !== -1) return idx;
    // 우성/유성 상호 fallback
    if (norm === '우성' && categoryOrder.includes('유성')) return categoryOrder.indexOf('유성');
    if (norm === '유성' && categoryOrder.includes('우성')) return categoryOrder.indexOf('우성');
  }

  const idx = UNIFIED_BRAND_ORDER.indexOf(norm);
  if (idx !== -1) {
    return idx;
  }
  return 100 + (norm ? norm.charCodeAt(0) : 99);
}

/**
 * 브랜드 목록 배열을 카테고리별 우선순위로 정렬 ('all' 또는 '전체'는 맨 앞에 유지)
 */
export function sortBrandsByPriority(brands, category = '') {
  if (!Array.isArray(brands) || brands.length === 0) return [];
  const hasAll = brands.includes('all');
  const hasAllKr = brands.includes('전체') || brands.includes('전체 브랜드');

  const filtered = brands.filter(b => b !== 'all' && b !== '전체' && b !== '전체 브랜드');
  filtered.sort((a, b) => {
    const prioA = getBrandSortPriority(a, category);
    const prioB = getBrandSortPriority(b, category);
    if (prioA !== prioB) return prioA - prioB;
    return a.localeCompare(b, 'ko');
  });

  if (hasAll) return ['all', ...filtered];
  if (hasAllKr) return ['전체', ...filtered];
  return filtered;
}

/**
 * LX 장판 라인업 우선순위
 */
export function getLxJangpanLineupPriority(item) {
  if (!item) return 999;
  const line = String(item.line || item.name || item.description || '').replace(/\s+/g, '');
  const code = String(item.code || item.product_code || '').toUpperCase();

  // 1순위: 뉴청맥 (1.8T)
  if (line.includes('뉴청맥') || code.startsWith('CM')) return 10;
  // 2순위: 지아자연애 (2.2T)
  if (line.includes('자연애') || code.startsWith('ZJ')) return 20;
  // 3순위: 지아사랑애 (2.7T/3.2T)
  if (line.includes('사랑애') || code.startsWith('ZH')) return 30;
  // 4순위: 엑스컴포트 (5.0T)
  if (line.includes('엑스컴포트') || code.startsWith('XCF')) return 40;
  // 5순위: 지아소리잠 (4.5T)
  if (line.includes('소리잠') || code.startsWith('ZS')) return 50;
  // 6순위: 은행목 (2.0T)
  if (line.includes('은행목')) return 60;
  return 100;
}

/**
 * KCC 장판 라인업 우선순위
 */
export function getKccJangpanLineupPriority(item) {
  if (!item) return 999;
  const line = String(item.line || item.name || item.description || '');
  const code = String(item.code || item.product_code || '').toUpperCase();

  if (line.includes('도담') || code.startsWith('NJ') || code.startsWith('NR')) return 10;
  if (line.includes('휴가온') || code.startsWith('NC') || code.startsWith('NV')) return 20;
  if (line.includes('그린') || code.startsWith('NP') || code.startsWith('NK')) return 30;
  if (line.includes('옥') || code.startsWith('MN')) return 40;
  return 100;
}

/**
 * 상품 추천 배지 정보 반환 (대표 상품에만 타겟팅 부여)
 * 데코타일 KCC 대표 상품: '추천', '동경바닥재 PICK', '인기 데코타일'
 * 장판 LX 대표 상품: '추천', '동경바닥재 PICK', '인기 장판'
 */
export function getProductBadgeInfo(item) {
  if (!item) return null;
  const cat = item.category || '';
  const brand = normalizeBrandName(item.brand || item.computedBrand || '');
  const code = String(item.code || item.product_code || '').trim().toUpperCase();

  // 관리자 수동 명시 설정 우선
  if (item.is_featured === true || item.isFeatured === true) {
    return { type: 'recommended', text: '추천' };
  }

  // 1. 데코타일: KCC 대표 상품
  if (cat === '데코타일' && brand === 'KCC') {
    // 동경바닥재 PICK: 센스타일 트랜디 450각 대표 모델
    if (code === 'TS5502P' || code.includes('5502') || code === 'TS 5502P') {
      return { type: 'pick', text: '동경바닥재 PICK' };
    }
    // 인기 데코타일: 센스타일 프로 대형/프리미엄 모델
    if (code === '30141M' || code === '30082P') {
      return { type: 'popular', text: '인기 데코타일' };
    }
    // 추천: 센스레이 및 트랜디 주요 모델
    if (code === 'TS5501P' || code === 'TS 5501P' || code === 'B0122J' || code === 'TS5503P' || code === 'TS 5503P') {
      return { type: 'recommended', text: '추천' };
    }
  }

  // 2. 장판: LX하우시스 대표 상품
  if (cat === '장판' && brand === 'LX') {
    // 동경바닥재 PICK: 뉴청맥 1.8T 대표 실속형
    if (code === 'CM21882' || code === 'CM22771') {
      return { type: 'pick', text: '동경바닥재 PICK' };
    }
    // 인기 장판: 지아자연애 2.2T 베스트셀러
    if (code.startsWith('ZJ43601') || code.startsWith('ZJ43841')) {
      return { type: 'popular', text: '인기 장판' };
    }
    // 추천: 엑스컴포트 5.0T 프리미엄 및 지아사랑애
    if (code === 'XCF3441' || code === 'XCF3611' || code === 'XCF3621' || code.startsWith('ZH60111')) {
      return { type: 'recommended', text: '추천' };
    }
  }

  return null;
}

/**
 * 상품 추천 여부 판별 (배지가 있거나 추천 대상인 경우 true)
 */
export function isProductRecommended(item) {
  if (!item) return false;
  return getProductBadgeInfo(item) !== null;
}

/**
 * 자재찾기 및 상품 목록 추천 정렬 우선순위 비교 함수
 * 카테고리별 차등 적용:
 * - 데코타일: KCC 1위 (센스타일 트랜디 450각 -> 600각 -> 우드 -> 프로 -> 센스레이) -> 동신 -> 재영 -> 우성 -> LX -> 녹수 -> 현대
 * - 장판: LX 1위 (뉴청맥 -> 지아자연애 -> 지아사랑애 -> 엑스컴포트) -> KCC -> 현대
 * - 마루, 벽지, 카페트타일: 기존 브랜드 순서 유지
 */
export function compareProductRecommendationPriority(a, b, category = '') {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;

  const catA = a.category || category || '';
  const catB = b.category || category || '';
  const effectiveCat = category || catA || catB || '';

  // 1. 브랜드 우선순위 (카테고리별 차등 적용)
  const prioA = getBrandSortPriority(a, effectiveCat);
  const prioB = getBrandSortPriority(b, effectiveCat);
  if (prioA !== prioB) {
    return prioA - prioB;
  }

  const brandA = normalizeBrandName(a.brand || a.computedBrand || '');
  const brandB = normalizeBrandName(b.brand || b.computedBrand || '');

  // 2. 데코타일 내부 라인업 정렬 (KCC 라인업 및 450각 최우선)
  if (effectiveCat === '데코타일') {
    if (brandA === 'KCC' && brandB === 'KCC') {
      const linePrioA = getKccProductLineupPriority(a);
      const linePrioB = getKccProductLineupPriority(b);
      if (linePrioA !== linePrioB) {
        return linePrioA - linePrioB;
      }

      // 같은 라인업 내에서 450각 규격 우선
      const specA = String(a.spec || a.size_text || a.shape || (a.specs && a.specs.size) || '');
      const specB = String(b.spec || b.size_text || b.shape || (b.specs && b.specs.size) || '');
      const codeA = String(a.code || a.product_code || '').toUpperCase();
      const codeB = String(b.code || b.product_code || '').toUpperCase();
      const is450A = specA.includes('457') || specA.includes('450') || codeA.endsWith('P');
      const is450B = specB.includes('457') || specB.includes('450') || codeB.endsWith('P');
      if (is450A && !is450B) return -1;
      if (!is450A && is450B) return 1;
    }
  }

  // 3. 장판 내부 라인업 정렬 (LX 라인업 및 KCC 라인업)
  if (effectiveCat === '장판') {
    if (brandA === 'LX' && brandB === 'LX') {
      const linePrioA = getLxJangpanLineupPriority(a);
      const linePrioB = getLxJangpanLineupPriority(b);
      if (linePrioA !== linePrioB) {
        return linePrioA - linePrioB;
      }
    } else if (brandA === 'KCC' && brandB === 'KCC') {
      const linePrioA = getKccJangpanLineupPriority(a);
      const linePrioB = getKccJangpanLineupPriority(b);
      if (linePrioA !== linePrioB) {
        return linePrioA - linePrioB;
      }
    }
  }

  // 4. 대표 추천 배지 부여 상품 가산점
  const badgeA = getProductBadgeInfo(a);
  const badgeB = getProductBadgeInfo(b);
  if (badgeA && !badgeB) return -1;
  if (!badgeA && badgeB) return 1;

  // 5. 관리자 sort_order
  const sortA = a.sort_order ?? a.sortOrder ?? 999;
  const sortB = b.sort_order ?? b.sortOrder ?? 999;
  if (sortA !== sortB) {
    return sortA - sortB;
  }

  // 6. 상품 코드 / 상품명 가나다순
  const codeA = String(a.code || a.product_code || a.name || '');
  const codeB = String(b.code || b.product_code || b.name || '');
  return codeA.localeCompare(codeB, 'ko', { numeric: true });
}

/**
 * 샘플북 정렬 우선순위
 * 데코타일: KCC 맨 앞 (트랜디 -> 프로 -> 센스레이) -> 타 브랜드
 * 장판: LX 맨 앞 -> KCC 두 번째 -> 현대 세 번째
 */
export function getSampleBookPriority(book, category = '') {
  if (!book) return 9999;
  const id = String(book.id || '').toLowerCase();
  const title = String(book.title || '').toLowerCase();
  const brand = normalizeBrandName(book.brand || '');
  const cat = category || book.category || '';

  // 1. 데코타일 카테고리
  if (cat === '데코타일') {
    const isKcc = brand === 'KCC' || title.includes('kcc') || id.startsWith('kcc-');
    if (isKcc) {
      if (id.includes('trendy') || title.includes('트랜디') || title.includes('트렌디')) return 10;
      if (id.includes('pro') || title.includes('프로')) return 20;
      if (id.includes('sensray') || id.includes('senseray') || title.includes('센스레이')) return 30;
      return 40;
    }
    const brandRank = getBrandSortPriority(book, '데코타일');
    const recBonus = book.isRecommended ? 0 : 50;
    return 1000 + (brandRank * 100) + recBonus;
  }

  // 2. 장판 카테고리: LX 맨 앞, KCC 두 번째, 현대 세 번째
  if (cat === '장판') {
    const isLx = brand === 'LX' || title.includes('lx') || id.startsWith('lx-');
    if (isLx) return 10;

    const isKcc = brand === 'KCC' || title.includes('kcc') || id.startsWith('kcc-');
    if (isKcc) return 20;

    const isHyundai = brand === '현대' || title.includes('현대') || id.startsWith('hyundai-');
    if (isHyundai) return 30;

    const brandRank = getBrandSortPriority(book, '장판');
    return 1000 + (brandRank * 100);
  }

  // 3. 추천 자재 탭: KCC 센스타일 트랜디(1순위) -> LX하우시스 X.XT(2순위) -> 동신 아트타일(3순위)
  if (cat === 'recommended') {
    if ((brand === 'KCC' || id.startsWith('kcc-')) && (id.includes('trendy') || title.includes('트랜디') || title.includes('트렌디'))) {
      return 1;
    }
    if ((brand === 'LX' || id.startsWith('lx-')) && (id.includes('xxt') || title.includes('x.xt') || title.includes('xxt'))) {
      return 2;
    }
    if ((brand === '동신' || id.startsWith('dongshin-')) && (id.includes('art-tile') || id.includes('polyma') || title.includes('아트타일'))) {
      return 3;
    }
    if (book.isRecommended) return 100;
    return 1000 + (getBrandSortPriority(book, '') * 10);
  }

  // 4. 기타 fallback
  const isKcc = brand === 'KCC' || title.includes('kcc') || id.startsWith('kcc-');
  if (isKcc) {
    if (id.includes('trendy') || title.includes('트랜디') || title.includes('트렌디')) return 10;
    if (id.includes('pro') || title.includes('프로')) return 20;
    if (id.includes('sensray') || id.includes('senseray') || title.includes('센스레이')) return 30;
    if (title.includes('도담')) return 40;
    if (title.includes('휴가온')) return 50;
    return 60;
  }

  const brandRank = getBrandSortPriority(book, cat);
  const recBonus = book.isRecommended ? 0 : 50;
  return 1000 + (brandRank * 100) + recBonus;
}

export function compareSampleBookPriority(a, b, category = '') {
  const prioA = getSampleBookPriority(a, category);
  const prioB = getSampleBookPriority(b, category);
  if (prioA !== prioB) {
    return prioA - prioB;
  }

  const titleA = String(a?.title || '');
  const titleB = String(b?.title || '');
  return titleA.localeCompare(titleB, 'ko');
}
