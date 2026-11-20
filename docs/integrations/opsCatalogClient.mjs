/** DongKyung Ops <-> shopping product master catalog adapter.
 * Use for NEW item selection only. Never rewrite historical document rows.
 */
export const MASTER_CATALOG_SOURCE = 'shop';
export function normalizeCatalogQuery(value) {
  return String(value ?? '').normalize('NFKC').trim();
}
function requireClient(supabase) {
  if (!supabase || typeof supabase.rpc !== 'function') {
    throw new TypeError('A configured Supabase client is required');
  }
}
/** Unified search for ledger, quotes, dispatch forms, and store stock. */
export async function searchCatalog(supabase, query, { limit = 40 } = {}) {
  requireClient(supabase);
  const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 40)));
  const { data, error } = await supabase.rpc('dk_ops_search_shop_materials', {
    q: normalizeCatalogQuery(query), result_limit: safeLimit, show_inactive: false,
  });
  if (error) throw error;
  return (data ?? []).map((p) => ({
    source: MASTER_CATALOG_SOURCE,
    productId: p.product_id,
    materialId: `shop:${p.product_id}`,
    code: p.code ?? '',
    name: p.name ?? '',
    category: p.category ?? '',
    brand: p.brand ?? '',
    spec: p.spec ?? '',
    unit: p.unit ?? '',
    thickness: p.thickness ?? '',
    catalogSalePrice: p.sale == null ? null : Number(p.sale),
  }));
}
/** Lookup approved legacy ERP -> canonical product id links for this workspace. */
export async function getApprovedCatalogLinks(supabase, workspaceId) {
  if (!supabase || typeof supabase.from !== 'function') {
    throw new TypeError('A configured Supabase client is required');
  }
  if (!workspaceId || typeof workspaceId !== 'string') {
    throw new TypeError('workspaceId must be a nonempty string');
  }
  const { data, error } = await supabase
    .from('dk_ops_catalog_approved_links')
    .select('erp_material_id,product_id,canonical_material_id,code,name,brand,category,spec,unit,thickness,catalog_sale_price')
    .eq('workspace_id', workspaceId);
  if (error) throw error;
  return new Map((data ?? []).map((link) => [link.erp_material_id, link]));
}
/** New document line only. Manual unit price takes precedence over catalog suggested price. */
export function newDocumentMaterialSnapshot(product, { unitPrice, quantity = 0 } = {}) {
  if (!product || !Number.isSafeInteger(Number(product.productId)) || Number(product.productId) <= 0) {
    throw new TypeError('A canonical productId is required');
  }
  const finalPrice = unitPrice === undefined ? product.catalogSalePrice : unitPrice;
  return {
    productId: product.productId, materialId: `shop:${product.productId}`,
    source: MASTER_CATALOG_SOURCE, code: product.code, name: product.name,
    category: product.category, brand: product.brand, spec: product.spec,
    unit: product.unit, thickness: product.thickness,
    quantity, unitPrice: finalPrice,
    // Amount, LOT and inventory deltas belong to the document and stock logic.
  };
}
/** Preserve the historical ERP identifier/price/stock and add catalog metadata separately. */
export function attachCatalogLinkToLegacy(legacyMaterial, linksByLegacyId) {
  if (!legacyMaterial || typeof legacyMaterial !== 'object') return legacyMaterial;
  const link = linksByLegacyId?.get?.(legacyMaterial.id);
  return { ...legacyMaterial, catalogLink: link ?? null };
}
