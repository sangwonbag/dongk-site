/**
 * Dongkyung Flooring (동경바닥재) - Decotile Unified Calculation Utility
 * 
 * Core Rules:
 * 1 Box Decotile = 1 Pyeong (1박스 = 1평) unconditionally.
 * Required boxes = Required pyeong.
 * Ordered pyeong = Ordered boxes.
 * Decotile 50+ boxes of the SAME BRAND = 50+ pyeong = Free Shipping benefit automatically.
 * Different brands are NOT summed together.
 */

import { isAccessoryItem } from "./productClassification";

export const DECOTILE_NOTICE_TEXT = "동일 브랜드 데코타일 50평(50박스) 이상 주문 시 배송비 무료 혜택이 자동 적용됩니다.";

/**
 * Safely check if a product or category string is Decotile.
 * Handles variations: '데코타일', '데코 타일', 'deco_tile', 'decotile', '데코'
 */
export const isDecoTile = (productOrCategory) => {
  if (!productOrCategory) return false;
  
  const categoryStr = typeof productOrCategory === 'string' 
    ? productOrCategory 
    : (
        productOrCategory.category || 
        productOrCategory.category_name || 
        productOrCategory.categoryName || 
        ''
      );

  const normalized = categoryStr.toString().trim().toLowerCase().replace(/[\s_]/g, '');
  return (
    normalized === '데코타일' ||
    normalized === 'decotile' ||
    normalized === 'decotiles' ||
    normalized === '데코'
  );
};

/**
 * Calculate order pyeong for a product item based on quantity.
 * For Decotile: 1 Box = 1 Pyeong (returns box quantity directly).
 * For non-Decotile categories: preserves original calculation formulas.
 * Accessories unconditionally return 0 pyeong.
 */
export const getOrderPyeong = (item, quantityOverride = null) => {
  if (!item || isAccessoryItem(item)) return 0;
  const qty = parseInt(quantityOverride !== null ? quantityOverride : item.quantity) || 1;

  // 1. Decotile Category: 1 Box = 1 Pyeong unconditionally
  if (isDecoTile(item)) {
    return qty;
  }

  // 2. Swan Carpet Tile
  const brand = item.brand || '';
  const category = item.category || '';
  if (brand === '스완' && (category === '카페트타일' || category === '카펫타일')) {
    return qty * 1.21;
  }

  // 3. Other non-decotile categories (Wood flooring, wallpaper, etc.)
  if (item.pyeong !== undefined && item.pyeong !== null && !isNaN(parseFloat(item.pyeong))) {
    return parseFloat(item.pyeong) * qty;
  }
  if (item.area !== undefined && item.area !== null && !isNaN(parseFloat(item.area))) {
    return parseFloat(item.area) * qty;
  }

  return qty;
};

/**
 * Group decotile items by brand and sum boxes per brand.
 * @returns {Object} Map of BRAND_NAME -> totalBoxes
 */
export const calculateDecotileBoxesByBrand = (cartItems) => {
  if (!cartItems || !Array.isArray(cartItems)) return {};
  const brandMap = {};
  cartItems.forEach(item => {
    if (isDecoTile(item)) {
      const rawBrand = item.brand || '기타';
      const brandKey = rawBrand.trim().toUpperCase();
      const qty = parseInt(item.quantity) || 1;
      brandMap[brandKey] = (brandMap[brandKey] || 0) + qty;
    }
  });
  return brandMap;
};

/**
 * Check if ANY single brand's Decotile total pyeong is >= 50.
 * @returns {{ eligible: boolean, eligibleBrands: string[], brandTotals: Object, maxBrandBoxes: number }}
 */
export const getDecotileFreeShippingStatus = (cartItems) => {
  const brandTotals = calculateDecotileBoxesByBrand(cartItems);
  const eligibleBrands = [];
  let maxBrandBoxes = 0;

  Object.entries(brandTotals).forEach(([brand, boxes]) => {
    if (boxes > maxBrandBoxes) maxBrandBoxes = boxes;
    if (boxes >= 50) {
      eligibleBrands.push(brand);
    }
  });

  return {
    eligible: eligibleBrands.length > 0,
    eligibleBrands,
    brandTotals,
    maxBrandBoxes
  };
};

/**
 * Sum total Decotile boxes across all items in cart.
 */
export const calculateDecotileBoxes = (cartItems) => {
  if (!cartItems || !Array.isArray(cartItems)) return 0;
  return cartItems
    .filter(item => isDecoTile(item))
    .reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
};

/**
 * Check if same-brand Decotile items meet the 50 box threshold.
 */
export const isDecotileFreeShippingEligible = (cartItems) => {
  return getDecotileFreeShippingStatus(cartItems).eligible;
};
