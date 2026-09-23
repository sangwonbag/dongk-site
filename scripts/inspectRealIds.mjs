import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { getProductImageUrl, getAllProductImages, getProductImageCandidates, normalizeProductImageUrl } from '../src/utils/productImageResolver.js';
import { formatProductTitle, getComputedBrand, getNormalizedThickness, normalizeProductDetails, getProductUnit, formatShapeOrPattern } from '../src/utils/brandUtils.js';
import { getValidGalleryImages, getDetailImage, getThumbnailImage } from '../src/utils/galleryUtils.js';
import { getMaterialImagePath } from '../src/utils/materialImageResolver.js';

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

async function run() {
  console.log('=== TESTING MaterialDetail DATA FLOW ===');
  const routeParam = '데코타일-kcc-kcc_wood-tw-5120g';

  const { data: p } = await supabase
    .from('products')
    .select('*, categories(id, name), brands(id, name)')
    .eq('slug', routeParam)
    .maybeSingle();

  console.log('Fetched product:', p?.id, p?.product_code, p?.slug);

  const itemCode = p.product_code || "";
  const inferredBrand = p.brands?.name || p.brand || "KCC";
  const inferredCategory = p.categories?.name || p.category || "데코타일";

  const item = {
    id: p.slug || String(p.id),
    product_id: p.id,
    code: itemCode,
    name: p.name || "",
    brand: inferredBrand,
    category: inferredCategory,
    price: p.price || 0,
    thickness: p.thickness || "",
    specs: {
      thickness: p.thickness || "",
      size: p.size_text || "",
      packing: p.unit || ""
    },
    thumbnail: p.image_url || null,
    image: p.image_url || null,
    description: p.description || "",
    features: p.features || [],
    recommendedSpaces: p.recommended_spaces || [],
    line: p.description || "",
    collection: null,
    series: null,
    catalog: null,
    pattern: p.pattern || (itemCode === 'TW 5120G' ? '오크' : undefined),
    note: ""
  };

  console.log('Normalized item:', item);

  try {
    const title = formatProductTitle(item);
    console.log('formatProductTitle:', title);

    const brandComp = getComputedBrand(item);
    console.log('getComputedBrand:', brandComp);

    const unit = getProductUnit(item);
    console.log('getProductUnit:', unit);

    const imgCandidates = getProductImageCandidates(item);
    console.log('getProductImageCandidates:', imgCandidates);

    const imgPath = getMaterialImagePath(item);
    console.log('getMaterialImagePath:', imgPath);

    const detailImg = await getDetailImage(item);
    console.log('getDetailImage:', detailImg);

    const thumbImg = await getThumbnailImage(item);
    console.log('getThumbnailImage:', thumbImg);

    const galleryObjs = await getValidGalleryImages(item);
    console.log('getValidGalleryImages count:', galleryObjs?.length);
  } catch (err) {
    console.error('CRASH IN DETAIL COMPUTATION:', err);
  }
}

run();
