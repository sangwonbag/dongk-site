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

/**
 * Sorts an array of products based on the sortOption without mutating the original array.
 * Supported options: 'default', 'price-asc', 'price-desc', 'name-asc', 'name-desc'
 */
export const sortProducts = (products, sortOption = 'default') => {
  if (!products || !Array.isArray(products) || products.length === 0) return [];
  if (!sortOption || sortOption === 'default') return products;

  const copied = [...products];

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
