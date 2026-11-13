import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabaseClient';
import SEO from '../../components/seo/SEO';
import CaseCard from './CaseCard';
import CaseLightboxModal from './CaseLightboxModal';
import './Cases.css';

// In-memory cache for instant zero-lag re-visits
let cachedCasesData = null;

const FALLBACK_CASES = [
  {
    "id": 9,
    "slug": "jungwon-univ-dongshin-ds615",
    "title": "중원대학교 동신 디럭스타일 615 대규모 시공",
    "location": "충청북도 괴산군 중원대학교",
    "category": "상업공간",
    "material_summary": "동신 아트타일 600각 DS 615 · 600×600mm · 3.0T",
    "product_id": 101301,
    "description": "충북 괴산 중원대학교 캠퍼스 교육 및 보행 공간에 동신 아트타일 600각 DS 615를 대규모 시공했습니다. 대형 600각 타일의 시원스러운 개방감과 뛰어난 내구성으로 학생들의 유동이 많은 대학 시설에 최적의 완성도를 자랑합니다.",
    "main_image_url": "/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758.jpg",
    "image_urls": [
      "/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758.jpg",
      "/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_02.jpg",
      "/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_04.jpg",
      "/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_06.jpg",
      "/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_08.jpg",
      "/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_10.jpg",
      "/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_12.jpg",
      "/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_14.jpg",
      "/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_16.jpg",
      "/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_18.jpg",
      "/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_20.jpg",
      "/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_22.jpg",
      "/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_24.jpg",
      "/images/시공사례/25.08.12 동신 615 중원대학교/KakaoTalk_20261113_144326758_26.jpg"
    ],
    "constructed_at": "2025-08-12",
    "is_active": true,
    "is_published": true,
    "sort_order": 1,
    "products": {
      "id": 101301,
      "name": "DS 615",
      "slug": "데코타일-동신-아트타일-ds615",
      "product_code": "DS 615"
    }
  },
  {
    "id": 6,
    "slug": "giheung-gym-lx-prestige-8698",
    "title": "용인 기흥 헬스장 LX 프레스티지 8698 시공",
    "location": "경기도 용인시 기흥구",
    "category": "상업공간",
    "material_summary": "LX하우시스 프레스티지 5T PTT8698 (더스크 브론즈) · 457.2×914.4mm · 5.0T",
    "product_id": 106078,
    "description": "용인 기흥구 헬스장 현장에 LX하우시스 프리미엄 5.0T 프레스티지 장방형 스톤 PTT8698(더스크 브론즈)을 시공했습니다. 동조엠보(EIR)와 고강도 표면 처리로 헬스기구와 통행량이 많은 상업 공간에 뛰어난 내구성과 고급스러운 호텔급 인테리어를 완성했습니다.",
    "main_image_url": "/images/시공사례/11.11 LX 프레스티지 8698 기흥 헬스장/KakaoTalk_20261111_154511524.jpg",
    "image_urls": [
      "/images/시공사례/11.11 LX 프레스티지 8698 기흥 헬스장/KakaoTalk_20261111_154511524.jpg",
      "/images/시공사례/11.11 LX 프레스티지 8698 기흥 헬스장/KakaoTalk_20261111_154511524_01.jpg"
    ],
    "constructed_at": "2026-11-11",
    "is_active": true,
    "is_published": true,
    "sort_order": 2,
    "products": {
      "id": 106078,
      "name": "LX 프레스티지 5T PTT8698 더스크 브론즈",
      "slug": "decotile-lx-prestige-stone-rect-ptt8698-더스크브론즈",
      "product_code": "PTT8698"
    }
  },
  {
    "id": 13,
    "slug": "hanyang-univ-fusion-kcc-ts5518p",
    "title": "한양대학교 퓨전테크센터 KCC 5518 데코타일 시공",
    "location": "서울특별시 성동구 사근동 (한양대학교)",
    "category": "사무공간",
    "material_summary": "KCC 센스타일 트랜디 450각 TS5518P · 457.2×457.2mm · 3.0T",
    "product_id": 100904,
    "description": "한양대학교 퓨전테크센터 연구·사무 공간에 KCC 센스타일 트랜디 TS5518P 450각 데코타일을 정밀 시공했습니다. 깔끔한 그레이 톤과 우수한 내마모성으로 연구진의 통행과 기자재 이동에 안정적인 바닥을 제공합니다.",
    "main_image_url": "/images/시공사례/25.07.31 KCC 5518 한양대 퓨전테크센터/KakaoTalk_20261113_142105152.jpg",
    "image_urls": [
      "/images/시공사례/25.07.31 KCC 5518 한양대 퓨전테크센터/KakaoTalk_20261113_142105152.jpg",
      "/images/시공사례/25.07.31 KCC 5518 한양대 퓨전테크센터/KakaoTalk_20261113_142105152_01.jpg",
      "/images/시공사례/25.07.31 KCC 5518 한양대 퓨전테크센터/KakaoTalk_20261113_142105152_02.jpg",
      "/images/시공사례/25.07.31 KCC 5518 한양대 퓨전테크센터/KakaoTalk_20261113_142105152_03.jpg"
    ],
    "constructed_at": "2025-07-31",
    "is_active": true,
    "is_published": true,
    "sort_order": 3,
    "products": {
      "id": 100904,
      "name": "TS5518P",
      "slug": "데코타일-kcc-kcc_square-ts5518p",
      "product_code": "TS5518P"
    }
  },
  {
    "id": 7,
    "slug": "guui-apartment-dongshin-726",
    "title": "서울 구의동 아파트 동신 726 데코타일 시공",
    "location": "서울특별시 광진구 구의동",
    "category": "주거공간",
    "material_summary": "동신 아트타일 726 (AH 726 / AB 726) · 3.0T",
    "product_id": 101323,
    "description": "서울 광진구 구의동 아파트 주거 공간에 동신 아트타일 726번 자재를 깔끔하고 정교하게 시공한 현장입니다. 밝고 내추럴한 감성의 바닥 마감으로 실내 공간이 더욱 넓고 아늑하게 연출되었습니다.",
    "main_image_url": "/images/시공사례/07.24 동신 726 구의동 아파트/KakaoTalk_20261113_133133183.jpg",
    "image_urls": [
      "/images/시공사례/07.24 동신 726 구의동 아파트/KakaoTalk_20261113_133133183.jpg",
      "/images/시공사례/07.24 동신 726 구의동 아파트/KakaoTalk_20261113_133133183_01.jpg",
      "/images/시공사례/07.24 동신 726 구의동 아파트/KakaoTalk_20261113_133133183_02.jpg",
      "/images/시공사례/07.24 동신 726 구의동 아파트/KakaoTalk_20261113_133133183_03.jpg",
      "/images/시공사례/07.24 동신 726 구의동 아파트/KakaoTalk_20261113_133133183_04.jpg"
    ],
    "constructed_at": "2025-07-24",
    "is_active": true,
    "is_published": true,
    "sort_order": 4,
    "products": {
      "id": 101323,
      "name": "AH 726",
      "slug": "데코타일-동신-아트하우스-ah726",
      "product_code": "AH 726"
    }
  },
  {
    "id": 11,
    "slug": "seoul-seonam-church-lx-cm24711",
    "title": "서울 서남교회 LX 뉴청맥 24711 장판 시공",
    "location": "서울특별시 서남교회",
    "category": "상업공간",
    "material_summary": "LX하우시스 뉴청맥 블랑 오크 CM24711 · 1.8mm(T) × 1,830mm(W)",
    "product_id": 104380,
    "description": "서울 서남교회 부속실 및 예배 모임 공간에 LX하우시스 뉴청맥 1.8T 블랑 오크 CM24711 바닥재를 시공했습니다. 차분하고 단아한 블랑 오크 톤으로 많은 성도들이 모이는 공간에 따뜻함과 청결함을 주었습니다.",
    "main_image_url": "/images/시공사례/25.08.08 LX 24711 서울 서남교회/KakaoTalk_20261113_142458137.jpg",
    "image_urls": [
      "/images/시공사례/25.08.08 LX 24711 서울 서남교회/KakaoTalk_20261113_142458137.jpg",
      "/images/시공사례/25.08.08 LX 24711 서울 서남교회/KakaoTalk_20261113_142458137_01.jpg"
    ],
    "constructed_at": "2025-08-08",
    "is_active": true,
    "is_published": true,
    "sort_order": 5,
    "products": {
      "id": 104380,
      "name": "뉴청맥 블랑 오크",
      "slug": "장판-lx하우시스-뉴청맥-cm24711",
      "product_code": "CM24711"
    }
  },
  {
    "id": 10,
    "slug": "uiwang-idong-house-dongshin-as1531",
    "title": "의왕시 이동 단독주택 동신 1531 데코타일 시공",
    "location": "경기도 의왕시 이동",
    "category": "주거공간",
    "material_summary": "동신 아트타일 스퀘어 AS 1531 · 457.2×457.2mm · 3.0T",
    "product_id": 101264,
    "description": "경기도 의왕시 이동 단독주택에 동신 아트타일 450각 AS 1531을 시공한 현장입니다. 모던한 사각 스톤 질감과 정밀한 이음매 마감으로 주택 내부를 한층 넓고 감각적인 공간으로 변화시켰습니다.",
    "main_image_url": "/images/시공사례/25.08.09 동신 1531 의왕시 이동 단독주택/KakaoTalk_20261113_143920162.jpg",
    "image_urls": [
      "/images/시공사례/25.08.09 동신 1531 의왕시 이동 단독주택/KakaoTalk_20261113_143920162.jpg",
      "/images/시공사례/25.08.09 동신 1531 의왕시 이동 단독주택/KakaoTalk_20261113_143920162_02.jpg",
      "/images/시공사례/25.08.09 동신 1531 의왕시 이동 단독주택/KakaoTalk_20261113_143920162_04.jpg",
      "/images/시공사례/25.08.09 동신 1531 의왕시 이동 단독주택/KakaoTalk_20261113_143920162_06.jpg",
      "/images/시공사례/25.08.09 동신 1531 의왕시 이동 단독주택/KakaoTalk_20261113_143920162_08.jpg",
      "/images/시공사례/25.08.09 동신 1531 의왕시 이동 단독주택/KakaoTalk_20261113_143920162_10.jpg",
      "/images/시공사례/25.08.09 동신 1531 의왕시 이동 단독주택/KakaoTalk_20261113_143920162_12.jpg",
      "/images/시공사례/25.08.09 동신 1531 의왕시 이동 단독주택/KakaoTalk_20261113_143920162_14.jpg",
      "/images/시공사례/25.08.09 동신 1531 의왕시 이동 단독주택/KakaoTalk_20261113_143920162_16.jpg"
    ],
    "constructed_at": "2025-08-09",
    "is_active": true,
    "is_published": true,
    "sort_order": 6,
    "products": {
      "id": 101264,
      "name": "AS 1531",
      "slug": "데코타일-동신-아트타일-as1531",
      "product_code": "AS 1531"
    }
  },
  {
    "id": 8,
    "slug": "garak-officetel-kcc-5551",
    "title": "서울 가락동 오피스텔 KCC 5551 시공",
    "location": "서울특별시 송파구 가락동",
    "category": "사무공간",
    "material_summary": "KCC 센스타일 트랜디 450각 TS 5551 · 457.2×457.2mm · 3.0T",
    "product_id": 100924,
    "description": "서울 송파구 가락동 오피스텔 바닥에 KCC 센스타일 트랜디 TS 5551 사각 데코타일을 시공한 현장입니다. 모던하고 단정한 그레이 톤으로 오피스 및 주거 복합 공간에 세련된 분위기를 제공합니다.",
    "main_image_url": "/images/시공사례/07.16 KCC 5551 가락동 오피스텔/KakaoTalk_20261113_132034837.jpg",
    "image_urls": [
      "/images/시공사례/07.16 KCC 5551 가락동 오피스텔/KakaoTalk_20261113_132034837.jpg",
      "/images/시공사례/07.16 KCC 5551 가락동 오피스텔/KakaoTalk_20261113_132034837_01.jpg",
      "/images/시공사례/07.16 KCC 5551 가락동 오피스텔/KakaoTalk_20261113_132034837_02.jpg",
      "/images/시공사례/07.16 KCC 5551 가락동 오피스텔/KakaoTalk_20261113_132034837_03.jpg"
    ],
    "constructed_at": "2025-07-16",
    "is_active": true,
    "is_published": true,
    "sort_order": 7,
    "products": {
      "id": 100924,
      "name": "TS5551P",
      "slug": "데코타일-kcc-kcc_square-ts5551p",
      "product_code": "TS5551P"
    }
  },
  {
    "id": 14,
    "slug": "samseong-house-dongshin-ah739",
    "title": "서울 삼성동 주택 동신 아트하우스 739 시공",
    "location": "서울특별시 강남구 삼성동",
    "category": "주거공간",
    "material_summary": "동신 아트하우스 AH 739 · 180×920mm · 3.0T",
    "product_id": 101332,
    "description": "서울 강남구 삼성동 주택에 동신 아트하우스 AH 739 프리미엄 하우스 데코타일을 시공했습니다. 주거 환경에 최적화된 온돌 안정성과 세련된 우드 패턴으로 고급스러운 거실과 실내를 구현했습니다.",
    "main_image_url": "/images/시공사례/25.07.29 동신하우스 739 삼성동 주택/KakaoTalk_20261113_141711382.jpg",
    "image_urls": [
      "/images/시공사례/25.07.29 동신하우스 739 삼성동 주택/KakaoTalk_20261113_141711382.jpg",
      "/images/시공사례/25.07.29 동신하우스 739 삼성동 주택/KakaoTalk_20261113_141711382_01.jpg",
      "/images/시공사례/25.07.29 동신하우스 739 삼성동 주택/KakaoTalk_20261113_141711382_02.jpg",
      "/images/시공사례/25.07.29 동신하우스 739 삼성동 주택/KakaoTalk_20261113_141711382_03.jpg"
    ],
    "constructed_at": "2025-07-29",
    "is_active": true,
    "is_published": true,
    "sort_order": 8,
    "products": {
      "id": 101332,
      "name": "AH 739",
      "slug": "데코타일-동신-아트하우스-ah739",
      "product_code": "AH 739"
    }
  },
  {
    "id": 12,
    "slug": "goyang-shinwon-villa-lx-cm23692",
    "title": "고양시 신원동 빌라 LX 뉴청맥 23692 장판 시공",
    "location": "경기도 고양시 덕양구 신원동",
    "category": "주거공간",
    "material_summary": "LX하우시스 뉴청맥 엘름 CM23692 · 1.8mm(T) × 1,830mm(W)",
    "product_id": 104375,
    "description": "고양시 덕양구 신원동 신축 빌라 주거 공간에 LX하우시스 뉴청맥 1.8T 엘름 CM23692 모노륨 장판을 꼼꼼하게 시공했습니다. 화사하고 자연스러운 나무결로 밝고 쾌적한 주거 인테리어를 완성했습니다.",
    "main_image_url": "/images/시공사례/25.08.08 LX 23692 고양시 신원동 빌라/KakaoTalk_20261113_143630157.jpg",
    "image_urls": [
      "/images/시공사례/25.08.08 LX 23692 고양시 신원동 빌라/KakaoTalk_20261113_143630157.jpg",
      "/images/시공사례/25.08.08 LX 23692 고양시 신원동 빌라/KakaoTalk_20261113_143630157_02.jpg",
      "/images/시공사례/25.08.08 LX 23692 고양시 신원동 빌라/KakaoTalk_20261113_143630157_04.jpg",
      "/images/시공사례/25.08.08 LX 23692 고양시 신원동 빌라/KakaoTalk_20261113_143630157_06.jpg",
      "/images/시공사례/25.08.08 LX 23692 고양시 신원동 빌라/KakaoTalk_20261113_143630157_08.jpg"
    ],
    "constructed_at": "2025-08-08",
    "is_active": true,
    "is_published": true,
    "sort_order": 9,
    "products": {
      "id": 104375,
      "name": "뉴청맥 엘름",
      "slug": "장판-lx하우시스-뉴청맥-cm23692",
      "product_code": "CM23692"
    }
  },
  {
    "id": 2,
    "slug": "anseong-gym-kcc-ts5534m",
    "title": "안성 헬스장 KCC 5534 시공",
    "location": "경기도 안성시",
    "category": "상업공간",
    "material_summary": "KCC 센스타일 트랜디 TS 5534 · 450각/600각 · 3.0T",
    "product_id": 100909,
    "description": "경기도 안성시 헬스장 바닥에 KCC 센스타일 트랜디 TS 5534 데코타일을 시공한 현장입니다. 견고한 내구성과 묵직한 다크 톤 질감으로 프리미엄 피트니스 공간에 최적화된 마감을 구현했습니다.",
    "main_image_url": "/images/시공사례/07.14 안성헬스장 KCC 5534/KakaoTalk_20261113_131925191.jpg",
    "image_urls": [
      "/images/시공사례/07.14 안성헬스장 KCC 5534/KakaoTalk_20261113_131925191.jpg",
      "/images/시공사례/07.14 안성헬스장 KCC 5534/KakaoTalk_20261113_131925191_01.jpg",
      "/images/시공사례/07.14 안성헬스장 KCC 5534/KakaoTalk_20261113_131925191_02.jpg",
      "/images/시공사례/07.14 안성헬스장 KCC 5534/KakaoTalk_20261113_131925191_03.jpg",
      "/images/시공사례/07.14 안성헬스장 KCC 5534/KakaoTalk_20261113_131925191_04.jpg",
      "/images/시공사례/07.14 안성헬스장 KCC 5534/KakaoTalk_20261113_131925191_05.jpg"
    ],
    "constructed_at": "2025-07-14",
    "is_active": true,
    "is_published": true,
    "sort_order": 10,
    "products": {
      "id": 100909,
      "name": "TS5534M",
      "slug": "데코타일-kcc-kcc_square-ts5534m",
      "product_code": "TS5534M"
    }
  },
  {
    "id": 15,
    "slug": "yongin-sanggal-detached-kcc-tw5112g",
    "title": "용인 상갈동 단독주택 KCC 5112 데코타일 시공",
    "location": "경기도 용인시 기흥구 상갈동",
    "category": "주거공간",
    "material_summary": "KCC 센스타일 트랜디 우드 TW 5112G · 184×950mm · 3.0T",
    "product_id": 100936,
    "description": "용인 기흥구 상갈동 단독주택에 KCC 센스타일 트랜디 우드 TW 5112G 데코타일을 시공했습니다. 내추럴하고 따뜻한 원목 질감으로 주거 공간 전체에 아늑하고 편안한 분위기를 완성했습니다.",
    "main_image_url": "/images/시공사례/25.07.29 KCC 5112 용인 상갈동 단독주택/KakaoTalk_20261113_135031563.jpg",
    "image_urls": [
      "/images/시공사례/25.07.29 KCC 5112 용인 상갈동 단독주택/KakaoTalk_20261113_135031563.jpg",
      "/images/시공사례/25.07.29 KCC 5112 용인 상갈동 단독주택/KakaoTalk_20261113_135031563_01.jpg",
      "/images/시공사례/25.07.29 KCC 5112 용인 상갈동 단독주택/KakaoTalk_20261113_135031563_02.jpg",
      "/images/시공사례/25.07.29 KCC 5112 용인 상갈동 단독주택/KakaoTalk_20261113_135031563_03.jpg"
    ],
    "constructed_at": "2025-07-29",
    "is_active": true,
    "is_published": true,
    "sort_order": 11,
    "products": {
      "id": 100936,
      "name": "TW 5112G",
      "slug": "데코타일-kcc-kcc_wood-tw-5112g",
      "product_code": "TW 5112G"
    }
  }
];

