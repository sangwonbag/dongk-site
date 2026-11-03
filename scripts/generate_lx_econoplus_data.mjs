// scripts/generate_lx_econoplus_data.mjs
import fs from 'fs';
import path from 'path';

const baseDir = path.resolve('public/images/Thumbnail_Image/materials/데코타일/LX/에코노플러스');
const dir600 = fs.readdirSync(path.join(baseDir, '600각'));
const dir450 = fs.readdirSync(path.join(baseDir, '450각'));
const dirWood = fs.readdirSync(path.join(baseDir, '우드'));

function findImageFile(dirList, code) {
  const file = dirList.find(f => f.startsWith(code + '_') || f.startsWith(code + '.'));
  if (!file) throw new Error(`Missing image file for code: ${code}`);
  return file;
}

const raw600 = [
  // 콘크리트 19종
  { group: '콘크리트', pattern: '클레이 콘크리트', codes: ['DET6553', 'DET6554', 'DET6555', 'DET6556'], tm: true, tv: false, colors: ['베이지', '그레이', '웜그레이', '샌드'] },
  { group: '콘크리트', pattern: '내추럴 콘크리트', codes: ['DET6557', 'DET6558', 'DET6559'], tm: true, tv: false, colors: ['라이트그레이', '미디엄그레이', '다크그레이'] },
  { group: '콘크리트', pattern: '어반 콘크리트', codes: ['DET6550', 'DET6551', 'DET6552'], tm: true, tv: false, colors: ['베이지그레이', '쿨그레이', '딥차콜'] },
  { group: '콘크리트', pattern: '메탈 콘크리트', codes: ['DET6235', 'DET6236', 'DET6242', 'DET6243', 'DET6244'], tm: false, tv: false, colors: ['스틸그레이', '메탈릭', '차콜', '다크'] },
  { group: '콘크리트', pattern: '노출 콘크리트', codes: ['DET6237', 'DET6238', 'DET6251', 'DET6252'], tm: false, tv: false, colors: ['시멘트', '라이트그레이', '그레이', '어반'] },
  // 그라니트·스틸 3종
  { group: '그라니트·스틸', pattern: '그라니트', codes: ['DET6291', 'DET6292'], tm: false, tv: false, colors: ['그레이', '스톤', '화강암'] },
  { group: '그라니트·스틸', pattern: '에이지드 스틸', codes: ['DET6312'], tm: false, tv: false, colors: ['다크', '메탈', '스틸'] },
  // 마블 14종
  { group: '마블', pattern: '컴포트 마블', codes: ['DET6566', 'DET6567', 'DET6568'], tm: true, tv: false, colors: ['화이트', '크림', '소프트베이지'] },
  { group: '마블', pattern: '피렌체 마블', codes: ['DET6207', 'DET6208'], tm: false, tv: false, colors: ['비앙코', '화이트', '대리석'] },
  { group: '마블', pattern: '크랙 마블', codes: ['DET6256', 'DET6257', 'DET6258'], tm: false, tv: false, colors: ['그레이', '화이트', '마블'] },
  { group: '마블', pattern: '비안코', codes: ['DET6203', 'DET6204'], tm: false, tv: false, colors: ['화이트', '비앙코', '대리석'] },
  { group: '마블', pattern: '마블', codes: ['DET6229', 'DET6271', 'DET6272', 'DET6273'], tm: false, tv: false, colors: ['대리석', '화이트', '베이지', '그레이'] },
  // 테라조 8종
  { group: '테라조', pattern: '베이직 테라조', codes: ['DET6569', 'DET6570', 'DET6571'], tm: true, tv: false, colors: ['아이보리', '그레이', '테라조'] },
  { group: '테라조', pattern: '비안코 테라조', codes: ['DET6572', 'DET6573', 'DET6574'], tm: false, tv: true, colors: ['화이트', '비앙코', '테라조'] },
  { group: '테라조', pattern: '테라조', codes: ['DET6281', 'DET6282'], tm: false, tv: false, colors: ['도트', '그레이', '테라조'] },
  // 샌드·라임 6종
  { group: '샌드·라임', pattern: '라임 스톤', codes: ['DET6560', 'DET6561', 'DET6562'], tm: true, tv: false, colors: ['샌드', '베이지', '라임스톤'] },
  { group: '샌드·라임', pattern: '칩 세라믹', codes: ['DET6563', 'DET6564', 'DET6565'], tm: true, tv: false, colors: ['세라믹', '아이보리', '그레이'] },
  // 우븐·패브릭 9종
  { group: '우븐·패브릭', pattern: '우븐', codes: ['DET6325', 'DET6326', 'DET6330'], tm: false, tv: false, colors: ['직조', '베이지', '브라운'] },
  { group: '우븐·패브릭', pattern: '라인 우븐', codes: ['DET6340', 'DET6341'], tm: false, tv: false, colors: ['스트라이프', '그레이'] },
  { group: '우븐·패브릭', pattern: '패브릭', codes: ['DET2981', 'DET2983', 'DET2991', 'DET2992'], tm: false, tv: false, colors: ['패브릭', '웜그레이', '차콜'] },
  // 카펫 패턴 11종
  { group: '카펫', pattern: '아트 러그', codes: ['DET6579', 'DET6580'], tm: false, tv: true, caution: 'art_rug', colors: ['러그', '모던', '카펫'] },
  { group: '카펫', pattern: '마운틴 카펫', codes: ['DET6577', 'DET6578'], tm: false, tv: true, colors: ['카펫', '그레이', '텍스처'] },
  { group: '카펫', pattern: '베이직 카펫', codes: ['DET6575', 'DET6576'], tm: true, tv: false, colors: ['소프트카펫', '차콜', '그레이'] },
  { group: '카펫', pattern: '패턴 카펫', codes: ['DET6064', 'DET6075', 'DET6076'], tm: false, tv: false, colors: ['지오메트릭', '카펫'] },
  { group: '카펫', pattern: '솔리드 카펫', codes: ['DET6008', 'DET6014'], tm: false, tv: false, colors: ['솔리드', '모던카펫'] },
  // 우드 패턴 600각 3종
  { group: '우드 600각', pattern: '파켓 우드', codes: ['DET6523'], tm: false, tv: false, caution: 'wood_600', colors: ['파켓', '우드', '원목', '브라운'] },
  { group: '우드 600각', pattern: '모던', codes: ['DET6262', 'DET6263'], tm: false, tv: false, caution: 'wood_600', colors: ['모던우드', '내추럴', '오크'] },
  // 스파클링 메탈 4종
  { group: '스파클링 메탈', pattern: '스파클링 메탈', codes: ['DET6245', 'DET6246', 'DET6247', 'DET6248'], tm: false, tv: false, colors: ['메탈', '스파클링', '실버', '차콜'] }
];

