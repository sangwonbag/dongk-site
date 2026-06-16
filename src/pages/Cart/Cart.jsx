import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { useEstimateCart } from "../../contexts/EstimateCartContext";
import { useAuth } from "../../contexts/AuthContext";
import { Trash2, Plus, Minus } from "lucide-react";
import "../Estimate/EstimateRequest.css";

export default function Cart() {
  const nav = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useEstimateCart();
  const { user: currentUser, openLoginModal } = useAuth();

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  };

  return (
    <MainLayout>
      <div className="est-page" style={{ maxWidth: 800, margin: "0 auto", padding: "40px 16px" }}>
        <div className="est-header">
          <h1>장바구니</h1>
          <p>견적을 요청하실 자재 목록을 확인하고 수정하실 수 있습니다.</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart-msg" style={{ padding: "80px 20px", background: "#fbfbfa", borderRadius: "12px", border: "1px solid #e8e2d8", textAlign: "center" }}>
            <p style={{ fontSize: "1.1rem", color: "#666", marginBottom: "20px" }}>장바구니에 담긴 자재가 없습니다.</p>
            <button
              onClick={() => nav("/materials")}
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                border: "1px solid #111",
                background: "#111",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              자재 둘러보기
            </button>
          </div>
        ) : (
          <div className="est-form" style={{ padding: "30px", border: "1px solid #e8e2d8", borderRadius: "12px" }}>
            <div className="section-header-row">
              <h3>선택된 자재 ({cartItems.length})</h3>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={clearCart}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  color: "#666"
                }}
              >
                장바구니 비우기
              </button>
            </div>

             <div className="est-items" style={{ marginTop: "20px" }}>
              {cartItems.map((item) => (
                <div key={item.id} className="est-item-card" style={{ position: "relative" }}>
                  <div className="est-item-info">
                    <span className="item-brand-label" style={{ fontSize: "0.85rem", color: "#888", fontWeight: "600", display: "block" }}>[{item.brand}]</span>
                    <strong style={{ fontSize: "1.05rem", display: "block", margin: "4px 0" }}>{item.name}</strong>
                    <div className="item-spec-details" style={{ fontSize: "0.85rem", color: "#666", marginTop: "4px" }}>
                      <span style={{ marginRight: "12px" }}>코드: {item.code || "-"}</span>
                      <span>규격: {item.specs?.size || item.specs?.thickness || item.spec || "표준규격"}</span>
                    </div>
                  </div>
                  <div className="est-item-qty">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                    />
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="est-item-price-info" style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "120px", textAlign: "right" }}>
                    <div style={{ fontSize: "0.85rem", color: "#777" }}>
                      단가: {item.price ? `${item.price.toLocaleString()}원` : "가격문의"}
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: "bold", color: "#111" }}>
                      합계: {item.price ? `${(item.price * item.quantity).toLocaleString()}원` : "상담 후 안내"}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-delete-item"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              <div className="est-subtotal">
                <span>자재 합계 (단가 없는 항목 제외)</span>
                <strong>{calculateSubtotal().toLocaleString()}원</strong>
              </div>
            </div>

            <div className="est-actions" style={{ marginTop: "30px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => nav("/materials")}
                style={{
                  flex: 1,
                  minWidth: "120px",
                  padding: "16px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                  color: "#333"
                }}
              >
                자재 추가하기
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  if (!currentUser) {
                    openLoginModal();
                    return;
                  }
                  nav("/estimate/request");
                }}
                style={{
                  flex: 1.2,
                  minWidth: "150px",
                  padding: "16px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  border: "1px solid #111",
                  background: "#fff",
                  cursor: "pointer",
                  color: "#111"
                }}
              >
                견적요청서 작성하기
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  if (!currentUser) {
                    openLoginModal();
                    return;
                  }
                  nav("/checkout");
                }}
                style={{
                  flex: 1.2,
                  minWidth: "150px",
                  padding: "16px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  border: "none",
                  background: "#111",
                  cursor: "pointer",
                  color: "#fff"
                }}
              >
                주문하기
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
