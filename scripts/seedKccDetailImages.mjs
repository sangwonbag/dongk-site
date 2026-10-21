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

const TRENDY_600_BASE = '/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_600각_이미지';
const TRENDY_WOOD_BASE = '/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_우드_이미지';

export const KCC_TRENDY_CATALOG_MAPPING = {
  // 450각 우븐
  'TS5502P': [
    `${TRENDY_450_BASE}/TS5502P.webp`,
    `${TRENDY_450_BASE}/TS5502P_사무실.jpg`
  ],
  'TS5503P': [
    `${TRENDY_450_BASE}/TS5503P.webp`,
    `${TRENDY_450_BASE}/TS5503P 우븐.jpg_90cross.jpg`,
    `${TRENDY_450_BASE}/TS5503P 우븐.jpg_180cross.jpg`
  ],
  // 450각 카펫
  'TS5508': [
    `${TRENDY_450_BASE}/TS5508P.webp`,
    `${TRENDY_450_BASE}/TS5508 브러쉬 카펫.jpg_90cross.jpg`,
    `${TRENDY_450_BASE}/TS5508 브러쉬 카펫.jpg_180cross.jpg`,
    `${TRENDY_450_BASE}/TS5508P_사무실.jpg`
  ],
  'TS5508P': [
    `${TRENDY_450_BASE}/TS5508P.webp`,
    `${TRENDY_450_BASE}/TS5508 브러쉬 카펫.jpg_90cross.jpg`,
    `${TRENDY_450_BASE}/TS5508 브러쉬 카펫.jpg_180cross.jpg`,
    `${TRENDY_450_BASE}/TS5508P_사무실.jpg`
  ],
  'TS5510P': [
    `${TRENDY_450_BASE}/TS5510P.webp`,
    `${TRENDY_450_BASE}/TS5510P_2x2.webp`,
    `${TRENDY_450_BASE}/TS5510P_사무실.jpg`
  ],
  'TS5511P': [
    `${TRENDY_450_BASE}/TS5511P.webp`,
    `${TRENDY_450_BASE}/TS5511P_2x2.webp`
  ],
  'TS5512P': [
    `${TRENDY_450_BASE}/TS5512P_사무실.jpg`
  ],
  'TS5551P': [
    `${TRENDY_450_BASE}/TS5551P.webp`,
    `${TRENDY_450_BASE}/TS5551P_2x2.webp`
  ],
  'TS5552P': [
    `${TRENDY_450_BASE}/TS5552P.webp`,
    `${TRENDY_450_BASE}/TS5552P_2x2.webp`
  ],
  // 450각 비앙코 & 마블
  'TS5516P': [
    `${TRENDY_450_BASE}/TS5516P.webp`,
    `${TRENDY_450_BASE}/TS5516P_2x2.webp`
  ],
  'TS5547P': [
    `${TRENDY_450_BASE}/TS5547P.webp`,
    `${TRENDY_450_BASE}/TS5547P_2x2.webp`,
    `${TRENDY_450_BASE}/TS5547P_상업공간.jpg`
  ],
  // 450각 콘크리트
  'TS5518P': [
    `${TRENDY_450_BASE}/TS5518P.webp`,
    `${TRENDY_450_BASE}/TS5518P_2x2.webp`
  ],
  'TS5519P': [
    `${TRENDY_450_BASE}/TS5519P.webp`,
    `${TRENDY_450_BASE}/TS5519P_2x2.webp`
  ],
  'TS5550P': [
    `${TRENDY_450_BASE}/TS5550P.webp`,
    `${TRENDY_450_BASE}/TS5550P_2x2.webp`,
    `${TRENDY_450_BASE}/TS5550P_사무실.jpg`
  ],
  // 450각 슬레이트
  'TS5541P': [
    `${TRENDY_450_BASE}/TS5541P.webp`,
    `${TRENDY_450_BASE}/TS5541P_2x2.webp`
  ],
  'TS5542P': [
    `${TRENDY_450_BASE}/TS5542P.webp`,
    `${TRENDY_450_BASE}/TS5542P_2x2.webp`
  ],
  'TS5543P': [
    `${TRENDY_450_BASE}/TS5543P.webp`,
    `${TRENDY_450_BASE}/TS5543P_2x2.webp`,
    `${TRENDY_450_BASE}/TS5543P_상업공간.jpg`
  ],
  'TS5544P': [
    `${TRENDY_450_BASE}/TS5544P.webp`,
    `${TRENDY_450_BASE}/TS5544P_2x2.webp`
  ],
  'TS5548P': [
    `${TRENDY_450_BASE}/TS5548P.webp`,
    `${TRENDY_450_BASE}/TS5548P_2x2.webp`
  ],
  'TS5549P': [
    `${TRENDY_450_BASE}/TS5549P.webp`,
    `${TRENDY_450_BASE}/TS5549P_2x2.webp`
  ],
  'TS5549M': [
    `${TRENDY_450_BASE}/TS5549P.webp`,
    `${TRENDY_450_BASE}/TS5549P_2x2.webp`
  ],
  // 450각 테라죠
  'TS5545P': [
    `${TRENDY_450_BASE}/TS5545P.webp`,
    `${TRENDY_450_BASE}/TS5545P_2x2.webp`,
    `${TRENDY_450_BASE}/TS5545P_상업공간.jpg`
  ],
  'TS5546P': [
    `${TRENDY_450_BASE}/TS5546P.webp`,
    `${TRENDY_450_BASE}/TS5546P_2x2.webp`
  ],
  // 600각 어반 콘크리트
  'TS5531M': [`${TRENDY_600_BASE}/TS5531M.png`],
  'TS5532M': [`${TRENDY_600_BASE}/TS5532M.png`],
  'TS5533M': [`${TRENDY_600_BASE}/TS5533M.png`],
  'TS5534M': [`${TRENDY_600_BASE}/TS5534M.png`, `${TRENDY_450_BASE}/TS5534M_상업공간.jpg`],
  'TS5535M': [`${TRENDY_600_BASE}/TS5535M.png`],
  'TS5536M': [`${TRENDY_600_BASE}/TS5536M.png`],
  'TS5537M': [`${TRENDY_600_BASE}/TS5537M.png`],
  // 우드 플랭크
  'TW5102G': [`${TRENDY_WOOD_BASE}/TW5102G.png`, `${TRENDY_WOOD_BASE}/TW5102G_상업공간.jpg`],
  'TW5103G': [`${TRENDY_WOOD_BASE}/TW5103G.png`],
  'TW5104G': [`${TRENDY_WOOD_BASE}/TW5104G.png`, `${TRENDY_WOOD_BASE}/TW5104G_사무실.jpg`],
  'TW5105G': [`${TRENDY_WOOD_BASE}/TW5105G.png`],
  'TW5106G': [`${TRENDY_WOOD_BASE}/TW5106G.png`],
  'TW5107G': [`${TRENDY_WOOD_BASE}/TW5107G.png`],
  'TW5108G': [`${TRENDY_WOOD_BASE}/TW5108G.png`],
  'TW5109G': [`${TRENDY_WOOD_BASE}/TW5109G.png`],
  'TW5110G': [`${TRENDY_WOOD_BASE}/TW5110G.png`],
  'TW5111G': [`${TRENDY_WOOD_BASE}/TW5111G.png`],
  'TW5112G': [`${TRENDY_WOOD_BASE}/TW5112G.png`],
  'TW5119G': [`${TRENDY_WOOD_BASE}/TW5119G.png`, `${TRENDY_WOOD_BASE}/TW5119G_상업공간.jpg`],
  'TW5120G': [`${TRENDY_WOOD_BASE}/TW5120G.png`]
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

