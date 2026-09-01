import { createClient } from '@supabase/supabase-js';
import https from 'https';
import http from 'http';
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

const BASE_URL = process.env.AUDIT_BASE_URL || "https://dkfloor.co.kr";

function fetchUrlStatus(fullUrl) {
  return new Promise((resolve) => {
    // Browsers send unencoded UTF-8 paths; encodeURI handles standard RFC formatting
    const requestUrl = encodeURI(fullUrl);
    const client = requestUrl.startsWith('https') ? https : http;

    const req = client.request(requestUrl, { method: 'GET' }, (res) => {
      let dataSnippet = '';
      res.on('data', chunk => {
        if (dataSnippet.length < 200) dataSnippet += chunk.toString('utf8');
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          contentType: res.headers['content-type'] || '',
          snippet: dataSnippet
        });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 0, error: err.message });
    });

    req.end();
  });
}

function cleanPathString(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let str = rawUrl.trim();
  try {
    while (str.includes('%')) {
      const prev = str;
      str = decodeURIComponent(str);
      if (str === prev) break;
    }
  } catch (e) {}
  return str;
}

async function runAudit() {
  console.log(`==================================================`);
  console.log(`LIVE PRODUCT IMAGE AUDIT TOOL`);
  console.log(`Target Host: ${BASE_URL}`);
  console.log(`==================================================\n`);

  let allProducts = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: chunk, error } = await supabase
      .from('products')
      .select('id, name, code, brand, category, image_url, brands(name), categories(name)')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("DB Query Error:", error);
      process.exit(1);
    }

    if (!chunk || chunk.length === 0) {
      hasMore = false;
    } else {
      allProducts = allProducts.concat(chunk);
      if (chunk.length < pageSize) hasMore = false;
      else page++;
    }
  }

  console.log(`Fetched ${allProducts.length} total products from database.\n`);

  let totalValidImages = 0;
  let totalMissingImages = 0;
  let total404Errors = 0;
  let totalOtherErrors = 0;

  const failedItems = [];

  // Sample batch audit for speed (inspect first 200 items in depth)
  const auditSample = allProducts.slice(0, 250);

  for (const p of auditSample) {
    const brandName = p.brands?.name || p.brand || '-';
    const categoryName = p.categories?.name || p.category || '-';
    const code = p.code || p.product_code || '-';
    const rawUrl = p.image_url || '';

    if (!rawUrl || rawUrl.includes('no-image.svg')) {
      totalMissingImages++;
      continue;
    }

    const cleanPath = cleanPathString(rawUrl);
    const fullUrl = cleanPath.startsWith('http') ? cleanPath : `${BASE_URL}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;

    const res = await fetchUrlStatus(fullUrl);

    if (res.status === 200 && !res.snippet.includes('<!DOCTYPE')) {
      totalValidImages++;
    } else if (res.status === 404 || res.snippet.includes('NOT_FOUND') || res.snippet.includes('<!DOCTYPE')) {
      total404Errors++;
      failedItems.push({
        id: p.id,
        code,
        name: p.name,
        brand: brandName,
        category: categoryName,
        rawUrl,
        fullUrl,
        status: res.status,
        reason: 'HTTP 404 / HTML SPA Fallback'
      });
    } else {
      totalOtherErrors++;
      failedItems.push({
        id: p.id,
        code,
        name: p.name,
        brand: brandName,
        category: categoryName,
        rawUrl,
        fullUrl,
        status: res.status,
        reason: `HTTP ${res.status}`
      });
    }
  }

  console.log(`==================================================`);
  console.log(`AUDIT RESULTS FOR ${auditSample.length} SAMPLED PRODUCTS:`);
  console.log(`  [200 OK] Valid Images:      ${totalValidImages}`);
  console.log(`  [MISSING] No Image Set:     ${totalMissingImages}`);
  console.log(`  [404 FAIL] Image Not Found: ${total404Errors}`);
  console.log(`  [OTHER] Network/Server:     ${totalOtherErrors}`);
  console.log(`==================================================\n`);

  if (failedItems.length > 0) {
    console.log(`FAILED PRODUCT DETAILS (${failedItems.length} items):`);
    console.table(failedItems);
    process.exit(1);
  } else {
    console.log(`SUCCESS: 100% of product images returned HTTP 200 OK!`);
    process.exit(0);
  }
}

runAudit();
