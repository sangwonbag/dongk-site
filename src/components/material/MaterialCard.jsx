import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEstimateCart } from '../../contexts/EstimateCartContext';
import { getThumbnailImage } from '../../utils/galleryUtils';
import { getMaterialImagePath } from '../../utils/materialImageResolver';
import { getComputedBrand } from '../../utils/brandUtils';
import './MaterialCard.css';

const MaterialCard = ({ material }) => {
    const navigate = useNavigate();
    const { addToCart } = useEstimateCart();
    
    // Hybrid local-sync / Supabase-async resolver to eliminate render flickering
    const [coverUrl, setCoverUrl] = useState(() => {
        const localPath = getMaterialImagePath(material);
        return localPath !== "/images/no-image.svg" ? localPath : "";
    });

    // Compute standard display name for cards and cart items
    const displayName = (() => {
        if (!material) return "";
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

    const handleInquiry = (e) => {
        e.stopPropagation();
        addToCart({
            ...material,
            quantity: 1, // Default to 1
        });
    };

    const parsePrice = (priceVal) => {
        if (priceVal === undefined || priceVal === null) return null;
        if (typeof priceVal === 'number') return priceVal;
        
        const cleanStr = String(priceVal).replace(/[^\d]/g, '');
        const parsed = parseInt(cleanStr, 10);
        return isNaN(parsed) ? null : parsed;
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        
        const price = parsePrice(material.price) || 0;

        const cartItem = {
            id: material.id,
            product_id: material.id,
            thumbnail: coverUrl || "/images/no-image.svg",
            image: coverUrl || "/images/no-image.svg",
            brand: getComputedBrand(material),
            category: material.category || null,
            name: displayName || "",
            product_name: displayName || "",
            code: material.code || null,
            product_code: material.code || null,
            spec: material.specs?.size || material.spec || "표준규격",
            specs: material.specs || null,
            packing: material.specs?.packing || material.package || "1박스 단위 판매",
            price: price,
            unit_price: price,
            quantity: 1,
            amount: price
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
                <img
                    className="material-thumb"
                    src={coverUrl || "/images/no-image.svg"}
                    alt={material.name || material.code}
                    onError={(e) => { e.target.onerror = null; e.target.src = "/images/no-image.svg"; }}
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
                
                {((material.brand === '동신' && material.category === '데코타일' && ['아트타일', '아트하우스', '아트에코차음'].includes(material.line)) || (material.brand === 'LX' && material.category === '데코타일')) ? (
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

export default MaterialCard;
