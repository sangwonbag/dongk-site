import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getEnvVars() {
  const env = {};
  const paths = [path.join(__dirname, '../.env.local'), path.join(__dirname, '../.env')];
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

function cleanUrlString(str) {
  if (!str || typeof str !== 'string') return str;
  let cleaned = str.trim();
  try {
    while (cleaned.includes('%')) {
      const prev = cleaned;
      cleaned = decodeURIComponent(cleaned);
      if (cleaned === prev) break;
    }
  } catch (e) {
    // Keep as is if decoding fails
  }
  return cleaned;
}

async function cleanDatabase() {
  console.log("=== SCANNING & CLEANING SUPABASE PRODUCTS TABLE IMAGE URLS ===");

  const { data: products, error } = await supabase
    .from('products')
    .select('id, image_url');

  if (error) {
    console.error("DB Query Error:", error);
    process.exit(1);
  }

  console.log(`Fetched ${products.length} products from Supabase.`);

  let updateCount = 0;

  for (const p of products) {
    const updates = {};
    if (p.image_url) {
      const cleaned = cleanUrlString(p.image_url);
      if (cleaned !== p.image_url) updates.image_url = cleaned;
    }

    if (Object.keys(updates).length > 0) {
      updateCount++;
      const { error: updateErr } = await supabase
        .from('products')
        .update(updates)
        .eq('id', p.id);

      if (updateErr) {
        console.error(`Failed to update product ID ${p.id}:`, updateErr);
      } else {
        console.log(`[UPDATED ID ${p.id}] Old: ${p.image_url} -> New: ${updates.image_url}`);
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`SUPABASE DB CLEANING COMPLETE: Updated ${updateCount} product rows.`);
  console.log(`========================================`);
}

cleanDatabase();
