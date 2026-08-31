/**
 * Product Classification & Unit Helper Utilities
 * Dongkyung Flooring (동경바닥재)
 */

/**
 * Determines whether an item is an Accessory (부자재)
 * @param {Object|string} item - Product item or category string
 * @returns {boolean}
 */
export const isAccessoryItem = (item) => {
  if (!item) return false;
  
  // 1. Explicit type / product_type check
  if (typeof item === 'object') {
    if (item.type === 'accessory' || item.product_type === 'accessory') return true;
    if (item.type === 'material' || item.product_type === 'material') return false;
  }

  // 2. Category string check
  const catStr = (typeof item === 'string' 
    ? item 
    : (
        item.category?.name ||
        item.category || 
        item.category_name || 
        item.categoryName || 
        item.categories?.name || 
        ''
      )
  ).toString().trim();

  const normalizedCat = catStr.toLowerCase().replace(/[\s_]/g, '');

  if (
    catStr === '부자재' || 
    normalizedCat === 'submaterials' || 
    normalizedCat === 'submaterial' || 
    catStr.includes('부자재')
  ) {
    return true;
  }

  // 3. Fallback name-based keyword check (if category is ambiguous/missing)
  if (typeof item === 'object') {
    const materialCategories = ['데코타일', '장판', '마루', '벽지', '카페트타일', '카펫타일', '러버타일'];
    if (!materialCategories.includes(catStr)) {
      const name = (item.name || item.product_name || '').toString();
      const accessoryKeywords = ['본드', '실리콘', '분리대', '몰딩', '헤라', '테이프', '부착제', '프라이머', '마감재'];
      if (accessoryKeywords.some(kw => name.includes(kw))) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Determines whether an item is a Flooring/Wall Material (자재)
 * @param {Object|string} item 
 * @returns {boolean}
 */
export const isMaterialItem = (item) => {
  return !isAccessoryItem(item);
};

/**
 * Get display category label ("자재" or "부자재")
 * @param {Object} item 
 * @returns {string}
 */
export const getItemClassificationLabel = (item) => {
  return isAccessoryItem(item) ? "부자재" : "자재";
};

/**
 * Get human-readable unit for a product item
 * Handles decotile -> 평, jangpan -> m, maru -> 박스/평, accessories -> unit or 개/통/등
 * @param {Object} item 
 * @returns {string}
 */
export const getItemDisplayUnit = (item) => {
  if (!item) return '개';

  const catStr = (
    item.category?.name ||
    item.category || 
    item.category_name || 
    item.categoryName || 
    item.categories?.name || 
    ''
  ).toString().trim();

  if (catStr === '데코타일') return '평';
  if (catStr === '장판') return 'm';
  if (catStr === '마루') return '박스';
  if (catStr === '카페트타일' || catStr === '카펫타일') return '평';
  if (catStr === '벽지') return '롤';
  if (catStr === '러버타일') return '평';

  // If item has specific DB unit (e.g., "통", "개", "㎡", "roll", etc.)
  if (item.unit && typeof item.unit === 'string') {
    const rawUnit = item.unit.trim();
    if (rawUnit && !rawUnit.includes('pcs') && rawUnit !== '표준규격' && !rawUnit.includes('3.34')) {
      return rawUnit;
    }
  }

  return '개';
};

/**
 * Formats quantity and unit cleanly (e.g., "50평", "1개", "10m", "8박스")
 * @param {Object} item 
 * @param {number} [quantity] 
 * @returns {string}
 */
export const formatQuantityWithUnit = (item, quantity = null) => {
  const qty = quantity !== null ? quantity : (parseInt(item.quantity) || 1);
  const unit = getItemDisplayUnit(item);
  return `${qty}${unit}`;
};
