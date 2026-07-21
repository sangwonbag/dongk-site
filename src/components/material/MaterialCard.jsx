import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEstimateCart } from '../../contexts/EstimateCartContext';
import { useAuth } from '../../contexts/AuthContext';
import { getThumbnailImage } from '../../utils/galleryUtils';
import { getMaterialImagePath } from '../../utils/materialImageResolver';
import { getComputedBrand, getNormalizedThickness, formatFlooringProductName, getProductUnit } from '../../utils/brandUtils';
import { Skeleton, ImagePlaceholder, ProductImage } from '../ui';
import './MaterialCard.css';

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

const MaterialCard = ({ material }) => {
    const navigate = useNavigate();
    const { addToCart } = useEstimateCart();
    const { user: currentUser, openLoginModal } = useAuth();
    
    const [qty, setQty] = useState(1);

    // Hybrid local-sync / Supabase-async resolver to eliminate render flickering
    const [coverUrl, setCoverUrl] = useState(() => {
        const localPath = getMaterialImagePath(material);
        return localPath !== "/images/no-image.svg" ? localPath : "";
    });

    const hasOptions = material.sizeOptions && material.sizeOptions.length >= 2;
    const [selectedOption, setSelectedOption] = useState(() => {
        if (material.sizeOptions && material.sizeOptions.length > 0) {
            return material.sizeOptions[0];
        }
        return null;
    });

    useEffect(() => {
        setQty(1);
        if (material.sizeOptions && material.sizeOptions.length > 0) {
            setSelectedOption(material.sizeOptions[0]);
        } else {
            setSelectedOption(null);
        }
    }, [material]);

    const currentSpec = selectedOption ? selectedOption.spec : (material.specs?.size || material.spec || "");

    // Compute standard display name for cards and cart items
    const displayName = (() => {
        if (!material) return "";
        if (material.category === '마루') {
            const brandName = material.brand === '이건' ? '이건마루' : getComputedBrand(material);
            const line = material.displayLine || material.line || "";
            let name = material.name || "";
            if (line && name.startsWith(line)) {
                name = name.replace(line, "").trim();
            }
            return `${brandName} ${line} ${name}`.replace(/\s+/g, ' ').trim();
        }
        if (material.brand === '동신' && material.category === '데코타일' && ['아트타일', '아트하우스', '아트에코차음'].includes(material.line)) {
            return material.code;
        }
        if (material.brand === 'LX' && material.category === '데코타일') {
            const cleanCode = (material.code || "").replace(/\s+/g, "").toLowerCase();
            const cleanName = (material.name || "").replace(/\s+/g, "").toLowerCase();
            if (cleanCode && cleanName.includes(cleanCode)) {
                return material.name;
            }
            return `${material.code} ${material.name}`;
        }
        if (material.category === '장판') {
            return formatFlooringProductName(material);
        }
        return material.name;
    })();

    useEffect(() => {
        let isMounted = true;
        const localPath = getMaterialImagePath(material);
        if (localPath !== "/images/no-image.svg") {
            Promise.resolve().then(() => {
                if (isMounted) setCoverUrl(localPath);
            });
            return;
        }

        getThumbnailImage(material).then((url) => {
            if (isMounted && url) {
                setCoverUrl(url);
            }
        });
        return () => { isMounted = false; };
    }, [material]);

    const parsePrice = (priceVal) => {
        if (priceVal === undefined || priceVal === null) return null;
        if (typeof priceVal === 'number') return priceVal;
        
        const cleanStr = String(priceVal).replace(/[^\d]/g, '');
        const parsed = parseInt(cleanStr, 10);
        return isNaN(parsed) ? null : parsed;
    };

    const handleInquiry = (e) => {
        e.stopPropagation();
        if (!currentUser) {
            openLoginModal();
            return;
        }
        
        const price = parsePrice(material.price) || 0;
        
        const cartItem = {
            id: selectedOption ? `${material.id}-${selectedOption.label}` : material.id,
            product_id: material.id,
            productId: material.id,
            brand: getComputedBrand(material),
            thickness: material.thickness || getNormalizedThickness(material),
            category: material.category || null,
            line: material.line || "",
            name: displayName || "",
            product_name: displayName || "",
            code: material.code || null,
            product_code: material.code || null,
            spec: selectedOption ? selectedOption.spec : (material.specs?.size || material.spec || "표준규격"),
            specs: selectedOption ? {
                thickness: selectedOption.thickness,
                size: selectedOption.spec,
                packing: selectedOption.package || ""
            } : (material.specs || null),
            packing: selectedOption ? (selectedOption.package || "") : (material.specs?.packing || material.package || "1박스 단위 판매"),
            price: price,
            unit_price: price,
            unit: getProductUnit(material),
            quantity: qty,
            amount: price * qty,
            selectedSize: selectedOption ? selectedOption.label : undefined,
            thumbnail: coverUrl || "/images/no-image.svg",
            image: coverUrl || "/images/no-image.svg"
        };

        addToCart(cartItem);
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (!currentUser) {
            openLoginModal();
            return;
        }
        
        const price = parsePrice(material.price) || 0;

        const cartItem = {
            id: selectedOption ? `${material.id}-${selectedOption.label}` : material.id,
            product_id: material.id,
            productId: material.id,
            brand: getComputedBrand(material),
            thickness: material.thickness || getNormalizedThickness(material),
            category: material.category || null,
            line: material.line || "",
            name: displayName || "",
            product_name: displayName || "",
            code: material.code || null,
            product_code: material.code || null,
            spec: selectedOption ? selectedOption.spec : (material.specs?.size || material.spec || "표준규격"),
            specs: selectedOption ? {
                thickness: selectedOption.thickness,
                size: selectedOption.spec,
                packing: selectedOption.package || ""
            } : (material.specs || null),
            packing: selectedOption ? (selectedOption.package || "") : (material.specs?.packing || material.package || "1박스 단위 판매"),
            price: price,
            unit_price: price,
            unit: getProductUnit(material),
            quantity: qty,
            amount: price * qty,
            selectedSize: selectedOption ? selectedOption.label : undefined,
            thumbnail: coverUrl || "/images/no-image.svg",
            image: coverUrl || "/images/no-image.svg"
        };

        addToCart(cartItem);
    };

    const handleDirectBuy = (e) => {
        e.stopPropagation();
        if (!currentUser) {
            openLoginModal();
            return;
        }
        
        const price = parsePrice(material.price) || 0;
        if (price <= 0) {
            alert("가격 확인이 필요한 자재입니다.");
            return;
        }

        const cartItem = {
            id: selectedOption ? `${material.id}-${selectedOption.label}` : material.id,
            product_id: material.id,
            productId: material.id,
            brand: getComputedBrand(material),
            thickness: material.thickness || getNormalizedThickness(material),
            category: material.category || null,
            line: material.line || "",
            name: displayName || "",
            product_name: displayName || "",
            code: material.code || null,
            product_code: material.code || null,
            spec: selectedOption ? selectedOption.spec : (material.specs?.size || material.spec || "표준규격"),
            specs: selectedOption ? {
                thickness: selectedOption.thickness,
                size: selectedOption.spec,
                packing: selectedOption.package || ""
            } : (material.specs || null),
            packing: selectedOption ? (selectedOption.package || "") : (material.specs?.packing || material.package || "1박스 단위 판매"),
            price: price,
            unit_price: price,
            unit: getProductUnit(material),
            quantity: qty,
            amount: price * qty,
            selectedSize: selectedOption ? selectedOption.label : undefined,
            thumbnail: coverUrl || "/images/no-image.svg",
            image: coverUrl || "/images/no-image.svg"
        };

        addToCart(cartItem);
        navigate("/checkout");
    };

    const handleGoDetail = (e) => {
        if (e) e.stopPropagation();
        sessionStorage.setItem("materialsScrollY", window.scrollY.toString());
        // Also save current path+query so "Back to list" in detail view works exactly
        sessionStorage.setItem("materialsLastUrl", window.location.pathname + window.location.search);
        navigate(`/materials/${material.id}`);
    };

    return (
        <div className="material-card" onClick={() => handleGoDetail()}>
            <div className="card-thumb">
                <ProductImage
                    src={coverUrl}
                    alt={displayName || material.code}
                    className="material-thumb"
                />
                {material.isNew && <span className="badge-new">NEW</span>}
            </div>

            <div className="card-info">
                <div className="card-brand-cat">
                    {material.category === '마루' ? (
                        <>
                            <span className="card-brand">{getComputedBrand(material)}</span>
                            <span className="card-cat-divider">·</span>
                            <span className="card-category">{material.materialType || "강마루"}</span>
                        </>
                    ) : material.category === '장판' ? (
                        <>
                            <span className="card-brand">
                                {(() => {
                                    const b = (material.brand || "").trim();
                                    const brandDisplay = (b.includes("현대") || b.includes("Hyundai")) ? "현대" 
                                                       : (b.includes("KCC")) ? "KCC" 
                                                       : (b.includes("LX") || b.includes("LG") || b.includes("하우시스")) ? "LX" 
                                                       : b;
                                    return `${brandDisplay} · ${getNormalizedThickness(material)}`;
                                })()}
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="card-brand">{getComputedBrand(material)}</span>
                            {material.category && <span className="card-cat-divider">|</span>}
                            <span className="card-category">{material.category}</span>
                        </>
                    )}
                </div>
                <div className="card-name">{displayName}</div>
                
                {material.brand === 'KCC' && material.category === '데코타일' ? (
                    <div className="card-meta">
                        <div className="card-meta-item">
                            <span className="meta-label">제품군</span>
                            <span className="meta-value">{material.line}</span>
                        </div>
                        {material.pattern && (
                            <div className="card-meta-item">
                                <span className="meta-label">패턴명</span>
                                <span className="meta-value">{material.pattern}</span>
                            </div>
                        )}
                        <div className="card-meta-item">
                            <span className="meta-label">코드</span>
                            <span className="meta-value">{material.code}</span>
                        </div>
                        <div className="card-meta-item">
                            <span className="meta-label">규격</span>
                            <span className="meta-value">{material.specs?.size || material.spec}</span>
                        </div>
                        <div className="card-meta-item">
                            <span className="meta-label">포장</span>
                            <span className="meta-value">{material.specs?.packing || material.package}</span>
                        </div>
                        {material.specs?.area && (
                            <div className="card-meta-item">
                                <span className="meta-label">면적</span>
                                <span className="meta-value">{material.specs.area} / BOX</span>
                            </div>
                        )}
                    </div>
                ) : material.brand === '이건' && material.category === '마루' ? (
                    <div className="card-meta">
                        <div className="card-meta-item">
                            <span className="meta-label">라인업</span>
                            <span className="meta-value">{material.line}</span>
                        </div>
                        {material.collection && (
                            <div className="card-meta-item">
                                <span className="meta-label">제품군</span>
                                <span className="meta-value">{material.collection}</span>
                            </div>
                        )}
                        {material.series && (
                            <div className="card-meta-item">
                                <span className="meta-label">시리즈</span>
                                <span className="meta-value">{material.series}</span>
                            </div>
                        )}
                        {hasOptions && (
                            <div className="card-meta-item option-selector-item" onClick={(e) => e.stopPropagation()}>
                                <span className="meta-label">규격 선택</span>
                                <div className="card-option-chips">
                                    {material.sizeOptions.map(opt => (
                                        <button
                                            key={opt.label}
                                            type="button"
                                            className={`option-chip ${selectedOption?.label === opt.label ? 'active' : ''}`}
                                            onClick={() => setSelectedOption(opt)}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="card-meta-item">
                            <span className="meta-label">규격</span>
                            <span className="meta-value">{currentSpec}</span>
                        </div>
                    </div>
                ) : ((material.brand === '동신' && material.category === '데코타일' && ['아트타일', '아트하우스', '아트에코차음'].includes(material.line)) || (material.brand === 'LX' && material.category === '데코타일')) ? (
                    <div className="card-meta">
                        <div className="card-meta-item">
                            <span className="meta-label">라인업</span>
                            <span className="meta-value">{material.line}</span>
                        </div>
                        <div className="card-meta-item">
                            <span className="meta-label">시리즈</span>
                            <span className="meta-value">{material.series}</span>
                        </div>
                        <div className="card-meta-item">
                            <span className="meta-label">규격</span>
                            <span className="meta-value">{material.specs?.size || material.spec}</span>
                        </div>
                        <div className="card-meta-item">
                            <span className="meta-label">포장</span>
                            <span className="meta-value">{material.specs?.packing || material.package}</span>
                        </div>
                    </div>
                ) : (
                    <div className="card-meta">
                        {material.code && (
                            <div className="card-meta-item">
                                <span className="meta-label">코드</span>
                                <span className="meta-value">{material.code}</span>
                            </div>
                        )}
                        {((material.specs && (material.specs.thickness || material.specs.size || material.specs.packing)) || material.thickness) && (
                            <div className="card-meta-item">
                                <span className="meta-label">규격</span>
                                <span className="meta-value">
                                    {material.specs
                                        ? [material.specs.thickness, material.specs.size, material.specs.packing].filter(Boolean).join(' · ')
                                        : material.thickness}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className="card-price-row">
                    <div className="card-price-container">
                        <span className="card-price">
                            {material.price ? `${material.price.toLocaleString()}원` : "가격문의"}
                        </span>
                        {material.price && (
                            <span className="card-price-unit">
                                {`/${getProductUnit(material)}`}
                            </span>
                        )}
                    </div>
                    <span className="card-delivery-badge">
                        {material.category === '장판' ? "m 단위 절단" : "50평 이상 무료배송"}
                    </span>
                </div>

                {material.category === '부자재' && (
                    <div className="card-qty-selector" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '4px 8px', border: '1px solid #E6E2D8', borderRadius: '4px', background: '#FAF8F2' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-light-gray)' }}>수량 선택</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button 
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); setQty(Math.max(1, qty - 1)); }}
                                style={{ width: '24px', height: '24px', border: '1px solid #E6E2D8', background: '#fff', cursor: 'pointer', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                            >
                                -
                            </button>
                            <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '13px', fontWeight: '700' }}>{qty}</span>
                            <button 
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); setQty(qty + 1); }}
                                style={{ width: '24px', height: '24px', border: '1px solid #E6E2D8', background: '#fff', cursor: 'pointer', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                            >
                                +
                            </button>
                        </div>
                    </div>
                )}

                <div className="card-actions">
                    <button className="btn-detail btn-cart-add" onClick={handleAddToCart}>
                        장바구니 담기
                    </button>
                    {isDirectPricingCategory(material) ? (
                        <button className="btn-quote" onClick={handleDirectBuy} style={{ backgroundColor: 'var(--point-orange)', borderColor: 'var(--point-orange)', color: '#fff' }}>
                            바로구매
                        </button>
                    ) : (
                        <button className="btn-quote" onClick={handleInquiry}>
                            견적요청
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const MemoizedMaterialCard = React.memo(MaterialCard);
export default MemoizedMaterialCard;
