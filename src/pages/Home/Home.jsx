import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import LazySection from "../../components/common/LazySection";
import SEO from "../../components/seo/SEO";
import { ProductImage } from "../../components/ui";
import HomePromoBanner from "../../components/home/HomePromoBanner";
import { KAKAO_CHAT_URL, OFFICE_PHONE } from "../../constants/contact";
import { preloadRoute, setupIdlePreload } from "../../utils/routePreloader";
import { 
  ArrowRight, 
  ArrowUpRight,
  ChevronRight, 
  Search,
  Megaphone,
  X,
  FileText, 
  Building2, 
  Briefcase, 
  Dumbbell, 
  Home as HomeIcon,
  PhoneCall,
  MessageSquare
} from "lucide-react";
import { getCaseImageUrl, getCaseImageSrcSet } from "../../utils/caseImageUtils";
import { resolveCaseMaterialLinks } from "../../utils/caseMaterialUtils";
import { formatCaseSlashTitle } from "../../utils/caseTitleUtils";
import { fetchPublishedCases } from "../../utils/constructionCasesService";
import { fetchPublishedNotices, STATIC_OPERATIONAL_NOTICES } from "../../utils/noticesService";
import { FALLBACK_CASES } from "../../data/fallbackCases";
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/a524fd288cf738d96a552b448c80d3a8.webp",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/9c1b09eaf8a06136327acc3e5dff76df.webp",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/ff973c3456d2b36577c22cc8bc83d9d4.webp",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/c94d875b2ebb52829807ae070ccb5a06.webp",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/b33d0c0c97bd12809a3851db630180a1.webp",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/faf76285e1aa9b33a9bbb39d5ce8604c.webp",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/ea67c5f60daf33f5a50800ae84e5408c.webp",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/fa3d6e3a9c845f6509ab1805d1441464.png",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/84ebacf818dd4d3a615603c63aab1449.png",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/863b1c55a13e9fa60a82c029fa3abfd6.png",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/afda9693cf91b0270130bab0b6c01c01.png",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/580de52faafdd44d2fd9847930ff475e.png",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/aafb39cd3cfb83527f3efbc7b6bc53ef.png",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/7f3de3c1e7b30a95b9511bb95bd2cf7d.png",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/83c5c74f5ababbd58b8f4bee49704e2e.webp",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/bd9c12ebe639df9becbfffc9234df844.webp",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/d5b1317d42d32df1f082359b03cc86df.webp",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/92709517b5d44ca995b545dd274d92b7.webp",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/4449b5cf46be13ce5652be7ccd8f030f.webp",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/81eba327b011be60f753cd7edfd76eb3.webp",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/2f657d5dbd5ab01cfda219b032cd5a0e.webp",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/a8f769bb13b2d3d3389862729670b1bd.webp",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/0a8962314ea09781411386f9fab163a2.webp",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/ccef9d9f86b501d7ebd35335d81ca011.webp",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/c85cd2e127dffc7253ff83e77c399f70.webp",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/886d75684972a16b33195e2eb765776a.webp",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/21a14dc0c1b8a1ede51541bd953aae6c.png",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/fcd08fbe3a7c118bcd5e2b5f069b2c3f.png",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/fdf76710b8f7a1e48c07bf3b86d18857.png",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/c0a5df7d4bb5986f9f5b4f58c48cd7cb.png",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/6c41840a52422b6d3443cd684d4fa759.png",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/8344139e7f8eecb475c3f2427d20d817.png",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/f47748118a95ec6d1dd69326c1c7258c.png",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/85ff2e9b257aadc21565ec0d1d28c059.png",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/fd7673ff201cbcf721e4780bcd7a73cd.png",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/ecb2b96fac97624ee1e7960ce24fdb77.png",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/11b450b58afc13d61bc75359e503eb22.png",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/e73927040f02a92e7cdc9993f5f6dfcc.png",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/63579e8ebf50082fb02fa86ab2362750.png",
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
    "image": "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/093d16e24be56ca83163f64425b1e831.webp",
    "detailUrl": "/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-%EC%84%BC%EC%8A%A4%ED%83%80%EC%9D%BC_%ED%8A%B8%EB%9E%9C%EB%94%94-ts5508p"
  }
];

const TRENDY_HISTORY_KEY = 'dk-home-trendy-products-v1';
const TRENDY_DISPLAY_COUNT = 4;

function pickTrendyProducts(previousIds = []) {
  const previous = new Set(previousIds);
  const fresh = KCC_COLLECTION.filter((item) => !previous.has(item.id));
  const pool = [...(fresh.length >= TRENDY_DISPLAY_COUNT ? fresh : KCC_COLLECTION)];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, TRENDY_DISPLAY_COUNT);
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
    image: "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/b2a48f218c9a268ee34ad6db324fbf4a.jpg",
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
    image: "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/e7e926483f0933094e7520cceec28946.jpg",
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
    image: "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/72b5851371695dc8d536dfc907275c13.jpg",
    detailUrl: "/materials/XCF3441",
    browseUrl: "/materials?category=장판&brand=LX하우시스&line=엑스컴포트"
  }
];

