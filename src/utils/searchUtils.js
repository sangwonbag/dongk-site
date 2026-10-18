import {
  parseSearchQuery,
  scoreProduct,
  normalizeSearchText as engineNormalizeText,
  normalizeProductCode as engineNormalizeCode,
  tokenizeQuery,
  generateAutocompleteSuggestions,
  BRAND_DICTIONARY,
  LINEUP_DATABASE,
  POPULAR_KEYWORDS
} from "./materialSearchEngine.js";

export {
  parseSearchQuery,
  scoreProduct,
  generateAutocompleteSuggestions,
  BRAND_DICTIONARY,
  LINEUP_DATABASE,
  POPULAR_KEYWORDS
};

export const normalizeSearchText = engineNormalizeText;
export const normalizeProductCode = engineNormalizeCode;
export const tokenizeSearchQuery = tokenizeQuery;

export const SYNONYMS = {
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
  "이건": "이건마루",
  "이건마루": "이건마루",
  "eagon": "이건마루",
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
  "어반": "어반",
  "urban": "어반",
  "녹수": "녹수",
  "대진": "대진",

  // Lineups
  "디아망": "디아망",
  "베스띠": "베스띠",
  "베스트": "베스띠",
  "테라피": "테라피",
  "휘앙세": "휘앙세",
  "센스타일": "센스타일",
  "센스레이": "센스레이",

  // Categories
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

  // Sizes
  "450": "450각",
  "450각": "450각",
  "600": "600각",
  "600각": "600각",
  "우드": "우드",
  "wood": "우드"
};

export function isProductNumberQuery(query) {
  const q = String(query || '').normalize('NFKC').trim();
  if (['230', '190', '165', '125', '597', '395', '240', '115', '95', '450', '600'].includes(q)) {
    return false;
  }
  return /^[0-9\s_-]+$/.test(q);
}

export function getProductNumberScore(product, query) {
  return scoreProduct(product, query);
}

export function getSearchScore(product, rawQuery) {
  return scoreProduct(product, rawQuery);
}

export const RECOMMENDATIONS = generateAutocompleteSuggestions;

export function handleSearchRedirect(query, navFunction) {
  if (!query) return false;
  const parsed = parseSearchQuery(query);
  const params = new URLSearchParams();

  if (parsed.detectedCategory) {
    params.set("category", parsed.detectedCategory);
  }
  if (parsed.detectedBrand) {
    params.set("brand", parsed.detectedBrand);
  }
  if (parsed.detectedThickness) {
    params.set("thickness", parsed.detectedThickness);
  }

  params.set("q", query.trim());
  navFunction(`/materials?${params.toString()}`);
  return true;
}
