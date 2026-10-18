/**
 * 동경바닥재 통합 검색 엔진 (Material Search Engine)
 * - 브랜드 동의어, 제품 라인업, 제품코드(하이픈 무시), 규격/두께, 카테고리 매칭
 * - 다중 토큰 관련도(Relevance) 랭킹 점수 계산
 * - 실시간 자동완성 및 추천 검색어 생성
 */

// 1. 브랜드 정규화 및 별칭 사전
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
    aliases: ["유성", "yousung", "youseong"],
    categories: ["데코타일"]
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
    aliases: ["스완", "swan", "스완카페트", "스완카펫"],
    categories: ["카페트타일"]
  },
  어반: {
    canonical: "어반",
    displayName: "어반카페트",
    aliases: ["어반", "urban", "어반카페트", "어반카펫"],
    categories: ["카페트타일"]
  },
  코오롱: {
    canonical: "코오롱",
    displayName: "코오롱",
    aliases: ["코오롱", "kolon"],
    categories: ["카페트타일"]
  }
};

// 2. 제품 라인업 & 시리즈 지식 사전
export const LINEUP_DATABASE = [
  // [LX 벽지]
  {
    lineup: "디아망",
    brand: "LX",
    category: "벽지",
    aliases: ["디아망", "디아망포티스", "diamant", "lx 디아망", "lg 디아망", "엘엑스 디아망"],
    dbKeywords: ["디아망"],
    description: "LX 프리미엄 입체 실크벽지"
  },
  {
    lineup: "베스띠",
    brand: "LX",
    category: "벽지",
    // DB상 실크_LX_베스트 로 저장된 항목 완벽 지원
    aliases: ["베스띠", "베스트", "besti", "lx 베스띠", "lg 베스띠", "엘엑스 베스띠", "lx 베스트"],
    dbKeywords: ["베스띠", "베스트", "BESTI"],
    description: "LX 트렌디 실크벽지"
  },
  {
    lineup: "테라피",
    brand: "LX",
    category: "벽지",
    aliases: ["테라피", "therapy", "lx 테라피", "lg 테라피", "엘엑스 테라피"],
    dbKeywords: ["테라피", "THERAPY"],
    description: "LX 무지 실크벽지"
  },
  {
    lineup: "휘앙세",
    brand: "LX",
    category: "벽지",
    aliases: ["휘앙세", "hiance", "lx 휘앙세", "lg 휘앙세"],
    dbKeywords: ["휘앙세", "HIANCE"],
    description: "LX 친환경 합지벽지"
  },

  // [LX 장판]
  {
    lineup: "뉴청맥",
    brand: "LX",
    category: "장판",
    aliases: ["뉴청맥", "청맥", "lx 뉴청맥"],
    dbKeywords: ["뉴청맥", "청맥"],
    description: "LX 1.8T 실속형 모노륨 장판"
  },
  {
    lineup: "은행목",
    brand: "LX",
    category: "장판",
    aliases: ["은행목", "lx 은행목"],
    dbKeywords: ["은행목"],
    description: "LX 2.0T 주거용 장판"
  },
  {
    lineup: "지아자연애",
    brand: "LX",
    category: "장판",
    aliases: ["지아자연애", "자연애", "지아"],
    dbKeywords: ["지아자연애", "자연애", "지아"],
    description: "LX 2.2T 친환경 옥수수 유래 장판"
  },
  {
    lineup: "지아사랑애",
    brand: "LX",
    category: "장판",
    aliases: ["지아사랑애", "사랑애"],
    dbKeywords: ["지아사랑애", "사랑애"],
    description: "LX 2.7T / 3.2T 쿠션 장판"
  },
  {
    lineup: "지아소리잠",
    brand: "LX",
    category: "장판",
    aliases: ["지아소리잠", "소리잠"],
    dbKeywords: ["지아소리잠", "소리잠"],
    description: "LX 4.5T 차음/소음저감 고급 장판"
  },
  {
    lineup: "엑스컴포트",
    brand: "LX",
    category: "장판",
    aliases: ["엑스컴포트", "x-comfort", "xcomfort"],
    dbKeywords: ["엑스컴포트", "XCF"],
    description: "LX 5.0T 최고급 마스터 매트 장판"
  },

  // [LX 데코타일]
  {
    lineup: "보타닉",
    brand: "LX",
    category: "데코타일",
    aliases: ["보타닉", "botanic", "보타닉 3T"],
    dbKeywords: ["보타닉", "DBT"],
    description: "LX 친환경 주거/상업 데코타일"
  },
  {
    lineup: "에코노",
    brand: "LX",
    category: "데코타일",
    aliases: ["에코노", "econo", "에코노플러스"],
    dbKeywords: ["에코노"],
    description: "LX 표준 규격 데코타일"
  },

  // [KCC 데코타일]
  {
    lineup: "센스타일",
    brand: "KCC",
    category: "데코타일",
    aliases: ["센스타일", "senstyle", "kcc 센스타일", "케이씨씨 센스타일"],
    dbKeywords: ["센스타일", "KCC_square", "KCC_wood", "TS", "TW", "GW", "GS"],
    description: "KCC 프리미엄 LVT 바닥재"
  },
  {
    lineup: "센스타일 프로",
    brand: "KCC",
    category: "데코타일",
    aliases: ["센스타일 프로", "센스타일프로", "프로", "senstyle pro", "kcc 프로"],
    dbKeywords: ["센스타일 프로", "KCC_pro", "300", "301", "302", "303", "304", "305", "GW", "GS"],
    description: "KCC 상업용 고내마모 데코타일"
  },
  {
    lineup: "센스타일 트랜디",
    brand: "KCC",
    category: "데코타일",
    aliases: ["센스타일 트랜디", "센스타일 트렌디", "센스타일트랜디", "트랜디", "트렌디", "senstyle trendy"],
    dbKeywords: ["트랜디", "트렌디", "TS", "TW"],
    description: "KCC 주거/상업 감각적 패턴 데코타일"
  },
  {
    lineup: "센스레이",
    brand: "KCC",
    category: "데코타일",
    aliases: ["센스레이", "센스레이(내수)", "senseray", "sense ray", "kcc 센스레이"],
    dbKeywords: ["센스레이", "B0", "B3", "B5"],
    description: "KCC 5.0T 내수 상업용 클릭 LVT"
  },

  // [KCC 장판]
  {
    lineup: "숲 그린",
    brand: "KCC",
    category: "장판",
    aliases: ["그린", "숲 그린", "숲그린", "kcc 그린"],
    dbKeywords: ["그린", "NP18", "NK20"],
    description: "KCC 1.8T 실속형 모노륨 장판"
  },
  {
    lineup: "숲 옥",
    brand: "KCC",
    category: "장판",
    aliases: ["숲 옥", "숲옥", "옥"],
    dbKeywords: ["숲 옥", "숲옥", "MN22"],
    description: "KCC 2.2T 편안한 주거용 장판"
  },
  {
    lineup: "숲 도담",
    brand: "KCC",
    category: "장판",
    aliases: ["도담", "숲 도담", "숲도담"],
    dbKeywords: ["도담", "NJ27", "NR32"],
    description: "KCC 2.7T / 3.2T 쿠션 장판"
  },
  {
    lineup: "숲 휴가온",
    brand: "KCC",
    category: "장판",
    aliases: ["휴가온", "숲 휴가온"],
    dbKeywords: ["휴가온", "NC45", "NV50"],
    description: "KCC 4.5T / 5.0T 고쿠션 층간소음 저감 장판"
  },

  // [동신 데코타일]
  {
    lineup: "아트타일",
    brand: "동신",
    category: "데코타일",
    aliases: ["아트타일", "art tile", "arttile", "동신 아트타일"],
    dbKeywords: ["아트타일"],
    description: "동신포리마 대표 상업용 데코타일"
  },
  {
    lineup: "아트하우스",
    brand: "동신",
    category: "데코타일",
    aliases: ["아트하우스", "art house", "arthouse", "동신 아트하우스"],
    dbKeywords: ["아트하우스"],
    description: "동신포리마 주거용 데코타일"
  },
  {
    lineup: "아트에코차음",
    brand: "동신",
    category: "데코타일",
    aliases: ["아트에코차음", "차음타일", "동신 차음타일", "아트에코"],
    dbKeywords: ["아트에코차음", "차음"],
    description: "동신포리마 5.0T 소음저감 데코타일"
  },

  // [현대 바닥재]
  {
    lineup: "참다움",
    brand: "현대",
    category: "장판",
    aliases: ["참다움", "현대 참다움"],
    dbKeywords: ["참다움"],
    description: "현대L&C 1.8T 실속형 장판"
  },
  {
    lineup: "아티움",
    brand: "현대",
    category: "장판",
    aliases: ["아티움", "현대 아티움"],
    dbKeywords: ["아티움"],
    description: "현대L&C 2.2T 트렌디 장판"
  },
  {
    lineup: "명가",
    brand: "현대",
    category: "장판",
    aliases: ["명가", "현대 명가"],
    dbKeywords: ["명가"],
    description: "현대L&C 2.2T 주거용 바닥재"
  },
  {
    lineup: "골드타일",
    brand: "현대",
    category: "데코타일",
    aliases: ["골드타일", "골드타일레릭", "골드타일마스터", "골드타일클래식"],
    dbKeywords: ["골드타일"],
    description: "현대L&C 고품질 상업용 데코타일"
  },

  // [동화 마루]
  {
    lineup: "듀오텍스쳐",
    brand: "동화",
    category: "마루",
    aliases: ["듀오텍스쳐", "듀오 텍스쳐", "듀오텍스쳐맥스", "duo texture"],
    dbKeywords: ["듀오텍스쳐", "DUO TEXTURE"],
    description: "동화자연마루 듀오 텍스쳐 강마루"
  },
  {
    lineup: "진테라",
    brand: "동화",
    category: "마루",
    aliases: ["진테라", "진 테라", "나투스진 테라"],
    dbKeywords: ["진테라", "진 테라"],
    description: "동화자연마루 대형 광폭 강마루"
  },
  {
    lineup: "진오리진",
    brand: "동화",
    category: "마루",
    aliases: ["진오리진", "진 오리진", "나투스진 오리진"],
    dbKeywords: ["진오리진"],
    description: "동화자연마루 원목 질감 광폭마루"
  },
  {
    lineup: "나투스진",
    brand: "동화",
    category: "마루",
    aliases: ["나투스진", "나투스 진", "그란데", "클릭그란데"],
    dbKeywords: ["나투스진", "그란데"],
    description: "동화자연마루 섬유판 강마루"
  },

  // [이건 마루]
  {
    lineup: "세라",
    brand: "이건마루",
    category: "마루",
    aliases: ["세라", "세라 플렉스", "세라 베이직", "세라 블렌딩", "세라플렉스"],
    dbKeywords: ["세라"],
    description: "이건마루 친환경 고강도 강마루"
  },
  {
    lineup: "라르고 솔레",
    brand: "이건마루",
    category: "마루",
    aliases: ["라르고", "라르고 솔레", "라르고솔레"],
    dbKeywords: ["라르고 솔레", "라르고"],
    description: "이건마루 최고급 광폭 원목마루"
  },
  {
    lineup: "그린 스퀘어",
    brand: "이건마루",
    category: "마루",
    aliases: ["그린스퀘어", "그린 스퀘어"],
    dbKeywords: ["그린 스퀘어", "그린스퀘어"],
    description: "이건마루 대형 정사각 타일마루"
  },

  // [구정 마루]
  {
    lineup: "마뷸러스",
    brand: "구정",
    category: "마루",
    aliases: ["마뷸러스", "마뷸러스 젠", "마블러스"],
    dbKeywords: ["마뷸러스"],
    description: "구정마루 대리석 스톤 질감 강마루"
  },
  {
    lineup: "블론테",
    brand: "구정",
    category: "마루",
    aliases: ["블론테"],
    dbKeywords: ["블론테"],
    description: "구정마루 초광폭 강마루"
  },
  {
    lineup: "노블레스",
    brand: "구정",
    category: "마루",
    aliases: ["노블레스"],
    dbKeywords: ["노블레스"],
    description: "구정마루 프리미엄 원목마루"
  },

  // [개나리 벽지]
  {
    lineup: "로하스",
    brand: "개나리",
    category: "벽지",
    aliases: ["로하스", "lohas"],
    dbKeywords: ["로하스", "LOHAS"],
    description: "개나리벽지 친환경 실크벽지"
  },
  {
    lineup: "아트북",
    brand: "개나리",
    category: "벽지",
    aliases: ["아트북", "artbook"],
    dbKeywords: ["아트북", "ARTBOOK"],
    description: "개나리벽지 모던 실크벽지"
  },
  {
    lineup: "스토리",
    brand: "개나리",
    category: "벽지",
    aliases: ["스토리", "story"],
    dbKeywords: ["스토리", "STORY"],
    description: "개나리벽지 합지벽지"
  },

  // [신한 벽지]
  {
    lineup: "아이리스",
    brand: "신한",
    category: "벽지",
    aliases: ["아이리스", "iris"],
    dbKeywords: ["아이리스", "IRIS"],
    description: "신한벽지 소폭/장폭 합지벽지"
  },
  {
    lineup: "리빙",
    brand: "신한",
    category: "벽지",
    aliases: ["리빙", "living"],
    dbKeywords: ["리빙", "LIVING"],
    description: "신한벽지 프리미엄 실크벽지"
  },
  {
    lineup: "스케치",
    brand: "신한",
    category: "벽지",
    aliases: ["스케치", "sketch"],
    dbKeywords: ["스케치", "SKETCH"],
    description: "신한벽지 디자인 실크벽지"
  }
];

