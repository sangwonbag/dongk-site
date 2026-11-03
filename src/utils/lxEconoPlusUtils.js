/**
 * LX하우시스 에코노플러스 (ECONO PLUS) 전용 유틸리티
 */

export const LX_ECONOPLUS_SPECS = ['all', '600각', '450각', '우드'];

export const LX_ECONOPLUS_SPEC_LABEL_MAP = {
  all: '전체 104종',
  '600각': '600각 77종',
  '450각': '450각 16종',
  '우드': '우드 11종'
};

export const LX_ECONOPLUS_SPEC_INFO = {
  '600각': {
    size: '600×600mm',
    thickness: '3.0T',
    pcs: '9매',
    packing: '9매 / BOX (3.24㎡)',
    area: '3.24㎡',
    pyeong: '약 0.98평'
  },
  '450각': {
    size: '450×450mm',
    thickness: '3.0T',
    pcs: '16매',
    packing: '16매 / BOX (3.24㎡)',
    area: '3.24㎡',
    pyeong: '약 0.98평'
  },
  '우드': {
    size: '180×1200mm',
    thickness: '3.0T',
    pcs: '15매',
    packing: '15매 / BOX (3.24㎡)',
    area: '3.24㎡',
    pyeong: '약 0.98평'
  }
};

export const LX_ECONOPLUS_5_LAYERS = [
  {
    step: 'Layer 1',
    name: '고강도 표면처리층 (Metal Shield)',
    desc: '특수 고강도 메탈실드 표면코팅으로 생활 스크래치와 오염을 강력히 방지 (마틴데일 테스트 최고 B1 등급)'
  },
  {
    step: 'Layer 2',
    name: '보호 필름층 (Wear Layer)',
    desc: '보행 빈도가 높은 상업 공간에서도 디자인층을 보호하고 마모를 억제하는 고기능 투명 보호 필름층'
  },
  {
    step: 'Layer 3',
    name: '디자인층 (Design Layer)',
    desc: '스톤, 마블, 테라조, 우드 등의 질감을 TrueMatte 무광 및 TrueView 디지털 인쇄로 사실감 넘치게 구현'
  },
  {
    step: 'Layer 4',
    name: 'Base층 (Base Layer)',
    desc: '온·습도 변화에 따른 수축·팽창을 방지하고 균일한 치수 안정성과 탁월한 내구성을 제공하는 베이스층'
  },
  {
    step: 'Layer 5',
    name: 'Balance층 (Balance Layer)',
    desc: '바닥 접착제와의 결합력을 극대화하고 제품 뒤틀림을 방지하여 완벽한 평탄도를 유지하는 밸런스층'
  }
];

export function isLxEconoPlusProduct(product) {
  if (!product) return false;
  const brand = (product.brand || '').toUpperCase();
  const category = (product.category || '').trim();
  const line = (product.line || product.subLine || product.family || '').trim();
  const code = (product.code || product.product_code || '').trim().toUpperCase();
  const id = (product.id || '').toLowerCase();

  const isLx = brand.includes('LX') || brand.includes('LG') || id.includes('lx');
  const isDeco = category === '데코타일' || id.includes('데코타일');
  const isEconoLine = line.includes('에코노플러스') || id.includes('에코노플러스');
  const isEconoCode = /^DE[TW]\d{4}/i.test(code);

  return (isLx && isDeco && (isEconoLine || isEconoCode)) || id.includes('에코노플러스');
}

export function getLxEconoPlusSpecType(product) {
  if (!product) return '600각';
  if (product.spec_type) return product.spec_type;
  if (product.shape) return product.shape;

  const size = (product.specs?.size || product.spec || product.size_text || '').replace(/\s+/g, '');
  const code = (product.code || product.product_code || '').toUpperCase();

  if (code.startsWith('DEW') || size.includes('180') || size.includes('1200')) {
    return '우드';
  }
  if (size.includes('450')) {
    return '450각';
  }
  return '600각';
}

