/**
 * Utility functions for price normalization, product name extraction, and product list sorting.
 */

/**
 * Safely converts price value to finite number or null.
 * Handles numbers, formatted strings ("24,000", "24,000원"), null, undefined, empty string.
 */
export const normalizePrice = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const str = String(value).replace(/[^0-9.-]/g, '');
  if (!str) return null;

  const number = Number(str);
  return Number.isFinite(number) ? number : null;
};

/**
 * Gets actual sale price for a product item.
 * Checks price, sale_price, selling_price, retail_price, or sizeOptions[0].price.
 */
export const getProductPrice = (item) => {
  if (!item) return null;

  if (item.sizeOptions && item.sizeOptions.length > 0 && item.sizeOptions[0]?.price) {
    const optPrice = normalizePrice(item.sizeOptions[0].price);
    if (optPrice !== null) return optPrice;
  }

  const mainPrice = normalizePrice(item.price);
  if (mainPrice !== null) return mainPrice;

  const salePrice = normalizePrice(item.sale_price || item.selling_price);
  if (salePrice !== null) return salePrice;

  return normalizePrice(item.retail_price);
};

/**
 * Gets product name string for comparison.
 * Checks name, product_name, productName, title, code.
 */
export const getProductName = (item) => {
  if (!item) return '';
  const name = item.name || item.product_name || item.productName || item.title || item.code || '';
  return String(name).trim();
};

export const SORT_OPTIONS = [
  { value: 'default', label: '기본순' },
  { value: 'price-asc', label: '가격 낮은순' },
  { value: 'price-desc', label: '가격 높은순' },
  { value: 'name-asc', label: '이름 가나다순' },
  { value: 'name-desc', label: '이름 가나다 역순' },
];

const DECOTILE_SUB_CODES = new Set([
  'SUB-BOND-10KG', 'SUB-BOND-4KG', 'SUB-BOND-2KG', 'SUB-PIG-BOND',
  'SUB-WAX-LARGE', 'SUB-WAX-SMALL', 'SUB-STRAIGHT-SEP', 'SUB-L-SEP',
  'SUB-THIN-SEP', 'SUB-NONSLIP-HEAVY', 'SUB-NONSLIP-LIGHT',
  'SUB-NONSLIP-LIGHT-WHITE', 'SUB-NONSLIP-LIGHT-GRAY', 'SUB-NONSLIP-LIGHT-DARKWOOD',
  'SUB-NONSLIP-HEAVY-LIGHTWOOD', 'SUB-NONSLIP-HEAVY-DARKWOOD', 'SUB-NONSLIP-HEAVY-GRAY'
]);

const JANGPAN_SUB_CODES = new Set([
  'SUB-RYUM-BOND', 'SUB-NOBON', 'SUB-NOBON-WHITE', 'SUB-NOBON-10'
]);

export function getSubmaterialGroupPriority(item) {
  if (!item || item.category !== '부자재') return 99;
  const code = String(item.code || item.product_code || '').toUpperCase().trim();
  const name = String(item.name || item.product_name || '').trim();

  if (
    DECOTILE_SUB_CODES.has(code) ||
    name.includes('데코타일') ||
    code.startsWith('SUB-BOND-') ||
    code === 'SUB-PIG-BOND' ||
    code.startsWith('SUB-WAX-') ||
    code.startsWith('SUB-NONSLIP-') ||
    (code.endsWith('-SEP') && code !== 'SUB-CARPET-SEP')
  ) {
    return 1;
  }

  if (
    JANGPAN_SUB_CODES.has(code) ||
    name.includes('륨본드') ||
    name.includes('노본')
  ) {
    return 2;
  }

  return 3;
}

/**
 * Sorts an array of products based on the sortOption without mutating the original array.
 * Supported options: 'default', 'price-asc', 'price-desc', 'name-asc', 'name-desc'
 */
export const sortProducts = (products, sortOption = 'default') => {
  if (!products || !Array.isArray(products) || products.length === 0) return [];

  const copied = [...products];

  if (!sortOption || sortOption === 'default') {
    if (copied.some(m => m && m.category === '부자재')) {
      return copied.sort((a, b) => {
        const prioA = getSubmaterialGroupPriority(a);
        const prioB = getSubmaterialGroupPriority(b);
        if (prioA !== prioB) return prioA - prioB;
        const sortA = a.sort_order ?? 999;
        const sortB = b.sort_order ?? 999;
        return sortA - sortB;
      });
    }
    return copied;
  }

  switch (sortOption) {
    case 'price-asc':
      return copied.sort((a, b) => {
        const priceA = getProductPrice(a);
        const priceB = getProductPrice(b);
        if (priceA === null && priceB === null) return 0;
        if (priceA === null) return 1;
        if (priceB === null) return -1;
        return priceA - priceB;
      });

    case 'price-desc':
      return copied.sort((a, b) => {
        const priceA = getProductPrice(a);
        const priceB = getProductPrice(b);
        if (priceA === null && priceB === null) return 0;
        if (priceA === null) return 1;
        if (priceB === null) return -1;
        return priceB - priceA;
      });

    case 'name-asc':
      return copied.sort((a, b) => {
        const nameA = getProductName(a);
        const nameB = getProductName(b);
        return nameA.localeCompare(nameB, 'ko', {
          numeric: true,
          sensitivity: 'base'
        });
      });

    case 'name-desc':
      return copied.sort((a, b) => {
        const nameA = getProductName(a);
        const nameB = getProductName(b);
        return nameB.localeCompare(nameA, 'ko', {
          numeric: true,
          sensitivity: 'base'
        });
      });

    default:
      return copied;
  }
};
