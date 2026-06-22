const SYNONYMS = {
  // Brands
  "lg": "lx",
  "엘지": "lx",
  "엘엑스": "lx",
  "lx": "lx",
  "kcc": "kcc",
  "케이씨씨": "kcc",
  "현대": "현대",
  "hyundai": "현대",
  "동신": "동신",
  "dongshin": "동신",
  "유성": "유성",
  "yousung": "유성",
  "재영": "재영",
  "jaeyoung": "재영",
  "이건": "이건",
  "eagon": "이건",
  "lx하우시스": "LX하우시스",
  "lxhauzys": "LX하우시스",
  "녹수": "녹수",
  "noksu": "녹수",
  "대진": "대진",
  "daejin": "대진",
  "동화": "동화",
  "dongwha": "동화",
  "구정": "구정",
  "kujung": "구정",
  "신한벽지": "신한",
  "신한": "신한",
  "개나리": "개나리",
  "디디": "디아이디",
  "did": "디아이디",
  "디아이디": "디아이디",
  "스완": "스완",
  "swan": "스완",
  "코오롱": "코오롱",
  "kolon": "코오롱",
  
  // Categories/Types
  "디럭스": "디럭스타일",
  "데코": "데코타일",
  "데코타일": "데코타일",
  "바닥타일": "데코타일",
  "장판": "장판",
  "모노륨": "장판",
  "륨": "장판",
  "실크": "실크벽지",
  "합지": "합지벽지",
  "방염": "방염벽지",
  "카페트": "카페트타일",
  "카펫": "카페트타일",
  "타일카페트": "카페트타일",

  // Sizes/Patterns
  "450": "450각",
  "450각": "450각",
  "450square": "450각",
  "600": "600각",
  "600각": "600각",
  "600square": "600각",
  "우드": "우드",
  "wood": "우드",
  "나무": "우드",
  "마블": "마블",
  "marble": "마블",
  "대리석": "마블",
  "스톤": "스톤",
  "stone": "스톤",
  "콘크리트": "콘크리트",
  "concrete": "콘크리트"
};

const SYNONYM_KEYS = Object.keys(SYNONYMS).sort((a, b) => b.length - a.length);

export function normalizeSearchText(text) {
  if (!text) return "";
  let t = text.toLowerCase();
  t = t.replace(/[\s\-_()]/g, "");
  return t;
}

export function normalizeProductCode(code) {
  if (!code) return "";
  let pre = code.toLowerCase();
  pre = pre.replace(/[_(]\d+[)]?$/, '');
  return normalizeSearchText(pre);
}

// Tokenize query by spacing out known synonyms and then splitting
export function tokenizeSearchQuery(query) {
  if (!query) return [];
  
  let q = query.toLowerCase();
  
  // Insert spaces around known synonyms to break glued words (e.g. "현대디럭스" -> " 현대  디럭스 ")
  for (const key of SYNONYM_KEYS) {
    q = q.split(key).join(` ${key} `);
  }
  
  // Split by any whitespace or delimiter
  const tokens = q.split(/[\s\-_()]+/).filter(Boolean);
  
  // Deduplicate
  return Array.from(new Set(tokens));
}

// Expand a list of raw tokens into their canonical forms
export function expandSynonyms(tokens) {
  return tokens.map(token => {
    const norm = normalizeSearchText(token);
    return SYNONYMS[norm] || norm;
  });
}

// Builds a single massive normalized string containing all product attributes
export function buildProductSearchText(product) {
  if (!product) return "";
  
  const sizeOptionFields = [];
  if (product.sizeOptions && Array.isArray(product.sizeOptions)) {
    product.sizeOptions.forEach(opt => {
      if (opt.label) sizeOptionFields.push(opt.label);
      if (opt.spec) sizeOptionFields.push(opt.spec);
      if (opt.thickness) sizeOptionFields.push(opt.thickness);
      if (opt.width) sizeOptionFields.push(opt.width);
      if (opt.length) sizeOptionFields.push(opt.length);
    });
  }
  
  const fields = [
    product.code,
    product.name,
    product.brand,
    product.category,
    product.subCategory,
    product.collection,
    product.series,
    product.type,
    product.pattern,
    product.specs?.size || product.sizeLabel,
    product.specs?.thickness || product.thickness,
    ...(product.tags || []),
    ...(product.keywords || []),
    product.description,
    ...sizeOptionFields
  ];

  return normalizeSearchText(fields.filter(Boolean).join(" "));
}