const raw450 = [
  // 스톤 10종
  { group: '스톤', pattern: '노출 콘크리트', codes: ['DET2904', 'DET2905', 'DET2493', 'DET2494'], tm: false, tv: false, colors: ['시멘트', '콘크리트', '그레이', '라이트그레이'] },
  { group: '스톤', pattern: '마블', codes: ['DET2251', 'DET6239', 'DET6240'], tm: false, tv: false, colors: ['대리석', '화이트', '베이지', '마블'] },
  { group: '스톤', pattern: '그라니트', codes: ['DET2116', 'DET2125'], tm: false, tv: false, colors: ['그라니트', '스톤', '화강석'] },
  { group: '스톤', pattern: '세라믹', codes: ['DET2407'], tm: false, tv: false, colors: ['세라믹', '아이보리', '스톤'] },
  // 카펫 패턴 6종
  { group: '카펫', pattern: '올 오버 카펫', codes: ['DET2870', 'DET2871', 'DET2872'], tm: false, tv: false, colors: ['카펫', '올오버', '그레이', '모던'] },
  { group: '카펫', pattern: '패턴 카펫', codes: ['DET2862', 'DET2821', 'DET2823'], tm: false, tv: false, colors: ['카펫', '패턴', '차콜'] }
];

const rawWood = [
  { group: '우드', pattern: '오크', codes: ['DEW4206'], tm: false, tv: false, colors: ['오크', '내추럴', '원목', '브라운'] },
  { group: '우드', pattern: '워시드 오크', codes: ['DEW4608', 'DEW4707'], tm: false, tv: false, colors: ['워시드', '오크', '화이트오크', '라이트우드'] },
  { group: '우드', pattern: '체리', codes: ['DEW4709'], tm: false, tv: false, colors: ['체리', '레디쉬', '원목', '브라운'] },
  { group: '우드', pattern: '티크', codes: ['DEW4752', 'DEW4792'], tm: false, tv: false, colors: ['티크', '다크브라운', '월넛', '고급우드'] },
  { group: '우드', pattern: '켄트 엘름', codes: ['DEW2620'], tm: false, tv: false, colors: ['엘름', '내추럴', '우드', '베이지우드'] },
  { group: '우드', pattern: '허니 오크', codes: ['DEW2631', 'DEW2632'], tm: false, tv: false, colors: ['허니오크', '골드브라운', '따뜻한우드'] },
  { group: '우드', pattern: '카빙 오크', codes: ['DEW2671', 'DEW2672'], tm: false, tv: false, colors: ['카빙오크', '빈티지', '텍스처', '오크'] }
];

