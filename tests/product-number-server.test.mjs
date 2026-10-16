import test from 'node:test';
import assert from 'node:assert/strict';
process.env.VITE_SUPABASE_URL = 'https://search-test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-public-key';
const calls = [];
const row = (id, code, category = '데코타일', active = true) => ({ id, product_code: code, name: code, is_active: active, categories: { name: category }, brands: { name: '테스트' } });
let empty = false;
globalThis.fetch = async input => {
  const url = new URL(input instanceof Request ? input.url : input);
  calls.push(url);
  const offset = Number(url.searchParams.get('offset') || 0);
  const rows = empty ? [] : offset === 0
    ? Array.from({length:1000}, (_, i) => row(i, `AB49598-01X${i}`))
    : [row(1001, '49598-01'), row(1002, '49598-01', '부자재'), row(1003, '49598-01', '벽지', false)];
  return new Response(JSON.stringify(rows), {status:200, headers:{'Content-Type':'application/json'}});
};
const { searchMaterials } = await import('../src/utils/supabaseFetcher.js');
test('server search pages all candidates, ranks exact matches, and preserves visibility', async () => {
  const results = await searchMaterials('4959801');
  assert.equal(calls.length, 2);
  assert.equal(results[0].code, '49598-01');
  assert.equal(results.length, 1001);
  assert.equal(calls[0].searchParams.get('is_active'), 'eq.true');
  assert.ok(calls[0].searchParams.get('or').includes('product_code.ilike.%4%9%5%9%8%0%1%'));
  assert.equal(calls[1].searchParams.get('offset'), '1000');
  empty = true;
  assert.deepEqual(await searchMaterials('5702'), []); // A valid empty server result must not resurrect local data.
});
