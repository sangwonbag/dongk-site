const BRAND_ALIASES = {
  "lg": "lx",
  "엘지": "lx",
  "엘엑스": "lx",
  "케이씨씨": "kcc",
  "신한벽지": "신한",
  "디디": "디아이디",
  "did": "디아이디"
};

export function normalizeSearchText(text) {
  if (!text) return "";
  // 1. Convert to lowercase
  let t = text.toLowerCase();
  
  // 2. Remove spaces, hyphens, underscores, parentheses
  t = t.replace(/[\s\-_()]/g, "");
  
  // 3. Brand alias replacement
  for (const [alias, realBrand] of Object.entries(BRAND_ALIASES)) {
    if (t.includes(alias)) {
      t = t.replace(new RegExp(alias, 'g'), realBrand.toLowerCase());
    }
  }
  
  return t;
}

export function normalizeProductCode(code) {
  if (!code) return "";
  let pre = code.toLowerCase();
  
  // Match trailing _number or (number) or _text and remove it to clean up the base code
  // Example: AR-502_1 -> AR-502, FO3305_1 -> FO3305, ar 502 (1) -> ar 502
  pre = pre.replace(/[_(]\d+[)]?$/, '');
  
  return normalizeSearchText(pre);
}

export function getSearchScore(product, rawQuery) {
  if (!product || !rawQuery) return Infinity; // No match
  
  const query = normalizeSearchText(rawQuery);
  if (!query) return Infinity;

  const code = normalizeProductCode(product.code || "");
  const name = normalizeSearchText(product.name || "");
  const brand = normalizeSearchText(product.brand || "");
  const category = normalizeSearchText(product.category || "");
  const size = normalizeSearchText((product.specs?.size || product.sizeLabel || ""));
  const pattern = normalizeSearchText(product.pattern || "");
  const desc = normalizeSearchText(product.description || "");
  
  // 1. Exact Product Code
  if (code === query) return 10;
  
  // 2. Partial Product Code
  if (code.includes(query)) return 20;
  if (query.includes(code) && code.length > 2) return 25;
  
  // 3. Exact Brand Match
  if (brand === query) return 30;
  
  // 4. Exact Category Match
  if (category === query) return 40;
  
  // 5. Size / Pattern Exact Match
  if (size === query || pattern === query) return 50;
  
  // 6. Name Includes
  if (name.includes(query)) return 60;
  
  // 7. Brand / Category Includes
  if (brand.includes(query)) return 65;
  if (category.includes(query)) return 66;

  // 8. Size / Pattern Includes
  if (size.includes(query) || pattern.includes(query)) return 70;
  
  // 9. Tags / Keywords / Collection
  const tags = normalizeSearchText((product.tags || []).join("") + (product.keywords || []).join("") + (product.collection || ""));
  if (tags.includes(query)) return 80;
  
  // 10. Description Includes
  if (desc.includes(query)) return 90;
  
  return Infinity; // No match
}

export const RECOMMENDATIONS = [
  { trigger: "k", text: "KCC 데코타일", query: "KCC 데코타일", type: "brand" },
  { trigger: "k", text: "KCC 장판", query: "KCC 장판", type: "brand" },
  { trigger: "k", text: "KCC 벽지", query: "KCC 벽지", type: "brand" },
  { trigger: "kc", text: "KCC 데코타일", query: "KCC 데코타일", type: "brand" },
  { trigger: "kc", text: "KCC 장판", query: "KCC 장판", type: "brand" },
  { trigger: "kc", text: "KCC 벽지", query: "KCC 벽지", type: "brand" },
  { trigger: "l", text: "LX 데코타일", query: "LX 데코타일", type: "brand" },
  { trigger: "l", text: "LX 벽지", query: "LX 벽지", type: "brand" },
  { trigger: "lx", text: "LX 데코타일", query: "LX 데코타일", type: "brand" },
  { trigger: "lx", text: "LX 벽지", query: "LX 벽지", type: "brand" },
  { trigger: "w", text: "우드", query: "우드", type: "pattern" },
  { trigger: "wo", text: "wood", query: "wood", type: "pattern" },
  { trigger: "woo", text: "우드", query: "우드", type: "pattern" },
  { trigger: "woo", text: "wood", query: "wood", type: "pattern" },
  { trigger: "woo", text: "wood plank", query: "wood plank", type: "pattern" },
  { trigger: "4", text: "450각", query: "450각", type: "size" },
  { trigger: "45", text: "450각", query: "450각", type: "size" },
  { trigger: "45", text: "450 square", query: "450 square", type: "size" },
  { trigger: "45", text: "450 우드", query: "450 우드", type: "size" },
  { trigger: "450", text: "450각", query: "450각", type: "size" },
  { trigger: "6", text: "600각", query: "600각", type: "size" },
  { trigger: "60", text: "600각", query: "600각", type: "size" },
  { trigger: "600", text: "600각", query: "600각", type: "size" },
];
