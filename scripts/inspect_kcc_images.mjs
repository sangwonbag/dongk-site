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

async function checkKcc() {
  console.log('=== INSPECTING KCC PRODUCT IMAGES IN SUPABASE ===');

  const { data, error } = await supabase
    .from('products')
    .select('id, product_code, name, image_url, is_active, brands!inner(name)')
    .ilike('brands.name', '%KCC%')
    .limit(30);

  if (error) {
    console.error('Supabase error:', error);
    return;
  }

  console.log(`Found ${data.length} KCC products:`);
  for (const p of data) {
    console.log(`ID: ${p.id} | Code: '${p.product_code}' | Name: '${p.name}' | DB image_url: '${p.image_url}'`);
  }
}

checkKcc();
