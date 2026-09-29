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

// Dynamically import productResolver
const resolverPath = path.join(__dirname, '../src/utils/productImageResolver.js');

async function testResolver() {
  const { getProductImageCandidates } = await import(`file://${resolverPath}`);

  const targetCodes = ['TW 5119G', 'TW 5120G', 'B3192J', 'B3183J', 'B0122J', 'B0114J', 'TS5552P', 'TS5542P'];

  for (const code of targetCodes) {
    const { data } = await supabase
      .from('products')
      .select('*, brands!inner(name), categories!inner(name)')
      .ilike('product_code', `%${code}%`);

    if (data && data.length > 0) {
      const p = data[0];
      const matObj = {
        id: p.slug || String(p.id),
        code: p.product_code,
        name: p.name,
        brand: p.brands?.name || 'KCC',
        category: p.categories?.name || '데코타일',
        image_url: p.image_url,
        thumbnail: p.image_url
      };

      const candidates = getProductImageCandidates(matObj);
      console.log(`\nCode: '${code}'`);
      console.log(`DB image_url: '${p.image_url}'`);
      console.log(`Resolved Candidates (${candidates.length}):`);
      candidates.forEach((c, idx) => {
        const full = path.join(__dirname, '../public', c);
        const exists = fs.existsSync(full);
        console.log(`  [${idx + 1}] ${c} -> ${exists ? 'EXISTS (HTTP 200)' : 'MISSING (HTTP 404)'}`);
      });
    }
  }
}

testResolver();
