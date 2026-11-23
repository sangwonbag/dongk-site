/**
 * DongKyung Flooring - shared shopping-master catalog adapter.
 * The shopping products.id is the canonical ID. Existing business records remain immutable.
 * This file is a tested integration component, NOT a replacement for program.html.
 */
export const SUPPORTED_FORMS = Object.freeze(['ledger', 'estimate', 'dispatch', 'inventory']);
export const MANUAL_ITEMS = Object.freeze(['인건비', '시공비', '운반비', '양중비', '사다리비', '배송비', '기타']);

function validSupabase(client) {
  if (!client || typeof client.rpc !== 'function') throw new TypeError('A valid Supabase client is required');
}
export function normalizeSearchTerm(term) {
  return String(term ?? '').normalize('NFKC').trim();
}
export function validateForm(form) {
  if (!SUPPORTED_FORMS.includes(form)) throw new TypeError(`Unsupported document: ${form}`);
  return form;
}
export function isManualItem(term) {
  return MANUAL_ITEMS.includes(normalizeSearchTerm(term));
}
export async function searchSharedCatalog(supabase, term, { form = 'ledger', limit = 40 } = {}) {
  validSupabase(supabase);
  validateForm(form);
  const q = normalizeSearchTerm(term);
  const manual = isManualItem(q) ? [{
    kind: 'manual', productId: null, code: q, name: q,
    brand: '', category: '업무항목', unit: '건', spec: '', catalogSalePrice: null,
  }] : [];
  // Always query the shop canonical master; no ERP product-list fallback.
  const { data, error } = await supabase.rpc('dk_ops_search_shop_materials', {
    q, result_limit: Math.max(1, Math.min(100, Number.isFinite(+limit) ? Math.floor(+limit) : 40)), show_inactive: false,
  });
  if (error) throw error;
  const items = (data ?? []).map((p) => ({
    kind: 'shop', productId: Number(p.product_id), materialId: `shop:${p.product_id}`,
    code: String(p.code ?? ''), name: String(p.name ?? ''),
    brand: String(p.brand ?? ''), category: String(p.category ?? ''),
    spec: String(p.spec ?? ''), unit: String(p.unit ?? ''),
    thickness: String(p.thickness ?? ''),
    catalogSalePrice: p.sale == null ? null : Number(p.sale),
  }));
  return manual.concat(items);
}
/** Called only when inserting a NEW document/stock line, not when displaying historical entries. */
export function createNewLine(product, {
  form = 'ledger', quantity = null, unitPrice = undefined, amountOnly = undefined,
  lotNo = '', memo = '',
} = {}) {
  validateForm(form);
  if (!product || (product.kind !== 'shop' && product.kind !== 'manual')) throw new TypeError('Choose a catalog or manual item');
  if (product.kind === 'shop' && (!Number.isSafeInteger(Number(product.productId)) || +product.productId <= 0)) {
    throw new TypeError('Invalid canonical shop product ID');
  }
  const price = unitPrice === undefined ? product.catalogSalePrice : unitPrice;
  return {
    source: product.kind, productId: product.kind === 'shop' ? Number(product.productId) : null,
    materialId: product.kind === 'shop' ? `shop:${product.productId}` : null,
    code: product.code, name: product.name, brand: product.brand,
    category: product.category, spec: product.spec, unit: product.unit,
    quantity, unitPrice: price,
    // amountOnly may be set when quantity/unitPrice are blank; never force recalculation.
    ...(amountOnly !== undefined ? { amountOnly } : {}),
    lotNo, memo,
  };
}
/** Decorate only; never rename, reprice, or rewrite saved trade/stock/LOT data. */
export function preserveHistory(record, approvedLinksByERPId) {
  if (record == null || typeof record !== 'object') return record;
  const canonical = approvedLinksByERPId?.get?.(record.materialId ?? record.id) ?? null;
  return { ...record, catalogLink: canonical };
}
/** Read only approved ERP links; pending/ambiguous links are intentionally omitted. */
export async function loadApprovedERPLinks(supabase, workspaceId) {
  if (!supabase || typeof supabase.from !== 'function') throw new TypeError('A valid Supabase client is required');
  if (!workspaceId) throw new TypeError('workspaceId is required');
  const { data, error } = await supabase.from('dk_ops_catalog_approved_links')
    .select('erp_material_id,product_id,canonical_material_id,code,name,category,brand,spec,unit,catalog_sale_price')
    .eq('workspace_id', workspaceId);
  if (error) throw error;
  return new Map((data ?? []).map((x) => [x.erp_material_id, x]));
}
/** Preserve distinct LOT rows. No guessing of unit conversion or automatic DB stock writes. */
export function summarizeStockLots(rows) {
  const grouped = new Map();
  for (const r of rows ?? []) {
    const id = r.productId ?? r.materialId ?? r.id;
    const lotNo = String(r.lotNo ?? r.lot_no ?? '').trim();
    const unit = String(r.unit ?? '');
    const qty = Number(r.quantity ?? r.qty ?? 0);
    if (!id || !Number.isFinite(qty)) throw new TypeError('A stock row needs product ID and numeric quantity');
    const key = JSON.stringify([id, lotNo, unit]);
    const g = grouped.get(key) ?? { productId: id, lotNo, unit, quantity: 0 };
    g.quantity += qty;
    grouped.set(key, g);
  }
  return [...grouped.values()];
}
