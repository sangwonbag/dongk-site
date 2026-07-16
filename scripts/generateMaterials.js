import fs from 'fs';
import path from 'path';
import { dongshinPolymer2026 } from '../src/data/dongshinPolymer2026.js';

const KCC_NEW_PRODUCTS_FILE = path.resolve(process.cwd(), 'src/data/kcc_new_products.json');
let kccNewProducts = [];
if (fs.existsSync(KCC_NEW_PRODUCTS_FILE)) {
  kccNewProducts = JSON.parse(fs.readFileSync(KCC_NEW_PRODUCTS_FILE, 'utf-8'));
}

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
  if (category === '장판') {
    if (folderBrand.includes('현대')) return '현대';
    if (folderBrand.includes('KCC')) return 'KCC';
    return 'LX하우시스';
  }
  
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
  
  // Filter out MACOSX or __MACOSX directories and system metadata files
  if (parts.some(p => p.toUpperCase().includes('MACOSX')) || parts[parts.length - 1].startsWith('._')) {
    return;
  }
  
  const category = parts[0];
  const folderBrand = parts[1];
  const brand = getNormalizedBrand(folderBrand, category);
  
  if (category === '마루' && brand === '이건') {
    return;
  }
  
  let subLine = parts[parts.length - 2] || "";
  let isConstruction = false;
  
  if ((subLine === '시공이미지' || subLine === '상세페이지' || subLine.includes('시공이미지') || subLine.includes('상세페이지')) && parts.length >= 4) {
    subLine = parts[parts.length - 3] || "";
    isConstruction = true;
  }
  
  let line = parts.slice(2, parts.length - 1).join('_') || "";
  if (parts.some(p => p.includes('시공이미지') || p.includes('상세페이지'))) {
    const lineParts = parts.slice(2, parts.length - 1);
    const filteredParts = lineParts.filter(p => !p.includes('시공이미지') && !p.includes('상세페이지'));
    line = filteredParts.join('_') || "";
  }
  
  if (category === '장판') {
    const subParts = subLine.split('_');
    let rawLine = "";
    if (subParts.length === 3) {
      rawLine = subParts[1];
    } else if (subParts.length === 2) {
      rawLine = subParts[0];
    } else {
      rawLine = subParts[0];
    }
    rawLine = rawLine.replace(/\d+(\.\d+)?T/i, ''); // Remove thickness suffix like 1.8T, 2T etc.
    rawLine = rawLine.replace(/\d+(\.\d+)?$/, ''); // Remove trailing thickness numbers like 2.2 or 1.8
    line = rawLine.trim();
  }
  
  const filename = parts[parts.length - 1];
  const ext = path.extname(filename);
  const nameWithoutExt = filename.slice(0, -ext.length).trim();
  
  let code = nameWithoutExt.replace(/_thumbnail$/i, '').trim();
  if (code.endsWith('_시공') || code.toLowerCase().endsWith('_installation')) {
    code = code.replace(/_시공$/i, '').replace(/_installation$/i, '').trim();
    isConstruction = true;
  }
  const suffixMatch = code.match(/^(.+)_(\d+)$/);
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
    suffix: suffix,
    isConstruction: isConstruction
  });
});

console.log(`Grouped into ${groups.size} unique products.`);

// 4. Map to final products and resolve collisions
const seenSlugs = new Set();
const products = [];