const PREVIEW_CASE_COUNT = 3;

const QUICK_CATEGORIES = [
  { key: "all", label: "전체 자재", path: "/materials?category=all&brand=all" },
  { key: "데코타일", label: "데코타일", path: "/materials?category=%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC" },
  { key: "장판", label: "장판", path: "/materials?category=%EC%9E%A5%ED%8C%90" },
  { key: "마루", label: "마루", path: "/materials?category=%EB%A7%88%EB%A3%A8" },
  { key: "벽지", label: "벽지", path: "/materials?category=%EB%B2%BD%EC%A7%80" },
  { key: "카페트타일", label: "카페트타일", path: "/materials?category=%EC%B9%B4%ED%8E%98%ED%8A%B8%ED%83%80%EC%9D%BC" },
  { key: "부자재", label: "부자재", path: "/materials?category=%EB%B6%80%EC%9E%90%EC%9E%AC" }
];

function getCaseSpaceIcon(item) {
  if (item?.title?.includes('헬스장') || item?.title?.includes('피트니스')) return Dumbbell;
  if (item?.category === '주거공간') return HomeIcon;
  if (item?.category === '사무공간') return Briefcase;
  return Building2;
}

function getRecentPublishedCases(cases, count = PREVIEW_CASE_COUNT) {
  if (!Array.isArray(cases)) return [];
  const seenIds = new Set();
  const valid = cases.filter((c) => {
    if (!c || c.is_published === false || c.is_active === false) return false;
    const key = String(c.id);
    if (seenIds.has(key)) return false;
    seenIds.add(key);
    return true;
  });
  return [...valid]
    .sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      return Number(b.id || 0) - Number(a.id || 0);
    })
    .slice(0, count);
}

