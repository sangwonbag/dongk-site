import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import LazySection from "../../components/common/LazySection";
import SEO from "../../components/seo/SEO";
import { KAKAO_CHAT_URL, OFFICE_PHONE } from "../../constants/contact";
import { preloadRoute, setupIdlePreload } from "../../utils/routePreloader";
import { 
  ArrowRight, 
  ChevronRight, 
  Play, 
  Pause, 
  ShoppingBag, 
  FileText, 
  CheckCircle2, 
  Building2, 
  Briefcase, 
  Dumbbell, 
  Home as HomeIcon,
  PhoneCall,
  MessageSquare
} from "lucide-react";
import "./Home.css";

const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "동경바닥재 (DK Floor)",
  "alternateName": "DK Floor",
  "url": "https://dkfloor.co.kr",
  "logo": "https://dkfloor.co.kr/dk-apple-touch-icon-transparent.png",
  "image": "https://dkfloor.co.kr/dk-apple-touch-icon-transparent.png",
  "description": "국내 주요 브랜드(KCC, LX, 동신, 재영, 이건 등) 데코타일, 마루, 장판, 벽지 전문 유통. 자재 선택부터 시공 상담까지 한곳에서 진행하는 프리미엄 원스톱 바닥재 서비스",
  "telephone": "02-487-9775",
  "priceRange": "₩₩",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "KR"
  }
};

