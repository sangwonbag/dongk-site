/**
 * Construction-case-to-product matching.
 * Never infer a different manufacturer from a recycled number or dimensions.
 */
export const normalizeCaseBrand = (value) => {
  const v = String(value || '').toUpperCase();
  if (/KCC|케이씨씨/.test(v)) return 'KCC';
  if (/LX|LG|하우시스/.test(v)) return 'LX';
  if (/동신/.test(v)) return '동신';
  if (/재영/.test(v)) return '재영';
  if (/현대|HYUNDAI/.test(v)) return '현대';
  if (/녹수|NOX/.test(v)) return '녹수';
  if (/대진/.test(v)) return '대진';
  if (/우성/.test(v)) return '우성';
  if (/이건/.test(v)) return '이건';
  if (/동화/.test(v)) return '동화';
  if (/한솔/.test(v)) return '한솔';
  if (/유성/.test(v)) return '유성';
  if (/스완/.test(v)) return '스완';
  if (/구정/.test(v)) return '구정';
  if (/코오롱/.test(v)) return '코오롱';
  return '';
};

export const normalizeCaseCode = (value) =>
  String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

function describeCode(value) {
  const raw = String(value || '').toUpperCase();
  const digitMatch = raw.match(/[0-9]{3,6}/);
  if (!digitMatch) return null;
  const digits = digitMatch[0];
  const before = raw.slice(0, digitMatch.index).replace(/[^A-Z]/g, '');
  const after = raw.slice(digitMatch.index + digits.length);
  const suffix = (after.match(/^[A-Z]{1,2}(?![A-Z])/i) || [])[0] || '';
  return { digits, prefix: before, suffix: suffix.toUpperCase() };
}

function containsCodeNumber(text, digits) {
  if (!digits) return false;
  return new RegExp('(^|[^0-9])' + digits + '(?![0-9])').test(text);
}

function containsExactSku(text, code) {
  const c = describeCode(code);
  if (!c || !c.prefix) return false;
  const pattern = '(^|[^A-Z0-9])' + c.prefix +
    '[\\s._-]*' + c.digits + (c.suffix || '') + '(?![A-Z0-9])';
  return new RegExp(pattern, 'i').test(text);
}

function supportsKccTileVariant(text, variant) {
  const hasSmall = /450\s*각|457(?:\.[0-9]+)?\s*[×xX]\s*457|450\s*[×xX]\s*450/i.test(text);
  const hasLarge = /600\s*각|600\s*[×xX]\s*600/i.test(text);
  if (!hasSmall && !hasLarge) return null;
  if (variant === 'P') return hasSmall;
  if (variant === 'M') return hasLarge;
  return null;
}

/**
 * 'linked' = exact FK/slug, 'code' = exact SKU, 'number' = brand-qualified
 * code mentioned in case title/summary, null = no supported match.
 */
export function getConstructionCaseMatch(caseItem, material) {
  if (!caseItem || !material || caseItem.is_active === false || caseItem.is_published === false) {
    return null;
  }

  const linked = caseItem.products || {};
  const materialId = material.product_id ??
    (/^\d+$/.test(String(material.id || '')) ? material.id : null);

  if (materialId != null && caseItem.product_id != null &&
      String(materialId) === String(caseItem.product_id)) {
    return 'linked';
  }

  const slug = String(material.slug || material.id || '').trim().toLowerCase();
  if (linked.slug && slug && String(linked.slug).toLowerCase() === slug) {
    return 'linked';
  }

  const sku = material.code || material.product_code;
  const itemCode = describeCode(sku);
  if (!itemCode) return null;

  const linkedSku = linked.product_code || linked.code || '';
  if (linkedSku && normalizeCaseCode(linkedSku) === normalizeCaseCode(sku)) {
    return 'code';
  }

  const sourceText = [caseItem.title, caseItem.material_summary].filter(Boolean).join(' ');
  const brand = normalizeCaseBrand(material.brand || material.brands?.name);
  const caseBrand = normalizeCaseBrand(sourceText);
  if (!brand || !caseBrand || brand !== caseBrand) return null;

  if (containsExactSku(sourceText.toUpperCase(), sku)) return 'code';

  if (!containsCodeNumber(sourceText, itemCode.digits)) return null;

  const linkedCode = describeCode(linkedSku);
  if (linkedCode && linkedCode.prefix && itemCode.prefix &&
      linkedCode.prefix !== itemCode.prefix) {
    return null;
  }

  if (brand === 'KCC' && itemCode.prefix === 'TS' &&
      (itemCode.suffix === 'P' || itemCode.suffix === 'M')) {
    const permittedSize = supportsKccTileVariant(sourceText, itemCode.suffix);
    if (permittedSize === false) return null;
    if (permittedSize === null && linkedCode &&
        linkedCode.digits === itemCode.digits &&
        linkedCode.suffix && linkedCode.suffix !== itemCode.suffix) {
      return null;
    }
  }

  return 'number';
}

export const isCaseForMaterial = (caseItem, material) =>
  Boolean(getConstructionCaseMatch(caseItem, material));