export default function Cases() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const isAdmin = useMemo(() => Boolean(user && (user.role === 'admin' || user.role === 'staff')), [user?.role]);

  const [casesList, setCasesList] = useState(() => cachedCasesData || FALLBACK_CASES);
  const [loading, setLoading] = useState(() => !cachedCasesData && !FALLBACK_CASES.length);
  const categoryFilter = searchParams.get('category') || '전체';

  // Lightbox Modal State
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    title: '',
    images: [],
    currentIndex: 0
  });

  const setCategoryFilter = useCallback((cat) => {
    if (cat === '전체') {
      searchParams.delete('category');
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ category: cat }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const loadCases = useCallback(async (forceRefresh = false) => {
    // If cached in-memory and not a forced admin refresh, avoid redundant network round-trip & re-render
    if (cachedCasesData && !forceRefresh) {
      return;
    }

    try {
      if (!cachedCasesData || forceRefresh) {
        setLoading(true);
      }

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      let query = supabase
        .from('construction_cases')
        .select('id, title, slug, location, material_summary, product_id, main_image_url, description, constructed_at, sort_order, is_published, category, image_urls, products:product_id ( id, name, slug, product_code )');

      // 일반 사용자에게는 노출된 사례만 표시
      if (!isAdmin) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        cachedCasesData = data;
        setCasesList(data);
      } else {
        setCasesList(FALLBACK_CASES);
      }
    } catch (err) {
      console.error('[Cases] Failed to fetch construction cases, using verified fallback list.', err);
      setCasesList(prev => (prev && prev.length > 0 ? prev : FALLBACK_CASES));
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const handleTogglePublish = useCallback(async (id, currentStatus) => {
    try {
      const nextStatus = !currentStatus;
      const { error } = await supabase
        .from('construction_cases')
        .update({
          is_published: nextStatus,
          is_active: nextStatus
        })
        .eq('id', id);

      if (error) throw error;
      alert('노출 상태가 성공적으로 변경되었습니다.');
      loadCases(true);
    } catch (err) {
      alert('상태 변경에 실패했습니다: ' + err.message);
    }
  }, [loadCases]);

  const handleOpenLightbox = useCallback((item, index = 0) => {
    const images = Array.isArray(item.image_urls) && item.image_urls.length > 0
      ? item.image_urls
      : (item.main_image_url ? [item.main_image_url] : []);

    setLightboxState({
      isOpen: true,
      title: item.title,
      images,
      currentIndex: Math.max(0, Math.min(index, images.length - 1))
    });
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleLightboxIndexChange = useCallback((newIdx) => {
    setLightboxState(prev => ({ ...prev, currentIndex: newIdx }));
  }, []);

  const handleEditCase = useCallback((item) => {
    navigate('/admin/construction-cases');
  }, [navigate]);

  const categories = useMemo(() => ['전체', '주거공간', '사무공간', '상업공간'], []);

  const filteredCases = useMemo(() => {
    return casesList.filter(item => {
      if (categoryFilter === '전체') return true;
      return item.category === categoryFilter;
    });
  }, [casesList, categoryFilter]);

  return (
    <MainLayout>
      <SEO
        title="시공사례 | 동경바닥재 - 데코타일·마루·장판 실제 바닥 시공 포트폴리오"
        description="동경바닥재의 실제 주거, 사무, 상업 공간 바닥재(데코타일, 마루, 장판, 카페트타일) 시공사례 포트폴리오를 확인하세요."
        canonical="https://dkfloor.co.kr/cases"
      />
      <div className="cases-page-container container">
        {/* Admin Quick Banner */}
        {isAdmin && (
          <div className="cases-admin-banner">
            <div className="admin-banner-text">
              🛡️ <strong>관리자 계정으로 로그인했습니다.</strong> 시공사례 노출 여부 관리 및 등록/수정/삭제를 인라인으로 처리하거나 관리자 패널로 진입할 수 있습니다.
            </div>
            <button className="btn-admin-manage" onClick={() => navigate('/admin/construction-cases')}>
              시공사례 관리 패널 이동
            </button>
          </div>
        )}

        {/* Banner Section */}
        <div className="cases-banner">
          <div className="banner-content">
            <span className="banner-badge">PORTFOLIO</span>
            <h1>시공사례</h1>
            <p>동경바닥재가 정직하고 정교하게 완성한 주거, 상업, 오피스 공간의 바닥 및 벽지 시공 히스토리입니다.</p>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="cases-category-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cases Grid */}
        {loading && casesList.length === 0 ? (
          <div className="cases-loading-wrapper">
            <div className="spinner-loader"></div>
            <p>시공 포트폴리오를 불러오고 있습니다...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="cases-empty">
            <h3>등록된 시공사례가 없습니다.</h3>
            <p>다른 카테고리를 선택해 보시기 바랍니다.</p>
          </div>
        ) : (
          <div className="cases-grid-layout">
            {filteredCases.map((item, idx) => (
              <CaseCard
                key={item.id || item.slug}
                item={item}
                index={idx}
                isAdmin={isAdmin}
                onOpenLightbox={handleOpenLightbox}
                onEdit={handleEditCase}
                onTogglePublish={handleTogglePublish}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal (mounted only on demand when open) */}
      {lightboxState.isOpen && (
        <CaseLightboxModal
          isOpen={lightboxState.isOpen}
          onClose={handleCloseLightbox}
          title={lightboxState.title}
          images={lightboxState.images}
          currentIndex={lightboxState.currentIndex}
          onIndexChange={handleLightboxIndexChange}
        />
      )}
    </MainLayout>
  );
}