// Lightweight homepage snapshot of registered KCC Trendy products in materials.db.js.
// Keep each product's image, specification and canonical detail ID together.
const KCC_COLLECTION = [
  {
    "id": "데코타일-kcc-kcc_square-ts5502p",
    "code": "TS5502P",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 우븐 TS5502P",
    "subLine": "450각",
    "spec": "457.2×457.2mm · 3.0T",
    "packaging": "16매 / 3.34㎡ (1BOX)",
    "description": "센스타일 트랜디 450각 · 우븐",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5502P.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5502p"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5503p",
    "code": "TS5503P",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 우븐 TS5503P",
    "subLine": "450각",
    "spec": "457.2×457.2mm · 3.0T",
    "packaging": "16매 / 3.34㎡ (1BOX)",
    "description": "센스타일 트랜디 450각 · 우븐",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5503P.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5503p"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5510p",
    "code": "TS5510P",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 카펫 TS5510P",
    "subLine": "450각",
    "spec": "457.2×457.2mm · 3.0T",
    "packaging": "16매 / 3.34㎡ (1BOX)",
    "description": "센스타일 트랜디 450각 · 카펫",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5510P.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5510p"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5511p",
    "code": "TS5511P",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 카펫 TS5511P",
    "subLine": "450각",
    "spec": "457.2×457.2mm · 3.0T",
    "packaging": "16매 / 3.34㎡ (1BOX)",
    "description": "센스타일 트랜디 450각 · 카펫",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5511P.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5511p"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5516p",
    "code": "TS5516P",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 마블 TS5516P",
    "subLine": "450각",
    "spec": "457.2×457.2mm · 3.0T",
    "packaging": "16매 / 3.34㎡ (1BOX)",
    "description": "센스타일 트랜디 450각 · 마블",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5516P.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5516p"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5518p",
    "code": "TS5518P",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 콘크리트 TS5518P",
    "subLine": "450각",
    "spec": "457.2×457.2mm · 3.0T",
    "packaging": "16매 / 3.34㎡ (1BOX)",
    "description": "센스타일 트랜디 450각 · 콘크리트",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5518P.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5518p"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5519p",
    "code": "TS5519P",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 콘크리트 TS5519P",
    "subLine": "450각",
    "spec": "457.2×457.2mm · 3.0T",
    "packaging": "16매 / 3.34㎡ (1BOX)",
    "description": "센스타일 트랜디 450각 · 콘크리트",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5519P.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5519p"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5531m",
    "code": "TS5531M",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 오닉스 TS5531M",
    "subLine": "600각",
    "spec": "600×600mm · 3.0T",
    "packaging": "9매 / 3.24㎡ (1BOX)",
    "description": "센스타일 트랜디 600각 · 오닉스",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_600각_이미지/TS5531M.png",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5531m"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5532m",
    "code": "TS5532M",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 파라디소 TS5532M",
    "subLine": "600각",
    "spec": "600×600mm · 3.0T",
    "packaging": "9매 / 3.24㎡ (1BOX)",
    "description": "센스타일 트랜디 600각 · 파라디소",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_600각_이미지/TS5532M.png",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5532m"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5533m",
    "code": "TS5533M",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 파라디소 TS5533M",
    "subLine": "600각",
    "spec": "600×600mm · 3.0T",
    "packaging": "9매 / 3.24㎡ (1BOX)",
    "description": "센스타일 트랜디 600각 · 파라디소",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_600각_이미지/TS5533M.png",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5533m"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5534m",
    "code": "TS5534M",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 파라디소 TS5534M",
    "subLine": "600각",
    "spec": "600×600mm · 3.0T",
    "packaging": "9매 / 3.24㎡ (1BOX)",
    "description": "센스타일 트랜디 600각 · 파라디소",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_600각_이미지/TS5534M.png",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5534m"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5535m",
    "code": "TS5535M",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 어반 콘크리트 TS5535M",
    "subLine": "600각",
    "spec": "600×600mm · 3.0T",
    "packaging": "9매 / 3.24㎡ (1BOX)",
    "description": "센스타일 트랜디 600각 · 어반 콘크리트",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_600각_이미지/TS5535M.png",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5535m"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5536m",
    "code": "TS5536M",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 어반 콘크리트 TS5536M",
    "subLine": "600각",
    "spec": "600×600mm · 3.0T",
    "packaging": "9매 / 3.24㎡ (1BOX)",
    "description": "센스타일 트랜디 600각 · 어반 콘크리트",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_600각_이미지/TS5536M.png",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5536m"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5537m",
    "code": "TS5537M",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 어반 콘크리트 TS5537M",
    "subLine": "600각",
    "spec": "600×600mm · 3.0T",
    "packaging": "9매 / 3.24㎡ (1BOX)",
    "description": "센스타일 트랜디 600각 · 어반 콘크리트",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_600각_이미지/TS5537M.png",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5537m"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5541p",
    "code": "TS5541P",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 슬레이트 TS5541P",
    "subLine": "450각",
    "spec": "457.2×457.2mm · 3.0T",
    "packaging": "16매 / 3.34㎡ (1BOX)",
    "description": "센스타일 트랜디 450각 · 슬레이트",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5541P.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5541p"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5542p",
    "code": "TS5542P",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 슬레이트 TS5542P",
    "subLine": "450각",
    "spec": "457.2×457.2mm · 3.0T",
    "packaging": "16매 / 3.34㎡ (1BOX)",
    "description": "센스타일 트랜디 450각 · 슬레이트",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5542P.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5542p"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5543p",
    "code": "TS5543P",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 슬레이트 TS5543P",
    "subLine": "450각",
    "spec": "457.2×457.2mm · 3.0T",
    "packaging": "16매 / 3.34㎡ (1BOX)",
    "description": "센스타일 트랜디 450각 · 슬레이트",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5543P.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5543p"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5544p",
    "code": "TS5544P",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 슬레이트 TS5544P",
    "subLine": "450각",
    "spec": "457.2×457.2mm · 3.0T",
    "packaging": "16매 / 3.34㎡ (1BOX)",
    "description": "센스타일 트랜디 450각 · 슬레이트",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5544P.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5544p"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5545p",
    "code": "TS5545P",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 테라죠 TS5545P",
    "subLine": "450각",
    "spec": "457.2×457.2mm · 3.0T",
    "packaging": "16매 / 3.34㎡ (1BOX)",
    "description": "센스타일 트랜디 450각 · 테라죠",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5545P.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5545p"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5546p",
    "code": "TS5546P",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 테라죠 TS5546P",
    "subLine": "450각",
    "spec": "457.2×457.2mm · 3.0T",
    "packaging": "16매 / 3.34㎡ (1BOX)",
    "description": "센스타일 트랜디 450각 · 테라죠",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5546P.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5546p"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5547p",
    "code": "TS5547P",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 비앙코 TS5547P",
    "subLine": "450각",
    "spec": "457.2×457.2mm · 3.0T",
    "packaging": "16매 / 3.34㎡ (1BOX)",
    "description": "센스타일 트랜디 450각 · 비앙코",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5547P.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5547p"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5548p",
    "code": "TS5548P",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 샌드스톤 TS5548P",
    "subLine": "450각",
    "spec": "457.2×457.2mm · 3.0T",
    "packaging": "16매 / 3.34㎡ (1BOX)",
    "description": "센스타일 트랜디 450각 · 샌드스톤",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5548P.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5548p"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5549p",
    "code": "TS5549P",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 샌드스톤 TS5549P",
    "subLine": "450각",
    "spec": "457.2×457.2mm · 3.0T",
    "packaging": "16매 / 3.34㎡ (1BOX)",
    "description": "센스타일 트랜디 450각 · 샌드스톤",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5549P.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5549p"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5550p",
    "code": "TS5550P",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 콘크리트 TS5550P",
    "subLine": "450각",
    "spec": "457.2×457.2mm · 3.0T",
    "packaging": "16매 / 3.34㎡ (1BOX)",
    "description": "센스타일 트랜디 450각 · 콘크리트",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5550P.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5550p"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5551p",
    "code": "TS5551P",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 베이직 카펫 TS5551P",
    "subLine": "450각",
    "spec": "457.2×457.2mm · 3.0T",
    "packaging": "16매 / 3.34㎡ (1BOX)",
    "description": "센스타일 트랜디 450각 · 베이직 카펫",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5551P.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5551p"
  },
  {
    "id": "데코타일-kcc-kcc_square-ts5552p",
    "code": "TS5552P",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 베이직 카펫 TS5552P",
    "subLine": "450각",
    "spec": "457.2×457.2mm · 3.0T",
    "packaging": "16매 / 3.34㎡ (1BOX)",
    "description": "센스타일 트랜디 450각 · 베이직 카펫",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5552P.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_square-ts5552p"
  },
  {
    "id": "데코타일-kcc-kcc_wood-tw-5102g",
    "code": "TW5102G",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 파인 TW5102G",
    "subLine": "우드",
    "spec": "184×950mm · 3.0T",
    "packaging": "19매 / 3.32㎡ (1BOX)",
    "description": "센스타일 트랜디 우드 · 파인",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_우드_이미지/TW5102G.png",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_wood-tw-5102g"
  },
  {
    "id": "데코타일-kcc-kcc_wood-tw-5103g",
    "code": "TW5103G",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 워시 오크 TW5103G",
    "subLine": "우드",
    "spec": "184×950mm · 3.0T",
    "packaging": "19매 / 3.32㎡ (1BOX)",
    "description": "센스타일 트랜디 우드 · 워시 오크",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_우드_이미지/TW5103G.png",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_wood-tw-5103g"
  },
  {
    "id": "데코타일-kcc-kcc_wood-tw-5104g",
    "code": "TW5104G",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 오크 TW5104G",
    "subLine": "우드",
    "spec": "184×950mm · 3.0T",
    "packaging": "19매 / 3.32㎡ (1BOX)",
    "description": "센스타일 트랜디 우드 · 오크",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_우드_이미지/TW5104G.png",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_wood-tw-5104g"
  },
  {
    "id": "데코타일-kcc-kcc_wood-tw-5105g",
    "code": "TW5105G",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 오크 TW5105G",
    "subLine": "우드",
    "spec": "184×950mm · 3.0T",
    "packaging": "19매 / 3.32㎡ (1BOX)",
    "description": "센스타일 트랜디 우드 · 오크",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_우드_이미지/TW5105G.png",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_wood-tw-5105g"
  },
  {
    "id": "데코타일-kcc-kcc_wood-tw-5106g",
    "code": "TW5106G",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 엘름 TW5106G",
    "subLine": "우드",
    "spec": "184×950mm · 3.0T",
    "packaging": "19매 / 3.32㎡ (1BOX)",
    "description": "센스타일 트랜디 우드 · 엘름",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_우드_이미지/TW5106G.png",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_wood-tw-5106g"
  },
  {
    "id": "데코타일-kcc-kcc_wood-tw-5107g",
    "code": "TW5107G",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 오크 TW5107G",
    "subLine": "우드",
    "spec": "184×950mm · 3.0T",
    "packaging": "19매 / 3.32㎡ (1BOX)",
    "description": "센스타일 트랜디 우드 · 오크",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_우드_이미지/TW5107G.png",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_wood-tw-5107g"
  },
  {
    "id": "데코타일-kcc-kcc_wood-tw-5108g",
    "code": "TW5108G",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 오크 TW5108G",
    "subLine": "우드",
    "spec": "184×950mm · 3.0T",
    "packaging": "19매 / 3.32㎡ (1BOX)",
    "description": "센스타일 트랜디 우드 · 오크",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_우드_이미지/TW5108G.png",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_wood-tw-5108g"
  },
  {
    "id": "데코타일-kcc-kcc_wood-tw-5109g",
    "code": "TW5109G",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 메이플 TW5109G",
    "subLine": "우드",
    "spec": "184×950mm · 3.0T",
    "packaging": "19매 / 3.32㎡ (1BOX)",
    "description": "센스타일 트랜디 우드 · 메이플",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_우드_이미지/TW5109G.png",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_wood-tw-5109g"
  },
  {
    "id": "데코타일-kcc-kcc_wood-tw-5110g",
    "code": "TW5110G",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 오크 TW5110G",
    "subLine": "우드",
    "spec": "184×950mm · 3.0T",
    "packaging": "19매 / 3.32㎡ (1BOX)",
    "description": "센스타일 트랜디 우드 · 오크",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_우드_이미지/TW5110G.png",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_wood-tw-5110g"
  },
  {
    "id": "데코타일-kcc-kcc_wood-tw-5111g",
    "code": "TW5111G",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 워시 오크 TW5111G",
    "subLine": "우드",
    "spec": "184×950mm · 3.0T",
    "packaging": "19매 / 3.32㎡ (1BOX)",
    "description": "센스타일 트랜디 우드 · 워시 오크",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_우드_이미지/TW5111G.png",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_wood-tw-5111g"
  },
  {
    "id": "데코타일-kcc-kcc_wood-tw-5112g",
    "code": "TW5112G",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 오크 TW5112G",
    "subLine": "우드",
    "spec": "184×950mm · 3.0T",
    "packaging": "19매 / 3.32㎡ (1BOX)",
    "description": "센스타일 트랜디 우드 · 오크",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_우드_이미지/TW5112G.png",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_wood-tw-5112g"
  },
  {
    "id": "데코타일-kcc-kcc_wood-tw-5119g",
    "code": "TW5119G",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 오크 TW5119G",
    "subLine": "우드",
    "spec": "184×950mm · 3.0T",
    "packaging": "19매 / 3.32㎡ (1BOX)",
    "description": "센스타일 트랜디 우드 · 오크",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_우드_이미지/TW5119G.png",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_wood-tw-5119g"
  },
  {
    "id": "데코타일-kcc-kcc_wood-tw-5120g",
    "code": "TW5120G",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 오크 TW5120G",
    "subLine": "우드",
    "spec": "184×950mm · 3.0T",
    "packaging": "19매 / 3.32㎡ (1BOX)",
    "description": "센스타일 트랜디 우드 · 오크",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_우드_이미지/TW5120G.png",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_wood-tw-5120g"
  },
  {
    "id": "데코타일-kcc-센스타일_트랜디-ts5508p",
    "code": "TS5508P",
    "brand": "KCC",
    "lineup": "KCC 센스타일 트랜디 브러쉬 카펫 TS5508P",
    "subLine": "450각",
    "spec": "457.2×457.2mm · 3.0T",
    "packaging": "16매 / 3.34㎡ (1BOX)",
    "description": "센스타일 트랜디 450각 · 브러쉬 카펫",
    "image": "/images/Thumbnail_Image/materials/데코타일/KCC/트렌디/KCC_센스타일_트랜디_450각_이미지/TS5508P.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-%EC%84%BC%EC%8A%A4%ED%83%80%EC%9D%BC_%ED%8A%B8%EB%9E%9C%EB%94%94-ts5508p"
  }
];

