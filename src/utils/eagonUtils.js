/**
 * 이건마루 2026 카탈로그(EAGON FLOORING GUIDE ver.26) 전용 유틸리티 및 분류 시스템
 */

export const EAGON_MAJOR_CATEGORIES = ["전체", "원목마루", "천연마루", "강마루"];

export const EAGON_LINEUP_GROUPS = [
  "라르고 솔레",
  "포레스타",
  "그린",
  "그린 스퀘어",
  "세라 플렉스 S",
  "세라 블렌딩",
  "세라",
  "세라 베이직"
];

export const EAGON_LINEUPS_BY_MAJOR = {
  "전체": ["전체", ...EAGON_LINEUP_GROUPS],
  "원목마루": ["전체", "라르고 솔레"],
  "천연마루": ["전체", "포레스타"],
  "강마루": ["전체", "그린", "그린 스퀘어", "세라 플렉스 S", "세라 블렌딩", "세라", "세라 베이직"]
};

export const EAGON_SPECS_BY_LINEUP = {
  "그린": ["all", "230", "190", "165", "125"],
  "그린 스퀘어": ["all", "597", "395"],
  "세라 플렉스 S": ["all", "395", "165"],
  "라르고 솔레": ["all", "240 T4", "190 T3", "190 T1"],
  "포레스타": ["all", "포레스타 G", "포레스타"],
  "세라 블렌딩": ["all"],
  "세라": ["all"],
  "세라 베이직": ["all"]
};

export const EAGON_SPEC_LABEL_MAP = {
  "230": "그린 230 (폭 230×2430mm)",
  "190": "그린 190 (폭 190×1615mm)",
  "165": "그린 165 (폭 165×1200mm)",
  "125": "그린 125 (폭 125×800mm)",
  "597": "597각 (정사각형 597×597mm)",
  "395": "395각 (직사각형 395×800mm)",
  "240 T4": "240 T4 (14T / 원목층 4mm)",
  "190 T3": "190 T3 (14T / 원목층 3mm)",
  "190 T1": "190 T1 (12T / 원목층 1.2mm)",
  "포레스타 G": "포레스타 G (11T / 190×1900mm)",
  "포레스타": "포레스타 (10.5T / 165×1200mm)"
};

export function isEagonProduct(item) {
  if (!item) return false;
  const brand = (item.brand || item.computedBrand || "").trim().toUpperCase();
  const name = (item.name || item.product_name || item.productName || item.title || "").trim();
  const desc = (item.description || "").trim();
  return brand === "이건" || brand === "이건마루" || name.startsWith("이건마루") || desc.includes("이건마루");
}

export function getEagonLineupGroup(p) {
  if (!p) return "";
  const text = `${p.lineup_group || ""} ${p.collection || ""} ${p.line || ""} ${p.name || ""} ${p.product_name || ""} ${p.productName || ""}`.replace(/\s+/g, " ");
  if (text.includes("라르고")) return "라르고 솔레";
  if (text.includes("포레스타")) return "포레스타";
  if (text.includes("그린 스퀘어") || text.includes("그린스퀘어")) return "그린 스퀘어";
  if (text.includes("그린")) return "그린";
  if (text.includes("세라 플렉스") || text.includes("세라플렉스")) return "세라 플렉스 S";
  if (text.includes("세라 블렌딩") || text.includes("세라블렌딩") || text.includes("세라블랜딩")) return "세라 블렌딩";
  if (text.includes("세라 베이직") || text.includes("세라베이직")) return "세라 베이직";
  if (text.includes("세라")) return "세라";
  return "이건마루";
}

