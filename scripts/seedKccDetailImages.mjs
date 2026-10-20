// scripts/seedKccDetailImages.mjs
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

const TRENDY_450_BASE = '/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지';

export const KCC_TRENDY_CATALOG_MAPPING = {
  // 450각 우븐
  'TS5502P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_14.webp',
    `${TRENDY_450_BASE}/TS5502P_사무실.jpg`,
    `${TRENDY_450_BASE}/TS5502P_2.jpg`,
    `${TRENDY_450_BASE}/TS5502P_3.jpg`
  ],
  'TS5503P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_14.webp',
    `${TRENDY_450_BASE}/TS5503P 우븐.jpg_90cross.jpg`,
    `${TRENDY_450_BASE}/TS5503P 우븐.jpg_180cross.jpg`
  ],
  // 450각 카펫
  'TS5508': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_12.webp',
    `${TRENDY_450_BASE}/TS5508P_사무실.jpg`,
    `${TRENDY_450_BASE}/TS5508 브러쉬 카펫.jpg_90cross.jpg`,
    `${TRENDY_450_BASE}/TS5508 브러쉬 카펫.jpg_180cross.jpg`
  ],
  'TS5510P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_13.webp',
    `${TRENDY_450_BASE}/TS5510P_2x2.png`,
    `${TRENDY_450_BASE}/TS5510P_사무실.jpg`
  ],
  'TS5511P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_13.webp',
    `${TRENDY_450_BASE}/TS5511P_2x2.png`
  ],
  'TS5551P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_13.webp',
    `${TRENDY_450_BASE}/TS5551P_2x2.png`
  ],
  'TS5552P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_13.webp',
    `${TRENDY_450_BASE}/TS5552P_2x2.png`
  ],
  // 450각 비앙코 & 마블
  'TS5516P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_11.webp',
    `${TRENDY_450_BASE}/TS5516P_2x2.png`
  ],
  'TS5547P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_11.webp',
    `${TRENDY_450_BASE}/TS5547P_2x2.png`,
    `${TRENDY_450_BASE}/TS5547P_상업공간.jpg`
  ],
  // 450각 콘크리트
  'TS5518P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_12.webp',
    `${TRENDY_450_BASE}/TS5518P_2x2.png`
  ],
  'TS5519P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_12.webp',
    `${TRENDY_450_BASE}/TS5519P_2x2.png`
  ],
  'TS5550P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_12.webp',
    `${TRENDY_450_BASE}/TS5550P_2x2.png`,
    `${TRENDY_450_BASE}/TS5550P_사무실.jpg`
  ],
  // 450각 슬레이트
  'TS5541P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_10.webp',
    `${TRENDY_450_BASE}/TS5541P_2x2.png`
  ],
  'TS5542P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_10.webp',
    `${TRENDY_450_BASE}/TS5542P_2x2.png`
  ],
  'TS5543P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_10.webp',
    `${TRENDY_450_BASE}/TS5543P_2x2.png`,
    `${TRENDY_450_BASE}/TS5543P_상업공간.jpg`
  ],
  'TS5544P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_10.webp',
    `${TRENDY_450_BASE}/TS5544P_2x2.png`
  ],
  'TS5548P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_10.webp',
    `${TRENDY_450_BASE}/TS5548P_2x2.png`
  ],
  'TS5549P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_10.webp',
    `${TRENDY_450_BASE}/TS5549P_2x2.png`
  ],
  'TS5549M': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_10.webp',
    `${TRENDY_450_BASE}/TS5549P_2x2.png`
  ],
  // 450각 테라죠
  'TS5545P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_09.webp',
    `${TRENDY_450_BASE}/TS5545P_2x2.png`,
    `${TRENDY_450_BASE}/TS5545P_상업공간.jpg`
  ],
  'TS5546P': [
    '/images/catalogs/kcc-sensetile-trendy/page_02.webp',
    '/images/catalogs/kcc-sensetile-trendy/page_09.webp',
    `${TRENDY_450_BASE}/TS5546P_2x2.png`
  ],
  // 600각 어반 콘크리트
  'TS5531M': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_09.webp'],
  'TS5532M': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_08.webp'],
  'TS5533M': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_08.webp'],
  'TS5534M': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_08.webp'],
  'TS5535M': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_08.webp'],
  'TS5536M': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_08.webp'],
  'TS5537M': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_08.webp'],
  // 우드 플랭크
  'TW5102G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_05.webp'],
  'TW5103G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_05.webp'],
  'TW5104G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_06.webp'],
  'TW5105G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_05.webp'],
  'TW5106G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_05.webp'],
  'TW5107G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_06.webp'],
  'TW5108G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_06.webp'],
  'TW5109G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_06.webp'],
  'TW5110G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_06.webp'],
  'TW5111G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_07.webp'],
  'TW5112G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_07.webp'],
  'TW5119G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_07.webp'],
  'TW5120G': ['/images/catalogs/kcc-sensetile-trendy/page_02.webp', '/images/catalogs/kcc-sensetile-trendy/page_07.webp']
};

async function seed() {
  const { data: pList, error: pErr } = await supabase
    .from('products')
    .select('id, name, product_code, description')
    .or('description.ilike.%트랜디%,name.ilike.%트랜디%,product_code.ilike.TS55%,product_code.ilike.TW51%');
  
  if (pErr) {
    console.error('Failed to fetch products:', pErr);
    return;
  }
  console.log('Found candidates in DB:', pList.length);
  let totalInserted = 0;

  for (const p of pList) {
    const rawCode = String(p.product_code || p.name || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    let matchedUrls = null;
    for (const [key, urls] of Object.entries(KCC_TRENDY_CATALOG_MAPPING)) {
      if (rawCode.includes(key.toUpperCase())) {
        matchedUrls = urls;
        break;
      }
    }
    if (!matchedUrls) continue;

    // Check existing
    const { data: existing } = await supabase
      .from('product_images')
      .select('id, image_url')
      .eq('product_id', p.id);

    // If existing images match the new list count and content, skip
    if (existing && existing.length === matchedUrls.length) {
      console.log(`Skipping product ${p.id} (${p.product_code}): already has ${existing.length} up-to-date images`);
      continue;
    }

    if (existing && existing.length > 0) {
      console.log(`Updating product ${p.id} (${p.product_code}): replacing ${existing.length} old images with ${matchedUrls.length} new images`);
      await supabase.from('product_images').delete().eq('product_id', p.id);
    }

    const rows = matchedUrls.map((url, idx) => ({
      product_id: p.id,
      image_url: url,
      image_type: 'detail',
      sort_order: idx,
      alt_text: `${p.name || p.product_code} 상세 이미지 ${idx + 1}`,
      is_active: true
    }));

    const { error } = await supabase.from('product_images').insert(rows);
    if (error) {
      console.error(`Insert error for ${p.id}:`, error);
    } else {
      totalInserted += rows.length;
    }
  }
  console.log(`\n🎉 Seeding complete! Total images inserted: ${totalInserted}`);
}

seed();

