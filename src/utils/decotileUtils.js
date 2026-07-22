/**
 * Dongkyung Flooring (동경바닥재) - Decotile Unified Calculation Utility
 * 
 * Core Rule:
 * 1 Box Decotile = 1 Pyeong (1박스 = 1평) unconditionally.
 * Required boxes = Required pyeong.
 * Ordered pyeong = Ordered boxes.
 * Decotile 50+ boxes = 50+ pyeong = Free Shipping.
 */

export const DECOTILE_NOTICE_TEXT = "데코타일은 주문 계산 시 1박스를 1평으로 계산합니다.";

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
 */
export const getOrderPyeong = (item, quantityOverride = null) => {
  if (!item) return 0;
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
 * Sum total Decotile boxes (pyeong) in an array of cart/checkout items.
 */
export const calculateDecotileBoxes = (cartItems) => {
  if (!cartItems || !Array.isArray(cartItems)) return 0;
  return cartItems
    .filter(item => isDecoTile(item))
    .reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
};

/**
 * Check if the Decotile items in the cart meet the 50 box (50 pyeong) threshold for free shipping.
 */
export const isDecotileFreeShippingEligible = (cartItems) => {
  const totalBoxes = calculateDecotileBoxes(cartItems);
  return totalBoxes >= 50;
};
