import { LX_CATALOG_80_PRODUCTS, LX_LINEUP_CONFIGS } from '../data/lx2025CatalogData.js';

/**
 * 제품코드 정규화 (공백, 하이픈 제거 및 대문자 변환)
 * 예: "ZOT 0761" -> "ZOT0761", "ptt-6950" -> "PTT6950"
 */
export function normalizeLxCode(raw) {
  if (!raw) return '';
  return String(raw).replace(/[\s\-_]/g, '').toUpperCase();
}

/**
 * 아이템 정보(code, product_code, name, slug)를 기반으로 80종 LX 카탈로그 제품 정보를 조회
 */
export function getLxCatalogProduct(item) {
  if (!item) return null;

  const codeCandidates = [
    item.product_code,
    item.code,
    item.name,
    item.slug
  ].filter(Boolean);

  for (const candidate of codeCandidates) {
    const normalized = normalizeLxCode(candidate);

    // 1. Direct match on normalized keys
    for (const [key, data] of Object.entries(LX_CATALOG_80_PRODUCTS)) {
      if (normalized === key) {
        return data;
      }
    }

    // 2. Contains match (e.g., candidate is "LX 하우스스타일 ZOT 0761 (3.0T)" -> contains ZOT0761)
    for (const [key, data] of Object.entries(LX_CATALOG_80_PRODUCTS)) {
      if (normalized.includes(key)) {
        return data;
      }
    }
  }

  // 3. Match against regex patterns for PTT, PTW, ZOT, ZOW, DBT, DBW, EDT
  const str = `${item.product_code || ''} ${item.code || ''} ${item.name || ''} ${item.slug || ''}`;
  const match = str.match(/\b(PTT\d{4}|PTW\d{4}|ZOT\s*\d{4}|ZOW\s*\d{4}|DBT\d{4}|DBW\d{4}|EDT\d{4})\b/i);
  if (match) {
    const key = normalizeLxCode(match[1]);
    if (LX_CATALOG_80_PRODUCTS[key]) {
      return LX_CATALOG_80_PRODUCTS[key];
    }
  }

  return null;
}

/**
 * 80개 LX 카탈로그 제품인지 판별
 */
export function isLxCatalogProduct(item) {
  return Boolean(getLxCatalogProduct(item));
}

/**
 * 라인업별 구성 설정 반환
 */
export function getLxLineupConfig(lineupKey) {
  return LX_LINEUP_CONFIGS[lineupKey] || null;
}

/**
 * MaterialDetail에서 제품 정보를 표준 카탈로그 정보로 보강(enrich)
 */
export function enrichLxProduct(item) {
  const catalogInfo = getLxCatalogProduct(item);
  if (!catalogInfo) return item;

  const lineupConfig = LX_LINEUP_CONFIGS[catalogInfo.lineup];

  return {
    ...item,
    brand: 'LX하우시스',
    category: '데코타일',
    line: catalogInfo.lineupName,
    shape: catalogInfo.shape,
    thickness: catalogInfo.thickness,
    specs: {
      ...(item.specs || {}),
      thickness: catalogInfo.thickness,
      size: catalogInfo.size,
      packing: `${catalogInfo.pcsPerBox}장 / BOX`,
      pcs_per_box: catalogInfo.pcsPerBox,
      area: catalogInfo.areaPerBox,
      box_pyeong: catalogInfo.pyeongPerBox
    },
    pattern: item.pattern || catalogInfo.pattern,
    lxCatalogInfo: catalogInfo,
    lxLineupConfig: lineupConfig
  };
}
