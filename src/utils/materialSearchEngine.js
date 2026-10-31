/**
 * 동경바닥재 AI형 통합 자재 검색 엔진 (Material Search Engine)
 * - 색상 (베이지, 화이트, 그레이, 블랙, 브라운, 우드, 그린, 라임, 블루, 핑크 등)
 * - 질감·패턴 (콘크리트, 스톤, 테라조, 우드, 헤링본, 무광/유광, 패브릭, 솔리드 등)
 * - 분위기·공간·용도 (따뜻한 분위기, 모던한, 카페, 사무실, 헬스장, 거실, 상업용 등)
 * - 자연어 복합 검색 파싱 및 다중 의도(Multi-intent) 가중치 점수 계산
 * - 기존 상품코드, 상품명, 브랜드, 라인업 검색 100% 완전 보존
 */

import { metadataByCode, metadataById } from "../data/productSearchMetadata.generated.js";

// 1. 브랜드 정규화 및 별칭 사전 (완전 보존)
export const BRAND_DICTIONARY = {
  LX: {
    canonical: "LX",
    displayName: "LX하우시스",
    aliases: ["lx", "lx하우시스", "lxhauzys", "lg", "lg하우시스", "엘지", "엘지하우시스", "엘엑스", "엘엑스하우시스"],
    categories: ["벽지", "장판", "데코타일"]
  },
  KCC: {
    canonical: "KCC",
    displayName: "KCC글라스",
    aliases: ["kcc", "kcc글라스", "케이씨씨", "케이씨씨글라스", "kcc바닥재"],
    categories: ["데코타일", "장판"]
  },
  동신: {
    canonical: "동신",
    displayName: "동신포리마",
    aliases: ["동신", "동신포리마", "dongshin"],
    categories: ["데코타일"]
  },
  현대: {
    canonical: "현대",
    displayName: "현대L&C",
    aliases: ["현대", "현대l&c", "현대엘앤씨", "현대벽지", "hyundai"],
    categories: ["데코타일", "장판", "벽지"]
  },
  이건마루: {
    canonical: "이건마루",
    displayName: "이건마루",
    aliases: ["이건", "이건마루", "eagon"],
    categories: ["마루"]
  },
  동화: {
    canonical: "동화",
    displayName: "동화자연마루",
    aliases: ["동화", "동화마루", "동화자연마루", "dongwha"],
    categories: ["마루"]
  },
  구정: {
    canonical: "구정",
    displayName: "구정마루",
    aliases: ["구정", "구정마루", "kujung"],
    categories: ["마루"]
  },
  개나리: {
    canonical: "개나리",
    displayName: "개나리벽지",
    aliases: ["개나리", "개나리벽지", "gaenari"],
    categories: ["벽지"]
  },
  서울: {
    canonical: "서울",
    displayName: "서울벽지",
    aliases: ["서울", "서울벽지", "seoul"],
    categories: ["벽지"]
  },
  제일: {
    canonical: "제일",
    displayName: "제일벽지",
    aliases: ["제일", "제일벽지", "jeil"],
    categories: ["벽지"]
  },
  신한: {
    canonical: "신한",
    displayName: "신한벽지",
    aliases: ["신한", "신한벽지", "shinhan"],
    categories: ["벽지"]
  },
  디아이디: {
    canonical: "디아이디",
    displayName: "DID벽지",
    aliases: ["did", "디아이디", "디디"],
    categories: ["벽지"]
  },
  녹수: {
    canonical: "녹수",
    displayName: "녹수",
    aliases: ["녹수", "noksu"],
    categories: ["데코타일"]
  },
  대진: {
    canonical: "대진",
    displayName: "대진",
    aliases: ["대진", "daejin"],
    categories: ["데코타일"]
  },
  유성: {
    canonical: "유성",
    displayName: "유성",
    aliases: ["유성", "yousung", "youseong", "우성"],
    categories: ["데코타일", "디럭스타일"]
  },
  재영: {
    canonical: "재영",
    displayName: "재영",
    aliases: ["재영", "jaeyoung"],
    categories: ["데코타일"]
  },
  스완: {
    canonical: "스완",
    displayName: "스완카페트",
    aliases: ["스완", "swan", "스완카페트"],
    categories: ["카페트타일"]
  },
  코오롱: {
    canonical: "코오롱",
    displayName: "코오롱",
    aliases: ["코오롱", "kolon"],
    categories: ["카페트타일"]
  }
};

