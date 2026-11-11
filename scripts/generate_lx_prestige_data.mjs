// scripts/generate_lx_prestige_data.mjs
import fs from 'fs';
import path from 'path';

const imageDir = path.resolve('public/images/Thumbnail_Image/materials/데코타일/LX/프레스티지');
const dirFiles = fs.readdirSync(imageDir);

function findProductImages(code) {
  const cleanCode = code.toUpperCase();
  const matched = dirFiles.filter(f => {
    const upper = f.toUpperCase();
    return upper.startsWith(cleanCode + '_') || upper.startsWith(cleanCode + '.');
  });
  if (matched.length === 0) {
    throw new Error(`Missing image file for code: ${code}`);
  }

  // Strict ordering: 원본(0) -> 2x2/확장(1) -> 90cross(2) -> 사용권한 확인 시공예시(3) -> 기타(4)
  const rank = (fileName) => {
    const lower = fileName.toLowerCase();
    if (lower.includes('2x2') || lower.includes('2_2') || lower.includes('확장')) return 1;
    if (lower.includes('90cross') || lower.includes('cross') || lower.includes('크로스')) return 2;
    if (lower.includes('시공') || lower.includes('사무실') || lower.includes('상업')) return 3;
    if (lower.includes('180cross')) return 4;
    return 0;
  };

  matched.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  return matched.map(f => `/images/Thumbnail_Image/materials/데코타일/LX/프레스티지/${f}`);
}