export function getEagonSpecKey(p) {
  if (!p) return "";
  const group = getEagonLineupGroup(p);
  const text = `${p.spec_name || ""} ${p.line || ""} ${p.name || ""} ${p.product_name || ""} ${p.size_text || ""} ${p.spec || ""}`.replace(/\s+/g, " ");
  
  if (group === "그린") {
    if (text.includes("230")) return "230";
    if (text.includes("190")) return "190";
    if (text.includes("165")) return "165";
    if (text.includes("125")) return "125";
  }
  if (group === "그린 스퀘어") {
    if (text.includes("597")) return "597";
    if (text.includes("395")) return "395";
  }
  if (group === "세라 플렉스 S") {
    if (text.includes("395") || text.includes("스톤")) return "395";
    if (text.includes("165") || text.includes("우드")) return "165";
  }
  if (group === "라르고 솔레") {
    if (text.includes("240") || text.includes("T4") || text.includes("t4")) return "240 T4";
    if (text.includes("T3") || text.includes("t3")) return "190 T3";
    if (text.includes("T1") || text.includes("t1")) return "190 T1";
  }
  if (group === "포레스타") {
    if (text.includes("포레스타 G") || text.includes("포레스타G") || text.includes("190") || text.includes("G")) return "포레스타 G";
    return "포레스타";
  }
  if (group === "세라 블렌딩") return "115";
  if (group === "세라") return "95";
  if (group === "세라 베이직") return "115";
  return "기본";
}

export function getEagonMaterialType(p) {
  const group = getEagonLineupGroup(p);
  if (group === "라르고 솔레") return "원목마루";
  if (group === "포레스타") return "천연마루";
  return "강마루";
}

export function getEagonColorName(p) {
  if (!p) return "";
  if (p.color_name) return p.color_name.trim();
  const rawName = p.name || p.product_name || p.productName || "";
  // Strip "이건마루", lineup, specs from rawName
  let c = rawName
    .replace(/^이건마루\s*/, "")
    .replace(/^라르고\s*솔레\s*(240\s*T4|190\s*T3|190\s*T1)?\s*/, "")
    .replace(/^포레스타\s*G?\s*/, "")
    .replace(/^그린\s*스퀘어\s*(597|395)?\s*/, "")
    .replace(/^그린\s*(230|190|165|125)?\s*/, "")
    .replace(/^세라\s*플렉스\s*S\s*(395|165)?\s*/, "")
    .replace(/^세라\s*블렌딩\s*/, "")
    .replace(/^세라\s*베이직\s*/, "")
    .replace(/^세라\s*/, "")
    .trim();
  return c || rawName;
}

/**
 * 동일 라인업 내에서 현재 색상에 제공되는 다른 규격 형제 상품 목록을 반환합니다.
 */
export function getEagonSiblingProducts(currentProduct, allProducts = []) {
  if (!isEagonProduct(currentProduct) || !allProducts || allProducts.length === 0) {
    return [];
  }

  const currentGroup = getEagonLineupGroup(currentProduct);
  const currentColor = getEagonColorName(currentProduct).replace(/\s+/g, "");
  const currentSpec = getEagonSpecKey(currentProduct);
  const possibleSpecs = (EAGON_SPECS_BY_LINEUP[currentGroup] || []).filter(s => s !== "all");

  if (possibleSpecs.length <= 1) {
    return [];
  }

  // Find all products in same group that match this color
  const matchedProducts = allProducts.filter(p => {
    if (!isEagonProduct(p)) return false;
    if (getEagonLineupGroup(p) !== currentGroup) return false;
    const pColor = getEagonColorName(p).replace(/\s+/g, "");
    return pColor === currentColor;
  });

  return possibleSpecs.map(specKey => {
    const foundProduct = matchedProducts.find(p => getEagonSpecKey(p) === specKey);
    let label = specKey;
    if (currentGroup === "그린") label = `${specKey}폭`;
    else if (currentGroup === "그린 스퀘어") label = specKey === "597" ? "597 (정사각)" : "395 (직사각)";
    else if (currentGroup === "세라 플렉스 S") label = specKey === "395" ? "395 (스톤)" : "165 (우드)";

    return {
      specKey,
      label,
      fullLabel: EAGON_SPEC_LABEL_MAP[specKey] || specKey,
      isCurrent: specKey === currentSpec,
      isAvailable: !!foundProduct,
      product: foundProduct || null
    };
  });
}