// 2. 색상 온톨로지 사전 (요구사항 2-A)
export const COLOR_TAXONOMY = {
  베이지: {
    canonical: '베이지',
    exact: ['베이지', 'beige'],
    related: ['아이보리', '크림', '샌드', '웜베이지', '미색', '오트밀', '바닐라', '라떼', '비스크', '토프'],
    tone: '웜톤',
    brightness: '밝음'
  },
  화이트: {
    canonical: '화이트',
    exact: ['화이트', 'white', '흰색', '백색'],
    related: ['오프화이트', '밀크화이트', '순백', '스노우화이트', '올화이트', '크리스탈', '블랑', '비앙코'],
    tone: '뉴트럴',
    brightness: '밝음'
  },
  그레이: {
    canonical: '그레이',
    exact: ['그레이', 'gray', 'grey', '회색'],
    related: ['라이트그레이', '다크그레이', '애쉬', '쿨그레이', '웜그레이', '차콜', '스톤그레이', '시멘트그레이', '어반그레이', '실버', '텐더그레이'],
    tone: '쿨톤',
    brightness: '중간'
  },
  블랙: {
    canonical: '블랙',
    exact: ['블랙', 'black', '검정'],
    related: ['차콜', '다크블랙', '딥블랙', '매트블랙', '흑색', '미드나잇', '오닉스'],
    tone: '다크',
    brightness: '어두움'
  },
  브라운: {
    canonical: '브라운',
    exact: ['브라운', 'brown', '갈색'],
    related: ['초코', '월넛', '모카', '다크브라운', '체스넛', '마호가니', '커피', '시나몬', '카멜'],
    tone: '웜톤',
    brightness: '어두움'
  },
  우드: {
    canonical: '우드',
    exact: ['우드', 'wood', '나무', '원목'],
    related: ['오크', '화이트오크', '내추럴오크', '티크', '나뭇결', '메이플', '비치', '체리', '아카시아', '엘름', '우드패턴', '쪽마루'],
    tone: '내추럴',
    brightness: '중간'
  },
  그린: {
    canonical: '그린',
    exact: ['그린', 'green', '녹색', '초록'],
    related: ['올리브', '세이지', '민트', '포레스트', '카키', '에메랄드', '세이지그린'],
    tone: '내추럴',
    brightness: '중간'
  },
  라임: {
    canonical: '라임',
    exact: ['라임', 'lime'],
    related: ['라임그린', '연두', '라이트그린', '옐로우그린'],
    tone: '소프트',
    brightness: '밝음'
  },
  블루: {
    canonical: '블루',
    exact: ['블루', 'blue', '파랑'],
    related: ['네이비', '스카이블루', '딥블루', '인디고', '오션', '청색', '소프트블루'],
    tone: '쿨톤',
    brightness: '중간'
  },
  핑크: {
    canonical: '핑크',
    exact: ['핑크', 'pink', '분홍'],
    related: ['로즈', '연핑크', '베이비핑크', '코랄', '피치', '살구', '인디핑크'],
    tone: '웜톤',
    brightness: '밝음'
  },
  옐로우: {
    canonical: '옐로우',
    exact: ['옐로우', 'yellow', '노랑'],
    related: ['머스타드', '레몬', '골드', '버터'],
    tone: '웜톤',
    brightness: '밝음'
  }
};

// 3. 질감 및 패턴 사전 (요구사항 2-B)
export const PATTERN_TAXONOMY = {
  콘크리트: {
    canonical: '콘크리트',
    keywords: ['콘크리트', '시멘트', '노출콘크리트', '몰탈', '레진', '포틀랜드', 'concrete', 'cement']
  },
  '스톤/대리석': {
    canonical: '스톤/대리석',
    keywords: ['스톤', '돌', '석재', '대리석', '마블', '비앙코', '슬레이트', '트래버틴', '화강암', '쿼츠', '화산석', '그라니트', '그래니트', 'stone', 'marble']
  },
  테라조: {
    canonical: '테라조',
    keywords: ['테라조', '칩패턴', '칩', '그란데 테라조', '그란데테라조', '도트스톤', '테라조타일', 'terrazzo']
  },
  우드: {
    canonical: '우드',
    keywords: ['우드', '나뭇결', '원목', '오크', '나무', '플랭크', '쪽마루', '판재', 'wood']
  },
  헤링본: {
    canonical: '헤링본',
    keywords: ['헤링본', '체크', '기하학', '쉐브론', '지그재그', 'herringbone']
  },
  패브릭: {
    canonical: '패브릭',
    keywords: ['패브릭', '직물', '린넨', '위빙', '캔버스', '카페트', '카펫질감', '우븐', '카펫', 'fabric', 'carpet']
  },
  '솔리드/무지': {
    canonical: '솔리드/무지',
    keywords: ['솔리드', '단색', '무지', '플레인', '페인트', 'solid']
  },
  빈티지: {
    canonical: '빈티지',
    keywords: ['빈티지', '러스틱', '내추럴', '앤틱', '에이징', '고재', 'vintage', 'rustic']
  }
};

