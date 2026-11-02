import { supabase } from '../lib/supabaseClient.js';
import { getCurrentUser } from '../lib/auth.js';
import { formatFlooringProductName, getProductUnit } from '../utils/brandUtils.js';

/**
 * 실제 주문 접수 기능을 담당하는 서비스입니다.
 * Supabase DB의 영문 체크 제약조건과 프론트엔드 한글 UI 매핑을 양방향으로 지원합니다.
 */

// 한글 -> 영문 매핑
const STATUS_KO_TO_EN = {
  "접수완료": "submitted",
  "확인중": "confirmed",
  "확인": "confirmed", // 하위 호환
  "준비중": "preparing",
  "출고/배송중": "delivering",
  "배송중": "delivering", // 하위 호환
  "시공중/시공완료": "installed",
  "완료": "completed",
  "취소": "cancelled"
};

const PAYMENT_METHOD_KO_TO_EN = {
  "계좌이체": "bank_transfer",
  "무통장입금": "bank_transfer",
  "동경바닥재 방문결제": "store_payment",
  "방문결제": "store_payment",
  "현장결제": "store_payment",
  "전화확인": "phone_confirm",
  "bank_transfer": "bank_transfer",
  "store_payment": "store_payment"
};

const PAYMENT_STATUS_KO_TO_EN = {
  "미입금": "unpaid",
  "입금완료": "paid",
  "부분입금": "partial",
  "환불": "refunded"
};

// 영문 -> 한글 매핑 (UI 복원용)
const STATUS_EN_TO_KO = {
  "submitted": "접수완료",
  "confirmed": "확인중",
  "preparing": "준비중",
  "delivering": "출고/배송중",
  "installed": "시공중/시공완료",
  "completed": "완료",
  "cancelled": "취소"
};

const PAYMENT_METHOD_EN_TO_KO = {
  "bank_transfer": "계좌이체",
  "store_payment": "동경바닥재 방문결제",
  "phone_confirm": "동경바닥재 방문결제",
  "on_site": "동경바닥재 방문결제",
  "card": "계좌이체"
};

const PAYMENT_STATUS_EN_TO_KO = {
  "unpaid": "미입금",
  "paid": "입금완료",
  "partial": "부분입금",
  "refunded": "환불"
};