export function getSearchScore(product, rawQuery) {
  if (!product || !rawQuery) return 0;

  const rawTokens = tokenizeSearchQuery(rawQuery);
  const tokens = expandSynonyms(rawTokens);
  
  if (tokens.length === 0) return 0;

  const brand = normalizeSearchText(product.brand || "");
  const category = normalizeSearchText(product.category || "");
  const code = normalizeProductCode(product.code || "");
  const name = normalizeSearchText(product.name || "");
  const fullText = buildProductSearchText(product);
  
  // 브랜드명, 카테고리명, 상품번호, 상품명 중 하나라도 포함하는 토큰이 있는지 체크
  let matchCount = 0;
  let coreMatch = false;

  for (const token of tokens) {
    const isBrand = brand.includes(token) || (SYNONYMS[brand] && SYNONYMS[brand] === token);
    const isCategory = category.includes(token) || (SYNONYMS[category] && SYNONYMS[category] === token);
    const isCode = code.includes(token);
    const isName = name.includes(token);

    if (isBrand || isCategory || isCode || isName || fullText.includes(token)) {
      matchCount++;
      if (isBrand || isCategory || isCode || isName) {
        coreMatch = true;
      }
    }
  }

  // 1개 이상의 매치가 있고, 코어 매치(브랜드, 카테고리, 코드, 상품명 중 하나)가 발생했다면 노출 대상으로 삼음
  // (또는 모든 토큰이 fullText에 포함될 때도 매칭 대상으로 삼음)
  if (matchCount === 0 || (!coreMatch && matchCount < tokens.length)) {
    return 0;
  }

  let score = 100 * matchCount; // Base score proportional to matchCount

  // Exact / Partial Product Code Matches
  const productCode = normalizeProductCode(product.code || "");
  const rawQueryNorm = normalizeSearchText(rawQuery);
  const rawCodeQuery = normalizeProductCode(rawQuery);

  if (productCode && (productCode === rawCodeQuery || productCode === rawQueryNorm)) {
    score += 1000;
  } else if (productCode && (productCode.includes(rawCodeQuery) || rawCodeQuery.includes(productCode))) {
    score += 700;
  }

  // Evaluate specific fields for exact bonuses
  const series = normalizeSearchText(product.series || product.collection || "");
  const size = normalizeSearchText(product.specs?.size || product.sizeLabel || "");
  const pattern = normalizeSearchText(product.pattern || "");

  for (const token of tokens) {
    if (brand === token || SYNONYMS[brand] === token) score += 300;
    if (category === token || SYNONYMS[category] === token) score += 250;
    if (series === token || SYNONYMS[series] === token) score += 220;
    if (size === token || SYNONYMS[size] === token || size.includes(token)) score += 200;
    if (pattern === token || SYNONYMS[pattern] === token) score += 200;
    if (name === token || name.includes(token)) score += 150;

    let sizeOptionMatch = false;
    if (product.sizeOptions && Array.isArray(product.sizeOptions)) {
      for (const opt of product.sizeOptions) {
        const optLabel = normalizeSearchText(opt.label || "");
        const optSpec = normalizeSearchText(opt.spec || "");
        if (optLabel === token || optSpec === token || optSpec.includes(token)) {
          sizeOptionMatch = true;
          break;
        }
      }
    }
    if (sizeOptionMatch) score += 200;
  }

  return score;
}

export const RECOMMENDATIONS = [
  { trigger: "k", text: "KCC 데코타일", query: "KCC 데코타일", type: "brand" },
  { trigger: "l", text: "LX 데코타일", query: "LX 데코타일", type: "brand" },
  { trigger: "현", text: "현대 디럭스", query: "현대 디럭스", type: "brand" },
  { trigger: "현대", text: "현대 디럭스", query: "현대 디럭스", type: "brand" },
  { trigger: "동", text: "동신 데코타일", query: "동신 데코타일", type: "brand" },
  { trigger: "동신", text: "동신 데코타일", query: "동신 데코타일", type: "brand" },
  { trigger: "4", text: "450각", query: "450각", type: "size" },
  { trigger: "45", text: "450각", query: "450각", type: "size" },
  { trigger: "6", text: "600각", query: "600각", type: "size" },
  { trigger: "우", text: "우드 데코타일", query: "우드 데코타일", type: "pattern" },
  { trigger: "우드", text: "우드 데코타일", query: "우드 데코타일", type: "pattern" },
];

const BRAND_DEFAULT_CATEGORY = {
  "대진": "데코타일",
  "동신": "데코타일",
  "녹수": "데코타일",
  "재영": "데코타일",
  "현대": "데코타일",
  "kcc": "데코타일",
  "lx": "데코타일",
  "동화": "마루",
  "구정": "마루",
  "이건": "마루",
  "개나리": "벽지",
  "서울": "벽지",
  "제일": "벽지",
  "디아이디": "벽지",
  "신한": "벽지",
  "스완": "카페트타일",
  "아반": "카페트타일",
  "코오롱": "카페트타일",
  "lx하우시스": "장판"
};

const CATEGORIES = ["데코타일", "장판", "마루", "벽지", "카페트타일", "러버타일"];

export function getBrandCategoryMap() {
  return BRAND_DEFAULT_CATEGORY;
}

export function detectCategory(tokens) {
  const expanded = expandSynonyms(tokens);
  for (const token of expanded) {
    if (CATEGORIES.includes(token)) return token;
  }
  return null;
}

export function detectBrand(tokens) {
  const expanded = expandSynonyms(tokens);
  const brandKeys = Object.keys(BRAND_DEFAULT_CATEGORY);
  for (const token of expanded) {
    if (brandKeys.includes(token)) return token;
  }
  return null;
}

export function handleSearchRedirect(query, navFunction) {
  if (!query) return false;
  
  const rawTokens = tokenizeSearchQuery(query);
  const brand = detectBrand(rawTokens);
  
  if (brand) {
    const category = detectCategory(rawTokens) || BRAND_DEFAULT_CATEGORY[brand];
    const expandedTokens = expandSynonyms(rawTokens);
    
    const remainingRawTokens = rawTokens.filter((raw, i) => {
      const exp = expandedTokens[i];
      if (exp === brand || exp === category) return false;
      if (raw === brand || raw === category) return false;
      return true;
    });
    
    const searchPart = remainingRawTokens.join(" ").trim();
    
    let url = `/materials?category=${encodeURIComponent(category)}`;
    const formatBrand = (b) => {
      if (b === 'lx') return 'LX';
      if (b === 'kcc') return 'KCC';
      return b;
    };
    
    url += `&brand=${encodeURIComponent(formatBrand(brand))}`;
    
    if (searchPart) {
      url += `&search=${encodeURIComponent(searchPart)}`;
    }
    
    navFunction(url);
    return true;
  }
  
  navFunction(`/materials?search=${encodeURIComponent(query.trim())}`);
  return false;
}