export default function Home() {
  const navigate = useNavigate();

  const [recommendedCategory, setRecommendedCategory] = useState("decotile");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [mobileSearchCategory, setMobileSearchCategory] = useState("all");

  // Recent 3 construction cases (latest registered order)
  const [recentCases, setRecentCases] = useState(() =>
    getRecentPublishedCases(FALLBACK_CASES, PREVIEW_CASE_COUNT)
  );

  // Notices (Supabase `notices` if present, otherwise clean static operational notices)
  const [notices, setNotices] = useState(() => STATIC_OPERATIONAL_NOTICES);
  const [allNotices, setAllNotices] = useState(() => STATIC_OPERATIONAL_NOTICES);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showAllNoticesModal, setShowAllNoticesModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetchPublishedCases().then((allCases) => {
      if (!isMounted) return;
      const latest = getRecentPublishedCases(allCases, PREVIEW_CASE_COUNT);
      if (latest.length > 0) {
        setRecentCases(latest);
      }
    });

    fetchPublishedNotices(3).then(({ items, allItems, isFromDb }) => {
      if (!isMounted) return;
      if (isFromDb && items.length > 0) {
        setNotices(items);
        setAllNotices(allItems);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Use deterministic initial markup for prerendering; randomize once per home visit.
  const [trendyProducts, setTrendyProducts] = useState(() => KCC_COLLECTION.slice(0, TRENDY_DISPLAY_COUNT));
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

  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    const keyword = mobileSearchQuery.trim();
    if (!keyword) {
      if (mobileSearchCategory !== "all") {
        navigate(`/materials?category=${encodeURIComponent(mobileSearchCategory)}`);
      } else {
        navigate("/materials");
      }
      return;
    }
    if (mobileSearchCategory !== "all") {
      navigate(`/materials?category=${encodeURIComponent(mobileSearchCategory)}&q=${encodeURIComponent(keyword)}`);
    } else {
      navigate(`/materials?category=all&q=${encodeURIComponent(keyword)}`);
    }
  };

  const formatNoticeDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  return (
    <MainLayout>
      <SEO 
        title="동경바닥재 | KCC·LX 바닥재 통합검색 쇼핑몰 · 데코타일·마루·장판 유통 및 시공"
        description="동경바닥재 - 상품번호, 브랜드, 색상별 통합 자재 검색. KCC 센스타일, LX하우시스, 동신, 동화 등 바닥재 유통부터 실제 시공사례 확인·견적 상담까지."
        canonical="https://dkfloor.co.kr/"
        jsonLd={HOME_JSON_LD}
      />

      <div className="premium-showroom-home home-shopping-redesign">

        {/* ================= 1. MOBILE TOP SEARCH BAR ================= */}
        <section className="home-mobile-search-bar" aria-label="모바일 통합 자재 검색">
          <div className="container">
            <form onSubmit={handleMobileSearchSubmit} className="mobile-search-form">
              <select
                className="mobile-search-select"
                value={mobileSearchCategory}
                onChange={(e) => setMobileSearchCategory(e.target.value)}
                aria-label="카테고리 선택"
              >
                <option value="all">전체</option>
                <option value="데코타일">데코타일</option>
                <option value="장판">장판</option>
                <option value="마루">마루</option>
                <option value="벽지">벽지</option>
                <option value="카페트타일">카페트타일</option>
                <option value="부자재">부자재</option>
              </select>
              <input
                type="text"
                className="mobile-search-input"
                placeholder="상품번호, 브랜드, 색상, 자재명 검색"
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
              />
              <button type="submit" className="mobile-search-btn" aria-label="검색">
                <Search size={18} />
              </button>
            </form>
          </div>
        </section>

        {/* ================= 2. CATEGORY QUICK NAVIGATION ================= */}
        <section className="home-category-quick-section" aria-label="카테고리 빠른 이동">
          <div className="container">
            <nav className="home-category-quick-nav">
              {QUICK_CATEGORIES.map((cat) => (
                <Link
                  key={cat.key}
                  to={cat.path}
                  className={`home-quick-cat-link ${cat.key === "all" ? "is-primary" : ""}`}
                  onMouseEnter={() => preloadRoute('/materials')}
                >
                  {cat.label}
                </Link>
              ))}
            </nav>
          </div>
        </section>

        {/* ================= 2.5. AUTO-ROTATING PROMO BANNER (중앙 자동 전환 홍보 배너) ================= */}
        <HomePromoBanner recentCases={recentCases} />

        {/* ================= 3. COMPACT NOTICE BAR (공지사항) ================= */}
        <section className="home-notice-section" aria-label="공지사항">
          <div className="container">
            <div className="home-notice-bar">
              <div className="home-notice-badge">
                <Megaphone size={15} />
                <span>공지사항</span>
              </div>

              <ul className="home-notice-list">
                {notices.slice(0, 3).map((notice) => (
                  <li key={notice.id} className="home-notice-item">
                    <button
                      type="button"
                      className="home-notice-link-btn"
                      onClick={() => setSelectedNotice(notice)}
                    >
                      {notice.is_pinned && <span className="notice-pin-tag">중요</span>}
                      {notice.tag && !notice.is_pinned && <span className="notice-cat-tag">{notice.tag}</span>}
                      <span className="notice-title-text">{notice.title}</span>
                      {notice.created_at && (
                        <span className="notice-date-text">{formatNoticeDate(notice.created_at)}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="home-notice-more-btn"
                onClick={() => setShowAllNoticesModal(true)}
              >
                <span>전체보기</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* ================= 4. RECOMMENDED COLLECTION (추천 자재: 1. 데코타일 / 2. 장판) ================= */}
        <section className="showroom-collection-section">
          <div className="container">
            <div className="section-head-block row-header collection-header-bar">
              <div>
                <h2 className="section-primary-title">추천 자재</h2>
                <p className="section-sub-copy">
                  {recommendedCategory === "decotile"
                    ? "KCC 센스타일 트랜디의 다양한 패턴을 만나보세요."
                    : "LX하우시스 대표 친환경·고기능 륨 장판 라인업"}
                </p>
              </div>

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
                <article
                  key={item.id}
                  className="collection-card"
                  onClick={() => navigate(item.detailUrl)}
                >
                  {/* Card Thumbnail Image with Hover Zoom */}
                  <div className="collection-card-media">
                    <ProductImage
                      product={item}
                      src={item.image}
                      alt={item.lineup}
                      fit="cover"
                      priority={idx < 4}
                    />
                    <span className="collection-index-pill">0{idx + 1}</span>
                  </div>

                  {/* Card Content & Details */}
                  <div className="collection-card-body">
                    <div className="card-brand-row">
                      <span className="brand-chip">{item.brand || "KCC"}</span>
                      {item.code && <span className="code-chip">{item.code}</span>}
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

                    <div className="card-action-bar" onClick={(e) => e.stopPropagation()}>
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

        {/* ================= 5. REAL CONSTRUCTION CASES (실제 시공사례 최근 3건) ================= */}
        <section className="showroom-projects-section home-cases-first-screen">
          <div className="container">
            <div className="section-head-block row-header home-cases-header">
              <div>
                <h1 className="section-primary-title">실제 시공사례</h1>
                <p className="section-sub-copy">
                  최근 완공된 실제 시공 현장과 사용 자재를 바로 확인해 보세요.
                </p>
              </div>
              <Link 
                to="/cases" 
                className="link-projects-all"
                onMouseEnter={() => preloadRoute('/cases')}
              >
                <span>전체보기</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="projects-cards-grid preview-three-grid home-cases-grid-16x9">
              {recentCases.map((item) => {
                const materialLinks = resolveCaseMaterialLinks(item);
                const directLinks = materialLinks.filter((l) => l.isDirectDetail);
                const thumbUrl = getCaseImageUrl(item.main_image_url, '800');
                const srcSet = getCaseImageSrcSet(item.main_image_url);
                const SpaceIcon = getCaseSpaceIcon(item);
                const spaceLabel = `${item.location ? item.location + ' · ' : ''}${item.category || '시공현장'}`;
                const displayTitle = formatCaseSlashTitle(item);

                return (
                  <article 
                    key={item.id} 
                    className="project-case-card home-case-card-compact"
                    onClick={() => navigate(`/cases?id=${item.id}`)}
                    title={`${displayTitle} 상세 보기`}
                  >
                    <div className="project-media-wrap aspect-16-9">
                      <img 
                        src={thumbUrl} 
                        srcSet={srcSet || undefined}
                        sizes="(max-width: 767px) 84vw, (max-width: 1024px) 50vw, 410px"
                        alt={displayTitle} 
                        loading="lazy"
                        decoding="async"
                        width="640"
                        height="360"
                        onError={(e) => {
                          if (e.target.dataset.triedRaw !== 'true' && item.main_image_url && item.main_image_url !== thumbUrl) {
                            e.target.dataset.triedRaw = 'true';
                            e.target.src = item.main_image_url;
                          } else {
                            e.target.onerror = null;
                            e.target.src = "/images/no-image.svg";
                          }
                        }}
                      />
                      <div className="project-space-tag">
                        <SpaceIcon size={13} />
                        <span>{spaceLabel}</span>
                      </div>
                    </div>

                    <div className="project-body-wrap home-case-body-compact">
                      <h2 className="project-case-title">{displayTitle}</h2>

                      <div className="project-material-links-wrap" onClick={(e) => e.stopPropagation()}>
                        {directLinks.length > 0 ? (
                          directLinks.map((linkItem, lIdx) => (
                            <Link
                              key={lIdx}
                              to={linkItem.path}
                              className="project-material-badge-link"
                              title={`${linkItem.label} 자재 상세페이지로 이동`}
                            >
                              <span>{linkItem.label}</span>
                              <ArrowUpRight size={12} className="material-link-arrow" />
                            </Link>
                          ))
                        ) : item.material_summary ? (
                          <span className="project-material-summary">
                            {item.material_summary}
                          </span>
                        ) : null}
                      </div>

                      <span className="project-view-more">
                        시공사례 보기 <ChevronRight size={15} />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

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

        {/* Notice Detail / All Notices Modal */}
        {(selectedNotice || showAllNoticesModal) && (
          <div
            className="home-notice-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="공지사항 상세"
            onClick={() => {
              setSelectedNotice(null);
              setShowAllNoticesModal(false);
            }}
          >
            <div className="home-notice-modal" onClick={(e) => e.stopPropagation()}>
              <div className="home-notice-modal-header">
                <h3>{selectedNotice ? "공지사항" : "전체 공지사항"}</h3>
                <button
                  type="button"
                  className="home-notice-modal-close"
                  aria-label="닫기"
                  onClick={() => {
                    setSelectedNotice(null);
                    setShowAllNoticesModal(false);
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {selectedNotice ? (
                <div className="home-notice-modal-body">
                  <div className="home-notice-modal-meta">
                    {selectedNotice.is_pinned && <span className="notice-pin-tag">중요</span>}
                    {selectedNotice.tag && !selectedNotice.is_pinned && (
                      <span className="notice-cat-tag">{selectedNotice.tag}</span>
                    )}
                    {selectedNotice.created_at && (
                      <span className="notice-date-text">{formatNoticeDate(selectedNotice.created_at)}</span>
                    )}
                  </div>
                  <h4 className="home-notice-modal-title">{selectedNotice.title}</h4>
                  <p className="home-notice-modal-content">{selectedNotice.content}</p>
                </div>
              ) : (
                <div className="home-notice-modal-body">
                  <ul className="home-notice-all-list">
                    {allNotices.map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          className="home-notice-all-item"
                          onClick={() => {
                            setShowAllNoticesModal(false);
                            setSelectedNotice(n);
                          }}
                        >
                          <div className="home-notice-all-left">
                            {n.is_pinned && <span className="notice-pin-tag">중요</span>}
                            {n.tag && !n.is_pinned && <span className="notice-cat-tag">{n.tag}</span>}
                            <span className="home-notice-all-title">{n.title}</span>
                          </div>
                          {n.created_at && (
                            <span className="notice-date-text">{formatNoticeDate(n.created_at)}</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}
