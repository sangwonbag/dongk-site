/**
 * Discover PDFs in public/samplebook-assets and link them to existing samplebooks.
 *
 * Run: npm run sync:samplebooks
 * Every PDF not matched to an existing book is shown under "전체 샘플북".
 * Never guess a link if the filename is ambiguous.
 */
import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { sampleBooks } from "../src/data/samplebooks.db.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = path.join(root, "public", "samplebook-assets");
const outputPath = path.join(root, "src", "data", "samplebookPdfIndex.generated.json");
const basename = (value) => String(value || "").split("/").pop().replace(/\.pdf$/i, "");
const normalize = (value) => String(value || "").normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const categories = ["데코타일", "장판", "마루", "벽지", "카페트타일", "러버타일"];
const brands = ["KCC", "LX", "동신", "재영", "유성", "녹수", "현대", "우성", "이건", "동화", "구정", "개나리", "서울", "제일", "DID", "신한", "스완", "어반"];
const fileToUrl = relative => "/samplebook-assets/" + relative.split(path.sep).map(encodeURIComponent).join("/");
const normalizeRelative = value => String(value || "").split("/").map(part => {
  try { return decodeURIComponent(part); } catch { return part; }
}).join("/").normalize("NFKC").toLocaleLowerCase();

async function findPdfs(directory, relative = "") {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); }
  catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
  const found = [];
  for (const entry of entries) {
    const next = path.join(directory, entry.name);
    const rel = path.join(relative, entry.name);
    if (entry.isDirectory()) found.push(...await findPdfs(next, rel));
    else if (entry.isFile() && /\.pdf$/i.test(entry.name)) {
      found.push({ relative: rel.split(path.sep).join("/"), bytes: (await stat(next)).size });
    }
  }
  return found;
}

const files = (await findPdfs(assetRoot)).sort((a, b) => a.relative.localeCompare(b.relative, "ko"));
const matches = {};
const used = new Set();
const lowerPath = item => normalizeRelative(item.relative);

for (const book of sampleBooks) {
  if (!book.pdf) continue;
  const expected = normalizeRelative(book.pdf.replace(/^\/samplebook-assets\//i, ""));
  let file = files.find(item => lowerPath(item) === expected && !used.has(item.relative));
  if (!file) {
    // Allow moved files only when the same filename maps unambiguously.
    const expectedBase = normalize(basename(expected));
    const candidates = files.filter(item => !used.has(item.relative) && normalize(basename(item.relative)) === expectedBase);
    if (candidates.length === 1) file = candidates[0];
    if (candidates.length > 1) {
      const narrowed = candidates.filter(item =>
        normalize(item.relative).includes(normalize(book.brand)) &&
        normalize(item.relative).includes(normalize(book.category))
      );
      if (narrowed.length === 1) file = narrowed[0];
    }
  }
  if (file) {
    matches[book.id] = fileToUrl(file.relative);
    used.add(file.relative);
  }
}

function inferBrand(relative) {
  const parts = relative.split("/");
  return brands.find(brand => parts.some(part => normalize(part) === normalize(brand))) ||
    brands.find(brand => normalize(relative).includes(normalize(brand))) || "기타";
}
function inferCategory(relative) {
  const parts = relative.split("/");
  return categories.find(category => parts.some(part => normalize(part) === normalize(category))) ||
    categories.find(category => normalize(relative).includes(normalize(category))) || "기타";
}

const additional = files.filter(file => !used.has(file.relative)).map(file => {
  const title = basename(file.relative).trim();
  return {
    id: "pdf-" + crypto.createHash("sha1").update(file.relative).digest("hex").slice(0, 12),
    title,
    brand: inferBrand(file.relative),
    category: inferCategory(file.relative),
    pdf: fileToUrl(file.relative),
    description: "등록된 PDF 샘플북"
  };
});

const manifest = { matched: matches, additional };
await writeFile(outputPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

const missing = sampleBooks.filter(book => book.pdf && !matches[book.id]).length;
const oversized = files.filter(item => item.bytes >= 100_000_000);
console.log(`[samplebooks] PDF ${files.length}개 / 기존 샘플북 연결 ${Object.keys(matches).length}개 / 추가 등록 ${additional.length}개 / 미연결 기존 항목 ${missing}개`);
if (oversized.length) {
  console.warn("[samplebooks] GitHub의 파일당 100MB 제한 초과 가능:", oversized.map(item => item.relative));
}