// 4. 표면 마감 사전
export const FINISH_TAXONOMY = {
  무광: {
    canonical: '무광',
    keywords: ['무광', '매트', '소프트매트', '자연광', 'matte']
  },
  유광: {
    canonical: '유광',
    keywords: ['유광', '고광택', '하이글로시', '광택', 'glossy', 'gloss']
  }
};

// 5. 분위기 및 스타일 사전 (요구사항 2-C)
export const STYLE_TAXONOMY = {
  '따뜻한 분위기': ['따뜻한 분위기', '따뜻한', '아늑한', '포근한', '편안한', '온화한', '따스한', '따뜻함'],
  '차가운 분위기': ['차가운 분위기', '차가운', '시크한', '도시적인', '쿨', '도회적', '차가움'],
  '모던한': ['모던한', '모던', '현대적인', '세련된', '심플한'],
  '미니멀한': ['미니멀한', '미니멀', '간결한', '깔끔한', '단정한'],
  '내추럴한': ['내추럴한', '내추럴', '자연스러운', '자연친화', '원목느낌', '자연'],
  '고급스러운': ['고급스러운', '고급', '프리미엄', '호텔', '럭셔리', '중후한'],
  '밝고 화사한': ['밝고 화사한', '밝은', '화사한', '산뜻한', '환한', '쾌적한'],
  '차분한': ['차분한', '정돈된', '안정감', '묵직한', '차분함']
};

// 6. 공간 및 용도 사전 (요구사항 2-C)
export const SPACE_TAXONOMY = {
  사무실: ['사무실', '사무실 바닥', '사무실바닥', '오피스', '업무시설', '회의실', '상업공간', '사무실용', 'office'],
  카페: ['카페', '카페 인테리어', '카페인테리어', '카페 바닥', '카페바닥', '매장', '식당', '상가', '쇼룸', '상업용 바닥재', '상업용바닥재', 'cafe'],
  거실: ['거실', '거실 바닥', '거실바닥', '주거용', '아파트', '빌라', '침실', '가정용', '방바닥'],
  헬스장: ['헬스장', '헬스장 바닥', '헬스장바닥', '피트니스', '체육관', '스포츠', '체육시설'],
  '학원/교육시설': ['학원', '학원 바닥', '학원바닥', '어린이집', '유치원', '학교', '강의실', '차음바닥'],
  '병원/의료시설': ['병원', '병원 바닥', '병원바닥', '의원', '클리닉', '요양원', '의료시설']
};

// 7. 인기 추천 검색어 (요구사항 7-2)
export const POPULAR_KEYWORDS = [
  "베이지",
  "콘크리트",
  "밝은 우드",
  "그레이 600각",
  "따뜻한 분위기",
  "카페 바닥재",
  "디아망",
  "센스타일"
];

// 8. 텍스트 및 코드 정규화 유틸리티
export function normalizeSearchText(text = "") {
  return String(text || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\-_.,/·/()\[\]]+/g, "")
    .trim();
}

export function normalizeProductCode(code = "") {
  return String(code || "")
    .normalize("NFKC")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .trim();
}

export function tokenizeQuery(query = "") {
  return String(query || "")
    .normalize("NFKC")
    .toLowerCase()
    .split(/[\s,·/+/]+/)
    .map(t => t.trim())
    .filter(Boolean);
}

// 9. 라인업 데이터베이스 (동신, KCC, LX 등 기존 라인업 완전 보존)
export const LINEUP_DATABASE = [
  {
    lineup: "트랜디",
    brand: "KCC",
    category: "데코타일",
    aliases: ["트랜디", "트렌디", "센스타일 트랜디", "센스타일트랜디", "trendy"],
    dbKeywords: ["트랜디", "트렌디", "TS", "TW"],
    description: "KCC 센스타일 트랜디 450각/600각/우드 타일"
  },
  {
    lineup: "프로",
    brand: "KCC",
    category: "데코타일",
    aliases: ["프로", "센스타일 프로", "센스타일프로", "pro"],
    dbKeywords: ["프로", "센스타일 프로", "GW", "GS", "30082P", "30102P"],
    description: "KCC 센스타일 프로 프리미엄 데코타일"
  },
  {
    lineup: "센스레이",
    brand: "KCC",
    category: "데코타일",
    aliases: ["센스레이", "센스 레이", "senselay"],
    dbKeywords: ["센스레이", "센스 레이", "B01", "B02"],
    description: "KCC 친환경 프리미엄 데코타일"
  },
  {
    lineup: "디아망",
    brand: "LX",
    category: "벽지",
    aliases: ["디아망", "diamant", "lx 디아망", "디아망포티스"],
    dbKeywords: ["디아망", "DIAMANT", "PR0"],
    description: "LX하우시스 최고급 프리미엄 딥엠보 실크벽지"
  },
  {
    lineup: "베스띠",
    brand: "LX",
    category: "벽지",
    aliases: ["베스띠", "베스트", "besti", "lx 베스띠"],
    dbKeywords: ["베스띠", "베스트", "BESTI", "82"],
    description: "LX하우시스 친환경 대표 실크벽지"
  },
  {
    lineup: "테라피",
    brand: "LX",
    category: "벽지",
    aliases: ["테라피", "therapy", "lx 테라피"],
    dbKeywords: ["테라피", "THERAPY", "70", "8195"],
    description: "LX하우시스 모던 미니멀 실크벽지"
  },
  {
    lineup: "아트타일",
    brand: "동신",
    category: "데코타일",
    aliases: ["아트타일", "art tile", "arttile", "동신 아트타일"],
    dbKeywords: ["아트타일", "AB", "AS"],
    description: "동신포리마 대표 상업용 데코타일"
  },
  {
    lineup: "아트에코차음",
    brand: "동신",
    category: "데코타일",
    aliases: ["아트에코차음", "동신 아트에코차음", "에코차음", "동신 에코차음", "차음타일", "에코 차음"],
    dbKeywords: ["아트에코차음", "에코차음", "차음", "CH57", "CH63", "6202"],
    description: "동신포리마 5.0T 소음저감 데코타일"
  },
  {
    lineup: "아트 OA타일",
    brand: "동신",
    category: "데코타일",
    aliases: ["oa타일", "oa", "동신 oa타일", "동신 oa", "아트 oa"],
    dbKeywords: ["OA", "아트 OA"],
    description: "동신포리마 5.0T 프리미엄 오피스 타일"
  }
];

