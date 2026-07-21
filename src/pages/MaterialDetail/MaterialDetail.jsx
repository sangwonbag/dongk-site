import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Phone, 
  FileText, 
  BookOpen, 
  ShoppingCart, 
  Clock, 
  MapPin, 
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import { ProductImage } from "../../components/ui";
import { useEstimateCart } from "../../contexts/EstimateCartContext";
import { KAKAO_CHAT_URL } from "../../constants/contact";
import { getValidGalleryImages, getDetailImage, getThumbnailImage } from "../../utils/galleryUtils";
import { getMaterialImagePath } from "../../utils/materialImageResolver";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import { materials } from "../../data/materials.db"; // Local fallback data
import { getComputedBrand, normalizeProductDetails, formatFlooringProductName, getProductUnit } from "../../utils/brandUtils";
import { dongshinPolymer2026 } from "../../data/dongshinPolymer2026.js";
import { imageManifest } from "../../data/materialImageManifest.generated";
import { normalizeImagePath, getImageSrc, getUniqueProductImages } from "../../utils/galleryNormalizer";
import { getProductPyeong } from "../../utils/shippingUtils";
import "./MaterialDetail.css";

const normalizeText = (value = "") =>
  String(value).replace(/\s+/g, "").toLowerCase().trim();

const getMaterialMatchKey = (item) => {
  if (!item) return "";
  const brand = normalizeText(item.brand);
  const category = normalizeText(item.category);
  const line = normalizeText(item.line);
  const name = normalizeText(item.name || item.productName);

  // 제품코드가 있는 브랜드는 code 기준
  if (item.code) {
    return `${brand}_${category}_${normalizeText(item.code)}`;
  }

  // 이건마루처럼 code가 없는 제품은 line + name 기준
  return `${brand}_${category}_${line}_${name}`;
};

// Helper function to infer brand from code prefix if missing
const inferBrandFromCode = (code) => {
  if (!code) return null;
  const upperCode = code.toUpperCase();
  if (upperCode.startsWith("TS")) {
    return "KCC";
  }
  if (
    upperCode.startsWith("D") || 
    upperCode.startsWith("DS") || 
    upperCode.startsWith("CH")
  ) {
    return "동신";
  }
  if (upperCode.includes("LX") || upperCode.startsWith("LX")) {
    return "LX";
  }
  if (upperCode.includes("LG") || upperCode.startsWith("LG")) {
    return "LG";
  }
  return null;
};

// Eagon flooring sub-classification / upper category helper
const getEagonUpperCategory = (line = "") => {
  const norm = String(line).replace(/\s+/g, "").toLowerCase();
  if (norm.includes("라르고")) return "원목마루";
  if (norm.includes("포레스타") || norm.includes("제나")) return "천연마루";
  if (norm.includes("그린")) return "프리미엄 강마루";
  if (norm.includes("세라")) return "강마루";
  return "마루";
};

const getEagonClassification = (line = "") => getEagonUpperCategory(line);

// Eagon line-based directory folders helper
const getEagonImageFolder = (line = "") => {
  const norm = String(line).replace(/\s+/g, "").toLowerCase();
  
  if (norm.includes("라르고솔레190t1")) return "원목마루/라르고 솔레 190 T1";
  if (norm.includes("라르고솔레190t3")) return "원목마루/라르고 솔레 190 T3";
  if (norm.includes("라르고솔레150t4")) return "원목마루/라르고 솔레 150 T4";
  if (norm.includes("라르고솔레240t4")) return "원목마루/라르고 솔레 150 T4";
  if (norm.includes("라르고")) return "원목마루/라르고 솔레 190 T3";
  
  if (norm.includes("제나내추럴") || norm.includes("제나")) return "천연마루/제나 내추럴";
  if (norm.includes("포레스타g")) return "천연마루/포레스타 G";
  if (norm.includes("포레스타")) return "천연마루/포레스타";
  
  if (norm.includes("그린스퀘어")) return "프리미엄 강마루/그린";
  if (norm.includes("그린")) return "프리미엄 강마루/그린";
  
  if (norm.includes("세라플렉스s") || norm.includes("세라플렉스")) return "강마루/세라 플렉스S";
  if (norm.includes("세라베이직")) return "강마루/세라/세라베이직";
  if (norm.includes("세라블렌딩") || norm.includes("세라블랜딩")) return "강마루/세라/세라블랜딩";
  if (norm.includes("세라")) return "강마루/세라/세라";
  
  return null;
};

// Eagon image resolver helper matching file directories and naming patterns
const resolveEagonProductImage = (mat) => {
  if (!mat) return "/images/no-image.svg";
  
  const brandStr = mat.brand || "";
  if (brandStr !== '이건') return "/images/no-image.svg";
  
  const line = mat.line || mat.description || "";
  const folder = getEagonImageFolder(line);
  if (!folder) return "/images/no-image.svg";
  
  const matName = mat.name || "";
  
  // Filter manifest to files under correct brand and series folder
  const folderImages = imageManifest.filter(img => 
    img.brand === '이건' && 
    img.series.replace(/\\/g, '/').replace(/\s+/g, '').toLowerCase() === folder.replace(/\s+/g, '').toLowerCase()
  );
  
  const cleanTerm = (term) => String(term).replace(/[^a-zA-Z0-9가-힣]/g, '').replace(/뮬/g, '물').toLowerCase().trim();
  
  const normMatName = cleanTerm(matName);
  const normMatNameNoNew = cleanTerm(matName.replace(/^뉴\s*/, ''));
  
  let found = folderImages.find(img => {
    const lastDot = img.fileName.lastIndexOf('.');
    const nameOnly = lastDot !== -1 ? img.fileName.slice(0, lastDot) : img.fileName;
    const normFile = cleanTerm(nameOnly);
    
    return normFile === normMatName || 
           normFile === normMatNameNoNew || 
           normMatName.includes(normFile) || 
           normFile.includes(normMatName);
  });
  
  if (found) {
    return found.fullPublicPath;
  }
  
  // Try checking without folder restriction first, in case of folder mismatches
  let looseFound = imageManifest.find(img => {
    if (img.brand !== '이건') return false;
    const lastDot = img.fileName.lastIndexOf('.');
    const nameOnly = lastDot !== -1 ? img.fileName.slice(0, lastDot) : img.fileName;
    const normFile = cleanTerm(nameOnly);
    
    return normFile === normMatName || normFile === normMatNameNoNew;
  });
  
  if (looseFound) {
    return looseFound.fullPublicPath;
  }
  
  // Fallbacks:
  // A. Same product line folder first image
  if (folderImages.length > 0) {
    return folderImages[0].fullPublicPath;
  }
  
  // B. Same upper category first image
  const upperCat = getEagonUpperCategory(line);
  const upperCatImages = imageManifest.filter(img => 
    img.brand === '이건' && 
    getEagonUpperCategory(img.series || img.line) === upperCat
  );
  if (upperCatImages.length > 0) {
    return upperCatImages[0].fullPublicPath;
  }
  
  // C. Placeholder
  return "/images/placeholders/material-placeholder.jpg";
};

const resolveMaterialImageWithEagon = (mat) => {
  if (mat && mat.brand === '이건') {
    return resolveEagonProductImage(mat);
  }
  return getMaterialImagePath(mat);
};

