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

const targetCodes = ['TW 5119G', 'TW 5120G', 'B3192J', 'B3183J', 'B0122J', 'B0114J', 'TS5552P', 'TS5542P'];

async function checkSpecific() {
  console.log('=== INSPECTING SPECIFIC KCC PRODUCTS IN SUPABASE DB ===');

  for (const code of targetCodes) {
    const { data, error } = await supabase
      .from('products')
      .select('id, product_code, name, image_url, description, is_active, brands!inner(name)')
      .ilike('product_code', `%${code}%`);

    if (error) {
      console.error(`Error querying ${code}:`, error);
      continue;
    }

    if (data && data.length > 0) {
      for (const p of data) {
        console.log(`[FOUND] Code: '${p.product_code}' | ID: ${p.id} | Name: '${p.name}' | DB image_url: '${p.image_url}'`);
      }
    } else {
      console.log(`[NOT FOUND] Code: '${code}'`);
    }
  }
}

checkSpecific();