const RAW_PRESTIGE_14 = [
  // 600각 (8종): 5.0T × 600×600mm / 5매 / 1.80㎡ (EIR 미확인 -> false)
  {
    specType: '600각',
    size: '600×600mm',
    pcs: 5,
    area: '1.80㎡',
    pyeong: '약 0.54평',
    group: '샌드·라임',
    code: 'PTT6952',
    pattern: '샌드베이지',
    spacedPattern: '샌드 베이지',
    hasEir: false,
    pdfPage: 8,
    resolution: '2000x656',
    colors: ['베이지', '샌드', '샌드베이지', '아이보리', '웜톤']
  },
  {
    specType: '600각',
    size: '600×600mm',
    pcs: 5,
    area: '1.80㎡',
    pyeong: '약 0.54평',
    group: '샌드·라임',
    code: 'PTT6953',
    pattern: '솔리드칩',
    spacedPattern: '솔리드 칩',
    hasEir: false,
    pdfPage: 8,
    resolution: '2000x656',
    colors: ['그레이', '칩', '샌드', '라임스톤', '솔리드']
  },
  {
    specType: '600각',
    size: '600×600mm',
    pcs: 5,
    area: '1.80㎡',
    pyeong: '약 0.54평',
    group: '콘크리트',
    code: 'PTT6950',
    pattern: '미스티콘크리트',
    spacedPattern: '미스티 콘크리트',
    hasEir: false,
    pdfPage: 9,
    resolution: '2000x656',
    colors: ['콘크리트', '그레이', '미스티', '시멘트', '무광']
  },
  {
    specType: '600각',
    size: '600×600mm',
    pcs: 5,
    area: '1.80㎡',
    pyeong: '약 0.54평',
    group: '콘크리트',
    code: 'PTT6913',
    pattern: '펄콘크리트',
    spacedPattern: '펄 콘크리트',
    hasEir: false,
    pdfPage: 9,
    resolution: '1202x572',
    colors: ['콘크리트', '펄', '라이트그레이', '실버']
  },
  {
    specType: '600각',
    size: '600×600mm',
    pcs: 5,
    area: '1.80㎡',
    pyeong: '약 0.54평',
    group: '콘크리트',
    code: 'PTT6910',
    pattern: '메탈',
    spacedPattern: '메탈',
    hasEir: false,
    pdfPage: 9,
    resolution: '1499x491',
    colors: ['메탈', '콘크리트', '스틸', '그레이', '모던']
  },
  {
    specType: '600각',
    size: '600×600mm',
    pcs: 5,
    area: '1.80㎡',
    pyeong: '약 0.54평',
    group: '콘크리트',
    code: 'PTT6912',
    pattern: '메탈',
    spacedPattern: '메탈',
    hasEir: false,
    pdfPage: 9,
    resolution: '1499x491',
    colors: ['메탈', '콘크리트', '차콜', '다크그레이', '모던']
  },
  {
    specType: '600각',
    size: '600×600mm',
    pcs: 5,
    area: '1.80㎡',
    pyeong: '약 0.54평',
    group: '마블',
    code: 'PTT6951',
    pattern: '모던그레이',
    spacedPattern: '모던 그레이',
    hasEir: false,
    pdfPage: 10,
    resolution: '2000x656',
    colors: ['마블', '그레이', '모던', '대리석']
  },
  {
    specType: '600각',
    size: '600×600mm',
    pcs: 5,
    area: '1.80㎡',
    pyeong: '약 0.54평',
    group: '마블',
    code: 'PTT6917',
    pattern: '비안코',
    spacedPattern: '비안코',
    hasEir: false,
    pdfPage: 10,
    resolution: '2000x657',
    colors: ['비안코', '화이트', '마블', '대리석']
  },
  // 장방형 스톤 (2종): 5.0T × 457.2×914.4mm / 5매 / 2.09㎡ (EIR 적용 확인 -> true)
  {
    specType: '장방형 스톤',
    size: '457.2×914.4mm',
    pcs: 5,
    area: '2.09㎡',
    pyeong: '약 0.63평',
    group: '스톤 장방형',
    code: 'PTT8696',
    pattern: '아이스골드',
    spacedPattern: '아이스 골드',
    hasEir: true,
    pdfPage: 11,
    resolution: '656x2000',
    colors: ['아이스골드', '골드', '스톤', '장방형', '장방형 스톤', '화이트']
  },
  {
    specType: '장방형 스톤',
    size: '457.2×914.4mm',
    pcs: 5,
    area: '2.09㎡',
    pyeong: '약 0.63평',
    group: '스톤 장방형',
    code: 'PTT8698',
    pattern: '더스크브론즈',
    spacedPattern: '더스크 브론즈',
    hasEir: true,
    pdfPage: 11,
    resolution: '656x2000',
    colors: ['더스크브론즈', '더스크 브론즈', '브론즈', '다크', '스톤', '장방형', '장방형 스톤']
  },
  // 우드 (4종): 5.0T × 228.6×1523mm / 6매 / 2.09㎡ (EIR 적용 확인 -> true)
  {
    specType: '우드',
    size: '228.6×1523mm',
    pcs: 6,
    area: '2.09㎡',
    pyeong: '약 0.63평',
    group: '우드',
    code: 'PTW7961',
    pattern: '어반사하라',
    spacedPattern: '어반 사하라',
    hasEir: true,
    pdfPage: 12,
    resolution: '796x2431',
    colors: ['어반사하라', '어반 사하라', '우드', '원목', '베이지우드', '와이드우드']
  },
  {
    specType: '우드',
    size: '228.6×1523mm',
    pcs: 6,
    area: '2.09㎡',
    pyeong: '약 0.63평',
    group: '우드',
    code: 'PTW7964',
    pattern: '아메리칸오크',
    spacedPattern: '아메리칸 오크',
    hasEir: true,
    pdfPage: 12,
    resolution: '796x2431',
    colors: ['아메리칸오크', '아메리칸 오크', '오크', '우드', '원목', '브라운', '와이드우드']
  },
  {
    specType: '우드',
    size: '228.6×1523mm',
    pcs: 6,
    area: '2.09㎡',
    pyeong: '약 0.63평',
    group: '우드',
    code: 'PTW7902',
    pattern: '솔트오크',
    spacedPattern: '솔트 오크',
    hasEir: true,
    pdfPage: 12,
    resolution: '569x1742',
    colors: ['솔트오크', '솔트 오크', '오크', '우드', '라이트오크', '와이드우드']
  },
  {
    specType: '우드',
    size: '228.6×1523mm',
    pcs: 6,
    area: '2.09㎡',
    pyeong: '약 0.63평',
    group: '우드',
    code: 'PTW7904',
    pattern: '파인',
    spacedPattern: '파인',
    hasEir: true,
    pdfPage: 12,
    resolution: '569x1742',
    colors: ['파인', '우드', '소나무', '내추럴우드', '와이드우드']
  }
];