// 10. AI형 자연어 복합 검색 쿼리 파서 (Natural Language Intent Parser)
export function parseSearchQuery(query) {
  const raw = String(query || "").trim();
  const norm = normalizeSearchText(raw);
  const codeNorm = normalizeProductCode(raw);
  const tokens = tokenizeQuery(raw);

  let explicitBrand = null;
  let explicitCategory = null;
  let detectedBrand = null;
  let detectedCategory = null;
  let detectedLineup = null;
  let detectedSpec = null;
  let detectedThickness = null;

  // A. 브랜드 감지
  for (const [key, brandInfo] of Object.entries(BRAND_DICTIONARY)) {
    for (const alias of brandInfo.aliases) {
      const aliasNorm = normalizeSearchText(alias);
      if (tokens.some(t => normalizeSearchText(t) === aliasNorm) || norm === aliasNorm || norm.startsWith(aliasNorm)) {
        explicitBrand = brandInfo.canonical;
        detectedBrand = brandInfo.canonical;
        break;
      }
    }
    if (explicitBrand) break;
  }

  // B. 카테고리 감지
  const categoryKeywords = {
    "데코타일": ["데코타일", "데코 타일", "데코", "lvt", "바닥타일", "타일바닥재", "타일"],
    "장판": ["장판", "모노륨", "륨", "시트바닥재", "륨바닥재"],
    "마루": ["마루", "강마루", "원목마루", "천연마루", "강화마루"],
    "벽지": ["벽지", "실크벽지", "합지벽지", "방염벽지", "도배지"],
    "카페트타일": ["카페트타일", "카페트 타일", "카페트", "카펫", "카펫타일", "타일카페트"],
    "러버타일": ["러버타일", "고무타일", "헬스장타일"]
  };

  for (const [cat, aliases] of Object.entries(categoryKeywords)) {
    for (const a of aliases) {
      const aNorm = normalizeSearchText(a);
      if (tokens.some(t => normalizeSearchText(t) === aNorm) || norm.includes(aNorm)) {
        explicitCategory = cat;
        detectedCategory = cat;
        break;
      }
    }
    if (explicitCategory) break;
  }

  // C. 라인업 감지
  for (const item of LINEUP_DATABASE) {
    for (const alias of item.aliases) {
      const aNorm = normalizeSearchText(alias);
      if (norm.includes(aNorm) || tokens.some(t => normalizeSearchText(t) === aNorm)) {
        detectedLineup = item;
        if (!detectedBrand) detectedBrand = item.brand;
        if (!detectedCategory) detectedCategory = item.category;
        break;
      }
    }
    if (detectedLineup) break;
  }

  // D. 색상 감지 (대표 색상 vs 연관 색상 + 라임/라임오크 구분)
  let detectedColorFamily = null;
  let detectedColorDetail = null;
  let isExactColor = false;

  // 특수 케이스: '라임오크' vs 순수 '라임'
  const isLimeOak = /라임\s*오크|라임오크/.test(raw);
  const isLime = /라임|라임그린|연두/.test(raw);

  if (isLime && !isLimeOak) {
    detectedColorFamily = '라임';
    detectedColorDetail = '라임';
    isExactColor = true;
  } else if (isLimeOak) {
    detectedColorFamily = '우드';
    detectedColorDetail = '라임오크';
    isExactColor = true;
  } else {
    for (const [famName, conf] of Object.entries(COLOR_TAXONOMY)) {
      // 1. 정확 일치 검사
      for (const ex of conf.exact) {
        if (tokens.some(t => normalizeSearchText(t) === normalizeSearchText(ex)) || norm.includes(normalizeSearchText(ex))) {
          detectedColorFamily = famName;
          detectedColorDetail = ex;
          isExactColor = true;
          break;
        }
      }
      if (detectedColorFamily) break;

      // 2. 연관 세부 색상 검사
      for (const rel of conf.related) {
        if (tokens.some(t => normalizeSearchText(t) === normalizeSearchText(rel)) || norm.includes(normalizeSearchText(rel))) {
          detectedColorFamily = famName;
          detectedColorDetail = rel;
          isExactColor = false;
          break;
        }
      }
      if (detectedColorFamily) break;
    }
  }

  // E. 패턴 및 질감 감지
  let detectedPattern = null;
  let detectedPatternKeyword = null;

  for (const [patName, conf] of Object.entries(PATTERN_TAXONOMY)) {
    for (const kw of conf.keywords) {
      const kwNorm = normalizeSearchText(kw);
      if (tokens.some(t => normalizeSearchText(t) === kwNorm) || norm.includes(kwNorm)) {
        detectedPattern = conf.canonical;
        detectedPatternKeyword = kw;
        break;
      }
    }
    if (detectedPattern) break;
  }

  // F. 표면 마감 감지
  let detectedFinish = null;
  for (const [finName, conf] of Object.entries(FINISH_TAXONOMY)) {
    for (const kw of conf.keywords) {
      if (norm.includes(normalizeSearchText(kw))) {
        detectedFinish = conf.canonical;
        break;
      }
    }
    if (detectedFinish) break;
  }

  // G. 공간 및 용도 감지
  let detectedSpace = null;
  for (const [spName, keywords] of Object.entries(SPACE_TAXONOMY)) {
    for (const kw of keywords) {
      if (norm.includes(normalizeSearchText(kw)) || tokens.some(t => normalizeSearchText(t) === normalizeSearchText(kw))) {
        detectedSpace = spName;
        break;
      }
    }
    if (detectedSpace) break;
  }

  // H. 분위기 및 스타일 감지
  let detectedStyle = null;
  for (const [stName, keywords] of Object.entries(STYLE_TAXONOMY)) {
    for (const kw of keywords) {
      if (norm.includes(normalizeSearchText(kw))) {
        detectedStyle = stName;
        break;
      }
    }
    if (detectedStyle) break;
  }

  // I. 규격 (600각, 450각)
  if (/600각|600\s*[x×]\s*600/i.test(raw)) {
    detectedSpec = "600각";
  } else if (/450각|457\.?2?각|450\s*[x×]\s*450/i.test(raw)) {
    detectedSpec = "450각";
  }

  // J. 두께 (1.8T ~ 5.0T)
  const thickStrict = raw.match(/(?:^|\s)(1\.8|2\.0|2\.2|2\.7|3\.0|3\.2|4\.5|5\.0|1\.8|2|3|4\.5|5)\s*(?:T|t|mm|㎜)(?:\s|$)/i);
  if (thickStrict) {
    detectedThickness = parseFloat(thickStrict[1]).toFixed(1) + 'T';
  } else if (detectedCategory === '장판') {
    const jangpanThick = raw.match(/(?:^|\s)(1\.8|2\.0|2\.2|2\.7|3\.0|3\.2|4\.5|5\.0)(?:\s|$)/);
    if (jangpanThick) {
      detectedThickness = parseFloat(jangpanThick[1]).toFixed(1) + 'T';
    }
  }

  // K. 상품코드 쿼리 판별
  const isPureCode = /^[A-Z0-9\-_./]+$/i.test(raw.trim()) && /[0-9]/.test(codeNorm) && codeNorm.length >= 2;
  const isCodeQuery = isPureCode || (tokens.some(t => /^[A-Z0-9\-_]{2,}$/i.test(t) && /[0-9]/.test(t)));

  return {
    raw,
    norm,
    codeNorm,
    tokens,
    explicitBrand,
    explicitCategory,
    detectedBrand,
    detectedCategory,
    detectedLineup,
    detectedColorFamily,
    detectedColorDetail,
    isExactColor,
    detectedPattern,
    detectedPatternKeyword,
    detectedFinish,
    detectedSpace,
    detectedStyle,
    detectedSpec,
    detectedThickness,
    isCodeQuery
  };
}

