/**
 * upload_thumbnails_supabase.cjs
 * Thumbnail_Image/materials 전체를 Supabase Storage에 업로드
 *
 * 핵심 전략:
 *   - @supabase/supabase-js JS 클라이언트 사용 (sb_publishable 키 지원)
 *   - 스토리지 key = md5(상대경로).ext  → 순수 ASCII hex, 서버 거부 없음
 *   - generate_manifest.cjs 에서도 동일 로직으로 URL 생성 → 완벽히 매칭
 *
 * dry-run:   node scripts/upload_thumbnails_supabase.cjs --dry-run
 * 실제업로드:  node scripts/upload_thumbnails_supabase.cjs
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

// ─── 설정 ─────────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://ymoshkaiwvnmhhcglpjj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bvEH85EF1ihAExThm4kIeA_lDvrPrlK";
const BUCKET = "materials";
const DRY_RUN = process.argv.includes("--dry-run");
const CONCURRENCY = 5;

const SOURCE_DIR = path.join(process.cwd(), "public", "images", "Thumbnail_Image", "materials");

// ─── 유틸 ─────────────────────────────────────────────────────────────────────
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" }[ext] || "application/octet-stream";
}

/**
 * 파일 경로 → ASCII-safe 스토리지 키
 * relPath 기준: SOURCE_DIR로부터의 상대 경로 (슬래시 정규화)
 * storageKey: md5(relPath).ext
 */
function toStorageKey(fullPath) {
  const relPath = path.relative(SOURCE_DIR, fullPath).replace(/\\/g, "/");
  const hash = crypto.createHash("md5").update(relPath, "utf8").digest("hex");
  const ext = path.extname(fullPath).toLowerCase();
  return { storageKey: hash + ext, relPath };
}

function collectFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath));
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(entry.name)) {
      results.push({ fullPath, ...toStorageKey(fullPath) });
    }
  }
  return results;
}

async function runConcurrent(items, fn, concurrency) {
  let index = 0;
  const result = { ok: 0, fail: [] };
  async function worker() {
    while (index < items.length) {
      const i = index++;
      const item = items[i];
      try {
        await fn(item, i);
        result.ok++;
        if (result.ok % 100 === 0 || result.ok === items.length) {
          console.log(`  ✓ ${result.ok}/${items.length} 완료...`);
        }
      } catch (err) {
        result.fail.push({ relPath: item.relPath, storageKey: item.storageKey, error: err.message });
        if (result.fail.length <= 5) {
          console.error(`  FAIL [${i + 1}] ${item.relPath} → ${err.message}`);
        }
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return result;
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n■ Thumbnail_Image → Supabase Storage 업로드");
  console.log(`  소스:    ${SOURCE_DIR}`);
  console.log(`  버킷:    ${BUCKET}`);
  console.log(`  키 방식: md5(relPath).ext  (순수 ASCII, 한글 거부 우회)`);
  if (DRY_RUN) console.log("  [DRY-RUN 모드]\n");

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error("오류: 소스 폴더 없음:", SOURCE_DIR);
    process.exit(1);
  }

  const allFiles = collectFiles(SOURCE_DIR);
  console.log(`  총 파일: ${allFiles.length}개\n`);

  if (DRY_RUN) {
    allFiles.slice(0, 8).forEach(({ relPath, storageKey }) =>
      console.log(`  [DRY] ${relPath}\n       → ${storageKey}`)
    );
    if (allFiles.length > 8) console.log(`  ... 외 ${allFiles.length - 8}개`);
    console.log(`\n[DRY-RUN 완료]`);
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log(`  Supabase 클라이언트 초기화 완료`);
  console.log(`  업로드 시작 (동시 ${CONCURRENCY}개)...\n`);

  const { ok, fail } = await runConcurrent(allFiles, async ({ fullPath, storageKey, relPath }, i) => {
    const fileBuffer = fs.readFileSync(fullPath);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storageKey, fileBuffer, {
        upsert: true,
        contentType: getMimeType(fullPath),
      });
    if (error) throw new Error(error.message);
  }, CONCURRENCY);

  console.log("\n═══════════════════════════════════════════");
  console.log("■ 업로드 결과");
  console.log(`  성공: ${ok}개 / 전체: ${allFiles.length}개`);
  console.log(`  실패: ${fail.length}개`);
  if (fail.length > 0) {
    console.log(`  실패 파일 (처음 20개):`);
    fail.slice(0, 20).forEach(f => console.log(`    - ${f.relPath} [${f.storageKey}]: ${f.error}`));
  }
  if (ok === allFiles.length) {
    console.log("\n  ✅ 모든 파일 업로드 성공!");
    console.log("  다음 단계: node scripts/generate_manifest.cjs 실행 후 git push");
  }
  console.log("═══════════════════════════════════════════\n");
}

main().catch(err => { console.error("치명적 오류:", err); process.exit(1); });