// DB 영문 데이터를 한글 데이터로 변환하는 헬퍼 함수 (관리자 메모 하이브리드 파싱 포함)
const mapOrderToKo = (order) => {
  if (!order) return null;
  
  let adminMemoText = order.admin_memo || '';
  let memoText = order.memo || '';

  // Extract from memo fallback if columns are missing
  let delivery_method = order.delivery_method || 'cargo';
  let delivery_method_label = order.delivery_method_label || '대신화물 지점 배송';
  let delivery_fee = order.delivery_fee || '별도 안내';
  let delivery_fee_status = order.delivery_fee_status || 'unconfirmed';
  let shipping_address = order.shipping_address || order.address || '';
  let freight_branch_name = order.freight_branch_name || null;
  let freight_branch_address = order.freight_branch_address || null;
  let freight_branch_phone = order.freight_branch_phone || null;
  let free_shipping_eligible = order.free_shipping_eligible ?? false;
  let free_shipping_brand = order.free_shipping_brand || null;
  let free_shipping_area = order.free_shipping_area || 0;
  let quick_delivery_requested = order.quick_delivery_requested ?? false;
  let office_pickup_requested = order.office_pickup_requested ?? false;
  let accessory_recommendation_shown = order.accessory_recommendation_shown ?? false;
  let accessory_recommendation_skipped = order.accessory_recommendation_skipped ?? false;

  if (memoText && !order.delivery_method) {
    const methodMatch = memoText.match(/\[배송방식\]\s*([^\n|]+)\s*\|\s*배송비:\s*([^\n(]+)\s*\(([^)]+)\)/);
    if (methodMatch) {
      delivery_method_label = methodMatch[1].trim();
      delivery_fee = methodMatch[2].trim();
      delivery_fee_status = methodMatch[3].trim();
      
      if (delivery_method_label.includes("무료")) delivery_method = "free_shipping";
      else if (delivery_method_label.includes("경동")) delivery_method = "kyungdong";
       else if (delivery_method_label.includes("퀵")) delivery_method = "quick";
      else if (delivery_method_label.includes("직접")) delivery_method = "pickup";
      else delivery_method = "cargo";
    }

    const branchMatch = memoText.match(/\[(?:대신|경동)화물지점\]\s*([^\n(]+)\s*\(([^/]+)\/\s*([^)]*)\)/);
    if (branchMatch) {
      freight_branch_name = branchMatch[1].trim();
      if (freight_branch_name === '없음') freight_branch_name = null;
      freight_branch_address = branchMatch[2].trim();
      freight_branch_phone = branchMatch[3].trim();
    }

    const freeMatch = memoText.match(/\[무료배송여부\]\s*([^\n(]+)\s*\(적용브랜드:\s*([^,]+),\s*합계평수:\s*([^평]+)평\)/);
    if (freeMatch) {
      free_shipping_eligible = freeMatch[1].trim() === '대상';
      free_shipping_brand = freeMatch[2].trim();
      if (free_shipping_brand === '없음') free_shipping_brand = null;
      free_shipping_area = parseFloat(freeMatch[3]) || 0;
    }

    const accessoryMatch = memoText.match(/\[부자재안내\]\s*노출여부:\s*([^,]+),\s*건너뜀여부:\s*(.*)$/m);
    if (accessoryMatch) {
      accessory_recommendation_shown = accessoryMatch[1].trim() === '노출됨';
      accessory_recommendation_skipped = accessoryMatch[2].trim() === '건너뜀';
    }

    if (delivery_method === "quick") quick_delivery_requested = true;
    if (delivery_method === "pickup") office_pickup_requested = true;

    // Clean memo text from the fallback tags for cleaner display
    memoText = memoText
      .replace(/\[배송방식\].*$/m, "")
      .replace(/\[(?:대신|경동)화물지점\].*$/m, "")
      .replace(/\[무료배송여부\].*$/m, "")
      .replace(/\[부자재안내\].*$/m, "")
      .trim();
  }

  // 만약 admin_memo 컬럼이 없어서 memo에 [관리자 메모]를 합쳐서 보관한 경우, 이를 분리해서 노출
  if (!order.admin_memo && memoText) {
    const match = memoText.match(/(?:\r?\n)?\[관리자 메모\]\s*(.*)$/s);
    if (match) {
      adminMemoText = match[1].trim();
      memoText = memoText.substring(0, match.index).trim();
    }
  }

  let mappedPaymentMethod = PAYMENT_METHOD_EN_TO_KO[order.payment_method] || order.payment_method;
  if (order.memo && order.memo.includes('[결제방식: 동경바닥재 매장 방문결제]')) {
    mappedPaymentMethod = '동경바닥재 방문결제';
  }

  return {
    ...order,
    status: STATUS_EN_TO_KO[order.status] || order.status,
    payment_method: mappedPaymentMethod,
    payment_status: PAYMENT_STATUS_EN_TO_KO[order.payment_status] || order.payment_status,
    memo: memoText,
    admin_memo: adminMemoText,
    
    construction_status: order.construction_status || '일정 미정',
    shipment_status: order.shipment_status || '대기',
    shipment_checklist: Array.isArray(order.shipment_checklist) ? order.shipment_checklist : (order.shipment_checklist ? JSON.parse(order.shipment_checklist) : []),
    
    approved_amount: order.approved_amount ?? order.total_amount ?? 0,
    extra_charge_amount: order.extra_charge_amount ?? 0,
    extra_charge_reason: order.extra_charge_reason || '',
    extra_discount_amount: order.extra_discount_amount ?? 0,
    final_billing_amount: order.final_billing_amount ?? ((order.approved_amount ?? order.total_amount ?? 0) + (order.extra_charge_amount ?? 0) - (order.extra_discount_amount ?? 0)),
    total_paid_amount: order.total_paid_amount ?? (order.payment_status === 'paid' || order.payment_status === '입금완료' ? (order.final_billing_amount ?? order.total_amount ?? 0) : 0),
    outstanding_balance: order.outstanding_balance ?? Math.max(0, (order.final_billing_amount ?? order.total_amount ?? 0) - (order.total_paid_amount ?? 0)),

    delivery_method,
    delivery_method_label,
    delivery_fee,
    delivery_fee_status,
    shipping_address,
    freight_branch_name,
    freight_branch_address,
    freight_branch_phone,
    free_shipping_eligible,
    free_shipping_brand,
    free_shipping_area,
    quick_delivery_requested,
    office_pickup_requested,
    accessory_recommendation_shown,
    accessory_recommendation_skipped
  };
};

// 에러 처리 헬퍼 함수
const handleSupabaseError = (error, contextMsg) => {
  console.error(`[OrderService Error] ${contextMsg}:`, error);
  throw new Error(`${contextMsg}: ${error.message || '서버 오류가 발생했습니다.'}`);
};

// 쿼리 타임아웃 래퍼
const withTimeout = (promise, ms = 10000, contextMsg = '데이터베이스 요청') => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${contextMsg} 시간이 초과되었습니다 (타임아웃). 잠시 후 다시 시도해 주세요.`)), ms)
    )
  ]);
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_STORE_USER_ID = '0e628119-fdca-4f94-8400-f5864b712c59';

/**
 * orders.user_id는 NOT NULL 및 profiles.id(UUID) 외래키 제약조건이 있으므로,
 * 로그인 상태, 비회원 주문, fallback 계정 등에 상관없이 유효한 UUID를 안전하게 확인하고 반환합니다.
 */
const resolveValidUserId = async (user, customerEmail) => {
  // 1. 이미 유효한 UUID 형식의 user.id인 경우 즉시 반환
  if (user?.id && UUID_REGEX.test(user.id)) {
    return user.id;
  }

  // 2. user 객체가 있으나 id가 문자열 아이디(예: 'dongk3089')인 경우 profiles에서 UUID 조회
  if (user) {
    const searchKey = user.username || user.id;
    if (searchKey) {
      try {
        const { data: matchedProfile } = await withTimeout(
          supabase
            .from('profiles')
            .select('id')
            .ilike('username', searchKey)
            .limit(1)
            .maybeSingle(),
          4000
        );
        if (matchedProfile?.id && UUID_REGEX.test(matchedProfile.id)) {
          return matchedProfile.id;
        }
      } catch (err) {
        console.warn('[OrderService] Profile lookup by username warning:', err);
      }
    }
  }

  // 3. 주문서에 입력된 고객 이메일로 가입된 프로필이 있는지 조회
  if (customerEmail && customerEmail.trim()) {
    try {
      const cleanEmail = customerEmail.trim();
      const { data: emailProfile } = await withTimeout(
        supabase
          .from('profiles')
          .select('id')
          .or(`username.ilike.${cleanEmail},memo.ilike.%${cleanEmail}%`)
          .limit(1)
          .maybeSingle(),
        4000
      );
      if (emailProfile?.id && UUID_REGEX.test(emailProfile.id)) {
        return emailProfile.id;
      }
    } catch (err) {
      console.warn('[OrderService] Profile lookup by email warning:', err);
    }
  }

  // 4. 비회원이거나 프로필을 찾을 수 없는 경우: 대표 관리자/시스템 계정 UUID 할당 (외래키 제약조건 준수)
  try {
    const { data: adminProfile } = await withTimeout(
      supabase
        .from('profiles')
        .select('id')
        .or('username.eq.dongk3089,role.eq.admin')
        .limit(1)
        .maybeSingle(),
      4000
    );
    if (adminProfile?.id && UUID_REGEX.test(adminProfile.id)) {
      return adminProfile.id;
    }
  } catch (err) {
    console.warn('[OrderService] Admin profile fallback warning:', err);
  }

  return DEFAULT_STORE_USER_ID;
};

// 스키마 컬럼 캐싱 (매 주문마다 3회씩 중복 조회 방지)
let cachedHasShippingColumns = false;
let isSchemaChecked = false;

const checkOrderTableSchema = async () => {
  if (isSchemaChecked) return;
  try {
    const { error: colErr } = await withTimeout(
      supabase.from('orders').select('delivery_method').limit(1),
      3000
    );
    if (!colErr) {
      cachedHasShippingColumns = true;
    }
  } catch {
    cachedHasShippingColumns = false;
  }
  isSchemaChecked = true;
};

/**
 * 1. 주문 생성
 * - orders 테이블에 주문 헤더 추가
 * - order_items 테이블에 상세 품목 추가
 * - 상세 품목 저장 실패 시, 이미 생성된 주문을 'cancelled'(취소) 상태로 업데이트
 */
export const createOrder = async ({ cartItems, customer, paymentMethod }) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다. 환경변수 설정을 확인하세요.');
  }

  if (!cartItems || cartItems.length === 0) {
    throw new Error('장바구니가 비어 있어 주문을 생성할 수 없습니다.');
  }

  const user = getCurrentUser();
  const validUserId = await resolveValidUserId(user, customer?.email);

  // 총액 자동 계산
  const totalAmount = cartItems.reduce((sum, item) => {
    const qty = Math.max(1, parseInt(item.quantity) || 1);
    const price = Math.max(0, parseFloat(item.price || item.unit_price) || 0);
    return sum + (price * qty);
  }, 0);

  // 희망배송일(delivery_date) 및 희망시간(delivery_time)이 존재한다면 memo에 기록
  let finalMemo = customer.memo || '';
  if (customer.delivery_date) {
    const timeTag = customer.delivery_time ? ` [희망시간: ${customer.delivery_time}]` : "";
    finalMemo = `[희망배송일: ${customer.delivery_date}]${timeTag} ${finalMemo}`.trim();
  }

  // 비회원 주문인 경우 메모에 표시
  if (!user || !user.isLoggedIn) {
    if (!finalMemo.includes('[비회원 주문]')) {
      finalMemo = `[비회원 주문] ${finalMemo}`.trim();
    }
  }

  // 방문결제 선택 시 Supabase DB 체크 제약조건(orders_payment_method_check)을 만족하기 위해
  // 컬럼에는 'bank_transfer'로 안전하게 적재하고 memo에 [결제방식: 동경바닥재 매장 방문결제] 태그를 부착하여 UI에서 복원합니다.
  const isStorePayment = (
    paymentMethod === '동경바닥재 방문결제' ||
    paymentMethod === '방문결제' ||
    paymentMethod === '현장결제' ||
    paymentMethod === 'store_payment'
  );

  if (isStorePayment && !finalMemo.includes('[결제방식: 동경바닥재 매장 방문결제]')) {
    finalMemo = `[결제방식: 동경바닥재 매장 방문결제] ${finalMemo}`.trim();
  }

  // 1회성 스키마 확인
  await checkOrderTableSchema();

  const insertPayload = {
    user_id: validUserId,
    customer_name: customer.name,
    company_name: customer.company_name || null,
    phone: customer.phone,
    address: customer.address,
    address_detail: customer.address_detail || null,
    delivery_request_date: customer.delivery_date || null,
    memo: finalMemo,
    subtotal: totalAmount,
    shipping_fee: 0,
    total_amount: totalAmount,
    status: 'submitted', // 접수완료
    payment_method: 'bank_transfer', // DB check constraint(orders_payment_method_check) 준수
    payment_status: 'unpaid', // 미입금
    // 통합 동기화 컬럼들 동시 기록
    customer_phone: customer.phone,
    customer_address: `${customer.address} ${customer.address_detail || ''}`.trim(),
    customer_email: customer.email || null,
    preferred_delivery_date: customer.delivery_date || null
  };

  if (cachedHasShippingColumns) {
    insertPayload.delivery_method = customer.delivery_method || 'cargo';
    insertPayload.delivery_method_label = customer.delivery_method_label || '대신화물 지점 배송';
    insertPayload.delivery_fee = customer.delivery_fee || '별도 안내';
    insertPayload.delivery_fee_status = customer.delivery_fee_status || 'unconfirmed';
    insertPayload.shipping_address = customer.shipping_address || customer.address;
    insertPayload.freight_branch_name = customer.freight_branch_name || null;
    insertPayload.freight_branch_address = customer.freight_branch_address || null;
    insertPayload.freight_branch_phone = customer.freight_branch_phone || null;
    insertPayload.free_shipping_eligible = customer.free_shipping_eligible ?? false;
    insertPayload.free_shipping_brand = customer.free_shipping_brand || null;
    insertPayload.free_shipping_area = customer.free_shipping_area || 0;
    insertPayload.quick_delivery_requested = customer.quick_delivery_requested ?? false;
    insertPayload.office_pickup_requested = customer.office_pickup_requested ?? false;
    insertPayload.accessory_recommendation_shown = customer.accessory_recommendation_shown ?? false;
    insertPayload.accessory_recommendation_skipped = customer.accessory_recommendation_skipped ?? false;
  } else {
    // memo 컬럼의 하단 꼬리표에 포맷팅하여 적재 (Graceful fallback)
    const fallbackText = `\n[배송방식] ${customer.delivery_method_label || '대신화물 지점 배송'} | 배송비: ${customer.delivery_fee || '별도 안내'} (${customer.delivery_fee_status || 'unconfirmed'})\n[${customer.delivery_method === "kyungdong" ? "경동" : "대신"}화물지점] ${customer.freight_branch_name || '없음'} (${customer.freight_branch_address || ''} / ${customer.freight_branch_phone || ''})\n[무료배송여부] ${customer.free_shipping_eligible ? '대상' : '대상아님'} (적용브랜드: ${customer.free_shipping_brand || '없음'}, 합계평수: ${customer.free_shipping_area || 0}평)\n[부자재안내] 노출여부: ${customer.accessory_recommendation_shown ? '노출됨' : '노출안됨'}, 건너뜀여부: ${customer.accessory_recommendation_skipped ? '건너뜀' : '선택완료'}`;
    insertPayload.memo = (insertPayload.memo ? insertPayload.memo + fallbackText : fallbackText.trim());
  }

  // 1. orders 테이블 insert (최대 10초 타임아웃)
  const { data: orderData, error: orderError } = await withTimeout(
    supabase
      .from('orders')
      .insert(insertPayload)
      .select('*')
      .single(),
    10000,
    '주문 헤더 저장'
  );

  if (orderError) {
    return handleSupabaseError(orderError, '주문 생성에 실패했습니다.');
  }

  const orderId = orderData.id;

  // 2. order_items 데이터 매핑 및 insert 준비
  const itemsToInsert = cartItems.map(item => {
    const quantity = Math.max(1, parseInt(item.quantity) || 1);
    const unitPrice = Math.max(0, parseFloat(item.price || item.unit_price) || 0);
    
    // product_id 타입 안전 처리 (정수형 체크)
    const productId = /^\d+$/.test(item.id) ? parseInt(item.id, 10) : null;
    
    return {
      order_id: orderId,
      product_id: productId,
      category: item.category || null,
      brand: item.brand || null,
      product_name: (formatFlooringProductName(item) || '이름 없음') + (item.selectedSize ? ` / ${item.selectedSize}` : ''),
      product_code: item.code || item.product_code || null,
      spec: item.spec || item.specs?.size || item.specs?.thickness || null,
      unit: item.unit || getProductUnit(item) || '평',
      quantity: quantity,
      unit_price: unitPrice,
      image_url: item.image_url || item.image || item.thumbnail || null
    };
  });

  // 3. order_items 테이블 insert (최대 10초 타임아웃)
  const { error: itemsError } = await withTimeout(
    supabase
      .from('order_items')
      .insert(itemsToInsert),
    10000,
    '주문 상세 상품 저장'
  );

  if (itemsError) {
    // order_items 저장 실패 시 롤백 수행 (주문 상태를 'cancelled'로 변경)
    console.warn('[OrderService Warning] order_items insert failed. Rolling back order status to cancelled...');
    try {
      await supabase
        .from('orders')
        .update({ status: 'cancelled', memo: `[시스템오류] 상세 품목 저장 실패로 취소 처리됨 (${itemsError.message})` })
        .eq('id', orderId);
    } catch (rollbackError) {
      console.error('[OrderService Error] Rollback update failed:', rollbackError);
    }

    return handleSupabaseError(itemsError, '주문 상품 등록에 실패하여 주문이 취소되었습니다.');
  }

  const mappedOrder = mapOrderToKo(orderData);
  mappedOrder.order_items = itemsToInsert;
  if (customer.email) {
    mappedOrder.email = customer.email;
  }
  return mappedOrder;
};

/**
 * 2. 현재 로그인 사용자의 주문 내역 조회
 */
export const getMyOrders = async () => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const user = getCurrentUser();
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  const validUserId = await resolveValidUserId(user, user.email);

  const { data, error } = await withTimeout(
    supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', validUserId)
      .order('created_at', { ascending: false }),
    8000,
    '내 주문 목록 조회'
  );

  if (error) {
    return handleSupabaseError(error, '내 주문 목록을 가져오는 중 오류가 발생했습니다.');
  }

  return (data || []).map(mapOrderToKo);
};

/**
 * 3. 관리자 주문 목록 조회 (전체 주문 최신순)
 */
export const getAdminOrders = async () => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    throw new Error('관리자 권한이 없습니다.');
  }

  const { data, error } = await withTimeout(
    supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false }),
    10000,
    '전체 주문 목록 조회'
  );

  if (error) {
    return handleSupabaseError(error, '전체 주문 목록을 가져오는 중 오류가 발생했습니다.');
  }

  return (data || []).map(mapOrderToKo);
};

/**
 * 4. 주문상태 변경
 */
export const updateOrderStatus = async (orderId, status) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const engStatus = STATUS_KO_TO_EN[status] || status;

  const { data, error } = await supabase
    .from('orders')
    .update({ status: engStatus })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    return handleSupabaseError(error, '주문 상태 변경에 실패했습니다.');
  }

  return mapOrderToKo(data);
};

/**
 * 5. 결제상태 변경
 */
export const updatePaymentStatus = async (orderId, paymentStatus) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const engPaymentStatus = PAYMENT_STATUS_KO_TO_EN[paymentStatus] || paymentStatus;

  const { data, error } = await supabase
    .from('orders')
    .update({ payment_status: engPaymentStatus })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    return handleSupabaseError(error, '결제 상태 변경에 실패했습니다.');
  }

  return mapOrderToKo(data);
};

/**
 * 6. 관리자 주문 정보 일괄 업데이트 (상태, 결제상태, 관리자메모)
 * - admin_memo 컬럼이 실존하는지 동적 확인하여 분기 처리하는 하이브리드 로직을 내장합니다.
 */
export const updateOrderAdminFields = async (orderId, { status, paymentStatus, adminMemo }) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const engStatus = STATUS_KO_TO_EN[status] || status;
  const engPaymentStatus = PAYMENT_STATUS_KO_TO_EN[paymentStatus] || paymentStatus;

  // 1. admin_memo 컬럼 존재 여부 판단
  let hasAdminMemoColumn = false;
  try {
    const { error: columnError } = await supabase
      .from('orders')
      .select('admin_memo')
      .limit(1);
    if (!columnError) {
      hasAdminMemoColumn = true;
    }
  } catch (err) {
    console.warn('[OrderService] admin_memo column check failed:', err);
  }

  let updatePayload = {
    status: engStatus,
    payment_status: engPaymentStatus
  };

  if (hasAdminMemoColumn) {
    updatePayload.admin_memo = adminMemo || null;
  } else {
    // admin_memo 컬럼이 없는 경우, 기존 memo 컬럼에 가공하여 보관
    const { data: orderData } = await supabase
      .from('orders')
      .select('memo')
      .eq('id', orderId)
      .maybeSingle();
    
    let originalMemo = orderData?.memo || '';
    const match = originalMemo.match(/(?:\r?\n)?\[관리자 메모\].*$/s);
    if (match) {
      originalMemo = originalMemo.substring(0, match.index).trim();
    }
    
    if (adminMemo && adminMemo.trim() !== '') {
      updatePayload.memo = `${originalMemo}\n[관리자 메모] ${adminMemo.trim()}`.trim();
    } else {
      updatePayload.memo = originalMemo || null;
    }
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    return handleSupabaseError(error, '주문 정보 저장에 실패했습니다.');
  }

  return mapOrderToKo(data);
};

/**
 * 7. 주문 확인 상태 변경 (admin_checked, admin_checked_at, admin_checked_by)
 * - admin_checked 컬럼이 실존하는지 동적 확인하여 분기 처리하는 하이브리드 로직을 내장합니다.
 */
export const updateOrderChecked = async (orderId, username) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  // admin_checked 컬럼 존재 여부 판단
  let hasCheckedColumn = false;
  try {
    const { error: columnError } = await supabase
      .from('orders')
      .select('admin_checked')
      .limit(1);
    if (!columnError) {
      hasCheckedColumn = true;
    }
  } catch (err) {
    console.warn('[OrderService] admin_checked column check failed:', err);
  }

  if (!hasCheckedColumn) {
    // 컬럼이 없는 경우, DB 저장은 스킵하고 메모리 상에서만 업데이트된 객체 형태를 내려줌 (fallback)
    const { data: orderData, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .maybeSingle();

    if (fetchError || !orderData) {
      throw new Error('주문 정보를 찾을 수 없습니다.');
    }

    const mapped = mapOrderToKo(orderData);
    mapped.admin_checked = true;
    mapped.admin_checked_at = new Date().toISOString();
    mapped.admin_checked_by = username || 'admin';
    return mapped;
  }

  // 컬럼이 존재하는 경우 정상적으로 DB 업데이트
  const { data, error } = await supabase
    .from('orders')
    .update({
      admin_checked: true,
      admin_checked_at: new Date().toISOString(),
      admin_checked_by: username || 'admin'
    })
    .eq('id', orderId)
    .select(`
      *,
      order_items (*)
    `)
    .single();

  if (error) {
    return handleSupabaseError(error, '주문 확인 처리에 실패했습니다.');
  }

  return mapOrderToKo(data);
};

/**
 * 8. 시공 일정 업데이트
 */
export const updateOrderConstructionSchedule = async (orderId, {
  construction_date,
  construction_time_slot,
  construction_manager,
  construction_phone,
  construction_memo
}) => {
  if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');

  const updatePayload = {
    construction_date: construction_date || null,
    construction_time_slot: construction_time_slot || null,
    construction_manager: construction_manager || null,
    construction_phone: construction_phone || null,
    construction_memo: construction_memo || null,
    construction_status: construction_date ? '일정 확정' : '일정 미정'
  };

  const { data, error } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)
    .select(`*, order_items (*)`)
    .single();

  if (error) {
    return handleSupabaseError(error, '시공 일정 저장에 실패했습니다.');
  }

  return mapOrderToKo(data);
};

/**
 * 9. 현장 진행 상태 변경 및 타임스탬프 기록
 */
export const updateOrderConstructionStatus = async (orderId, constructionStatus, timestampKey = null) => {
  if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');

  const updatePayload = {
    construction_status: constructionStatus
  };

  if (timestampKey) {
    updatePayload[timestampKey] = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)
    .select(`*, order_items (*)`)
    .single();

  if (error) {
    return handleSupabaseError(error, '현장 진행 상태 업데이트에 실패했습니다.');
  }

  return mapOrderToKo(data);
};

/**
 * 10. 자재 출고 체크리스트 업데이트 및 출고 완료 처리
 */
export const updateOrderShipmentChecklist = async (orderId, checklistItems, isCompleted = false, username = 'admin') => {
  if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');

  const hasUnprepared = checklistItems.some(item => !item.prepared);
  const shipmentStatus = isCompleted 
    ? (hasUnprepared ? '누락있음' : '출고완료')
    : (checklistItems.some(item => item.prepared) ? '준비중' : '대기');

  const updatePayload = {
    shipment_checklist: checklistItems,
    shipment_status: shipmentStatus
  };

  if (isCompleted) {
    updatePayload.shipment_prepared_at = new Date().toISOString();
    updatePayload.shipment_prepared_by = username;
    updatePayload.construction_status = '출고 완료';
  } else if (shipmentStatus === '준비중') {
    updatePayload.construction_status = '출고 준비';
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)
    .select(`*, order_items (*)`)
    .single();

  if (error) {
    return handleSupabaseError(error, '출고 체크리스트 저장에 실패했습니다.');
  }

  return mapOrderToKo(data);
};

/**
 * 11. 시공 완료 및 최종 청구금액 저장
 */
export const saveOrderConstructionCompletion = async (orderId, {
  actual_completion_date,
  actual_construction_area,
  extra_tasks_desc,
  extra_materials_desc,
  site_notes,
  extra_charge_amount = 0,
  extra_charge_reason = '',
  extra_discount_amount = 0
}) => {
  if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');

  // Fetch current order to preserve original approved_amount & total_paid_amount
  const { data: currentOrder, error: fetchErr } = await supabase
    .from('orders')
    .select('total_amount, approved_amount, total_paid_amount')
    .eq('id', orderId)
    .single();

  if (fetchErr || !currentOrder) {
    throw new Error('주문 정보를 찾을 수 없습니다.');
  }

  const approvedAmount = parseFloat(currentOrder.approved_amount || currentOrder.total_amount || 0);
  const extraCharge = Math.max(0, parseFloat(extra_charge_amount) || 0);
  const extraDiscount = Math.max(0, parseFloat(extra_discount_amount) || 0);
  const finalBilling = approvedAmount + extraCharge - extraDiscount;
  const currentPaid = parseFloat(currentOrder.total_paid_amount || 0);
  const outstanding = Math.max(0, finalBilling - currentPaid);

  let newPaymentStatus = currentOrder.payment_status || 'unpaid';
  if (outstanding <= 0 && currentPaid > 0) {
    newPaymentStatus = 'paid';
  } else if (currentPaid > 0 && outstanding > 0) {
    newPaymentStatus = 'partial';
  }

  const updatePayload = {
    actual_completion_date: actual_completion_date || new Date().toISOString().split('T')[0],
    actual_construction_area: actual_construction_area ? parseFloat(actual_construction_area) : null,
    extra_tasks_desc: extra_tasks_desc || null,
    extra_materials_desc: extra_materials_desc || null,
    site_notes: site_notes || null,
    approved_amount: approvedAmount,
    extra_charge_amount: extraCharge,
    extra_charge_reason: extra_charge_reason || null,
    extra_discount_amount: extraDiscount,
    final_billing_amount: finalBilling,
    total_paid_amount: currentPaid,
    outstanding_balance: outstanding,
    payment_status: PAYMENT_STATUS_KO_TO_EN[newPaymentStatus] || newPaymentStatus,
    construction_status: '시공 완료',
    construction_completed_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)
    .select(`*, order_items (*)`)
    .single();

  if (error) {
    return handleSupabaseError(error, '시공 완료 기록에 실패했습니다.');
  }

  return mapOrderToKo(data);
};

/**
 * 12. 입금 이력 등록 및 미수금 자동 산정
 */
export const addOrderPayment = async (orderId, {
  amount,
  payment_method = '계좌이체',
  paid_at,
  memo
}, username = 'admin') => {
  if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error('올바른 입금 금액을 입력해 주세요.');
  }

  // 1. Fetch order details
  const { data: orderData, error: orderErr } = await supabase
    .from('orders')
    .select('approved_amount, total_amount, extra_charge_amount, extra_discount_amount, final_billing_amount, total_paid_amount')
    .eq('id', orderId)
    .single();

  if (orderErr || !orderData) {
    throw new Error('주문 정보를 찾을 수 없습니다.');
  }

  const approvedAmount = parseFloat(orderData.approved_amount || orderData.total_amount || 0);
  const extraCharge = parseFloat(orderData.extra_charge_amount || 0);
  const extraDiscount = parseFloat(orderData.extra_discount_amount || 0);
  const finalBilling = parseFloat(orderData.final_billing_amount || (approvedAmount + extraCharge - extraDiscount));
  const prevPaid = parseFloat(orderData.total_paid_amount || 0);
  const newTotalPaid = prevPaid + numericAmount;
  const newOutstanding = Math.max(0, finalBilling - newTotalPaid);

  let newPaymentStatus = 'unpaid';
  if (newTotalPaid >= finalBilling) {
    newPaymentStatus = 'paid';
  } else if (newTotalPaid > 0) {
    newPaymentStatus = 'partial';
  }

  // 2. Insert into `order_payments`
  const { error: paymentErr } = await supabase
    .from('order_payments')
    .insert({
      order_id: orderId,
      amount: numericAmount,
      payment_method,
      paid_at: paid_at || new Date().toISOString(),
      memo: memo || null,
      created_by: username
    });

  if (paymentErr) {
    console.warn('[addOrderPayment Warning] order_payments insert failed:', paymentErr);
  }

  // 3. Update `orders` header with total_paid_amount, outstanding_balance, payment_status
  const { data: updatedOrder, error: updateErr } = await supabase
    .from('orders')
    .update({
      approved_amount: approvedAmount,
      final_billing_amount: finalBilling,
      total_paid_amount: newTotalPaid,
      outstanding_balance: newOutstanding,
      payment_status: PAYMENT_STATUS_KO_TO_EN[newPaymentStatus] || newPaymentStatus
    })
    .eq('id', orderId)
    .select(`*, order_items (*)`)
    .single();

  if (updateErr) {
    return handleSupabaseError(updateErr, '주문 수금 상태 업데이트에 실패했습니다.');
  }

  return mapOrderToKo(updatedOrder);
};

/**
 * 13. 주문 입금 이력 목록 조회
 */
export const getOrderPayments = async (orderId) => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('order_payments')
    .select('*')
    .eq('order_id', orderId)
    .order('paid_at', { ascending: false });

  if (error) {
    console.warn('[getOrderPayments warning]', error);
    return [];
  }

  return data || [];
};

/**
 * 14. 고객용 주문 정보 보안 마스킹 (내부 관리자 메모, 원가, 출고 작성자 등 제거)
 */
export const sanitizeOrderForCustomer = (order) => {
  if (!order) return null;
  const mapped = mapOrderToKo(order);

  delete mapped.admin_memo;
  delete mapped.admin_checked;
  delete mapped.admin_checked_at;
  delete mapped.admin_checked_by;
  delete mapped.shipment_prepared_by;
  delete mapped.cost_price;
  delete mapped.margin_rate;

  return mapped;
};

