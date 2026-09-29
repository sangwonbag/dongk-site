import fs from 'fs';
import { getProductImageCandidates } from '../src/utils/productImageResolver.js';

const officialCatalog = [
  // 600각 (7종)
  { code: 'TS 5535M', pattern: '어반 콘크리트', shape: '600각', spec: '3.0T × 600 × 600mm', packing: '9pcs/box', area: '3.24㎡' },
  { code: 'TS 5536M', pattern: '어반 콘크리트', shape: '600각', spec: '3.0T × 600 × 600mm', packing: '9pcs/box', area: '3.24㎡' },
  { code: 'TS 5537M', pattern: '어반 콘크리트', shape: '600각', spec: '3.0T × 600 × 600mm', packing: '9pcs/box', area: '3.24㎡' },
  { code: 'TS 5532M', pattern: '파라디소', shape: '600각', spec: '3.0T × 600 × 600mm', packing: '9pcs/box', area: '3.24㎡' },
  { code: 'TS 5533M', pattern: '파라디소', shape: '600각', spec: '3.0T × 600 × 600mm', packing: '9pcs/box', area: '3.24㎡' },
  { code: 'TS 5534M', pattern: '파라디소', shape: '600각', spec: '3.0T × 600 × 600mm', packing: '9pcs/box', area: '3.24㎡' },
  { code: 'TS 5531M', pattern: '오닉스', shape: '600각', spec: '3.0T × 600 × 600mm', packing: '9pcs/box', area: '3.24㎡' },

  // 450각 (20종)
  { code: 'TS 5541P', pattern: '슬레이트', shape: '450각', spec: '3.0T × 457.2 × 457.2mm', packing: '16pcs/box', area: '3.34㎡' },
  { code: 'TS 5542P', pattern: '슬레이트', shape: '450각', spec: '3.0T × 457.2 × 457.2mm', packing: '16pcs/box', area: '3.34㎡' },
  { code: 'TS 5543P', pattern: '슬레이트', shape: '450각', spec: '3.0T × 457.2 × 457.2mm', packing: '16pcs/box', area: '3.34㎡' },
  { code: 'TS 5544P', pattern: '슬레이트', shape: '450각', spec: '3.0T × 457.2 × 457.2mm', packing: '16pcs/box', area: '3.34㎡' },
  { code: 'TS 5545P', pattern: '테라죠', shape: '450각', spec: '3.0T × 457.2 × 457.2mm', packing: '16pcs/box', area: '3.34㎡' },
  { code: 'TS 5546P', pattern: '테라죠', shape: '450각', spec: '3.0T × 457.2 × 457.2mm', packing: '16pcs/box', area: '3.34㎡' },
  { code: 'TS 5548P', pattern: '샌드스톤', shape: '450각', spec: '3.0T × 457.2 × 457.2mm', packing: '16pcs/box', area: '3.34㎡' },
  { code: 'TS 5549P', pattern: '샌드스톤', shape: '450각', spec: '3.0T × 457.2 × 457.2mm', packing: '16pcs/box', area: '3.34㎡' },
  { code: 'TS 5547P', pattern: '비앙코', shape: '450각', spec: '3.0T × 457.2 × 457.2mm', packing: '16pcs/box', area: '3.34㎡' },
  { code: 'TS 5516P', pattern: '마블', shape: '450각', spec: '3.0T × 457.2 × 457.2mm', packing: '16pcs/box', area: '3.34㎡' },
  { code: 'TS 5518P', pattern: '콘크리트', shape: '450각', spec: '3.0T × 457.2 × 457.2mm', packing: '16pcs/box', area: '3.34㎡' },
  { code: 'TS 5519P', pattern: '콘크리트', shape: '450각', spec: '3.0T × 457.2 × 457.2mm', packing: '16pcs/box', area: '3.34㎡' },
  { code: 'TS 5550P', pattern: '콘크리트', shape: '450각', spec: '3.0T × 457.2 × 457.2mm', packing: '16pcs/box', area: '3.34㎡' },
  { code: 'TS 5508P', pattern: '브러쉬 카펫', shape: '450각', spec: '3.0T × 457.2 × 457.2mm', packing: '16pcs/box', area: '3.34㎡', crossInstallation: true },
  { code: 'TS 5551P', pattern: '베이직 카펫', shape: '450각', spec: '3.0T × 457.2 × 457.2mm', packing: '16pcs/box', area: '3.34㎡' },
  { code: 'TS 5552P', pattern: '베이직 카펫', shape: '450각', spec: '3.0T × 457.2 × 457.2mm', packing: '16pcs/box', area: '3.34㎡' },
  { code: 'TS 5510P', pattern: '카펫', shape: '450각', spec: '3.0T × 457.2 × 457.2mm', packing: '16pcs/box', area: '3.34㎡' },
  { code: 'TS 5511P', pattern: '카펫', shape: '450각', spec: '3.0T × 457.2 × 457.2mm', packing: '16pcs/box', area: '3.34㎡' },
  { code: 'TS 5502P', pattern: '우븐', shape: '450각', spec: '3.0T × 457.2 × 457.2mm', packing: '16pcs/box', area: '3.34㎡', crossInstallation: true },
  { code: 'TS 5503P', pattern: '우븐', shape: '450각', spec: '3.0T × 457.2 × 457.2mm', packing: '16pcs/box', area: '3.34㎡', crossInstallation: true },

  // 우드 (13종)
  { code: 'TW 5102G', pattern: '파인', shape: '우드', spec: '3.0T × 184 × 950mm', packing: '19pcs/box', area: '3.32㎡' },
  { code: 'TW 5103G', pattern: '워시 오크', shape: '우드', spec: '3.0T × 184 × 950mm', packing: '19pcs/box', area: '3.32㎡' },
  { code: 'TW 5104G', pattern: '오크', shape: '우드', spec: '3.0T × 184 × 950mm', packing: '19pcs/box', area: '3.32㎡' },
  { code: 'TW 5105G', pattern: '오크', shape: '우드', spec: '3.0T × 184 × 950mm', packing: '19pcs/box', area: '3.32㎡' },
  { code: 'TW 5106G', pattern: '엘름', shape: '우드', spec: '3.0T × 184 × 950mm', packing: '19pcs/box', area: '3.32㎡' },
  { code: 'TW 5107G', pattern: '오크', shape: '우드', spec: '3.0T × 184 × 950mm', packing: '19pcs/box', area: '3.32㎡' },
  { code: 'TW 5108G', pattern: '오크', shape: '우드', spec: '3.0T × 184 × 950mm', packing: '19pcs/box', area: '3.32㎡' },
  { code: 'TW 5109G', pattern: '메이플', shape: '우드', spec: '3.0T × 184 × 950mm', packing: '19pcs/box', area: '3.32㎡' },
  { code: 'TW 5110G', pattern: '오크', shape: '우드', spec: '3.0T × 184 × 950mm', packing: '19pcs/box', area: '3.32㎡' },
  { code: 'TW 5111G', pattern: '워시 오크', shape: '우드', spec: '3.0T × 184 × 950mm', packing: '19pcs/box', area: '3.32㎡' },
  { code: 'TW 5112G', pattern: '오크', shape: '우드', spec: '3.0T × 184 × 950mm', packing: '19pcs/box', area: '3.32㎡' },
  { code: 'TW 5119G', pattern: '오크', shape: '우드', spec: '3.0T × 184 × 950mm', packing: '19pcs/box', area: '3.32㎡' },
  { code: 'TW 5120G', pattern: '오크', shape: '우드', spec: '3.0T × 184 × 950mm', packing: '19pcs/box', area: '3.32㎡' }
];

