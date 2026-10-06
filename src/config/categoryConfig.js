/**
 * Global Category & Feature Visibility Configuration
 * 
 * To show or hide '부자재' (sub-materials / accessories) across the customer-facing site:
 * Set `HIDE_SUB_MATERIALS = false` to re-enable '부자재'.
 */
export const HIDE_SUB_MATERIALS = true;

/**
 * Check whether a category string or product item is '부자재'
 * @param {string|object} itemOrCategory 
 * @returns {boolean}
 */
export function isSubMaterialCategory(itemOrCategory) {
  if (!itemOrCategory) return false;
  if (typeof itemOrCategory === 'string') {
    const clean = itemOrCategory.trim();
    return clean === '부자재' || clean === '부자재류';
  }
  const cat = itemOrCategory.category?.name || itemOrCategory.category || itemOrCategory.categories?.name;
  if (!cat) return false;
  const cleanCat = String(cat).trim();
  return cleanCat === '부자재' || cleanCat === '부자재류';
}

/**
 * Filter out sub-materials from a product list for customer view if HIDE_SUB_MATERIALS is true.
 * @param {Array} list 
 * @param {boolean} [forceInclude=false] - set true to keep sub-materials regardless of config (e.g. for admin)
 * @returns {Array}
 */
export function filterVisibleProducts(list, forceInclude = false) {
  if (!Array.isArray(list)) return [];
  if (!HIDE_SUB_MATERIALS || forceInclude) return list;
  return list.filter(item => !isSubMaterialCategory(item));
}

/**
 * Get customer-facing main category tabs list
 * @param {Array<string>} [categoriesList]
 * @returns {Array<string>}
 */
export function getVisibleCategories(categoriesList = ["데코타일", "장판", "마루", "벽지", "카페트타일", "부자재"]) {
  if (!HIDE_SUB_MATERIALS) return categoriesList;
  return categoriesList.filter(c => c !== "부자재" && c !== "부자재류");
}
