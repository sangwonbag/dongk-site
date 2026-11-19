import { matchMaterialFromText } from './caseMaterialUtils.js';

const SPACE_TYPE_RULES = [
  { pattern: /단독주택/, label: '단독주택' },
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

const BRAND_RULES = [
  { pattern: /\bKCC\b|KCC글라스/i, label: 'KCC' },
  { pattern: /LX하우시스|\bLX\b/i, label: 'LX' },
  { pattern: /동신포리마|동신우드|동신/, label: '동신' },
  { pattern: /대진/, label: '대진' },
  { pattern: /현대/, label: '현대' },
  { pattern: /녹수/, label: '녹수' },
  { pattern: /재영/, label: '재영' },
  { pattern: /유성|우성/, label: '유성' },
  { pattern: /동화/, label: '동화' },
  { pattern: /이건/, label: '이건' },
  { pattern: /구정/, label: '구정' },
  { pattern: /한솔/, label: '한솔' },
  { pattern: /스완/, label: '스완' }
];

const JANGPAN_HINT_RE = /장판|뉴청맥|지아자연애|지아사랑애|지아소리잠|엑스컴포트|은행목|숲\s?옥|도담|휴가온|참다움|더채움|아티움|륨/;
const MARU_HINT_RE = /강마루|천연마루|원목마루|강화마루|온돌마루|마루/;
const WALLPAPER_HINT_RE = /벽지|디아망|실크벽지|합지벽지/;
const CARPET_HINT_RE = /카페트타일|카펫타일/;
const DECOTILE_HINT_RE = /데코타일|아트타일|아트하우스|아트에코|디럭스타일|센스타일|프레스티지|하우스스타일|에코노플러스|보타닉|칩\s?세라믹|메탈\s?콘크리트|에디톤|센스레이|\b(TS|TW|DS|AS|AH|AB|PTT|HOT|ZOT|NPT|NOW|FSM|DT|BS)\s*-?\d{3,5}/i;

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

function extractBrand(caseItem) {
  const combined = `${caseItem?.material_summary || ''} ${caseItem?.title || ''}`;
  for (const rule of BRAND_RULES) {
    if (rule.pattern.test(combined)) {
      return rule.label;
    }
  }
  return '';
}

function extractProductCodes(caseItem, brand) {
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

  void brand;
  return '';
}

function extractMaterialType(caseItem, brand, codes) {
  const combined = `${caseItem?.title || ''} ${caseItem?.material_summary || ''} ${caseItem?.description || ''}`;
  if (/점자블럭|유도타일/.test(combined)) return '점자블럭';
  if (CARPET_HINT_RE.test(combined)) return '카페트타일';
  if (WALLPAPER_HINT_RE.test(combined)) return '벽지';
  if (JANGPAN_HINT_RE.test(combined)) return '장판';
  if (MARU_HINT_RE.test(combined)) return '마루';
  if (DECOTILE_HINT_RE.test(combined)) return '데코타일';

  // Lookup via materials DB matcher for any newly registered cases
  const matched = matchMaterialFromText(`${brand} ${codes} ${caseItem?.material_summary || ''}`);
  if (matched?.category) {
    return matched.category;
  }

  // Default for known decotile brands with numeric codes when summary says "바닥재"
  if (brand && codes) {
    return '데코타일';
  }
  return '';
}

/**
 * Formats any construction case item into the unified display title:
 * [현장 유형] [브랜드] [제품번호] [데코타일/장판/마루/벽지] 시공
 * Preserves original DB title untouched.
 */
export function formatCaseTitle(caseItem) {
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
  return `${parts.join(' ')} 시공`;
}
