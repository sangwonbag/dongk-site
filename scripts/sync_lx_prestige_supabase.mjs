// scripts/sync_lx_prestige_supabase.mjs
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { LX_PRESTIGE_14 } from '../src/data/lxPrestige14.js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // 1. Backup existing LX Decotile rows before inserting
  const { data: existingLx, error: backupErr } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', 1)
    .eq('brand_id', 2);

  if (backupErr) throw backupErr;

  const backupDir = path.resolve('scratch');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `lx_decotile_backup_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(existingLx, null, 2), 'utf8');
  console.log(`✓ Backed up ${existingLx.length} existing LX decotile rows to ${backupPath}`);

  // 2. Check existing codes & slugs to prevent duplicates
  const existingCodes = new Set(existingLx.map(r => String(r.product_code || '').toUpperCase()));
  const existingSlugs = new Set(existingLx.map(r => String(r.slug || '').toLowerCase()));

  // Get max ID to allocate safely if table doesn't auto-assign or needs explicit id
  const { data: maxRow, error: maxErr } = await supabase
    .from('products')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();
  if (maxErr) throw maxErr;
  let nextId = (maxRow?.id || 106100) + 1;

  const toInsert = [];
  for (let i = 0; i < LX_PRESTIGE_14.length; i++) {
    const p = LX_PRESTIGE_14[i];
    if (existingCodes.has(p.code.toUpperCase()) || existingSlugs.has(p.slug.toLowerCase())) {
      console.log(`Skipping existing code in Supabase: ${p.code}`);
      continue;
    }
    toInsert.push({
      id: nextId++,
      category_id: 1,
      brand_id: 2,
      name: p.product_name,
      slug: p.slug,
      product_code: p.code,
      thickness: p.thickness,
      size_text: p.size,
      unit: p.package,
      price: 0,
      sale_price: 0,
      description: p.hasEir ? '프레스티지 5T (PRESTG) · 동조엠보(EIR)' : '프레스티지 5T (PRESTG)',
      image_url: p.thumbnail,
      is_active: true,
      is_featured: false,
      sort_order: i + 1
    });
  }

  if (toInsert.length > 0) {
    const { data: inserted, error: insertErr } = await supabase
      .from('products')
      .insert(toInsert)
      .select('id, product_code, name');
    if (insertErr) throw insertErr;
    console.log(`✓ Inserted ${inserted.length} LX Prestige 5T products into Supabase!`);
  } else {
    console.log('✓ All 14 LX Prestige 5T products already exist in Supabase.');
  }

  // 3. Verify final count in Supabase
  const { data: verified, error: verErr } = await supabase
    .from('products')
    .select('id, product_code, name, price, image_url, thickness, size_text, unit')
    .eq('category_id', 1)
    .eq('brand_id', 2)
    .or('product_code.ilike.PTT%,product_code.ilike.PTW%');
  if (verErr) throw verErr;

  console.log(`Verified in Supabase: ${verified.length} Prestige 5T products`);
  verified.forEach(r => {
    console.log(` - [${r.id}] ${r.product_code} | ${r.thickness} | ${r.size_text} | ${r.unit} | price=${r.price} | img=${r.image_url}`);
  });
}

main().catch(err => {
  console.error('Supabase sync failed:', err);
  process.exit(1);
});

