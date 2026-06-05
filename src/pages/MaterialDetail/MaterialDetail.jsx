import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
import { useEstimateCart } from "../../contexts/EstimateCartContext";
import { getValidGalleryImages, getDetailImage, getThumbnailImage } from "../../utils/galleryUtils";
import { supabase } from "../../lib/supabaseClient";
import { getCurrentUser } from "../../lib/auth";
import { materials } from "../../data/materials.db"; // Local fallback data
import { getComputedBrand } from "../../utils/brandUtils";
import "./MaterialDetail.css";

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

// Helper function to generate virtual space examples dynamically based on category and product images
const getVirtualSpaceExamples = (product, galleryImages) => {
  const category = product?.category;
  const mainImage = product?.image || product?.thumbnail || "/images/deco_tile.png";
  
  // Extract simple URL strings from gallery images state (which has objects { thumbnail, detail })
  const imageList = (galleryImages || []).map(img => img.detail).filter(Boolean);
  
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
  const location = useLocation();
  const { addToCart } = useEstimateCart();
  const currentUser = getCurrentUser();

  const id = decodeURIComponent(rawId || "");

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [images, setImages] = useState([]); 
  const [selectedImageObj, setSelectedImageObj] = useState(null); 
  const [qty, setQty] = useState(1);
  const [relatedItems, setRelatedItems] = useState([]);

  // Scroll to top on id change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleImageError = (brokenObj) => {
    setImages(prev => {
      const nextImages = prev.filter(img => img.detail !== brokenObj.detail);
      if (selectedImageObj && selectedImageObj.detail === brokenObj.detail) {
        setSelectedImageObj(nextImages.length > 0 ? nextImages[0] : null);
      }
      return nextImages;
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

          setItem({
            id: localItem.id || localItem.code,
            code: itemCode,
            name: localItem.name || "",
            brand: inferredBrand,
            category: inferredCategory,
            price: localItem.price || 0,
            thickness: localItem.thickness || "",
            specs: {
              thickness: localItem.thickness || "",
              size: localItem.specs?.size || "",
              packing: localItem.specs?.packing || ""
            },
            thumbnail: localItem.thumbnail || null,
            image: localItem.thumbnail || null,
            images: localItem.images || [],
            description: localItem.description || "",
            features: localItem.features || [],
            recommendedSpaces: localItem.recommendedSpaces || []
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

        setItem({
          id: p.slug || String(p.id),
          code: itemCode,
          name: p.name || "",
          brand: inferredBrand,
          category: inferredCategory,
          price: p.price || 0,
          thickness: p.thickness || "",
          specs: {
            thickness: p.thickness || "",
            size: p.size_text || "",
            packing: p.unit || ""
          },
          thumbnail: p.image_url || null,
          image: p.image_url || null,
          description: p.description || "",
          features: p.features || [],
          recommendedSpaces: p.recommended_spaces || []
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

      if (!alive) return;

      const firstImgObj = {
        thumbnail: thumbStr || detailStr || "/images/deco_tile.png",
        detail: detailStr || thumbStr || "/images/deco_tile.png"
      };

      const allImages = [];
      const seenDetails = new Set();

      if (firstImgObj.detail) {
        seenDetails.add(firstImgObj.detail);
        allImages.push(firstImgObj);
      }

      for (const go of galleryObjs) {
        if (go.detail && !seenDetails.has(go.detail)) {
          seenDetails.add(go.detail);
          allImages.push(go);
        }
      }

      if (allImages.length > 0) {
        setImages(allImages);
        setSelectedImageObj(allImages[0]);
      } else {
        const defaultObj = { thumbnail: "/images/deco_tile.png", detail: "/images/deco_tile.png" };
        setImages([defaultObj]);
        setSelectedImageObj(defaultObj);
      }
    }
    loadImages();

    return () => { alive = false; };
  }, [item]);

  // 3. Fetch Related Products
  useEffect(() => {
    if (!item) return;

    async function fetchRelated() {
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('products')
            .select(`
              *,
              categories ( id, name ),
              brands ( id, name )
            `)
            .eq('category_id', item.category_id || 1) // default or dynamic category_id match
            .neq('product_code', item.code)
            .limit(4);
          
          if (data && data.length > 0) {
            setRelatedItems(data.map(p => ({
              id: p.slug || String(p.id),
              code: p.product_code || "",
              name: p.name || "",
              brand: p.brands?.name || "",
              category: p.categories?.name || "",
              price: p.price || 0,
              thumbnail: p.image_url || null,
              size: p.size_text || ""
            })));
            return;
          }
        }
      } catch (err) {
        console.warn("Supabase related fetch failed, using fallback.", err);
      }

      // Fallback local related
      const localRelated = materials
        .filter(m => (m.category === item.category || m.brand === item.brand) && m.code !== item.code)
        .slice(0, 4)
        .map(m => ({
          id: m.id || m.code,
          code: m.code || "",
          name: m.name || "",
          brand: m.brand || "",
          category: m.category || "",
          price: m.price || 0,
          thumbnail: m.thumbnail || null,
          size: m.specs?.size || m.specs?.thickness || ""
        }));
      setRelatedItems(localRelated);
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
    // 1. Add item to cart
    addToCart({
      id: item.id,
      code: item.code,
      name: item.name,
      brand: item.brand,
      category: item.category,
      specs: item.specs,
      price: item.price,
      thumbnail: item.thumbnail,
      quantity: qty
    });

    // 2. Navigate with state
    navigate("/estimate/request", {
      state: {
        fromProduct: true,
        selectedProduct: {
          id: item.id,
          brand: item.brand,
          name: item.name,
          code: item.code,
          category: item.category,
          specs: item.specs
        }
      }
    });
  };

  const handleAddToCart = () => {
    addToCart({
      id: item.id,
      code: item.code,
      name: item.name,
      brand: item.brand,
      category: item.category,
      specs: item.specs,
      price: item.price,
      thumbnail: item.thumbnail,
      quantity: qty
    });
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

  const spaceExamples = getVirtualSpaceExamples(item, images);

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
              <div className="showroom-main-frame">
                {selectedImageObj && selectedImageObj.detail ? (
                  <img 
                    src={`${selectedImageObj.detail}?v=2`} 
                    alt={`${item.name} main`} 
                    onError={() => handleImageError(selectedImageObj)} 
                    className="showroom-main-img"
                  />
                ) : (
                  <div className="showroom-img-placeholder">
                    <span>{item.name}</span>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="showroom-thumb-strip">
                  {images.map((imgObj, idx) => (
                    <div 
                      key={idx}
                      className={`showroom-thumb-box ${selectedImageObj && selectedImageObj.detail === imgObj.detail ? "active" : ""}`}
                      onClick={() => setSelectedImageObj(imgObj)}
                    >
                      <img
                        src={`${imgObj.thumbnail}?v=2`}
                        onError={() => handleImageError(imgObj)}
                        alt={`thumbnail-${idx}`}
                        className="showroom-thumb-img"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Info & Options */}
            <div className="showroom-meta-data">
              <div className="product-brand-badge">
                <span className="brand-name">{getComputedBrand(item)}</span>
                <span className="divider">·</span>
                <span className="category-name">{item.category}</span>
              </div>

              <h1 className="showroom-product-title">{item.name}</h1>
              <div className="showroom-product-code">
                <span>상품코드:</span> <strong>{item.code}</strong>
              </div>

              {/* Price display (visible to admin or shows consulting guide) */}
              <div className="showroom-price-card">
                {currentUser?.role === 'admin' ? (
                  <div className="admin-price-box">
                    <div className="showroom-detail-price" style={{ marginBottom: "16px", borderBottom: "1px solid var(--border-showroom-light)", paddingBottom: "16px" }}>
                      <span style={{ fontSize: "14px", color: "var(--text-light-gray)", marginRight: "8px" }}>가격:</span>
                      <strong style={{ fontSize: "22px", color: "var(--accent-showroom-green)" }}>
                        {item.price ? `₩${item.price.toLocaleString()}원` : "가격문의"}
                      </strong>
                    </div>
                    <span className="price-tag-label">관리자 전용 대리점가</span>
                    <strong className="price-num">{item.price ? `${item.price.toLocaleString()}원` : "단가 문의"}</strong>
                    <span className="price-vat">(평당 단가 / VAT 10% 별도)</span>
                  </div>
                ) : (
                  <div className="client-consulting-box">
                    <div className="showroom-detail-price" style={{ marginBottom: "16px", borderBottom: "1px solid var(--border-showroom-light)", paddingBottom: "16px" }}>
                      <span style={{ fontSize: "14px", color: "var(--text-light-gray)", marginRight: "8px" }}>가격:</span>
                      <strong style={{ fontSize: "22px", color: "var(--accent-showroom-green)" }}>
                        {item.price ? `₩${item.price.toLocaleString()}원` : "가격문의"}
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
                  <span className="tech-label">규격</span>
                  <span className="tech-value">{item.specs?.size || "상담 확인 필요"}</span>
                </div>
                <div className="tech-spec-item">
                  <span className="tech-label">박스 구성</span>
                  <span className="tech-value">{item.specs?.packing || "1박스 단위 판매"}</span>
                </div>
                <div className="tech-spec-item">
                  <span className="tech-label">시공 면적</span>
                  <span className="tech-value">
                    {item.category === '장판' ? "M 단위 소요량 측정" : "1박스당 1평(약 3.3㎡) 내외 시공"}
                  </span>
                </div>
              </div>

              {/* Quantity Counter & Action Buttons */}
              <div className="showroom-qty-selector">
                <span className="qty-label">소요량 산정 (박스/단위)</span>
                <div className="qty-counter-box">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="qty-btn">-</button>
                  <input type="number" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} className="qty-input" />
                  <button onClick={() => setQty(qty + 1)} className="qty-btn">+</button>
                </div>
              </div>

              <div className="showroom-action-buttons">
                <button className="btn-showroom-quote" onClick={handleEstimate}>
                  <FileText size={18} /> 견적 요청하기
                </button>
                <a href="tel:02-487-9775" className="btn-showroom-phone">
                  <Phone size={18} /> 전화 문의하기
                </a>
              </div>

              <div className="showroom-sub-actions">
                <button className="btn-sub-utility" onClick={handleAddToCart}>
                  <ShoppingCart size={15} /> 견적 바구니 담기
                </button>
                <button className="btn-sub-utility" onClick={() => navigate("/samplebooks")}>
                  <BookOpen size={15} /> 자재 샘플북 요청
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
                    </tbody>
                  </table>
                </div>
              </section>

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
                          onError={(e) => { e.target.src = item.thumbnail || "/images/no-image.jpg"; }}
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
                </div>
              </section>

            </div>

            {/* Right Column: Sticky Quote card */}
            <aside className="showroom-sticky-widget">
              <div className="sticky-consulting-card">
                <span className="sticky-badge">DK FLOOR SHOWROOM</span>
                <h4 className="sticky-product-name">{item.name}</h4>
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
                {relatedItems.map((rItem, idx) => (
                  <div 
                    key={rItem.id || idx} 
                    className="related-item-card"
                    onClick={() => navigate(`/materials/${rItem.id}`)}
                  >
                    <div className="related-thumb-box">
                      <img src={rItem.thumbnail || "/images/deco_tile.png"} alt={rItem.name} className="related-thumb-img" />
                    </div>
                    <div className="related-info-box">
                      <span className="related-brand">{rItem.brand}</span>
                      <h4 className="related-name">{rItem.name}</h4>
                      <p className="related-code">{rItem.code}</p>
                      <p className="related-specs">{rItem.size || "규격 별도문의"}</p>
                      <div className="btn-related-link">
                        자세히 보기 <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>

      {/* ==========================================
         4. Fixed Bottom CTA Bar (Mobile Viewports Only)
         ========================================== */}
      <div className="mobile-cta-fixed-bar">
        <a href="tel:02-487-9775" className="mobile-cta-btn mobile-phone-btn">
          <Phone size={16} /> 전화상담
        </a>
        <button className="mobile-cta-btn mobile-quote-btn" onClick={handleEstimate}>
          <FileText size={16} /> 견적 요청하기
        </button>
      </div>

    </MainLayout>
  );
}
