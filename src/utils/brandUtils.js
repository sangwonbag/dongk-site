/**
 * 브랜드 및 두께 관련 유틸리티
 */

/**
 * 텍스트에서 두께 패턴(x.xT)을 추출합니다.
 * @param {string} text - 제목 또는 이름
 * @returns {string|null} - 추출된 두께 (예: "1.8T")
 */
export const JANGPAN_STANDARD_THICKNESSES = ["1.8T", "2.0T", "2.2T", "2.7T", "3.2T", "4.5T", "5.0T"];

export const FLOORING_THICKNESS_BY_BRAND = {
  all: ['1.8T', '2.0T', '2.2T', '2.7T', '3.2T', '4.5T', '5.0T'],
  LX: ['1.8T', '2.0T', '2.2T', '2.7T', '3.2T', '4.5T', '5.0T'],
  현대: ['1.8T', '2.0T', '2.2T', '2.7T', '3.2T', '5.0T'],
  KCC: ['1.8T', '2.0T', '2.2T', '2.7T', '3.2T', '4.5T', '5.0T'],
};

export const normalizeBrandName = (brandStr) => {
  if (!brandStr) return "기타";
  const b = String(brandStr).trim();
  const upper = b.toUpperCase();
  if (upper === "LX" || upper.includes("LX") || upper.includes("LG") || b.includes("엘지") || b.includes("엘엑스")) {
    return "LX";
  }
  if (b.includes("현대") || upper.includes("HYUNDAI")) {
    return "현대";
  }
  if (b.includes("KCC") || upper.includes("KCC")) {
    return "KCC";
  }
  return b;
};

export const getThicknessToken = (text) => {
    if (!text) return null;
    const match = text.match(/(?<![\d.])(1\.8|2\.0|2|2\.2|2\.7|3\.2|4\.5|5\.0|5)\s*T/i);
    if (!match) return null;
    const val = parseFloat(match[1]);
    return `${val.toFixed(1)}T`;
};

/**
 * 카테고리가 "장판"인 경우 "LX" + "두께" 형태의 브랜드명을 반환합니다.
 * @param {Object} item - 자재 또는 샘플북 객체
 * @returns {string} - 계산된 브랜드명
 */
export const getComputedBrand = (item) => {
    if (!item) return "기타";

    const originalBrand = (item.brand || "기타").trim();

    if (item.category === "장판") {
        // 장판인 경우 이름(title)이나 기존 thickness 필드에서 두께 추출
        const textToSearch = item.title || item.name || "";
        const thickness = getThicknessToken(textToSearch) || item.thickness || "";

        if (thickness) {
            const cleanThickness = thickness.replace(/[()]/g, ""); // 괄호 제거
            if (originalBrand.includes("현대") || originalBrand.includes("Hyundai")) {
                return `현대 ${cleanThickness}`;
            }
            if (originalBrand.includes("KCC")) {
                return `KCC ${cleanThickness}`;
            }
            return `LX ${cleanThickness}`;
        }
    }

    return originalBrand;
};

/**
 * 마루 카테고리 자재의 세부 분류(materialType)와 표시 라인(displayLine)을 표준화합니다.
 */
