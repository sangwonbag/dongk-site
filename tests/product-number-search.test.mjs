import test from 'node:test';
import assert from 'node:assert/strict';
import { getSearchScore, normalizeSearchText } from '../src/utils/searchUtils.js';
import { searchMaterials } from '../src/utils/supabaseFetcher.js';

test('number-only lookup supports prefixes, suffixes and separators', () => {
  for (const [code, query] of [['CH 5702','5702'],['TW5120G','5120'],['49598-01','4959801'],['49598-01','49598 01'],['0088','0088'],['CM21882','21882'],['30082P','30082']]) {
    assert.ok(getSearchScore({code}, query) > 0, `${code} / ${query}`);
  }
  assert.equal(normalizeSearchText(5702), '5702');
  assert.ok(getSearchScore({product_code: 5702}, '5702') > 0);
});
test('exact identifiers rank before partial identifiers and ignore dimensions/prices', () => {
  assert.ok(getSearchScore({code:'5702'}, '5702') > getSearchScore({code:'CH5702'}, '5702'));
  assert.ok(getSearchScore({code:'CH5702'}, '5702') > getSearchScore({code:'CH57020'}, '5702'));
  assert.equal(getSearchScore({code:'AB123',name:'600각',price:600,specs:{size:'600×600'}}, '600'), 0);
  assert.equal(getSearchScore({code:'49598-02'}, '4959801'), 0);
  assert.equal(getSearchScore({code:'0088'}, ' '), 0);
});
test('full local catalogue search returns actual registered codes', async () => {
  for (const query of ['4951','5702','30082','600']) {
    const results = await searchMaterials(query);
    assert.ok(results.length, query);
    assert.ok(results.every(item => getSearchScore(item, query) > 0));
    assert.ok(results.every(item => item.active !== false && item.category !== '부자재'));
    console.log(query, results.length, results.slice(0, 3).map(item => item.code));
  }
  assert.deepEqual(await searchMaterials('999999999999'), []);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(searchMaterials('3084', controller.signal), {name:'AbortError'});
});