const TRENDY_HISTORY_KEY = 'dk-home-trendy-products-v1';

function pickTrendyProducts(previousIds = []) {
  const previous = new Set(previousIds);
  const fresh = KCC_COLLECTION.filter((item) => !previous.has(item.id));
  const pool = [...(fresh.length >= 3 ? fresh : KCC_COLLECTION)];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}

// LX Flagship Sheet Flooring Lineups (Ordered: 뉴청맥 1.8T -> 지아자연애 2.2T -> 엑스컴포트 5.0T)
const LX_JANGPAN_COLLECTION = [
  {
    id: "newcheongmaek",
    code: "CM21882",
    brand: "LX하우시스",
    lineup: "LX하우시스 뉴청맥",
    subLine: "1.8T · 베스트셀러 륨 장판",
    spec: "1.8mm(T) × 1,830mm · 1.8T",
    packaging: "35m / Roll",
    description: "합리적인 가격과 검증된 품질로 대중적인 신뢰를 받는 대표 베스트셀러 1.8T 주거용 륨 장판",
    image: "/images/Thumbnail_Image/materials/장판/LX/LX하우시스_뉴청맥_1.8T/CM21882.jpg",
    detailUrl: "/materials/CM21882",
    browseUrl: "/materials?category=장판&brand=LX하우시스&line=뉴청맥"
  },
  {
    id: "jiazayeonae",
    code: "ZJ43601-22",
    brand: "LX하우시스",
    lineup: "LX하우시스 지아자연애",
    subLine: "2.2T · 친환경 프리미엄",
    spec: "2.2mm(T) × 1,830mm · 2.2T",
    packaging: "30m / Roll",
    description: "옥수수 유래 식물성 지아(Zea) 원료 층 적용, 친환경성과 풍부한 쿠션감을 갖춘 2.2T 프리미엄 장판",
    image: "/images/Thumbnail_Image/materials/장판/LX/LX하우시스_지아자연애_2.2T/ZJ43601-22.jpg",
    detailUrl: "/materials/ZJ43601-22",
    browseUrl: "/materials?category=장판&brand=LX하우시스&line=지아자연애"
  },
  {
    id: "xcomfort",
    code: "XCF3441",
    brand: "LX하우시스",
    lineup: "LX하우시스 엑스컴포트",
    subLine: "5.0T · 최고급 고탄성 쿠션",
    spec: "5.0mm(T) × 1,830mm · 5.0T",
    packaging: "20m / Roll",
    description: "5.0T 고탄성 2중 쿠션층으로 탁월한 충격 흡수와 층간소음 저감 효과를 제공하는 하이엔드 장판",
    image: "/images/Thumbnail_Image/materials/장판/LX/LX하우시스_엑스컴포트_5.0T/XCF3441.jpg",
    detailUrl: "/materials/XCF3441",
    browseUrl: "/materials?category=장판&brand=LX하우시스&line=엑스컴포트"
  }
];

