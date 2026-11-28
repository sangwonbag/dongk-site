import test from 'node:test';
import assert from 'node:assert/strict';
import {SUPPORTED_FORMS,normalizeSearchTerm,searchSharedCatalog,createNewLine,preserveHistory,
loadApprovedERPLinks,summarizeStockLots} from './opsCatalogIntegration.mjs';
const fakeItem={product_id:104382,code:'CM24722',name:'뉴청맥 마일드 스톤',brand:'LX하우시스',category:'장판',unit:'35m / Roll',sale:12000};
function sb(rows=[fakeItem]) { let called=null;return {rpc:async(name,params)=>{called={name,params};return {data:rows,error:null}},get called(){return called}}; }
test('four document forms share the same search RPC', async()=>{
  for(const form of SUPPORTED_FORMS){const c=sb();const found=await searchSharedCatalog(c,'24722',{form});
    assert.equal(c.called.name,'dk_ops_search_shop_materials');assert.equal(found[0].materialId,'shop:104382');}
});
test('fullwidth product code normalizes correctly',()=>assert.equal(normalizeSearchTerm(' ２４７２２ '),'24722'));
test('manual labor remains selectable without pretending to be shop product',async()=>{
  const r=await searchSharedCatalog(sb([]),'인건비',{form:'estimate'});
  assert.equal(r[0].kind,'manual');assert.equal(r[0].productId,null);
});
test('new quote respects manual unit price, quantity and LOT',()=>{
  const item={kind:'shop',productId:104382,code:'CM24722',name:'뉴청맥 마일드 스톤',catalogSalePrice:12000};
  const r=createNewLine(item,{form:'estimate',quantity:5,unitPrice:11000,lotNo:'261123A'});
  assert.equal(r.unitPrice,11000);assert.equal(r.quantity,5);assert.equal(r.lotNo,'261123A');
  assert.equal(r.materialId,'shop:104382');
});
test('amount-only document line keeps amount without forced quantity or price',()=>{
  const item={kind:'manual',code:'인건비',name:'인건비',category:'업무항목',unit:'건',catalogSalePrice:null};
  const r=createNewLine(item,{form:'ledger',amountOnly:70000});
  assert.equal(r.amountOnly,70000);assert.equal(r.quantity,null);assert.equal(r.unitPrice,null);
});
test('existing history original fields stay intact and original is untouched',()=>{
  const historical={id:'erp-p-000047',name:'장판(2.7T)53351',unitPrice:34000,amount:68000,stock:26.1,lotNo:'A'};
  const copy={...historical};const result=preserveHistory(historical,new Map([['erp-p-000047',{product_id:104412}]]));
  assert.deepEqual(historical,copy);assert.equal(result.stock,26.1);assert.equal(result.unitPrice,34000);
  assert.equal(result.catalogLink.product_id,104412);assert.equal(result.id,'erp-p-000047');
});
test('distinct LOT quantities remain separate',()=>{
  const res=summarizeStockLots([{productId:9,lotNo:'LOT1',quantity:5,unit:'평'},
    {productId:9,lotNo:'LOT2',quantity:8,unit:'평'},
    {productId:9,lotNo:'LOT1',quantity:2,unit:'평'}]);
  assert.deepEqual(res.map(x=>[x.lotNo,x.quantity]),[['LOT1',7],['LOT2',8]]);
});
test('duplicate product codes are distinct by canonical product IDs',async()=>{
  const choices=await searchSharedCatalog(sb([{...fakeItem,product_id:101,code:'BS353'},
    {...fakeItem,product_id:102,code:'BS353'}]),'BS353',{form:'dispatch'});
  assert.deepEqual(choices.map(x=>x.materialId),['shop:101','shop:102']);
});
test('reconciliation loads only approved links from server view',async()=>{
  const client={from:table=>{assert.equal(table,'dk_ops_catalog_approved_links');return {select:()=>({eq:async()=>({data:[{erp_material_id:'erp-123',product_id:9}],error:null})})}}};
  const r=await loadApprovedERPLinks(client,'workspace');assert.equal(r.size,1);assert.equal(r.get('erp-123').product_id,9);
});
test('RPC error propagates',async()=>{
  await assert.rejects(()=>searchSharedCatalog({rpc:async()=>({error:new Error('offline')})},'24722'),/offline/);
});