groups.forEach((group, key) => {
  const { category, brand, code, images } = group;
  let line = group.line;
  let subLine = group.subLine;
  
  // Sort images so main images are first, and construction images are last
  images.sort((a, b) => {
    if (a.isConstruction !== b.isConstruction) {
      return a.isConstruction ? 1 : -1;
    }
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
  
  // Search in dongshinPolymer2026 for brand "동신" and category "데코타일"
  const dongshinMatch = (brand === '동신' && category === '데코타일') 
    ? dongshinPolymer2026.find(d => d.code.toUpperCase() === code.toUpperCase())
    : null;

  // Search in kccNewProducts for brand "KCC" and category "데코타일"
  const kccMatch = (brand === 'KCC' && category === '데코타일')
    ? kccNewProducts.find(k => k.code.toUpperCase() === code.toUpperCase())
    : null;

  let price = 0;
  let size = "";
  let unit = "";
  let thickness = "";
  let description = line;
  let name = code;

  // Pre-parse thickness for Jangpan category
  let parsedThickness = "";
  if (category === '장판') {
    let t = "";
    const thicknessMatch = (line + '_' + code + '_' + subLine).match(/(\d+(?:\.\d+)?)\s*T/i);
    if (thicknessMatch) {
      t = thicknessMatch[1] + "T";
    } else {
      const numMatch = subLine.match(/(\d+(?:\.\d+)?)$/);
      if (numMatch) {
        t = numMatch[1] + "T";
      }
    }
    parsedThickness = t;
  }

  if (kccMatch) {
    price = kccMatch.price;
    size = kccMatch.spec;
    unit = kccMatch.packing;
    thickness = kccMatch.spec.startsWith('5T') ? '5.0T' : '3.0T';
    description = kccMatch.line;
    name = kccMatch.name;
    line = kccMatch.line;
    subLine = kccMatch.line;
  } else if (dongshinMatch) {
    price = dongshinMatch.price;
    size = dongshinMatch.spec;
    unit = dongshinMatch.package;
    // Extract thickness from spec: "600 x 600 x 3.0mm" -> "3.0mm"
    const tParts = dongshinMatch.spec.split('x');
    thickness = tParts.length > 0 ? tParts[tParts.length - 1].trim() : "3.0mm";
    description = dongshinMatch.line;
    name = dongshinMatch.code;
  } else if (existing) {
    price = existing.price || 0;
    thickness = existing.thickness || parsedThickness;
    description = (brand === '현대') ? line : (existing.description || line);
    name = (brand === '현대') ? code : (existing.name || code);
    if (existing.specs) {
      size = existing.specs.size || "";
      unit = existing.specs.packing || "";
      if (existing.specs.thickness) {
        thickness = existing.specs.thickness;
      } else if (parsedThickness) {
        thickness = parsedThickness;
      }
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
      thickness = parsedThickness;
      const t = parsedThickness;
      if (brand === '현대' || brand === 'KCC') {
        size = '제품별 규격 문의';
        unit = 'Roll 단위';
        price = 0;
      } else if (t === '1.8T') { size = '1.8mm(T) x 1,830mm(W)'; unit = '35m / Roll'; price = 12000; }
      else if (t === '2.0T') { size = '2.0mm(T) x 1,830mm(W)'; unit = '30m / Roll'; price = 18000; }
      else if (t === '2.2T') { size = '2.2mm(T) x 1,830mm(W)'; unit = '30m / Roll'; price = 23000; }
      else if (t === '2.7T') { size = '2.7mm(T) x 1,830mm(W)'; unit = '25m / Roll'; price = 34000; }
      else if (t === '3.2T') { size = '3.2mm(T) x 1,830mm(W)'; unit = '23m / Roll'; price = 38000; }
      else if (t === '4.5T') { size = '4.5mm(T) x 1,830mm(W)'; unit = '20m / Roll'; price = 47000; }
      else if (t === '5.0T') { size = '5.0mm(T) x 1,830mm(W)'; unit = '20m / Roll'; price = 53000; }
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

  // Override '장판' price for both existing and new products based on thickness
  if (category === '장판') {
    if (brand === '현대' || brand === 'KCC') {
      price = 0;
    } else {
      let t = thickness || "";
      const thicknessMatch = (line + '_' + code + '_' + subLine).match(/(\d+(?:\.\d+)?)\s*T/i);
      if (thicknessMatch) {
        t = thicknessMatch[1] + "T";
      } else {
        const numMatch = subLine.match(/(\d+(?:\.\d+)?)$/);
        if (numMatch) {
          t = numMatch[1] + "T";
        }
      }
      if (t === '1.8T') price = 12000;
      else if (t === '2.0T') price = 18000;
      else if (t === '2.2T') price = 23000;
      else if (t === '2.7T') price = 34000;
      else if (t === '3.2T') price = 38000;
      else if (t === '4.5T') price = 47000;
      else if (t === '5.0T') price = 53000;
    }
  }

  // Override KCC Pro specifications based on code suffix rules
  if (!kccMatch && brand === 'KCC' && (line || "").includes('pro')) {
    const lastChar = (code || "").slice(-1).toUpperCase();
    if (lastChar === 'M') {
      size = '600 x 600 x 3.0mm';
      unit = '9pcs / 3.24㎡';
      thickness = '3.0T';
    } else if (lastChar === 'P') {
      size = '457.2 x 457.2 x 3.0mm';
      unit = '16pcs / 3.34㎡';
      thickness = '3.0T';
    } else if (lastChar === 'G') {
      size = '184 x 950 x 3.0mm';
      unit = '19pcs / 3.32㎡';
      thickness = '3.0T';
    } else if ((code || "").toUpperCase().startsWith('B') && lastChar === 'J') {
      size = '457.2 x 914.4 x 5.0mm';
      unit = '6pcs / 2.51㎡';
      thickness = '5.0T';
    }
  }

  // Override '데코타일' price for both existing and new products based on the approved price list
  if (category === '데코타일') {
    const sizeClean = (size || "").replace(/\s+/g, '');
    const is600 = (line || "").includes('600') || (code || "").includes('600') || sizeClean.includes('600x600');
    const isWood = (line || "").includes('우드') || (line || "").toLowerCase().includes('wood') || (code || "").includes('우드') || (code || "").toLowerCase().includes('wood') || sizeClean.includes('187x935') || sizeClean.includes('184x950');

    if (brand === 'KCC') {
      if (kccMatch) {
        price = kccMatch.price;
      } else if ((line || "").includes('센스하우스')) {
        if (existing) price = existing.price || 0;
      } else if ((code || "").toUpperCase().startsWith('B') || (thickness || "").includes('5.0T') || (line || "").includes('센스레이')) {
        price = 0; // 센스레이 5.0 (Loose lay) - 가격문의
      } else if ((line || "").includes('프로') || (line || "").includes('pro') || (code || "").startsWith('PS') || (code || "").startsWith('PW')) {
        price = 35000; // 프로 - 35,000원
      } else {
        price = is600 ? 28000 : 27000;
      }
    } else if (brand === '동신') {
      if ((line || "").includes('OA타일') || (line || "").includes('O/A') || (code || "").toUpperCase().startsWith('OA')) {
        price = 56000;
      } else if ((line || "").includes('차음') || (line || "").includes('아트에코차음')) {
        if (existing) price = existing.price || 56000;
        else price = 56000;
      } else if ((line || "").includes('아트하우스') || (line || "").includes('하우스')) {
        price = 37000;
      } else {
        price = is600 ? 26000 : 25000;
      }
    } else if (brand === 'LX') {
      if ((line || "").includes('보타닉')) {
        price = 26000;
      } else if ((line || "").includes('에코닉') || (line || "").includes('에코노') || (line || "").includes('에코너')) {
        price = 35000;
      } else if ((line || "").includes('지아마루') || (line || "").includes('하우스스타일') || (line || "").includes('지아')) {
        price = 48000;
      } else if ((line || "").includes('프레스티지') || (line || "").includes('프레시티지')) {
        if (isWood || (code || "").toUpperCase().startsWith('PTW')) {
          price = 86000;
        } else {
          price = 81000;
        }
      } else if ((line || "").includes('데코레이')) {
        price = 0;
      } else if ((line || "").includes('하우스')) {
        price = 40000;
      }
    } else if (brand === '재영') {
      price = is600 ? 28000 : 26000;
    } else if (brand === '대진') {
      if ((line || "").includes('하우스')) {
        price = 40000;
      } else {
        price = is600 ? 29000 : 27000;
      }
    } else if (brand === '현대') {
      if ((line || "").includes('클래식') || (line || "").includes('골드타일클래식')) {
        price = 35000;
      } else if ((line || "").includes('마스터') || (line || "").includes('골드타일마스터')) {
        price = is600 ? 27000 : 26000;
      } else if ((line || "").includes('디럭스')) {
        price = 22000;
      }
    } else if (brand === '유성') {
      if ((line || "").includes('디럭스')) {
        price = 24000;
      } else {
        price = 25000;
      }
    } else if (brand === '유니') {
      const isGlossy = (line || "").includes('유광') || (name || "").includes('유광') || (code || "").includes('유광');
      price = (is600 || isGlossy) ? 26000 : 25000;
    } else if (brand === '녹수') {
      if ((line || "").includes('2000')) {
        price = 35000;
      } else if ((line || "").includes('3000')) {
        price = 35000;
      } else if ((line || "").includes('1000') || (line || "").includes('1500') || (line || "").includes('프라임')) {
        price = 24000;
      }
    } else if (brand === '베스트') {
      price = 23000;
    }
  }

  // Override '벽지' price based on the brand/line and specifications
  if (category === '벽지') {
    const lineClean = (line || "").replace(/\s+/g, '');
    const nameClean = (name || "").replace(/\s+/g, '');
    const codeClean = (code || "").toUpperCase();

    if (brand === 'LX' || brand === 'LG') {
      const getWallpaperWidth = (sizeStr, lineStr, codeStr) => {
        const s = (sizeStr || "") + "_" + (lineStr || "") + "_" + (codeStr || "");
        if (s.includes('106') || s.includes('1.06')) return 106;
        if (s.includes('93') || s.includes('0.93')) return 93;
        if (s.includes('53') || s.includes('0.53')) return 53;
        return 106; // Default to 106cm
      };

      const isFDiamant = lineClean.includes('F디아망') || lineClean.includes('에프디아망') || (lineClean.startsWith('F') && lineClean.includes('디아망'));
      const isFSilk = lineClean.includes('F실크') || lineClean.includes('에프실크') || (lineClean.startsWith('F') && lineClean.includes('실크'));
      const isFCeiling = lineClean.includes('F천정지') || lineClean.includes('에프천정지') || (lineClean.startsWith('F') && lineClean.includes('천정지'));
      const isDiamantFortis = lineClean.includes('디아망포티스') || lineClean.includes('포티스');
      const isDiamant = !isFDiamant && !isDiamantFortis && lineClean.includes('디아망');
      const isBesti = lineClean.includes('베스띠') || lineClean.includes('베스트');
      const isTherapy = lineClean.includes('테라피');
      const isMural = lineClean.includes('뮤럴');
      
      const isNarrow = lineClean.includes('소폭') || nameClean.includes('소폭') || codeClean.includes('소폭');
      const isCeilingLaminated = lineClean.includes('합지천정지') || lineClean.includes('합지 천정지') || (lineClean.includes('천정지') && lineClean.includes('합지'));
      const isCeilingSilk = !isFCeiling && !isCeilingLaminated && (lineClean.includes('실크천정지') || lineClean.includes('실크 천정지') || lineClean.includes('천정지'));
      
      const isHianceLaminated = lineClean.includes('휘앙세') || lineClean.includes('합지') || nameClean.includes('휘앙세') || nameClean.includes('합지');
      const width = getWallpaperWidth(size, line, code);

      if (isFDiamant) {
        price = 100000;
        size = '106cm × 15.5m';
        unit = '1롤';
      } else if (isFSilk) {
        price = 73000;
        size = '82.70㎡';
        unit = '1롤';
      } else if (isFCeiling) {
        price = 95000;
        size = '10평 / 1Roll';
        unit = '1롤';
      } else if (isDiamantFortis) {
        price = 90000;
        size = '106cm × 15.5m';
        unit = '1롤';
      } else if (isDiamant) {
        price = 65000;
        size = '106cm × 15.5m';
        unit = '1롤';
      } else if (isBesti) {
        price = 45000;
        size = '106cm × 15.5m';
        unit = '1롤';
      } else if (isTherapy) {
        price = 45000;
        size = '106cm × 15.5m';
        unit = '1롤';
      } else if (isCeilingSilk) {
        price = 50000;
        size = '106cm × 31m';
        unit = '1롤';
      } else if (isCeilingLaminated) {
        price = 38000;
        size = '93cm × 35.5m';
        unit = '1롤';
      } else if (isNarrow || width === 53) {
        price = 88000;
        size = '53cm × 12.5m';
        unit = '20롤/박스';
      } else if (isMural) {
        price = 115000;
        size = '100cm × 2.4m';
        unit = '1폭';
      } else if (isHianceLaminated) {
        if (width === 93) {
          price = 23000;
          size = '93cm × 17.75m';
          unit = '1롤';
        } else {
          price = 25000;
          size = '106cm × 15.5m';
          unit = '1롤';
        }
      }
    } else if (brand === '개나리') {
      const isPrimo = lineClean.includes('프리미엄') || lineClean.includes('프리모');
      const isLohas = lineClean.includes('로하스');
      const isArtbook = lineClean.includes('아트북');
      const isNarrow = lineClean.includes('소폭') || nameClean.includes('소폭') || codeClean.includes('소폭');
      const isLaminatedWide = lineClean.includes('장폭') || lineClean.includes('합지');
      
      const isFCeiling = lineClean.includes('천정지') && lineClean.includes('방염');
      const isFSilk = !isFCeiling && lineClean.includes('방염') && (lineClean.includes('프리모') || codeClean.startsWith('99'));
      const isFBangyeom = !isFCeiling && !isFSilk && lineClean.includes('방염');

      const isCeilingSilk = !lineClean.includes('방염') && lineClean.includes('천정지') && (lineClean.includes('실크') || isLohas || isArtbook);
      const isCeilingLaminated = !lineClean.includes('방염') && lineClean.includes('천정지') && (lineClean.includes('합지') || isLaminatedWide);

      if (isFSilk) {
        price = 105000;
        size = '106cm × 15.5m';
        unit = '1롤';
      } else if (isFCeiling) {
        price = 60000;
        size = '106cm × 15.5m';
        unit = '1롤';
      } else if (isFBangyeom) {
        price = 75000;
        size = '106cm × 15.5m';
        unit = '1롤';
      } else if (isPrimo) {
        price = 58000;
        size = '106cm × 15.5m';
        unit = '1롤';
      } else if (isLohas) {
        price = 47000;
        size = '106cm × 15.5m';
        unit = '1롤';
      } else if (isArtbook) {
        price = 41000;
        size = '106cm × 15.5m';
        unit = '1롤';
      } else if (isCeilingSilk) {
        price = 28000;
        size = '106cm × 15.5m';
        unit = '1롤';
      } else if (isCeilingLaminated) {
        price = 22000;
        size = '93cm × 17.75m';
        unit = '1롤';
      } else if (isNarrow) {
        price = 90000;
        size = '53cm × 12.5m';
        unit = '20롤/박스';
      } else if (isLaminatedWide) {
        if (lineClean.includes('타일') || nameClean.includes('타일') || codeClean.includes('타일')) {
          price = 55000;
          size = '106cm × 15.5m';
          unit = '1롤';
        } else {
          price = 25000;
          size = '93cm × 17.75m';
          unit = '1롤';
        }
      }
    } else if (brand === '서울') {
      const isSilk = lineClean.includes('실크');
      const isLaminated = lineClean.includes('합지') || lineClean.includes('소폭');
      const isPremium = lineClean.includes('프리미엄');
      const isCeiling = lineClean.includes('천정지') || lineClean.includes('천정');

      if (isPremium) {
        if (existing) price = existing.price || 0;
      } else if (lineClean.includes('방염')) {
        if (existing) price = existing.price || 0;
      } else if (isSilk) {
        if (isCeiling) {
          price = 46000;
          size = '106cm × 31m';
          unit = '1롤';
        } else {
          const mainPart = codeClean.split('-')[0].replace(/[^0-9]/g, "");
          if (mainPart.length === 3) {
            price = 37000;
            size = '106cm × 15.5m';
            unit = '1롤';
          } else {
            price = 42000;
            size = '106cm × 15.5m';
            unit = '1롤';
          }
        }
      } else if (isLaminated) {
        const isNarrow = lineClean.includes('소폭') || nameClean.includes('소폭') || codeClean.includes('소폭');
        if (isCeiling) {
          price = 35000;
          size = '91cm × 36.4m';
          unit = '1롤';
        } else if (isNarrow) {
          price = 78000;
          size = '53cm × 12.5m';
          unit = '20롤/박스';
        } else {
          price = 23000;
          size = '91cm × 18.2m';
          unit = '1롤';
        }
      }
    }
  }

  // Override '카페트타일' price for brand '스완'
  if (category === '카페트타일') {
    if (brand === '스완') {
      const codeClean = (code || "").toUpperCase();
      const lineClean = (line || "").replace(/\s+/g, '');

      if (lineClean.includes('타일') || lineClean.includes('타일카페트')) {
        if (codeClean.startsWith('BA')) {
          price = 59000;
        } else if (codeClean.startsWith('BS')) {
          price = 59000;
        } else if (codeClean.startsWith('RA')) {
          price = 60000;
        } else if (codeClean.startsWith('CT') || codeClean.startsWith('CITY')) {
          price = 65000;
        } else if (codeClean.startsWith('MJ')) {
          price = 75000;
        } else if (codeClean.startsWith('FS') || codeClean.startsWith('FP')) {
          price = 88000;
        } else if (codeClean.startsWith('SQ')) {
          price = 90000;
        } else if (codeClean.startsWith('SP')) {
          price = 115000;
        } else if (codeClean.startsWith('TR')) {
          price = 115000;
        } else if (codeClean.startsWith('GL') || codeClean.startsWith('GP')) {
          price = 118000;
        } else if (codeClean.startsWith('MX')) {
          price = 190000;
        } else {
          price = 0;
        }
        size = '500mm x 500mm';
        unit = '1박스 (4㎡)';
      } else if (lineClean.includes('롤') || lineClean.includes('롤카페트')) {
        price = 0;
        size = '폭 3.64m ~ 3.66m';
        unit = '1㎡';
      }
    }
  }


  const productObj = {
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
  };

  if (kccMatch) {
    productObj.shape = kccMatch.shape;
    productObj.pattern = kccMatch.pattern;
    productObj.specs.area = kccMatch.area;
  }

  if (dongshinMatch) {
    productObj.collection = dongshinMatch.collection;
    productObj.series = dongshinMatch.series;
    productObj.catalog = dongshinMatch.catalog;
    productObj.productName = dongshinMatch.productName;
  }

  products.push(productObj);
});

// === Eagon Floor Static Data Insertion ===
const EAGON_LINEUPS = [
  {
    line: "라르고 솔레 240 T4",
    collection: "LARGO",
    series: "원목마루",
    spec: "T14(4) x W240 x L2,200mm",
    note: "원목마루 / 4mm 원목 / 240mm 하이엔드 사이즈",
    products: [
      { name: "뉴 큐뮬러스", eng: "New Cumulus" },
      { name: "뉴 샌드", eng: "New Sand" },
      { name: "뉴 오크 에스", eng: "New Oak S" },
      { name: "뉴 썬라이즈", eng: "New Sunrise" },
      { name: "뉴 이클립스", eng: "New Eclipse" }
    ]
  },
  {
    line: "라르고 솔레 190 T3",
    collection: "LARGO",
    series: "원목마루",
    spec: "T14(3) x W190 x L1,900mm",
    note: "원목마루 / 3mm 원목 / 190mm 광폭",
    products: [
      { name: "미스트", eng: "Mist" },
      { name: "샌드", eng: "Sand" },
      { name: "썬라이즈", eng: "Sunrise" },
      { name: "썬셋", eng: "Sunset" },
      { name: "티크 에스", eng: "Teak S" },
      { name: "오크 에스", eng: "Oak S" }
    ]
  },
  {
    line: "라르고 솔레 190 T1",
    collection: "LARGO",
    series: "원목마루",
    spec: "T12(1.2) x W190 x L1,900mm",
    note: "원목마루 / 1.2mm 원목 / 190mm 광폭",
    products: [
      { name: "뉴 큐뮬러스", eng: "New Cumulus" },
      { name: "뉴 샌드", eng: "New Sand" },
      { name: "뉴 오크 에스", eng: "New Oak S" },
      { name: "뉴 썬라이즈", eng: "New Sunrise" },
      { name: "뉴 이클립스", eng: "New Eclipse" }
    ]
  },
  {
    line: "포레스타 G",
    collection: "FORESTA G",
    series: "천연마루",
    spec: "T11 x W190 x L1,900mm",
    note: "천연마루 / 11T / 광폭",
    products: [
      { name: "뉴 캐시미어 화이트", eng: "New Cashmere White" },
      { name: "뉴 허스크 베이지", eng: "New Husk Beige" },
      { name: "뉴 매리골드", eng: "New Marigold" },
      { name: "뉴 오닉스 블랙", eng: "New Onix Black" },
      { name: "뉴 아몬드 옐로우", eng: "New Almond Yellow" }
    ]
  },
  {
    line: "포레스타",
    collection: "FORESTA",
    series: "천연마루",
    spec: "T10.5 x W165 x L1,200mm",
    note: "천연마루",
    products: [
      { name: "오크 라이트", eng: "Oak Light" },
      { name: "오크 내추럴", eng: "Oak Natural" },
      { name: "오크 베이지", eng: "Oak Beige" },
      { name: "아몬드 브라운", eng: "Almond Brown" },
      { name: "허니 옐로우", eng: "Honey Yellow" },
      { name: "순수 베이지", eng: "Sunsu Beige" },
      { name: "모카 그레이", eng: "Mocha Grey" }
    ]
  },
  {
    line: "그린",
    collection: "GRIN",
    series: "강마루",
    note: "프리미엄 강마루 / 10.5T / 4개 규격",
    specs: {
      "230": "T10.5 x W230 x L2,430mm",
      "190": "T10.5 x W190 x L1,615mm",
      "165": "T10.5 x W165 x L1,200mm",
      "125": "T10.5 x W125 x L800mm"
    },
    products: [
      { name: "마일드 크림", eng: "Mild Cream", options: ["230", "190", "165", "125"] },
      { name: "마일드 베이지", eng: "Mild Beige", options: ["190", "165", "125"] },
      { name: "마일드 아이보리_카믈리", eng: "Mild Ivory_Calmly", options: ["165"] },
      { name: "마일드 오크", eng: "Mild Oak", options: ["230", "190", "165", "125"] },
      { name: "마일드 오크_데일리", eng: "Mild Oak_Daily", options: ["165"] },
      { name: "마일드 오크_퓨얼리", eng: "Mild Oak_Purely", options: ["165"] },
      { name: "마일드 골드", eng: "Mild Gold", options: ["190", "125"] },
      { name: "마일드 티크", eng: "Mild Teak", options: ["230", "165"] },
      { name: "마일드 화이트", eng: "Mild White", options: ["190", "125"] },
      { name: "마일드 화이트_심플리", eng: "Mild White_Simply", options: ["165"] },
      { name: "러스틱 미스트", eng: "Rustic Mist", options: ["230"] },
      { name: "러스틱 그레이", eng: "Rustic Grey", options: ["230"] },
      { name: "러스틱 오크", eng: "Rustic Oak", options: ["230"] },
      { name: "러스틱 브라운", eng: "Rustic Brown", options: ["230", "165"] },
      { name: "내추럴 샌드", eng: "Natural Sand", options: ["230", "190", "165", "125"] },
      { name: "내추럴 오크", eng: "Natural Oak", options: ["230", "190", "165", "125"] },
      { name: "내추럴 다크 쏘우", eng: "Natural Dark Saw", options: ["230", "165"] }
    ]
  },
  {
    line: "그린 스퀘어",
    collection: "GRIN SQUARE",
    series: "강마루",
    note: "프리미엄 사각 강마루 / 10.5T",
    specs: {
      "597": "T10.5 x W597 x L597mm",
      "395": "T10.5 x W395 x L800mm"
    },
    products: [
      { name: "데저트 크림", eng: "Desert Cream", options: ["597", "395"] },
      { name: "브리즈 그레이", eng: "Breeze Grey", options: ["597", "395"] },
      { name: "글램 스톤", eng: "Glam Stone", options: ["597"] },
      { name: "코랄 클라우드", eng: "Coral Cloud", options: ["597"] },
      { name: "세레나 포그", eng: "Serena Fog", options: ["395"] },
      { name: "밀키웨이 다크", eng: "Milkyway Dark", options: ["395"] }
    ]
  },
  {
    line: "세라 플렉스 S",
    collection: "SERA Flex S",
    series: "강마루",
    note: "강마루 / 우드 & 스톤 디자인",
    specs: {
      "395": "T7.5 x W395 x L800mm",
      "165": "T7.5 x W165 x L1,200mm"
    },
    products: [
      { name: "브루니아 크림", eng: "Brunia Cream", options: ["395"] },
      { name: "셀리나 샌드", eng: "Celina Sand", options: ["395"] },
      { name: "윌로우 그레이", eng: "Willow Grey", options: ["395"] },
      { name: "메테오 스톤", eng: "Meteor Stone", options: ["395"] },
      { name: "무드 화이트", eng: "Mood White", options: ["165"] },
      { name: "모먼트 크림", eng: "Moment Cream", options: ["165"] },
      { name: "미스티 그레이", eng: "Misty Grey", options: ["165"] },
      { name: "블러쉬 샌드", eng: "Blush Sand", options: ["165"] },
      { name: "디어 베이지", eng: "Dear Beige", options: ["165"] },
      { name: "멜로우 골드", eng: "Mellow Gold", options: ["165"] },
      { name: "노블 티크", eng: "Noble Teak", options: ["165"] },
      { name: "데일리 오크", eng: "Daily Oak", options: ["165"] },
      { name: "카믈리 아이보리", eng: "Calmly Ivory", options: ["165"] },
      { name: "허밍 오크", eng: "Humming Oak", options: ["165"] },
      { name: "러블리 베이지", eng: "Lovely Beige", options: ["165"] },
      { name: "퓨얼리 오크", eng: "Purely Oak", options: ["165"] },
      { name: "심플리 화이트", eng: "Simply White", options: ["165"] },
      { name: "젠틀리 티크", eng: "Gently Teak", options: ["165"] }
    ]
  },
  {
    line: "세라 블렌딩",
    collection: "SERA Blending",
    series: "강마루",
    spec: "T7.5 x W115 x L800mm",
    note: "회화적 표면 디자인 / 고강도 HPM",
    products: [
      { name: "비앙코", eng: "Bianco" },
      { name: "오프 화이트", eng: "Off White" },
      { name: "스톤 그레이", eng: "Stone Grey" },
      { name: "그라노 오크", eng: "Grano Oak" },
      { name: "크래프트 오크", eng: "Craft Oak" },
      { name: "내추럴 오크", eng: "Natural Oak" },
      { name: "로맨틱 오크", eng: "Romantic Oak" },
      { name: "브리티시 티크", eng: "British Teak" }
    ]
  },
  {
    line: "세라",
    collection: "SERA",
    series: "강마루",
    spec: "T7.5 x W95 x L800mm",
    note: "강마루 / 18종 디자인 / 고강도 HPM",
    products: [
      { name: "코지 그레이", eng: "Cozy Grey" },
      { name: "애쉬 그레이", eng: "Ash Grey" },
      { name: "크리미 오크", eng: "Creamy Oak" },
      { name: "골드 티크", eng: "Gold Teak" },
      { name: "브리티시 월넛", eng: "British Walnut" },
      { name: "티크", eng: "Teak" },
      { name: "화이트 오크", eng: "White Oak" },
      { name: "N 오크", eng: "N Oak" },
      { name: "마일드 오크", eng: "Mild Oak" },
      { name: "오가닉 오크", eng: "Organic Oak" },
      { name: "오슬로 베이지", eng: "Oslo Beige" },
      { name: "화이트 애쉬", eng: "White Ash" },
      { name: "코튼 화이트", eng: "Cotton White" },
      { name: "노르딕 화이트", eng: "Nordic White" },
      { name: "리사 화이트", eng: "Lisa White" },
      { name: "플로랄 화이트", eng: "Floral White" },
      { name: "스타일리쉬 화이트", eng: "Stylish White" },
      { name: "스노우 워시", eng: "Snow Wash" }
    ]
  },
  {
    line: "세라 베이직",
    collection: "SERA Basic",
    series: "강마루",
    spec: "T6.2 x W115 x L800mm",
    note: "강마루 / 3D 엠보싱 / 고강도 HPM",
    products: [
      { name: "베이직 슈가", eng: "Basic Sugar" },
      { name: "베이직 밀크", eng: "Basic Milk" },
      { name: "베이직 크림", eng: "Basic Cream" },
      { name: "베이직 바닐라", eng: "Basic Vanilla" },
      { name: "베이직 버터", eng: "Basic Butter" },
      { name: "베이직 오크", eng: "Basic Oak" },
      { name: "베이직 티크", eng: "Basic Teak" },
      { name: "베이직 쿠키", eng: "Basic Cookie" }
    ]
  }
];

function findEagonImagePath(line, productName) {
  // Normalize search term
  const cleanTerm = (term) => String(term).replace(/[^a-zA-Z0-9가-힣]/g, '').replace(/뮬/g, '물').toLowerCase().trim();
  const normName = cleanTerm(productName);
  const normNameNoNew = cleanTerm(productName.replace(/^뉴\s*/, ''));
  const normLine = cleanTerm(line);

  // Search in allFiles
  let bestMatch = null;

  for (const filePath of allFiles) {
    const rel = path.relative(SOURCE_DIR, filePath).replace(/\\/g, '/');
    if (!rel.includes('마루/이건')) continue;

    const ext = path.extname(filePath);
    const fileNameOnly = path.basename(filePath, ext);
    const normFile = cleanTerm(fileNameOnly);

    if (normFile === normName || normFile === normNameNoNew) {
      // Check if path contains the line name for extra verification
      const cleanPath = cleanTerm(rel);
      if (cleanPath.includes(normLine) || (normLine.includes('240') && cleanPath.includes('150'))) {
        return '/images/Thumbnail_Image/materials/' + rel;
      }
      if (!bestMatch) {
        bestMatch = '/images/Thumbnail_Image/materials/' + rel;
      }
    }
  }

  // fallback template if not found on disk
  return bestMatch || `/images/Thumbnail_Image/materials/마루/이건/강마루/세라/세라/${productName}.jpg`;
}

function buildEagonProducts() {
  const eagonProducts = [];
  EAGON_LINEUPS.forEach(lineup => {
    lineup.products.forEach(p => {
      // Create unique slug ID
      const LINE_SLUGS = {
        "라르고 솔레 240 T4": "largo-sole-240-t4",
        "라르고 솔레 190 T3": "largo-sole-190-t3",
        "라르고 솔레 190 T1": "largo-sole-190-t1",
        "포레스타 G": "foresta-g",
        "포레스타": "foresta",
        "그린": "grin",
        "그린 스퀘어": "grin-square",
        "세라 플렉스 S": "sera-flex-s",
        "세라 블렌딩": "sera-blending",
        "세라": "sera",
        "세라 베이직": "sera-basic"
      };
      const lineSlug = LINE_SLUGS[lineup.line] || lineup.line.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const nameSlug = p.eng.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const id = `eagon-${lineSlug}-${nameSlug}`;

      // Build sizeOptions
      let sizeOptions = undefined;
      let defaultSpec = lineup.spec || "";
      if (lineup.specs && p.options) {
        sizeOptions = p.options.map(optKey => {
          const specStr = lineup.specs[optKey];
          // Parse thickness, width, length using regex
          const tMatch = specStr.match(/T(\d+(?:\.\d+)?)/);
          const wMatch = specStr.match(/W(\d+)/);
          const lMatch = specStr.match(/L([\d,]+)/);
          
          return {
            label: optKey,
            spec: specStr,
            thickness: tMatch ? tMatch[1] + "T" : "",
            width: wMatch ? wMatch[1] + "mm" : "",
            length: lMatch ? lMatch[1] + "mm" : "",
            package: "",
            price: null
          };
        });
        defaultSpec = sizeOptions[0].spec; // representative spec is the first option
      }

      // Resolve actual image path
      const expectedImagePath = findEagonImagePath(lineup.line, p.name);

      const tMatch = defaultSpec.match(/T(\d+(?:\.\d+)?)/);
      const defaultThickness = tMatch ? tMatch[1] + "T" : "";

      const productObj = {
        id,
        category: "마루",
        brand: "이건",
        line: lineup.line,
        subLine: lineup.line,
        name: p.name,
        productName: `${p.name}_${lineup.line}`,
        code: null,
        collection: lineup.collection,
        series: lineup.series,
        thumbnail: expectedImagePath,
        image: expectedImagePath,
        images: [expectedImagePath],
        price: null,
        thickness: defaultThickness,
        specs: {
          division: lineup.line,
          thickness: defaultThickness,
          size: defaultSpec,
          packing: ""
        },
        description: lineup.line,
        note: lineup.note,
        catalog: "EAGON FLOORING GUIDE ver.26"
      };

      if (sizeOptions) {
        productObj.sizeOptions = sizeOptions;
      }

      eagonProducts.push(productObj);
    });
  });
  return eagonProducts;
}

// push Eagon products
products.push(...buildEagonProducts());

// 5. Generate outputs
const BRANDS_BY_CATEGORY = {
  "데코타일": ["KCC", "LX", "녹수", "동신", "재영", "현대", "대진", "유성"],
  "장판": ["LX하우시스", "현대", "KCC"],
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