export function getMaterialTypeAndLine(m) {
  if (!m) return { materialType: "강마루", displayLine: "" };
  
  let materialType = m.subCategory || m.materialType || "";
  let displayLine = m.line || "";

  if (m.brand === "이건") {
    if (m.series) materialType = m.series;
  }

  // Parse based on underscores (e.g. 강마루_구정강)
  if (displayLine && displayLine.includes('_')) {
    const parts = displayLine.split('_').map(p => p.trim());
    if (["강마루", "원목마루", "천연마루", "타일마루", "강화마루"].includes(parts[0])) {
      materialType = parts[0];
      
      if (parts.length > 1) {
        let linePart = parts.slice(1).join(' ');
        
        // Clean/normalize displayLine based on requested rules
        const cleanLower = linePart.toLowerCase().replace(/\s+/g, '');
        if (cleanLower === '듀오텍스쳐duotexture') {
          displayLine = '듀오텍스쳐';
        } else if (cleanLower === '듀오텍스쳐duotexturemax') {
          displayLine = '듀오텍스쳐맥스';
        } else if (cleanLower === '클릭스톤') {
          displayLine = '클릭스톤';
        } else if (cleanLower === '클릭그란데') {
          displayLine = '클릭그란데';
        } else if (cleanLower === '클릭') {
          displayLine = '클릭';
        } else if (cleanLower === '그란데') {
          displayLine = '그란데';
        } else if (cleanLower === '진오리진') {
          displayLine = '진오리진';
        } else if (cleanLower === '진테라') {
          displayLine = '진테라';
        } else {
          // Remove English suffix and clean up
          displayLine = linePart.replace(/_[a-zA-Z\s]+$/g, '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
        }
      }
    }
  }

  // Additional custom normalization for Dongwha lines
  if (m.brand === "동화") {
    const cleanLower = displayLine.toLowerCase().replace(/\s+/g, '');
    if (cleanLower === '듀오스퀘어') {
      displayLine = '듀오스퀘어';
    } else if (cleanLower === '듀오텍스쳐맥스') {
      displayLine = '듀오텍스쳐맥스';
    } else if (cleanLower === '듀오텍스쳐') {
      displayLine = '듀오텍스쳐';
    } else if (cleanLower === '듀오오리진') {
      displayLine = '듀오오리진';
    }
  }

  if (!materialType && m.category === "마루") {
    materialType = "강마루";
  }

  displayLine = displayLine.replace(/_/g, ' ').trim();

  return { materialType, displayLine };
}

/**
 * 장판 카테고리 자재의 두께를 추출하고 표준 포맷(예: 1.8T, 2.0T, 2.2T, 2.7T, 3.2T, 4.5T, 5.0T)으로 규격화합니다.
 * @param {Object} item - 자재 객체
 * @returns {string} - 규격화된 두께 (예: "2.2T", "2.0T", "두께 정보 없음")
 */
export const getNormalizedThickness = (item) => {
  if (!item || item.category !== "장판") return "두께 정보 없음";

  const tField = String(item.thickness || item.specs?.thickness || "").trim();
  const sField = String(item.spec || item.specs?.size || item.size_text || "").trim();
  const nameField = String(item.name || item.productName || "").trim();
  const codeField = String(item.code || item.product_code || "").trim();
  const lineField = String(item.line || item.description || "").trim();

  // 1. Direct check on thickness field if available
  if (tField) {
    const tClean = tField.replace(/\s+/g, "").toUpperCase();
    if (/^1\.8(T|MM)?$/i.test(tClean)) return "1.8T";
    if (/^(2|2\.0)(T|MM)?$/i.test(tClean)) return "2.0T";
    if (/^2\.2(T|MM)?$/i.test(tClean)) return "2.2T";
    if (/^2\.7(T|MM)?$/i.test(tClean)) return "2.7T";
    if (/^3\.2(T|MM)?$/i.test(tClean)) return "3.2T";
    if (/^4\.5(T|MM)?$/i.test(tClean)) return "4.5T";
    if (/^(5|5\.0)(T|MM)?$/i.test(tClean)) return "5.0T";
  }

  // Combine fields for pattern extraction
  const textToSearch = [tField, sField, lineField, nameField, codeField].filter(Boolean).join(" ");

  // Pattern A: explicitly prefixed or suffixed with T, mm, ㎜ or 두께
  const patterns = [
    { regex: /(?<![\d.])1\.8\s*(?:T|t|mm|㎜|\(T\)|두께)/i, result: "1.8T" },
    { regex: /(?<![\d.])(?:2\.0|2)\s*(?:T|t|mm|㎜|\(T\)|두께)(?![\d.])/i, result: "2.0T" },
    { regex: /(?<![\d.])2\.2\s*(?:T|t|mm|㎜|\(T\)|두께)/i, result: "2.2T" },
    { regex: /(?<![\d.])2\.7\s*(?:T|t|mm|㎜|\(T\)|두께)/i, result: "2.7T" },
    { regex: /(?<![\d.])3\.2\s*(?:T|t|mm|㎜|\(T\)|두께)/i, result: "3.2T" },
    { regex: /(?<![\d.])4\.5\s*(?:T|t|mm|㎜|\(T\)|두께)/i, result: "4.5T" },
    { regex: /(?<![\d.])(?:5\.0|5)\s*(?:T|t|mm|㎜|\(T\)|두께)(?![\d.])/i, result: "5.0T" },
  ];

  for (const { regex, result } of patterns) {
    if (regex.test(textToSearch)) {
      return result;
    }
  }

  // Pattern B: "두께 1.8", "두께: 2.0", "두께 2"
  const prefixMatch = textToSearch.match(/두께\s*[:\-_]?\s*(1\.8|2\.0|2|2\.2|2\.7|3\.2|4\.5|5\.0|5)(?![\d.])/i);
  if (prefixMatch) {
    const val = prefixMatch[1];
    if (val === "1.8") return "1.8T";
    if (val === "2" || val === "2.0") return "2.0T";
    if (val === "2.2") return "2.2T";
    if (val === "2.7") return "2.7T";
    if (val === "3.2") return "3.2T";
    if (val === "4.5") return "4.5T";
    if (val === "5" || val === "5.0") return "5.0T";
  }

  // Pattern C: standalone numbers in size text or division name
  const genericMatch = textToSearch.match(/(?<![\d.])(1\.8|2\.0|2\.2|2\.7|3\.2|4\.5|5\.0)(?![\d.])/);
  if (genericMatch) {
    const val = genericMatch[1];
    return `${parseFloat(val).toFixed(1)}T`;
  }

  return "두께 정보 없음";
};

/**
 * 영어/영문기호 형태 및 패턴 명칭(square, .wood 등)을 한국어 직관적 명칭(450각, 우드 등)으로 표준화합니다.
 */
export function formatShapeOrPattern(value) {
  if (value === null || value === undefined) return "";
  if (typeof value !== "string" && typeof value !== "number") return "";
  const val = String(value).trim();
  if (!val) return "";
  const lower = val.toLowerCase().replace(/^\./, '');
  
  if (lower === "square" || lower === "450square" || lower === "450" || lower === "kcc_square") {
    return "450각";
  }
  if (lower === "600square" || lower === "600") {
    return "600각";
  }
  if (lower === "wood" || lower === "kcc_wood") {
    return "우드";
  }
  if (lower === "tile" || lower === "wood_tile") {
    return "타일";
  }
  if (lower === "marble") {
    return "마블";
  }
  if (lower === "stone") {
    return "스톤";
  }
  if (lower === "concrete") {
    return "콘크리트";
  }
  if (lower === "carpet" || lower === "carpet_tile") {
    return "카펫";
  }
  
  if (val.startsWith('.')) {
    return val.substring(1);
  }
  
  return val;
}

import { isDecoTile, getRecommendedAdhesive } from "./decotileUtils.js";

export function normalizeProductDetails(item) {
  if (!item) return item;
  try {
    if (isDecoTile(item)) {
      item.adhesive = "데코타일 본드";
      if (item.specs) {
        item.specs.adhesive = "데코타일 본드";
      }
    } else {
      item.adhesive = getRecommendedAdhesive(item);
    }

    if (item.category === "마루") {
      const { materialType, displayLine } = getMaterialTypeAndLine(item);
      item.materialType = materialType;
      item.displayLine = displayLine;
    }
    if (item.category === "장판") {
      item.thickness = getNormalizedThickness(item);
    }
    if (item.shape) {
      item.shape = formatShapeOrPattern(item.shape);
    }
    if (item.line && typeof item.line === 'string' && (item.line.startsWith('.') || item.line.toLowerCase() === 'square' || item.line.toLowerCase() === 'wood')) {
      item.line = formatShapeOrPattern(item.line);
    }
    if (item.pattern) {
      item.pattern = formatShapeOrPattern(item.pattern);
    }
  } catch (err) {
    console.error("normalizeProductDetails error:", err);
  }
  return item;
}

export function formatFlooringProductName(product) {
  if (!product) return "";
  const name = product.name || product.product_name || "";
  const category = product.category || "";
  if (category !== "장판") return name;

  const thickness = getNormalizedThickness(product);
  if (thickness === "두께 정보 없음") return name;

  const val = parseFloat(thickness);
  if (isNaN(val)) return name;

  const escapedVal = String(val).replace('.', '\\.');
  let patternStr;
  if (Number.isInteger(val)) {
    patternStr = `(?:${val}|${val}\\.0+)`;
  } else {
    patternStr = escapedVal;
  }
  
  const regex = new RegExp(`\\s*\\(?\\b${patternStr}\\s*(?:T|t|mm|㎜)\\)?`, 'gi');
  if (regex.test(name)) {
    return name.replace(regex, `(${thickness})`);
  }
  return `${name}(${thickness})`;
}

export const getProductUnit = (product) => {
  if (!product) return '평';
  if (product.category === '장판') return 'm';
  if (product.category === '데코타일') return 'BOX';
  if (product.category === '마루') return '평';
  if (product.category === '카페트타일') return '평';
  if (product.category === '부자재') return product.unit || '개';
  if (product.category === '벽지') {
    const brand = product.brand || "";
    const name = product.name || product.product_name || "";
    const line = product.line || "";
    const spec = product.spec || (product.specs && product.specs.size) || "";
    
    const lineClean = line.replace(/\s+/g, '');
    const nameClean = name.replace(/\s+/g, '');
    
    if (brand === '서울' && (lineClean.includes('소폭') || nameClean.includes('소폭') || spec.includes('53'))) {
      return 'BOX';
    }
    if (brand === '개나리' && (lineClean.includes('소폭') || nameClean.includes('소폭') || lineClean.includes('스토리'))) {
      return 'BOX';
    }
    if (brand === 'LX' && (lineClean.includes('소폭') || nameClean.includes('소폭') || spec.includes('53'))) {
      return 'BOX';
    }
    return '롤';
  }
  return product.unit || '평';
};