const items = RAW_PRESTIGE_14.map(entry => {
  const images = findProductImages(entry.code);
  const mainImg = images[0];
  const codeNum = entry.code.replace(/\D/g, '');
  const specSlug = entry.specType === '장방형 스톤' ? 'stone-rect' : entry.specType.toLowerCase();
  const slug = `decotile-lx-prestige-${specSlug}-${entry.code.toLowerCase()}-${entry.pattern}`;
  const id = `데코타일-lx-프레스티지-${entry.specType.replace(/\s+/g, '-')}-${entry.code}-${entry.pattern}`;

  const features = [
    'Metal Shield 고강도 표면처리 (스크래치 저항성 자체 시험 B1 등급)',
    '바닥 전사방지층 및 전사방지·Balance층 적용',
    '고해상도 디자인층 구현'
  ];
  if (entry.specType === '우드') {
    features.push('228.6×1523mm 와이드 규격 우드 디자인');
  }
  if (entry.hasEir) {
    features.push('동조엠보(EIR) 적용으로 천연 질감과 패턴의 정밀 일치');
  }

  const cautions = [
    '인쇄 색상 및 모니터 해상도 차이로 인해 실제 제품 색상과 차이가 있을 수 있으므로 시공 전 실물 샘플 확인을 권장합니다.',
    '자체 시험 결과(마틴데일 B1 등급)는 LX하우시스 연구소 자체 시험 기준이며 실제 사용 환경에 따라 달라질 수 있습니다.',
    '바닥난방 적합성, 지정 접착제 및 현장별 시공 비용은 현장 조건 확인 후 1:1 상담을 통해 안내해 드립니다.'
  ];

  const structure = [
    '1. 고강도 표면처리 (Metal Shield)',
    '2. 고내구성 EIR 표면층',
    '3. 고해상도 디자인층',
    '4. 전사방지층',
    '5. Base층',
    '6. 전사방지·Balance층'
  ];

  const keywords = Array.from(new Set([
    'LX',
    'LX하우시스',
    '프레스티지',
    '프레스티지 5T',
    '프레스티지5T',
    'PRESTG',
    'PRESTIGE',
    '프리미엄 5T',
    '5.0T',
    '5T',
    entry.code,
    codeNum,
    entry.pattern,
    entry.spacedPattern,
    entry.group,
    entry.group.replace(/\s+/g, ''),
    entry.specType,
    entry.specType.replace(/\s+/g, ''),
    entry.size,
    entry.size.replace(/\s+/g, ''),
    '데코타일',
    'LVT',
    ...(entry.hasEir ? ['EIR', '동조엠보'] : []),
    ...entry.colors
  ]));

  return {
    id,
    slug,
    category: '데코타일',
    brand: 'LX하우시스',
    line: '프레스티지',
    subLine: '프레스티지 5T',
    family: '프레스티지',
    series: '프레스티지 5T (PRESTG)',
    spec_type: entry.specType,
    shape: entry.specType,
    code: entry.code,
    product_code: entry.code,
    name: entry.spacedPattern || entry.pattern,
    product_name: `LX 프레스티지 5T ${entry.code} ${entry.spacedPattern || entry.pattern}`,
    pattern: entry.spacedPattern || entry.pattern,
    pattern_name: entry.pattern,
    pattern_group: entry.group,
    thickness: '5.0T',
    size: entry.size,
    spec: `${entry.size} × 5.0T`,
    size_text: entry.size,
    package: `${entry.pcs}매 / BOX (${entry.area})`,
    unit: 'BOX',
    price: 0,
    isPriceInquiry: true,
    hasEir: entry.hasEir,
    thumbnail: mainImg,
    image: mainImg,
    images,
    specs: {
      brand: 'LX하우시스',
      line: '프레스티지',
      division: '프레스티지 5T (PRESTG)',
      code: entry.code,
      pattern: entry.spacedPattern || entry.pattern,
      shape: entry.specType,
      spec_type: entry.specType,
      thickness: '5.0T',
      size: entry.size,
      pcs_per_box: `${entry.pcs}매`,
      packing: `${entry.pcs}매 / BOX (${entry.area})`,
      area: entry.area,
      box_pyeong: entry.pyeong,
      unit: 'BOX',
      surface: 'Metal Shield 고강도 표면처리',
      scratch_resistance: '자체 시험 B1 등급 (LX하우시스 연구소 자체 시험 기준)',
      eir: entry.hasEir ? '동조엠보(EIR) 적용' : '미확인'
    },
    features,
    cautions,
    structure,
    pdfPage: entry.pdfPage,
    description: `LX하우시스 프레스티지 5T (PRESTG) ${entry.spacedPattern || entry.pattern} (${entry.code}). 5.0T 고두께 설계와 Metal Shield 고강도 표면처리, 바닥 전사방지층을 적용한 ${entry.specType} 프리미엄 LVT 데코타일.`,
    keywords
  };
});

console.log('Total LX Prestige items created:', items.length);
console.log('Counts -> 600각:', items.filter(i => i.spec_type === '600각').length,
            '| 장방형 스톤:', items.filter(i => i.spec_type === '장방형 스톤').length,
            '| 우드:', items.filter(i => i.spec_type === '우드').length,
            '| EIR 적용:', items.filter(i => i.hasEir).length);

const fileContent = `/**
 * LX하우시스 프레스티지 5T (PRESTG) 14종 마스터 데이터
 * - 600각: 8종 (5.0T × 600×600mm, 5매/BOX, 1.80㎡)
 * - 장방형 스톤: 2종 (5.0T × 457.2×914.4mm, 5매/BOX, 2.09㎡) — 동조엠보(EIR) 적용
 * - 우드: 4종 (5.0T × 228.6×1523mm, 6매/BOX, 2.09㎡) — 동조엠보(EIR) 적용
 * 총합: 14종 (가격: 가격 문의)
 */

export const LX_PRESTIGE_14 = ${JSON.stringify(items, null, 2)};
`;

fs.writeFileSync(path.resolve('src/data/lxPrestige14.js'), fileContent, 'utf8');
console.log('✓ Successfully written to src/data/lxPrestige14.js');