const items = [];

function createItem({ code, pattern, group, specType, size, pcs, area, pyeong, dirList, subDir, tm, tv, caution, colors }) {
  const fileName = findImageFile(dirList, code);
  const imgPath = `/images/Thumbnail_Image/materials/데코타일/LX/에코노플러스/${subDir}/${fileName}`;
  const codeNum = code.replace(/\D/g, '');
  const slug = `decotile-lx-econoplus-${specType.toLowerCase()}-${code.toLowerCase()}-${pattern.replace(/\s+/g, '-').toLowerCase()}`;
  const id = `데코타일-lx-에코노플러스-${specType}-${code}-${pattern.replace(/\s+/g, '-')}`;

  const features = [
    'Metal Shield 고강도 표면코팅',
    '표면 스크래치 저항성 (마틴데일 테스트 B1 등급)'
  ];
  if (tm) features.push('TrueMatte 무광 기술');
  if (tv) features.push('TrueView 디지털 인쇄 기술');

  const cautions = [
    '인쇄 색상 및 모니터 해상도에 따라 실제 제품 색상과 다소 차이가 있을 수 있습니다.',
    '천연 원목 및 석재의 자연스러운 질감을 살려 원장별·부위별 무늬 편차가 있을 수 있으므로 시공 전 실제 샘플 확인을 권장합니다.'
  ];
  if (caution === 'art_rug') {
    cautions.push('※ 아트 러그: 제품 특성상 원장별 무늬 편차가 큰 제품이므로 재단 및 시공 시 디자인 배치를 충분히 감안하여 주시기 바랍니다.');
  }
  if (caution === 'wood_600') {
    cautions.push('※ 600각 우드·모던: 장간 무늬 맞춤이 불가하므로 자연스러운 교차시공을 권장합니다.');
  }

  const structure = [
    '1. 고강도 표면처리층 (Metal Shield)',
    '2. 보호 필름층 (Wear Layer)',
    '3. 디자인층 (Design Layer)',
    '4. Base층 (Base Layer)',
    '5. Balance층 (Balance Layer)'
  ];

  const keywords = Array.from(new Set([
    'LX',
    'LX하우시스',
    '에코노플러스',
    '에코노 플러스',
    'ECONO PLUS',
    'ECONOPLUS',
    code,
    codeNum,
    pattern,
    pattern.replace(/\s+/g, ''),
    group,
    group.replace(/\s+/g, ''),
    specType,
    '3.0T',
    '3T',
    '데코타일',
    'LVT',
    '상업용데코타일',
    ...(colors || [])
  ]));

  if (tm) {
    keywords.push('TrueMatte', '무광', '표면무광');
  }
  if (tv) {
    keywords.push('TrueView', '디지털인쇄', '고해상도인쇄');
  }

  return {
    id,
    slug,
    category: '데코타일',
    brand: 'LX하우시스',
    line: '에코노플러스',
    subLine: '에코노플러스',
    family: '에코노플러스',
    series: '에코노플러스',
    spec_type: specType,
    shape: specType,
    code,
    product_code: code,
    name: pattern,
    product_name: `에코노플러스 ${code} ${pattern}`,
    pattern,
    pattern_name: pattern,
    pattern_group: group,
    thickness: '3.0T',
    size,
    spec: `${size} × 3.0T`,
    size_text: size,
    package: `${pcs}매 / BOX (${area})`,
    unit: 'BOX',
    price: 0,
    thumbnail: imgPath,
    image: imgPath,
    images: [imgPath],
    specs: {
      brand: 'LX하우시스',
      line: '에코노플러스',
      division: '에코노플러스',
      code,
      pattern,
      shape: specType,
      spec_type: specType,
      thickness: '3.0T',
      size,
      pcs_per_box: `${pcs}매`,
      packing: `${pcs}매 / BOX (${area})`,
      area,
      box_pyeong: pyeong,
      unit: 'BOX',
      surface: 'Metal Shield 고강도 표면코팅',
      scratch_resistance: '마틴데일 테스트 B1 등급'
    },
    features,
    hasTrueMatte: !!tm,
    hasTrueView: !!tv,
    cautionType: caution || 'standard',
    cautions,
    structure,
    description: `LX하우시스 에코노플러스 3.0T ${pattern} (${code}). 고강도 메탈실드(Metal Shield) 표면코팅과 탁월한 스크래치 저항성을 자랑하는 ${specType} 프리미엄 상업·주거 데코타일.`,
    keywords
  };
}

