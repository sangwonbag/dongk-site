/**
 * Calculate actual pyeong for a product item based on specs, brand, category etc.
 * Keeps consistent with product detail, cart, and checkout calculations.
 */
export const getProductPyeong = (item) => {
  if (!item) return 0;
  const qty = parseInt(item.quantity) || 1;
  const category = item.category || "";
  const brand = item.brand || "";
  const line = item.line || "";
  const name = item.name || "";
  const code = item.code || "";
  const shape = item.shape || "";

  // 1. KCC Decotile
  if (brand === 'KCC' && category === '데코타일') {
    let sqmPerBox = 3.32; // Default wood
    if (
      line.includes('센스레이') || 
      shape === '직사각' || 
      (code && code.toUpperCase().startsWith('B') && code.toUpperCase().endsWith('J'))
    ) {
      sqmPerBox = 2.51;
    } else if (
      name.includes('600각') || 
      shape === '600각' || 
      (code && code.toUpperCase().endsWith('M'))
    ) {
      sqmPerBox = 3.24;
    } else if (
      name.includes('450각') || 
      shape === '450각' || 
      (code && code.toUpperCase().endsWith('P'))
    ) {
      sqmPerBox = 3.34;
    }
    return (qty * sqmPerBox) / 3.3058;
  }

  // 2. Decotile (other brands)
  if (category === '데코타일') {
    // Priority 1: Check defined properties
    if (item.pyeong !== undefined && item.pyeong !== null && !isNaN(parseFloat(item.pyeong))) {
      return parseFloat(item.pyeong) * qty;
    }
    if (item.area !== undefined && item.area !== null && !isNaN(parseFloat(item.area))) {
      return parseFloat(item.area) * qty;
    }

    // Priority 2: Extract from packing specs (e.g., "12pcs / 3.15㎡" or "1박스당 1평(약 3.3㎡)")
    const packingStr = item.packing || item.package || (item.specs && item.specs.packing) || "";
    if (packingStr) {
      const m2Match = packingStr.match(/(\d+(?:\.\d+)?)\s*㎡/);
      if (m2Match) {
        const m2Val = parseFloat(m2Match[1]);
        if (!isNaN(m2Val) && m2Val > 0) {
          return m2Val * 0.3025 * qty;
        }
      }
      const pyMatch = packingStr.match(/(\d+(?:\.\d+)?)\s*평/);
      if (pyMatch) {
        const pyVal = parseFloat(pyMatch[1]);
        if (!isNaN(pyVal) && pyVal > 0) {
          return pyVal * qty;
        }
      }
    }

    // Default fallback to 1 box = 1 pyeong (like Cart.jsx)
    return qty;
  }

  // 3. Swan Carpet Tile
  if (brand === '스완' && category === '카페트타일') {
    return qty * 1.21;
  }

  // 4. Other categories fallback (e.g. wood, paper etc.)
  if (item.pyeong !== undefined && item.pyeong !== null && !isNaN(parseFloat(item.pyeong))) {
    return parseFloat(item.pyeong) * qty;
  }
  if (item.area !== undefined && item.area !== null && !isNaN(parseFloat(item.area))) {
    return parseFloat(item.area) * qty;
  }

  return qty;
};

/**
 * Calculate the total pyeong sum of ALL Decotile items in the cart.
 */
export const calculateDecorTilePyeong = (cartItems) => {
  if (!cartItems || !Array.isArray(cartItems)) return 0;
  return cartItems
    .filter(item => item.category === "데코타일")
    .reduce((sum, item) => sum + getProductPyeong(item), 0);
};

/**
 * Checks if the Decotile items in the cart meet the 50 pyeong threshold for free shipping.
 */
export const isDecorTileFreeShipping = (cartItems) => {
  const totalPyeong = calculateDecorTilePyeong(cartItems);
  return totalPyeong >= 50;
};

/**
 * Calculate shipping fee based on free shipping eligibility.
 */
export const calculateShippingFee = (cartItems, existingShippingFee = 0) => {
  if (isDecorTileFreeShipping(cartItems)) {
    return 0;
  }
  return existingShippingFee;
};