// Eagon product specification mappings helper
const getEagonInfo = (line = "") => {
  const normLine = String(line).replace(/\s+/g, "").toLowerCase();

  // 1. 원목마루 / 라르고
  if (normLine.includes("라르고")) {
    let thickness = "14T, 원목 4mm";
    let size = "T14(4) × W240 × L2,200mm";
    if (normLine.includes("190t3")) {
      thickness = "14T, 원목 3mm";
      size = "T14(3) × W190 × L1,900mm";
    } else if (normLine.includes("190t1")) {
      thickness = "12T, 원목 1.2mm";
      size = "T12(1.2) × W190 × L1,900mm";
    } else if (normLine.includes("150t4")) {
      thickness = "14T, 원목 4mm";
      size = "상담 확인 필요";
    }
    
    return {
      classification: "원목마루",
      features: [
        "천연 원목 표면의 프리미엄 원목마루",
        "시간이 흐를수록 원목 특유의 깊고 중후한 멋이 더해지는 고급 마루",
        "최고급 내수 합판 사용",
        "친환경 최우수 SE0 등급",
        "프리미엄 절삭 방식 적용",
        "고급 주거공간, 넓은 거실, 고급 인테리어 현장에 적합"
      ],
      spaces: ["고급 주거공간", "넓은 거실", "프리미엄 아파트", "고급 빌라", "쇼룸"],
      thickness,
      size,
      packing: "상담 확인 필요",
      spaceExamples: [
        { title: "프리미엄 거실 적용 예시", subtitle: "넓은 공간에 어울리는 고급 원목 질감" },
        { title: "고급 주택 침실 적용 예시", subtitle: "차분하고 자연스러운 원목 분위기" },
        { title: "쇼룸·상업공간 적용 예시", subtitle: "품격 있는 프리미엄 공간 연출" }
      ]
    };
  }

  // 2. 천연마루 / 제나 내추럴 or 포레스타
  if (normLine.includes("제나")) {
    return {
      classification: "천연마루",
      features: [
        "천연 원목 무늬목을 적용한 프리미엄 천연마루",
        "숲의 사계절을 담은 자연스러운 색감과 질감",
        "최고급 내수 합판 사용",
        "친환경 최우수 SE0 등급",
        "주거공간, 거실, 침실, 프리미엄 리모델링 현장에 적합"
      ],
      spaces: ["아파트 거실", "침실", "주거 리모델링", "고급 주택", "아이방"],
      thickness: "상담 확인 필요",
      size: "상담 확인 필요",
      packing: "상담 확인 필요",
      spaceExamples: [
        { title: "아파트 거실 적용 예시", subtitle: "자연스러운 천연 무늬목 분위기" },
        { title: "침실 적용 예시", subtitle: "따뜻하고 편안한 우드톤" },
        { title: "리모델링 공간 적용 예시", subtitle: "밝고 고급스러운 마루 연출" }
      ]
    };
  }

  if (normLine.includes("포레스타")) {
    const isG = normLine.includes("포레스타g");
    return {
      classification: "천연마루",
      features: [
        "천연 원목 무늬목을 적용한 프리미엄 천연마루",
        "숲의 사계절을 담은 자연스러운 색감과 질감",
        "최고급 내수 합판 사용",
        "친환경 최우수 SE0 등급",
        "주거공간, 거실, 침실, 프리미엄 리모델링 현장에 적합"
      ],
      spaces: ["아파트 거실", "침실", "주거 리모델링", "고급 주택", "아이방"],
      thickness: isG ? "11T" : "10.5T",
      size: isG ? "T11 × W190 × L1,900mm" : "T10.5 × W165 × L1,200mm",
      packing: "상담 확인 필요",
      spaceExamples: [
        { title: "아파트 거실 적용 예시", subtitle: "자연스러운 천연 무늬목 분위기" },
        { title: "침실 적용 예시", subtitle: "따뜻하고 편안한 우드톤" },
        { title: "리모델링 공간 적용 예시", subtitle: "밝고 고급스러운 마루 연출" }
      ]
    };
  }

  // 3. 프리미엄 강마루 / 그린 스퀘어
  if (normLine.includes("그린스퀘어")) {
    let size = "T10.5 × W597 × L597mm";
    if (normLine.includes("395")) size = "T10.5 × W395 × L800mm";
    
    return {
      classification: "프리미엄 강마루",
      features: [
        "천연 스톤 디자인 사각 강마루",
        "10.5mm 프리미엄 강마루",
        "3D 엠보싱과 고강도 HPM 적용",
        "최고급 내수 합판 사용",
        "거실, 상업공간, 쇼룸, 카페 등에 적합"
      ],
      spaces: ["거실 포인트", "상업공간", "카페", "쇼룸", "스톤 분위기 공간"],
      thickness: "10.5T",
      size: size,
      packing: "상담 확인 필요",
      spaceExamples: [
        { title: "거실 포인트 적용 예시", subtitle: "스톤 디자인 사각 패턴" },
        { title: "카페·상가 적용 예시", subtitle: "감각적인 바닥 포인트" },
        { title: "쇼룸 적용 예시", subtitle: "넓은 공간에 어울리는 석재 느낌" }
      ]
    };
  }

  // 4. 프리미엄 강마루 / 그린
  if (normLine.includes("그린")) {
    let size = "T10.5 × W165 × L1,200mm";
    if (normLine.includes("230")) size = "T10.5 × W230 × L2,430mm";
    else if (normLine.includes("190")) size = "T10.5 × W190 × L1,615mm";
    else if (normLine.includes("125")) size = "T10.5 × W125 × L800mm";
    
    return {
      classification: "프리미엄 강마루",
      features: [
        "10.5mm 프리미엄 강마루",
        "3D 엠보싱과 고강도 HPM 적용",
        "최고급 내수 합판 사용",
        "친환경 최우수 SE0 등급",
        "우드 디자인과 스톤 디자인을 함께 제공",
        "아파트, 주거공간, 상업공간 모두에 적합"
      ],
      spaces: ["아파트 전체 시공", "거실", "주방", "상업공간", "사무실", "카페"],
      thickness: "10.5T",
      size: size,
      packing: "상담 확인 필요",
      spaceExamples: [
        { title: "아파트 전체 시공 예시", subtitle: "내구성과 디자인을 함께 고려한 강마루" },
        { title: "거실·주방 적용 예시", subtitle: "생활 공간에 어울리는 안정적인 표면" },
        { title: "상업공간 적용 예시", subtitle: "고강도 HPM으로 관리가 쉬운 공간" }
      ]
    };
  }

  // 5. 강마루 / 세라 플렉스 S
  if (normLine.includes("세라플렉스s") || normLine.includes("플렉스")) {
    let size = "T7.5 × W165 × L1,200mm";
    if (normLine.includes("395")) size = "T7.5 × W395 × L800mm";
    
    return {
      classification: "강마루",
      features: [
        "우드 & 스톤 디자인 강마루",
        "3D 엠보싱과 고강도 HPM 적용",
        "친환경 내수 합판 사용",
        "친환경 최우수 SE0 등급",
        "합리적인 가격대의 프리미엄 강마루 라인"
      ],
      spaces: ["아파트", "거실", "침실", "오피스", "상가"],
      thickness: "7.5T",
      size: size,
      packing: "상담 확인 필요",
      spaceExamples: [
        { title: "아파트 전체 시공 예시", subtitle: "실용성과 고급스러운 분위기 연출" },
        { title: "침실 적용 예시", subtitle: "부담 없고 차분한 바닥 톤" },
        { title: "상가·오피스 적용 예시", subtitle: "스크래치 걱정 없는 강한 표면 강마루" }
      ]
    };
  }

  // 6. 강마루 / 세라 블렌딩
  if (normLine.includes("세라블렌딩") || normLine.includes("블렌딩")) {
    return {
      classification: "강마루",
      features: [
        "회화적인 표면 디자인",
        "고강도 HPM 적용",
        "친환경 내수 합판 사용",
        "친환경 최우수 SE0 등급",
        "감각적인 인테리어 공간에 적합"
      ],
      spaces: ["아파트 거실", "침실", "방", "원룸", "임대 주택", "실속형 리모델링"],
      thickness: "7.5T",
      size: "T7.5 × W115 × L800mm",
      packing: "상담 확인 필요",
      spaceExamples: [
        { title: "아파트 전체 시공 예시", subtitle: "회화적인 표면 질감 연출" },
        { title: "침실 적용 예시", subtitle: "따뜻하고 아늑한 침실 바닥" },
        { title: "임대 주택 적용 예시", subtitle: "오래 쓸 수 있는 단단하고 깔끔한 마루" }
      ]
    };
  }

  // 7. 강마루 / 세라 베이직
  if (normLine.includes("세라베이직")) {
    return {
      classification: "강마루",
      features: [
        "6.2T 실속형 강마루",
        "3D 엠보싱과 고강도 HPM 적용",
        "친환경 내수 합판 사용",
        "친환경 최우수 SE0 등급",
        "합리적인 예산의 주거 시공에 적합"
      ],
      spaces: ["아파트 거실", "침실", "방", "원룸", "임대 주택", "실속형 리모델링"],
      thickness: "6.2T",
      size: "T6.2 × W115 × L800mm",
      packing: "상담 확인 필요",
      spaceExamples: [
        { title: "아파트 전체 시공 예시", subtitle: "합리적인 실속형 강마루" },
        { title: "침실 적용 예시", subtitle: "부담 없는 우드톤 공간" },
        { title: "원룸·임대 주택 적용 예시", subtitle: "관리가 쉬운 실용적인 마루" }
      ]
    };
  }

  // 8. 강마루 / 세라
  if (normLine.includes("세라")) {
    return {
      classification: "강마루",
      features: [
        "다양한 우드 컬러를 갖춘 기본 강마루",
        "고강도 HPM 적용",
        "친환경 내수 합판 사용",
        "친환경 최우수 SE0 등급",
        "아파트, 빌라, 주거 리모델링에 적합"
      ],
      spaces: ["아파트 거실", "침실", "방", "원룸", "임대 주택", "실속형 리모델링"],
      thickness: "7.5T",
      size: "T7.5 × W95 × L800mm",
      packing: "상담 확인 필요",
      spaceExamples: [
        { title: "아파트 전체 시공 예시", subtitle: "합리적인 실속형 강마루" },
        { title: "침실 적용 예시", subtitle: "부담 없는 우드톤 공간" },
        { title: "원룸·임대 주택 적용 예시", subtitle: "관리가 쉬운 실용적인 마루" }
      ]
    };
  }

  return {
    classification: "마루",
    features: [
      "이건마루의 정품 친환경 마루 제품입니다.",
      "최고급 내수 합판을 사용하여 온도/습도 변화에 뛰어난 안정성 보유",
      "친환경 최우수 SE0 등급 자재로 새집증후군 걱정 해소",
      "고강도 내마모 표면 설계로 스크래치와 찍힘에 강합니다."
    ],
    spaces: ["아파트", "빌라", "거실", "방", "상업공간"],
    thickness: "두께 확인 필요",
    size: "규격 확인 필요",
    packing: "상담 확인 필요",
    spaceExamples: [
      { title: "공간 전체 시공 예시", subtitle: "아늑하고 자연스러운 마루 분위기 연출" },
      { title: "방/침실 시공 예시", subtitle: "차분하고 편안한 공간 톤" },
      { title: "상업 시설 시공 예시", subtitle: "관리와 청소가 편리한 실용적인 연출" }
    ]
  };
};

