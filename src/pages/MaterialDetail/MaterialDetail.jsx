import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import { materials } from "../../data/materials.db";
import { getValidGalleryImages, getDetailImage, getThumbnailImage } from "../../utils/galleryUtils";
import "./MaterialDetail.css";

export default function MaterialDetail() {
    const { id: rawId } = useParams();
    const navigate = useNavigate();

    // Decode ID to handle encoded chars like %20
    const id = decodeURIComponent(rawId || "");

    // Find material. Try ID match first, then Code match (if slug is code)
    const item = materials.find(m => m.id === id || m.code === id);

    const [images, setImages] = useState([]); // Array of {thumbnail, detail} objects
    const [selectedImageObj, setSelectedImageObj] = useState(null); // The chosen {thumbnail, detail}
    const [selectedOption, setSelectedOption] = useState("");
    const [qty, setQty] = useState(1);

    const handleImageError = (brokenObj) => {
        setImages(prev => {
            const nextImages = prev.filter(img => img.detail !== brokenObj.detail);
            if (selectedImageObj && selectedImageObj.detail === brokenObj.detail) {
                setSelectedImageObj(nextImages.length > 0 ? nextImages[0] : null);
            }
            return nextImages;
        });
    };

    // Initial Image Load
    useEffect(() => {
        if (!item) return;

        let alive = true;

        async function loadImages() {
            const detailStr = await getDetailImage(item);
            const thumbStr = await getThumbnailImage(item);
            const galleryObjs = await getValidGalleryImages(item);

            if (!alive) return;

            // Combine into structured objects prioritizing separation
            const firstImgObj = {
                thumbnail: thumbStr || detailStr,
                detail: detailStr || thumbStr
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
                setImages([]);
                setSelectedImageObj(null);
            }
        }
        loadImages();

        return () => { alive = false; };
    }, [item, id]);

    if (!item) return <MainLayout><div className="container">상품을 찾을 수 없습니다.</div></MainLayout>;

    const totalPrice = (item.price || 0) * qty;
    const isOptionSelected = !!selectedOption;

    const handleBuy = () => {
        if (!isOptionSelected) {
            alert("옵션을 선택해주세요.");
            return;
        }
        alert(`구매 진행: ${item.name} / 수량 ${qty}개 / ${totalPrice.toLocaleString()}원`);
    };

    const handleCart = () => {
        if (!isOptionSelected) {
            alert("옵션을 선택해주세요.");
            return;
        }
        alert("장바구니에 담았습니다.");
    };

    const handleBackInfo = () => {
        const lastUrl = sessionStorage.getItem("materialsLastUrl");
        if (lastUrl) {
            navigate(lastUrl);
        } else {
            navigate("/materials"); // default to recommended
        }
    };

    return (
        <MainLayout>
            <div className="container mat-detail-page">
                <button className="btn-back-to-list" onClick={handleBackInfo} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', fontSize: '15px', color: '#666', padding: '0' }}>
                    <ArrowLeft size={18} /> 이전 목록으로 돌아가기
                </button>
                <div className="detail-wrapper">
                    {/* Left: Gallery */}
                    <div className="detail-gallery">
                        <div className="main-image">
                            {selectedImageObj && selectedImageObj.detail ? (
                                <img 
                                    src={`${selectedImageObj.detail}?v=2`} 
                                    alt={`${item.name} main zoom`} 
                                    onError={() => handleImageError(selectedImageObj)} 
                                />
                            ) : (
                                <div className="detail-img-placeholder">{item.name}</div>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="thumb-list">
                                {images.map((imgObj, idx) => (
                                    <img
                                        key={imgObj.detail || idx}
                                        src={`${imgObj.thumbnail}?v=2`}
                                        className={`thumb ${selectedImageObj && selectedImageObj.detail === imgObj.detail ? "active" : ""}`}
                                        onClick={() => setSelectedImageObj(imgObj)}
                                        onError={() => handleImageError(imgObj)}
                                        alt={`thumb-${idx}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="detail-info">
                        <div className="info-header">
                            <span className="brand-name">{item.brand}</span>
                            <span className="category-name"> · {item.category}</span>
                        </div>

                        <h1 className="product-title">{item.name}</h1>

                        <div className="product-price">
                            {item.price ? `${item.price.toLocaleString()}원 (VAT 별도)` : "가격문의"}
                        </div>

                        {item.specs && (
                            <div className="specs-table">
                                {item.specs.division && (
                                    <div className="spec-row">
                                        <span className="spec-key">구분</span>
                                        <span className="spec-val">{item.specs.division}</span>
                                    </div>
                                )}
                                <div className="spec-row">
                                    <span className="spec-key">두께</span>
                                    <span className="spec-val">{item.specs.thickness}</span>
                                </div>
                                <div className="spec-row">
                                    <span className="spec-key">규격</span>
                                    <span className="spec-val">{item.specs.size}</span>
                                </div>
                                <div className="spec-row">
                                    <span className="spec-key">포장</span>
                                    <span className="spec-val">{item.specs.packing}</span>
                                </div>
                            </div>
                        )}

                        {/* 1) Option Selection */}
                        <div className="option-section">
                            <label className="section-label">[1] 옵션 선택</label>
                            <select
                                className="option-select"
                                value={selectedOption}
                                onChange={(e) => {
                                    setSelectedOption(e.target.value);
                                    setQty(1); // Reset qty on option change
                                }}
                            >
                                <option value="" disabled>옵션을 선택하세요</option>
                                <option value={item.code}>{item.code} (기본)</option>
                            </select>
                        </div>

                        {/* 2) Quantity & Summary (Visible only after option selected) */}
                        {isOptionSelected && (
                            <div className="summary-box">
                                <div className="summary-row">
                                    <span className="summary-name">{item.name}</span>
                                    <div className="qty-control">
                                        <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                                        <input readOnly value={qty} />
                                        <button onClick={() => setQty(Math.min(999, qty + 1))}>+</button>
                                    </div>
                                </div>
                                <div className="summary-total">
                                    <span className="total-label">총 상품금액</span>
                                    <span className="total-price">
                                        {totalPrice > 0 ? `${totalPrice.toLocaleString()}원 (VAT 별도)` : "가격문의"}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="action-buttons">
                            <button
                                className={`btn-cart ${!isOptionSelected ? "disabled" : ""}`}
                                onClick={handleCart}
                            >
                                장바구니
                            </button>
                            <button
                                className={`btn-buy ${!isOptionSelected ? "disabled" : ""}`}
                                onClick={handleBuy}
                            >
                                바로구매
                            </button>
                        </div>

                        {!isOptionSelected && (
                            <div className="select-guide">상품 옵션을 선택해주세요.</div>
                        )}

                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
