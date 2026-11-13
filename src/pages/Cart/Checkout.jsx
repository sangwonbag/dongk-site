import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { useEstimateCart } from "../../contexts/EstimateCartContext";
import { useAuth } from "../../contexts/AuthContext";
import { getCurrentUser } from "../../lib/auth";
import { createOrder } from "../../services/orderService";
import { sendOrderNotification } from "../../services/notificationService";
import { OFFICE_ADDRESS, OFFICE_PHONE } from "../../constants/contact";
import { fetchAllProducts } from "../../utils/supabaseFetcher";
import { formatFlooringProductName } from "../../utils/brandUtils";
import { calculateDecorTilePyeong } from "../../utils/shippingUtils";
import { isDecoTile } from "../../utils/decotileUtils";
import { 
  isAccessoryItem, 
  isMaterialItem, 
  getItemDisplayUnit, 
  formatQuantityWithUnit,
} from "../../utils/productClassification";
import SEO from "../../components/seo/SEO";
import { HIDE_SUB_MATERIALS, isSubMaterialCategory } from "../../config/categoryConfig";
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
  } = useEstimateCart();
  const { user, loading: authLoading, openLoginModal } = useAuth();

  const hasAutoOpened = useRef(false);

  // 바로구매용 임시 품목 상태 결정
  const [baseCheckoutItems, setBaseCheckoutItems] = useState([]);
  const [pickupAccessoryItems, setPickupAccessoryItems] = useState([]);
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

  const [paymentMethod, setPaymentMethod] = useState("계좌이체"); // 계좌이체 | 동경바닥재 방문결제
  const [hasElevator, setHasElevator] = useState(""); // optional: "" | yes | no
  const [needCarry, setNeedCarry] = useState(""); // optional: "" | yes | no
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [agreeOrderTerms, setAgreeOrderTerms] = useState(false);
  const [agreeDeliveryPrivacy, setAgreeDeliveryPrivacy] = useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const isSubmittingRef = useRef(false);

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
  const [accessorySearch, setAccessorySearch] = useState("");
  const [customAccessoryName, setCustomAccessoryName] = useState("");
  const [customAccessoryQuantity, setCustomAccessoryQuantity] = useState(1);
  const [customAccessoryUnit, setCustomAccessoryUnit] = useState("개");
  
  // sessionStorage-backed states for persistence on refresh
  const [deliveryMethod, setDeliveryMethod] = useState(() => {
    return sessionStorage.getItem("checkout_delivery_method") || "cargo";
  });
  // 부자재는 전체 상품목록에는 숨기고 사무실 직접수령(pickup) 주문에서만 합산한다.
  const checkoutItems = useMemo(() => deliveryMethod === "pickup"
    ? [...baseCheckoutItems, ...pickupAccessoryItems]
    : baseCheckoutItems, [baseCheckoutItems, pickupAccessoryItems, deliveryMethod]);
  const [freightBranch, setFreightBranch] = useState(() => {
    const saved = sessionStorage.getItem("checkout_freight_branch");
    return saved ? JSON.parse(saved) : { name: "", address: "", phone: "" };
  });
  const [kyungdongBranch, setKyungdongBranch] = useState(() => {
    try {
      const stored = sessionStorage.getItem("checkout_kyungdong_branch");
      return stored ? JSON.parse(stored) : { name: "", address: "", phone: "" };
    } catch {
      return { name: "", address: "", phone: "" };
    }
  });
  const isFreightDelivery = deliveryMethod === "cargo" || deliveryMethod === "kyungdong";
  const freightCarrierLabel = deliveryMethod === "kyungdong" ? "경동화물" : "대신화물";
  const selectedFreightBranch = deliveryMethod === "kyungdong" ? kyungdongBranch : freightBranch;
  const updateSelectedFreightBranch = deliveryMethod === "kyungdong" ? setKyungdongBranch : setFreightBranch;

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
    sessionStorage.setItem("checkout_kyungdong_branch", JSON.stringify(kyungdongBranch));
  }, [kyungdongBranch]);

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

  // 자재/부자재 분류 및 계산 로직 분리
  const materialItems = useMemo(() => {
    return checkoutItems.filter(isMaterialItem);
  }, [checkoutItems]);

  const accessoryItems = useMemo(() => {
    return checkoutItems.filter(isAccessoryItem);
  }, [checkoutItems]);

  const materialQuantitySum = useMemo(() => {
    return materialItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
  }, [materialItems]);

  const accessoryQuantitySum = useMemo(() => {
    return accessoryItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
  }, [accessoryItems]);

  const materialPyeongSum = useMemo(() => {
    return calculateDecorTilePyeong(materialItems);
  }, [materialItems]);

  const decotilePyeong = materialPyeongSum;
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
      return isSubMaterialCategory(catName) && p.active !== false;
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
      recommendedSlugs.add('sub-nonslip-light-white');
      recommendedSlugs.add('sub-nonslip-light-gray');
      recommendedSlugs.add('sub-nonslip-light-darkwood');
      recommendedSlugs.add('sub-nonslip-heavy-lightwood');
      recommendedSlugs.add('sub-nonslip-heavy-darkwood');
      recommendedSlugs.add('sub-nonslip-heavy-gray');
    }

    if (hasCarpet) {
      recommendedSlugs.add('sub-bond-10kg');
      recommendedSlugs.add('sub-bond-4kg');
      recommendedSlugs.add('sub-bond-2kg');
      recommendedSlugs.add('sub-carpet-separator');
    }

    // 부자재 상품코드와 관계없이 본드·분리대·수지마감재를 주요 품목으로 표시한다.
    return allAccessories.filter(p => /본드|분리대|수지|마감재|실리콘|논슬립/.test(p.name || "") ||
      recommendedSlugs.has(p.id) || recommendedSlugs.has(p.slug) || recommendedSlugs.has(p.code));
  }, [allAccessories, checkoutItems]);

  const handleUpdateAccessoryQty = (id, nextQty, inCart) => {
    const quantity = Number(nextQty);
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 9999) return;
    if (inCart) {
      setPickupAccessoryItems(prev => prev.map(item =>
        item.id === id ? { ...item, quantity, amount: Number(item.price) * quantity } : item
      ));
    } else {
      setAccessoryQuantities(prev => ({ ...prev, [id]: quantity }));
    }
  };

  const addAccessoryRequest = (description) => {
    const cleaned = String(description || "").trim();
    if (!cleaned) return;
    setCustomAccessories(prev => prev.includes(cleaned) ? prev : [...prev, cleaned]);
  };

  const handleToggleAccessory = (product, qty, inCart) => {
    if (deliveryMethod !== "pickup") return;
    if (inCart) {
      setPickupAccessoryItems(prev => prev.filter(item => item.id !== product.id));
      return;
    }
    const price = parsePrice(product.price);
    const quantity = Math.max(1, Math.min(9999, Number(qty) || 1));
    const unit = getItemDisplayUnit(product);
    if (price <= 0) {
      // 가격 미등록 상품은 0원 주문을 만들지 않고 별도 확인 요청으로 전달한다.
      addAccessoryRequest(product.name + " (" + quantity + unit + ")");
      return;
    }
    const itemToAdd = {
      id: product.id,
      product_id: product.product_id || null,
      productId: product.product_id || null,
      thumbnail: product.thumbnail || product.image || "/images/no-image.svg",
      image: product.image || product.thumbnail || "/images/no-image.svg",
      brand: product.brand || "부자재",
      category: "부자재",
      line: "부자재",
      name: product.name,
      product_name: product.name,
      code: product.code,
      product_code: product.code,
      spec: product.specs?.size || "",
      packing: unit,
      price,
      unit_price: price,
      unit,
      quantity,
      amount: price * quantity
    };
    setPickupAccessoryItems(prev => prev.some(item => item.id === itemToAdd.id) ? prev : [...prev, itemToAdd]);
  };

  const handleAddCustomAccessory = () => {
    const name = customAccessoryName.trim();
    const quantity = Number(customAccessoryQuantity);
    if (!name || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 9999) return;
    addAccessoryRequest(name + " (" + quantity + customAccessoryUnit + ")");
    setCustomAccessoryName("");
    setCustomAccessoryQuantity(1);
    setCustomAccessoryUnit("개");
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

    if (HIDE_SUB_MATERIALS) {
      targetItems = (targetItems || []).filter(item => !isSubMaterialCategory(item));
    }

    // 주문 대상 품목이 없다면 리다이렉트
    if (!targetItems || targetItems.length === 0) {
      alert("주문할 대상 상품이 없거나 선택한 상품(부자재)이 판매 중단되었습니다.");
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

    setBaseCheckoutItems(targetItems);
    setIsDirectOrder(isDirect);

    // 로그인하지 않은 사용자라면 로그인 유도 (인증 검사 완료 및 로컬 세션 확인 후)
    const activeUser = user || getCurrentUser();
    if (!activeUser && !authLoading) {
      if (!hasAutoOpened.current) {
        hasAutoOpened.current = true;
        openLoginModal();
      }
    }
  }, [globalCartItems, navigate, openLoginModal, location.state, getPendingDirectOrder, isOrderSuccess, loading, user, authLoading]);

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

  const materialTotalAmount = useMemo(() => {
    return materialItems.reduce((sum, item) => {
      const qty = Math.max(1, parseInt(item.quantity) || 1);
      const price = getItemUnitPrice(item, qty);
      return sum + (price * qty);
    }, 0);
  }, [materialItems]);

  const accessoryTotalAmount = useMemo(() => {
    return accessoryItems.reduce((sum, item) => {
      const qty = Math.max(1, parseInt(item.quantity) || 1);
      const price = getItemUnitPrice(item, qty);
      return sum + (price * qty);
    }, 0);
  }, [accessoryItems]);

  const calculateTotal = () => {
    return materialTotalAmount + accessoryTotalAmount;
  };


  // 주문 실행
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (loading || isSubmittingRef.current || isOrderSuccess) {
      console.warn("[Checkout] 이미 주문 처리 중이거나 완료된 주문입니다. 중복 요청을 방지합니다.");
      return;
    }

    const activeLock = sessionStorage.getItem("order_submitting_lock");
    if (activeLock && Date.now() - parseInt(activeLock, 10) < 6000) {
      console.warn("[Checkout] 최근 6초 이내에 제출된 주문이 있어 중복 생성을 차단합니다.");
      return;
    }

    setErrorMsg("");

    // 로그인 여부 검사
    if (!user) {
      openLoginModal();
      return;
    }

    // 약관 및 개인정보 동의 검사
    if (!agreeOrderTerms) {
      setErrorMsg("구매조건 확인 및 환불·교환 정책에 동의해주세요.");
      return;
    }
    if (!agreeDeliveryPrivacy) {
      setErrorMsg("배송 정보 제공 및 개인정보 처리 위탁에 동의해주세요.");
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
    if (deliveryMethod !== "pickup" && !customer.address.trim()) {
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

    isSubmittingRef.current = true;
    sessionStorage.setItem("order_submitting_lock", Date.now().toString());
    setLoading(true);

    // 15초 안전 워치독 타이머 (네트워크 지연이나 예외 시 로딩 상태 자동 해제)
    const watchdogTimer = setTimeout(() => {
      if (isSubmittingRef.current) {
        console.warn("[Checkout] 주문 응답 15초 워치독 동작 - 로딩 해제");
        isSubmittingRef.current = false;
        setLoading(false);
        setErrorMsg("주문 처리 시간이 지연되고 있습니다. 네트워크 상태를 확인하시거나 고객센터(010-8227-9055)로 확인해 주세요.");
      }
    }, 15000);

    try {
      // Calculate delivery labels and metadata
      let deliveryLabel = "대신화물 지점 배송";
      let deliveryFee = "별도 안내";
      let deliveryFeeStatus = "unconfirmed";

      if (deliveryMethod === "free_shipping") {
        deliveryLabel = "무료배송";
        deliveryFee = "0원";
        deliveryFeeStatus = "free";
      } else if (deliveryMethod === "kyungdong") {
        deliveryLabel = "경동화물 지점 배송";
        deliveryFee = "착불 (별도 안내)";
        deliveryFeeStatus = "cod";
      } else if (deliveryMethod === "quick") {
        deliveryLabel = "퀵 배송";
        deliveryFee = "착불 (거리비례)";
        deliveryFeeStatus = "cod";
      } else if (deliveryMethod === "pickup") {
        deliveryLabel = "사무실 직접수령";
        deliveryFee = "0원";
        deliveryFeeStatus = "free";
      }

      // Check accessory recommendation shown/skipped
      const accShown = deliveryMethod === "pickup";
      const addedAccQty = pickupAccessoryItems.length;
      const accSkipped = accShown && (addedAccQty === 0 && customAccessories.length === 0);

      // We append requested custom accessories to the final memo
      let customAccText = "";
      if (deliveryMethod === "pickup" && customAccessories.length > 0) {
        customAccText = `\n[상담요청 부자재] ${customAccessories.join(", ")}`;
      }

      const siteInfo = `[현장정보] 엘리베이터: ${hasElevator === "yes" ? "있음" : hasElevator === "no" ? "없음" : "미입력"} / 양중(계단운반): ${needCarry === "yes" ? "필요(운임협의)" : needCarry === "no" ? "불필요(1층하차)" : "미입력"}`;
      const finalMemo = `${siteInfo}\n[요청사항] ${customer.memo || "없음"}${customAccText}`;

      // Assemble customer payload
      const orderPayloadCustomer = {
        ...customer,
        address: deliveryMethod === "pickup" ? OFFICE_ADDRESS : customer.address,
        address_detail: deliveryMethod === "pickup" ? "" : customer.address_detail,
        memo: finalMemo,
        
        // Shipping fields
        delivery_method: deliveryMethod,
        delivery_method_label: deliveryLabel,
        delivery_fee: deliveryFee,
        delivery_fee_status: deliveryFeeStatus,
        shipping_address: deliveryMethod === "pickup"
          ? OFFICE_ADDRESS
          : `${customer.address} ${customer.address_detail || ""}`.trim(),
        
        // Freight branch details
        freight_branch_name: isFreightDelivery ? (selectedFreightBranch.name || null) : null,
        freight_branch_address: isFreightDelivery ? (selectedFreightBranch.address || null) : null,
        freight_branch_phone: isFreightDelivery ? (selectedFreightBranch.phone || null) : null,

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

      // 주문 생성 API 호출 (DB orders + order_items 삽입)
      const orderData = await createOrder({
        cartItems: checkoutItems,
        customer: orderPayloadCustomer,
        paymentMethod
      });

      clearTimeout(watchdogTimer);
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
      sessionStorage.removeItem("checkout_kyungdong_branch");
      sessionStorage.removeItem("checkout_custom_accessories");

      // 주문 완료 정보 localStorage 및 sessionStorage 백업 (새로고침/직접접근 대비)
      try {
        localStorage.setItem("last_completed_order", JSON.stringify(orderData));
        sessionStorage.setItem("last_completed_order", JSON.stringify(orderData));
      } catch (storageErr) {
        console.warn("[Checkout Warning] storage 저장 실패:", storageErr);
      }

      // 비동기 알림 백그라운드 발송 (사용자 화면 전환을 차단하지 않음)
      Promise.allSettled([
        sendOrderNotification(orderData, "admin"),
        customer.email && customer.email.trim() ? sendOrderNotification(orderData, "customer") : Promise.resolve()
      ]).catch(notifErr => {
        console.warn("[Checkout Warning] 백그라운드 알림 이메일 전송 예외:", notifErr);
      });

      // 지체 없이 즉시 주문 완료 화면으로 전환
      navigate("/order-complete", { state: { order: orderData }, replace: true });
    } catch (err) {
      clearTimeout(watchdogTimer);
      console.error("[Checkout Error]", err);
      setErrorMsg(err.message || "주문 처리 중 에러가 발생했습니다. 다시 시도해 주세요.");
      alert(`주문 실패: ${err.message || "서버 오류"}`);
    } finally {
      clearTimeout(watchdogTimer);
      sessionStorage.removeItem("order_submitting_lock");
      isSubmittingRef.current = false;
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

  // Prevent visitor checkout pages from rendering cart pricing while logged out.
  // This is presentation only: the database must also enforce server-side price access.
  if (!authLoading && !user?.isLoggedIn) {
    return (
      <MainLayout>
        <SEO title="주문결제 | 동경바닥재" noindex={true} canonical="https://dkfloor.co.kr/checkout" />
        <div className="checkout-page-container" style={{ padding: "70px 20px", textAlign: "center" }}>
          <h1>주문 진행을 위해 로그인해 주세요</h1>
          <p style={{ margin: "16px 0 24px" }}>상품 및 결제 금액은 로그인 후 확인할 수 있습니다. 별도 견적문의도 가능합니다.</p>
          <button type="button" onClick={openLoginModal} className="btn-primary">로그인</button>
          <button type="button" onClick={() => navigate("/estimate")} className="btn-secondary" style={{ marginLeft: "12px" }}>견적문의</button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO title="주문결제 | 동경바닥재" noindex={true} canonical="https://dkfloor.co.kr/checkout" />
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
            
            {/* [단계 1] 주문 상품 확인 (ERP 스타일 결제 금액 확인 표) */}
            <div className="checkout-card erp-checkout-card">
              <div className="checkout-card-header-flex">
                <h3>1. 주문 상품 확인</h3>
                <span className="order-items-summary-badge">
                  총 {checkoutItems.length}종 (자재 {materialItems.length}종 / 부자재 {accessoryItems.length}종)
                </span>
              </div>

              <div className="erp-order-table-container">
                {/* 자재 품목 테이블 */}
                {materialItems.length > 0 && (
                  <div className="erp-category-group">
                    <div className="erp-group-header material-header">
                      <span className="group-title-badge badge-material">자재</span>
                      <span className="group-summary-info">
                        총 {materialItems.length}개 품목 · {materialPyeongSum > 0 ? `${materialPyeongSum}평` : `${materialQuantitySum}개`}
                      </span>
                    </div>

                    <div className="erp-table-wrapper">
                      <table className="erp-order-table">
                        <thead>
                          <tr>
                            <th className="col-type">구분</th>
                            <th className="col-name">상품명</th>
                            <th className="col-qty text-right">수량</th>
                            <th className="col-unit text-center">단위</th>
                            <th className="col-price text-right">단가</th>
                            <th className="col-total text-right">금액</th>
                          </tr>
                        </thead>
                        <tbody>
                          {materialItems.map((item) => {
                            const qty = Math.max(1, parseInt(item.quantity) || 1);
                            const price = getItemUnitPrice(item, qty);
                            const hasPrice = price > 0;
                            const unitStr = getItemDisplayUnit(item);

                            return (
                              <tr key={item.id || item.product_id}>
                                <td className="col-type">
                                  <span className="item-class-tag tag-material">자재</span>
                                </td>
                                <td className="col-name">
                                  <div className="erp-item-name-box">
                                    {item.brand && <span className="erp-item-brand">{item.brand}</span>}
                                    <strong className="erp-item-title">{formatFlooringProductName(item)}</strong>
                                    {(item.code || item.spec) && (
                                      <span className="erp-item-sub">
                                        {item.code ? `코드: ${item.code}` : ''} {item.spec ? `| 규격: ${item.spec}` : ''}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="col-qty text-right font-bold highlight-qty">
                                  {qty.toLocaleString()}
                                </td>
                                <td className="col-unit text-center text-muted">
                                  {unitStr}
                                </td>
                                <td className="col-price text-right text-muted">
                                  {hasPrice ? `${price.toLocaleString()}원` : "가격문의"}
                                </td>
                                <td className="col-total text-right font-bold">
                                  {hasPrice ? `${(price * qty).toLocaleString()}원` : "상담 필요"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="erp-subtotal-row material-subtotal-row">
                            <td colSpan="2" className="text-left font-bold erp-subtotal-label">자재 소계 ({materialItems.length}종)</td>
                            <td className="col-qty text-right font-bold highlight-qty">{materialPyeongSum > 0 ? materialPyeongSum.toLocaleString() : materialQuantitySum.toLocaleString()}</td>
                            <td className="col-unit text-center font-bold">{materialPyeongSum > 0 ? "평" : "개"}</td>
                            <td className="col-price"></td>
                            <td className="col-total text-right font-bold erp-subtotal-amount">{materialTotalAmount.toLocaleString()}원</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* 부자재 품목 테이블 */}
                {accessoryItems.length > 0 && (
                  <div className="erp-category-group accessory-group" style={{ marginTop: materialItems.length > 0 ? '20px' : '0' }}>
                    <div className="erp-group-header accessory-header">
                      <span className="group-title-badge badge-accessory">부자재</span>
                      <span className="group-summary-info">
                        총 {accessoryItems.length}개 품목 · {accessoryQuantitySum}개
                      </span>
                    </div>

                    <div className="erp-table-wrapper">
                      <table className="erp-order-table">
                        <thead>
                          <tr>
                            <th className="col-type">구분</th>
                            <th className="col-name">상품명</th>
                            <th className="col-qty text-right">수량</th>
                            <th className="col-unit text-center">단위</th>
                            <th className="col-price text-right">단가</th>
                            <th className="col-total text-right">금액</th>
                          </tr>
                        </thead>
                        <tbody>
                          {accessoryItems.map((item) => {
                            const qty = Math.max(1, parseInt(item.quantity) || 1);
                            const price = getItemUnitPrice(item, qty);
                            const hasPrice = price > 0;
                            const unitStr = getItemDisplayUnit(item);

                            return (
                              <tr key={item.id || item.product_id}>
                                <td className="col-type">
                                  <span className="item-class-tag tag-accessory">부자재</span>
                                </td>
                                <td className="col-name">
                                  <div className="erp-item-name-box">
                                    <strong className="erp-item-title">{item.name || item.product_name}</strong>
                                  </div>
                                </td>
                                <td className="col-qty text-right font-bold highlight-qty">
                                  {qty.toLocaleString()}
                                </td>
                                <td className="col-unit text-center text-muted">
                                  {unitStr}
                                </td>
                                <td className="col-price text-right text-muted">
                                  {hasPrice ? `${price.toLocaleString()}원` : "가격문의"}
                                </td>
                                <td className="col-total text-right font-bold">
                                  {hasPrice ? `${(price * qty).toLocaleString()}원` : "상담 필요"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="erp-subtotal-row accessory-subtotal-row">
                            <td colSpan="2" className="text-left font-bold erp-subtotal-label">부자재 소계 ({accessoryItems.length}종)</td>
                            <td className="col-qty text-right font-bold highlight-qty">{accessoryQuantitySum.toLocaleString()}</td>
                            <td className="col-unit text-center font-bold">개</td>
                            <td className="col-price"></td>
                            <td className="col-total text-right font-bold erp-subtotal-amount">{accessoryTotalAmount.toLocaleString()}원</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* [단계 2] 주문자 및 배송 정보 */}
            <div className="checkout-card">
              <h3>2. 주문자 및 배송 정보</h3>
              
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
                  <label htmlFor="customer_address">배송주소 {deliveryMethod === "pickup" ? <span className="opt">(사무실 직접수령 시 입력 불필요)</span> : <span className="req">*</span>}</label>
                  <div className="checkout-address-search-row">
                    <input
                      id="customer_address"
                      type="text"
                      placeholder="우측 '주소 검색' 버튼을 클릭해 주세요"
                      value={customer.address}
                      onClick={handleAddressSearch}
                      readOnly
                      required={deliveryMethod !== "pickup"}
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
                    <label htmlFor="customer_delivery_date">{deliveryMethod === "pickup" ? "희망수령일" : "희망배송일"} <span className="opt">(선택)</span></label>
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
                    <div className="checkout-optional-label-row"><label>엘리베이터 유무 <span className="opt">(선택)</span></label>{hasElevator && <button type="button" onClick={() => setHasElevator("")}>선택 해제</button>}</div>
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
                    <div className="checkout-optional-label-row"><label>양중 작업(계단 운반) <span className="opt">(선택)</span></label>{needCarry && <button type="button" onClick={() => setNeedCarry("")}>선택 해제</button>}</div>
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

            {/* [단계 3] 배송 방식 선택 */}
            <div className="checkout-card">
              <h3>3. 배송 방식 선택</h3>
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
                    <div className="delivery-card-desc">기본 배송 방식입니다. 인근 대신화물 지점에서 수령합니다.</div>
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

                {/* 경동화물 배송 카드 */}
                <div className={`delivery-method-card ${deliveryMethod === "kyungdong" ? "active" : ""}`} onClick={() => setDeliveryMethod("kyungdong")}>
                  <div className="delivery-card-header">
                    <input type="radio" name="delivery_method_select" checked={deliveryMethod === "kyungdong"} onChange={() => setDeliveryMethod("kyungdong")} />
                    <strong>경동화물 지점 배송</strong>
                  </div>
                  <div className="delivery-card-body">
                    <div className="delivery-card-desc">인근 경동화물 영업소에서 직접 수령합니다.</div>
                    <div className="delivery-info-item"><span className="info-label">수령 방식:</span><span className="info-val">경동화물 지점 직접 내방 수령</span></div>
                    <div className="delivery-info-item"><span className="info-label">배송비:</span><span className="info-val text-warning">화물 비용 착불 (별도 안내)</span></div>
                    <span className="delivery-status-note">* 주문 확인 후 수령 지점과 운임을 안내드립니다.</span>
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
              {isFreightDelivery && (
                <div className="freight-branch-selector-box">
                  <label>{freightCarrierLabel} 수령 지점 지정 <span className="opt">(선택)</span></label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="희망하시는 수령 지점명 (미입력 시 주문 후 안내)"
                      value={selectedFreightBranch.name}
                      onChange={(e) => updateSelectedFreightBranch({ name: e.target.value, address: "", phone: "" })}
                      style={{ flex: 1, height: '42px', padding: '0 12px', fontSize: '13.5px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                    />
                    {deliveryMethod === "cargo" ? (<button 
                      type="button" 
                      className="btn-select-branch-trigger"
                      onClick={() => setShowBranchModal(true)}
                      style={{ height: '42px', padding: '0 16px' }}
                    >
                      주변 지점 확인
                    </button>) : (<a className="btn-select-branch-trigger" href="https://kdexp.com/" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", padding: "0 12px", minHeight: "42px", textDecoration: "none" }}>경동 영업소 조회</a>)}
                  </div>
                  
                  {selectedFreightBranch.name ? (
                    <div className="freight-branch-inputs">
                      <div className="form-group-checkout" style={{ gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>지점 주소</span>
                        <input 
                          type="text" 
                          value={selectedFreightBranch.address} 
                          onChange={(e) => updateSelectedFreightBranch({ ...selectedFreightBranch, address: e.target.value })}
                        />
                      </div>
                      <div className="form-group-checkout" style={{ gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>지점 연락처</span>
                        <input 
                          type="text" 
                          value={selectedFreightBranch.phone} 
                          onChange={(e) => updateSelectedFreightBranch({ ...selectedFreightBranch, phone: e.target.value })}
                        />
                      </div>
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-light)', lineHeight: '1.4' }}>
                      💡 지점을 입력하지 않아도 주문 가능합니다. 주문 확인 후 수령 가능한 {freightCarrierLabel} 지점을 안내드립니다.
                    </p>
                  )}
                </div>
              )}
            </div>


            {/* 사무실 직접 수령 전용 부자재 선택 — 일반 상품목록과 일반 배송 부자재 숨김 정책 유지 */}
            {deliveryMethod === "pickup" && (
              <section className="accessory-recommendation-card pickup-accessories" aria-label="사무실 직접수령 부자재 추가">
                <h3>4. 사무실 직접수령 부자재 추가 <span className="opt">(선택)</span></h3>
                <p className="pickup-accessory-hint">본드·분리대·수지마감재·실리콘 등 필요한 부자재를 골라 수량을 선택하세요.</p>
                <label htmlFor="pickup-accessory-search" className="pickup-accessory-search-label">부자재 검색</label>
                <input id="pickup-accessory-search" className="pickup-accessory-search" type="search"
                  placeholder="예: 본드, 분리대, 수지마감재, 실리콘" value={accessorySearch}
                  onChange={(e) => setAccessorySearch(e.target.value)} />
                <div className="pickup-accessory-list">
                  {(accessorySearch.trim()
                    ? allAccessories.filter(p => (p.name + " " + (p.code || "")).toLowerCase().includes(accessorySearch.trim().toLowerCase()))
                    : showAllAccessories || recommendedAccessories.length === 0 ? allAccessories : recommendedAccessories
                  ).map(product => {
                    const selected = pickupAccessoryItems.find(item => item.id === product.id);
                    const inCart = Boolean(selected);
                    const qty = selected ? selected.quantity : (accessoryQuantities[product.id] || 1);
                    const price = parsePrice(product.price);
                    const unit = getItemDisplayUnit(product);
                    const priceUnknown = price <= 0;
                    return (
                      <div key={product.id} className={"pickup-accessory-row" + (inCart ? " selected" : "")}>
                        <div className="pickup-accessory-description">
                          <strong>{product.name}</strong>
                          <span>{product.code ? "코드: " + product.code + " · " : ""}{priceUnknown ? "가격 확인 필요" : price.toLocaleString() + "원 / " + unit}</span>
                        </div>
                        <div className="pickup-accessory-actions">
                          <div className="pickup-accessory-quantity">
                            <button type="button" aria-label={product.name + " 수량 감소"} disabled={qty <= 1}
                              onClick={() => handleUpdateAccessoryQty(product.id, qty - 1, inCart)}>−</button>
                            <span aria-label={product.name + " 수량"}>{qty}{unit}</span>
                            <button type="button" aria-label={product.name + " 수량 증가"} disabled={qty >= 9999}
                              onClick={() => handleUpdateAccessoryQty(product.id, qty + 1, inCart)}>+</button>
                          </div>
                          <button type="button" className={"pickup-accessory-add" + (inCart ? " added" : "")}
                            onClick={() => handleToggleAccessory(product, qty, inCart)}>
                            {inCart ? "제거" : priceUnknown ? "확인 요청" : "추가"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {allAccessories.length === 0 && <p className="pickup-accessory-empty">등록된 부자재가 없습니다. 아래에서 필요한 부자재를 요청해 주세요.</p>}
                {accessorySearch.trim() && !allAccessories.some(p => (p.name + " " + (p.code || "")).toLowerCase().includes(accessorySearch.trim().toLowerCase())) &&
                  <p className="pickup-accessory-empty">검색 결과가 없습니다. 아래에서 직접 요청할 수 있습니다.</p>}
                {!accessorySearch.trim() && recommendedAccessories.length > 0 && allAccessories.length > recommendedAccessories.length &&
                  <button type="button" className="pickup-accessory-show-all" onClick={() => setShowAllAccessories(prev => !prev)}>
                    {showAllAccessories ? "주요 부자재만 보기" : "전체 부자재 보기 (" + allAccessories.length + "종)"}
                  </button>}
                <div className="pickup-custom-accessory">
                  <label htmlFor="pickup-custom-name">목록에 없는 부자재 요청</label>
                  <div className="pickup-custom-row">
                    <input id="pickup-custom-name" type="text" placeholder="예: 수지마감재 (색상·규격 포함)"
                      value={customAccessoryName} onChange={(e) => setCustomAccessoryName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCustomAccessory(); } }} />
                    <input type="number" min="1" max="9999" step="1" aria-label="요청 수량"
                      value={customAccessoryQuantity} onChange={(e) => setCustomAccessoryQuantity(e.target.value)} />
                    <select aria-label="요청 단위" value={customAccessoryUnit} onChange={(e) => setCustomAccessoryUnit(e.target.value)}>
                      {["개", "통", "본", "박스", "kg", "롤"].map(unit => <option key={unit} value={unit}>{unit}</option>)}
                    </select>
                    <button type="button" onClick={handleAddCustomAccessory} disabled={!customAccessoryName.trim()}>요청 추가</button>
                  </div>
                  {customAccessories.length > 0 && (
                    <ul className="pickup-request-list">
                      {customAccessories.map(description => (
                        <li key={description}>
                          <span>{description}</span>
                          <button type="button" aria-label={description + " 요청 삭제"}
                            onClick={() => setCustomAccessories(prev => prev.filter(item => item !== description))}>삭제</button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p>가격 미등록 부자재는 주문 합계에 포함하지 않고 접수 후 별도 안내합니다.</p>
                </div>
              </section>
            )}

            {/* [단계 5] 결제 방식 선택 */}
            <div className="checkout-card">
              <h3>{deliveryMethod === "pickup" ? "5. 결제 방식 선택" : "4. 결제 방식 선택"}</h3>
              <div className="payment-method-selector">
                <label className={`payment-option ${(paymentMethod === "계좌이체" || paymentMethod === "bank_transfer") ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="계좌이체"
                    checked={paymentMethod === "계좌이체" || paymentMethod === "bank_transfer"}
                    onChange={() => setPaymentMethod("계좌이체")}
                  />
                  <div className="payment-option-desc">
                    <strong>계좌이체</strong>
                    <span>주문 접수 후 무통장 입금 계좌로 입금하는 방식입니다.</span>
                  </div>
                </label>

                <label className={`payment-option ${(paymentMethod === "동경바닥재 방문결제" || paymentMethod === "store_payment") ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="동경바닥재 방문결제"
                    checked={paymentMethod === "동경바닥재 방문결제" || paymentMethod === "store_payment"}
                    onChange={() => setPaymentMethod("동경바닥재 방문결제")}
                  />
                  <div className="payment-option-desc">
                    <strong>동경바닥재 방문결제</strong>
                    <span>동경바닥재 본사/매장에 직접 방문하여 결제하는 방식입니다.</span>
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
                  <span>자재 수량</span>
                  <span className="summary-val-highlight">
                    {materialPyeongSum > 0 ? `${materialPyeongSum.toLocaleString()}평` : `${materialQuantitySum.toLocaleString()}개`}
                  </span>
                </div>
                <div className="summary-detail-row">
                  <span>자재 금액</span>
                  <span>{materialTotalAmount.toLocaleString()}원</span>
                </div>

                {accessoryItems.length > 0 && (
                  <>
                    <div className="summary-detail-row accessory-sub-row" style={{ paddingTop: '8px', borderTop: '1px dashed #e2ded5' }}>
                      <span>부자재 수량</span>
                      <span className="summary-val-highlight">{accessoryQuantitySum.toLocaleString()}개</span>
                    </div>
                    <div className="summary-detail-row accessory-sub-row">
                      <span>부자재 금액</span>
                      <span>{accessoryTotalAmount.toLocaleString()}원</span>
                    </div>
                  </>
                )}

                <div className="summary-detail-row shipping-row" style={{ paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  <span>배송비</span>
                  <span style={{ color: (deliveryMethod === "free_shipping" || deliveryMethod === "pickup") ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
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

              {/* 결제 수단별 상세 안내 카드박스 */}
              {(paymentMethod === "계좌이체" || paymentMethod === "bank_transfer" || !paymentMethod) && (
                <div className="checkout-bank-transfer-box">
                  <strong>💳 계좌이체 안내</strong>
                  <div className="bank-info-grid">
                    <div className="bank-info-row">
                      <span className="bank-info-label">은행명</span>
                      <span className="bank-info-val">NH농협은행</span>
                    </div>
                    <div className="bank-info-row">
                      <span className="bank-info-label">계좌번호</span>
                      <span className="bank-info-val">301-0298-9197-81</span>
                    </div>
                    <div className="bank-info-row">
                      <span className="bank-info-label">예금주</span>
                      <span className="bank-info-val">(주)동경바닥재</span>
                    </div>
                  </div>
                  <div className="bank-guideline" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ margin: 0 }}>• 주문 접수 후 입금 확인이 완료되면 상품 준비가 시작됩니다.</p>
                    <p style={{ margin: 0 }}>• 입금자명과 주문자명이 다를 경우 주문 요청사항에 입금자명을 작성해 주세요.</p>
                  </div>
                </div>
              )}

              {(paymentMethod === "동경바닥재 방문결제" || paymentMethod === "store_payment") && (
                <div className="checkout-bank-transfer-box store-payment-notice">
                  <strong>🏬 동경바닥재 방문결제 안내</strong>
                  <div className="bank-info-grid">
                    <div className="bank-info-row">
                      <span className="bank-info-label">방문주소</span>
                      <span className="bank-info-val">경기 하남시 서하남로 37 (동경바닥재)</span>
                    </div>
                    <div className="bank-info-row">
                      <span className="bank-info-label">운영시간</span>
                      <span className="bank-info-val">평일 07:00 ~ 18:00 / 주말 07:00 ~ 12:00</span>
                    </div>
                    <div className="bank-info-row">
                      <span className="bank-info-label">문의전화</span>
                      <span className="bank-info-val">02-487-9775</span>
                    </div>
                  </div>
                  <div className="bank-guideline" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ margin: 0 }}>• 동경바닥재 본사/매장에 직접 방문하여 결제하는 방식입니다.</p>
                    <p style={{ margin: 0 }}>• 방문 전 상품 재고와 준비 여부를 반드시 확인해 주세요.</p>
                  </div>
                </div>
              )}

              {errorMsg && <div className="checkout-error-banner">{errorMsg}</div>}

              <div className="checkout-agreements-box" style={{ margin: '16px 0', padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={agreeOrderTerms}
                    onChange={(e) => setAgreeOrderTerms(e.target.checked)}
                    disabled={loading}
                    style={{ marginTop: '2px' }}
                  />
                  <span>
                    <strong style={{ color: '#b91c1c' }}>[필수]</strong> 구매 조건 확인 및 주문 진행 동의 (
                    <a href="/refund-policy" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: '#0369a1' }}>
                      환불·교환 규정
                    </a>
                    , 
                    <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: '#0369a1', marginLeft: '4px' }}>
                      이용약관
                    </a>
                    )
                  </span>
                </label>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={agreeDeliveryPrivacy}
                    onChange={(e) => setAgreeDeliveryPrivacy(e.target.checked)}
                    disabled={loading}
                    style={{ marginTop: '2px' }}
                  />
                  <span>
                    <strong style={{ color: '#b91c1c' }}>[필수]</strong> 배송 위탁 및 개인정보 제공 동의 (
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: '#0369a1' }}>
                      개인정보처리방침
                    </a>
                    )
                  </span>
                </label>
              </div>

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
