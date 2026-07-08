import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { useEstimateCart } from "../../contexts/EstimateCartContext";
import { useAuth } from "../../contexts/AuthContext";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react";
import { EmptyState } from "../../components/ui";
import "./Cart.css";

export default function Cart() {
  const nav = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useEstimateCart();
  const { user: currentUser, openLoginModal } = useAuth();

  // Helper to parse price string/number cleanly
  const parsePrice = (priceVal) => {
    if (priceVal === undefined || priceVal === null) return 0;
    if (typeof priceVal === 'number') return priceVal;
    
    const cleanStr = String(priceVal).replace(/[^0-9]/g, "");
    const parsed = parseInt(cleanStr, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Calculation states
  const totalItemsCount = cartItems.length;
  
  const getDisplayTotalQtyText = () => {
    const tileOrFloorQty = cartItems
      .filter(item => item.category !== "장판" && item.category !== "벽지")
      .reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
    const rollOrMQty = cartItems
      .filter(item => item.category === "장판" || item.category === "벽지")
      .reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
    
    const parts = [];
    if (tileOrFloorQty > 0) parts.push(`${tileOrFloorQty}박스(약 ${tileOrFloorQty}평)`);
    if (rollOrMQty > 0) parts.push(`${rollOrMQty}M`);
    return parts.join(" / ") || "0박스";
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = parsePrice(item.price);
      const qty = parseInt(item.quantity) || 1;
      return sum + (price * qty);
    }, 0);
  };

  // Flag if any item requires consulting (price is 0 or null)
  const hasUnpricedItems = cartItems.some(item => {
    const price = parsePrice(item.price);
    return price <= 0;
  });

  // Action handlers
  const handleProceedOrder = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }

    if (hasUnpricedItems) {
      alert("장바구니에 가격 확인이 필요한 자재가 포함되어 있습니다.\n고객센터로 문의하시거나 견적 요청을 진행해 주세요.");
      return;
    }

    nav("/checkout");
  };

  const handleProceedEstimate = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }

    // Navigates to estimate request, passing the current cart items in history state (for future extensions)
    nav("/estimate/request", { state: { fromCart: true, cartItems } });
  };

  const handleDeleteItem = (id, name) => {
    if (window.confirm(`“${name}” 상품을 장바구니에서 삭제할까요?`)) {
      removeFromCart(id);
    }
  };

  const handleClearCart = () => {
    if (window.confirm("장바구니를 모두 비울까요?")) {
      clearCart();
    }
  };

  return (
    <MainLayout>
      <div className="cart-page-container">
        {/* 장바구니 헤더 */}
        <div className="cart-header">
          <h1>장바구니</h1>
          <p>선택하신 자재를 확인하고 견적요청 또는 간편 주문을 진행해 보세요.</p>
        </div>

        {totalItemsCount === 0 ? (
          <EmptyState 
            title="장바구니에 담긴 자재가 없습니다" 
            description="다양한 브랜드와 규격의 고품질 데코타일, 장판, 친환경 바닥재를 담아보세요." 
            actionLabel="자재 보러가기"
            onAction={() => nav("/materials")}
          />
        ) : (
          <>
            {/* 상단 요약 바 */}
            <div className="cart-header-summary">
              <div className="summary-stats">
                선택 상품 <strong>{totalItemsCount}개</strong>
                <span className="divider-bar">|</span>
                총 수량 <strong>{getDisplayTotalQtyText()}</strong>
                <span className="divider-bar">|</span>
                상품금액 <strong>{calculateSubtotal().toLocaleString()}원</strong>
              </div>
              <div className="summary-actions-top">
                <button className="btn-shopping-continue" onClick={() => nav("/materials")}>
                  계속 쇼핑하기
                </button>
                <button 
                  className="btn-cart-clear-all" 
                  onClick={handleClearCart}
                  disabled={totalItemsCount === 0}
                >
                  전체 비우기
                </button>
              </div>
            </div>

            {/* 가격 확인 필요 알림 배너 */}
            {hasUnpricedItems && (
              <div className="price-warning-banner">
                <strong>⚠️ 안내:</strong> 장바구니에 단가 미정("가격문의") 자재가 포함되어 있습니다. 
                해당 자재는 최종 금액 계산에 합산되지 않으며, 즉시 주문 진행이 불가합니다. 
                가격을 문의하시려면 <strong>견적 요청하기</strong>를 이용해 주시기 바랍니다.
              </div>
            )}

            {/* 메인 장바구니 스플릿 레이아웃 */}
            <div className="cart-layout">
              {/* 왼쪽: 상품 리스트 */}
              <div className="cart-left-section">
                <div className="cart-item-list">
                  {cartItems.map((item) => {
                    const price = parsePrice(item.price);
                    const qty = parseInt(item.quantity) || 1;
                    const itemSpec = item.spec || item.specs?.size || "표준규격";
                    const itemPacking = item.packing || item.specs?.packing || "1박스 단위";
                    
                    const isRollOrM = item.category === "장판" || item.category === "벽지";
                    const itemQtyDesc = isRollOrM ? `${qty}M` : `${qty}박스 (약 ${qty}평 시공용)`;

                    return (
                      <div key={item.id} className="cart-item-card">
                        {/* 상품 이미지 */}
                        <div className="cart-item-img-wrapper">
                          <img 
                            className="cart-item-img"
                            src={item.thumbnail || item.image || "/images/no-image.svg"} 
                            alt={item.name}
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/placeholder-material.jpg"; }}
                          />
                        </div>

                        {/* 상세 내용 */}
                        <div className="cart-item-details">
                          <div className="cart-item-badge-row">
                            {item.brand && <span className="badge-brand">{item.brand}</span>}
                            {item.category && <span className="badge-category">{item.category}</span>}
                          </div>
                          <h4 className="cart-item-name">
                            {item.name}
                            {item.selectedSize && ` / ${item.selectedSize}`}
                          </h4>
                          <div className="cart-item-meta">
                            {item.code && item.code !== "" && <span>코드: <strong>{item.code}</strong></span>}
                            <span>규격: <strong>{itemSpec}</strong></span>
                            <span>구성: <strong>{itemPacking}</strong></span>
                            <span className="unit-conversion-lbl">소요량: <strong className="text-highlight">{itemQtyDesc}</strong></span>
                          </div>
                        </div>

                        {/* 수량 조절기 및 가격 표시 (모바일 대응 묶음 행) */}
                        <div className="cart-item-card-row-mobile">
                          {/* 수량 조절 */}
                          <div className="qty-control-box">
                            <button 
                              type="button" 
                              className="qty-btn"
                              onClick={() => updateQuantity(item.id, Math.max(1, qty - 1))}
                            >
                              <Minus size={14} />
                            </button>
                            <input 
                              type="number"
                              className="qty-input"
                              value={qty}
                              onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                            />
                            <button 
                              type="button" 
                              className="qty-btn"
                              onClick={() => updateQuantity(item.id, qty + 1)}
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* 단가 및 상품별 합계금액 */}
                          <div className="cart-item-price-section">
                            {price > 0 ? (
                              <>
                                <div className="price-unit-label">단가 ₩{price.toLocaleString()}원</div>
                                <div className="price-total-label">₩{(price * qty).toLocaleString()}원</div>
                              </>
                            ) : (
                              <div className="price-inquiry-needed">가격문의 (상담필요)</div>
                            )}
                          </div>
                        </div>

                        {/* 개별 삭제 버튼 */}
                        <button 
                          type="button"
                          className="btn-delete-cart-item"
                          onClick={() => handleDeleteItem(item.id, item.name)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* 🚚 자재 화물 및 배송 조건 안내 배너 */}
                <div className="cart-shipping-notice-card">
                  <h4>🚚 자재 화물 및 배송 조건 안내</h4>
                  <ul>
                    <li><strong>출고지 기준:</strong> 모든 바닥재 및 벽지 자재는 <strong>경기 하남 물류창고</strong>에서 직출고됩니다.</li>
                    <li><strong>배송 운임:</strong> 자재의 무게 및 거리에 따라 운임비가 상이하므로, <strong>화물 착불(대신화물 또는 경동화물, 용달배송)</strong>을 기본 원칙으로 합니다.</li>
                    <li><strong>현장 하차 기준:</strong> 화물 차량 운송은 1층 하차가 기준이며, 현장 양중 작업 및 고층 엘리베이터 이동이 필요한 경우 시공팀 또는 현장 인력을 사전에 확보해 주셔야 합니다.</li>
                  </ul>
                </div>
              </div>

              {/* 오른쪽: 주문 요약 및 진행 박스 */}
              <div className="cart-right-section">
                <div className="cart-summary-sticky-card">
                  <h3>주문 요약</h3>
                  <div className="summary-rows">
                    <div className="summary-row-item">
                      <span>상품 종류</span>
                      <strong>{totalItemsCount}종</strong>
                    </div>
                    <div className="summary-row-item">
                      <span>총 수량 / 평수</span>
                      <strong>{getDisplayTotalQtyText()}</strong>
                    </div>
                    <div className="summary-row-item">
                      <span>배송비</span>
                      <strong>별도 착불 청구</strong>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-row-total">
                      <span>최종 예상금액</span>
                      <strong>{calculateSubtotal().toLocaleString()}원</strong>
                    </div>
                    <p className="summary-vat-notice">* 부가세(VAT) 10% 별도 청구됩니다.<br />* 현장 거리 및 물량에 따라 화물 운임비가 책정됩니다.</p>
                  </div>

                  <div className="bank-transfer-info-box">
                    <strong>💳 무통장 입금 계좌</strong>
                    국민은행 752601-04-269229<br />
                    예금주: 주식회사 동경상사
                  </div>

                  <div className="summary-buttons">
                    <button 
                      className="btn-proceed-order"
                      onClick={handleProceedOrder}
                      disabled={totalItemsCount === 0}
                    >
                      주문 진행하기
                    </button>
                    <button 
                      className="btn-proceed-estimate"
                      onClick={handleProceedEstimate}
                      disabled={totalItemsCount === 0}
                    >
                      견적 요청하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
