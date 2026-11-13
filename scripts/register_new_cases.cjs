require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ymoshkaiwvnmhhcglpjj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY;
const client = createClient(SUPABASE_URL, SUPABASE_KEY);

const NEW_CASES = [
  {
    id: 9,
    slug: 'jungwon-univ-dongshin-ds615',
    title: '중원대학교 동신 디럭스타일 615 대규모 시공',
    location: '충청북도 괴산군 중원대학교',
    category: '상업공간',
    material_summary: '동신 아트타일 600각 DS 615 · 600×600mm · 3.0T',
    product_id: 101301,
    description: '충북 괴산 중원대학교 캠퍼스 교육 및 보행 공간에 동신 아트타일 600각 DS 615를 대규모 시공했습니다. 대형 600각 타일의 시원스러운 개방감과 뛰어난 내구성으로 학생들의 유동이 많은 대학 시설에 최적의 완성도를 자랑합니다.',
    main_image_url: '/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758.jpg',
    image_urls: [
      '/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758.jpg',
      '/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_02.jpg',
      '/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_04.jpg',
      '/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_06.jpg',
      '/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_08.jpg',
      '/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_10.jpg',
      '/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_12.jpg',
      '/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_14.jpg',
      '/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_16.jpg',
      '/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_18.jpg',
      '/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_20.jpg',
      '/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_22.jpg',
      '/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_24.jpg',
      '/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_26.jpg'
    ],
    constructed_at: '2025-08-12',
    is_active: true,
    is_published: true,
    is_featured: true,
    sort_order: 1
  },
  {
    id: 10,
    slug: 'uiwang-idong-house-dongshin-as1531',
    title: '의왕시 이동 단독주택 동신 1531 데코타일 시공',
    location: '경기도 의왕시 이동',
    category: '주거공간',
    material_summary: '동신 아트타일 스퀘어 AS 1531 · 457.2×457.2mm · 3.0T',
    product_id: 101264,
    description: '경기도 의왕시 이동 단독주택에 동신 아트타일 450각 AS 1531을 시공한 현장입니다. 모던한 사각 스톤 질감과 정밀한 이음매 마감으로 주택 내부를 한층 넓고 감각적인 공간으로 변화시켰습니다.',
    main_image_url: '/images/시공사례/25.08.09 동신 1531 의왕시 이동 단독주택/KakaoTalk_20261113_143920162.jpg',
    image_urls: [
      '/images/시공사례/25.08.09 동신 1531 의왕시 이동 단독주택/KakaoTalk_20261113_143920162.jpg',
      '/images/시공사례/25.08.09 동신 1531 의왕시 이동 단독주택/KakaoTalk_20261113_143920162_02.jpg',
      '/images/시공사례/25.08.09 동신 1531 의왕시 이동 단독주택/KakaoTalk_20261113_143920162_04.jpg',
      '/images/시공사례/25.08.09 동신 1531 의왕시 이동 단독주택/KakaoTalk_20261113_143920162_06.jpg',
      '/images/시공사례/25.08.09 동신 1531 의왕시 이동 단독주택/KakaoTalk_20261113_143920162_08.jpg',
      '/images/시공사례/25.08.09 동신 1531 의왕시 이동 단독주택/KakaoTalk_20261113_143920162_10.jpg',
      '/images/시공사례/25.08.09 동신 1531 의왕시 이동 단독주택/KakaoTalk_20261113_143920162_12.jpg',
      '/images/시공사례/25.08.09 동신 1531 의왕시 이동 단독주택/KakaoTalk_20261113_143920162_14.jpg',
      '/images/시공사례/25.08.09 동신 1531 의왕시 이동 단독주택/KakaoTalk_20261113_143920162_16.jpg'
    ],
    constructed_at: '2025-08-09',
    is_active: true,
    is_published: true,
    is_featured: false,
    sort_order: 2
  },
  {
    id: 11,
    slug: 'seoul-seonam-church-lx-cm24711',
    title: '서울 서남교회 LX 뉴청맥 24711 장판 시공',
    location: '서울특별시 서남교회',
    category: '상업공간',
    material_summary: 'LX하우시스 뉴청맥 블랑 오크 CM24711 · 1.8mm(T) × 1,830mm(W)',
    product_id: 104380,
    description: '서울 서남교회 부속실 및 예배 모임 공간에 LX하우시스 뉴청맥 1.8T 블랑 오크 CM24711 바닥재를 시공했습니다. 차분하고 단아한 블랑 오크 톤으로 많은 성도들이 모이는 공간에 따뜻함과 청결함을 주었습니다.',
    main_image_url: '/images/시공사례/25.08.08 LX 24711 서울 서남교회/KakaoTalk_20261113_142458137.jpg',
    image_urls: [
      '/images/시공사례/25.08.08 LX 24711 서울 서남교회/KakaoTalk_20261113_142458137.jpg',
      '/images/시공사례/25.08.08 LX 24711 서울 서남교회/KakaoTalk_20261113_142458137_01.jpg'
    ],
    constructed_at: '2025-08-08',
    is_active: true,
    is_published: true,
    is_featured: false,
    sort_order: 3
  },
  {
    id: 12,
    slug: 'goyang-shinwon-villa-lx-cm23692',
    title: '고양시 신원동 빌라 LX 뉴청맥 23692 장판 시공',
    location: '경기도 고양시 덕양구 신원동',
    category: '주거공간',
    material_summary: 'LX하우시스 뉴청맥 엘름 CM23692 · 1.8mm(T) × 1,830mm(W)',
    product_id: 104375,
    description: '고양시 덕양구 신원동 신축 빌라 주거 공간에 LX하우시스 뉴청맥 1.8T 엘름 CM23692 모노륨 장판을 꼼꼼하게 시공했습니다. 화사하고 자연스러운 나무결로 밝고 쾌적한 주거 인테리어를 완성했습니다.',
    main_image_url: '/images/시공사례/25.08.08 LX 23692 고양시 신원동 빌라/KakaoTalk_20261113_143630157.jpg',
    image_urls: [
      '/images/시공사례/25.08.08 LX 23692 고양시 신원동 빌라/KakaoTalk_20261113_143630157.jpg',
      '/images/시공사례/25.08.08 LX 23692 고양시 신원동 빌라/KakaoTalk_20261113_143630157_02.jpg',
      '/images/시공사례/25.08.08 LX 23692 고양시 신원동 빌라/KakaoTalk_20261113_143630157_04.jpg',
      '/images/시공사례/25.08.08 LX 23692 고양시 신원동 빌라/KakaoTalk_20261113_143630157_06.jpg',
      '/images/시공사례/25.08.08 LX 23692 고양시 신원동 빌라/KakaoTalk_20261113_143630157_08.jpg'
    ],
    constructed_at: '2025-08-08',
    is_active: true,
    is_published: true,
    is_featured: false,
    sort_order: 4
  },
  {
    id: 13,
    slug: 'hanyang-univ-fusion-kcc-ts5518p',
    title: '한양대학교 퓨전테크센터 KCC 5518 데코타일 시공',
    location: '서울특별시 성동구 사근동 (한양대학교)',
    category: '사무공간',
    material_summary: 'KCC 센스타일 트랜디 450각 TS5518P · 457.2×457.2mm · 3.0T',
    product_id: 100904,
    description: '한양대학교 퓨전테크센터 연구·사무 공간에 KCC 센스타일 트랜디 TS5518P 450각 데코타일을 정밀 시공했습니다. 깔끔한 그레이 톤과 우수한 내마모성으로 연구진의 통행과 기자재 이동에 안정적인 바닥을 제공합니다.',
    main_image_url: '/images/시공사례/25.07.31 KCC 5518 한양대 퓨전테크센터/KakaoTalk_20261113_142105152.jpg',
    image_urls: [
      '/images/시공사례/25.07.31 KCC 5518 한양대 퓨전테크센터/KakaoTalk_20261113_142105152.jpg',
      '/images/시공사례/25.07.31 KCC 5518 한양대 퓨전테크센터/KakaoTalk_20261113_142105152_01.jpg',
      '/images/시공사례/25.07.31 KCC 5518 한양대 퓨전테크센터/KakaoTalk_20261113_142105152_02.jpg',
      '/images/시공사례/25.07.31 KCC 5518 한양대 퓨전테크센터/KakaoTalk_20261113_142105152_03.jpg'
    ],
    constructed_at: '2025-07-31',
    is_active: true,
    is_published: true,
    is_featured: false,
    sort_order: 5
  },
  {
    id: 14,
    slug: 'samseong-house-dongshin-ah739',
    title: '서울 삼성동 주택 동신 아트하우스 739 시공',
    location: '서울특별시 강남구 삼성동',
    category: '주거공간',
    material_summary: '동신 아트하우스 AH 739 · 180×920mm · 3.0T',
    product_id: 101332,
    description: '서울 강남구 삼성동 주택에 동신 아트하우스 AH 739 프리미엄 하우스 데코타일을 시공했습니다. 주거 환경에 최적화된 온돌 안정성과 세련된 우드 패턴으로 고급스러운 거실과 실내를 구현했습니다.',
    main_image_url: '/images/시공사례/25.07.29 동신하우스 739 삼성동 주택/KakaoTalk_20261113_141711382.jpg',
    image_urls: [
      '/images/시공사례/25.07.29 동신하우스 739 삼성동 주택/KakaoTalk_20261113_141711382.jpg',
      '/images/시공사례/25.07.29 동신하우스 739 삼성동 주택/KakaoTalk_20261113_141711382_01.jpg',
      '/images/시공사례/25.07.29 동신하우스 739 삼성동 주택/KakaoTalk_20261113_141711382_02.jpg',
      '/images/시공사례/25.07.29 동신하우스 739 삼성동 주택/KakaoTalk_20261113_141711382_03.jpg'
    ],
    constructed_at: '2025-07-29',
    is_active: true,
    is_published: true,
    is_featured: false,
    sort_order: 6
  },
  {
    id: 15,
    slug: 'yongin-sanggal-detached-kcc-tw5112g',
    title: '용인 상갈동 단독주택 KCC 5112 데코타일 시공',
    location: '경기도 용인시 기흥구 상갈동',
    category: '주거공간',
    material_summary: 'KCC 센스타일 트랜디 우드 TW 5112G · 184×950mm · 3.0T',
    product_id: 100936,
    description: '용인 기흥구 상갈동 단독주택에 KCC 센스타일 트랜디 우드 TW 5112G 데코타일을 시공했습니다. 내추럴하고 따뜻한 원목 질감으로 주거 공간 전체에 아늑하고 편안한 분위기를 완성했습니다.',
    main_image_url: '/images/시공사례/25.07.29 KCC 5112 용인 상갈동 단독주택/KakaoTalk_20261113_135031563.jpg',
    image_urls: [
      '/images/시공사례/25.07.29 KCC 5112 용인 상갈동 단독주택/KakaoTalk_20261113_135031563.jpg',
      '/images/시공사례/25.07.29 KCC 5112 용인 상갈동 단독주택/KakaoTalk_20261113_135031563_01.jpg',
      '/images/시공사례/25.07.29 KCC 5112 용인 상갈동 단독주택/KakaoTalk_20261113_135031563_02.jpg',
      '/images/시공사례/25.07.29 KCC 5112 용인 상갈동 단독주택/KakaoTalk_20261113_135031563_03.jpg'
    ],
    constructed_at: '2025-07-29',
    is_active: true,
    is_published: true,
    is_featured: false,
    sort_order: 7
  }
];

async function run() {
  console.log('Inserting 7 new construction cases into Supabase...');
  for (const item of NEW_CASES) {
    const { data, error } = await client
      .from('construction_cases')
      .upsert(item, { onConflict: 'id' });
    if (error) {
      console.error(`Failed to upsert case ${item.id} (${item.title}):`, error.message);
    } else {
      console.log(`Successfully upserted case ${item.id}: ${item.title}`);
    }
  }
  console.log('Done!');
}

run();
