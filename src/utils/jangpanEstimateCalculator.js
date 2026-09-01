/**
 * 동경바닥재 장판 자동 견적 계산 서비스 (Calculation Engine)
 * 
 * 1. 자재비 + 구간별 기본인건비 (Method A)
 * 2. 평수 × 시공포함 단가 (Method B)
 * 
 * 두 금액을 dynamic하게 연산하고, Math.max(A, B)를 통해 매출에 더 유리한 견적방식을 자동 선택합니다.
 * 하드코딩된 전환 평수(if area >= 20)를 사용하지 않고 순수 금액 비교 방식으로 작동합니다.
 */

import { JANGPAN_PRODUCTS_CONFIG, JANGPAN_ACCESSORIES_CONFIG } from '../config/jangpanQuoteConfig.js';

/**
 * ID, 이름, 두께 파라미터로 장판 설정 데이터 조회
 */
export function getJangpanProduct(query) {
  if (!query) return JANGPAN_PRODUCTS_CONFIG[0];
  
  if (typeof query === 'object') {
    if (query.id) return JANGPAN_PRODUCTS_CONFIG.find(p => p.id === query.id) || query;
    return query;
  }

  const norm = String(query).trim().toLowerCase();
  const found = JANGPAN_PRODUCTS_CONFIG.find(
    p => p.id.toLowerCase() === norm ||
         p.thickness.toLowerCase() === norm ||
         p.name.toLowerCase() === norm ||
         `${p.name} ${p.thickness}`.toLowerCase().replace(/\s+/g, '') === norm.replace(/\s+/g, '')
  );

  return found || JANGPAN_PRODUCTS_CONFIG[0];
}

/**
 * 장판 견적 연산 메인 함수
 * 
 * @param {Object} params
 * @param {string|Object} params.product - 장판 ID, 두께, 또는 제품 설정 객체
 * @param {number} params.areaPyeong - 시공 평수
 * @param {Object} [params.accessoriesMap] - 부자재 수량 맵 { 'acc-nonslip': 3, ... }
 * @returns {Object} 견적 결과 객체
 */
export function calculateJangpanQuote({ product: productParam, areaPyeong, accessoriesMap = {} }) {
  const product = getJangpanProduct(productParam);
  const pyeong = Math.max(1, Number(areaPyeong) || 1);

  // 1. 자재 m 계산: 평수 × 1.8
  const rawMeters = pyeong * 1.8;
  const materialMeters = Math.round(rawMeters * 100) / 100; // 소수점 2자리

  // 2. 자재비: 평수 × 1.8 × m당 자재비
  const materialTotal = Math.round(materialMeters * product.materialPricePerMeter);

  // 3. 구간별 기본인건비 결정
  let laborBracketLabel = "";
  let laborAmount = 0;

  if (pyeong <= 10) {
    laborAmount = product.laborBrackets.upTo10;
    laborBracketLabel = "1~10평 기본인건비";
  } else if (pyeong <= 15) {
    laborAmount = product.laborBrackets.upTo15;
    laborBracketLabel = "11~15평 기본인건비";
  } else {
    laborAmount = product.laborBrackets.over15;
    laborBracketLabel = "16평 이상 기본인건비";
  }

  // 4. 방식 A: 자재비 + 기본인건비
  const methodATotal = materialTotal + laborAmount;
  const methodA = {
    key: "material_labor",
    name: "자재비 + 기본인건비",
    materialTotal,
    laborAmount,
    laborBracketLabel,
    total: methodATotal
  };

  // 5. 방식 B: 시공포함가 (평수 × 시공포함 단가)
  const methodBTotal = Math.round(pyeong * product.installedPricePerPyeong);
  const methodB = {
    key: "installed",
    name: "시공포함가",
    unitPrice: product.installedPricePerPyeong,
    total: methodBTotal
  };

  // 6. 자동 견적 선택 로직 (Math.max(A, B))
  // A와 B 중 더 높은 매출 금액 방식을 자동 적용
  const selectedMethodKey = methodATotal >= methodBTotal ? "material_labor" : "installed";
  const selectedBaseTotal = Math.max(methodATotal, methodBTotal);
  const selectedMethodLabel = selectedMethodKey === "installed" ? "시공포함가" : "자재비 + 기본인건비";

  // 7. 부자재 계산 (선택된 방식에 따라 단가 유동 적용)
  const calculatedAccessories = JANGPAN_ACCESSORIES_CONFIG.map(acc => {
    const qty = Math.max(0, parseInt(accessoriesMap[acc.id] || 0) || 0);
    // 방식이 시공포함일 경우 시공포함 단가(5,000원), 자재+인건비일 경우 자재단가(3,000원)
    const unitPrice = selectedMethodKey === "installed" ? acc.installedPrice : acc.materialPrice;
    const amount = qty * unitPrice;

    return {
      id: acc.id,
      name: acc.name,
      unit: acc.unit,
      quantity: qty,
      unitPrice,
      amount,
      description: acc.description
    };
  });

  const selectedAccessories = calculatedAccessories.filter(a => a.quantity > 0);
  const accessoriesTotal = calculatedAccessories.reduce((sum, a) => sum + a.amount, 0);

  // 8. 견적 합계 및 VAT 처리
  // 동경바닥재 사이트 정책 기준 total (공급액 기준)
  const grandTotal = selectedBaseTotal + accessoriesTotal;
  const subtotal = grandTotal;
  const supplyAmount = Math.round(grandTotal / 1.1);
  const vat = grandTotal - supplyAmount;

  // 9. ERP 견적서 형태 상세 품목 항목 (quoteItems)
  const quoteItems = [];

  if (selectedMethodKey === "material_labor") {
    // 자재 품목
    quoteItems.push({
      id: `item-material-${product.id}`,
      name: `${product.name} ${product.thickness}`,
      unit: "m",
      quantity: materialMeters,
      unitPrice: product.materialPricePerMeter,
      amount: materialTotal,
      note: "자재비"
    });
    // 인건비 품목
    quoteItems.push({
      id: `item-labor-${product.id}`,
      name: "시공비",
      unit: "식",
      quantity: 1,
      unitPrice: laborAmount,
      amount: laborAmount,
      note: laborBracketLabel
    });
  } else {
    // 시공포함가 품목
    quoteItems.push({
      id: `item-installed-${product.id}`,
      name: `${product.name} ${product.thickness} (시공포함)`,
      unit: "평",
      quantity: pyeong,
      unitPrice: product.installedPricePerPyeong,
      amount: methodBTotal,
      note: "시공포함가 적용"
    });
  }

  // 부자재 품목 추가
  selectedAccessories.forEach(acc => {
    quoteItems.push({
      id: `item-acc-${acc.id}`,
      name: acc.name,
      unit: acc.unit,
      quantity: acc.quantity,
      unitPrice: acc.unitPrice,
      amount: acc.amount,
      note: selectedMethodKey === "installed" ? "시공포함 부자재" : "자재 부자재"
    });
  });

  return {
    product,
    areaPyeong: pyeong,
    materialMeters,
    laborBracketLabel,
    laborAmount,
    methodA,
    methodB,
    selectedMethodKey,
    selectedMethodLabel,
    selectedBaseTotal,
    accessories: calculatedAccessories,
    selectedAccessories,
    accessoriesTotal,
    subtotal,
    supplyAmount,
    vat,
    grandTotal,
    quoteItems
  };
}