async function runVerification() {
  console.log('==================================================');
  console.log('KCC SENSE TILE TRENDY CALIBRATION VERIFICATION');
  console.log('==================================================');

  const mod = await import('../src/data/materials.db.js');
  const materials = mod.materials || mod.default;

  const normCode = (c) => String(c || '').replace(/\s+/g, '').toUpperCase();
  const dbTrendyMap = new Map();
  materials.forEach(m => {
    if (m.brand === 'KCC' && m.category === '데코타일' && m.line === '센스타일 트랜디') {
      dbTrendyMap.set(normCode(m.code), m);
    }
  });

  console.log(`\n1. Product Count Verification:`);
  console.log(`- Expected total: 40`);
  console.log(`- Actual total in materials.db.js: ${dbTrendyMap.size}`);

  if (dbTrendyMap.size !== 40) {
    console.error(`❌ Total count mismatch: Expected 40, got ${dbTrendyMap.size}`);
    process.exit(1);
  }

  let passedSpecs = 0;
  const shapes = { '600각': 0, '450각': 0, '우드': 0 };

  console.log(`\n2. Catalog Specification Calibration Verification:`);
  officialCatalog.forEach(off => {
    const norm = normCode(off.code);
    const item = dbTrendyMap.get(norm);
    if (!item) {
      console.error(`❌ Item missing in DB: ${off.code}`);
      return;
    }

    shapes[item.shape] = (shapes[item.shape] || 0) + 1;

    const checks = [
      item.code === off.code,
      item.brand === 'KCC',
      item.category === '데코타일',
      item.line === '센스타일 트랜디',
      item.thickness === '3.0T',
      item.shape === off.shape,
      item.pattern === off.pattern,
      item.specs?.size === off.spec,
      item.specs?.packing === off.packing,
      item.specs?.area === off.area,
      item.adhesive === '데코타일 본드'
    ];

    if (off.crossInstallation) {
      checks.push(item.crossInstallation === true);
    }

    if (checks.every(Boolean)) {
      passedSpecs++;
    } else {
      console.error(`❌ Mismatch in item ${off.code}:`, item);
    }
  });

  console.log(`- All 40 items passed specs check: ${passedSpecs} / 40`);
  console.log(`- Shape breakdown: 600각=${shapes['600각']} (expected 7), 450각=${shapes['450각']} (expected 20), 우드=${shapes['우드']} (expected 13)`);

  if (passedSpecs !== 40 || shapes['600각'] !== 7 || shapes['450각'] !== 20 || shapes['우드'] !== 13) {
    console.error(`❌ Specification calibration failed.`);
    process.exit(1);
  }

  console.log(`\n3. Image Resolution Verification (Candidates):`);
  let validImages = 0;

  for (const off of officialCatalog) {
    const item = dbTrendyMap.get(normCode(off.code));
    const candidates = getProductImageCandidates(item);
    
    let exists = false;
    for (const cand of candidates) {
      if (cand.startsWith('/images/')) {
        const diskPath = './public' + cand;
        if (fs.existsSync(diskPath)) {
          exists = true;
          break;
        }
      } else if (cand.startsWith('http')) {
        exists = true;
        break;
      }
    }

    if (exists) {
      validImages++;
    } else {
      console.error(`❌ Image not found for ${off.code}. Candidates:`, candidates);
    }
  }

  console.log(`- Image candidates found with valid image files: ${validImages} / 40`);

  if (validImages !== 40) {
    console.error(`❌ Image resolution verification failed.`);
    process.exit(1);
  }

  console.log(`\n==================================================`);
  console.log(`✅ ALL 40 KCC SENSE TILE TRENDY VERIFICATIONS PASSED SUCCESSFULLY!`);
  console.log(`==================================================`);
}

runVerification().catch(err => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
