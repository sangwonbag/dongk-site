import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = (SUPABASE_URL && SUPABASE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

import { materials as allLocal } from '../src/data/materials.db.js';

async function run() {
  console.log('=== KCC COMPREHENSIVE AUDIT SCRIPT ===');

  // 1. Scan public/ images
  const SOURCE_DIR = path.resolve(process.cwd(), 'public/images/Thumbnail_Image/materials');
  function collectFiles(dir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      if (file.toUpperCase().includes('MACOSX') || file.startsWith('._')) return;
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        results.push(...collectFiles(fullPath));
      } else {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) && file !== 'desktop.ini') {
          results.push(fullPath);
        }
      }
    });
    return results;
  }

  const allFiles = collectFiles(SOURCE_DIR);
  const kccFiles = allFiles.filter(f => f.includes('KCC') || f.includes('센스타일') || f.includes('센스레이'));
  console.log(`Total local material image files: ${allFiles.length}`);
  console.log(`Total KCC local image files: ${kccFiles.length}`);

  // 2. Load materials.db.js
  const localKccItems = allLocal.filter(item => 
    (item.brand && item.brand.toUpperCase() === 'KCC') ||
    (item.name && item.name.includes('KCC')) ||
    (item.id && String(item.id).toLowerCase().includes('kcc'))
  );
  console.log(`Total local materials in materials.db.js: ${allLocal.length}`);
  console.log(`Local KCC items in materials.db.js: ${localKccItems.length}`);

  // 3. Supabase products
  let supabaseKccItems = [];
  if (supabase) {
    // brand_id for KCC: let's query brands first
    const { data: brands } = await supabase.from('brands').select('*');
    const kccBrandIds = (brands || []).filter(b => (b.name || '').toUpperCase().includes('KCC')).map(b => b.id);
    console.log('KCC Brand IDs in Supabase:', kccBrandIds, brands?.filter(b => (b.name || '').toUpperCase().includes('KCC')));

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .in('brand_id', kccBrandIds);
    if (!error && products) {
      supabaseKccItems = products;
      console.log(`Supabase KCC products: ${supabaseKccItems.length}`);
    } else {
      console.error('Supabase fetch error:', error);
    }
  }

  // Let's summarize KCC products across both
  const productMap = new Map(); // key = code or id

  for (const item of localKccItems) {
    const code = (item.code || item.product_code || '').trim().toUpperCase();
    const id = item.id;
    const key = code || id;
    productMap.set(key, {
      source: 'local',
      localItem: item,
      supabaseItem: null,
      code,
      id,
      name: item.name || item.product_name,
      category: item.category,
      line: item.line || item.subLine,
      image_url: item.image_url || item.thumbnail || item.image
    });
  }

  for (const item of supabaseKccItems) {
    const code = (item.product_code || item.code || '').trim().toUpperCase();
    const id = String(item.id);
    const key = code || id;
    if (productMap.has(key)) {
      const existing = productMap.get(key);
      existing.supabaseItem = item;
      existing.source = 'both';
      if (!existing.image_url) existing.image_url = item.image_url;
    } else {
      productMap.set(key, {
        source: 'supabase',
        localItem: null,
        supabaseItem: item,
        code,
        id,
        name: item.product_name || item.name,
        category: item.category_id === 1 ? '데코타일' : '장판',
        line: item.line || '',
        image_url: item.image_url
      });
    }
  }

  console.log(`Total unique KCC products across local + Supabase: ${productMap.size}`);

  // Inspect the images of all products
  let countNormal = 0;
  let countFileExistsConnectedWrong = 0;
  let countPathError = 0;
  let countWrongProductImage = 0;
  let countOriginalMissing = 0;
  let countDuplicateMatching = 0;

  const missingList = [];
  const wrongMatchList = [];
  const pathErrorList = [];

  for (const [key, prod] of productMap.entries()) {
    const rawUrl = prod.image_url || '';
    const code = prod.code;
    
    // Check if image exists on disk or storage
    let diskExists = false;
    let resolvedDiskPath = '';

    if (rawUrl.startsWith('/images/')) {
      const absPath = path.resolve(process.cwd(), 'public' + decodeURIComponent(rawUrl));
      if (fs.existsSync(absPath)) {
        diskExists = true;
        resolvedDiskPath = absPath;
      }
    }

    // Check specific known errors
    if (rawUrl.endsWith('/.webp')) {
      pathErrorList.push({ code, name: prod.name, url: rawUrl, reason: 'Broken /.webp filename' });
      countPathError++;
      continue;
    }

    if (rawUrl.includes('%')) {
      pathErrorList.push({ code, name: prod.name, url: rawUrl, reason: 'Double URI encoded path' });
      countPathError++;
      continue;
    }

    // Check wrong product match (e.g. B0122J on other products)
    if (rawUrl.includes('B0122J') && code !== 'B0122J') {
      wrongMatchList.push({ code, name: prod.name, url: rawUrl, reason: 'Mismatched B0122J image' });
      countWrongProductImage++;
      continue;
    }

    // Check if there is an image on disk for this code
    const matchingDiskFiles = kccFiles.filter(f => {
      const bn = path.basename(f);
      const cleanBn = bn.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const cleanC = code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      return cleanC.length >= 4 && cleanBn.includes(cleanC);
    });

    if (!diskExists && (!rawUrl || rawUrl === '/images/no-image.svg')) {
      if (matchingDiskFiles.length > 0) {
        countFileExistsConnectedWrong++;
      } else {
        missingList.push({ code, name: prod.name, line: prod.line });
        countOriginalMissing++;
      }
      continue;
    }

    if (diskExists) {
      countNormal++;
    } else {
      // url given but not on disk
      countOriginalMissing++;
      missingList.push({ code, name: prod.name, line: prod.line, url: rawUrl, reason: 'File not found on disk' });
    }
  }

  console.log('\n--- AUDIT SUMMARY ---');
  console.log(`Normal images: ${countNormal}`);
  console.log(`Path errors: ${countPathError}`);
  console.log(`Wrong product matches: ${countWrongProductImage}`);
  console.log(`File exists but not connected: ${countFileExistsConnectedWrong}`);
  console.log(`Original image missing: ${countOriginalMissing}`);

  console.log('\nSample Path Errors:', pathErrorList.slice(0, 10));
  console.log('\nSample Wrong Matches:', wrongMatchList);
  console.log('\nSample Missing Originals:', missingList.slice(0, 10));
}

run().catch(console.error);
