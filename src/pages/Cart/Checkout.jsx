import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { useEstimateCart } from "../../contexts/EstimateCartContext";
import { useAuth } from "../../contexts/AuthContext";
import { createOrder } from "../../services/orderService";
import { sendOrderNotification } from "../../services/notificationService";
import { OFFICE_ADDRESS, OFFICE_PHONE } from "../../constants/contact";
import { fetchAllProducts } from "../../utils/supabaseFetcher";
import { formatFlooringProductName } from "../../utils/brandUtils";
import { ImagePlaceholder } from "../../components/ui";
import { getProductPyeong, calculateDecorTilePyeong } from "../../utils/shippingUtils";
import { isDecoTile } from "../../utils/decotileUtils";
import "./Checkout.css";

const DELIVERY_TIME_OPTIONS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
  "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00"
];

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    cartItems: globalCartItems, 
    clearCart, 
    getPendingDirectOrder, 
    removePendingDirectOrder,
    addToCart,
    removeFromCart,
    updateQuantity
  } = useEstimateCart();
  const { user, openLoginModal } = useAuth();

  const hasAutoOpened = useRef(false);

  // 바로구매용 임시 품목 상태 결정
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isDirectOrder, setIsDirectOrder] = useState(false);

  // 주문자 입력 정보
  const [customer, setCustomer] = useState({
    name: "",
    company_name: "",
    phone: "",
    email: "",
    address: "",
    address_detail: "",
    delivery_date: "",
    delivery_time: "",
    memo: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("무통장입금"); // 무통장입금 | 전화확인
  const [hasElevator, setHasElevator] = useState("yes"); // yes | no
  const [needCarry, setNeedCarry] = useState("no"); // yes | no
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);

  // --- 현장 배송 방식 및 부자재 추가 상태 ---
  const CARGO_BRANCHES = [
    { name: "대신화물 하남지점", address: "경기 하남시 서하남로 42", phone: "02-421-2321" },
    { name: "대신화물 성남지점", address: "경기 성남시 중원구 둔촌대로 100", phone: "031-744-1212" },
    { name: "대신화물 남양주지점", address: "경기 남양주시 일패동 15", phone: "031-591-3211" },
    { name: "대신화물 일산지점", address: "경기 고양시 일산동구 99", phone: "031-901-2211" },
    { name: "대신화물 인천지점", address: "인천 서구 백범로 200", phone: "032-581-9988" },
    { name: "대신화물 부산사상지점", address: "부산 사상구 대동로 300", phone: "051-311-8844" },
    { name: "대신화물 대구서구지점", address: "대구 서구 와룡로 500", phone: "053-561-3311" },
    { name: "대신화물 대전대덕지점", address: "대전 대덕구 대화로 12", phone: "042-622-1212" },
    { name: "대신화물 광주서구지점", address: "광주 서구 무진대로 23", phone: "062-361-9988" }
  ];

  const [allDbProducts, setAllDbProducts] = useState([]);
  const [showAllAccessories, setShowAllAccessories] = useState(false);
  const [accessoryQuantities, setAccessoryQuantities] = useState({});
  
  // sessionStorage-backed states for persistence on refresh
  const [deliveryMethod, setDeliveryMethod] = useState(() => {
    return sessionStorage.getItem("checkout_delivery_method") || "cargo";
  });
  const [freightBranch, setFreightBranch] = useState(() => {
    const saved = sessionStorage.getItem("checkout_freight_branch");
    return saved ? JSON.parse(saved) : { name: "", address: "", phone: "" };
  });
  const [customAccessories, setCustomAccessories] = useState(() => {
    const saved = sessionStorage.getItem("checkout_custom_accessories");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchSearch, setBranchSearch] = useState("");

  // Sync sessionStorage whenever state changes
  useEffect(() => {
    sessionStorage.setItem("checkout_delivery_method", deliveryMethod);
  }, [deliveryMethod]);

  useEffect(() => {
    sessionStorage.setItem("checkout_freight_branch", JSON.stringify(freightBranch));
  }, [freightBranch]);

  useEffect(() => {
    sessionStorage.setItem("checkout_custom_accessories", JSON.stringify(customAccessories));
  }, [customAccessories]);

  // DB 부자재 상품 실시간 검색 적재
  useEffect(() => {
    async function loadDb() {
      try {
        const prod = await fetchAllProducts();
        setAllDbProducts(prod || []);
      } catch (e) {
        console.warn("DB products load failed, falling back to local search:", e);
      }
    }
    loadDb();
  }, []);

  const decotilePyeong = calculateDecorTilePyeong(checkoutItems);
  const freeShippingInfo = useMemo(() => {
    return {
      eligible: decotilePyeong >= 50,
      eligibleBrand: "데코타일",
      eligibleArea: decotilePyeong
    };
  }, [decotilePyeong]);

  // 무료배송 자격 변경 시 자동 배송 방식 전환
  useEffect(() => {
    if (freeShippingInfo.eligible) {
      // If free shipping eligible, set to free shipping if not already set to custom options
      const current = sessionStorage.getItem("checkout_delivery_method");
      if (!current || current === "cargo") {
        setDeliveryMethod("free_shipping");
      }
    } else {
      if (deliveryMethod === "free_shipping") {
        setDeliveryMethod("cargo");
      }
    }
  }, [freeShippingInfo.eligible, deliveryMethod]);

  // 2. 부자재 목록 및 동적 매칭 유틸리티
  const allAccessories = useMemo(() => {
    return allDbProducts.filter(p => {
      const catName = p.category || (p.categories && p.categories.name) || "";
      return catName === "부자재" && p.active;
    }).sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999));
  }, [allDbProducts]);

  const recommendedAccessories = useMemo(() => {
    const hasDeco = checkoutItems.some(item => item.category === "데코타일");
    const hasJangpan = checkoutItems.some(item => item.category === "장판");
    const hasCarpet = checkoutItems.some(item => item.category === "카페트타일");

    const recommendedSlugs = new Set();

    if (hasDeco || hasJangpan) {
      recommendedSlugs.add('sub-bond-10kg');
      recommendedSlugs.add('sub-bond-4kg');
      recommendedSlugs.add('sub-bond-2kg');
      recommendedSlugs.add('sub-silicone-translucent');
      recommendedSlugs.add('sub-thin-separator');
      recommendedSlugs.add('sub-straight-separator');
      recommendedSlugs.add('sub-l-separator');
    }

    if (hasCarpet) {
      recommendedSlugs.add('sub-bond-10kg');
      recommendedSlugs.add('sub-bond-4kg');
      recommendedSlugs.add('sub-bond-2kg');
      recommendedSlugs.add('sub-carpet-separator');
    }

    return allAccessories.filter(p => recommendedSlugs.has(p.id));
  }, [allAccessories, checkoutItems]);

  const handleUpdateAccessoryQty = (id, newQty, inCart) => {
    if (newQty < 1) return;
    
    if (inCart) {
      if (isDirectOrder) {
        setCheckoutItems(prev => prev.map(item => 
          (item.id === id || item.product_id === id)
            ? { ...item, quantity: newQty, amount: (item.price || item.unit_price) * newQty }
            : item
        ));
      } else {
        updateQuantity(id, newQty);
      }
    } else {
      setAccessoryQuantities(prev => ({ ...prev, [id]: newQty }));
    }
  };

  const handleToggleAccessory = (product, qty, inCart) => {
    if (inCart) {
      if (isDirectOrder) {
        setCheckoutItems(prev => prev.filter(item => item.id !== product.id && item.product_id !== product.id));
      } else {
        removeFromCart(product.id);
      }
    } else {
      const price = parsePrice(product.price);
      const itemToAdd = {
        id: product.id,
        product_id: product.product_id,
        productId: product.product_id,
        thumbnail: product.image_url || product.image || "/images/no-image.svg",
        image: product.image_url || product.image || "/images/no-image.svg",
        brand: product.brand?.name || product.brand || "부자재",
        category: product.category?.name || product.category || "부자재",
        line: "부자재",
        name: product.name,
        product_name: product.name,
        code: product.product_code || product.code,
        product_code: product.product_code || product.code,
        spec: "표준규격",
        packing: product.unit || "개",
        price: price,
        unit_price: price,
        unit: product.unit || "개",
        quantity: qty,
        amount: price * qty
      };
      
      if (isDirectOrder) {
        setCheckoutItems(prev => [...prev, itemToAdd]);
      } else {
        addToCart(itemToAdd);
        updateQuantity(product.id, qty);
      }
    }
  };

  // Helper to parse price string/number cleanly
  const parsePrice = (priceVal) => {
    if (priceVal === undefined || priceVal === null) return 0;
    if (typeof priceVal === 'number') return priceVal;
    
    const cleanStr = String(priceVal).replace(/[^0-9]/g, "");
    const parsed = parseInt(cleanStr, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // 1. Initialize and sync checkout items
  useEffect(() => {
    if (loading || isOrderSuccess) return;
    const pendingDirect = (location.state?.buyNowItem || location.state?.directOrderItem) 
      ? (location.state.buyNowItem || location.state.directOrderItem)
      : getPendingDirectOrder();
    let targetItems = [];
    let isDirect = false;

    if (location.state?.purchaseMode === "buyNow" || location.state?.isDirect || pendingDirect) {
      if (pendingDirect) {
        targetItems = Array.isArray(pendingDirect) ? pendingDirect : [pendingDirect];
        isDirect = true;
      }
    }
    
    if (!isDirect) {
      targetItems = globalCartItems;
      isDirect = false;
    }

    // 주문 대상 품목이 없다면 리다이렉트
    if (!targetItems || targetItems.length === 0) {
      alert("주문할 대상 상품이 없습니다.");
      navigate("/cart");
      return;
    }

    // 가격 확인 필요 상품 검사 및 차단
    const hasUnpriced = targetItems.some(item => {
      const price = parsePrice(item.price || item.unit_price);
      return price <= 0;
    });

    if (hasUnpriced) {
      alert("장바구니에 가격 확인이 필요한 자재가 포함되어 있어 주문 진행이 불가합니다.\n해당 상품을 제외하시거나 견적 요청을 진행해 주세요.");
      navigate("/cart");
      return;
    }

    setCheckoutItems(targetItems);
    setIsDirectOrder(isDirect);

    // 로그인하지 않은 사용자라면 로그인 모달 유도
    if (!user) {
      if (!hasAutoOpened.current) {
        hasAutoOpened.current = true;
        openLoginModal();
      }
    }
  }, [globalCartItems, navigate, openLoginModal, location.state, getPendingDirectOrder, isOrderSuccess, loading, user]);

  // 2. Auto-populate customer info only once when user loaded to prevent reset on cart updates
  const hasPopulatedCustomer = useRef(false);
  useEffect(() => {
    if (user && !hasPopulatedCustomer.current && !loading && !isOrderSuccess) {
      setCustomer({
        name: user.name || "",
        company_name: user.company_name || "",
        phone: user.phone || "",
        email: user.email || "",
        address: user.address || "",
        address_detail: user.address_detail || "",
        delivery_date: "",
        delivery_time: "",
        memo: "",
      });
      hasPopulatedCustomer.current = true;
    }
  }, [user, loading, isOrderSuccess]);

  const [showPostcodeLayer, setShowPostcodeLayer] = useState(false);
  const postcodeContainerRef = useRef(null);

  const handleAddressSearch = () => {
    if (window.kakao?.Postcode) {
      setShowPostcodeLayer(true);
      return;
    }

    const scriptId = "kakao-postcode-script";
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.async = true;
      script.onload = () => {
        if (window.kakao?.Postcode) {
          setShowPostcodeLayer(true);
        } else {
          alert("주소검색 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
        }
      };
      script.onerror = () => {
        alert("주소검색 서비스를 불러오는 중 오류가 발생했습니다.");
      };
      document.body.appendChild(script);
    } else {
      if (window.kakao?.Postcode) {
        setShowPostcodeLayer(true);
      } else {
        script.addEventListener("load", () => {
          if (window.kakao?.Postcode) {
            setShowPostcodeLayer(true);
          }
        });
      }
    }
  };

  useEffect(() => {
    if (!showPostcodeLayer || !postcodeContainerRef.current) return;

    const kakao = window.kakao;
    new kakao.Postcode({
      oncomplete: function (data) {
        const fullAddress =
          data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;

        setCustomer((prev) => ({
          ...prev,
          address: `(${data.zonecode}) ${fullAddress}`,
          address_detail: "",
        }));

        setShowPostcodeLayer(false);

        setTimeout(() => {
          document.getElementById("customer_address_detail")?.focus();
        }, 50);
      },
      width: "100%",
      height: "100%",
    }).embed(postcodeContainerRef.current);
  }, [showPostcodeLayer]);

  // 총액 자동 계산
  const getItemUnitPrice = (item, qty) => {
    const basePrice = parsePrice(item.price || item.unit_price);
    const brand = item.brand || "";
    const name = item.name || "";
    const line = item.line || "";
    const spec = item.spec || (item.specs && item.specs.size) || "";
    const isSeoulCozyNarrow = brand === '서울' && (line.includes('소폭') || name.includes('소폭') || spec.includes('53'));
    if (isSeoulCozyNarrow && qty >= 10) {
      return 73000;
    }
    return basePrice;
  };

  const calculateTotal = () => {
    return checkoutItems.reduce((sum, item) => {
      const qty = Math.max(1, parseInt(item.quantity) || 1);
      const price = getItemUnitPrice(item, qty);
      return sum + (price * qty);
    }, 0);
  };

  const totalTypesCount = checkoutItems.length;

  const totalQuantitySum = checkoutItems.reduce((sum, item) => {
    return sum + (parseInt(item.quantity) || 1);
  }, 0);

  // 주문 실행
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg("");

    // 로그인 여부 검사
    if (!user) {
      openLoginModal();
      return;
    }

    // 필수값 검사
    if (!customer.name.trim()) {
      setErrorMsg("받는 사람 이름을 입력해주세요.");
      return;
    }
    if (!customer.phone.trim()) {
      setErrorMsg("연락처를 입력해주세요.");
      return;
    }
    if (!customer.address.trim()) {
      setErrorMsg("배송주소를 입력해주세요.");
      return;
    }

    // 희망배송일 지정 시 시간 선택 필수 검사
    if (customer.delivery_date && !customer.delivery_time) {
      setErrorMsg("희망 배송 시간을 선택해주세요.");
      return;
    }

    // 연락처 형식 검사 (최소 10자리 숫자 이상)
    const digitsOnly = customer.phone.replace(/[^0-9]/g, "");
    if (digitsOnly.length < 10) {
      setErrorMsg("연락처는 최소 10자리 이상의 숫자로 입력해 주세요.");
      return;
    }

    // 이메일 유효성 검사 (입력된 경우에만 진행)
    if (customer.email && customer.email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customer.email.trim())) {
        setErrorMsg("올바른 이메일 형식을 입력해 주세요.");
        return;
      }
    }

    // 가격 미정 상품 재검사
    const hasUnpriced = checkoutItems.some(item => {
      const price = parsePrice(item.price || item.unit_price);
      return price <= 0;
    });

    if (hasUnpriced) {
      setErrorMsg("가격 확인이 필요한 자재가 포함되어 있어 주문 진행이 불가합니다.");
      return;
    }

    setLoading(true);
    try {
      // Calculate delivery labels and metadata
      let deliveryLabel = "대신화물 지점 배송";
      let deliveryFee = "별도 안내";
      let deliveryFeeStatus = "unconfirmed";

      if (deliveryMethod === "free_shipping") {
        deliveryLabel = "무료배송";
        deliveryFee = "0원";
        deliveryFeeStatus = "free";
      } else if (deliveryMethod === "quick") {
        deliveryLabel = "퀵 배송";
        deliveryFee = "착불 (거리비례)";
        deliveryFeeStatus = "cod";
      } else if (deliveryMethod === "pickup") {
        deliveryLabel = "직접 수령";
        deliveryFee = "0원";
        deliveryFeeStatus = "free";
      }

      // Check accessory recommendation shown/skipped
      const hasDeco = checkoutItems.some(item => item.category === "데코타일");
      const hasJangpan = checkoutItems.some(item => item.category === "장판");
      const hasWallpaper = checkoutItems.some(item => item.category === "벽지");
      const accShown = (hasDeco || hasJangpan || hasWallpaper);
      const addedAccQty = checkoutItems.filter(item => item.category === "부자재").length;
      const accSkipped = accShown && (addedAccQty === 0 && customAccessories.length === 0);

      // We append requested custom accessories to the final memo
      let customAccText = "";
      if (customAccessories.length > 0) {
        customAccText = `\n[상담요청 부자재] ${customAccessories.join(", ")}`;
      }

      const siteInfo = `[현장정보] 엘리베이터: ${hasElevator === "yes" ? "있음" : "없음"} / 양중(계단운반): ${needCarry === "yes" ? "필요(운임협의)" : "불필요(1층하차)"}`;
      const finalMemo = `${siteInfo}\n[요청사항] ${customer.memo || "없음"}${customAccText}`;

      // Assemble customer payload
      const orderPayloadCustomer = {
        ...customer,
        memo: finalMemo,
        
        // Shipping fields
        delivery_method: deliveryMethod,
        delivery_method_label: deliveryLabel,
        delivery_fee: deliveryFee,
        delivery_fee_status: deliveryFeeStatus,
        shipping_address: `${customer.address} ${customer.address_detail || ""}`.trim(),
        
        // Freight branch details
        freight_branch_name: deliveryMethod === "cargo" ? (freightBranch.name || null) : null,
        freight_branch_address: deliveryMethod === "cargo" ? (freightBranch.address || null) : null,
        freight_branch_phone: deliveryMethod === "cargo" ? (freightBranch.phone || null) : null,

        // Free shipping details
        free_shipping_eligible: freeShippingInfo.eligible,
        free_shipping_brand: freeShippingInfo.eligibleBrand || null,
        free_shipping_area: freeShippingInfo.eligibleArea || 0,

        // Quick / Pickup flags
        quick_delivery_requested: deliveryMethod === "quick",
        office_pickup_requested: deliveryMethod === "pickup",

        // Accessory flags
        accessory_recommendation_shown: accShown,
        accessory_recommendation_skipped: accSkipped
      };

      // 주문 생성 API 호출
      const orderData = await createOrder({
        cartItems: checkoutItems,
        customer: orderPayloadCustomer,
        paymentMethod
      });

      setIsOrderSuccess(true);

      // 장바구니 및 바로구매 임시 정보 초기화
      removePendingDirectOrder();
      try {
        localStorage.removeItem('buyNowItem');
        sessionStorage.removeItem('buyNowItem');
      } catch (e) {
        console.error('Failed to remove buyNowItem', e);
      }

      if (!isDirectOrder) {
        await clearCart({ clearAll: true });
      }

      // Clear session storage values
      sessionStorage.removeItem("checkout_delivery_method");
      sessionStorage.removeItem("checkout_freight_branch");
      sessionStorage.removeItem("checkout_custom_accessories");

      // 비동기 알림 발송
      try {
        const adminNotif = await sendOrderNotification(orderData, "admin");
        if (!adminNotif.success) {
          console.warn("[Checkout Warning] 관리자 주문 접수 알림 전송 실패:", adminNotif.error);
        }
      } catch (notifErr) {
        console.warn("[Checkout Exception] 관리자 주문 접수 알림 전송 중 오류:", notifErr);
      }

      if (customer.email && customer.email.trim() !== "") {
        try {
          const customerNotif = await sendOrderNotification(orderData, "customer");
          if (!customerNotif.success) {
            console.warn("[Checkout Warning] 고객 주문 확인 이메일 전송 실패:", customerNotif.error);
          }
        } catch (notifErr) {
          console.warn("[Checkout Exception] 고객 주문 확인 이메일 전송 중 오류:", notifErr);
        }
      }

      try {
        localStorage.setItem("last_completed_order", JSON.stringify(orderData));
      } catch (storageErr) {
        console.warn("[Checkout Warning] localStorage 저장 실패:", storageErr);
      }
      navigate("/order-complete", { state: { order: orderData }, replace: true });
    } catch (err) {
      console.error("[Checkout Error]", err);
      setErrorMsg(err.message || "주문 처리 중 에러가 발생했습니다. 다시 시도해 주세요.");
      alert(`주문 실패: ${err.message || "서버 오류"}`);
    } finally {
      setLoading(false);
    }
  };

  const getSortedBranches = () => {
    if (!customer.address) return CARGO_BRANCHES;
    
    // Extract words from address
    const addressWords = customer.address.split(/\s+/).map(w => w.replace(/[^가-힣a-zA-Z0-9]/g, ''));
    
    return [...CARGO_BRANCHES].map(branch => {
      let score = 0;
      addressWords.forEach(word => {
        if (word && word.length > 1) {
          if (branch.address.includes(word)) score += 2;
          if (branch.name.includes(word)) score += 1;
        }
      });
      return { ...branch, score };
    }).sort((a, b) => b.score - a.score);
  };

  return (
    <MainLayout>
      <div className="checkout-page-container">
        {/* 주문서 헤더 */}
        <div className="checkout-header">
          {isDirectOrder ? (
            <span className="order-type-badge direct-buy">⚡ 바로구매 주문</span>
          ) : (
            <span className="order-type-badge">📦 장바구니 주문</span>
          )}
          <h1>주문서 작성</h1>
          <p>배송 정보와 요청사항을 확인한 뒤 주문을 접수해주세요.</p>
        </div>

        <form onSubmit={handleOrderSubmit} className="checkout-layout" noValidate>
          {/* 1. 왼쪽: 주문 정보 및 배송지 입력 폼 */}
          <div className="checkout-left-section">
            
            {/* [단계 1] 주문 상품 확인 */}
            <div className="checkout-card">
              <h3>1. 주문 상품 확인</h3>
              <div className="summary-item-list" style={{ maxHeight: 'none', overflowY: 'visible' }}>
                {checkoutItems.map((item) => {
                  const qty = Math.max(1, parseInt(item.quantity) || 1);
                  const price = getItemUnitPrice(item, qty);
                  const hasPrice = price > 0;
                  const itemSpec = item.spec || item.specs?.size || "표준규격";
                  const itemPacking = item.packing || item.specs?.packing || "1박스 단위";

                  return (
                    <div key={item.id} className="summary-item-card">
                      {/* 썸네일 */}
                      <div className="summary-item-thumb-wrapper">
                        <img 
                          className="summary-item-thumb"
                          src={item.thumbnail || item.image || "/images/no-image.svg"} 
                          alt={item.name || item.product_name}
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/no-image.svg"; }}
                        />
                      </div>
                      
                      {/* 사양 */}
                      <div className="summary-item-info">
                        <div className="summary-item-brand-row">
                          {item.brand && <span className="summary-item-brand">{item.brand}</span>}
                          {item.category && <span className="summary-item-category">{item.category}</span>}
                        </div>
                        <span className="summary-item-name">
                          {formatFlooringProductName(item)}
                          {item.selectedSize && ` / ${item.selectedSize}`}
                        </span>
                        <div className="summary-item-details">
                          {item.code && item.code !== "" && <span>코드: {item.code}</span>}
                          <span>규격: {itemSpec}</span>
                          <span>구성: {itemPacking}</span>
                          <span>단가: {hasPrice ? `${price.toLocaleString()}원${item.category === '장판' ? '/m' : ''}` : "가격문의"}</span>
                        </div>
                      </div>

                      {/* 단가 및 소계 */}
                      <div className="summary-item-price-side">
                        <div className="summary-item-price-qty">{qty} {item.category === '장판' ? 'm' : (item.unit || "평")}</div>
                        {hasPrice ? (
                          <div className="summary-item-price-total">
                            ₩{(price * qty).toLocaleString()}원
                          </div>
                        ) : (
                          <div className="summary-item-price-total consult-text">상담 필요</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* [단계 2] 부자재 추천 영역 */}
            {(() => {
              const hasDeco = checkoutItems.some(item => item.category === "데코타일");
              const hasJangpan = checkoutItems.some(item => item.category === "장판");
              const hasWallpaper = checkoutItems.some(item => item.category === "벽지");
              const hasCarpet = checkoutItems.some(item => item.category === "카페트타일");
              const hasMaru = checkoutItems.some(item => item.category === "마루");

              // 마루만 있는 경우에는 부자재 추천 확인 단계를 표시하지 않고 건너뜀
              const onlyMaru = hasMaru && !hasDeco && !hasJangpan && !hasWallpaper && !hasCarpet;
              const hasRecommendation = hasDeco || hasJangpan || hasCarpet;

              if (!hasRecommendation || onlyMaru) return null;

              const accessoriesToDisplay = showAllAccessories ? allAccessories : recommendedAccessories;

              if (accessoriesToDisplay.length === 0) return null;

              return (
                <div className="accessory-recommendation-card">
                  <h3>2. 부자재는 챙기셨나요?</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    시공에 필요한 부자재를 함께 확인하고 주문에 바로 추가해 보세요.
                  </p>

                  <div className="accessory-recommend-list" style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', marginBottom: '20px' }}>
                    {accessoriesToDisplay.map(matched => {
                      const inCart = checkoutItems.some(ci => ci.id === matched.id || ci.product_id === matched.id);
                      const currentQtyInOrder = checkoutItems.find(ci => ci.id === matched.id || ci.product_id === matched.id)?.quantity;
                      const qty = currentQtyInOrder !== undefined ? currentQtyInOrder : (accessoryQuantities[matched.id] || 1);

                      return (
                        <div key={matched.id} className="accessory-item-card" style={{ display: 'flex', flexDirection: 'column', padding: '16px', border: '1px solid #E6E2D8', borderRadius: 'var(--radius-md)', backgroundColor: '#FAF8F2', position: 'relative' }}>
                          {inCart && (
                            <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-showroom-green)', backgroundColor: '#eef8f2', padding: '2px 6px', borderRadius: '4px' }}>
                              추가됨
                            </span>
                          )}
                          <div className="accessory-thumb-box" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '140px', backgroundColor: '#fff', borderRadius: '4px', marginBottom: '12px', overflow: 'hidden' }}>
                            <ImagePlaceholder text="이미지 준비중" subtext="" />
                          </div>
                          <strong className="accessory-item-name" style={{ fontSize: '14.5px', marginBottom: '4px' }}>{matched.name}</strong>
                          <span className="accessory-item-price" style={{ fontSize: '13.5px', color: 'var(--text-light-gray)', marginBottom: '12px' }}>
                            {matched.price?.toLocaleString()}원 / {matched.unit || "개"}
                          </span>

                          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {/* 수량 조절 버튼 */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', border: '1px solid #E6E2D8', borderRadius: '4px', background: '#fff' }}>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>수량</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button 
                                  type="button"
                                  onClick={() => handleUpdateAccessoryQty(matched.id, qty - 1, inCart)}
                                  style={{ width: '24px', height: '24px', border: '1px solid #E6E2D8', background: '#fff', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  -
                                </button>
                                <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '13px', fontWeight: '700' }}>{qty}</span>
                                <button 
                                  type="button"
                                  onClick={() => handleUpdateAccessoryQty(matched.id, qty + 1, inCart)}
                                  style={{ width: '24px', height: '24px', border: '1px solid #E6E2D8', background: '#fff', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* 추가/제거 버튼 */}
                            <button 
                              type="button"
                              className={`btn-add-accessory-db ${inCart ? 'added' : ''}`}
                              onClick={() => handleToggleAccessory(matched, qty, inCart)}
                              style={{
                                width: '100%',
                                padding: '10px',
                                fontSize: '13px',
                                fontWeight: '700',
                                border: '1px solid',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                backgroundColor: inCart ? '#fff' : 'var(--point-orange)',
                                borderColor: inCart ? '#d2c9b6' : 'var(--point-orange)',
                                color: inCart ? '#555' : '#fff',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {inCart ? "제거하기" : "추가하기"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 전체 부자재 보기 토글 */}
                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setShowAllAccessories(!showAllAccessories)}
                      style={{
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        border: '1px solid #E6E2D8',
                        borderRadius: '20px',
                        background: '#FAF8F2',
                        color: '#555',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {showAllAccessories ? "추천 부자재만 보기" : "전체 부자재 보기"}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* [단계 3] 배송 정보 입력 */}
            <div className="checkout-card">
              <h3>3. 배송 정보 입력</h3>
              
              {!user && (
                <div className="non-member-banner">
                  <p>주문 완료를 위해 로그인이 필요합니다.</p>
                  <button 
                    type="button" 
                    className="btn-auth-trigger"
                    onClick={openLoginModal}
                  >
                    로그인 / 회원가입 하기
                  </button>
                </div>
              )}

              <div className="checkout-form-grid">
                <div className="form-group-checkout">
                  <label htmlFor="customer_name">받는 사람 / 주문자명 <span className="req">*</span></label>
                  <input
                    id="customer_name"
                    type="text"
                    placeholder="받는 분 성함 또는 주문자명을 입력해 주세요"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group-checkout">
                  <label htmlFor="customer_company">업체명 <span className="opt">(선택)</span></label>
                  <input
                    id="customer_company"
                    type="text"
                    placeholder="업체명 또는 상호를 입력하세요"
                    value={customer.company_name}
                    onChange={(e) => setCustomer({ ...customer, company_name: e.target.value })}
                  />
                </div>

                <div className="form-group-checkout">
                  <label htmlFor="customer_phone">연락처 <span className="req">*</span></label>
                  <input
                    id="customer_phone"
                    type="tel"
                    placeholder="받는 분 연락처를 입력해 주세요 (숫자 10자리 이상)"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group-checkout">
                  <label htmlFor="customer_email">이메일 <span className="opt">(선택)</span></label>
                  <input
                    id="customer_email"
                    type="email"
                    placeholder="주문 확인용 이메일 주소를 입력해 주세요"
                    value={customer.email || ""}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  />
                </div>

                <div className="form-group-checkout">
                  <label htmlFor="customer_address">배송주소 <span className="req">*</span></label>
                  <div className="checkout-address-search-row">
                    <input
                      id="customer_address"
                      type="text"
                      placeholder="우측 '주소 검색' 버튼을 클릭해 주세요"
                      value={customer.address}
                      onClick={handleAddressSearch}
                      readOnly
                      required
                    />
                    <button 
                      type="button" 
                      className="btn-checkout-address-search"
                      onClick={handleAddressSearch}
                    >
                      주소 검색
                    </button>
                  </div>
                </div>

                <div className="form-group-checkout">
                  <label htmlFor="customer_address_detail">상세주소 <span className="opt">(선택)</span></label>
                  <input
                    id="customer_address_detail"
                    type="text"
                    placeholder="상세 호수 및 상세 정보를 입력해 주세요"
                    value={customer.address_detail}
                    onChange={(e) => setCustomer({ ...customer, address_detail: e.target.value })}
                  />
                </div>

                <div className="form-group-checkout-datetime">
                  <div className="datetime-field">
                    <label htmlFor="customer_delivery_date">희망배송일 <span className="opt">(선택)</span></label>
                    <input
                      id="customer_delivery_date"
                      type="date"
                      value={customer.delivery_date}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setCustomer({ 
                          ...customer, 
                          delivery_date: newDate,
                          delivery_time: newDate ? customer.delivery_time : "" 
                        });
                      }}
                    />
                  </div>
                  <div className="datetime-field">
                    <label htmlFor="customer_delivery_time">희망시간 {customer.delivery_date && <span className="req">*</span>}</label>
                    <select
                      id="customer_delivery_time"
                      value={customer.delivery_time || ""}
                      onChange={(e) => setCustomer({ ...customer, delivery_time: e.target.value })}
                      disabled={!customer.delivery_date}
                    >
                      <option value="">시간 선택</option>
                      {DELIVERY_TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 🏗️ 현장 배송 조건 입력 필드 */}
                <div className="form-group-checkout-radio-row">
                  <div className="radio-field">
                    <label>엘리베이터 유무 <span className="req">*</span></label>
                    <div className="checkout-radio-group">
                      <label className={`checkout-radio-label ${hasElevator === "yes" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="elevator"
                          value="yes"
                          checked={hasElevator === "yes"}
                          onChange={() => setHasElevator("yes")}
                        />
                        <div className="checkout-radio-text-box">
                          <strong>있음</strong>
                          <span>사용 가능</span>
                        </div>
                      </label>
                      <label className={`checkout-radio-label ${hasElevator === "no" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="elevator"
                          value="no"
                          checked={hasElevator === "no"}
                          onChange={() => setHasElevator("no")}
                        />
                        <div className="checkout-radio-text-box">
                          <strong>없음</strong>
                          <span>계단 이동</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="radio-field">
                    <label>양중 작업(계단 운반) <span className="req">*</span></label>
                    <div className="checkout-radio-group">
                      <label className={`checkout-radio-label ${needCarry === "no" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="carry"
                          value="no"
                          checked={needCarry === "no"}
                          onChange={() => setNeedCarry("no")}
                        />
                        <div className="checkout-radio-text-box">
                          <strong>불필요</strong>
                          <span>1층 하차</span>
                        </div>
                      </label>
                      <label className={`checkout-radio-label ${needCarry === "yes" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="carry"
                          value="yes"
                          checked={needCarry === "yes"}
                          onChange={() => setNeedCarry("yes")}
                        />
                        <div className="checkout-radio-text-box">
                          <strong>필요</strong>
                          <span>운임 협의</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group-checkout full-width">
                  <label htmlFor="customer_memo">요청사항 <span className="opt">(선택)</span></label>
                  <textarea
                    id="customer_memo"
                    placeholder="배송 혹은 시공 시 요청사항이 있으시면 적어주세요"
                    value={customer.memo}
                    onChange={(e) => setCustomer({ ...customer, memo: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* [단계 4] 배송 방식 선택 */}
            <div className="checkout-card">
              <h3>4. 배송 방식 선택</h3>
              <div className="delivery-methods-grid">
                
                {/* 무료배송 카드 */}
                <div 
                  className={`delivery-method-card ${deliveryMethod === "free_shipping" ? "active" : ""} ${!freeShippingInfo.eligible ? "disabled" : ""}`}
                  onClick={() => freeShippingInfo.eligible && setDeliveryMethod("free_shipping")}
                >
                  <div className="delivery-card-header">
                    <input 
                      type="radio" 
                      name="delivery_method_select" 
                      checked={deliveryMethod === "free_shipping"}
                      disabled={!freeShippingInfo.eligible}
                      onChange={() => freeShippingInfo.eligible && setDeliveryMethod("free_shipping")}
                    />
                    <strong>무료배송 (현장 배송)</strong>
                  </div>
                  <div className="delivery-card-body">
                    <div className="delivery-card-desc">데코타일 50평 이상 주문 시 배송지 주소로 직접 배송됩니다.</div>
                    <div className="delivery-info-item">
                      <span className="info-label">수령 방식:</span>
                      <span className="info-val">입력하신 배송지에서 직접 수령</span>
                    </div>
                    <div className="delivery-info-item">
                      <span className="info-label">배송비:</span>
                      <span className="info-val text-free">0원 (무료)</span>
                    </div>
                    {freeShippingInfo.eligible ? (
                      <div className="free-shipping-badge-box">
                        <span className="badge-title">무료배송 적용</span>
                        <span className="badge-text">데코타일 합계 {freeShippingInfo.eligibleArea}박스 ({freeShippingInfo.eligibleArea}평)</span>
                        <span className="badge-text text-address">배송지: {customer.address ? `${customer.address} ${customer.address_detail || ""}`.trim() : "배송지 주소 미입력"}</span>
                      </div>
                    ) : (
                      <span className="delivery-disabled-reason">
                        {checkoutItems.some(item => isDecoTile(item)) ? (
                          `* 선택 불가 (데코타일 50평 미만, 무료배송까지 ${50 - decotilePyeong}박스 남음)`
                        ) : (
                          "* 선택 불가 (데코타일 50평 이상 주문 시 적용)"
                        )}
                      </span>
                    )}

                  </div>
                </div>

                {/* 대신화물 배송 카드 */}
                <div 
                  className={`delivery-method-card ${deliveryMethod === "cargo" ? "active" : ""}`}
                  onClick={() => setDeliveryMethod("cargo")}
                >
                  <div className="delivery-card-header">
                    <input 
                      type="radio" 
                      name="delivery_method_select" 
                      checked={deliveryMethod === "cargo"}
                      onChange={() => setDeliveryMethod("cargo")}
                    />
                    <strong>대신화물 지점 배송</strong>
                  </div>
                  <div className="delivery-card-body">
                    <div className="delivery-card-desc">데코타일 50평 미만 주문 시 기본 배송 방식입니다. 인근 대신화물 지점에서 수령합니다.</div>
                    <div className="delivery-info-item">
                      <span className="info-label">수령 방식:</span>
                      <span className="info-val">대신화물 지점 직접 내방 수령</span>
                    </div>
                    <div className="delivery-info-item">
                      <span className="info-label">배송비:</span>
                      <span className="info-val text-warning">화물 비용 착불 (별도 안내)</span>
                    </div>
                    <span className="delivery-status-note">* 주문 확인 후 주소와 가장 가까운 지점으로 발송됩니다.</span>
                  </div>
                </div>

                {/* 퀵 배송 카드 */}
                <div 
                  className={`delivery-method-card ${deliveryMethod === "quick" ? "active" : ""}`}
                  onClick={() => setDeliveryMethod("quick")}
                >
                  <div className="delivery-card-header">
                    <input 
                      type="radio" 
                      name="delivery_method_select" 
                      checked={deliveryMethod === "quick"}
                      onChange={() => setDeliveryMethod("quick")}
                    />
                    <strong>퀵 배송 (용달 화물)</strong>
                  </div>
                  <div className="delivery-card-body">
                    <div className="delivery-card-desc">재고 및 주문 접수 시간을 확인한 후 화물 용달 차량으로 당일 배송해 드립니다.</div>
                    <div className="delivery-info-item">
                      <span className="info-label">수령 방식:</span>
                      <span className="info-val">당일 용달 화물 수령 (재고/시간 확인 후 가능)</span>
                    </div>
                    <div className="delivery-info-item">
                      <span className="info-label">배송비:</span>
                      <span className="info-val text-warning">운임비 착불 (배송 거리 및 차종에 따라 책정)</span>
                    </div>
                    <span className="delivery-status-note">* 당일 발송 여부는 주문 확인 후 해피콜로 안내드립니다.</span>
                  </div>
                </div>

                {/* 직접 수령 카드 */}
                <div 
                  className={`delivery-method-card ${deliveryMethod === "pickup" ? "active" : ""}`}
                  onClick={() => setDeliveryMethod("pickup")}
                >
                  <div className="delivery-card-header">
                    <input 
                      type="radio" 
                      name="delivery_method_select" 
                      checked={deliveryMethod === "pickup"}
                      onChange={() => setDeliveryMethod("pickup")}
                    />
                    <strong>사무실 직접 수령</strong>
                  </div>
                  <div className="delivery-card-body">
                    <div className="delivery-card-desc">하남에 위치한 동경바닥재 사무실/물류센터에 직접 방문하여 수령하시는 방식입니다.</div>
                    <div className="delivery-info-item">
                      <span className="info-label">수령 위치:</span>
                      <span className="info-val">경기 하남시 서하남로 37 (1층)</span>
                    </div>
                    <div className="delivery-info-item">
                      <span className="info-label">배송비:</span>
                      <span className="info-val text-free">0원 (없음)</span>
                    </div>
                    <span className="delivery-status-note" style={{ color: 'var(--primary)', fontWeight: '600' }}>* 방문 전 상품 준비 완료 여부 확인이 반드시 필요합니다.</span>
                  </div>
                </div>
              </div>

              {/* 대신화물 수령지 선택 패널 */}
              {deliveryMethod === "cargo" && (
                <div className="freight-branch-selector-box">
                  <label>대신화물 수령 지점 지정 <span className="opt">(선택)</span></label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="도착을 희망하시는 대신화물 지점명 (주변 지점 확인을 이용해 검색해 보세요)"
                      value={freightBranch.name}
                      onChange={(e) => setFreightBranch({ ...freightBranch, name: e.target.value })}
                      style={{ flex: 1, height: '42px', padding: '0 12px', fontSize: '13.5px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                    />
                    <button 
                      type="button" 
                      className="btn-select-branch-trigger"
                      onClick={() => setShowBranchModal(true)}
                      style={{ height: '42px', padding: '0 16px' }}
                    >
                      주변 지점 확인
                    </button>
                  </div>
                  
                  {freightBranch.name ? (
                    <div className="freight-branch-inputs">
                      <div className="form-group-checkout" style={{ gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>지점 주소</span>
                        <input 
                          type="text" 
                          value={freightBranch.address} 
                          onChange={(e) => setFreightBranch({ ...freightBranch, address: e.target.value })}
                          readOnly
                        />
                      </div>
                      <div className="form-group-checkout" style={{ gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>지점 연락처</span>
                        <input 
                          type="text" 
                          value={freightBranch.phone} 
                          onChange={(e) => setFreightBranch({ ...freightBranch, phone: e.target.value })}
                          readOnly
                        />
                      </div>
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-light)', lineHeight: '1.4' }}>
                      💡 지점을 선택하거나 입력하지 않으시면 주문서 주소를 확인하고 가장 가까운 지점을 임의 배정하여 전화 통화 시 안내 드립니다.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* [단계 5] 결제 방식 선택 */}
            <div className="checkout-card">
              <h3>5. 결제 방식 선택</h3>
              <div className="payment-method-selector">
                <label className={`payment-option ${paymentMethod === "무통장입금" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="무통장입금"
                    checked={paymentMethod === "무통장입금"}
                    onChange={() => setPaymentMethod("무통장입금")}
                  />
                  <div className="payment-option-desc">
                    <strong>무통장입금</strong>
                    <span>주문 완료 후 아래 계좌로 입금해 주세요. (가장 빠른 접수 가능)</span>
                  </div>
                </label>

                <label className={`payment-option ${paymentMethod === "전화확인" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="전화확인"
                    checked={paymentMethod === "전화확인"}
                    onChange={() => setPaymentMethod("전화확인")}
                  />
                  <div className="payment-option-desc">
                    <strong>전화확인 주문</strong>
                    <span>상담 전화 통화 후 결제 및 배송을 안내해 드립니다.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 2. 오른쪽: 최종 결제 금액 요약 및 주문하기 버튼 */}
          <div className="checkout-right-section">
            <div className="summary-sticky-card">
              <h3>결제 금액 확인</h3>

              <div className="summary-detail-rows">
                <div className="summary-detail-row">
                  <span>상품 종류 수</span>
                  <span>{totalTypesCount}종</span>
                </div>
                <div className="summary-detail-row">
                  <span>총 수량</span>
                  <span>{totalQuantitySum.toLocaleString()} 평(박스/M)</span>
                </div>
                <div className="summary-detail-row">
                  <span>상품합계 금액</span>
                  <span>{calculateTotal().toLocaleString()}원</span>
                </div>
                <div className="summary-detail-row">
                  <span>배송비</span>
                  <span style={{ color: (deliveryMethod === "free_shipping" || deliveryMethod === "pickup") ? 'var(--success)' : 'var(--danger)' }}>
                    {deliveryMethod === "free_shipping" || deliveryMethod === "pickup" ? "0원 (무료)" : "별도 협의 (화물 착불)"}
                  </span>
                </div>
              </div>

              <div className="summary-total-section">
                <div className="total-row">
                  <span>최종 주문금액</span>
                  <strong>{calculateTotal().toLocaleString()}원</strong>
                </div>
                <p className="vat-notice">* 배송비 및 부가세는 별도로 안내됩니다.</p>
              </div>

              {/* 무통장 입금 안내 카드박스 */}
              {paymentMethod === "무통장입금" && (
                <div className="checkout-bank-transfer-box">
                  <strong>💳 무통장 입금 정보</strong>
                  <div className="bank-info-grid">
                    <div className="bank-info-row">
                      <span className="bank-info-label">은행명</span>
                      <span className="bank-info-val">농협은행</span>
                    </div>
                    <div className="bank-info-row">
                      <span className="bank-info-label">계좌번호</span>
                      <span className="bank-info-val">301-0298-9197-81</span>
                    </div>
                    <div className="bank-info-row">
                      <span className="bank-info-label">예금주</span>
                      <span className="bank-info-val">동경바닥재</span>
                    </div>
                  </div>
                  <div className="bank-guideline">
                    • 입금 완료 시점 기준으로 주문 접수가 최종 처리되며, 담당자가 화물 지점 및 운임 통화를 즉시 연결합니다.
                  </div>
                </div>
              )}

              {errorMsg && <div className="checkout-error-banner">{errorMsg}</div>}

              <button 
                type="submit" 
                className="btn-order-submit" 
                disabled={loading}
              >
                {loading ? "주문 접수 중..." : "최종 주문하기"}
              </button>
              
              <button 
                type="button" 
                className="btn-back-to-cart"
                onClick={() => navigate("/cart")}
                disabled={loading}
              >
                장바구니로 돌아가기
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 대신화물 주변 지점 검색 모달 */}
      {showBranchModal && (
        <div className="branch-selector-overlay" onClick={() => setShowBranchModal(false)}>
          <div className="branch-selector-modal" onClick={(e) => e.stopPropagation()}>
            <div className="branch-modal-header">
              <h3>대신화물 주변 지점 확인</h3>
              <button type="button" className="btn-close-branch-modal" onClick={() => setShowBranchModal(false)}>
                &times;
              </button>
            </div>
            <div className="branch-modal-body">
              <input 
                type="text" 
                placeholder="지점명이나 지역을 입력하세요 (예: 하남, 성남)"
                value={branchSearch}
                onChange={(e) => setBranchSearch(e.target.value)}
                className="branch-search-input"
                style={{ width: '100%', height: '38px', padding: '0 10px', fontSize: '13px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {getSortedBranches().filter(b => 
                  b.name.includes(branchSearch) || b.address.includes(branchSearch)
                ).map(branch => (
                  <div 
                    key={branch.name} 
                    className="branch-option-item"
                    onClick={() => {
                      setFreightBranch(branch);
                      setShowBranchModal(false);
                      setBranchSearch("");
                    }}
                    style={{ cursor: 'pointer', padding: '10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong>{branch.name}</strong>
                      {branch.score > 0 && (
                        <span className="badge-nearby-branch" style={{ fontSize: '11px', color: 'var(--primary)', backgroundColor: '#f0f5ff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          📍 추천 지점
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-light)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span>주소: {branch.address}</span>
                      <span>연락처: {branch.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showPostcodeLayer && (
        <div className="checkout-postcode-overlay" onClick={() => setShowPostcodeLayer(false)}>
          <div className="checkout-postcode-modal" onClick={(e) => e.stopPropagation()}>
            <div className="postcode-modal-header">
              <h3>주소 검색</h3>
              <button 
                type="button" 
                className="btn-close-postcode" 
                onClick={() => setShowPostcodeLayer(false)}
                aria-label="닫기"
              >
                &times;
              </button>
            </div>
            <div ref={postcodeContainerRef} className="postcode-embed-container"></div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
