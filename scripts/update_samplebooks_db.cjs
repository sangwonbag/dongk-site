const fs = require('fs');
const path = require('path');

const dbPath = path.resolve('src/data/samplebooks.db.js');
let content = fs.readFileSync(dbPath, 'utf8');

// Parse current samplebooks
const jsonStr = content.replace(/^export const sampleBooks =\s*/, '').replace(/;\s*$/, '');
let sampleBooks = eval(jsonStr);

console.log('Original count:', sampleBooks.length);

// Updates map
const updates = {
  'lx-hapji': {
    title: 'LX 합지 벽지 (베스트 합지)',
    pdf: '/samplebook-assets/벽지/LX/합지/LX_합지벽지.pdf',
    cover: '/samplebook-assets/Thumbnail_image/벽지/LX/실크/LX_베스트/82562-01.jpg',
    description: 'LX 하우시스 실속형 친환경 합지 벽지'
  },
  'lx-silk': {
    title: 'LX 실크 벽지 (베스트 / 테라피)',
    pdf: '/samplebook-assets/벽지/LX/실크/LX_실크벽지(베스트_테라피).pdf',
    cover: '/samplebook-assets/Thumbnail_image/벽지/LX/실크/LX_테라피/7074-01.jpg',
    description: 'LX 하우시스 대표 실크 벽지 베스트&테라피 컬렉션',
    isRecommended: true
  },
  'lx-fire': {
    title: 'LX 방염 벽지',
    pdf: '/samplebook-assets/벽지/LX/방염/LX_방염벽지.pdf',
    cover: '/samplebook-assets/Thumbnail_image/벽지/LX/디아망/LX_디아망포티스/PR034-01.jpg',
    description: 'LX 하우시스 소방 안전 기준 준수 방염 벽지'
  },
  'seoul-hapji': {
    title: '서울 합지 벽지',
    pdf: '/samplebook-assets/벽지/서울/합지/서울_합지벽지.pdf',
    cover: '/samplebook-assets/Thumbnail_image/벽지/서울/합지/3001-1.jpg',
    description: '서울벽지 실속형 친환경 합지 벽지'
  },
  'seoul-silk': {
    title: '서울 실크 벽지',
    pdf: '/samplebook-assets/벽지/서울/실크/서울_실크벽지.pdf',
    cover: '/samplebook-assets/Thumbnail_image/벽지/서울/실크/4001-1.jpg',
    description: '서울벽지 대표 고품격 실크 벽지 컬렉션'
  },
  'seoul-fire': {
    title: '서울 방염 벽지',
    pdf: '/samplebook-assets/벽지/서울/방염/서울_방염벽지.pdf',
    cover: '/samplebook-assets/Thumbnail_image/벽지/서울/방염/1000-1.jpg',
    description: '서울벽지 공공/상업용 안전 방염 벽지'
  },
  'shinhan-hapji-total': {
    title: '신한 합지 벽지 (아이리스 / 파인하임)',
    pdf: '/samplebook-assets/벽지/신한/합지/신한벽지_합지.pdf',
    cover: '/samplebook-assets/Thumbnail_image/벽지/신한/합지/신한벽지_파인하임/4244-1 터치터치.jpg',
    description: '신한벽지 아이리스 & 파인하임 친환경 합지 컬렉션'
  },
  'shinhan-silk-living': {
    title: '신한 실크 벽지 - 리빙 (LIVING)',
    pdf: '/samplebook-assets/벽지/신한/실크/신한벽지_리빙.pdf',
    cover: '/samplebook-assets/Thumbnail_image/벽지/신한/실크/신한벽지_리빙(LIVING)/신한벽지리빙.png',
    description: '신한벽지 모던 감성 리빙 실크 벽지'
  },
  'shinhan-silk-sketch': {
    title: '신한 실크 벽지 - 스케치 (SKETCH)',
    pdf: '/samplebook-assets/벽지/신한/실크/신한벽지_스케치.pdf',
    cover: '/samplebook-assets/Thumbnail_image/벽지/신한/실크/신한벽지_스케치(SKETCH)/신한벽지스케치.png',
    description: '신한벽지 스케치 프리미엄 실크 컬렉션'
  },
  'shinhan-silk-wallguard': {
    title: '신한 실크 벽지 - 월가드 (WALLGUARD)',
    pdf: '/samplebook-assets/벽지/신한/실크/신한벽지_월가드.pdf',
    cover: '/samplebook-assets/Thumbnail_image/벽지/신한/실크/신한벽지_월가드(WALLGUARD)/신한벽지월가드 썸네일.png',
    description: '신한벽지 내구성 강화 안심 월가드 벽지'
  },
  'shinhan-silk-facade': {
    title: '신한 실크 벽지 - 파사드 (FACADE)',
    pdf: '/samplebook-assets/벽지/신한/실크/신한벽지_파사드.pdf',
    cover: '/samplebook-assets/Thumbnail_image/벽지/신한/실크/신한벽지_파사드(FACADE)/신한벽지파사드.png',
    description: '신한벽지 하이엔드 텍스처 파사드 컬렉션'
  },
  'did-hapji': {
    title: '디아이디 합지 벽지 (더원)',
    pdf: '/samplebook-assets/벽지/디아이디/합지/디아이디_합지벽지.pdf',
    cover: '/images/Thumbnail_Image/materials/벽지/디아이디/방염/F1601-1.png',
    description: '디아이디 더원 친환경 합지 벽지'
  },
  'did-silk': {
    title: '디아이디 실크 벽지',
    pdf: '/samplebook-assets/벽지/디아이디/실크/디아이디_실크벽지.pdf',
    cover: '/images/Thumbnail_Image/materials/벽지/디아이디/방염/F1603-1.png',
    description: '디아이디 NO.5 / NO.7 / 메이트 프리미엄 실크'
  },
  'did-fire': {
    title: '디아이디 방염 벽지',
    pdf: '/samplebook-assets/벽지/디아이디/방염/디아이디_방염벽지.pdf',
    cover: '/images/Thumbnail_Image/materials/벽지/디아이디/방염/F1601-1.png',
    description: '디아이디 방염 안전 벽지 컬렉션'
  },
  'jeil-hapji': {
    title: '제일 합지 벽지',
    pdf: '/samplebook-assets/벽지/제일/합지/제일_합지벽지.pdf',
    cover: '/samplebook-assets/Thumbnail_image/벽지/개나리/합지(소폭)/story_page1_full.png',
    description: '제일벽지 실속형 친환경 합지 벽지'
  },
  'jeil-silk': {
    title: '제일 실크 벽지',
    pdf: '/samplebook-assets/벽지/제일/실크/제일_실크벽지.pdf',
    cover: '/samplebook-assets/Thumbnail_image/벽지/개나리/실크/아트북/artbook_page1_full.png',
    description: '제일벽지 고품격 디자인 실크 벽지'
  },
  'jeil-fire': {
    title: '제일 방염 벽지',
    pdf: '/samplebook-assets/벽지/제일/방염/제일_방염벽지.pdf',
    cover: '/samplebook-assets/Thumbnail_image/벽지/개나리/방염/방염썸네일.png',
    description: '제일벽지 한국소방산업기술원 검정 방염 벽지'
  }
};

