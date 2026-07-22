import { 
  isDecoTile, 
  getOrderPyeong, 
  calculateDecotileBoxes, 
  isDecotileFreeShippingEligible 
} from "./decotileUtils";

/**
 * Calculate actual pyeong for a product item.
 * For Decotile: 1 Box = 1 Pyeong (returns box quantity directly).
 * Keeps consistent across product detail, cart, checkout, and admin.
 */
export const getProductPyeong = (item) => {
  return getOrderPyeong(item);
};

/**
 * Calculate the total pyeong (boxes) sum of ALL Decotile items in the cart.
 */
export const calculateDecorTilePyeong = (cartItems) => {
  return calculateDecotileBoxes(cartItems);
};

/**
 * Checks if the Decotile items in the cart meet the 50 box (50 pyeong) threshold for free shipping.
 */
export const isDecorTileFreeShipping = (cartItems) => {
  return isDecotileFreeShippingEligible(cartItems);
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