// 11. 관련도(Relevance) AI형 랭킹 점수 계산 엔진
export function scoreProduct(product, query, parsedInfo = null) {
  if (!product || !query) return 0;
  const p = parsedInfo || parseSearchQuery(query);
  const qNorm = p.norm;
  const qCode = p.codeNorm;

  if (!qNorm) return 0;

  let score = 0;

  const codeRaw = String(product.code || product.product_code || "").trim();
  const pCode = normalizeProductCode(codeRaw);
  const pCodeDigits = pCode.replace(/\D/g, "");
  const qCodeDigits = qCode.replace(/\D/g, "");

  // 메타데이터 취득 ($O(1)$)
  const meta = product.searchMetadata || metadataByCode.get(pCode) || metadataById.get(String(product.id).toLowerCase()) || null;

  const pName = normalizeSearchText(product.name || product.product_name || product.productName || (meta && meta.product_name) || "");
  const pDisplayTitle = normalizeSearchText(product.displayTitle || "");
  const pBrand = normalizeSearchText(product.brand || product.brand_name || (meta && meta.brand) || "");
  const pLine = normalizeSearchText(product.line || product.series || product.collection || product.description || (meta && meta.line) || "");
  const pCategory = product.category || product.category_name || (meta && meta.category) || "";

  // 1. 상품코드 일치 (최우선 순위: 15,000점)
  let codeMatched = false;
  if (pCode && qCode) {
    if (pCode === qCode) {
      score += 15000;
      codeMatched = true;
    } else if (pCode.startsWith(qCode)) {
      score += 10000;
      codeMatched = true;
    } else if (pCode.endsWith(qCode)) {
      const afterHyphen = codeRaw.includes('-') ? codeRaw.split('-').pop() : '';
      if (!codeRaw.includes('-') || normalizeProductCode(afterHyphen).endsWith(qCode) || normalizeProductCode(afterHyphen) === qCode) {
        score += 8500;
        codeMatched = true;
      }
    } else if (pCode.includes(qCode)) {
      const parts = codeRaw.toUpperCase().split(/[-_/\s]+/);
      const isPartMatch = parts.some(part => {
        const normPart = normalizeProductCode(part);
        return normPart.includes(qCode) || normPart.endsWith(qCode);
      });
      if (isPartMatch || !codeRaw.includes('-')) {
        score += 7000;
        codeMatched = true;
      }
    } else if (qCodeDigits.length >= 3 && pCodeDigits === qCodeDigits) {
      score += 9000;
      codeMatched = true;
    } else if (qCodeDigits.length >= 3 && pCodeDigits.includes(qCodeDigits)) {
      const parts = codeRaw.toUpperCase().split(/[-_/\s]+/);
      const isPartDigitMatch = parts.some(part => {
        const normDigits = normalizeProductCode(part).replace(/\D/g, "");
        return normDigits.length >= 3 && normDigits.includes(qCodeDigits);
      });
      if (isPartDigitMatch || !codeRaw.includes('-')) {
        score += 6500;
        codeMatched = true;
      }
    }
  }

  // 토큰 단위 상품코드 매칭 (예: "6202", "TS 5541")
  for (const token of p.tokens) {
    const tCode = normalizeProductCode(token);
    const tDigits = tCode.replace(/\D/g, "");
    if (tDigits.length >= 3 && pCode) {
      if (pCode === tCode) {
        score += 8000;
        codeMatched = true;
      } else if (pCode.endsWith(tCode) || (pCodeDigits && pCodeDigits === tDigits)) {
        score += 7000;
        codeMatched = true;
      } else if (pCode.includes(tCode) || (pCodeDigits && pCodeDigits.includes(tDigits))) {
        score += 5000;
        codeMatched = true;
      }
    }
  }

  // 2. 상품명 일치 (12,000점)
  let nameMatched = false;
  if (pName || pDisplayTitle) {
    if (pName === qNorm || pDisplayTitle === qNorm) {
      score += 12000;
      nameMatched = true;
    } else if (pName.startsWith(qNorm) || pDisplayTitle.startsWith(qNorm)) {
      score += 6000;
      nameMatched = true;
    } else if (pName.includes(qNorm) || pDisplayTitle.includes(qNorm)) {
      score += 4000;
      nameMatched = true;
    }
  }

  // 3. 라인업 일치 (5,500점)
  let matchesLineup = false;
  if (p.detectedLineup) {
    const targetLine = normalizeSearchText(p.detectedLineup.lineup);
    const targetKeywords = p.detectedLineup.dbKeywords.map(normalizeSearchText);

    if (pLine.includes(targetLine) || targetKeywords.some(k => pLine.includes(k) || pName.includes(k))) {
      matchesLineup = true;
      score += 5500;
      if (pBrand === normalizeSearchText(p.detectedLineup.brand)) {
        score += 2000;
      }
    }
  }

  // 4. 브랜드 일치 (2,000점)
  let brandMatched = false;
  if (p.detectedBrand) {
    const bInfo = BRAND_DICTIONARY[p.detectedBrand];
    if (bInfo) {
      const canonicalNorm = normalizeSearchText(bInfo.canonical);
      const isAliasMatch = bInfo.aliases.map(normalizeSearchText).includes(pBrand);
      if (pBrand === canonicalNorm || isAliasMatch) {
        brandMatched = true;
        score += 2000;
      }
    }
  }

  // 5. 카테고리 일치 (1,000점)
  let categoryMatched = false;
  if (p.detectedCategory) {
    if (pCategory === p.detectedCategory) {
      categoryMatched = true;
      score += 1500;
    } else if (p.detectedCategory === "데코타일" && pCategory.includes("타일")) {
      categoryMatched = true;
      score += 800;
    }
  }

  // 6. AI 색상 일치 (요구사항 2-A: 대표 색상 최우선, 연관 색상 차순위)
  let colorMatched = false;
  if (p.detectedColorFamily && meta) {
    const pFam = meta.color_family;
    const pDet = meta.color_detail;

    if (pFam === p.detectedColorFamily) {
      colorMatched = true;
      if (p.isExactColor && (pDet === p.detectedColorDetail || pFam === p.detectedColorDetail)) {
        score += 3500; // 대표 색상 정확 일치
      } else {
        score += 2200; // 연관 색상 일치
      }
    } else if (meta.search_keywords?.includes(p.detectedColorFamily)) {
      colorMatched = true;
      score += 1500;
    }
  }

  // 7. AI 패턴/질감 일치 (요구사항 2-B)
  let patternMatched = false;
  if (p.detectedPattern && meta) {
    if (meta.pattern_type === p.detectedPattern || meta.pattern_type?.includes(p.detectedPattern)) {
      patternMatched = true;
      score += 3000;
    } else if (meta.texture && p.detectedPatternKeyword && meta.texture.includes(p.detectedPatternKeyword)) {
      patternMatched = true;
      score += 2000;
    } else if (meta.search_keywords?.includes(p.detectedPattern)) {
      patternMatched = true;
      score += 1500;
    }
  }

  // 8. AI 표면 마감 일치
  let finishMatched = false;
  if (p.detectedFinish && meta) {
    if (meta.finish === p.detectedFinish) {
      finishMatched = true;
      score += 1500;
    }
  }

  // 9. AI 공간/용도 일치 (요구사항 2-C)
  let spaceMatched = false;
  if (p.detectedSpace && meta) {
    if (meta.space_tags?.includes(p.detectedSpace)) {
      spaceMatched = true;
      score += 2000;
    } else if (meta.usage_tags?.includes(p.detectedSpace)) {
      spaceMatched = true;
      score += 1500;
    }
  }

  // 10. AI 분위기/스타일 일치 (요구사항 2-C)
  let styleMatched = false;
  if (p.detectedStyle && meta) {
    if (meta.style_tags?.includes(p.detectedStyle)) {
      styleMatched = true;
      score += 1800;
    }
  }

  // 11. 규격 (600각, 450각) 및 두께 일치
  let specMatched = false;
  if (p.detectedSpec) {
    const pSpec = normalizeSearchText(product.size_text || product.specs?.size || product.shape || meta?.spec_tag || "");
    if (p.detectedSpec === "450각" && (pSpec.includes("450") || pSpec.includes("457"))) {
      specMatched = true;
      score += 2000;
    } else if (p.detectedSpec === "600각" && pSpec.includes("600")) {
      specMatched = true;
      score += 2000;
    }
  }

  if (p.detectedThickness) {
    const pThick = (product.thickness || "").replace(/[^0-9.]/g, "");
    const qThick = p.detectedThickness.replace(/[^0-9.]/g, "");
    const specThick = String(product.specs?.thickness || "").replace(/[^0-9.]/g, "");
    const descThick = (product.description || "").replace(/[^0-9.]/g, "");
    if ((pThick && pThick === qThick) || (specThick && specThick === qThick) || (descThick && descThick.includes(qThick))) {
      score += 2500;
    }
  }

  // 12. 복합 조건 일치 가산점 (Cross-Domain Multi-Intent Bonus, 요구사항 3)
  const conditionCount = [colorMatched, patternMatched, spaceMatched, styleMatched, categoryMatched, specMatched, finishMatched].filter(Boolean).length;
  if (conditionCount >= 3) {
    score += 5000; // 3개 이상 복합 조건 충족 시 최우선 가산
  } else if (conditionCount === 2) {
    score += 2500; // 2개 복합 조건 충족 시 가산
  }

  // 13. 토큰 단위 매칭 보너스
  const searchableWords = `${pBrand} ${pCategory} ${pLine} ${pName} ${codeRaw} ${product.description || ''} ${meta?.search_keywords?.join(' ') || ''}`
    .toLowerCase()
    .split(/[\s\-_()[\]/·,]+/)
    .filter(Boolean);
  const searchableText = searchableWords.join(' ');

  let matchedTokenCount = 0;
  for (const token of p.tokens) {
    const tNorm = normalizeSearchText(token);
    if (!tNorm || tNorm.length < 2) continue;

    if (searchableText.includes(tNorm) || searchableWords.includes(tNorm)) {
      matchedTokenCount++;
      score += 400;
    }
  }

  if (p.tokens.length >= 2 && matchedTokenCount === p.tokens.length) {
    score += 2000; // 모든 단어 포함 보너스
  }

  // 14. 무관한 상품 필터링 (최소 기준 미달 시 배제)
  const hasAnyHit = codeMatched || nameMatched || matchesLineup || colorMatched || patternMatched || spaceMatched || styleMatched || brandMatched || categoryMatched || matchedTokenCount > 0;
  if (!hasAnyHit) {
    return 0;
  }

  return score;
}

