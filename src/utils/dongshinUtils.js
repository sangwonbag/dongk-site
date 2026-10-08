/**
 * 동신포리마 데코타일 라인업 및 세부 분류 유틸리티
 * Total 130 products across 4 major categories (대분류) and 13 detailed lineups (세부 라인업)
 */

export const DONGSHIN_MAJOR_CATEGORIES = [
  "전체",
  "아트 OA타일",
  "아트에코차음",
  "아트하우스",
  "아트타일"
];

export const DONGSHIN_DETAILED_LINEUPS_MAP = {
  "전체": ["전체"],
  "아트 OA타일": ["OA 프리미엄"],
  "아트에코차음": ["우드", "사각"],
  "아트하우스": ["리빙듀오", "하우스 마블"],
  "아트타일": ["600 사각타일", "콘크리트", "앱스트랙", "마블", "카펫", "그라니트", "듀오라인", "앤틱우드"]
};

export const DONGSHIN_ALL_DETAILED_LINEUPS = [
  "OA 프리미엄",
  "우드",
  "사각",
  "리빙듀오",
  "하우스 마블",
  "600 사각타일",
  "콘크리트",
  "앱스트랙",
  "마블",
  "카펫",
  "그라니트",
  "듀오라인",
  "앤틱우드"
];

// 130 target products manifest definition with specs, thickness, unit
export const DONGSHIN_PRODUCT_MANIFEST = [
  // ① 아트 OA타일 (21종) - OA 프리미엄
  ...['OA 317', 'OA 318', 'OA 323', 'OA 328', 'OA 329', 'OA 331', 'OA 334', 'OA 335', 'OA 336', 'OA 337', 'OA 338', 'OA 339', 'OA 340', 'OA 341', 'OA 342', 'OA 343', 'OA 344', 'OA 345', 'OA 346', 'OA 347', 'OA 348'].map(c => ({
    code: c,
    major: '아트 OA타일',
    detail: 'OA 프리미엄',
    spec: '500 x 500 x 5.0mm',
    thickness: '5.0T',
    unit: '13pcs / Box (3.25㎡)'
  })),

  // ② 아트에코차음 (20종) - 우드 (7종), 사각 (13종)
  ...['CH 5700', 'CH 5701', 'CH 5702', 'CH 5703', 'CH 5704', 'CH 5705', 'CH 5706'].map(c => ({
    code: c,
    major: '아트에코차음',
    detail: '우드',
    spec: '250 x 1050 x 5.0mm',
    thickness: '5.0T',
    unit: '12pcs / 3.15㎡'
  })),
  ...['CH 6300', 'CH 6301', 'CH 6302', 'CH 6303', 'CH 6304', 'CH 6305', 'CH 6306', 'CH 6307', 'CH 6308', 'CH 6309', 'CH 6310', 'CH 6311', 'CH 6312'].map(c => ({
    code: c,
    major: '아트에코차음',
    detail: '사각',
    spec: '600 x 600 x 5.0mm',
    thickness: '5.0T',
    unit: '9pcs / 3.24㎡'
  })),

  // ③ 아트하우스 (20종) - 리빙듀오 (10종), 하우스 마블 (10종)
  ...['AH 726', 'AH 728', 'AH 729', 'AH 730', 'AH 734', 'AH 735', 'AH 736', 'AH 737', 'AH 738', 'AH 739'].map(c => ({
    code: c,
    major: '아트하우스',
    detail: '리빙듀오',
    spec: '180 x 920 x 3.0mm',
    thickness: '3.0T',
    unit: '20pcs / 3.31㎡'
  })),
  ...['AH 6100', 'AH 6101', 'AH 6102', 'AH 6103', 'AH 6104', 'AH 6105', 'AH 6106', 'AH 6107', 'AH 6108', 'AH 6109'].map(c => ({
    code: c,
    major: '아트하우스',
    detail: '하우스 마블',
    spec: '600 x 600 x 3.0mm',
    thickness: '3.0T',
    unit: '9pcs / 3.24㎡'
  })),

  // ④ 아트타일 (69종) - 8개 세부 라인업
  ...['DS 608', 'DS 611', 'DS 612', 'DS 613', 'DS 615', 'DS 616', 'DS 618', 'DS 619', 'DS 620', 'DS 621', 'DS 623', 'DS 625', 'DS 626', 'DS 627', 'DS 671', 'DS 673'].map(c => ({
    code: c,
    major: '아트타일',
    detail: '600 사각타일',
    spec: '600 x 600 x 3.0mm',
    thickness: '3.0T',
    unit: '9pcs / 3.24㎡'
  })),
  ...['AS 4126', 'AS 4127', 'AS 4128', 'AS 4130', 'AS 4139', 'AS 4147', 'AS 4148', 'AS 4149'].map(c => ({
    code: c,
    major: '아트타일',
    detail: '콘크리트',
    spec: '457.2 x 457.2 x 3.0mm',
    thickness: '3.0T',
    unit: '16pcs / 3.34㎡'
  })),
  ...['AS 4004', 'AS 4012', 'AS 4114', 'AS 4116', 'AS 4120', 'AS 4140', 'AS 4141', 'AS 4142'].map(c => ({
    code: c,
    major: '아트타일',
    detail: '앱스트랙',
    spec: '457.2 x 457.2 x 3.0mm',
    thickness: '3.0T',
    unit: '16pcs / 3.34㎡'
  })),
  ...['AS 1001', 'AS 1002', 'AS 1301', 'AS 1525', 'AS 1526', 'AS 1528', 'AS 1531', 'AS 1533', 'AS 1536', 'AS 1538', 'AS 1539', 'AS 1540', 'AS 1541', 'AS 1542', 'AS 1703'].map(c => ({
    code: c,
    major: '아트타일',
    detail: '마블',
    spec: '457.2 x 457.2 x 3.0mm',
    thickness: '3.0T',
    unit: '16pcs / 3.34㎡'
  })),
  ...['AS 1919', 'AS 1922', 'AS 1923', 'AS 1924', 'AS 1938', 'AS 1941'].map(c => ({
    code: c,
    major: '아트타일',
    detail: '카펫',
    spec: '457.2 x 457.2 x 3.0mm',
    thickness: '3.0T',
    unit: '16pcs / 3.34㎡'
  })),
  ...['AS 1810', 'AS 1814'].map(c => ({
    code: c,
    major: '아트타일',
    detail: '그라니트',
    spec: '457.2 x 457.2 x 3.0mm',
    thickness: '3.0T',
    unit: '16pcs / 3.34㎡'
  })),
  ...['AB 6711', 'AB 6712', 'AB 6717', 'AB 6727', 'AB 6739', 'AB 6740', 'AB 6741'].map(c => ({
    code: c,
    major: '아트타일',
    detail: '듀오라인',
    spec: '180 x 920 x 3.0mm',
    thickness: '3.0T',
    unit: '20pcs / 3.31㎡'
  })),
  ...['AB 6915', 'AB 6933', 'AB 6978', 'AB 6981', 'AB 6984', 'AB 6989', 'AB 6990'].map(c => ({
    code: c,
    major: '아트타일',
    detail: '앤틱우드',
    spec: '180 x 920 x 3.0mm',
    thickness: '3.0T',
    unit: '20pcs / 3.31㎡'
  }))
];