// 3. 인기 추천 검색어
export const POPULAR_KEYWORDS = [
  "디아망",
  "베스띠",
  "센스타일",
  "데코타일",
  "장판"
];

// 4. 텍스트 정규화 유틸
export function normalizeSearchText(text) {
  if (!text) return "";
  return String(text)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\-_()[\]/·,]/g, "");
}

// 5. 상품 코드 정규화 (영문+숫자만 추출)
export function normalizeProductCode(code) {
  if (!code) return "";
  return String(code)
    .normalize("NFKC")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

// 6. 검색어 토큰화
export function tokenizeQuery(query) {
  if (!query) return [];
  const q = String(query).normalize("NFKC").toLowerCase().trim();
  // 공백 및 특수문자로 분리
  const rawTokens = q.split(/[\s\-_()[\]/·,]+/).filter(Boolean);
  return Array.from(new Set(rawTokens));
}

// 7. 검색어 분석 엔진 (Parser)
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

  // A. 브랜드 감지 (직접 입력된 경우)
  for (const [key, brandInfo] of Object.entries(BRAND_DICTIONARY)) {
    for (const alias of brandInfo.aliases) {
      const aliasNorm = normalizeSearchText(alias);
      if (tokens.some(t => normalizeSearchText(t) === aliasNorm) || norm.includes(aliasNorm)) {
        explicitBrand = brandInfo.canonical;
        detectedBrand = brandInfo.canonical;
        break;
      }
    }
    if (explicitBrand) break;
  }

  // B. 카테고리 감지 (직접 입력된 경우)
  const categoryKeywords = {
    "데코타일": ["데코타일", "데코", "lvt", "바닥타일", "타일바닥재"],
    "장판": ["장판", "모노륨", "륨", "시트바닥재", "륨바닥재"],
    "마루": ["마루", "강마루", "원목마루", "천연마루", "강화마루"],
    "벽지": ["벽지", "실크벽지", "합지벽지", "방염벽지", "도배지"],
    "카페트타일": ["카페트타일", "카페트", "카펫", "카펫타일", "타일카페트"]
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

  // D. 규격 / 두께 감지
  // 1.8T, 2.0T, 2.2T, 2.7T, 3.2T, 4.5T, 5.0T 등
  const thicknessMatch = raw.match(/(1\.8|2\.0|2|2\.2|2\.7|3\.2|4\.5|5\.0|5)\s*(?:T|t|mm|㎜)?/i);
  if (thicknessMatch && (raw.includes('T') || raw.includes('t') || raw.includes('장판') || detectedCategory === '장판')) {
    const val = parseFloat(thicknessMatch[1]).toFixed(1) + 'T';
    detectedThickness = val;
  }

  // 450각, 600각, 600x600 등
  if (/450각|450|457/i.test(raw)) {
    detectedSpec = "450각";
  } else if (/600각|600|600x600|600×600/i.test(raw)) {
    detectedSpec = "600각";
  }

  // E. 상품 번호 쿼리 여부 (순수 영문/숫자/하이픈 쿼리이거나, 개별 토큰 중 3자리 이상 코드 토큰이 있는 경우)
  const isPureCode = /^[A-Z0-9\-_./]+$/i.test(raw.trim()) && /[0-9]/.test(codeNorm) && codeNorm.length >= 2;
  const isCodeQuery = isPureCode || (tokens.some(t => /^[A-Z0-9\-_]{3,}$/i.test(t) && /[0-9]/.test(t)));

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
    detectedSpec,
    detectedThickness,
    isCodeQuery
  };
}

