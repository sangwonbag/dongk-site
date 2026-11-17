import test from 'node:test';
import assert from 'node:assert/strict';
import { getConstructionCaseMatch } from '../src/utils/constructionCaseMatcher.js';

function fixture(title, material_summary, product_code = '', product_id = null) {
  return { title, material_summary, products: { product_code }, product_id, is_active: true, is_published: true };
}
function product(code, brand, product_id) { return { code, brand, product_id }; }

test('direct FK and PTT8698 product code match', () => {
  assert.equal(getConstructionCaseMatch(fixture('용인 LX 8698', 'LX PTT8698', 'PTT8698', 106078),
    product('PTT8698', 'LX하우시스', 106078)), 'linked');
});

test('KCC 5534 matches both sizes only when the case explicitly says both', () => {
  const item = fixture('안성 KCC 5534', 'KCC TS 5534 · 450각/600각', 'TS5534M', 100909);
  assert.equal(getConstructionCaseMatch(item, product('TS5534M', 'KCC', 100909)), 'linked');
  assert.equal(getConstructionCaseMatch(item, product('TS5534P', 'KCC')), 'number');
  assert.equal(getConstructionCaseMatch(fixture('대구 KCC 5535', 'KCC TS5535M · 600각', 'TS5535M', 100910), product('TS5535P', 'KCC')), null);
  assert.equal(getConstructionCaseMatch(fixture('가락동 KCC 5551', 'KCC TS5551P · 450각', 'TS5551P', 100924), product('TS5551M', 'KCC')), null);
});

test('same-site multiple product numbers match separately', () => {
  const dongshin = fixture('화성 동신 6711·6740 시공', '동신 아트타일 우드 AB 6711, AB 6740', 'AB 6711', 101244);
  assert.equal(getConstructionCaseMatch(dongshin, product('AB 6740', '동신')), 'code');
  assert.equal(getConstructionCaseMatch(dongshin, product('AB 6711', '동신', 101244)), 'linked');
  const building = fixture('상도동 빌딩 동신 615·608', '동신 DS 608', 'DS 608', 101297);
  assert.equal(getConstructionCaseMatch(building, product('DS 615', '동신')), 'number');
  assert.equal(getConstructionCaseMatch(building, product('AH 615', '동신')), null);
  const kcc = fixture('일산 KCC 5531·5543·5544', 'KCC TS5531M', 'TS5531M', 100906);
  assert.equal(getConstructionCaseMatch(kcc, product('TS5543P', 'KCC')), 'number');
  assert.equal(getConstructionCaseMatch(kcc, product('TS5531P', 'KCC')), null);
});

test('never silently cross brands or publish inactive or hidden entries', () => {
  const one = fixture('서울 LX 729', 'LX하우시스 729 바닥재');
  assert.equal(getConstructionCaseMatch(one, product('AH 729', '동신')), null);
  assert.equal(getConstructionCaseMatch(fixture('강남 BS 303', '프리미엄 사각 데코타일 BS 303'), product('BS303', '스완')), null);
  assert.equal(getConstructionCaseMatch(fixture('병원 점자블럭', '300×300mm'), product('RT-300', '현대')), null);
  const unpublished = fixture('안성 KCC 5534', 'KCC TS5534M', 'TS5534M', 100909);
  unpublished.is_published = false;
  assert.equal(getConstructionCaseMatch(unpublished, product('TS5534M', 'KCC', 100909)), null);
  unpublished.is_published = true;
  unpublished.is_active = false;
  assert.equal(getConstructionCaseMatch(unpublished, product('TS5534M', 'KCC', 100909)), null);
});
