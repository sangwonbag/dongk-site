import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCatalogQuery, searchCatalog, getApprovedCatalogLinks,
  newDocumentMaterialSnapshot, attachCatalogLinkToLegacy } from './opsCatalogClient.mjs';

test('normalizes fullwidth product codes', () => {
  assert.equal(normalizeCatalogQuery('  ２４７２２  '), '24722');
});

test('uses the canonical catalog RPC and caps query result limit', async () => {
  let call;
  const client = { rpc: async (name, args) => {
    call = {name,args};
    return {data:[{product_id:104382,code:'CM24722',name:'뉴청맥 마일드 스톤',category:'장판',sale:12000}],error:null};
  }};
  const result = await searchCatalog(client,' 24722 ',{limit:200});
  assert.deepEqual(call,{name:'dk_ops_search_shop_materials',args:{q:'24722',result_limit:100,show_inactive:false}});
  assert.equal(result[0].materialId,'shop:104382');
  assert.equal(result[0].catalogSalePrice,12000);
});

test('ERP link preserves historical price and stock', async () => {
  const old={id:'erp-p-000047',name:'장판(2.7T)53351',sale:999,stock:123};
  const client = {from:()=>({select:()=>({eq:async()=>({
    data:[{erp_material_id:'erp-p-000047',product_id:104412}],error:null
  })})})};
  const map=await getApprovedCatalogLinks(client,'workspace-1');
  const result=attachCatalogLinkToLegacy(old,map);
  assert.equal(result.id,old.id);
  assert.equal(result.sale,999);
  assert.equal(result.stock,123);
  assert.equal(result.catalogLink.product_id,104412);
});

test('new document line uses shopping id and manual unit price', () => {
  const item={productId:104412,code:'53351',name:'지아사랑애 보스톤오크',
    category:'장판',brand:'LX하우시스',spec:'2.7T',unit:'25m / Roll',catalogSalePrice:34000};
  const row=newDocumentMaterialSnapshot(item,{quantity:3,unitPrice:31000});
  assert.equal(row.materialId,'shop:104412');
  assert.equal(row.unitPrice,31000);
  assert.equal(row.quantity,3);
  assert.equal('stock' in row,false);
  assert.equal('amount' in row,false);
});

test('propagates Supabase errors rather than silently accepting partial results', async () => {
  await assert.rejects(() => searchCatalog({rpc:async()=>({error:new Error('fail')})},'KCC'), /fail/);
});