// 1. 600각 (77종)
for (const entry of raw600) {
  for (const code of entry.codes) {
    items.push(createItem({
      code,
      pattern: entry.pattern,
      group: entry.group,
      specType: '600각',
      size: '600×600mm',
      pcs: 9,
      area: '3.24㎡',
      pyeong: '약 0.98평',
      dirList: dir600,
      subDir: '600각',
      tm: entry.tm,
      tv: entry.tv,
      caution: entry.caution,
      colors: entry.colors
    }));
  }
}

// 2. 450각 (16종)
for (const entry of raw450) {
  for (const code of entry.codes) {
    items.push(createItem({
      code,
      pattern: entry.pattern,
      group: entry.group,
      specType: '450각',
      size: '450×450mm',
      pcs: 16,
      area: '3.24㎡',
      pyeong: '약 0.98평',
      dirList: dir450,
      subDir: '450각',
      tm: entry.tm,
      tv: entry.tv,
      caution: entry.caution,
      colors: entry.colors
    }));
  }
}

// 3. 우드 (11종)
for (const entry of rawWood) {
  for (const code of entry.codes) {
    items.push(createItem({
      code,
      pattern: entry.pattern,
      group: entry.group,
      specType: '우드',
      size: '180×1200mm',
      pcs: 15,
      area: '3.24㎡',
      pyeong: '약 0.98평',
      dirList: dirWood,
      subDir: '우드',
      tm: entry.tm,
      tv: entry.tv,
      caution: entry.caution,
      colors: entry.colors
    }));
  }
}

console.log('Total items created:', items.length);
const c600 = items.filter(i => i.spec_type === '600각').length;
const c450 = items.filter(i => i.spec_type === '450각').length;
const cWood = items.filter(i => i.spec_type === '우드').length;
console.log(`Counts -> 600각: ${c600}, 450각: ${c450}, 우드: ${cWood}`);

// Write to src/data/lxEconoPlus104.js
const fileContent = `/**
 * LX하우시스 에코노플러스 3T (ECONO PLUS) 104종 마스터 데이터
 * - 600각: 77종 (600×600×3.0T, 9매/BOX, 3.24㎡)
 * - 450각: 16종 (450×450×3.0T, 16매/BOX, 3.24㎡)
 * - 우드: 11종 (180×1200×3.0T, 15매/BOX, 3.24㎡)
 * 총합: 104종
 */

export const LX_ECONO_PLUS_104 = ${JSON.stringify(items, null, 2)};
`;

fs.writeFileSync(path.resolve('src/data/lxEconoPlus104.js'), fileContent, 'utf8');
console.log('✓ Successfully written to src/data/lxEconoPlus104.js');