// 12. 실시간 자동완성 및 추천 검색어 생성기
export function generateAutocompleteSuggestions(query, options = {}) {
  const text = String(query || "").trim();
  if (!text) return [];

  const parsed = parseSearchQuery(text);
  const qNorm = parsed.norm;
  const suggestions = [];
  const seenTitles = new Set();

  const addSuggestion = (item) => {
    if (suggestions.length >= 8) return;
    if (!seenTitles.has(item.title)) {
      seenTitles.add(item.title);
      suggestions.push(item);
    }
  };

  // 1. 색상 + 질감 추천
  for (const [colorName, conf] of Object.entries(COLOR_TAXONOMY)) {
    if (conf.canonical.includes(qNorm) || conf.exact.some(e => e.includes(qNorm))) {
      addSuggestion({
        type: "color",
        badge: "색상",
        title: `${conf.canonical} 바닥재`,
        subtitle: `${conf.related.slice(0, 3).join(", ")} 계열`,
        query: conf.canonical
      });
      addSuggestion({
        type: "color",
        badge: "색상+패턴",
        title: `${conf.canonical} 콘크리트`,
        subtitle: `${conf.canonical} 톤의 모던 콘크리트 질감`,
        query: `${conf.canonical} 콘크리트`
      });
    }
  }

  // 2. 질감 / 패턴 추천
  for (const [patName, conf] of Object.entries(PATTERN_TAXONOMY)) {
    if (conf.canonical.includes(qNorm) || conf.keywords.some(k => k.includes(qNorm))) {
      addSuggestion({
        type: "pattern",
        badge: "패턴/질감",
        title: `${conf.canonical} 데코타일`,
        subtitle: `${conf.canonical} 패턴의 바닥재 모아보기`,
        query: `${conf.canonical} 데코타일`
      });
    }
  }

  // 3. 라인업 매칭 추천 (기존 보존)
  for (const item of LINEUP_DATABASE) {
    const matchesLineup = item.aliases.some(a => {
      const aNorm = normalizeSearchText(a);
      return aNorm.includes(qNorm) || qNorm.includes(aNorm);
    });

    if (matchesLineup) {
      addSuggestion({
        type: "lineup",
        badge: "라인업",
        title: `${item.brand} ${item.lineup}`,
        subtitle: `${item.category} · ${item.description}`,
        query: `${item.brand} ${item.lineup}`,
        brand: item.brand,
        category: item.category
      });
    }
  }

  // 4. 공간/분위기 추천
  for (const [spName, keywords] of Object.entries(SPACE_TAXONOMY)) {
    if (spName.includes(qNorm) || keywords.some(k => k.includes(qNorm))) {
      addSuggestion({
        type: "space",
        badge: "공간/용도",
        title: `${spName} 바닥재`,
        subtitle: `${spName} 추천 바닥재 탐색`,
        query: `${spName} 바닥재`
      });
    }
  }

  // 5. 상품 번호/코드 쿼리 추천
  if (parsed.isCodeQuery && parsed.codeNorm.length >= 2) {
    if (parsed.codeNorm.startsWith("6202")) {
      addSuggestion({
        type: "product",
        badge: "제품번호",
        title: "6202 (에코차음)",
        subtitle: "동신포리마 아트에코차음 5.0T CH6202",
        query: "6202",
        code: "6202"
      });
    } else if (parsed.codeNorm.startsWith("30082")) {
      addSuggestion({
        type: "product",
        badge: "제품번호",
        title: "30082P (그란데 테라조)",
        subtitle: "KCC 센스타일 프로 450각 30082P",
        query: "30082P",
        code: "30082P"
      });
    } else {
      addSuggestion({
        type: "product",
        badge: "제품코드",
        title: `${parsed.codeNorm} 제품코드 검색`,
        subtitle: "일치하는 자재 조회",
        query: parsed.codeNorm,
        code: parsed.codeNorm
      });
    }
  }

  return suggestions.slice(0, 8);
}
