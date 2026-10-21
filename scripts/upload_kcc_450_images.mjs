// scripts/upload_kcc_450_images.mjs
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET = 'materials';
const BASE_DIR = path.resolve(__dirname, '../public/images/Thumbnail_Image/materials');
const TARGET_DIR = path.resolve(BASE_DIR, '데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지');

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp'
  }[ext] || 'application/octet-stream';
}

function toStorageKey(fullPath) {
  const relPath = path.relative(BASE_DIR, fullPath).split(path.sep).join('/');
  const hash = crypto.createHash('md5').update(relPath, 'utf8').digest('hex');
  const ext = path.extname(fullPath).toLowerCase();
  return { storageKey: hash + ext, relPath };
}

async function uploadFiles() {
  console.log('=== 1. Supabase Storage 파일 업로드 시작 ===');
  console.log('대상 폴더:', TARGET_DIR);

  const rawFiles = fs.readdirSync(TARGET_DIR);
  const files = rawFiles.filter(f => !f.endsWith('.zip') && !f.startsWith('.') && fs.statSync(path.join(TARGET_DIR, f)).isFile());
  console.log(`총 ${files.length}개 유효 이미지 파일 업로드 진행...`);

  let successCount = 0;
  let skippedCount = 0;
  let failCount = 0;

  for (const file of files) {
    const fullPath = path.join(TARGET_DIR, file);
    const { storageKey, relPath } = toStorageKey(fullPath);
    const mimeType = getMimeType(fullPath);

    // 이미 업로드되어 있는지 확인
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${storageKey}`;
    try {
      const checkRes = await fetch(publicUrl, { method: 'HEAD' });
      if (checkRes.status === 200) {
        skippedCount++;
        continue;
      }
    } catch {
      // ignore
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const { error: err1 } = await supabase.storage
      .from(BUCKET)
      .upload(storageKey, fileBuffer, {
        upsert: true,
        contentType: mimeType
      });

    if (err1) {
      console.error(`  [FAIL] Storage ${storageKey} (${file}):`, err1.message);
      failCount++;
    } else {
      console.log(`  ✓ [UPLOAD] ${file} -> ${storageKey}`);
      successCount++;
    }
  }

  console.log(`Storage 업로드 완료: 신규 ${successCount}개 / 기존 ${skippedCount}개 / 실패 ${failCount}개`);
}

async function updateDatabase() {
  console.log('\n=== 2. Supabase DB (products & product_images) 업데이트 ===');

  const TRENDY_450_BASE = '/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지';
  const TRENDY_600_BASE = '/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_600각_이미지';

  // 정교한 이미지 매핑 정의 (원장 -> 2x2/cross -> 시공사진)
  const CATALOG_MAPPING = {
    'TS5502P': [
      `${TRENDY_450_BASE}/TS5502P.webp`,
      `${TRENDY_450_BASE}/TS5502P_사무실.jpg`
    ],
    'TS5503P': [
      `${TRENDY_450_BASE}/TS5503P.webp`,
      `${TRENDY_450_BASE}/TS5503P 우븐.jpg_90cross.jpg`,
      `${TRENDY_450_BASE}/TS5503P 우븐.jpg_180cross.jpg`
    ],
    'TS5508P': [
      `${TRENDY_450_BASE}/TS5508P.webp`,
      `${TRENDY_450_BASE}/TS5508 브러쉬 카펫.jpg_90cross.jpg`,
      `${TRENDY_450_BASE}/TS5508 브러쉬 카펫.jpg_180cross.jpg`,
      `${TRENDY_450_BASE}/TS5508P_사무실.jpg`
    ],
    'TS5508': [
      `${TRENDY_450_BASE}/TS5508P.webp`,
      `${TRENDY_450_BASE}/TS5508 브러쉬 카펫.jpg_90cross.jpg`,
      `${TRENDY_450_BASE}/TS5508 브러쉬 카펫.jpg_180cross.jpg`,
      `${TRENDY_450_BASE}/TS5508P_사무실.jpg`
    ],
    'TS5510P': [
      `${TRENDY_450_BASE}/TS5510P.webp`,
      `${TRENDY_450_BASE}/TS5510P_2x2.webp`,
      `${TRENDY_450_BASE}/TS5510P_사무실.jpg`
    ],
    'TS5511P': [
      `${TRENDY_450_BASE}/TS5511P.webp`,
      `${TRENDY_450_BASE}/TS5511P_2x2.webp`
    ],
    'TS5512P': [
      `${TRENDY_450_BASE}/TS5512P_사무실.jpg`
    ],
    'TS5516P': [
      `${TRENDY_450_BASE}/TS5516P.webp`,
      `${TRENDY_450_BASE}/TS5516P_2x2.webp`
    ],
    'TS5518P': [
      `${TRENDY_450_BASE}/TS5518P.webp`,
      `${TRENDY_450_BASE}/TS5518P_2x2.webp`
    ],
    'TS5519P': [
      `${TRENDY_450_BASE}/TS5519P.webp`,
      `${TRENDY_450_BASE}/TS5519P_2x2.webp`
    ],
    'TS5534M': [
      `${TRENDY_600_BASE}/TS5534M.png`,
      `${TRENDY_450_BASE}/TS5534M_상업공간.jpg`
    ],
    'TS5541P': [
      `${TRENDY_450_BASE}/TS5541P.webp`,
      `${TRENDY_450_BASE}/TS5541P_2x2.webp`
    ],
    'TS5542P': [
      `${TRENDY_450_BASE}/TS5542P.webp`,
      `${TRENDY_450_BASE}/TS5542P_2x2.webp`
    ],
    'TS5543P': [
      `${TRENDY_450_BASE}/TS5543P.webp`,
      `${TRENDY_450_BASE}/TS5543P_2x2.webp`,
      `${TRENDY_450_BASE}/TS5543P_상업공간.jpg`
    ],
    'TS5544P': [
      `${TRENDY_450_BASE}/TS5544P.webp`,
      `${TRENDY_450_BASE}/TS5544P_2x2.webp`
    ],
    'TS5545P': [
      `${TRENDY_450_BASE}/TS5545P.webp`,
      `${TRENDY_450_BASE}/TS5545P_2x2.webp`,
      `${TRENDY_450_BASE}/TS5545P_상업공간.jpg`
    ],
    'TS5546P': [
      `${TRENDY_450_BASE}/TS5546P.webp`,
      `${TRENDY_450_BASE}/TS5546P_2x2.webp`
    ],
    'TS5547P': [
      `${TRENDY_450_BASE}/TS5547P.webp`,
      `${TRENDY_450_BASE}/TS5547P_2x2.webp`,
      `${TRENDY_450_BASE}/TS5547P_상업공간.jpg`
    ],
    'TS5548P': [
      `${TRENDY_450_BASE}/TS5548P.webp`,
      `${TRENDY_450_BASE}/TS5548P_2x2.webp`
    ],
    'TS5549P': [
      `${TRENDY_450_BASE}/TS5549P.webp`,
      `${TRENDY_450_BASE}/TS5549P_2x2.webp`
    ],
    'TS5549M': [
      `${TRENDY_450_BASE}/TS5549P.webp`,
      `${TRENDY_450_BASE}/TS5549P_2x2.webp`
    ],
    'TS5550P': [
      `${TRENDY_450_BASE}/TS5550P.webp`,
      `${TRENDY_450_BASE}/TS5550P_2x2.webp`,
      `${TRENDY_450_BASE}/TS5550P_사무실.jpg`
    ],
    'TS5551P': [
      `${TRENDY_450_BASE}/TS5551P.webp`,
      `${TRENDY_450_BASE}/TS5551P_2x2.webp`
    ],
    'TS5552P': [
      `${TRENDY_450_BASE}/TS5552P.webp`,
      `${TRENDY_450_BASE}/TS5552P_2x2.webp`
    ]
  };

  for (const [code, urls] of Object.entries(CATALOG_MAPPING)) {
    const primaryUrl = urls[0];

    // 1) products 테이블에서 해당 상품 검색
    const { data: prods } = await supabase
      .from('products')
      .select('id, name, product_code, image_url')
      .or(`product_code.ilike.%${code}%,name.ilike.%${code}%`);

    if (!prods || prods.length === 0) {
      console.log(`  [알림] DB에서 상품 미발견: ${code}`);
      continue;
    }

    for (const prod of prods) {
      // 2) products 테이블의 image_url 업데이트 (원장 이미지 우선)
      if (primaryUrl && prod.image_url !== primaryUrl && !primaryUrl.includes('사무실') && !primaryUrl.includes('상업공간')) {
        await supabase
          .from('products')
          .update({ image_url: primaryUrl })
          .eq('id', prod.id);
        console.log(`  ✓ products [${prod.id} - ${prod.product_code}] image_url -> ${primaryUrl}`);
      }

      // 3) product_images 테이블 기존 이미지 확인 및 갱신
      await supabase.from('product_images').delete().eq('product_id', prod.id);

      const rows = urls.map((url, idx) => {
        let type = 'original';
        if (url.includes('2x2') || url.includes('cross')) {
          type = 'grid';
        } else if (url.includes('사무실') || url.includes('상업공간') || url.includes('시공')) {
          type = 'installation';
        }

        return {
          product_id: prod.id,
          image_url: url,
          image_type: type,
          sort_order: idx,
          alt_text: `${prod.name || prod.product_code} ${type === 'original' ? '원장' : type === 'grid' ? '2x2 배열' : '시공예시'}`,
          is_active: true
        };
      });

      const { error: insErr } = await supabase.from('product_images').insert(rows);
      if (insErr) {
        console.error(`  [FAIL] product_images insert error [${prod.id}]:`, insErr.message);
      } else {
        console.log(`  ✓ product_images [${prod.id}] ${rows.length}개 이미지 갱신 완료`);
      }
    }
  }
}

async function main() {
  await uploadFiles();
  await updateDatabase();
  console.log('\n✅ 업로드 및 DB 갱신 프로세스 완료!');
}

main().catch(err => {
  console.error('오류 발생:', err);
  process.exit(1);
});
