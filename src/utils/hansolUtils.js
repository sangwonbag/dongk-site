/**
 * 한솔홈데코 마루 68종 전용 분류 및 필터링 유틸리티
 * 
 * 1. SB스톤 컬렉션 (31종): 스퀘어800(9), 스퀘어600(4), 스톤600(4), 스톤395(14)
 * 2. SB강 (23종): 165(10), 143(5), 95(8)
 * 3. 울트라강 (14종): 95(10), 115(1), 128(2), 143(1)
 */

export const HANSOL_GROUPS = ["전체", "SB스톤 컬렉션", "SB강", "울트라강"];

export const HANSOL_SPECS_BY_GROUP = {
  "전체": ["all", "스퀘어800", "스퀘어600", "스톤600", "스톤395", "165", "143", "95", "115", "128"],
  "SB스톤 컬렉션": ["all", "스퀘어800", "스퀘어600", "스톤600", "스톤395"],
  "SB강": ["all", "165", "143", "95"],
  "울트라강": ["all", "95", "115", "128", "143"]
};

export const HANSOL_SPEC_LABEL_MAP = {
  "all": "전체 규격",
  "스퀘어800": "스퀘어800 (800×800)",
  "스퀘어600": "스퀘어600 (600×600)",
  "스톤600": "스톤600 (600×600)",
  "스톤395": "스톤395 (395×800)",
  "165": "165폭 (165×1205)",
  "143": "143폭 (143×1205)",
  "95": "95폭 (95×800)",
  "115": "115폭 (115×800)",
  "128": "128폭 (128×800)"
};

/**
 * 한솔 제품 여부 판별
 */
export function isHansolProduct(item) {
  if (!item) return false;
  const brand = (item.brand || item.computedBrand || "").trim();
  const name = (item.name || item.product_name || item.productName || item.title || "").trim();
  const desc = (item.description || "").trim();
  const slug = (item.slug || "").trim();
  const code = (item.code || item.product_code || "").trim();
  const img = (item.image || item.image_url || item.thumbnail || "").trim();

  if (brand === "한솔" || brand === "한솔홈데코" || brand.includes("한솔")) return true;
  if (slug.includes("maru-hansol") || slug.includes("hansol")) return true;
  if (img.includes("/한솔/")) return true;
  if (name.includes("한솔") || desc.includes("한솔홈데코") || desc.includes("한솔 SB")) return true;
  if (code.startsWith("FS") || code.startsWith("S8") || code.startsWith("S5")) return true;
  return false;
}

/**
 * 한솔 제품군(Group) 판별 (Tier 1)
 */
export function getHansolGroup(item) {
  if (!item) return "";
  if (item.group) return item.group;
  
  const text = `${item.line || ""} ${item.name || ""} ${item.description || ""} ${item.product_code || ""} ${item.slug || ""}`;
  if (text.includes("SB스톤") || text.includes("스톤") || text.includes("스퀘어") || text.includes("sbstone") || item.code?.startsWith("FS")) {
    return "SB스톤 컬렉션";
  }
  if (text.includes("울트라강") || text.includes("ultrastrong") || /S[58]\d{3}/.test(text)) {
    return "울트라강";
  }
  if (text.includes("SB강") || text.includes("SBStrong") || text.includes("sbstrong") || text.includes("에스비강")) {
    return "SB강";
  }
  return "SB스톤 컬렉션";
}

/**
 * 한솔 규격(Spec / SubLine) 판별 (Tier 2)
 */
export function getHansolSpec(item) {
  if (!item) return "";
  if (item.subLine && HANSOL_SPEC_LABEL_MAP[item.subLine]) return item.subLine;

  const text = `${item.subLine || ""} ${item.line || ""} ${item.name || ""} ${item.size_text || ""} ${item.spec || ""} ${item.specification || ""} ${item.product_code || ""} ${item.slug || ""}`;
  
  if (text.includes("800×800") || text.includes("800x800") || text.includes("스퀘어800") || text.includes("sq800")) return "스퀘어800";
  if (text.includes("스퀘어600") || text.includes("sq600")) return "스퀘어600";
  if (text.includes("스톤600") || text.includes("stone600")) return "스톤600";
  if (text.includes("395×800") || text.includes("395x800") || text.includes("스톤395") || text.includes("stone395")) return "스톤395";
  if (text.includes("165×1205") || text.includes("165x1205") || text.includes("165") || text.includes("sbstrong-165")) return "165";
  if (text.includes("143×1205") || text.includes("143x1205") || text.includes("143") || text.includes("sbstrong-143") || text.includes("ultrastrong-143")) return "143";
  if (text.includes("115×800") || text.includes("115x800") || text.includes("115") || text.includes("ultrastrong-115")) return "115";
  if (text.includes("128×800") || text.includes("128x800") || text.includes("128") || text.includes("ultrastrong-128")) return "128";
  if (text.includes("95×800") || text.includes("95x800") || text.includes("95") || text.includes("sbstrong-95") || text.includes("ultrastrong-95")) return "95";

  return "";
}

/**
 * 카탈로그 규격 정보 텍스트 포맷팅
 */
export function getHansolSpecificationInfo(item) {
  const spec = getHansolSpec(item);
  const group = getHansolGroup(item);

  switch (spec) {
    case "스퀘어800":
      return { size: "800×800×7.5T", packing: "1장 (0.64㎡)", thickness: "7.5T", type: "대형 정사각 스톤 강마루" };
    case "스퀘어600":
      return { size: "600×600×7.5T", packing: "1박스 (3.24㎡)", thickness: "7.5T", type: "정사각 스톤 강마루" };
    case "스톤600":
      return { size: "600×600×7.5T", packing: "1박스 (3.24㎡)", thickness: "7.5T", type: "정사각 스톤 강마루" };
    case "스톤395":
      return { size: "395×800×7.5T", packing: "1박스 (3.16㎡)", thickness: "7.5T", type: "직사각 스톤 강마루" };
    case "165":
      return { size: "165×1205×7.5T", packing: "1박스 (3.18㎡)", thickness: "7.5T", type: "광폭 우드 강마루" };
    case "143":
      return { size: "143×1205×7.5T", packing: "1박스 (3.10㎡)", thickness: "7.5T", type: "중광폭 우드 강마루" };
    case "95":
      return { size: "95×800×7.5T", packing: "1박스 (3.20㎡)", thickness: "7.5T", type: "표준 우드 강마루" };
    case "115":
      return { size: "115×800×7.5T", packing: "1박스 (3.31㎡)", thickness: "7.5T", type: "울트라강 와이드 마루" };
    case "128":
      return { size: "128×800×7.5T", packing: "1박스 (3.28㎡)", thickness: "7.5T", type: "울트라강 와이드 마루" };
    default:
      return { size: item.size_text || "7.5T", packing: item.unit || "1박스", thickness: "7.5T", type: "강마루" };
  }
}

