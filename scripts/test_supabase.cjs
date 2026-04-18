// 연결 테스트 - 버킷 목록 확인
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://ymoshkaiwvnmhhcglpjj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bvEH85EF1ihAExThm4kIeA_lDvrPrlK";

async function test() {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log("■ Supabase 연결 테스트");
  console.log("  URL:", SUPABASE_URL);

  // 버킷 목록 조회
  const { data: buckets, error } = await client.storage.listBuckets();
  
  if (error) {
    console.error("  버킷 목록 조회 실패:", error.message);
    console.log("\n  → anon key로는 listBuckets 권한이 없을 수 있습니다.");
    console.log("  → 업로드 경로를 직접 테스트합니다...\n");
  } else {
    console.log("  존재하는 버킷:");
    if (!buckets || buckets.length === 0) {
      console.log("    (없음 - 버킷 미생성 상태)");
    } else {
      buckets.forEach(b => console.log(`    - ${b.name} (id: ${b.id})`));
    }
  }

  // 업로드 테스트 (작은 더미 파일)
  const testBuckets = ["materials", "material", "images", "thumbnails", "upload"];
  console.log("\n  버킷 존재 여부 확인 (업로드 시도):");
  for (const bucketName of testBuckets) {
    const { error: uploadErr } = await client.storage
      .from(bucketName)
      .upload("__test__/ping.txt", Buffer.from("ping"), { upsert: true, contentType: "text/plain" });
    
    if (!uploadErr) {
      console.log(`  ✓ 버킷 '${bucketName}' 존재 & 업로드 OK`);
      // 테스트 파일 삭제
      await client.storage.from(bucketName).remove(["__test__/ping.txt"]);
    } else {
      console.log(`  ✗ '${bucketName}': ${uploadErr.message}`);
    }
  }
}

test().catch(console.error);