// Apply updates to existing items
sampleBooks = sampleBooks.map(item => {
  if (updates[item.id]) {
    return { ...item, ...updates[item.id] };
  }
  return item;
});

// New items to add
const newItems = [
  {
    id: 'lx-diamant-2025',
    title: 'LX 디아망 프리미엄 벽지',
    brand: 'LX',
    category: '벽지',
    materialType: '프리미엄',
    cover: '/samplebook-assets/Thumbnail_image/벽지/LX/디아망/LX_디아망/PR002-01.jpg',
    pdf: '/samplebook-assets/벽지/LX/디아망/LX_디아망.pdf',
    description: '풍부한 볼륨감과 섬세한 텍스처의 하이엔드 벽지',
    isRecommended: true
  },
  {
    id: 'shinhan-fire-2025',
    title: '신한 방염 벽지',
    brand: '신한',
    category: '벽지',
    materialType: '방염',
    cover: '/samplebook-assets/Thumbnail_image/벽지/신한/방염/신한벽지_방염/방염_F15053-1 조용한 사색.jpg',
    pdf: '/samplebook-assets/벽지/신한/방염/신한벽지_방염.pdf',
    description: '소방 방재청 형식승인 최고 등급 안전 방염벽지'
  },
  {
    id: 'kcc-rubber-tile-catalog',
    title: 'KCC 홈씨씨 러버타일',
    brand: 'KCC',
    category: '러버타일',
    cover: '/samplebook-assets/Thumbnail_image/데코타일/KCC/senstyle_trendy_page1.png',
    pdf: '/samplebook-assets/러버타일/KCC/KCC홈씨씨_러버타일.pdf',
    description: 'KCC 홈씨씨 고무/러버타일 종합 E-Catalog',
    isRecommended: true
  },
  {
    id: 'hyundai-chamdaum-2025',
    title: '2025 현대 참다움 (1.8T/2.0T)',
    brand: '현대',
    category: '장판',
    cover: '/images/Thumbnail_Image/materials/장판/현대/현대_참다움_1.8T/M2151.jpg',
    pdf: '/samplebook-assets/장판/현대/2025 참다움(1.8T, 2.0T).pdf',
    description: '현대 L&C 친환경 주거용 장판 참다움 컬렉션',
    isRecommended: true
  },
  {
    id: 'hyundai-sorijium-2025',
    title: '2025 현대 소리지움 (5.0T)',
    brand: '현대',
    category: '장판',
    cover: '/images/Thumbnail_Image/materials/장판/현대/현대_참다움_1.8T/M2151.jpg',
    pdf: '/samplebook-assets/장판/현대/2025 소리지움(5.0T).pdf',
    description: '현대 L&C 고쿠션 차음 바닥재 소리지움 5.0'
  },
  {
    id: 'hyundai-thechaeum-2025',
    title: '2025 현대 더채움 (2.2T)',
    brand: '현대',
    category: '장판',
    cover: '/images/Thumbnail_Image/materials/장판/현대/현대_참다움_1.8T/M2151.jpg',
    pdf: '/samplebook-assets/장판/현대/2025 더채움(2.2T).pdf',
    description: '현대 L&C 주거용 기능성 바닥재 더채움 2.2'
  },
  {
    id: 'hyundai-artium-2023',
    title: '현대 아티움 (2.7T/3.2T)',
    brand: '현대',
    category: '장판',
    cover: '/images/Thumbnail_Image/materials/장판/현대/현대_참다움_1.8T/M2151.jpg',
    pdf: '/samplebook-assets/장판/현대/2023 아티움.pdf',
    description: '현대 L&C 프리미엄 시트 바닥재 아티움'
  },
  {
    id: 'hyundai-conductive-tile',
    title: '현대 전도성타일 / 레릭 대전방지타일',
    brand: '현대',
    category: '데코타일',
    cover: '/samplebook-assets/Thumbnail_image/데코타일/현대/골드타일 레릭/goldtile_relic_page1.png',
    pdf: '/samplebook-assets/데코타일/현대/전도성타일.pdf',
    description: '클린룸, 정밀 전자기기실 전도성 및 대전방지 바닥재'
  }
];

newItems.forEach(newItem => {
  if (!sampleBooks.some(b => b.id === newItem.id)) {
    sampleBooks.push(newItem);
    console.log('Added new samplebook:', newItem.title);
  }
});

// Format code
const updatedContent = `export const sampleBooks = ${JSON.stringify(sampleBooks, null, 4)};\n`;
fs.writeFileSync(dbPath, updatedContent, 'utf8');

console.log('Successfully updated samplebooks.db.js! Total items:', sampleBooks.length);
