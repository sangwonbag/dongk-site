const SPACE_TYPE_RULES = [
  { pattern: /단독주택/, label: '주택' },
  { pattern: /아파트/, label: '아파트' },
  { pattern: /오피스텔/, label: '오피스텔' },
  { pattern: /빌라/, label: '빌라' },
  { pattern: /주택|가정집/, label: '주택' },
  { pattern: /헬스장|피트니스/, label: '헬스장' },
  { pattern: /사무실|오피스/, label: '사무실' },
  { pattern: /상가/, label: '상가' },
  { pattern: /학원/, label: '학원' },
  { pattern: /대학교|대학/, label: '대학교' },
  { pattern: /강당/, label: '강당' },
  { pattern: /고등학교|중학교|초등학교|학교/, label: '학교' },
  { pattern: /교회/, label: '교회' },
  { pattern: /공장/, label: '공장' },
  { pattern: /약국/, label: '약국' },
  { pattern: /병원|의료재단|의원|클리닉/, label: '병원' },
  { pattern: /식당|음식점|카페/, label: '식당' },
  { pattern: /원상복구/, label: '원상복구' },
  { pattern: /빌딩|타워|테크노파크|센터/, label: '빌딩' }
];

function extractSpaceType(caseItem) {
  const title = String(caseItem?.title || '');
  for (const rule of SPACE_TYPE_RULES) {
    if (rule.pattern.test(title)) {
      return rule.label;
    }
  }
  const cat = String(caseItem?.category || '');
  if (cat === '주거공간') return '주택';
  if (cat === '사무공간') return '사무실';
  if (cat === '상업공간') return '상가';
  if (cat === '교육·체육시설') return '교육시설';
  return '';
}

function extractProductCodes(caseItem) {
  // Remove brand tokens (KCC, LX) and dimensions (3.0T, 300×300mm) before code extraction
  const stripDimsAndBrands = (str) =>
    String(str || '')
      .replace(/\b\d+(?:\.\d+)?\s*[×xX*]\s*\d+(?:\.\d+)?\s*(?:mm|cm|m)?\b/gi, ' ')
      .replace(/\b\d+(?:\.\d+)?\s*(?:T|mm|cm|m|각|평)\b/gi, ' ')
      .replace(/\b(?:KCC글라스|KCC|LX하우시스|LX)\b/gi, ' ');

  const title = stripDimsAndBrands(caseItem?.title);

  // Match multi-code groups separated by middle dot/comma/slash (e.g., 6711·6740, 8220·773·5301, 5531·5543·5544)
  const multiMatch = title.match(/\b([A-Z]{1,4}\s*-?\s*)?\d{3,5}[A-Z]?(?:\s*[·,/+]\s*(?:[A-Z]{1,4}\s*-?\s*)?\d{3,5}[A-Z]?)+\b/i);
  if (multiMatch) {
    return multiMatch[0].replace(/\s*([·,/+])\s*/g, '·').replace(/\s+/g, ' ').trim();
  }

  // Single alphanumeric code (e.g., BS 303, TS5534M)
  const singleAlphaNum = title.match(/\b([A-Z]{2,4}[-\s]?\d{3,5}[A-Z]?)\b/i);
  if (singleAlphaNum) {
    return singleAlphaNum[1].trim();
  }

  // Single numeric code (e.g., 5534, 726, 23692, 0069)
  const singleNumeric = title.match(/\b(\d{3,5}[A-Z]?)\b/);
  if (singleNumeric) {
    return singleNumeric[1].trim();
  }

  // Fallback to joined product_code or material_summary if title had no code
  if (caseItem?.products?.product_code) {
    return String(caseItem.products.product_code).trim();
  }
  const summary = stripDimsAndBrands(caseItem?.material_summary);
  const sumMatch = summary.match(/\b([A-Z]{1,4}[-\s]?\d{3,5}[A-Z]?|\d{3,5}[A-Z]?)\b/i);
  if (sumMatch && !/^202\d$/.test(sumMatch[1])) {
    return sumMatch[1].trim();
  }

  return '';
}

/**
 * Public case titles show only the space type and product codes.
 * Original database titles and material details remain intact.
 */
export function formatCaseTitle(caseItem) {
  if (!caseItem) return '';
  const item = typeof caseItem === 'string' ? { title: caseItem } : caseItem;
  const spaceType = extractSpaceType(item);
  const codes = extractProductCodes(item);
  return [spaceType, codes].filter(Boolean).join(' / ') || '시공사례';
}

/**
 * Formats a construction case item into the slash-delimited Home card format:
 * [현장 유형] / [브랜드] / [제품번호] / [데코타일 또는 장판] 시공
 * e.g. "학원 / KCC / 5537 / 데코타일 시공"
 */
export function formatCaseSlashTitle(caseItem) {
  if (!caseItem) return '';
  if (typeof caseItem === 'string') return caseItem;

  const spaceType = extractSpaceType(caseItem);
  const brand = extractBrand(caseItem);
  const codes = extractProductCodes(caseItem, brand);
  const materialType = extractMaterialType(caseItem, brand, codes);

  const parts = [spaceType, brand, codes, materialType].filter(Boolean);
  if (parts.length === 0) {
    const raw = String(caseItem.title || '').trim();
    return raw.endsWith('시공') ? raw : `${raw} 시공`.trim();
  }
  return `${parts.join(' / ')} 시공`;
}
