require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { materials } = require('../src/data/generatedMaterials.js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE; // Admin key to bypass RLS and delete/insert

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  { id: 1, name: '데코타일', slug: 'decotile', sort_order: 1, is_active: true },
  { id: 2, name: '장판', slug: 'jangpan', sort_order: 2, is_active: true },
  { id: 3, name: '마루', slug: 'maru', sort_order: 3, is_active: true },
  { id: 4, name: '벽지', slug: 'wallpaper', sort_order: 4, is_active: true },
  { id: 5, name: '카페트타일', slug: 'carpet-tile', sort_order: 5, is_active: true },
  { id: 6, name: '러버타일', slug: 'rubber-tile', sort_order: 6, is_active: true }
];

const brands = [
  { id: 1, category_id: 1, name: 'KCC', slug: 'kcc', sort_order: 1, is_active: true },
  { id: 2, category_id: 1, name: 'LX', slug: 'lx', sort_order: 2, is_active: true },
  { id: 3, category_id: 1, name: '녹수', slug: 'noksu', sort_order: 3, is_active: true },
  { id: 4, category_id: 1, name: '대진', slug: 'daejin', sort_order: 4, is_active: true },
  { id: 5, category_id: 1, name: '동신', slug: 'dongshin', sort_order: 5, is_active: true },
  { id: 6, category_id: 1, name: '유성', slug: 'youseong', sort_order: 6, is_active: true },
  { id: 7, category_id: 1, name: '재영', slug: 'jaeyoung', sort_order: 7, is_active: true },
  { id: 8, category_id: 1, name: '현대', slug: 'hyundai', sort_order: 8, is_active: true },
  
  { id: 9, category_id: 2, name: 'LX하우시스', slug: 'lx-hausys', sort_order: 1, is_active: true },
  
  { id: 10, category_id: 3, name: '구정', slug: 'kujung', sort_order: 1, is_active: true },
  { id: 11, category_id: 3, name: '동화', slug: 'dongwha', sort_order: 2, is_active: true },
  { id: 12, category_id: 3, name: '이건', slug: 'eagon', sort_order: 3, is_active: true },
  
  { id: 13, category_id: 4, name: 'LX', slug: 'lx-wall', sort_order: 1, is_active: true },
  { id: 14, category_id: 4, name: '개나리', slug: 'gaenari', sort_order: 2, is_active: true },
  { id: 15, category_id: 4, name: '디아이디', slug: 'did', sort_order: 3, is_active: true },
  { id: 16, category_id: 4, name: '서울', slug: 'seoul', sort_order: 4, is_active: true },
  { id: 17, category_id: 4, name: '신한', slug: 'shinhan', sort_order: 5, is_active: true },
  
  { id: 18, category_id: 5, name: '스완', slug: 'swan', sort_order: 1, is_active: true },
  { id: 19, category_id: 5, name: '코오롱', slug: 'kolon', sort_order: 2, is_active: true },
  
  { id: 20, category_id: 6, name: '현대', slug: 'hyundai-rubber', sort_order: 1, is_active: true }
];

function parsePrice(priceVal) {
  if (typeof priceVal === 'number') return priceVal;
  if (!priceVal || typeof priceVal !== 'string') return 0;
  
  const cleanStr = priceVal.replace(/,/g, '');
  const multiDigitMatch = cleanStr.match(/\d{4,}/); // Match 4 or more digits (like 20000, 26000)
  if (multiDigitMatch) {
    return parseInt(multiDigitMatch[0], 10);
  }
  
  const anyMatch = cleanStr.match(/\d+/);
  return anyMatch ? parseInt(anyMatch[0], 10) : 0;
}

async function sync() {
  console.log("Starting Supabase database sync...");

  // 1. Delete all products
  console.log("Deleting existing products...");
  const { error: delProdErr } = await supabase.from('products').delete().gt('id', 0);
  if (delProdErr) {
    console.error("Error deleting products:", delProdErr);
    process.exit(1);
  }
  console.log("Successfully deleted all products.");

  // 2. Delete all brands
  console.log("Deleting existing brands...");
  const { error: delBrandErr } = await supabase.from('brands').delete().gt('id', 0);
  if (delBrandErr) {
    console.error("Error deleting brands:", delBrandErr);
    process.exit(1);
  }
  console.log("Successfully deleted all brands.");

  // 3. Delete all categories
  console.log("Deleting existing categories...");
  const { error: delCatErr } = await supabase.from('categories').delete().gt('id', 0);
  if (delCatErr) {
    console.error("Error deleting categories:", delCatErr);
    process.exit(1);
  }
  console.log("Successfully deleted all categories.");

  // 4. Insert categories
  console.log("Inserting categories...");
  const { error: insCatErr } = await supabase.from('categories').insert(categories);
  if (insCatErr) {
    console.error("Error inserting categories:", insCatErr);
    process.exit(1);
  }
  console.log("Successfully inserted categories.");

  // 5. Insert brands
  console.log("Inserting brands...");
  const { error: insBrandErr } = await supabase.from('brands').insert(brands);
  if (insBrandErr) {
    console.error("Error inserting brands:", insBrandErr);
    process.exit(1);
  }
  console.log("Successfully inserted brands.");

  // 6. Map and insert products in chunks
  console.log("Mapping products...");
  const seenSlugs = new Set();
  const seenCodes = new Set();
  const productsToInsert = materials.map(m => {
    const cat = categories.find(c => c.name === m.category);
    const br = brands.find(b => b.category_id === cat.id && b.name === m.brand);
    
    // Slug generation from unique ID with collision resolution
    const baseSlug = m.id
      .toLowerCase()
      .replace(/[^a-z0-9\-ㄱ-ㅎㅏ-ㅣ가-힣_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;
    while (seenSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    seenSlugs.add(slug);

    // Code collision resolution (to satisfy unique constraint on product_code)
    let code = m.code;
    if (code !== null && code !== undefined && code !== "") {
      let codeCounter = 1;
      if (seenCodes.has(code)) {
        const lineClean = (m.line || "").split('_').pop() || "";
        if (lineClean) {
          code = `${m.code} (${lineClean})`;
        }
        
        while (seenCodes.has(code)) {
          code = `${m.code} (${codeCounter})`;
          codeCounter++;
        }
      }
      seenCodes.add(code);
    } else {
      code = null;
    }

    return {
      category_id: cat.id,
      brand_id: br.id,
      name: m.name || "",
      slug: slug,
      product_code: code,
      thickness: m.thickness || m.specs?.thickness || null,
      size_text: m.specs?.size || null,
      unit: m.specs?.packing || null,
      price: parsePrice(m.price),
      description: m.line || null,
      image_url: m.thumbnail || null,
      is_active: m.active ?? true,
      is_featured: false
    };
  });

  const chunkSize = 200;
  console.log(`Inserting ${productsToInsert.length} products in chunks of ${chunkSize}...`);
  for (let i = 0; i < productsToInsert.length; i += chunkSize) {
    const chunk = productsToInsert.slice(i, i + chunkSize);
    const { error: insProdErr } = await supabase.from('products').insert(chunk);
    if (insProdErr) {
      console.error(`Error inserting product chunk at index ${i}:`, insProdErr);
      process.exit(1);
    }
    console.log(`Inserted chunk ${i} to ${Math.min(i + chunkSize, productsToInsert.length)}`);
  }

  console.log("🎉 Database synchronization completed successfully!");
}

sync();
