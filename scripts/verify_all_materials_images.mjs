import fs from 'fs';
import path from 'path';
import { materials } from '../src/data/materials.db.js';
import { dongshinPolymer2026 } from '../src/data/dongshinPolymer2026.js';
import {
  getProductImageUrl,
  getAllProductImages,
  getProductImageCandidates,
  classifyProductImage,
  IMAGE_PRIORITY
} from '../src/utils/productImageResolver.js';

console.log('=== STARTING COMPREHENSIVE ALL-MATERIALS IMAGE VERIFICATION ===\n');

// 1. Gather all products from materials.db.js + dongshinPolymer2026
const allProductsMap = new Map();

for (const m of materials) {
  const key = m.id || `${m.brand}_${m.category}_${m.code || m.name}`;
  if (!allProductsMap.has(key)) {
    allProductsMap.set(key, m);
  }
}

for (const d of dongshinPolymer2026) {
  const key = d.id || `dongshin_${d.code}`;
  if (!allProductsMap.has(key)) {
    allProductsMap.set(key, d);
  }
}

const allProducts = Array.from(allProductsMap.values());
console.log(`Total unique products to audit: ${allProducts.length}`);

// 2. Metric counters
let totalAuditedProducts = allProducts.length;
let totalAuditedImages = 0;
let perfectlyMatchedProducts = 0;
let missingImageProducts = [];
let orderViolations = [];
let crossLineupMismatches = [];
let duplicateDetected = [];
let productsWithMultipleImages = 0;
let productsWithSingleImage = 0;

const categoryStats = {};
const brandStats = {};

// 3. Scan physical files to verify local file existence
const publicDir = path.resolve('public');
const physicalFilesSet = new Set();

function walkDir(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      walkDir(full);
    } else {
      const rel = '/' + path.relative(publicDir, full).replace(/\\/g, '/');
      physicalFilesSet.add(rel);
      physicalFilesSet.add(decodeURIComponent(rel));
      physicalFilesSet.add(encodeURI(rel));
    }
  }
}
walkDir(path.join(publicDir, 'images'));
console.log(`Indexed ${physicalFilesSet.size} local physical image paths.`);

// 4. Audit each product
for (const p of allProducts) {
  const cat = p.category || '기타';
  const brand = p.brand || '기타';

  categoryStats[cat] = (categoryStats[cat] || 0) + 1;
  brandStats[brand] = (brandStats[brand] || 0) + 1;

  const rawCode = p.code || p.product_code || p.id || '';
  const cleanCode = String(rawCode).replace(/[^a-zA-Z0-9가-힣]/g, '').toUpperCase();

  // Test primary cover image
  const primaryImg = getProductImageUrl(p);

  // Test all gallery images
  const allImgs = getAllProductImages(p);
  totalAuditedImages += allImgs.length;

  if (allImgs.length === 0 || (allImgs.length === 1 && allImgs[0] === '/images/no-image.svg')) {
    missingImageProducts.push({
      category: cat,
      brand,
      code: p.code || p.product_code || p.id,
      name: p.name || p.product_name
    });
    continue;
  }

  // Check deduplication
  const seenUrls = new Set();
  let hasDup = false;
  for (const u of allImgs) {
    const cleanUrl = u.split('?')[0].trim();
    if (seenUrls.has(cleanUrl)) {
      hasDup = true;
      duplicateDetected.push({ code: p.code, url: cleanUrl });
    }
    seenUrls.add(cleanUrl);
  }

  // Check sequence order: ① 자재 원본 (0) -> ② 2x2 (1) -> ③ 90cross (2) -> ④ 사무실 (3)
  const priorities = allImgs.map(u => {
    const t = classifyProductImage(u, cleanCode);
    return IMAGE_PRIORITY[t] !== undefined ? IMAGE_PRIORITY[t] : 99;
  });

  // Verify non-descending priority order
  let orderOk = true;
  for (let i = 0; i < priorities.length - 1; i++) {
    if (priorities[i] > priorities[i + 1]) {
      orderOk = false;
      orderViolations.push({
        code: p.code,
        name: p.name,
        images: allImgs,
        priorities
      });
      break;
    }
  }

  // Verify primary image is rank 0 (material swatch) whenever available
  const hasMaterialSwatch = priorities.includes(0);
  if (hasMaterialSwatch && priorities[0] !== 0) {
    orderOk = false;
    orderViolations.push({
      code: p.code,
      issue: 'Primary image is not material swatch',
      primary: allImgs[0],
      priorities
    });
  }

  // Check physical file existence for local paths
  for (const imgUrl of allImgs) {
    if (imgUrl.startsWith('/images/')) {
      const clean = imgUrl.split('?')[0];
      if (!physicalFilesSet.has(clean) && !physicalFilesSet.has(decodeURIComponent(clean))) {
        // Missing physical file
        crossLineupMismatches.push({
          code: p.code,
          missingFile: clean
        });
      }
    }
  }

  if (orderOk && !hasDup) {
    perfectlyMatchedProducts++;
    if (allImgs.length > 1) {
      productsWithMultipleImages++;
    } else {
      productsWithSingleImage++;
    }
  }
}

console.log('=== AUDIT SUMMARY RESULTS ===\n');
console.log(`Total Products Audited: ${totalAuditedProducts}`);
console.log(`Total Images Evaluated: ${totalAuditedImages}`);
console.log(`Perfectly Matched Products: ${perfectlyMatchedProducts}`);
console.log(`Products with Multi-image Sequences: ${productsWithMultipleImages}`);
console.log(`Products with Single Valid Image: ${productsWithSingleImage}`);
console.log(`Products Missing Images: ${missingImageProducts.length}`);
console.log(`Duplicate Images Detected: ${duplicateDetected.length}`);
console.log(`Order Violations: ${orderViolations.length}`);
console.log(`Missing Local Physical Files: ${crossLineupMismatches.length}\n`);

console.log('--- Breakdown by Category ---');
console.table(categoryStats);

console.log('\n--- Breakdown by Brand ---');
console.table(brandStats);

// Sample Multi-Image Sequences to inspect
console.log('\n--- Sample Multi-Image Products and Exact Sequences ---');
const sampleCodes = ['TS5502P', 'TS5503P', 'TS5508P', 'TS5510P', 'TS5543P', 'TS5547P', 'TW5102G', 'TW5104G', 'MTS4421', 'NJ27-4202', 'NR32-4368'];
for (const sc of sampleCodes) {
  const p = allProducts.find(x => String(x.code).toUpperCase().includes(sc));
  if (p) {
    const imgs = getAllProductImages(p);
    console.log(`\n[Product ${p.code} (${p.brand} ${p.category})]`);
    imgs.forEach((img, idx) => {
      const t = classifyProductImage(img, p.code);
      console.log(`  ${idx + 1}. [${t.toUpperCase()} (rank ${IMAGE_PRIORITY[t]})] ${img}`);
    });
  }
}

// Write detailed report file
const reportData = {
  totalAuditedProducts,
  totalAuditedImages,
  perfectlyMatchedProducts,
  productsWithMultipleImages,
  productsWithSingleImage,
  missingImageCount: missingImageProducts.length,
  missingImageProducts: missingImageProducts.slice(0, 100),
  orderViolationsCount: orderViolations.length,
  duplicateDetectedCount: duplicateDetected.length,
  missingPhysicalFilesCount: crossLineupMismatches.length
};

fs.writeFileSync('scratch/audit_report_summary.json', JSON.stringify(reportData, null, 2), 'utf8');
console.log('\nReport summary saved to scratch/audit_report_summary.json');
