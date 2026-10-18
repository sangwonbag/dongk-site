const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runEnrichment() {
  console.log("=== [1/4] Enriching LX 베스띠 Wallpapers in Supabase ===");
  // Update description from '실크_LX_베스트' to '실크_LX_베스띠 (베스트)' and brand: 'LX', category: '벽지'
  const { data: bestiList, error: bestiErr } = await supabase
    .from('products')
    .select('id, description')
    .eq('description', '실크_LX_베스트');

  if (bestiErr) {
    console.error("Error fetching 베스트 products:", bestiErr);
  } else if (bestiList && bestiList.length > 0) {
    console.log(`Found ${bestiList.length} products to update from '실크_LX_베스트' to '실크_LX_베스띠 (베스트)'`);
    const ids = bestiList.map(p => p.id);
    const { error: updErr } = await supabase
      .from('products')
      .update({
        description: '실크_LX_베스띠 (베스트)',
        brand: 'LX',
        category: '벽지'
      })
      .in('id', ids);

    if (updErr) {
      console.error("Error updating 베스띠 products:", updErr);
    } else {
      console.log(`Successfully updated ${ids.length} products to '실크_LX_베스띠 (베스트)'`);
    }
  } else {
    console.log("No products with description '실크_LX_베스트' found (already updated).");
  }

  console.log("\n=== [2/4] Setting brand & category for LX 디아망 & 테라피 ===");
  const { data: diamantList } = await supabase
    .from('products')
    .select('id')
    .or('description.ilike.%디아망%,slug.ilike.%디아망%')
    .is('brand', null);

  if (diamantList && diamantList.length > 0) {
    const ids = diamantList.map(p => p.id);
    await supabase.from('products').update({ brand: 'LX', category: '벽지' }).in('id', ids);
    console.log(`Updated brand='LX', category='벽지' on ${ids.length} 디아망 products`);
  }

  const { data: therapyList } = await supabase
    .from('products')
    .select('id')
    .or('description.ilike.%테라피%,slug.ilike.%테라피%')
    .is('brand', null);

  if (therapyList && therapyList.length > 0) {
    const ids = therapyList.map(p => p.id);
    await supabase.from('products').update({ brand: 'LX', category: '벽지' }).in('id', ids);
    console.log(`Updated brand='LX', category='벽지' on ${ids.length} 테라피 products`);
  }

  console.log("\n=== [3/4] Enriching KCC Decotile Lineups ===");
  // For TS/TW products (센스타일 트랜디) where description is KCC_square or KCC_wood
  const { data: trendyList } = await supabase
    .from('products')
    .select('id, product_code, description')
    .eq('brand_id', 1) // KCC
    .eq('category_id', 1) // 데코타일
    .or('product_code.ilike.TS%,product_code.ilike.TW%');

  if (trendyList && trendyList.length > 0) {
    const trendyIds = [];
    for (const p of trendyList) {
      if (!p.description || !p.description.includes('센스타일')) {
        trendyIds.push(p.id);
      }
    }
    if (trendyIds.length > 0) {
      await supabase.from('products').update({
        brand: 'KCC',
        category: '데코타일',
        description: 'KCC 센스타일 트랜디'
      }).in('id', trendyIds);
      console.log(`Enriched ${trendyIds.length} KCC 센스타일 트랜디 products`);
    }
  }

  // For 5-digit or GW/GS products (센스타일 프로)
  const { data: proList } = await supabase
    .from('products')
    .select('id, product_code, description')
    .eq('brand_id', 1)
    .eq('category_id', 1)
    .or('product_code.ilike.GW%,product_code.ilike.GS%');

  if (proList && proList.length > 0) {
    const proIds = proList.filter(p => !p.description || !p.description.includes('센스타일')).map(p => p.id);
    if (proIds.length > 0) {
      await supabase.from('products').update({
        brand: 'KCC',
        category: '데코타일',
        description: 'KCC 센스타일 프로'
      }).in('id', proIds);
      console.log(`Enriched ${proIds.length} KCC 센스타일 프로 products`);
    }
  }

  console.log("\n=== [4/4] Populating empty product names from product_code ===");
  const { data: emptyNameList, error: emptyErr } = await supabase
    .from('products')
    .select('id, product_code')
    .eq('name', '')
    .limit(1000);

  if (emptyNameList && emptyNameList.length > 0) {
    console.log(`Found ${emptyNameList.length} products with empty name. Updating name = product_code in batches...`);
    let count = 0;
    // Update each in batches
    for (let i = 0; i < emptyNameList.length; i += 50) {
      const batch = emptyNameList.slice(i, i + 50);
      await Promise.all(batch.map(p => {
        const fallbackName = p.product_code || String(p.id);
        return supabase.from('products').update({ name: fallbackName }).eq('id', p.id);
      }));
      count += batch.length;
    }
    console.log(`Successfully updated ${count} products with empty names!`);
  } else {
    console.log("No empty names found.");
  }

  console.log("\n=== Metadata enrichment completed successfully! ===");
}

runEnrichment().catch(console.error);
