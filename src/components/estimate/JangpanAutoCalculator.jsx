import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  CheckCircle2, 
  ShoppingCart, 
  Send, 
  Printer, 
  Plus, 
  Minus, 
  Sparkles,
  Info,
  ChevronRight,
  Layers
} from 'lucide-react';
import { JANGPAN_PRODUCTS_CONFIG, JANGPAN_ACCESSORIES_CONFIG } from '../../config/jangpanQuoteConfig';
import { calculateJangpanQuote, getJangpanProduct } from '../../utils/jangpanEstimateCalculator';
import { useEstimateCart } from '../../contexts/EstimateCartContext';
import './JangpanAutoCalculator.css';

export default function JangpanAutoCalculator({ onSelectForInquiry, initialThickness = '1.8T' }) {
  const { addToCart } = useEstimateCart();

  // State
  const [selectedProductId, setSelectedProductId] = useState(() => {
    const matched = getJangpanProduct(initialThickness);
    return matched ? matched.id : JANGPAN_PRODUCTS_CONFIG[0].id;
  });
  const [pyeongInput, setPyeongInput] = useState(20);
  const [accessoriesMap, setAccessoriesMap] = useState({
    'acc-nonslip': 0,
    'acc-suji': 0,
    'acc-silicone': 0
  });

  const [addedToast, setAddedToast] = useState(false);

  // Selected product object
  const selectedProduct = useMemo(() => {
    return JANGPAN_PRODUCTS_CONFIG.find(p => p.id === selectedProductId) || JANGPAN_PRODUCTS_CONFIG[0];
  }, [selectedProductId]);

  // Main calculation result
  const quoteResult = useMemo(() => {
    return calculateJangpanQuote({
      product: selectedProduct,
      areaPyeong: pyeongInput,
      accessoriesMap
    });
  }, [selectedProduct, pyeongInput, accessoriesMap]);

  // Handlers for accessories stepper
  const handleAccChange = (accId, delta) => {
    setAccessoriesMap(prev => {
      const current = prev[accId] || 0;
      const nextVal = Math.max(0, current + delta);
      return { ...prev, [accId]: nextVal };
    });
  };

  const handleAccInputDirect = (accId, val) => {
    const parsed = parseInt(val, 10);
    const nextVal = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setAccessoriesMap(prev => ({ ...prev, [accId]: nextVal }));
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (!quoteResult || !quoteResult.quoteItems) return;

    // Add main items and accessories to cart
    quoteResult.quoteItems.forEach((item, idx) => {
      addToCart({
        id: `est-jangpan-${Date.now()}-${idx}`,
        name: item.name,
        brand: selectedProduct.brand,
        category: selectedProduct.category,
        code: `EST-${selectedProduct.thickness}-${quoteResult.areaPyeong}PY`,
        price: item.unitPrice,
        quantity: item.quantity,
        selectedSize: item.unit === 'm' ? `${item.quantity}m` : (item.unit === '평' ? `${item.quantity}평` : item.unit),
        unit: item.unit,
        note: item.note
      });
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  // Submit to estimate inquiry handler
  const handleProceedInquiry = () => {
    if (onSelectForInquiry) {
      onSelectForInquiry(quoteResult);
    }
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="jangpan-auto-calculator">
      {/* Toast alert */}
      {addedToast && (
        <div className="jangpan-toast-banner">
          <CheckCircle2 size={20} />
          <span>견적 항목이 장바구니에 담겼습니다!</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="calc-header-card">
        <div className="calc-header-title-row">
          <div className="calc-badge">
            <Sparkles size={16} />
            <span>동경바닥재 스마트 견적</span>
          </div>
          <h2>장판 자동 견적계산기</h2>
        </div>
        <p className="calc-header-desc">
          시공 평수와 장판 두께를 선택하시면 <strong>자재비+인건비</strong> 및 <strong>시공포함가</strong>를 실시간 비교하여 가장 적합한 최종 견적을 자동으로 산출해 드립니다.
        </p>
      </div>

      <div className="calc-body-grid">
        {/* ================= LEFT: INPUT FORM ================= */}
        <div className="calc-input-section">
          {/* STEP 1: Product Selection */}
          <div className="input-group-box">
            <label className="section-label">
              <span className="step-num">1</span>
              <span>장판 제품 / 두께 선택</span>
            </label>
            <div className="thickness-cards-grid">
              {JANGPAN_PRODUCTS_CONFIG.map(p => {
                const isSelected = p.id === selectedProductId;
                return (
                  <div
                    key={p.id}
                    className={`thickness-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedProductId(p.id)}
                  >
                    <div className="card-top">
                      <span className="thick-badge">{p.thickness}</span>
                      <span className="brand-tag">{p.brand}</span>
                    </div>
                    <div className="prod-name">{p.name}</div>
                    <div className="price-info-row">
                      <span>자재 {p.materialPricePerMeter.toLocaleString()}원/m</span>
                      <span className="sep">|</span>
                      <span>시공포함 {p.installedPricePerPyeong.toLocaleString()}원/평</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Pyeong Input */}
          <div className="input-group-box">
            <label className="section-label">
              <span className="step-num">2</span>
              <span>시공 평수 입력</span>
            </label>
            <div className="pyeong-input-row">
              <div className="pyeong-field-wrapper">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={pyeongInput}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (isNaN(v)) setPyeongInput('');
                    else setPyeongInput(v);
                  }}
                  onBlur={() => {
                    if (!pyeongInput || pyeongInput <= 0) setPyeongInput(1);
                  }}
                  placeholder="예: 20"
                />
                <span className="unit-label">평</span>
              </div>
              <div className="quick-pyeong-buttons">
                {[10, 15, 20, 24, 30, 34].map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`btn-quick-p ${pyeongInput === p ? 'active' : ''}`}
                    onClick={() => setPyeongInput(p)}
                  >
                    {p}평
                  </button>
                ))}
              </div>
            </div>
            <div className="calc-formula-note">
              <Info size={14} />
              <span>장판 필요 자재량: {quoteResult.areaPyeong}평 × 1.8 = <strong>{quoteResult.materialMeters}m</strong> (실소요 수량)</span>
            </div>
          </div>

          {/* STEP 3: Accessories */}
          <div className="input-group-box">
            <label className="section-label">
              <span className="step-num">3</span>
              <span>추가 부자재 선택 (선택사항)</span>
            </label>
            <div className="accessories-list">
              {JANGPAN_ACCESSORIES_CONFIG.map(acc => {
                const qty = accessoriesMap[acc.id] || 0;
                // Unit price dynamically matches selected method
                const unitPrice = quoteResult.selectedMethodKey === 'installed' ? acc.installedPrice : acc.materialPrice;
                return (
                  <div key={acc.id} className="acc-item-row">
                    <div className="acc-info">
                      <div className="acc-title">{acc.name}</div>
                      <div className="acc-price-sub">
                        단가: {unitPrice.toLocaleString()}원 / {acc.unit} ({quoteResult.selectedMethodKey === 'installed' ? '시공포함가 적용' : '자재단가 적용'})
                      </div>
                    </div>
                    <div className="stepper-control">
                      <button
                        type="button"
                        onClick={() => handleAccChange(acc.id, -1)}
                        disabled={qty <= 0}
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={qty}
                        onChange={(e) => handleAccInputDirect(acc.id, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => handleAccChange(acc.id, 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= RIGHT: RESULT & COMPARISON ================= */}
        <div className="calc-result-section printable-area">
          {/* Comparison Cards Header */}
          <div className="result-card-header">
            <h3>방식별 실시간 견적 비교</h3>
            <div className="method-tag-badge">
              <Sparkles size={14} />
              <span>적용: {quoteResult.selectedMethodLabel}</span>
            </div>
          </div>

          <div className="method-comparison-grid">
            {/* Method A Box */}
            <div className={`method-box ${quoteResult.selectedMethodKey === 'material_labor' ? 'winner' : ''}`}>
              <div className="method-head">
                <span className="m-name">방식 A: 자재비 + 기본인건비</span>
                {quoteResult.selectedMethodKey === 'material_labor' && <span className="winner-pill">최종 선택</span>}
              </div>
              <div className="method-body">
                <div className="m-row">
                  <span>자재비 ({quoteResult.materialMeters}m)</span>
                  <span>{quoteResult.methodA.materialTotal.toLocaleString()}원</span>
                </div>
                <div className="m-row">
                  <span>인건비 ({quoteResult.methodA.laborBracketLabel})</span>
                  <span>{quoteResult.methodA.laborAmount.toLocaleString()}원</span>
                </div>
                <div className="m-total-row">
                  <span>소계</span>
                  <strong>{quoteResult.methodA.total.toLocaleString()}원</strong>
                </div>
              </div>
            </div>

            {/* Method B Box */}
            <div className={`method-box ${quoteResult.selectedMethodKey === 'installed' ? 'winner' : ''}`}>
              <div className="method-head">
                <span className="m-name">방식 B: 시공포함가</span>
                {quoteResult.selectedMethodKey === 'installed' && <span className="winner-pill">최종 선택</span>}
              </div>
              <div className="method-body">
                <div className="m-row">
                  <span>시공포함 단가</span>
                  <span>{quoteResult.product.installedPricePerPyeong.toLocaleString()}원/평</span>
                </div>
                <div className="m-row">
                  <span>시공 평수</span>
                  <span>{quoteResult.areaPyeong}평</span>
                </div>
                <div className="m-total-row">
                  <span>소계</span>
                  <strong>{quoteResult.methodB.total.toLocaleString()}원</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ERP Quote Table */}
          <div className="erp-quote-container">
            <div className="erp-table-title">상세 견적서 (ERP 명세서)</div>
            <div className="table-responsive">
              <table className="erp-quote-table">
                <thead>
                  <tr>
                    <th style={{ width: '32%' }}>상품명</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>단위</th>
                    <th style={{ width: '12%', textAlign: 'right' }}>수량</th>
                    <th style={{ width: '18%', textAlign: 'right' }}>단가</th>
                    <th style={{ width: '18%', textAlign: 'right' }}>금액</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>비고</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteResult.quoteItems.map((item, index) => (
                    <tr key={item.id || index}>
                      <td className="font-medium">{item.name}</td>
                      <td style={{ textAlign: 'center' }}>{item.unit}</td>
                      <td style={{ textAlign: 'right' }}>{typeof item.quantity === 'number' ? item.quantity.toLocaleString() : item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{item.unitPrice ? item.unitPrice.toLocaleString() + '원' : '-'}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>{item.amount.toLocaleString()}원</td>
                      <td style={{ textAlign: 'center', fontSize: '11px', color: '#666' }}>{item.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="erp-financial-summary">
              <div className="fin-row">
                <span>공급가액</span>
                <span>{quoteResult.supplyAmount.toLocaleString()}원</span>
              </div>
              <div className="fin-row">
                <span>부가세 (VAT)</span>
                <span>{quoteResult.vat.toLocaleString()}원</span>
              </div>
              <div className="fin-row grand-total-row">
                <span>총 견적금액</span>
                <strong className="grand-price">{quoteResult.grandTotal.toLocaleString()}원</strong>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="calc-action-buttons no-print">
            <button
              type="button"
              className="btn-calc-cart"
              onClick={handleAddToCart}
            >
              <ShoppingCart size={18} />
              <span>장바구니 담기</span>
            </button>
            <button
              type="button"
              className="btn-calc-submit"
              onClick={handleProceedInquiry}
            >
              <Send size={18} />
              <span>견적 상담 접수하기</span>
            </button>
            <button
              type="button"
              className="btn-calc-print"
              onClick={handlePrint}
            >
              <Printer size={18} />
              <span>인쇄 / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