// 8. 관련도(Relevance) 랭킹 점수 계산
export function scoreProduct(product, query, parsedInfo = null) {
  if (!product || !query) return 0;
  const p = parsedInfo || parseSearchQuery(query);
  const qNorm = p.norm;
  const qCode = p.codeNorm;

  if (!qNorm) return 0;

  let score = 0;

  // 1. 상품코드 완전 일치 (최우선순위: 10,000점)
  const codeRaw = String(product.code || product.product_code || "").trim();
  const pCode = normalizeProductCode(codeRaw);

  if (pCode && qCode && p.isCodeQuery) {
    if (pCode === qCode) {
      score += 10000;
    } else if (pCode.startsWith(qCode)) {
      score += 4500;
    } else if (pCode.includes(qCode)) {
      score += 2500;
    }
  }

  // 2. 상품명 일치
  const pName = normalizeSearchText(product.name || product.product_name || "");
  const pTitle = normalizeSearchText(product.displayTitle || "");

  if (pName === qNorm || pTitle === qNorm) {
    score += 8000;
  } else if (pName.startsWith(qNorm) || pTitle.startsWith(qNorm)) {
    score += 4000;
  } else if (pName.includes(qNorm) || pTitle.includes(qNorm)) {
    score += 3000;
  }

  // 3. 라인업 일치
  const pLine = normalizeSearchText(product.line || product.series || product.collection || product.description || "");
  let matchesLineup = false;
  if (p.detectedLineup) {
    const targetLine = normalizeSearchText(p.detectedLineup.lineup);
    const targetKeywords = p.detectedLineup.dbKeywords.map(k => normalizeSearchText(k));

    if (pLine.includes(targetLine) || targetKeywords.some(k => pLine.includes(k))) {
      matchesLineup = true;
      score += 6000;
      // 브랜드까지 일치하면 가산점
      const pBrand = normalizeSearchText(product.brand || "");
      const targetBrand = normalizeSearchText(p.detectedLineup.brand);
      if (pBrand === targetBrand || (BRAND_DICTIONARY[targetBrand] && BRAND_DICTIONARY[targetBrand].aliases.includes(pBrand))) {
        score += 2000;
      }
    }
  }

  // 특정 라인업 검색 시, 라인업에 일치하지도 않고 상품명/코드에도 검색어가 포함되지 않은 무관한 제품은 배제
  if (p.detectedLineup && !matchesLineup) {
    const hasNameOrCodeMatch = (pCode && qCode && p.isCodeQuery && pCode.includes(qCode)) ||
      (pName && pName.includes(qNorm)) ||
      (pTitle && pTitle.includes(qNorm));
    if (!hasNameOrCodeMatch) {
      return 0;
    }
  }

  // 4. 브랜드 일치 (사용자가 직접 입력했거나, 라인업 검색이 아닌 일반 검색인 경우)
  if (p.explicitBrand || (!p.detectedLineup && p.detectedBrand)) {
    const pBrand = normalizeSearchText(product.brand || "");
    const targetBrand = p.explicitBrand || p.detectedBrand;
    const bInfo = BRAND_DICTIONARY[targetBrand];
    if (bInfo && (pBrand === normalizeSearchText(bInfo.canonical) || bInfo.aliases.includes(pBrand))) {
      score += 1500;
    }
  }

  // 5. 카테고리 일치
  if (p.explicitCategory || (!p.detectedLineup && p.detectedCategory)) {
    const targetCat = p.explicitCategory || p.detectedCategory;
    if (product.category === targetCat) {
      score += 800;
    }
  }

  // 6. 규격 및 두께 일치
  if (p.detectedThickness) {
    const pThick = (product.thickness || "").replace(/[^0-9.]/g, "");
    const qThick = p.detectedThickness.replace(/[^0-9.]/g, "");
    const specThick = String(product.specs?.thickness || "").replace(/[^0-9.]/g, "");
    const descThick = (product.description || "").replace(/[^0-9.]/g, "");
    if ((pThick && pThick === qThick) || (specThick && specThick === qThick) || (descThick && descThick.includes(qThick))) {
      score += 2500;
    }
  }

  if (p.detectedSpec) {
    const pSpec = normalizeSearchText(product.size_text || product.specs?.size || product.shape || "");
    if (p.detectedSpec === "450각" && (pSpec.includes("450") || pSpec.includes("457"))) {
      score += 1500;
    } else if (p.detectedSpec === "600각" && pSpec.includes("600")) {
      score += 1500;
    }
  }

  // 7. 개별 토큰 부분 매칭
  for (const token of p.tokens) {
    const tNorm = normalizeSearchText(token);
    if (!tNorm || tNorm.length < 2) continue;
    // 코드 매칭은 토큰이 영문/숫자/하이픈 형태일 때만 (한글 단어에 숫자 붙은 텍스트는 제외)
    const isCodeToken = /^[a-zA-Z0-9\-_]+$/.test(token) && /[0-9]/.test(token);
    if (isCodeToken && pCode.includes(normalizeProductCode(token))) {
      score += 500;
    }
    if (pName.includes(tNorm)) score += 400;
    if (pLine.includes(tNorm)) score += 400;
  }

  // 8. 무관한 임의의 텍스트 필터링
  if (!p.detectedLineup && !p.detectedBrand && !p.detectedCategory && !p.detectedSpec && !p.detectedThickness && !p.isCodeQuery) {
    const exactSub = pName.includes(qNorm) || pLine.includes(qNorm) || (pCode && qCode && pCode.includes(qCode));
    if (!exactSub) {
      return 0;
    }
  }

  return score;
}

