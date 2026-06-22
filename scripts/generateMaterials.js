import fs from 'fs';
import path from 'path';
import { dongshinPolymer2026 } from '../src/data/dongshinPolymer2026.js';

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
  
  if (category === '마루' && brand === '이건') {
    return;
  }
  
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
  
  // Search in dongshinPolymer2026 for brand "동신" and category "데코타일"
  const dongshinMatch = (brand === '동신' && category === '데코타일') 
    ? dongshinPolymer2026.find(d => d.code.toUpperCase() === code.toUpperCase())
    : null;

  let price = 0;
  let size = "";
  let unit = "";
  let thickness = "";
  let description = line;
  let name = code;

  if (dongshinMatch) {
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

      // Infer image path
      const folderName = "이건" + lineup.line.replace(/\s+/g, "");
      const imageName = p.name;
      const expectedImagePath = `/images/Thumbnail_Image/materials/마루/이건/${folderName}/${imageName}.jpg`;

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
