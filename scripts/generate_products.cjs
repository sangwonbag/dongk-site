#!/usr/bin/env node

/**
 * CSV -> products.json + products.supabase.json 생성 스크립트
 *
 * 목적:
 * 1. 사이트용 products.json 생성
 * 2. Supabase insert/upsert용 products.supabase.json 생성
 * 3. 이미지 폴더를 자동 스캔해서 thumb/detail/install 이미지 연결
 *
 * 실행:
 * node scripts/generate_products.cjs
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const CSV_PATH = path.join(ROOT, "data", "products.csv");
const OUTPUT_DIR = path.join(ROOT, "output");
const PUBLIC_IMAGES_ROOT = path.join(ROOT, "public", "images", "products");

// -----------------------------
// 유틸
// -----------------------------

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function toBool(value, defaultValue = true) {
  if (value === undefined || value === null || value === "") return defaultValue;
  return String(value).trim().toLowerCase() === "true";
}

function toNumber(value, defaultValue = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : defaultValue;
}

function normalizeText(value = "") {
  return String(value).trim();
}

function slugifyKoreanSafe(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w가-힣-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function categoryToSlug(category) {
  const map = {
    "데코타일": "deco_tile",
    "장판": "jangpan",
    "마루": "maru",
    "벽지": "wallpaper",
    "카페트타일": "carpet_tile",
  };
  return map[category] || slugifyKoreanSafe(category);
}

function brandToSlug(brand) {
  const map = {
    "KCC": "kcc",
    "동신": "dongshin",
    "LX": "lx",
    "녹수": "nox",
    "재영": "jaeyoung",
    "현대": "hyundai",
    "LX 1.8T": "lx_18t",
    "LX 2.0T": "lx_20t",
    "LX 2.2T": "lx_22t",
    "LX 2.7T": "lx_27t",
    "LX 3.2T": "lx_32t",
    "LX 4.5T": "lx_45t",
    "LX 5.0T": "lx_50t",
    "동화": "donghwa",
    "구정": "kujung",
    "개나리": "gaenari",
    "서울": "seoul",
    "제일": "jeil",
    "디아이디": "did",
    "신한(KCC)": "shinhan_kcc",
    "스완": "swan",
    "아반": "avan",
  };
  return map[brand] || slugifyKoreanSafe(brand);
}

function makeProductSlug(brand, code) {
  return `${brandToSlug(brand)}-${slugifyKoreanSafe(code)}`;
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result.map((item) => item.trim());
}

function parseCsv(content) {
  const lines = content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => line.trim() !== "");

  if (lines.length < 2) {
    throw new Error("CSV에 헤더 또는 데이터가 없습니다.");
  }

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line, rowIndex) => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, idx) => {
      row[header] = values[idx] ?? "";
    });

    row.__rowIndex = rowIndex + 2;
    return row;
  });
}

function listImageFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];

  return fs
    .readdirSync(dirPath)
    .filter((fileName) => /\.(jpg|jpeg|png|webp)$/i.test(fileName))
    .sort((a, b) => a.localeCompare(b, "ko"));
}

function buildImagePaths(categorySlug, brandSlug, codeSlug) {
  const dirPath = path.join(PUBLIC_IMAGES_ROOT, categorySlug, brandSlug, codeSlug);
  const files = listImageFiles(dirPath);

  const thumb = files.find((f) => /^thumb\./i.test(f)) || null;
  const detailImages = files.filter((f) => /^detail_\d+\./i.test(f));
  const installImages = files.filter((f) => /^install_\d+\./i.test(f));

  const baseWebPath = `/images/products/${categorySlug}/${brandSlug}/${codeSlug}`;

  return {
    imageDirExists: fs.existsSync(dirPath),
    thumbnail: thumb ? `${baseWebPath}/${thumb}` : (detailImages[0] ? `${baseWebPath}/${detailImages[0]}` : null),
    detailImages: detailImages.map((f) => `${baseWebPath}/${f}`),
    installImages: installImages.map((f) => `${baseWebPath}/${f}`),
    storagePaths: {
      thumbnail: thumb ? `${categorySlug}/${brandSlug}/${codeSlug}/${thumb}` : (detailImages[0] ? `${categorySlug}/${brandSlug}/${codeSlug}/${detailImages[0]}` : null),
      detailImages: detailImages.map((f) => `${categorySlug}/${brandSlug}/${codeSlug}/${f}`),
      installImages: installImages.map((f) => `${categorySlug}/${brandSlug}/${codeSlug}/${f}`),
    }
  };
}

function splitTags(tags) {
  return String(tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

// -----------------------------
// 메인
// -----------------------------

function main() {
  ensureDir(OUTPUT_DIR);

  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV 파일이 없습니다: ${CSV_PATH}`);
  }

  const csvContent = fs.readFileSync(CSV_PATH, "utf8");
  const rows = parseCsv(csvContent);

  const siteProducts = [];
  const supabaseProducts = [];
  const warnings = [];

  for (const row of rows) {
    const category = normalizeText(row.category);
    const brand = normalizeText(row.brand);
    const code = normalizeText(row.code);
    const name = normalizeText(row.name);

    if (!category || !brand || !code || !name) {
      warnings.push(`[행 ${row.__rowIndex}] category/brand/code/name 중 빈 값이 있음`);
      continue;
    }

    const categorySlug = categoryToSlug(category);
    const brandSlug = brandToSlug(brand);
    const codeSlug = slugifyKoreanSafe(code);
    const productSlug = makeProductSlug(brand, code);

    const imageData = buildImagePaths(categorySlug, brandSlug, codeSlug);
    const tags = splitTags(row.tags);

    if (!imageData.imageDirExists) {
      warnings.push(`[행 ${row.__rowIndex}] 이미지 폴더 없음: public/images/products/${categorySlug}/${brandSlug}/${codeSlug}`);
    }

    const siteProduct = {
      id: productSlug,
      category,
      categorySlug,
      brand,
      brandSlug,
      subCategory: normalizeText(row.sub_category),
      code,
      codeSlug,
      name,
      slug: productSlug,
      price: toNumber(row.price, 0),
      priceText: toNumber(row.price, 0) === 0 ? "가격문의" : null,
      size: normalizeText(row.size),
      thickness: normalizeText(row.thickness),
      usage: normalizeText(row.usage),
      description: normalizeText(row.description),
      thumbnail: imageData.thumbnail,
      detailImages: imageData.detailImages,
      installImages: imageData.installImages,
      tags,
      featured: toBool(row.featured, false),
      active: toBool(row.active, true),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const supabaseProduct = {
      id: productSlug,
      slug: productSlug,
      category,
      category_slug: categorySlug,
      brand,
      brand_slug: brandSlug,
      sub_category: normalizeText(row.sub_category),
      code,
      code_slug: codeSlug,
      name,
      price: toNumber(row.price, 0),
      price_text: toNumber(row.price, 0) === 0 ? "가격문의" : null,
      size: normalizeText(row.size) || null,
      thickness: normalizeText(row.thickness) || null,
      usage_text: normalizeText(row.usage) || null,
      description: normalizeText(row.description) || null,
      thumbnail_path: imageData.storagePaths.thumbnail,
      detail_image_paths: imageData.storagePaths.detailImages,
      install_image_paths: imageData.storagePaths.installImages,
      tags,
      featured: toBool(row.featured, false),
      active: toBool(row.active, true),
    };

    siteProducts.push(siteProduct);
    supabaseProducts.push(supabaseProduct);
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "products.json"),
    JSON.stringify(siteProducts, null, 2),
    "utf8"
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "products.supabase.json"),
    JSON.stringify(supabaseProducts, null, 2),
    "utf8"
  );

  console.log(`완료: ${siteProducts.length}개 상품 생성`);
  console.log(`- output/products.json`);
  console.log(`- output/products.supabase.json`);

  if (warnings.length > 0) {
    console.log("\n[경고]");
    warnings.forEach((warning) => console.log(`- ${warning}`));
  }
}

try {
  main();
} catch (error) {
  console.error("오류:", error.message);
  process.exit(1);
}