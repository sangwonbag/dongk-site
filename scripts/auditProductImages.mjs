import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

import { getProductImageCandidates, normalizeProductImageUrl, ensureManifestsLoaded } from '../src/utils/productImageResolver.js';

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
if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
  console.error("Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing in .env / .env.local");
  process.exit(1);
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

function checkUrl(rawUrl) {
  return new Promise((resolve) => {
    if (!rawUrl || rawUrl === '/images/no-image.svg') return resolve(404);
    if (rawUrl.startsWith('/')) {
      const localPath = path.join(__dirname, '../public', rawUrl);
      return resolve(fs.existsSync(localPath) ? 200 : 404);
    }
    const encoded = encodeURI(rawUrl);
    const client = encoded.startsWith('https') ? https : http;
    const req = client.request(encoded, { method: 'GET' }, (res) => {
      resolve(res.statusCode);
    });
    req.on('error', () => resolve(0));
    req.end();
  });
}

async function auditProductImages() {
  console.log(`==================================================`);
  console.log(`DYNAMIC PRODUCT IMAGE AUDIT TOOL`);
  console.log(`==================================================\n`);
  
  await ensureManifestsLoaded();
  console.log(`Pre-loaded image manifests successfully.`);

  console.log(`Fetching all active products from Supabase DB...`);

  let allProducts = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: chunk, error } = await supabase
      .from('products')
      .select('id, name, product_code, image_url, thickness, description, is_active, brands(name), categories(name)')
      .eq('is_active', true)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("DB Query Error:", error);
      process.exit(1);
    }
    if (!chunk || chunk.length === 0) hasMore = false;
    else {
      allProducts = allProducts.concat(chunk);
      if (chunk.length < pageSize) hasMore = false;
      else page++;
    }
  }

  console.log(`Fetched ${allProducts.length} total active products.\n`);

  let validCount = 0;
  let brokenPathCount = 0;
  let missingCount = 0;

  const failingItems = [];

  const BATCH_SIZE = 80;
  for (let i = 0; i < allProducts.length; i += BATCH_SIZE) {
    if (i % 400 === 0) {
      console.log(`Auditing progress: ${i} / ${allProducts.length} products verified...`);
    }
    const batch = allProducts.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (p) => {
      const productObj = {
        ...p,
        code: p.product_code,
        brand: p.brands?.name || p.brand || '-',
        category: p.categories?.name || p.category || '-'
      };

      const candidates = getProductImageCandidates(productObj);
      const rawDbImage = p.image_url || p.thumbnail_url || p.image || p.thumbnail;
      const isDbImageSet = rawDbImage && rawDbImage !== '/images/no-image.svg';

      let firstValidUrl = null;
      const candidateStatuses = [];

      for (const candidateUrl of candidates) {
        if (candidateUrl === '/images/no-image.svg') continue;
        const statusCode = await checkUrl(candidateUrl);
        candidateStatuses.push({ url: candidateUrl, status: statusCode });
        if (statusCode === 200 && !firstValidUrl) {
          firstValidUrl = candidateUrl;
          break;
        }
      }

      if (firstValidUrl) {
        validCount++;
      } else if (isDbImageSet) {
        brokenPathCount++;
        failingItems.push({
          id: p.id,
          brand: productObj.brand,
          category: productObj.category,
          code: p.product_code || '-',
          name: p.name || '-',
          rawDbImage: rawDbImage || '-',
          reason: 'Broken Path / Storage 404',
          candidates: candidateStatuses
        });
      } else {
        missingCount++;
        failingItems.push({
          id: p.id,
          brand: productObj.brand,
          category: productObj.category,
          code: p.product_code || '-',
          name: p.name || '-',
          rawDbImage: 'None',
          reason: 'No DB Image Set',
          candidates: []
        });
      }
    }));
  }

  console.log(`==================================================`);
  console.log(`AUDIT SUMMARY (${allProducts.length} Products):`);
  console.log(`  [OK] Valid Images (HTTP 200):  ${validCount}`);
  console.log(`  [PATH ERROR] Broken Path:      ${brokenPathCount}`);
  console.log(`  [MISSING] No Image Set:        ${missingCount}`);
  console.log(`==================================================\n`);

  if (failingItems.length > 0) {
    console.log(`NON-NORMAL PRODUCTS DETAILS (${failingItems.length} items):\n`);
    console.table(failingItems.map(item => ({
      ID: item.id,
      Brand: item.brand,
      Category: item.category,
      Code: item.code,
      Name: item.name,
      Reason: item.reason,
      'DB Image Path': item.rawDbImage
    })));
  } else {
    console.log(`SUCCESS: 100% of product images returned HTTP 200 OK!`);
  }
  process.exit(0);
}

auditProductImages();