// 9. 자동완성 및 추천 검색어 생성기
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

  // 1. 라인업 매칭 추천
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
      // 카테고리 연계 추천
      addSuggestion({
        type: "category",
        badge: "카테고리",
        title: `${item.lineup} ${item.category}`,
        subtitle: `${item.category} 카테고리 자재 검색`,
        query: item.lineup,
        category: item.category
      });
    }
  }

  // 2. 브랜드 매칭 추천
  for (const [key, brandInfo] of Object.entries(BRAND_DICTIONARY)) {
    const matchesBrand = brandInfo.aliases.some(a => {
      const aNorm = normalizeSearchText(a);
      return aNorm.startsWith(qNorm) || aNorm.includes(qNorm);
    });

    if (matchesBrand) {
      addSuggestion({
        type: "brand",
        badge: "브랜드",
        title: `${brandInfo.canonical} (${brandInfo.displayName})`,
        subtitle: `${brandInfo.categories.join(", ")} 취급`,
        query: brandInfo.canonical,
        brand: brandInfo.canonical
      });
    }
  }

  // 3. 규격 / 두께 추천
  if (/^4|45|450/.test(qNorm)) {
    addSuggestion({
      type: "spec",
      badge: "규격",
      title: "450각 데코타일",
      subtitle: "457.2 × 457.2mm 규격 데코타일 모아보기",
      query: "450각",
      category: "데코타일"
    });
  }
  if (/^6|60|600/.test(qNorm)) {
    addSuggestion({
      type: "spec",
      badge: "규격",
      title: "600각 데코타일",
      subtitle: "600 × 600mm 대형 규격 데코타일 모아보기",
      query: "600각",
      category: "데코타일"
    });
  }
  if (/^1|1\.8|18/.test(qNorm)) {
    addSuggestion({
      type: "spec",
      badge: "두께",
      title: "1.8T 장판",
      subtitle: "1.8T 실속형 주거용 모노륨 장판",
      query: "1.8T",
      category: "장판"
    });
  }

  // 4. 번호 검색 시 연계 추천 (예: 8195, 30082)
  if (parsed.isCodeQuery && parsed.codeNorm.length >= 3) {
    if (parsed.codeNorm.startsWith("8195")) {
      addSuggestion({
        type: "product",
        badge: "제품번호",
        title: "8195-01 (테라피)",
        subtitle: "LX 실크벽지 테라피 8195-01",
        query: "8195-01",
        code: "8195-01"
      });
      addSuggestion({
        type: "product",
        badge: "제품번호",
        title: "8195-01 (베스띠)",
        subtitle: "LX 실크벽지 베스띠 8195-01",
        query: "8195-01",
        code: "8195-01"
      });
    } else if (parsed.codeNorm.startsWith("30082")) {
      addSuggestion({
        type: "product",
        badge: "제품번호",
        title: "30082P (그란데 테라조)",
        subtitle: "KCC 센스타일 프로 450각 데코타일",
        query: "30082P",
        code: "30082P"
      });
    } else {
      addSuggestion({
        type: "product",
        badge: "제품코드",
        title: `${parsed.codeNorm} 제품번호 검색`,
        subtitle: "정확한 제품코드 및 일치하는 자재 조회",
        query: parsed.codeNorm,
        code: parsed.codeNorm
      });
    }
  }

  return suggestions.slice(0, 8);
}
