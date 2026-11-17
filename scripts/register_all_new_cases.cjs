require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { materials } = require('../src/data/materials.db.js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY;
const client = createClient(SUPABASE_URL, SUPABASE_KEY);

const casesDir = path.resolve('public/images/시공사례');

// Existing registered folders
const existingFolders = new Set([
  '25.07.14 안성헬스장 KCC 5534',
  '26.11.11 LX 프레스티지 8698 기흥 헬스장',
  '25.07.24 동신 726 구의동 아파트',
  '25.07.16 KCC 5551 가락동 오피스텔',
  '25.08.12 동신 615 중원대학교',
  '25.08.09 동신 1531 의왕시 이동 단독주택',
  '25.08.08 LX 24711 서울 서남교회',
  '25.08.08 LX 23692 고양시 신원동 빌라',
  '25.07.31 KCC 5518 한양대 퓨전테크센터',
  '25.07.29 동신하우스 739 삼성동 주택',
  '25.07.29 KCC 5112 용인 상갈동 단독주택',
  '25.11.15 KCC 5535 대구 헬스장',
  '25.11.20 동신 4004 중구 상가',
  '25.12.09 BS 303 논현동 오피스텔',
  '25.12.17 KCC 5548 하남 헬스장',
  '25.12.18 점자블럭 동대문의료재단',
  '25.12.23 동신우드 6711,6740 화성 상가',
  '25.07.14 KCC 5534안성헬스장' // dup
]);

const ignoredFolders = new Set([
  '25.10.17 에코노 6564 안양 약국', // duplicate of LX에코노
  '25.11.19 동신 6741 잠실 우성아파트', // 0 images
  '25.12.19 LX에코노 6565 안양약국' // 0 images
]);

async function run() {
  // Fetch ALL products from Supabase using pagination
  let allProducts = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data, error } = await client
      .from('products')
      .select('id, name, slug, product_code, brand')
      .range(from, from + step - 1);
    if (error) {
      console.error(error);
      break;
    }
    allProducts.push(...data);
    if (data.length < step) break;
    from += step;
  }
  console.log(`Loaded ${allProducts.length} total products from Supabase.`);

  // Map products by normalized codes
  const productByCode = new Map();
  const productBySlug = new Map();
  for (const p of allProducts) {
    if (p.product_code) {
      const norm = p.product_code.replace(/[-\s]/g, '').toUpperCase();
      if (!productByCode.has(norm)) productByCode.set(norm, p);
    }
    if (p.slug) productBySlug.set(p.slug.toLowerCase(), p);
    if (p.name) {
      const norm = p.name.replace(/[-\s]/g, '').toUpperCase();
      if (!productByCode.has(norm)) productByCode.set(norm, p);
    }
  }

  const allDirs = fs.readdirSync(casesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  const toProcess = allDirs.filter(d => !existingFolders.has(d) && !ignoredFolders.has(d));
  console.log(`Processing ${toProcess.length} case folders...`);

  const { data: maxIdRow } = await client.from('construction_cases').select('id').order('id', { ascending: false }).limit(1);
  let nextId = (maxIdRow && maxIdRow[0]?.id ? maxIdRow[0].id : 21) + 1;

  const newCases = [];

  for (const dirName of toProcess) {
    const fullDir = path.join(casesDir, dirName);
    const files = fs.readdirSync(fullDir)
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
      .sort();

    if (files.length === 0) continue;

    // Date
    const dateMatch = dirName.match(/^(2[56])\.(\d{2})\.(\d{2})/);
    const constructedAt = dateMatch ? `20${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : '2026-03-20';

    const remainder = dirName.replace(/^(2[56])\.(\d{2})\.(\d{2})\s*/, '').trim();

    // Determine category
    let category = '상업공간';
    if (/아파트|주택|빌라|가정집|오피스텔|거실/.test(remainder)) {
      category = '주거공간';
    } else if (/사무실|오피스|센터|타워|빌딩/.test(remainder)) {
      category = '사무공간';
    } else if (/학교|강당|학원|병원|교회/.test(remainder)) {
      category = '교육·체육시설';
    } else if (/헬스장|식당|약국|상가|공장|원상복구/.test(remainder)) {
      category = '상업공간';
    }

    // Identify brand
    let brand = '';
    if (/KCC/i.test(remainder)) brand = 'KCC';
    else if (/LX|하우스/i.test(remainder)) brand = 'LX하우시스';
    else if (/동신/i.test(remainder)) brand = '동신';
    else if (/녹수/i.test(remainder)) brand = '녹수';
    else if (/현대/i.test(remainder)) brand = '현대';
    else if (/유성/i.test(remainder)) brand = '유성';
    else if (/대진/i.test(remainder)) brand = '대진';

    // Extract numbers
    const numMatches = remainder.match(/\b\d{3,5}\b/g) || [];

    // Search product in Supabase
    let matchedProduct = null;
    let matchedMaterialLocal = null;

    // First check materials.db.js
    for (const m of materials) {
      const mBrand = String(m.brand || '').toUpperCase();
      const mCode = String(m.code || '').replace(/[-\s]/g, '').toUpperCase();
      const mId = String(m.id || '').toUpperCase();

      for (const num of numMatches) {
        if (mCode === num || mCode.includes(num)) {
          if (!brand || mBrand.includes(brand.toUpperCase()) || (brand === 'LX하우시스' && mBrand.includes('LX'))) {
            matchedMaterialLocal = m;
            break;
          }
        }
      }
      if (matchedMaterialLocal) break;
    }

    // Try finding in Supabase
    if (matchedMaterialLocal) {
      if (productBySlug.has(matchedMaterialLocal.id.toLowerCase())) {
        matchedProduct = productBySlug.get(matchedMaterialLocal.id.toLowerCase());
      } else if (matchedMaterialLocal.code && productByCode.has(matchedMaterialLocal.code.replace(/[-\s]/g, '').toUpperCase())) {
        matchedProduct = productByCode.get(matchedMaterialLocal.code.replace(/[-\s]/g, '').toUpperCase());
      }
    }

    // If still null, try direct code prefixes in Supabase
    if (!matchedProduct) {
      for (const num of numMatches) {
        const prefixes = brand === 'KCC' ? ['TS', 'TW'] :
                         brand === 'LX하우시스' ? ['CM', 'EH', 'DET', 'PTT', 'BOT', 'ZOT', 'HOT', 'ZJ'] :
                         brand === '동신' ? ['AS', 'AB', 'DS', 'AH', 'CH'] :
                         brand === '녹수' ? ['NPT', 'NOW', 'NEH'] :
                         brand === '대진' ? ['DT', 'DW', 'DG'] :
                         brand === '유성' ? ['FSM'] : ['TS', 'CM', 'DS', 'AS'];

        const candidates = [num];
        for (const pref of prefixes) {
          candidates.push(pref + num);
          candidates.push(pref + num + 'P');
          candidates.push(pref + num + 'M');
          candidates.push(pref + num + 'G');
        }

        for (const cand of candidates) {
          if (productByCode.has(cand.toUpperCase())) {
            matchedProduct = productByCode.get(cand.toUpperCase());
            break;
          }
        }
        if (matchedProduct) break;
      }
    }

    // Build clean Material Summary
    let materialSummary = '';
    if (matchedProduct) {
      const b = matchedProduct.brand || brand;
      const n = matchedProduct.name || matchedProduct.product_code;
      materialSummary = `${b} ${n}`.trim();
    } else if (matchedMaterialLocal) {
      materialSummary = `${matchedMaterialLocal.brand || brand} ${matchedMaterialLocal.name || matchedMaterialLocal.code}`.trim();
    } else {
      materialSummary = `${brand || '프리미엄'} ${numMatches.join('·')} 바닥재`.trim();
    }

    // Extract site location
    const locPattern = /(올림픽\s*선수촌아파트|동대문\s*학교|미아동\s*헬스장|휘문고강당|부천\s*사무실|둔촌프라자아파트|강남\s*사무실|수원\s*아파트|파주\s*가정집|전농동\s*상가|위례\s*상가|가락동\s*상가|성남\s*식당|잠실우성아파트|천호동\s*주택|일산\s*헬스장|화성\s*상가|목동\s*병원|안양\s*상가|잠실\s*오피스텔|미아동\s*빌라|당진\s*공장|수원\s*원상복구|강남\s*원상복구|월곡동\s*주택|광명\s*유플래닛타워|부천\s*아파트|용산\s*상가|마포\s*상가|시흥\s*삼양테크노파크|삼성동\s*사무실|여주시\s*삼교동\s*공장|안양\s*약국|강북구\s*헬스장|상도동\s*빌딩|동대문\s*상가|서초구\s*상가|인천\s*상가|남양주\s*아파트|대광고등학교|노원\s*교회\s*단상|중원대학교|수원\s*헬스장|서대문\s*상가|성내동\s*사무실|반포동\s*사무실|전농동\s*빌라|용인\s*수지\s*학원|역삼동\s*사무실|신장동\s*아파트)/i;
    const locMatch = remainder.match(locPattern);
    const siteLoc = locMatch ? locMatch[0].trim() : remainder;

    // Title
    const title = `${siteLoc} ${brand ? brand + ' ' : ''}${numMatches.length > 0 ? numMatches.join('·') + ' ' : ''}시공`;

    // Slug
    const safeRemainder = remainder.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, '');
    const slug = `case-${nextId}-${safeRemainder}`;

    // Images
    const mainImageUrl = `/images/시공사례/${dirName}/${files[0]}`;
    const imageUrls = files.map(f => `/images/시공사례/${dirName}/${f}`);

    // Description
    const desc = `${siteLoc} 공간에 ${materialSummary}를 정밀 시공한 사례입니다. 동경바닥재 전문 시공팀이 정밀한 바닥 레벨링과 세심한 이음새 마감으로 견고하고 쾌적한 보행감을 완성했습니다.`;

    const isFeatured = ['26.03.20 동신우드 6717 올림픽 선수촌아파트', '26.05.28 LX 6952  LX 6950 프레스티지 광명 유플래닛타워', '26.06.02 KCC 5543 시흥 삼양테크노파크'].includes(dirName);

    newCases.push({
      id: nextId,
      slug,
      title,
      location: siteLoc,
      category,
      material_summary: materialSummary,
      product_id: matchedProduct ? matchedProduct.id : null,
      description: desc,
      main_image_url: mainImageUrl,
      image_urls: imageUrls,
      constructed_at: constructedAt,
      is_active: true,
      is_published: true,
      is_featured: isFeatured,
      sort_order: nextId
    });

    nextId++;
  }

  console.log(`Prepared ${newCases.length} cases.`);
  let matchedCount = newCases.filter(c => c.product_id !== null).length;
  console.log(`Matched with product_id: ${matchedCount} / ${newCases.length}`);

  // Upsert into Supabase
  console.log('\n--- Inserting into Supabase construction_cases table ---');
  let successCount = 0;
  for (const c of newCases) {
    const { error } = await client
      .from('construction_cases')
      .upsert(c, { onConflict: 'id' });

    if (error) {
      console.error(`Failed to upsert case ${c.id} (${c.title}):`, error.message);
    } else {
      successCount++;
    }
  }
  console.log(`Successfully upserted ${successCount} / ${newCases.length} cases to Supabase!`);

  // Now fetch all cases from Supabase to write to fallbackCases.js
  const { data: allDbCases, error: fetchErr } = await client
    .from('construction_cases')
    .select('*')
    .order('id', { ascending: true });

  if (fetchErr) {
    console.error('Error fetching all cases for fallback:', fetchErr);
  } else {
    console.log(`Writing ${allDbCases.length} cases to src/data/fallbackCases.js...`);
    const fallbackContent = `// Auto-generated fallback construction cases
export const FALLBACK_CASES = ${JSON.stringify(allDbCases, null, 2)};
`;
    fs.writeFileSync('src/data/fallbackCases.js', fallbackContent, 'utf-8');
    console.log('Successfully updated src/data/fallbackCases.js!');
  }
}

run().catch(console.error);