// Normalized lookup map
const MANIFEST_LOOKUP = new Map();
DONGSHIN_PRODUCT_MANIFEST.forEach(item => {
  const normKey = item.code.replace(/\s+/g, '').toUpperCase();
  MANIFEST_LOOKUP.set(normKey, item);
});

export function getDongshinManifestItem(product) {
  if (!product) return null;
  const raw = product.code || product.product_code || product.productCode || product.name || '';
  const normKey = String(raw).replace(/\s+/g, '').toUpperCase();
  return MANIFEST_LOOKUP.get(normKey) || null;
}

export function getDongshinMajorCategory(product) {
  const manifest = getDongshinManifestItem(product);
  if (manifest) return manifest.major;

  const raw = String(product.code || product.product_code || product.productCode || product.name || '').replace(/\s+/g, '').toUpperCase();
  if (raw.startsWith('OA')) return '아트 OA타일';
  if (raw.startsWith('CH')) return '아트에코차음';
  if (raw.startsWith('AH')) return '아트하우스';
  if (raw.startsWith('DS') || raw.startsWith('AS') || raw.startsWith('AB')) return '아트타일';
  return '기타';
}

export function getDongshinDetailedLineup(product) {
  const manifest = getDongshinManifestItem(product);
  if (manifest) return manifest.detail;

  const raw = String(product.code || product.product_code || product.productCode || product.name || '').replace(/\s+/g, '').toUpperCase();
  if (raw.startsWith('OA')) return 'OA 프리미엄';
  if (raw.startsWith('CH')) {
    if (raw.startsWith('CH57')) return '우드';
    if (raw.startsWith('CH63')) return '사각';
  }
  if (raw.startsWith('AH')) {
    if (raw.startsWith('AH7')) return '리빙듀오';
    if (raw.startsWith('AH6')) return '하우스 마블';
  }
  if (raw.startsWith('DS')) return '600 사각타일';
  if (raw.startsWith('AS')) {
    if (['AS4126', 'AS4127', 'AS4128', 'AS4130', 'AS4139', 'AS4147', 'AS4148', 'AS4149'].includes(raw)) return '콘크리트';
    if (['AS4004', 'AS4012', 'AS4114', 'AS4116', 'AS4120', 'AS4140', 'AS4141', 'AS4142'].includes(raw)) return '앱스트랙';
    if (['AS1001', 'AS1002', 'AS1301', 'AS1525', 'AS1526', 'AS1528', 'AS1531', 'AS1533', 'AS1536', 'AS1538', 'AS1539', 'AS1540', 'AS1541', 'AS1542', 'AS1703'].includes(raw)) return '마블';
    if (['AS1919', 'AS1922', 'AS1923', 'AS1924', 'AS1938', 'AS1941'].includes(raw)) return '카펫';
    if (['AS1810', 'AS1814'].includes(raw)) return '그라니트';
  }
  if (raw.startsWith('AB')) {
    if (['AB6711', 'AB6712', 'AB6717', 'AB6727', 'AB6739', 'AB6740', 'AB6741'].includes(raw)) return '듀오라인';
    if (['AB6915', 'AB6933', 'AB6978', 'AB6981', 'AB6984', 'AB6989', 'AB6990'].includes(raw)) return '앤틱우드';
  }
  return '기타';
}
