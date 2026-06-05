import fs from 'fs';
import path from 'path';

const SOURCE_DIR = path.resolve(process.cwd(), 'public/images/Thumbnail_Image/materials');
const OUTPUT_FILE = path.resolve(process.cwd(), 'src/data/generatedMaterials.js');

// 1. Load existing materials for merging
let existingMaterials = [];
try {
  if (fs.existsSync(OUTPUT_FILE)) {
    const fileUrl = 'file:///' + OUTPUT_FILE.replace(/\\/g, '/');
    const module = await import(fileUrl + '?t=' + Date.now());
    existingMaterials = module.materials || [];
    console.log(`Loaded ${existingMaterials.length} existing products for merging.`);
  }
} catch (e) {
  console.log("No existing generatedMaterials.js found or failed to load. We will generate fresh.", e);
}

// 2. Scan folder recursively
function collectFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...collectFiles(fullPath));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext) && file !== 'desktop.ini') {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const allFiles = collectFiles(SOURCE_DIR);
console.log(`Found ${allFiles.length} image files in materials folder.`);

// 3. Group files
const groups = new Map();

function getNormalizedBrand(folderBrand, category) {
  if (category === '장판') return 'LX하우시스';
  
  if (folderBrand.includes('KCC')) return 'KCC';
  if (folderBrand.includes('LX')) return 'LX';
  if (folderBrand.includes('녹수')) return '녹수';
  if (folderBrand.includes('대진')) return '대진';
  if (folderBrand.includes('동신')) return '동신';
  if (folderBrand.includes('유성')) return '유성';
  if (folderBrand.includes('재영')) return '재영';
  if (folderBrand.includes('현대')) return '현대';
  if (folderBrand.includes('구정')) return '구정';
  if (folderBrand.includes('동화')) return '동화';
  if (folderBrand.includes('이건')) return '이건';
  if (folderBrand.includes('개나리')) return '개나리';
  if (folderBrand.includes('디아이디')) return '디아이디';
  if (folderBrand.includes('서울')) return '서울';
  if (folderBrand.includes('신한')) return '신한';
  if (folderBrand.includes('제일')) return '제일';
  if (folderBrand.includes('스완')) return '스완';
  if (folderBrand.includes('코오롱')) return '코오롱';
  
  return folderBrand;
}

allFiles.forEach(fullPath => {
  const relPath = path.relative(SOURCE_DIR, fullPath).replace(/\\/g, '/');
  const parts = relPath.split('/');
  
  if (parts.length < 3) {
    return;
  }
  
  const category = parts[0];
  const folderBrand = parts[1];
  const brand = getNormalizedBrand(folderBrand, category);
  
  let line = parts.slice(2, parts.length - 1).join('_') || "";
  let subLine = parts[parts.length - 2] || "";
  
  if (category === '장판') {
    const subParts = folderBrand.split('_');
    let rawLine = subParts[1] || subParts[0];
    rawLine = rawLine.replace(/\d+(\.\d+)?T/i, ''); // Remove thickness suffix like 1.8T, 2T etc.
    line = rawLine.trim();
    subLine = folderBrand;
  }
  
  const filename = parts[parts.length - 1];
  const ext = path.extname(filename);
  const nameWithoutExt = filename.slice(0, -ext.length).trim();
  
  const suffixMatch = nameWithoutExt.match(/^(.+)_(\d+)$/);
  let code = nameWithoutExt;
  let suffix = null;
  if (suffixMatch) {
    code = suffixMatch[1].trim();
    suffix = parseInt(suffixMatch[2], 10);
  }
  
  const groupKey = `${category}||${brand}||${line}||${code}`;
  if (!groups.has(groupKey)) {
    groups.set(groupKey, {
      category,
      brand,
      line,
      subLine,
      code,
      images: []
    });
  }
  
  groups.get(groupKey).images.push({
    url: "/images/Thumbnail_Image/materials/" + encodeURI(relPath),
    suffix: suffix
  });
});

console.log(`Grouped into ${groups.size} unique products.`);

// 4. Map to final products and resolve collisions
const seenSlugs = new Set();
const products = [];

groups.forEach((group, key) => {
  const { category, brand, line, subLine, code, images } = group;
  
  // Sort images so suffix 0 (or no suffix) is first
  images.sort((a, b) => {
    const aSuf = a.suffix === null ? 0 : a.suffix;
    const bSuf = b.suffix === null ? 0 : b.suffix;
    return aSuf - bSuf;
  });
  
  const mainImage = images[0].url;
  const imageList = images.map(img => img.url);
  
  // ID generation: category-brand-line-code
  const rawIdStr = `${category}-${brand}-${line}-${code}`;
  const baseId = rawIdStr
    .toLowerCase()
    .replace(/[^a-z0-9\-ㄱ-ㅎㅏ-ㅣ가-힣_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
    
  let id = baseId;
  let counter = 1;
  while (seenSlugs.has(id)) {
    id = `${baseId}-${counter}`;
    counter++;
  }
  seenSlugs.add(id);

  // Search existing product to merge fields
  const existing = existingMaterials.find(x => 
    x.category === category && 
    x.brand === brand && 
    x.code === code
  );
  
  let price = 0;
  let size = "";
  let unit = "";
  let thickness = "";
  let description = line;
  let name = code;

  if (existing) {
    price = existing.price || 0;
    thickness = existing.thickness || "";
    description = existing.description || line;
    name = existing.name || code;
    if (existing.specs) {
      size = existing.specs.size || "";
      unit = existing.specs.packing || "";
      if (existing.specs.thickness) thickness = existing.specs.thickness;
    }
  } else {
    // Default values
    if (category === '데코타일') {
      const is600 = line.includes('600') || code.includes('600');
      const isWood = line.includes('우드') || line.toLowerCase().includes('wood') || code.includes('우드') || code.toLowerCase().includes('wood');
      
      if (is600) {
        size = '600x600mm';
        unit = '9pcs / 3.24㎡';
        price = 25000;
      } else if (isWood) {
        size = '184x950mm';
        unit = '우드 규격 문의';
        price = 24000;
      } else {
        size = '457.2x457.2mm';
        unit = '16pcs / 3.34㎡';
        price = 24000;
      }
    } else if (category === '장판') {
      const thicknessMatch = (line + '_' + code + '_' + subLine).match(/(\d+(?:\.\d+)?)T/i);
      const t = thicknessMatch ? thicknessMatch[1] + "T" : "";
      thickness = t;
      if (t === '1.8T') { size = '1.8mm(T) x 1,830mm(W)'; unit = '35m / Roll'; price = 11000; }
      else if (t === '2.0T') { size = '2.0mm(T) x 1,830mm(W)'; unit = '30m / Roll'; price = 17000; }
      else if (t === '2.2T') { size = '2.2mm(T) x 1,830mm(W)'; unit = '30m / Roll'; price = 22000; }
      else if (t === '2.7T') { size = '2.7mm(T) x 1,830mm(W)'; unit = '25m / Roll'; price = 32000; }
      else if (t === '3.2T') { size = '3.2mm(T) x 1,830mm(W)'; unit = '23m / Roll'; price = 36000; }
      else if (t === '4.5T') { size = '4.5mm(T) x 1,830mm(W)'; unit = '20m / Roll'; price = 44000; }
      else if (t === '5.0T') { size = '5.0mm(T) x 1,830mm(W)'; unit = '20m / Roll'; price = 50000; }
      else { size = '두께별 상이'; unit = 'Roll 단위'; price = 0; }
    } else if (category === '벽지') {
      size = '롤 단위';
      unit = '1롤';
      price = 0;
    } else {
      size = '제품별 규격 문의';
      unit = 'Box 단위';
      price = 0;
    }
  }

  products.push({
    id,
    category,
    brand,
    line,
    subLine,
    name,
    code,
    thumbnail: mainImage,
    image: mainImage,
    images: imageList,
    price,
    thickness,
    specs: {
      division: subLine,
      thickness,
      size,
      packing: unit
    },
    description
  });
});

// 5. Generate outputs
const BRANDS_BY_CATEGORY = {
  "데코타일": ["KCC", "LX", "녹수", "동신", "재영", "현대", "대진", "유성"],
  "장판": ["LX하우시스"],
  "마루": ["구정", "동화", "이건"],
  "벽지": ["LX", "개나리", "디아이디", "서울", "신한"],
  "카페트타일": ["스완", "코오롱"],
  "러버타일": ["현대"]
};

const allBrandsSet = new Set();
Object.values(BRANDS_BY_CATEGORY).forEach(brands => {
  brands.forEach(b => allBrandsSet.add(b));
});
products.forEach(p => {
  if (p.brand) allBrandsSet.add(p.brand);
});
const ALL_BRANDS = Array.from(allBrandsSet);

const outputContent = `// Auto-generated by scripts/generateMaterials.js based on folder structure
export const ALL_BRANDS = ${JSON.stringify(ALL_BRANDS, null, 2)};

export const BRANDS_BY_CATEGORY = ${JSON.stringify(BRANDS_BY_CATEGORY, null, 2)};

export const materials = ${JSON.stringify(products, null, 2)};
`;

fs.writeFileSync(OUTPUT_FILE, outputContent, 'utf8');
console.log(`Successfully generated src/data/generatedMaterials.js with ${products.length} products.`);
