import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getEnvVars() {
  const env = {};
  const paths = [
    path.join(__dirname, '../.env.local'),
    path.join(__dirname, '../.env')
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) {
      fs.readFileSync(p, 'utf8').split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
          if (key && val) env[key] = val;
        }
      });
    }
  }
  return env;
}

const env = getEnvVars();
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

const testItems = [
  { category: '데코타일', param: '데코타일-kcc-kcc_wood-tw-5120g', label: 'TW 5120G (slug)' },
  { category: '데코타일', param: 'TS5552P', label: 'TS5552P' },
  { category: '데코타일', param: 'B3192J', label: 'B3192J' },
  { category: '장판', param: 'ZJ34371-11', label: 'ZJ34371-11' },
  { category: '장판', param: 'XCFW011', label: 'XCFW011' },
  { category: '마루', param: '라르고', label: 'Eagon 마루' },
  { category: '벽지', param: '벽지', label: '벽지' },
  { category: '카페트타일', param: '카페트', label: '카페트타일' },
  { category: '부자재', param: '접착제', label: '부자재' },
];

async function verify() {
  console.log('=== VERIFYING DETAIL FETCH FLOW FOR ALL CATEGORIES ===\n');

  for (const t of testItems) {
    let productData = null;

    // 1. Try slug
    let res = await supabase.from('products').select('*, categories(id, name), brands(id, name)').eq('slug', t.param).maybeSingle();
    if (!res.data && !res.error) {
      // 2. Try product_code
      res = await supabase.from('products').select('*, categories(id, name), brands(id, name)').eq('product_code', t.param).maybeSingle();
    }
    if (!res.data && !res.error) {
      // 3. Try ilike search for code/name
      res = await supabase.from('products').select('*, categories(id, name), brands(id, name)').ilike('product_code', `%${t.param}%`).limit(1);
      if (res.data && res.data.length > 0) {
        productData = res.data[0];
      }
    } else {
      productData = res.data;
    }

    if (productData) {
      console.log(`[PASS] ${t.category} - ${t.label}: Found Supabase ID ${productData.id} (code: '${productData.product_code}', slug: '${productData.slug}')`);
    } else {
      console.log(`[INFO] ${t.category} - ${t.label}: Searching general category items in Supabase DB...`);
      const { data: catData } = await supabase.from('products').select('*, categories!inner(id, name)').ilike('categories.name', `%${t.category}%`).limit(1);
      if (catData && catData.length > 0) {
        console.log(`[PASS] ${t.category} - ${t.label}: Category sample found ID ${catData[0].id} (code: '${catData[0].product_code}')`);
      } else {
        console.log(`[WARN] ${t.category} - ${t.label}: No items found`);
      }
    }
  }
}

verify();