// Real Construction Project Showcase
const REAL_PROJECTS = [
  {
    id: "store",
    space: "상업공간",
    icon: Building2,
    title: "성수동 복합 문화 쇼룸 & 매장",
    material: "KCC 센스타일 트랜디 데코타일",
    desc: "모던한 스톤 질감과 고내구성 바닥재로 완성한 트렌디한 상업 공간",
    image: "/images/home-interior/korea-store-01.webp",
    linkUrl: "/cases?category=상업공간"
  },
  {
    id: "office",
    space: "사무실",
    icon: Briefcase,
    title: "테헤란로 IT 비즈니스 오피스",
    material: "프리미엄 카페트타일 & 데코타일",
    desc: "흡음성과 정온함을 극대화하고 업무 효율을 높이는 스마트 오피스 바닥 시공",
    image: "/images/home-interior/korea-office-01.webp",
    linkUrl: "/cases?category=사무공간"
  },
  {
    id: "gym",
    space: "헬스장 및 GX룸",
    icon: Dumbbell,
    title: "마포구 프리미엄 피트니스 센터",
    material: "고충격 흡수 러버타일 & LVT",
    desc: "웨이트 트레이닝 존 충격 흡수와 GX 룸 미끄럼 방지를 고려한 맞춤 시공",
    image: "/images/home-interior/korea-hallway-01.webp",
    linkUrl: "/cases?category=상업공간"
  },
  {
    id: "residential",
    space: "주거공간",
    icon: HomeIcon,
    title: "마포구 아파트 거실 & 침실",
    material: "친환경 프리미엄 모노륨 장판",
    desc: "보행감과 층간소음 완화, 따뜻한 자연 우드 패턴을 살린 감성 주거 공간",
    image: "/images/home-interior/korea-apt-living-01.webp",
    linkUrl: "/cases?category=주거공간"
  }
];

