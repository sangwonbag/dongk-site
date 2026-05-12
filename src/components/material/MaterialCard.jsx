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
                    src={coverUrl || "/images/no-image.jpg"}
                    alt={material.name || material.code}
                    onError={(e) => { e.target.src = "/images/no-image.jpg"; }}
                />

                {material.isNew && <span className="badge-new">NEW</span>}
            </div>

            <div className="card-info">
                <div className="card-brand-cat">{getComputedBrand(material)}</div>
                <div className="card-name">{material.name}</div>
                <div className="card-price-row">
                    <div className="card-price">
                        {material.price ? `₩${material.price.toLocaleString()}원` : "가격문의"}
                    </div>
                </div>

                <div className="card-actions">
                    <button className="btn-detail" onClick={handleGoDetail}>
                        상세보기
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
