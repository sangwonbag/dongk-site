import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEstimateCart } from '../../contexts/EstimateCartContext';
import { useAuth } from '../../contexts/AuthContext';
import { getThumbnailImage } from '../../utils/galleryUtils';
import { getMaterialImagePath } from '../../utils/materialImageResolver';
import { getComputedBrand } from '../../utils/brandUtils';
import './MaterialCard.css';

const MaterialCard = ({ material }) => {
    const navigate = useNavigate();
    const { addToCart } = useEstimateCart();
    const { user: currentUser, openLoginModal } = useAuth();
    
    // Track if the thumbnail image is fully loaded
    const [imgLoaded, setImgLoaded] = useState(false);

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
        setImgLoaded(false);
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
        if (material.brand === '이건' && material.category === '마루') {
            return material.productName || `${material.name}_${material.line}`;
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
            quantity: 1,
            amount: price,
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
            quantity: 1,
            amount: price,
            selectedSize: selectedOption ? selectedOption.label : undefined,
            thumbnail: coverUrl || "/images/no-image.svg",
            image: coverUrl || "/images/no-image.svg"
        };

        addToCart(cartItem);
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
                {!imgLoaded && <div className="card-image-skeleton-loader skeleton-shimmer" />}
                <img
                    className="material-thumb"
                    src={coverUrl || "/images/no-image.svg"}
                    alt={displayName || material.code}
                    loading="lazy"
                    onLoad={() => setImgLoaded(true)}
                    onError={(e) => { 
                        e.currentTarget.onerror = null; 
                        e.currentTarget.src = "/images/no-image.svg"; 
                        setImgLoaded(true);
                    }}
                    style={{ opacity: imgLoaded ? 1 : 0, transition: "opacity 0.2s ease-in-out" }}
                />

                {material.isNew && <span className="badge-new">NEW</span>}
            </div>

            <div className="card-info">
                <div className="card-brand-cat">
                    <span className="card-brand">{getComputedBrand(material)}</span>
                    {material.category && <span className="card-cat-divider">|</span>}
                    <span className="card-category">{material.category}</span>
                </div>
                <div className="card-name">{displayName}</div>
                
                {material.brand === '이건' && material.category === '마루' ? (
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
                    <div className="card-price">
                        {material.price ? `₩${material.price.toLocaleString()}원` : "가격문의"}
                    </div>
                </div>

                <div className="card-actions">
                    <button className="btn-detail btn-cart-add" onClick={handleAddToCart}>
                        장바구니 담기
                    </button>
                    <button className="btn-quote" onClick={handleInquiry}>
                        견적요청
                    </button>
                </div>
            </div>
        </div>
    );
};

const MemoizedMaterialCard = React.memo(MaterialCard);
export default MemoizedMaterialCard;
