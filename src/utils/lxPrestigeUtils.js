/**
 * LX하우시스 프레스티지 5T (PRESTG) 전용 유틸리티
 * - 600각: 8종 (5.0T × 600×600mm, 5매/BOX, 1.80㎡)
 * - 장방형 스톤: 2종 (5.0T × 457.2×914.4mm, 5매/BOX, 2.09㎡) — 동조엠보(EIR) 적용
 * - 우드: 4종 (5.0T × 228.6×1523mm, 6매/BOX, 2.09㎡) — 동조엠보(EIR) 적용
 * 총 14종
 */

export const LX_PRESTIGE_SPECS = ['all', '600각', '장방형 스톤', '우드'];

export const LX_PRESTIGE_SPEC_LABEL_MAP = {
  all: '전체',
  '600각': '600각',
  '장방형 스톤': '장방형 스톤',
  '우드': '우드'
};

export const LX_PRESTIGE_SPEC_INFO = {
  '600각': {
    label: '600각',
    size: '600×600mm',
    thickness: '5.0T',
    pcs: '5매',
    packing: '5매 / BOX (1.80㎡)',
    area: '1.80㎡',
    pyeong: '약 0.54평'
  },
  '장방형 스톤': {
    label: '장방형 스톤',
    size: '457.2×914.4mm',
    thickness: '5.0T',
    pcs: '5매',
    packing: '5매 / BOX (2.09㎡)',
    area: '2.09㎡',
    pyeong: '약 0.63평'
  },
  '우드': {
    label: '우드',
    size: '228.6×1523mm',
    thickness: '5.0T',
    pcs: '6매',
    packing: '6매 / BOX (2.09㎡)',
    area: '2.09㎡',
    pyeong: '약 0.63평'
  }
};

/**
 * 카탈로그 7쪽 인덱스 기준 동조엠보(EIR) 적용 확인 6종 코드
 * (PTT8696, PTT8698, PTW7961, PTW7964, PTW7902, PTW7904)
 */
export const LX_PRESTIGE_EIR_CODES = new Set([
  'PTT8696',
  'PTT8698',
  'PTW7961',
  'PTW7964',
  'PTW7902',
  'PTW7904'
]);

/**
 * 프레스티지 5T 카탈로그 3쪽 도면 기준 6계층 제품 구조
 */
export const LX_PRESTIGE_6_LAYERS = [
  {
    step: 'Layer 1',
    name: '고강도 표면처리 (Metal Shield)',
    desc: '고강도 특수 표면처리 코팅을 적용하여 생활 스크래치와 오염으로부터 표면을 보호합니다 (자체 시험 마틴데일 B1 등급).'
  },
  {
    step: 'Layer 2',
    name: '고내구성 EIR 표면층',
    desc: '보행 마모와 하중을 견디는 고내구성 투명 보호층으로, 동조엠보(EIR) 적용 모델은 디자인 패턴과 표면 엠보의 정밀한 일치를 구현합니다.'
  },
  {
    step: 'Layer 3',
    name: '고해상도 디자인층',
    desc: '초고해상도 인쇄 기술을 적용하여 천연 석재와 와이드 원목 특유의 깊이 있는 질감과 컬러를 사실감 있게 구현합니다.'
  },
  {
    step: 'Layer 4',
    name: '전사방지층',
    desc: '하부 바탕면 또는 접착 성분의 상부 이염(전사)을 효과적으로 차단하여 표면 컬러 변화를 방지합니다.'
  },
  {
    step: 'Layer 5',
    name: 'Base층',
    desc: '5.0T 고두께 설계를 통해 치수 안정성을 높이고 묵직한 보행감과 충격 흡수력을 제공합니다.'
  },
  {
    step: 'Layer 6',
    name: '전사방지·Balance층',
    desc: '하부 습기 및 오염의 전사를 억제하고 타일 뒷면의 평탄도와 균형을 안정적으로 유지합니다.'
  }
];

export function isLxPrestigeProduct(product) {
  if (!product) return false;
  const brand = String(product.brand || '').toUpperCase();
  const category = String(product.category || '').trim();
  const line = String(product.line || product.subLine || product.family || product.series || '').trim();
  const desc = String(product.description || '').trim();
  const code = String(product.code || product.product_code || '').trim().toUpperCase();
  const id = String(product.id || '').toLowerCase();

  const isLx = brand.includes('LX') || brand.includes('LG') || id.includes('lx');
  const isDeco = category === '데코타일' || id.includes('데코타일') || id.includes('decotile');
  const isPrestigeLine =
    line.includes('프레스티지') ||
    line.toUpperCase().includes('PRESTG') ||
    desc.includes('프레스티지') ||
    id.includes('프레스티지') ||
    id.includes('prestige');
  const isPrestigeCode = /^PT[TW]\d{4}$/i.test(code);

  return (isLx && isDeco && (isPrestigeLine || isPrestigeCode)) || isPrestigeCode || id.includes('프레스티지');
}

export function hasLxPrestigeEir(product) {
  if (!product) return false;
  const code = String(product.code || product.product_code || '').replace(/\s+/g, '').toUpperCase();
  return LX_PRESTIGE_EIR_CODES.has(code);
}

export function getLxPrestigeSpecType(product) {
  if (!product) return '600각';
  const rawSpec = String(product.spec_type || product.shape || '').trim();
  if (rawSpec === '장방형 스톤' || rawSpec === '457.2x914.4' || rawSpec === '457.2×914.4') {
    return '장방형 스톤';
  }
  if (rawSpec === '600각' || rawSpec === '우드') {
    return rawSpec;
  }

  const size = String(product.specs?.size || product.spec || product.size_text || '').replace(/\s+/g, '');
  const code = String(product.code || product.product_code || '').replace(/\s+/g, '').toUpperCase();

  if (code.startsWith('PTW') || size.includes('228.6') || size.includes('1523')) {
    return '우드';
  }
  if (code === 'PTT8696' || code === 'PTT8698' || size.includes('457.2') || size.includes('914.4')) {
    return '장방형 스톤';
  }
  return '600각';
}

