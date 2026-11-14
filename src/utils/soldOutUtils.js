/**
 * Utility functions for checking and managing product sold-out (일시 품절) state.
 */

export function isKccDecotileWood(p) {
  if (!p) return false;
  const slug = (p.slug || '').toLowerCase();
  const brand = (p.brand || '').toUpperCase();
  const cat = (p.category || '').toUpperCase();
  const isKcc = brand.includes('KCC') || slug.includes('kcc');
  const isDecotile = cat.includes('데코타일') || slug.includes('데코타일');
  if (!isKcc || !isDecotile) return false;

  const code = (p.product_code || p.code || '').toUpperCase().trim();
  const size = (p.size_text || (p.specs?.size) || p.spec || '').replace(/\s+/g, '');

  if (slug.includes('kcc_wood') || code.startsWith('TW')) return true;
  if (size.includes('184x950') || size.includes('184×950') || size.includes('228.6×1524') || size.includes('228.6x1524') || size.includes('177.8×1219.2') || size.includes('177.8x1219.2')) return true;
  if (code.endsWith('G') || code.endsWith('F') || code.endsWith('B')) {
    if (!code.endsWith('P') && !code.endsWith('M') && !code.endsWith('J')) return true;
  }
  return false;
}

export function isProductSoldOut(item) {
  if (!item) return false;
  if (item.is_sold_out === true || item.isSoldOut === true) return true;
  if (item.is_sold_out === false || item.isSoldOut === false) return false;

  const desc = String(item.description || "");
  if (desc.includes('[일시품절]') || desc.includes('[품절]')) return true;
  if (Number(item.sort_order) >= 99900) return true;

  // Fallback: KCC decotile wood is temporarily sold out by default unless explicitly set to in-stock
  if (isKccDecotileWood(item)) {
    return true;
  }

  return false;
}

export function cleanProductDescription(desc) {
  if (!desc) return "";
  return String(desc).replace(/\[(일시품절|품절)\]/g, '').trim();
}

