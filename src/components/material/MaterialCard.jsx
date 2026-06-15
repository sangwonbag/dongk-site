import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEstimateCart } from '../../contexts/EstimateCartContext';
import { getThumbnailImage } from '../../utils/galleryUtils';
import { getComputedBrand } from '../../utils/brandUtils';
import './MaterialCard.css';

const MaterialCard = ({ material }) => {
    const navigate = useNavigate();
    const { addToCart } = useEstimateCart();
    const [coverUrl, setCoverUrl] = useState("");

    useEffect(() => {
        let isMounted = true;
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
                <div className="card-name">{material.brand === '동신' && material.category === '데코타일' && ['아트타일', '아트하우스', '아트에코차음'].includes(material.line) ? material.code : material.name}</div>
                
                {material.brand === '동신' && material.category === '데코타일' && ['아트타일', '아트하우스', '아트에코차음'].includes(material.line) ? (
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
                    <button className="btn-detail" onClick={handleGoDetail}>
                        자세히 보기
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
