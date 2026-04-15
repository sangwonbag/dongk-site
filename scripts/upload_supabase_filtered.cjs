/**
 * upload_supabase.cjs
 * 업로드 대상: public/images/upload_target (데코타일, 장판만)
 *
 * dry-run:   node scripts/upload_supabase.cjs --dry-run
 * 실제업로드:  node scripts/upload_supabase.cjs
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// ─── 설정 ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://ymoshkaiwvnmhhcglpjj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bvEH85EF1ihAExThm4kIeA_lDvrPrlK";
const BUCKET = "materials";
const ALLOWED_CATEGORIES = ["데코타일", "장판"];
const DRY_RUN = process.argv.includes("--dry-run");

const UPLOAD_SOURCE = path.join(process.cwd(), "public", "images", "upload_target");

// ─── 유틸 ────────────────────────────────────────────────────────────────────
function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  return { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" }[ext] || "application/octet-stream";
}

function collectFiles(dir, prefix) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const storagePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) results.push(...collectFiles(fullPath, storagePath));
    else results.push({ fullPath, storagePath });
  }
  return results;
}

// ─── 메인 ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n■ Supabase Storage 업로드 시작");
  console.log(`  소스경로: ${UPLOAD_SOURCE}`);
  console.log(`  버킷: ${BUCKET}`);
  console.log(`  허용 카테고리: ${ALLOWED_CATEGORIES.join(", ")}`);
  if (DRY_RUN) console.log("  [DRY-RUN 모드]\n");

  if (!fs.existsSync(UPLOAD_SOURCE)) {
    console.error("오류: upload_target 폴더가 없습니다:", UPLOAD_SOURCE);
    process.exit(1);
  }

  // 파일 수집 (허용 카테고리만)
  const allFiles = [];
  const skippedCategories = [];
  for (const entry of fs.readdirSync(UPLOAD_SOURCE, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (ALLOWED_CATEGORIES.includes(entry.name)) {
      allFiles.push(...collectFiles(path.join(UPLOAD_SOURCE, entry.name), entry.name));
    } else {
      skippedCategories.push(entry.name);
    }
  }

  const uploadedCategories = [...new Set(allFiles.map(f => f.storagePath.split("/")[0]))];
  console.log(`  총 업로드 대상: ${allFiles.length}개`);
  console.log(`  카테고리: ${uploadedCategories.join(", ")}`);
  if (skippedCategories.length) console.log(`  제외: ${skippedCategories.join(", ")}`);
  console.log("");

  // DRY-RUN
  if (DRY_RUN) {
    allFiles.forEach(f => console.log("  [DRY]", f.storagePath));
    console.log(`\n[DRY-RUN 완료] 총 ${allFiles.length}개 파일`);
    return;
  }

  // Supabase 클라이언트 생성
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 버킷이 대시보드에서 이미 생성되어 있다고 가정하고 바로 업로드 진행
  console.log(`  → 버킷 '${BUCKET}' 에 바로 업로드 시작\n`);

  // 업로드
  let uploaded = 0;
  const failed = [];

  for (const { fullPath, storagePath } of allFiles) {
    const fileBuffer = fs.readFileSync(fullPath);
    const { error } = await client.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, { upsert: true, contentType: getMimeType(fullPath) });

    if (error) {
      console.error(`  FAILED: ${storagePath} — ${error.message}`);
      failed.push({ storagePath, error: error.message });
    } else {
      console.log(`  OK: ${storagePath}`);
      uploaded++;
    }
  }

  // 결과 리포트
  console.log("\n═══════════════════════════════════════════");
  console.log("■ 업로드 결과 리포트");
  console.log("═══════════════════════════════════════════");
  console.log(`  버킷:            ${BUCKET}`);
  console.log(`  업로드 카테고리:  ${uploadedCategories.join(", ")}`);
  console.log(`  업로드 성공:     ${uploaded}개`);
  console.log(`  업로드 실패:     ${failed.length}개`);
  console.log(`  제외된 카테고리: ${skippedCategories.length ? skippedCategories.join(", ") : "없음"}`);
  if (failed.length) {
    console.log("\n  실패 파일:");
    failed.forEach(f => console.log(`    - ${f.storagePath}: ${f.error}`));
  }
  console.log(`  Storage 경로:   supabase/${BUCKET}/`);
  console.log("═══════════════════════════════════════════\n");
}

main().catch(err => { console.error("치명적 오류:", err); process.exit(1); });