// Helper function to generate virtual space examples dynamically based on category and product images
const getVirtualSpaceExamples = (product, galleryImages) => {
  const category = product?.category;
  const mainImage = product?.image || product?.thumbnail || "/images/deco_tile.png";
  
  // Extract simple URL strings from gallery images state (which can be objects or strings)
  const imageList = (galleryImages || []).map(img => {
    if (!img) return "";
    if (typeof img === 'string') return img;
    return img.detail || img.thumbnail || "";
  }).filter(Boolean);
  
  const img1 = imageList[0] || mainImage;
  const img2 = imageList[1] || imageList[0] || mainImage;
  const img3 = imageList[2] || imageList[1] || imageList[0] || mainImage;

  if (category === "데코타일") {
    return [
      { title: "상업공간 적용 예시", subtitle: "내구성과 관리가 중요한 매장 바닥에 적합", image: img1 },
      { title: "사무실 적용 예시", subtitle: "깔끔하고 실용적인 업무공간 연출", image: img2 },
      { title: "카페·매장 적용 예시", subtitle: "공간 분위기를 정리해주는 바닥 패턴", image: img3 }
    ];
  }

  if (category === "장판") {
    return [
      { title: "아파트 거실 적용 예시", subtitle: "생활감과 관리 편의성을 고려한 주거공간", image: img1 },
      { title: "방/침실 적용 예시", subtitle: "부드러운 분위기의 실내 바닥 연출", image: img2 },
      { title: "원룸·오피스텔 적용 예시", subtitle: "실용적인 소형 주거공간에 적합", image: img3 }
    ];
  }

  if (category === "마루") {
    return [
      { title: "프리미엄 거실 적용 예시", subtitle: "고급스러운 주거공간 연출", image: img1 },
      { title: "침실 적용 예시", subtitle: "따뜻하고 안정적인 공간 분위기", image: img2 },
      { title: "아파트 전체 시공 예시", subtitle: "공간 전체의 통일감을 높이는 마루", image: img3 }
    ];
  }

  if (category === "벽지") {
    return [
      { title: "거실 벽면 적용 예시", subtitle: "공간의 첫인상을 바꾸는 벽지 선택", image: img1 },
      { title: "침실 적용 예시", subtitle: "차분한 분위기의 벽면 연출", image: img2 },
      { title: "포인트월 적용 예시", subtitle: "한쪽 벽만 바꿔도 달라지는 공간", image: img3 }
    ];
  }

  if (category === "카페트타일") {
    return [
      { title: "사무실 적용 예시", subtitle: "흡음성과 관리성을 고려한 업무공간", image: img1 },
      { title: "회의실 적용 예시", subtitle: "차분하고 전문적인 공간 분위기", image: img2 },
      { title: "상업공간 적용 예시", subtitle: "깔끔한 바닥 마감과 편리한 유지관리", image: img3 }
    ];
  }

  if (category === "러버타일") {
    return [
      { title: "헬스장/체육관 적용 예시", subtitle: "충격 흡수와 소음 방지에 특화된 바닥 마감", image: img1 },
      { title: "공용시설/병원 적용 예시", subtitle: "위생적이고 미끄럼 방지가 우수한 공용 복도", image: img2 },
      { title: "상업시설 적용 예시", subtitle: "보행감이 뛰어나고 관리가 용이한 다목적 공간", image: img3 }
    ];
  }

  return [
    { title: "공간 적용 예시", subtitle: "현재 선택한 자재를 활용한 공간 미리보기", image: mainImage }
  ];
};