export default function Home() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const userPausedRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [recommendedCategory, setRecommendedCategory] = useState("decotile");

  // Use deterministic initial markup for prerendering; randomize once per home visit.
  const [trendyProducts, setTrendyProducts] = useState(() => KCC_COLLECTION.slice(0, 3));
  const trendyInitializedRef = useRef(false);
  useEffect(() => {
    if (trendyInitializedRef.current) return;
    trendyInitializedRef.current = true;
    let previousIds = [];
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(TRENDY_HISTORY_KEY) || '[]');
      if (Array.isArray(saved)) previousIds = saved;
    } catch { /* Random selection also works when storage is unavailable. */ }
    const selected = pickTrendyProducts(previousIds);
    setTrendyProducts(selected);
    try {
      window.sessionStorage.setItem(TRENDY_HISTORY_KEY, JSON.stringify(selected.map((item) => item.id)));
    } catch { /* Storage is optional. */ }
  }, []);

  // Setup idle preload for seamless route switching
  useEffect(() => {
    const cleanupIdle = setupIdlePreload();
    return () => {
      if (cleanupIdle) cleanupIdle();
    };
  }, []);

  // Video Autoplay and Viewport Intersection Observer
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Browser policy: muted autoplay
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Video autoplay prevented by browser policy:", err);
          setIsPlaying(false);
        });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!userPausedRef.current && video.paused) {
              video.play().catch(() => {});
              setIsPlaying(true);
            }
          } else {
            if (!video.paused) {
              video.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // Scroll Motion Transformation
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY || 0;
          // Progress from 0 to 1 over first 450px of scroll
          const progress = Math.min(1, Math.max(0, y / 450));
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Video Play / Pause Toggle
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      userPausedRef.current = false;
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      userPausedRef.current = true;
      video.pause();
      setIsPlaying(false);
    }
  };

  // Dynamic Scroll Styles for Hero Video Frame and Overlay Text
  const heroTextOpacity = Math.max(0, 1 - scrollProgress * 1.3);
  const heroTextTranslateY = -scrollProgress * 40;
  const heroVideoScale = Math.max(0.94, 1 - scrollProgress * 0.06);
  const heroVideoRadius = Math.min(28, scrollProgress * 28);

  return (
    <MainLayout>
      <SEO 
        title="동경바닥재 | KCC 프리미엄 바닥재 쇼룸 · 데코타일·마루·장판 유통 및 시공"
        description="동경바닥재 - KCC 주력 센스타일 트랜디, 센스타일 프로, 센스레이 공식 공급. 자재 구매부터 견적 상담, 전문 시공 연계까지 한곳에서 진행하세요."
        canonical="https://dkfloor.co.kr/"
        jsonLd={HOME_JSON_LD}
      />

      <div className="premium-showroom-home">

        {/* ================= 1. PREMIUM FULLSCREEN VIDEO HERO ================= */}
        <section className="showroom-hero-section">
          {/* Transforming Video Stage Container */}
          <div 
            className="hero-video-stage"
            style={{
              transform: `scale(${heroVideoScale})`,
              borderRadius: `${heroVideoRadius}px`,
              boxShadow: scrollProgress > 0.08 ? `0 24px 60px rgba(0, 0, 0, ${scrollProgress * 0.4})` : 'none'
            }}
          >
            {/* HTML5 Video Element */}
            {!videoError ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="home-hero-video"
                onError={() => setVideoError(true)}
              >
                <source src="/videos/home-hero.mp4" type="video/mp4" />
              </video>
            ) : (
              <div className="hero-video-fallback">
                <img 
                  src="/images/home-interior/korea-apt-living-01.webp" 
                  alt="동경바닥재 프리미엄 인테리어 쇼룸" 
                  className="fallback-image"
                />
              </div>
            )}

            {/* Cinematic Gradient Tint Overlay */}
            <div className="hero-cinematic-overlay" />

            {/* Video Play / Pause Toggle Button */}
            {!videoError && (
              <button 
                type="button"
                className="hero-video-toggle-btn"
                onClick={togglePlay}
                aria-label={isPlaying ? "영상 일시정지" : "영상 재생"}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                <span>{isPlaying ? "PAUSE" : "PLAY"}</span>
              </button>
            )}

            {/* Central Brand Headline & Call to Action (Fades on Scroll) */}
            <div 
              className="hero-content-wrap"
              style={{
                opacity: heroTextOpacity,
                transform: `translate3d(0, ${heroTextTranslateY}px, 0)`,
                pointerEvents: heroTextOpacity < 0.15 ? 'none' : 'auto'
              }}
            >
              <div className="container hero-inner-container">
                {/* 0.2s: Brand Fade In */}
                <div className="hero-brand-tag">
                  <span className="brand-dot" />
                  <span>DONGKYUNG FLOORING</span>
                </div>

                {/* 0.6s: Main Title Slide Up */}
                <h1 className="hero-main-title">
                  공간의 가치를 완성하는 바닥재
                </h1>

                {/* 1.1s: Subtitle Appear */}
                <p className="hero-sub-description">
                  좋은 공간의 시작, 자재 선택부터 시공까지.
                </p>

                {/* 1.5s: Action Buttons Appear */}
                <div className="hero-cta-group">
                  <Link 
                    to="/materials" 
                    className="btn-hero-primary"
                    onMouseEnter={() => preloadRoute('/materials')}
                    onTouchStart={() => preloadRoute('/materials')}
                  >
                    <ShoppingBag size={18} />
                    <span>자재 찾기 →</span>
                  </Link>

                  <Link 
                    to="/estimate/request" 
                    className="btn-hero-glass"
                    onMouseEnter={() => preloadRoute('/estimate')}
                    onTouchStart={() => preloadRoute('/estimate')}
                  >
                    <FileText size={18} />
                    <span>견적문의 →</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Subtle Scroll Cue */}
            <div 
              className="hero-scroll-cue"
              style={{ opacity: heroTextOpacity }}
            >
              <span className="cue-line" />
              <span className="cue-text">SCROLL</span>
            </div>
          </div>
        </section>

        {/* ================= 2. RECOMMENDED COLLECTION (데코타일: KCC / 장판: LX) ================= */}
        <section className="showroom-collection-section">
          <div className="container">
            <div className="section-head-block center">
              <span className="section-eyebrow">OUR COLLECTION</span>
              <h2 className="section-primary-title">
                공간에 어울리는 바닥재를 만나보세요.
              </h2>
              <p className="section-sub-copy">
                {recommendedCategory === "decotile"
                  ? "KCC 센스타일 트랜디의 다양한 패턴을 만나보세요."
                  : "동경바닥재가 추천하는 LX하우시스 대표 친환경·고기능 륨 장판 라인업"}
              </p>

              {/* Category Switcher Tabs */}
              <div className="collection-category-tabs">
                <button
                  type="button"
                  className={`collection-tab-btn ${recommendedCategory === "decotile" ? "active" : ""}`}
                  onClick={() => setRecommendedCategory("decotile")}
                  aria-pressed={recommendedCategory === "decotile"}
                >
                  <span>데코타일 추천</span>
                </button>
                <button
                  type="button"
                  className={`collection-tab-btn ${recommendedCategory === "jangpan" ? "active" : ""}`}
                  onClick={() => setRecommendedCategory("jangpan")}
                  aria-pressed={recommendedCategory === "jangpan"}
                >
                  <span>장판 추천</span>
                </button>
              </div>
            </div>

            {/* Flagship Cards Grid */}
            <div className="collection-cards-grid">
              {(recommendedCategory === "decotile" ? trendyProducts : LX_JANGPAN_COLLECTION).map((item, idx) => (
                <article key={item.id} className="collection-card">
                  {/* Card Thumbnail Image with Hover Zoom */}
                  <div className="collection-card-media">
                    <img 
                      src={item.image} 
                      alt={item.lineup} 
                      loading="lazy"
                      decoding="async"
                      width="420"
                      height="340"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/no-image.svg";
                      }}
                    />
                    <span className="collection-index-pill">0{idx + 1}</span>
                  </div>

                  {/* Card Content & Details */}
                  <div className="collection-card-body">
                    <div className="card-brand-row">
                      <span className="brand-chip">{item.brand || "KCC"}</span>
                      <span className="subline-chip">{item.subLine}</span>
                    </div>

                    <h3 className="card-lineup-title">{item.lineup}</h3>
                    <p className="card-description">{item.description}</p>

                    <div className="card-spec-meta">
                      <div className="spec-meta-item">
                        <span className="spec-meta-label">규격</span>
                        <span className="spec-meta-val">{item.spec}</span>
                      </div>
                      <div className="spec-meta-item">
                        <span className="spec-meta-label">포장단위</span>
                        <span className="spec-meta-val">{item.packaging}</span>
                      </div>
                    </div>

                    <div className="card-action-bar">
                      <Link 
                        to={item.detailUrl} 
                        className="btn-card-detail"
                        onMouseEnter={() => preloadRoute(item.detailUrl)}
                      >
                        자세히 보기 <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Quick Filter Navigation Sub-bar */}
            {recommendedCategory === "decotile" ? (
              <div className="kcc-quick-pills-bar">
                <span className="quick-bar-label">라인업별 바로가기:</span>
                <div className="quick-pills-wrap">
                  <Link 
                    to="/materials?category=데코타일&brand=KCC&shape=450각" 
                    className="quick-pill"
                  >
                    센스타일 트랜디 450각
                  </Link>
                  <Link 
                    to="/materials?category=데코타일&brand=KCC&shape=600각" 
                    className="quick-pill"
                  >
                    센스타일 트랜디 600각
                  </Link>
                  <Link 
                    to="/materials?category=데코타일&brand=KCC&shape=일반 우드" 
                    className="quick-pill"
                  >
                    센스타일 트랜디 우드
                  </Link>
                  <Link 
                    to="/materials?category=데코타일&brand=KCC&line=센스타일 프로" 
                    className="quick-pill"
                  >
                    센스타일 프로
                  </Link>
                  <Link 
                    to="/materials?category=데코타일&brand=KCC&line=센스레이(내수)" 
                    className="quick-pill"
                  >
                    센스레이 (5.0T)
                  </Link>
                  <Link 
                    to="/materials?category=데코타일&brand=KCC" 
                    className="quick-pill highlight"
                  >
                    KCC 데코타일 전체 보기 →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="kcc-quick-pills-bar">
                <span className="quick-bar-label">두께별 바로가기:</span>
                <div className="quick-pills-wrap">
                  <Link 
                    to="/materials?category=장판&brand=LX하우시스&thickness=1.8T" 
                    className="quick-pill"
                  >
                    뉴청맥 (1.8T)
                  </Link>
                  <Link 
                    to="/materials?category=장판&brand=LX하우시스&thickness=2.2T" 
                    className="quick-pill"
                  >
                    지아자연애 (2.2T)
                  </Link>
                  <Link 
                    to="/materials?category=장판&brand=LX하우시스&thickness=3.2T" 
                    className="quick-pill"
                  >
                    지아사랑애 (2.7/3.2T)
                  </Link>
                  <Link 
                    to="/materials?category=장판&brand=LX하우시스&thickness=4.5T" 
                    className="quick-pill"
                  >
                    지아소리잠 (4.5T)
                  </Link>
                  <Link 
                    to="/materials?category=장판&brand=LX하우시스&thickness=5.0T" 
                    className="quick-pill"
                  >
                    엑스컴포트 (5.0T)
                  </Link>
                  <Link 
                    to="/materials?category=장판&brand=LX하우시스" 
                    className="quick-pill highlight"
                  >
                    LX하우시스 장판 전체 보기 →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================= 3. REAL PROJECTS (CONSTRUCTION CASES) ================= */}
        <LazySection minHeight="480px">
          <section className="showroom-projects-section">
            <div className="container">
              <div className="section-head-block row-header">
                <div>
                  <span className="section-eyebrow">REAL PROJECTS</span>
                  <h2 className="section-primary-title">우리가 완성한 공간들</h2>
                  <p className="section-sub-copy">
                    동경바닥재 자재로 완성된 실제 시공 포트폴리오를 확인해보세요.
                  </p>
                </div>
                <Link 
                  to="/cases" 
                  className="link-projects-all"
                  onMouseEnter={() => preloadRoute('/cases')}
                >
                  <span>시공사례 전체 보기</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Real Project Showcase Grid (4 Types of Spaces) */}
              <div className="projects-cards-grid">
                {REAL_PROJECTS.map((item) => {
                  const SpaceIcon = item.icon;
                  return (
                    <article 
                      key={item.id} 
                      className="project-case-card"
                      onClick={() => navigate(item.linkUrl)}
                    >
                      <div className="project-media-wrap">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          loading="lazy"
                          decoding="async"
                          width="560"
                          height="360"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/home-interior/korea-apt-living-01.webp";
                          }}
                        />
                        <div className="project-space-tag">
                          <SpaceIcon size={14} />
                          <span>{item.space}</span>
                        </div>
                      </div>

                      <div className="project-body-wrap">
                        <span className="project-material-summary">{item.material}</span>
                        <h3 className="project-case-title">{item.title}</h3>
                        <p className="project-case-desc">{item.desc}</p>
                        <span className="project-view-more">
                          현장 시공사례 보기 <ChevronRight size={15} />
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        </LazySection>

        {/* ================= 4. ABOUT DONGKYUNG BRAND STORY ================= */}
        <LazySection minHeight="420px">
          <section className="showroom-about-section">
            <div className="container">
              <div className="about-editorial-wrap">
                <div className="about-header-column">
                  <span className="section-eyebrow">ABOUT DONGKYUNG</span>
                  <h2 className="about-editorial-title">
                    좋은 자재가<br />
                    좋은 공간을 만듭니다.
                  </h2>
                </div>

                <div className="about-body-column">
                  <p className="about-lead-paragraph">
                    동경바닥재는 다양한 바닥재와 벽지를 공급하며, 공간의 용도와 현장 조건에 맞는 자재 선택 및 시공 상담을 도와드립니다.
                  </p>
                  <p className="about-sub-paragraph">
                    주거 공간부터 상업용 매장, 대형 오피스 및 특수 시설까지 — 공간마다 요구되는 내마모성, 쿠션감, 수밀성을 정밀히 분석하여 최적의 솔루션을 제안합니다.
                  </p>

                  <div className="about-values-grid">
                    <div className="value-item">
                      <div className="value-num">01</div>
                      <h4>정품 자재 직공급</h4>
                      <p>KCC, LX, 동신, 동화, 이건 등 국내 주요 제조사 100% 정품 바닥재 공급</p>
                    </div>

                    <div className="value-item">
                      <div className="value-num">02</div>
                      <h4>현장 맞춤 견적</h4>
                      <p>공간 유형, 면적, 용도에 맞춘 정확한 소요량 산출과 투명한 견적</p>
                    </div>

                    <div className="value-item">
                      <div className="value-num">03</div>
                      <h4>원스톱 시공 연계</h4>
                      <p>자재 구매부터 숙련된 시공팀의 정밀 책임 시공까지 원스톱 관리</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </LazySection>

        {/* ================= 5. ESTIMATE INQUIRY CTA ================= */}
        <section className="showroom-estimate-cta-section">
          <div className="container">
            <div className="estimate-cta-inner">
              <div className="estimate-text-block">
                <span className="estimate-eyebrow">ESTIMATE CONSULTATION</span>
                <h2 className="estimate-main-title">
                  공간의 변화, 지금 시작하세요.
                </h2>
                <p className="estimate-sub-title">
                  자재 선택부터 시공 상담까지, 동경바닥재 전문가가 친절히 상담해 드립니다.
                </p>
              </div>

              <div className="estimate-actions-block">
                <Link 
                  to="/estimate/request" 
                  className="btn-estimate-gold"
                  onMouseEnter={() => preloadRoute('/estimate')}
                  onTouchStart={() => preloadRoute('/estimate')}
                >
                  <FileText size={18} />
                  <span>견적문의 하기 →</span>
                </Link>

                <div className="estimate-contact-links">
                  <a 
                    href={KAKAO_CHAT_URL} 
                    target="_blank" 
                    rel="noreferrer noopener" 
                    className="contact-pill kakao"
                  >
                    <MessageSquare size={16} />
                    <span>카카오톡 1:1 상담</span>
                  </a>

                  <a 
                    href={`tel:${OFFICE_PHONE.replace(/[^0-9]/g, '')}`} 
                    className="contact-pill phone"
                  >
                    <PhoneCall size={16} />
                    <span>전화 문의: {OFFICE_PHONE}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </MainLayout>
  );
}