export default function MaterialDetail() {
  const { id: rawId } = useParams();
  const navigate = useNavigate();
  const { addToCart, setPendingDirectOrder } = useEstimateCart();
  const { user: currentUser, openLoginModal } = useAuth();

  const id = decodeURIComponent(rawId || "");

  // Utilized common getProductPyeong from shippingUtils

  const isDirectPricingCategory = (product) => {
    if (!product) return false;
    if (product.category === '부자재' && (product.price || 0) > 0) return true;
    if (product.brand === 'KCC' && product.category === '데코타일') return true;
    if (['LX', '개나리', '서울'].includes(product.brand) && product.category === '벽지') {
      const lineClean = (product.line || "").replace(/\s+/g, '');
      if (product.brand === '서울' && (lineClean.includes('프리미엄') || lineClean.includes('방염'))) {
        return false;
      }
      return true;
    }
    if (product.brand === '스완' && product.category === '카페트타일' && (product.line || '').includes('타일') && (product.price || 0) > 0) {
      return true;
    }
    return false;
  };

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rawImages, setRawImages] = useState({
    detailStr: '',
    thumbStr: '',
    galleryObjs: [],
    eagonImg: null,
    itemImages: [],
    itemGalleryImages: [],
    itemDetailImages: [],
    itemInstallationImages: []
  });
  const [brokenImages, setBrokenImages] = useState(new Set());
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [relatedItems, setRelatedItems] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);

  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (item && item.sizeOptions && item.sizeOptions.length > 0) {
      setSelectedOption(item.sizeOptions[0]);
    } else {
      setSelectedOption(null);
    }
  }, [item]);

  // Scroll to top on id change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleImageError = (brokenSrc) => {
    if (!brokenSrc) return;
    setBrokenImages(prev => {
      const next = new Set(prev);
      next.add(brokenSrc);
      return next;
    });
  };

  // 1. Fetch Product Detail
  useEffect(() => {
    if (!id) return;
    
    async function fetchItem() {
      setLoading(true);
      setError(null);
      let productData = null;
      let queryError = null;

      try {
        if (supabase) {
          const query = supabase
            .from('products')
            .select(`
              *,
              categories ( id, name ),
              brands ( id, name )
            `);
          
          let res;
          if (/^\d+$/.test(id)) {
            res = await query.eq('id', parseInt(id, 10)).maybeSingle();
          } else {
            res = await query.eq('slug', id).maybeSingle();
            if (!res.data) {
              res = await supabase
                .from('products')
                .select(`
                  *,
                  categories ( id, name ),
                  brands ( id, name )
                `)
                .eq('product_code', id)
                .maybeSingle();
            }
          }
          if (res.error) {
            queryError = res.error;
          } else {
            productData = res.data;
          }
        }
      } catch (err) {
        console.error("Supabase detail fetch exception:", err);
        queryError = err;
      }

      // Fallback
      if (queryError || !productData) {
        const localItem = materials.find(m => m.id === id || m.code === id);
        if (localItem) {
          const itemCode = localItem.code || "";
          const inferredBrand = 
            localItem.brand || 
            localItem.brandName || 
            localItem.manufacturer || 
            localItem.company || 
            inferBrandFromCode(itemCode) || 
            "브랜드 정보 없음";
          const inferredCategory = 
            localItem.category || 
            localItem.type || 
            "카테고리 정보 없음";

          console.log("[Debug] Fallback product mapped info:", {
            code: itemCode,
            name: localItem.name,
            brand: inferredBrand,
            category: inferredCategory
          });

          const dongshinMatch = (inferredBrand === '동신' && inferredCategory === '데코타일')
            ? dongshinPolymer2026.find(d => d.code.toUpperCase() === itemCode.toUpperCase())
            : null;

          const eagonInfo = inferredBrand === '이건' ? getEagonInfo(localItem.line || localItem.description || "") : null;

          setItem({
            id: localItem.id || localItem.code,
            code: itemCode,
            name: dongshinMatch ? dongshinMatch.code : (localItem.name || ""),
            brand: inferredBrand,
            category: inferredCategory,
            price: localItem.price || 0,
            thickness: eagonInfo ? eagonInfo.thickness : (localItem.thickness || ""),
            specs: {
              thickness: eagonInfo ? eagonInfo.thickness : (localItem.thickness || ""),
              size: eagonInfo ? eagonInfo.size : (localItem.specs?.size || ""),
              packing: eagonInfo ? eagonInfo.packing : (localItem.specs?.packing || "")
            },
            thumbnail: localItem.thumbnail || null,
            image: localItem.thumbnail || null,
            images: localItem.images || [],
            description: localItem.description || "",
            features: eagonInfo ? eagonInfo.features : (localItem.features || []),
            recommendedSpaces: eagonInfo ? eagonInfo.spaces : (localItem.recommendedSpaces || []),
            line: dongshinMatch ? dongshinMatch.line : (localItem.line || ""),
            collection: dongshinMatch ? dongshinMatch.collection : (localItem.collection || null),
            series: dongshinMatch ? dongshinMatch.series : (localItem.series || null),
            catalog: dongshinMatch ? dongshinMatch.catalog : (localItem.catalog || null),
            note: localItem.note || "",
            sizeOptions: localItem.sizeOptions || undefined
          });
          setLoading(false);
          return;
        }
      }

      if (!productData) {
        setItem(null);
      } else {
        const p = productData;
        const itemCode = p.product_code || "";
        const inferredBrand = 
          p.brands?.name || 
          p.brand || 
          p.brandName || 
          p.manufacturer || 
          p.company || 
          inferBrandFromCode(itemCode) || 
          "브랜드 정보 없음";
        const inferredCategory = 
          p.categories?.name || 
          p.category || 
          p.type || 
          "카테고리 정보 없음";

        console.log("[Debug] Fetched product raw metadata:", {
          id: p.id,
          slug: p.slug,
          product_code: p.product_code,
          brands_relation: p.brands,
          categories_relation: p.categories,
          brand_field: p.brand,
          brandName_field: p.brandName,
          manufacturer_field: p.manufacturer,
          company_field: p.company,
          category_field: p.category,
          type_field: p.type
        });

        console.log("[Debug] Mapped product info for page:", {
          code: itemCode,
          name: p.name,
          brand: inferredBrand,
          category: inferredCategory
        });

        const dongshinMatch = (inferredBrand === '동신' && inferredCategory === '데코타일')
          ? dongshinPolymer2026.find(d => d.code.toUpperCase() === itemCode.toUpperCase())
          : null;

        const lxMatch = (inferredBrand === 'LX' && inferredCategory === '데코타일')
          ? materials.find(m => m.brand === 'LX' && m.category === '데코타일' && m.code && m.code.replace(/\s+/g, '').toLowerCase() === itemCode.replace(/\s+/g, '').toLowerCase())
          : null;

        const dbItem = {
          brand: inferredBrand,
          category: inferredCategory,
          line: p.description || "",
          name: p.name || "",
          code: p.product_code || null
        };
        const dbKey = getMaterialMatchKey(dbItem);
        const localMatch = materials.find(m => getMaterialMatchKey(m) === dbKey);

        const eagonInfo = inferredBrand === '이건' ? getEagonInfo(p.description || p.name || "") : null;

        setItem({
          id: p.slug || String(p.id),
          code: itemCode,
          name: dongshinMatch ? dongshinMatch.code : (lxMatch ? lxMatch.name : (p.name || "")),
          brand: inferredBrand,
          category: inferredCategory,
          price: p.price || 0,
          thickness: eagonInfo ? eagonInfo.thickness : (p.thickness || ""),
          specs: {
            thickness: eagonInfo ? eagonInfo.thickness : (p.thickness || ""),
            size: eagonInfo ? eagonInfo.size : (p.size_text || ""),
            packing: eagonInfo ? eagonInfo.packing : (p.unit || "")
          },
          thumbnail: p.image_url || null,
          image: p.image_url || null,
          description: p.description || "",
          features: eagonInfo ? eagonInfo.features : (p.features || []),
          recommendedSpaces: eagonInfo ? eagonInfo.spaces : (p.recommended_spaces || []),
          line: dongshinMatch ? dongshinMatch.line : (lxMatch ? lxMatch.line : (localMatch ? localMatch.line : (p.description || ""))),
          collection: dongshinMatch ? dongshinMatch.collection : (lxMatch ? lxMatch.collection : (localMatch ? localMatch.collection : null)),
          series: dongshinMatch ? dongshinMatch.series : (lxMatch ? lxMatch.series : (localMatch ? localMatch.series : null)),
          catalog: dongshinMatch ? dongshinMatch.catalog : (lxMatch ? lxMatch.catalog : (localMatch ? localMatch.catalog : null)),
          note: lxMatch ? lxMatch.note : (localMatch ? localMatch.note : ""),
          sizeOptions: localMatch ? localMatch.sizeOptions : undefined
        });
      }
      setLoading(false);
    }
    
    fetchItem();
  }, [id]);

  // 2. Load Gallery Images
  useEffect(() => {
    if (!item) return;

    let alive = true;

    async function loadImages() {
      const detailStr = await getDetailImage(item);
      const thumbStr = await getThumbnailImage(item);
      const galleryObjs = await getValidGalleryImages(item);
      let eagonImg = null;

      if (item.brand === '이건') {
        eagonImg = resolveMaterialImageWithEagon(item);
      }

      if (!alive) return;

      setRawImages({
        detailStr: detailStr || '',
        thumbStr: thumbStr || '',
        galleryObjs: galleryObjs || [],
        eagonImg,
        itemImages: item.images || [],
        itemGalleryImages: item.galleryImages || [],
        itemDetailImages: item.detailImages || [],
        itemInstallationImages: item.installationImages || []
      });
      setBrokenImages(new Set());
      setSelectedImageIndex(0);
    }
    loadImages();

    return () => { alive = false; };
  }, [item]);

  // Generate finalized deduplicated images array
  const productImages = useMemo(() => {
    if (!item) return [];

    const candidates = [];

    // 1) 대표 제품 이미지 (mainImage, image, thumbnail, thumbnailImage, etc.)
    if (item.brand === '이건' && rawImages.eagonImg) {
      candidates.push(rawImages.eagonImg);
    }
    if (rawImages.detailStr) candidates.push(rawImages.detailStr);
    if (rawImages.thumbStr) candidates.push(rawImages.thumbStr);
    if (item.mainImage) candidates.push(item.mainImage);
    if (item.image) candidates.push(item.image);
    if (item.thumbnail) candidates.push(item.thumbnail);
    if (item.thumbnailImage) candidates.push(item.thumbnailImage);

    // 2) 추가 질감/패턴 이미지 (images)
    if (Array.isArray(item.images)) {
      candidates.push(...item.images);
    }
    if (Array.isArray(rawImages.itemImages)) {
      candidates.push(...rawImages.itemImages);
    }

    // 3) 2x2 또는 4칸 패턴 이미지 (galleryImages, detailImages)
    if (Array.isArray(rawImages.galleryObjs)) {
      rawImages.galleryObjs.forEach(go => {
        if (go.detail) candidates.push(go.detail);
        if (go.thumbnail) candidates.push(go.thumbnail);
      });
    }
    if (Array.isArray(item.galleryImages)) {
      candidates.push(...item.galleryImages);
    }
    if (Array.isArray(rawImages.itemGalleryImages)) {
      candidates.push(...rawImages.itemGalleryImages);
    }
    if (Array.isArray(item.detailImages)) {
      candidates.push(...item.detailImages);
    }
    if (Array.isArray(rawImages.itemDetailImages)) {
      candidates.push(...rawImages.itemDetailImages);
    }

    // 4) 시공 이미지 (installationImages)
    if (Array.isArray(item.installationImages)) {
      candidates.push(...item.installationImages);
    }
    if (Array.isArray(rawImages.itemInstallationImages)) {
      candidates.push(...rawImages.itemInstallationImages);
    }

    // Deduplicate
    const uniqueList = getUniqueProductImages(candidates);

    // Filter out broken images and default placeholders
    const filteredList = uniqueList.filter(src => {
      if (!src || brokenImages.has(src)) return false;
      const norm = src.toLowerCase();
      return !norm.includes('no-image.svg') && !norm.includes('deco_tile.png') && !norm.includes('material-placeholder.jpg');
    });

    if (filteredList.length > 0) {
      return filteredList;
    }

    // Fallback: Show a single valid placeholder or default
    const firstValid = uniqueList.find(src => src && !brokenImages.has(src));
    return [firstValid || "/images/no-image.svg"];
  }, [item, rawImages, brokenImages]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [item?.id, item?.code]);

  useEffect(() => {
    if (
      productImages.length === 0 ||
      selectedImageIndex >= productImages.length
    ) {
      setSelectedImageIndex(0);
    }
  }, [productImages.length, selectedImageIndex]);

  // 3. Fetch Related Products
  useEffect(() => {
    if (!item) return;

    async function fetchRelated() {
      const getScore = (p) => {
        const pBrand = p.brand || "";
        const pLine = p.line || "";
        const itemBrand = item.brand;
        const itemLine = item.line;
        
        if (pBrand === itemBrand) {
          if (pLine === itemLine) {
            return 100; // Same brand + same line
          }
          if (itemBrand === '이건') {
            const pClass = getEagonClassification(pLine);
            const itemClass = getEagonClassification(itemLine);
            if (pClass === itemClass) {
              return 80; // Same brand + same classification
            }
          }
          return 50; // Same brand + different line
        }
        return 10; // Different brand
      };

      try {
        if (supabase) {
          let data = [];
          if (item.brand === '이건') {
            const res = await supabase
              .from('products')
              .select(`
                *,
                categories ( id, name ),
                brands ( id, name )
              `)
              .eq('brand_id', 12)
              .neq('product_code', item.code);
            if (res.data) {
              data = res.data;
            }
          } else {
            const res = await supabase
              .from('products')
              .select(`
                *,
                categories ( id, name ),
                brands ( id, name )
              `)
              .eq('category_id', item.category_id || 1)
              .neq('product_code', item.code)
              .limit(20);
            if (res.data) {
              data = res.data;
            }
          }
          
          if (data && data.length > 0) {
            const mappedList = data.map(p => {
              const mapped = {
                id: p.slug || String(p.id),
                code: p.product_code || "",
                name: p.name || "",
                brand: p.brands?.name || p.brand || "",
                category: p.categories?.name || p.category || "",
                line: p.description || p.line || "",
                price: p.price || 0,
                size: p.size_text || ""
              };
              normalizeProductDetails(mapped);
              mapped.thumbnail = resolveMaterialImageWithEagon(mapped);
              return {
                item: mapped,
                score: getScore(mapped)
              };
            });

            mappedList.sort((a, b) => b.score - a.score);
            const top4 = mappedList.slice(0, 4).map(x => x.item);
            setRelatedItems(top4);
            return;
          }
        }
      } catch (err) {
        console.warn("Supabase related fetch failed, using fallback.", err);
      }

      // Fallback local related
      const localRelated = materials
        .filter(m => m.code !== item.code && m.id !== item.id)
        .map(m => {
          const mapped = {
            id: m.id || m.code,
            code: m.code || "",
            name: m.name || "",
            brand: m.brand || "",
            category: m.category || "",
            line: m.line || m.description || "",
            price: m.price || 0,
            size: m.specs?.size || m.specs?.thickness || ""
          };
          normalizeProductDetails(mapped);
          mapped.thumbnail = resolveMaterialImageWithEagon(mapped);
          return {
            item: mapped,
            score: getScore(mapped)
          };
        });

      localRelated.sort((a, b) => b.score - a.score);
      const fallbackTop4 = localRelated.slice(0, 4).map(x => x.item);
      setRelatedItems(fallbackTop4);
    }

    fetchRelated();
  }, [item]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: "120px 0", textAlign: "center", fontSize: "16px", color: "#6B6B6B" }}>
          <div className="spinner-loader"></div>
          <p style={{ marginTop: '20px' }}>자재 상세 쇼룸 정보를 불러오는 중입니다...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !item) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: "120px 0", textAlign: "center", color: "#6B6B6B" }}>
          <h2>자재 정보를 찾을 수 없습니다.</h2>
          <p style={{ marginTop: "15px" }}>선택하신 상품 코드나 주소를 다시 한 번 확인해 주세요.</p>
          <button className="btn-showroom-dark" onClick={() => navigate("/materials")} style={{ marginTop: '30px', padding: '12px 28px', borderRadius: '25px' }}>
            자재 목록으로 돌아가기
          </button>
        </div>
      </MainLayout>
    );
  }

  // Auto-fill and Redirection Handler
  const handleEstimate = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    // 1. Add item to cart
    addToCart({
      id: selectedOption ? `${item.id}-${selectedOption.label}` : item.id,
      product_id: item.id,
      productId: item.id,
      code: item.code,
      name: displayName,
      brand: item.brand,
      thickness: item.thickness || (item.specs?.thickness) || "",
      category: item.category,
      line: item.line || "",
      spec: selectedOption ? selectedOption.spec : (item.specs?.size || item.spec || "표준규격"),
      specs: selectedOption ? {
        thickness: selectedOption.thickness,
        size: selectedOption.spec,
        packing: selectedOption.package || ""
      } : (item.specs || null),
      packing: selectedOption ? (selectedOption.package || "") : (item.specs?.packing || "1박스 단위 판매"),
      price: item.price,
      thumbnail: getMaterialImagePath(item),
      quantity: qty,
      selectedSize: selectedOption ? selectedOption.label : undefined
    });

    // 2. Navigate with state
    navigate("/estimate/request", {
      state: {
        fromProduct: true,
        selectedProduct: {
          id: selectedOption ? `${item.id}-${selectedOption.label}` : item.id,
          product_id: item.id,
          productId: item.id,
          brand: item.brand,
          name: displayName,
          code: item.code,
          category: item.category,
          line: item.line || "",
          spec: selectedOption ? selectedOption.spec : (item.specs?.size || item.spec || "표준규격"),
          specs: selectedOption ? {
            thickness: selectedOption.thickness,
            size: selectedOption.spec,
            packing: selectedOption.package || ""
          } : (item.specs || null),
          selectedSize: selectedOption ? selectedOption.label : undefined
        }
      }
    });
  };

  // Compute standard display name for LX / Dongshin / Eagon products
  const displayName = (() => {
    if (!item) return "";
    if (item.category === '마루') {
      const brandName = item.brand === '이건' ? '이건마루' : getComputedBrand(item);
      const line = item.displayLine || item.line || "";
      let name = item.name || "";
      if (line && name.startsWith(line)) {
        name = name.replace(line, "").trim();
      }
      return `${brandName} ${line} ${name}`.replace(/\s+/g, ' ').trim();
    }
    if (item.brand === '동신' && item.category === '데코타일' && ['아트타일', '아트하우스', '아트에코차음'].includes(item.line)) {
      return item.code;
    }
    if (item.brand === 'LX' && item.category === '데코타일') {
      const cleanCode = (item.code || "").replace(/\s+/g, "").toLowerCase();
      const cleanName = (item.name || "").replace(/\s+/g, "").toLowerCase();
      if (cleanCode && cleanName.includes(cleanCode)) {
        return item.name;
      }
      return `${item.code} ${item.name}`;
    }
    if (item.category === '장판') {
      return formatFlooringProductName(item);
    }
    return item.name;
  })();

  const currentSpec = selectedOption ? selectedOption.spec : (item.specs?.size || item.spec || "");
  const currentPacking = selectedOption ? (selectedOption.package || "1박스 단위 판매") : (item.specs?.packing || "1박스 단위 판매");

  const handleAddToCart = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    let itemPrice = item.price;
    if (typeof itemPrice === 'string') {
      itemPrice = parseInt(itemPrice.replace(/[^0-9]/g, ""), 10) || 0;
    } else if (typeof itemPrice === 'number') {
      itemPrice = Math.max(0, itemPrice);
    } else {
      itemPrice = 0;
    }

    const imgPath = getMaterialImagePath(item);
    addToCart({
      id: selectedOption ? `${item.id}-${selectedOption.label}` : item.id,
      product_id: item.id,
      productId: item.id,
      thumbnail: imgPath,
      image: imgPath,
      brand: getComputedBrand(item),
      thickness: item.thickness || (item.specs?.thickness) || getNormalizedThickness(item),
      category: item.category,
      line: item.line || "",
      name: displayName,
      product_name: displayName,
      code: item.code,
      product_code: item.code,
      spec: selectedOption ? selectedOption.spec : (item.specs?.size || item.spec || "표준규격"),
      specs: selectedOption ? {
        thickness: selectedOption.thickness,
        size: selectedOption.spec,
        packing: selectedOption.package || ""
      } : (item.specs || null),
      packing: selectedOption ? (selectedOption.package || "") : (item.specs?.packing || "1박스 단위 판매"),
      price: itemPrice,
      unit_price: itemPrice,
      unit: getProductUnit(item),
      quantity: qty,
      amount: itemPrice * qty,
      selectedSize: selectedOption ? selectedOption.label : undefined
    });

    setShowCartModal(true);
  };

  const handleDirectBuy = () => {
    let itemPrice = item.price;
    if (typeof itemPrice === 'string') {
      itemPrice = parseInt(itemPrice.replace(/[^0-9]/g, ""), 10) || 0;
    } else if (typeof itemPrice === 'number') {
      itemPrice = Math.max(0, itemPrice);
    } else {
      itemPrice = 0;
    }

    if (itemPrice <= 0) {
      alert("가격 확인이 필요한 자재입니다. 견적 요청을 이용해 주세요.");
      return;
    }

    if (!currentUser) {
      openLoginModal();
      return;
    }

    const imgPath = getMaterialImagePath(item);
    const directOrderItem = {
      id: selectedOption ? `${item.id}-${selectedOption.label}` : item.id,
      product_id: item.id,
      productId: item.id,
      thumbnail: imgPath,
      image: imgPath,
      brand: getComputedBrand(item),
      thickness: item.thickness || (item.specs?.thickness) || getNormalizedThickness(item),
      category: item.category,
      line: item.line || "",
      name: displayName,
      product_name: displayName,
      code: item.code,
      product_code: item.code,
      spec: selectedOption ? selectedOption.spec : (item.specs?.size || item.spec || "표준규격"),
      specs: selectedOption ? {
        thickness: selectedOption.thickness,
        size: selectedOption.spec,
        packing: selectedOption.package || ""
      } : (item.specs || null),
      packing: selectedOption ? (selectedOption.package || "") : (item.specs?.packing || "1박스 단위 판매"),
      price: itemPrice,
      unit_price: itemPrice,
      unit: getProductUnit(item),
      quantity: qty,
      amount: itemPrice * qty,
      selectedSize: selectedOption ? selectedOption.label : undefined
    };

    setPendingDirectOrder(directOrderItem);
    navigate("/checkout", { state: { isDirect: true, directOrderItem } });
  };

  const handleBack = () => {
    const lastUrl = sessionStorage.getItem("materialsLastUrl");
    if (lastUrl) {
      navigate(lastUrl);
    } else {
      navigate("/materials");
    }
  };

  // Default features list if empty in DB
  const defaultFeatures = [
    "고급 특수 표면 코팅 공법 적용으로 탁월한 내마모성 및 찍힘 방지 기술",
    "생활 방수 및 오염 방지 가공 처리로 편리하고 수월한 일상 청소 및 유지 관리",
    "친환경 HB마크 최우수 및 환경부 인증 마크 획득 완료된 건강 안심 자재",
    "천연 우드 및 스톤 텍스처를 자연스럽게 묘사하여 한층 감각적인 공간 연출 가능"
  ];

  // Default spaces if empty
  const defaultSpaces = ["아파트 거실/주방", "상업용 쇼룸 및 카페", "오피스/공용 사무실", "원룸 및 오피스텔 단지", "학원 및 교육 공간", "의료/케어 기관"];

  const displayFeatures = item.features && item.features.length > 0 ? item.features : defaultFeatures;
  const displaySpaces = item.recommendedSpaces && item.recommendedSpaces.length > 0 ? item.recommendedSpaces : defaultSpaces;

  const eagonInfo = item?.brand === '이건' ? getEagonInfo(item.line) : null;

  const spaceExamples = (() => {
    if (!item) return [];
    if (item.brand === '이건' && eagonInfo) {
      const mainImage = resolveEagonProductImage(item);
      
      // Get other images from the same Eagon product line folder in the manifest
      const folder = getEagonImageFolder(item.line);
      let lineImages = [];
      if (folder) {
        lineImages = imageManifest
          .filter(img => 
            img.brand === '이건' && 
            img.series.replace(/\\/g, '/').replace(/\s+/g, '').toLowerCase() === folder.replace(/\s+/g, '').toLowerCase() &&
            img.fullPublicPath !== mainImage
          )
          .map(img => img.fullPublicPath);
      }
      
      const img1 = mainImage;
      const img2 = lineImages[0] || "/images/placeholders/material-placeholder.jpg";
      const img3 = lineImages[1] || lineImages[0] || "/images/placeholders/material-placeholder.jpg";
      
      return eagonInfo.spaceExamples.map((ex, idx) => ({
        title: ex.title,
        subtitle: ex.subtitle,
        image: idx === 0 ? img1 : idx === 1 ? img2 : img3
      }));
    }
    return getVirtualSpaceExamples(item, productImages);
  })();

  const detailContentImg = (() => {
    if (!item || getComputedBrand(item) !== "동신") return null;
    return "/images/dongshin_tile_detail.jpg";
  })();

  return (
    <MainLayout className="product-detail-page">
      <div className="showroom-detail-bg">
        <div className="container mat-detail-container">
          
          {/* Back Navigation Button */}
          <button className="btn-showroom-back" onClick={handleBack}>
            <ArrowLeft size={16} /> 자재 목록으로
          </button>

          {/* ==========================================
             1. Main Detail Product Row
             ========================================== */}
          <div className="showroom-split-row">
            
            {/* Left Column: Big Images & Thumbnails */}
            <div className="showroom-visuals">
              <div className="showroom-main-frame" style={{ position: 'relative' }}>
                {productImages[selectedImageIndex] && productImages[selectedImageIndex] !== "/images/no-image.svg" && !productImages[selectedImageIndex].includes("deco_tile.png") ? (
                  <img 
                    src={`${productImages[selectedImageIndex]}?v=2`} 
                    alt={`${item.name} main`} 
                    onError={() => handleImageError(productImages[selectedImageIndex])} 
                    className="showroom-main-img"
                  />
                ) : (
                  <div className="showroom-img-placeholder" style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.03)',
                    color: 'var(--text-muted)',
                    fontSize: '15px',
                    fontWeight: '700',
                    textAlign: 'center',
                    padding: '20px'
                  }}>
                    <span>이미지 준비중</span>
                    <span style={{ fontSize: '11px', fontWeight: '500', opacity: 0.8, marginTop: '6px' }}>상품코드 기준 이미지 확인 필요</span>
                  </div>
                )}
              </div>

              {productImages.length > 1 && (
                <div className="showroom-thumb-strip">
                  {productImages.map((src, idx) => {
                    const key = normalizeImagePath(src);
                    return (
                      <div 
                        key={key || src || idx}
                        className={`showroom-thumb-box ${selectedImageIndex === idx ? "active" : ""}`}
                        onClick={() => setSelectedImageIndex(idx)}
                      >
                        <img
                          src={`${src}?v=2`}
                          onError={() => handleImageError(src)}
                          alt={`${item.name} thumbnail-${idx + 1}`}
                          className="showroom-thumb-img"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Info & Options */}
            <div className="showroom-meta-data">
              <div className="product-brand-badge">
                {item.brand === '동화' || item.brand === '구정' ? (
                  <>
                    <span className="category-name">{item.category}</span>
                    <span className="divider" style={{ margin: '0 6px', color: '#94a3b8' }}>&gt;</span>
                    <span className="brand-name">{getComputedBrand(item)}</span>
                    <span className="divider" style={{ margin: '0 6px', color: '#94a3b8' }}>&gt;</span>
                    <span className="sub-category">{item.subCategory || "강마루"}</span>
                    {item.series && (
                      <>
                        <span className="divider" style={{ margin: '0 6px', color: '#94a3b8' }}>&gt;</span>
                        <span className="series-name">{item.series}</span>
                      </>
                    )}
                    {item.line && (
                      <>
                        <span className="divider" style={{ margin: '0 6px', color: '#94a3b8' }}>&gt;</span>
                        <span className="line-name">{item.line}</span>
                      </>
                    )}
                  </>
                ) : item.brand === '이건' ? (
                  <>
                    <span className="brand-name">이건마루</span>
                    <span className="divider">·</span>
                    <span className="category-name">
                      {`${item.category} (${getEagonClassification(item.line)})`}
                    </span>
                    {item.line && (
                      <>
                        <span className="divider">·</span>
                        <span className="line-name">{item.line}</span>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <span className="brand-name">{getComputedBrand(item)}</span>
                    <span className="divider">·</span>
                    <span className="category-name">{item.category}</span>
                  </>
                )}
              </div>

              <h1 className="showroom-product-title">{displayName}</h1>
              {item.code && (
                <div className="showroom-product-code">
                  <span>상품코드:</span> <strong>{item.code}</strong>
                </div>
              )}

              {/* Price display (visible to admin or shows consulting guide) */}
              <div className="showroom-price-card">
                {isDirectPricingCategory(item) ? (
                  <div className="client-consulting-box kcc-price-box">
                    <div className="showroom-detail-price" style={{ marginBottom: "12px", borderBottom: "1px solid var(--border-showroom-light)", paddingBottom: "12px" }}>
                      <span style={{ fontSize: "14px", color: "var(--text-light-gray)", marginRight: "8px" }}>가격:</span>
                      <strong style={{ fontSize: "22px", color: "var(--accent-showroom-green)" }}>
                        {item.price ? `₩${item.price.toLocaleString()}원 / ${getProductUnit(item)}` : "가격문의"}
                      </strong>
                    </div>
                    <span className="price-tag-label" style={{ fontSize: '12px', color: 'var(--text-light-gray)', display: 'block', marginBottom: '4px' }}>판매 단위</span>
                    <strong className="price-num" style={{ fontSize: '18px', color: 'var(--text)', display: 'block', marginBottom: '8px' }}>1 {getProductUnit(item)}</strong>
                    <span className="price-vat" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({getProductUnit(item)} 단위 판매 / VAT 10% 포함)</span>
                  </div>
                ) : currentUser?.role === 'admin' ? (
                  <div className="admin-price-box">
                    <div className="showroom-detail-price" style={{ marginBottom: "16px", borderBottom: "1px solid var(--border-showroom-light)", paddingBottom: "16px" }}>
                      <span style={{ fontSize: "14px", color: "var(--text-light-gray)", marginRight: "8px" }}>가격:</span>
                      <strong style={{ fontSize: "22px", color: "var(--accent-showroom-green)" }}>
                        {item.price ? `₩${item.price.toLocaleString()}원${item.category === '장판' ? '/m' : ''}` : "가격문의"}
                      </strong>
                    </div>
                    <span className="price-tag-label">관리자 전용 대리점가</span>
                    <strong className="price-num">{item.price ? `${item.price.toLocaleString()}원${item.category === '장판' ? '/m' : ''}` : "단가 문의"}</strong>
                    <span className="price-vat">(평당 단가 / VAT 10% 별도)</span>
                  </div>
                ) : (
                  <div className="client-consulting-box">
                    <div className="showroom-detail-price" style={{ marginBottom: "16px", borderBottom: "1px solid var(--border-showroom-light)", paddingBottom: "16px" }}>
                      <span style={{ fontSize: "14px", color: "var(--text-light-gray)", marginRight: "8px" }}>가격:</span>
                      <strong style={{ fontSize: "22px", color: "var(--accent-showroom-green)" }}>
                        {item.price ? `₩${item.price.toLocaleString()}원${item.category === '장판' ? '/m' : ''}` : "가격문의"}
                      </strong>
                    </div>
                    <span className="consulting-title">시공 견적 및 공급가 문의</span>
                    <p className="consulting-guide-text">
                      현장 조건(평수, 기존 바닥 상태, 철거 범위) 및 시공 여부에 따라 자재 공급가와 단가가 상이하게 적용됩니다. 
                      아래 견적 요청서를 작성해주시면 1:1 맞춤 견적서를 산출해 드립니다.
                    </p>
                  </div>
                )}
              </div>

              {/* Technical Specifications Highlights */}
              <div className="quick-tech-specs">
                <div className="tech-spec-item">
                  <span className="tech-label">{item.brand === 'KCC' && item.category === '데코타일' ? "전체 규격" : "규격"}</span>
                  <span className="tech-value">{currentSpec || "상담 확인 필요"}</span>
                </div>
                <div className="tech-spec-item">
                  <span className="tech-label">{item.brand === 'KCC' && item.category === '데코타일' ? "포장 수량" : "박스 구성"}</span>
                  <span className="tech-value">{currentPacking}</span>
                </div>
                <div className="tech-spec-item">
                  <span className="tech-label">{item.brand === 'KCC' && item.category === '데코타일' ? "BOX당 시공면적" : "시공 면적"}</span>
                  <span className="tech-value">
                    {item.brand === 'KCC' && item.category === '데코타일' ? (
                      item.specs?.area || "3.32㎡"
                    ) : item.category === '장판' ? "M 단위 소요량 측정" : `1 ${getProductUnit(item)}당 시공 가능`}
                  </span>
                </div>
                {item.brand === 'KCC' && item.category === '데코타일' && item.pattern && (
                  <div className="tech-spec-item">
                    <span className="tech-label">패턴 분류</span>
                    <span className="tech-value">{item.pattern}</span>
                  </div>
                )}
                <div className="tech-spec-item">
                  <span className="tech-label">배송 조건</span>
                  <span className="tech-value">
                    {item.category === '장판' ? "m 단위 절단 배송" : "50평 이상 주문 시 무료배송"}
                  </span>
                </div>
              </div>
 
              {/* Size Options Selector */}
              {item.sizeOptions && item.sizeOptions.length >= 2 && (
                <div className="detail-size-options" style={{ marginBottom: '20px' }}>
                  <span className="qty-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>규격 선택</span>
                  <div className="detail-option-chips" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {item.sizeOptions.map(opt => (
                      <button
                        key={opt.label}
                        type="button"
                        className={`detail-option-chip ${selectedOption?.label === opt.label ? 'active' : ''}`}
                        onClick={() => setSelectedOption(opt)}
                        style={{
                          padding: '8px 16px',
                          fontSize: '12px',
                          border: '1px solid #E6E2D8',
                          background: selectedOption?.label === opt.label ? 'var(--point-orange)' : '#FAF8F2',
                          color: selectedOption?.label === opt.label ? '#ffffff' : '#444',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          fontWeight: '700',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
 
              {/* Quantity Counter & Action Buttons */}
              <div className="showroom-qty-selector">
                <span className="qty-label">소요량 산정 ({getProductUnit(item)} 단위)</span>
                <div className="qty-counter-box">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="qty-btn">-</button>
                  <input type="number" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} className="qty-input" />
                  <button onClick={() => setQty(qty + 1)} className="qty-btn">+</button>
                </div>
              </div>

              {item.category === '데코타일' && (
                <div className="detail-decotile-shipping-notice-box" style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  fontSize: '13px'
                }}>
                  <div style={{ fontWeight: '800', color: 'var(--primary)', marginBottom: '4px' }}>🚚 데코타일 50평 이상 무료배송</div>
                  {getProductPyeong({ ...item, quantity: qty }) >= 50 ? (
                    <div style={{ color: '#059669', fontWeight: '700', backgroundColor: '#ecfdf5', padding: '4px 8px', borderRadius: '4px', width: 'fit-content' }}>
                      50평 이상 무료배송이 적용되었습니다.
                    </div>
                  ) : (
                    <div style={{ color: '#d97706', fontWeight: '700', backgroundColor: '#fff7ed', padding: '4px 8px', borderRadius: '4px', width: 'fit-content' }}>
                      무료배송까지 {(50 - getProductPyeong({ ...item, quantity: qty })).toFixed(2)}평 남았습니다.
                    </div>
                  )}
                </div>
              )}

              {isDirectPricingCategory(item) && (
                <div className="kcc-calculation-summary" style={{
                  background: '#FAF8F2',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #E6E2D8',
                  marginBottom: '20px',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: 'var(--text)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-light-gray)' }}>주문 수량:</span>
                    <strong>{qty} {getProductUnit(item)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-light-gray)' }}>총 시공면적:</span>
                    <strong>
                      {item.category === '데코타일' ? (
                        `${(getProductPyeong({ ...item, quantity: qty }) * 3.3058).toFixed(2)}㎡ (약 ${getProductPyeong({ ...item, quantity: qty }).toFixed(2)}평)`
                      ) : item.category === '카페트타일' ? (
                        `${(qty * 4).toFixed(2)}㎡ (약 ${(qty * 1.21).toFixed(2)}평)`
                      ) : (
                        getProductUnit(item) === 'BOX' ? `약 ${qty * 40}평 (20롤)` : `약 ${qty * 5}평`
                      )}
                    </strong>
                  </div>
                  {item.brand === '서울' && (item.line || '').includes('소폭') && (
                    <div style={{ color: 'var(--accent-showroom-green)', fontSize: '11px', margin: '4px 0', fontWeight: 'bold' }}>
                      * 10박스 이상 주문 시 ₩73,000원/박스로 자동 적용됩니다 (현재: {qty >= 10 ? '할인 적용됨' : '기본가 적용'}).
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #E6E2D8', paddingTop: '8px', marginTop: '8px' }}>
                    <span style={{ fontWeight: '600' }}>총 상품금액:</span>
                    <strong style={{ color: 'var(--point-orange)', fontSize: '16px' }}>
                      {(qty * (
                        item.brand === '서울' && (item.line || '').includes('소폭') && qty >= 10 ? 73000 : (item.price || 0)
                      )).toLocaleString()}원
                    </strong>
                  </div>
                </div>
              )}
 
              {/* Primary CTA Actions */}
              <div className="showroom-main-actions">
                <button className="btn-main-cart" onClick={handleAddToCart}>
                  <ShoppingCart size={18} style={{ marginRight: '6px' }} /> 장바구니 담기
                </button>
                {isDirectPricingCategory(item) ? (
                  <button className="btn-main-buy" onClick={handleDirectBuy} style={{ backgroundColor: 'var(--point-orange)', borderColor: 'var(--point-orange)' }}>
                    <CheckCircle size={18} style={{ marginRight: '6px' }} /> 바로구매
                  </button>
                ) : (
                  <button className="btn-main-buy" onClick={handleEstimate} style={{ backgroundColor: 'var(--point-orange)', borderColor: 'var(--point-orange)' }}>
                    <FileText size={18} style={{ marginRight: '6px' }} /> 바로 견적요청
                  </button>
                )}
              </div>
 
              {/* Secondary Actions: Kakao, Phone */}
              <div className="showroom-action-buttons" style={{ marginTop: '12px' }}>
                <a href={KAKAO_CHAT_URL} target="_blank" rel="noopener noreferrer" className="btn-showroom-quote text-center btn-kakao-action" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE500', color: '#191919', border: 'none', fontWeight: '700' }}>
                  💬 카카오톡 1:1 상담
                </a>
                <a href="tel:02-487-9775" className="btn-showroom-phone">
                  <Phone size={16} /> 전화 상담문의
                </a>
              </div>

              {/* 3줄 보조 버튼/링크: 자재 샘플북 요청 */}
              <div className="showroom-sub-actions-single" style={{ marginTop: '16px', textAlign: 'center' }}>
                <button className="btn-sub-utility-link" onClick={() => navigate("/samplebooks")}>
                  <BookOpen size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> 
                  <span style={{ verticalAlign: 'middle' }}>자재 샘플북 요청</span>
                </button>
              </div>

            </div>
          </div>

          {/* ==========================================
             2. Split Columns: Left Content / Right Sticky Widget
             ========================================== */}
          <div className="showroom-body-split">
            
            {/* Left Content Area (Features, Guidelines, Space examples) */}
            <div className="showroom-detailed-content">
              
              {/* Features List Section */}
              <section className="detail-doc-section">
                <h2 className="doc-section-title">제품 정보 및 특장점</h2>
                <div className="doc-accent-bar"></div>
                <ul className="doc-features-list">
                  {displayFeatures.map((feat, index) => (
                    <li key={index} className="feature-list-item">
                      <div className="check-bullet">✔</div>
                      <p>{feat}</p>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Recommended Spaces Tags */}
              <section className="detail-doc-section">
                <h2 className="doc-section-title">주요 권장 공간</h2>
                <div className="doc-accent-bar"></div>
                <div className="space-tags-strip">
                  {displaySpaces.map((space, index) => (
                    <span key={index} className="space-tag">{space}</span>
                  ))}
                </div>
              </section>

              {/* Technical Specifications Table */}
              <section className="detail-doc-section">
                <h2 className="doc-section-title">자재 규격 상세표</h2>
                <div className="doc-accent-bar"></div>
                <div className="spec-table-frame">
                  <table className="tech-spec-table">
                    <tbody>
                      {(item.brand === '동신' && item.category === '데코타일' && ['아트타일', '아트하우스', '아트에코차음'].includes(item.line)) || (item.brand === 'LX' && item.category === '데코타일') ? (
                        <>
                          <tr>
                            <th>제조 브랜드</th>
                            <td>{getComputedBrand(item)}</td>
                            <th>카테고리</th>
                            <td>{item.category || "자재"}</td>
                          </tr>
                          <tr>
                            <th>라인업</th>
                            <td>{item.line}</td>
                            <th>컬렉션</th>
                            <td>{item.collection || "Art Tile"}</td>
                          </tr>
                          <tr>
                            <th>시리즈</th>
                            <td>{item.series}</td>
                            <th>자재 식별 코드</th>
                            <td>{item.code || "코드 정보 없음"}</td>
                          </tr>
                          <tr>
                            <th>제품 가로세로 규격</th>
                            <td>{item.specs?.size || "규격 확인 필요"}</td>
                            <th>포장 패킹 단위</th>
                            <td>{item.specs?.packing || "상담 확인 필요"}</td>
                          </tr>
                          <tr>
                            <th>카탈로그</th>
                            <td>{item.catalog || "동신포리마 2026 E-Catalog"}</td>
                            <th>권장 접착 자재</th>
                            <td>친환경 전용 에폭시/본드</td>
                          </tr>
                        </>
                      ) : item.brand === '이건' ? (
                        <>
                          <tr>
                            <th>제조 브랜드</th>
                            <td>이건마루</td>
                            <th>카테고리</th>
                            <td>{item.category || "마루"} ({eagonInfo?.classification || "마루"})</td>
                          </tr>
                          <tr>
                            <th>제품군</th>
                            <td>{item.line || "이건마루 라인"}</td>
                            <th>자재 식별 코드</th>
                            <td>{item.code || "코드 정보 없음"}</td>
                          </tr>
                          <tr>
                            <th>두께 규격</th>
                            <td>{eagonInfo?.thickness || "상담 확인 필요"}</td>
                            <th>제품 기본 규격</th>
                            <td>{eagonInfo?.size || "상담 확인 필요"}</td>
                          </tr>
                          <tr>
                            <th>포장 패킹 단위</th>
                            <td>{eagonInfo?.packing || "상담 확인 필요"}</td>
                            <th>판매 단위</th>
                            <td>평 (현장 실측 기준 소요량 산정)</td>
                          </tr>
                          <tr>
                            <th>권장 접착 자재</th>
                            <td>이건마루 친환경 황토풀 / 전용 마루 본드</td>
                            <th>포장/입수</th>
                            <td>상담 확인 필요</td>
                          </tr>
                        </>
                      ) : item.category === '장판' ? (
                        <>
                          <tr>
                            <th>브랜드</th>
                            <td>{(() => {
                                const b = (item.brand || "").trim();
                                return (b.includes("현대") || b.includes("Hyundai")) ? "현대" 
                                     : (b.includes("KCC")) ? "KCC" 
                                     : (b.includes("LX") || b.includes("LG") || b.includes("하우시스")) ? "LX" 
                                     : b;
                            })()}</td>
                            <th>라인업</th>
                            <td>{item.line || item.description || "정보 없음"}</td>
                          </tr>
                          <tr>
                            <th>두께 규격</th>
                            <td>{item.thickness || "두께 정보 없음"}</td>
                            <th>제품 가로세로 규격</th>
                            <td>{item.specs?.size || item.spec || "제품별 규격 문의"}</td>
                          </tr>
                          <tr>
                            <th>포장 패킹 단위</th>
                            <td>{item.specs?.packing || item.packing || "Roll 단위"}</td>
                            <th>판매 단위</th>
                            <td>M (1M 단위 절단 판매 가능)</td>
                          </tr>
                          <tr>
                            <th>자재 식별 코드</th>
                            <td>{item.code || "코드 정보 없음"}</td>
                            <th>권장 접착 자재</th>
                            <td>장판 전용 웰딩 시공 / 본드</td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr>
                            <th>제조 브랜드</th>
                            <td>{getComputedBrand(item)}</td>
                            <th>카테고리</th>
                            <td>{item.category || "자재"}</td>
                          </tr>
                          <tr>
                            <th>자재 식별 코드</th>
                            <td>{item.code || "코드 정보 없음"}</td>
                            <th>두께 규격</th>
                            <td>{item.specs?.thickness || item.thickness || "표준 규격"}</td>
                          </tr>
                          <tr>
                            <th>제품 가로세로 규격</th>
                            <td>{item.specs?.size || "규격 확인 필요"}</td>
                            <th>포장 패킹 단위</th>
                            <td>{item.specs?.packing || "상담 확인 필요"}</td>
                          </tr>
                          <tr>
                            <th>판매 단위</th>
                            <td>평 (자재 1박스는 약 1평 면적을 마감합니다)</td>
                            <th>권장 접착 자재</th>
                            <td>친환경 전용 에폭시/본드</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 제품 상세 정보 이미지 (상세페이지 내용) */}
              {detailContentImg && (
                <section className="detail-doc-section detail-page-content-image">
                  <h2 className="doc-section-title">제품 상세 정보</h2>
                  <div className="doc-accent-bar"></div>
                  <div className="detail-content-img-frame" style={{ marginTop: '24px', width: '100%', display: 'flex', justifyContent: 'center', background: '#fcfcfc', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <img 
                      src={detailContentImg} 
                      alt={`${item.name} 상세 정보`} 
                      style={{ maxWidth: '100%', height: 'auto', display: 'block', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                    />
                  </div>
                </section>
              )}

              {/* Dynamic Virtual Space Showroom Section */}
              <section className="detail-doc-section">
                <h2 className="doc-section-title">이 자재가 적용된 공간 예시</h2>
                <div className="doc-accent-bar"></div>
                <p className="doc-section-helper">현재 선택한 자재 패턴과 이미지를 기반으로 한 가상 공간 적용 시뮬레이션입니다.</p>
                <div className="virtual-space-grid">
                  {spaceExamples.map((ex, idx) => (
                    <div key={idx} className={`virtual-space-card ${item.category === '벽지' ? 'category-wall' : 'category-floor'}`}>
                      <div className="space-card-img-wrapper">
                        <img 
                          src={ex.image} 
                          alt={ex.title} 
                          className="space-card-img"
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src = item.thumbnail || "/images/no-image.svg"; 
                          }}
                        />
                        <div className="space-card-overlay"></div>
                        <div className="space-card-info">
                          <h3 className="space-card-title">{ex.title}</h3>
                          <p className="space-card-desc">{ex.subtitle}</p>
                          <span className="space-card-badge">{item.brand} {item.code}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Guidelines Section */}
              <section className="detail-doc-section">
                <h2 className="doc-section-title">시공 전 유의 사항 안내</h2>
                <div className="doc-accent-bar"></div>
                <div className="guidelines-card-list">
                  {item.brand === '이건' ? (
                    <>
                      <div className="guide-card-item">
                        <AlertTriangle className="guide-card-icon text-warn" />
                        <div className="guide-card-text">
                          <h5>현장 실측 및 추가 비용 변동성</h5>
                          <p>기존 바닥 수평, 걸레받이, 문턱, 철거 상태, 양중 조건에 따라 추가 공사 비용이 발생할 수 있습니다.</p>
                        </div>
                      </div>
                      
                      <div className="guide-card-item">
                        <HelpCircle className="guide-card-icon text-info" />
                        <div className="guide-card-text">
                          <h5>기존 바닥 철거 여부 체크</h5>
                          <p>마루 시공 전 기존 바닥 위에 덧방 시공이 가능한지, 철거가 필요한지 현장 확인이 필요합니다.</p>
                        </div>
                      </div>

                      <div className="guide-card-item">
                        <ShieldCheck className="guide-card-icon text-success" />
                        <div className="guide-card-text">
                          <h5>양중 및 엘리베이터 환경</h5>
                          <p>고층 빌딩, 아파트 시공 시 엘리베이터 미확보 또는 사다리차 접근 불가 시 별도 운반비가 발생할 수 있습니다.</p>
                        </div>
                      </div>

                      {(String(item.line).includes("라르고") || String(item.line).includes("포레스타")) && (
                        <div className="guide-card-item">
                          <AlertTriangle className="guide-card-icon text-warn" style={{ color: '#d97706' }} />
                          <div className="guide-card-text">
                            <h5>천연 원목 제품 색상 차이</h5>
                            <p>라르고/포레스타 같은 천연 원목 제품은 심재와 변재 차이로 밝은색, 중간색, 어두운색이 자연스럽게 혼합될 수 있습니다.</p>
                          </div>
                        </div>
                      )}

                      <div className="guide-card-item">
                        <HelpCircle className="guide-card-icon text-info" />
                        <div className="guide-card-text">
                          <h5>실물 샘플 확인 권장</h5>
                          <p>모니터와 조명 환경에 따라 색상이 다르게 보일 수 있으므로 최종 선택 전 샘플 확인을 권장합니다.</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="guide-card-item">
                        <AlertTriangle className="guide-card-icon text-warn" />
                        <div className="guide-card-text">
                          <h5>현장 실측 및 추가 비용 변동성</h5>
                          <p>기존 바닥 수평 불균형이 극심한 경우, 평탄화 작업(보수 및 샌딩)으로 인한 부가 공사비용이 별도 청구될 수 있습니다.</p>
                        </div>
                      </div>
                      
                      <div className="guide-card-item">
                        <HelpCircle className="guide-card-icon text-info" />
                        <div className="guide-card-text">
                          <h5>기존 바닥 철거 여부 체크</h5>
                          <p>마루나 장판 등 기존 바닥 위에 덧방 시공이 불가한 심한 오염/습기 상태일 경우, 기존 바닥의 선철거 공정이 반드시 필요합니다.</p>
                        </div>
                      </div>

                      <div className="guide-card-item">
                        <ShieldCheck className="guide-card-icon text-success" />
                        <div className="guide-card-text">
                          <h5>양중 및 엘리베이터 환경</h5>
                          <p>고층 빌딩/아파트 시공 시 화물 엘리베이터 미확보 또는 사다리차 접근 불가 시 계단 운반(양중비)이 발생하게 됩니다.</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </section>

            </div>

            {/* Right Column: Sticky Quote card */}
            <aside className="showroom-sticky-widget">
              <div className="sticky-consulting-card">
                <span className="sticky-badge">DK FLOOR SHOWROOM</span>
                <h4 className="sticky-product-name">{displayName}</h4>
                <div className="sticky-product-code">자재코드: {item.code}</div>
                
                <div className="sticky-contact-number">
                  <span className="contact-label-txt">실시간 직통 견적 전화</span>
                  <a href="tel:02-487-9775" className="contact-phone-link">
                    <Phone size={14} /> 02-487-9775
                  </a>
                </div>

                <div className="sticky-button-stack">
                  <button className="btn-sticky-quote" onClick={handleEstimate}>
                    간편 견적 요청서 작성
                  </button>
                  <button className="btn-sticky-sample" onClick={() => navigate("/samplebooks")}>
                    자재 샘플북 신청
                  </button>
                </div>

                <div className="sticky-operations-info">
                  <div className="op-row">
                    <Clock size={12} />
                    <span>평일 07:00 ~ 18:00</span>
                  </div>
                  <div className="op-row">
                    <Clock size={12} />
                    <span>주말 07:00 ~ 12:00</span>
                  </div>
                  <div className="op-row">
                    <MapPin size={12} />
                    <span>경기 하남시 서하남로 37</span>
                  </div>
                </div>
              </div>
            </aside>

          </div>

          {/* ==========================================
             3. Related Products Section
             ========================================== */}
          {relatedItems.length > 0 && (
            <section className="related-materials-section">
              <div className="section-header-left">
                <span className="section-subtitle">RELATED MATERIALS</span>
                <h2 className="section-title">함께 보면 좋은 추천 자재</h2>
                <div className="header-bar-left"></div>
              </div>

              <div className="related-materials-grid">
                {relatedItems.map((rItem, idx) => {
                  let rLine = rItem.line || "";
                  let rColor = rItem.name || "";
                  if (rColor.startsWith(rLine)) {
                    rColor = rColor.replace(rLine, "").trim();
                  }
                  const rDisplayName = rItem.brand === '이건'
                    ? `이건마루 ${rLine} ${rColor}`.replace(/\s+/g, ' ').trim()
                    : rItem.name;

                  return (
                    <div 
                      key={rItem.id || idx} 
                      className="related-item-card"
                      onClick={() => navigate(`/materials/${rItem.id}`)}
                    >
                      <div className="related-thumb-box">
                        <ProductImage 
                          src={rItem.thumbnail} 
                          alt={rItem.name} 
                          className="related-thumb-img"
                        />
                      </div>
                      <div className="related-info-box">
                        <span className="related-brand">{rItem.brand === '이건' ? '이건마루' : rItem.brand}</span>
                        <h4 className="related-name">{rDisplayName}</h4>
                        {rItem.brand === '이건' ? (
                          <p className="related-line" style={{ fontSize: '11px', color: 'var(--point-gold)', fontWeight: '600', margin: '4px 0' }}>{rItem.line}</p>
                        ) : (
                          <p className="related-code">{rItem.code}</p>
                        )}
                        <p className="related-specs">{rItem.size || "규격 별도문의"}</p>
                        <div className="btn-related-link">
                          자세히 보기 <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      </div>

      {/* ==========================================
         4. Fixed Bottom CTA Bar (Mobile Viewports Only)
         ========================================== */}
      <div className="mobile-cta-fixed-bar">
        <div className="mobile-cta-sub-row">
          <button className="mobile-cta-sub-btn" onClick={handleEstimate}>
            <FileText size={14} /> 견적 요청하기
          </button>
          <a href="tel:02-487-9775" className="mobile-cta-sub-btn">
            <Phone size={14} /> 전화 문의하기
          </a>
        </div>
        <div className="mobile-cta-main-row">
          <button className="mobile-cta-main-btn btn-cart" onClick={handleAddToCart}>
            장바구니 담기
          </button>
          <button className="mobile-cta-main-btn btn-buy" onClick={handleDirectBuy}>
            바로구매
          </button>
        </div>
      </div>

      {/* 장바구니 담기 완료 팝업 모달 */}
      {showCartModal && (
        <div className="cart-confirm-modal-overlay">
          <div className="cart-confirm-modal">
            <h3>장바구니에 담았습니다.</h3>
            <p>선택하신 자재가 장바구니에 정상적으로 보관되었습니다.</p>
            <div className="modal-actions">
              <button className="btn-modal-shopping" onClick={() => setShowCartModal(false)}>
                계속 쇼핑하기
              </button>
              <button className="btn-modal-cart" onClick={() => {
                setShowCartModal(false);
                navigate("/cart");
              }}>
                장바구니로 이동
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
