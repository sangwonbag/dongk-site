import { supabase } from '../lib/supabaseClient';
import { getCurrentUser } from '../lib/auth';
import { formatFlooringProductName, getProductUnit } from '../utils/brandUtils';

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
      else if (delivery_method_label.includes("퀵")) delivery_method = "quick";
      else if (delivery_method_label.includes("직접")) delivery_method = "pickup";
      else delivery_method = "cargo";
    }

    const branchMatch = memoText.match(/\[대신화물지점\]\s*([^\n(]+)\s*\(([^/]+)\/\s*([^)]*)\)/);
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
      .replace(/\[대신화물지점\].*$/m, "")
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

  return {
    ...order,
    status: STATUS_EN_TO_KO[order.status] || order.status,
    payment_method: PAYMENT_METHOD_EN_TO_KO[order.payment_method] || order.payment_method,
    payment_status: PAYMENT_STATUS_EN_TO_KO[order.payment_status] || order.payment_status,
    memo: memoText,
    admin_memo: adminMemoText,
    
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
  const userId = user ? user.id : null;

  // 총액 자동 계산
  const totalAmount = cartItems.reduce((sum, item) => {
    const qty = Math.max(1, parseInt(item.quantity) || 1);
    const price = Math.max(0, parseFloat(item.price || item.unit_price) || 0);
    return sum + (price * qty);
  }, 0);

  // 희망배송일(delivery_date) 및 희망시간(delivery_time)이 존재한다면 memo에 기록
  let finalMemo = customer.memo || null;
  if (customer.delivery_date) {
    const timeTag = customer.delivery_time ? ` [희망시간: ${customer.delivery_time}]` : "";
    finalMemo = `[희망배송일: ${customer.delivery_date}]${timeTag} ${customer.memo || ''}`.trim();
  }

  // 이메일 컬럼명 동적 판별 (customer_email 또는 email)
  let emailColName = null;
  try {
    const { error: colError1 } = await supabase
      .from('orders')
      .select('customer_email')
      .limit(1);
    if (!colError1) {
      emailColName = 'customer_email';
    } else {
      const { error: colError2 } = await supabase
        .from('orders')
        .select('email')
        .limit(1);
      if (!colError2) {
        emailColName = 'email';
      }
    }
  } catch (e) {
    console.warn('[OrderService] Email column dynamic scan warning:', e);
  }

  // 배송정보 신규 컬럼들 존재 여부 동적 감지
  let hasShippingColumns = false;
  try {
    const { error: checkColError } = await supabase
      .from('orders')
      .select('delivery_method')
      .limit(1);
    if (!checkColError) {
      hasShippingColumns = true;
    }
  } catch (e) {
    console.warn('[OrderService] Shipping columns check failed:', e);
  }

  const insertPayload = {
    user_id: userId,
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
    payment_method: (PAYMENT_METHOD_KO_TO_EN[paymentMethod] === 'store_payment' ? 'store_payment' : 'bank_transfer'),
    payment_status: 'unpaid' // 미입금
  };

  if (hasShippingColumns) {
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
    // 컬럼이 아직 마이그레이션 전인 경우 memo 컬럼의 하단 꼬리표에 포맷팅하여 적재 (Graceful fallback)
    const fallbackText = `\n[배송방식] ${customer.delivery_method_label || '대신화물 지점 배송'} | 배송비: ${customer.delivery_fee || '별도 안내'} (${customer.delivery_fee_status || 'unconfirmed'})\n[대신화물지점] ${customer.freight_branch_name || '없음'} (${customer.freight_branch_address || ''} / ${customer.freight_branch_phone || ''})\n[무료배송여부] ${customer.free_shipping_eligible ? '대상' : '대상아님'} (적용브랜드: ${customer.free_shipping_brand || '없음'}, 합계평수: ${customer.free_shipping_area || 0}평)\n[부자재안내] 노출여부: ${customer.accessory_recommendation_shown ? '노출됨' : '노출안됨'}, 건너뜀여부: ${customer.accessory_recommendation_skipped ? '건너뜀' : '선택완료'}`;
    insertPayload.memo = (insertPayload.memo ? insertPayload.memo + fallbackText : fallbackText.trim());
  }

  // 이메일 컬럼이 실존하고 입력값이 있을 시 페이로드에 동적 가산
  if (emailColName && customer.email) {
    insertPayload[emailColName] = customer.email;
  }

  // 1. orders 테이블 insert
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert(insertPayload)
    .select('*')
    .single();

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

  // 3. order_items 테이블 insert
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsToInsert);

  if (itemsError) {
    // order_items 저장 실패 시 롤백 수행 (주문 상태를 'cancelled'로 변경)
    console.warn('[OrderService Warning] order_items insert failed. Rolling back order status to cancelled...');
    const { error: rollbackError } = await supabase
      .from('orders')
      .update({ status: 'cancelled', memo: `[시스템오류] 상세 품목 저장 실패로 취소 처리됨 (${itemsError.message})` })
      .eq('id', orderId);

    if (rollbackError) {
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

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

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

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .order('created_at', { ascending: false });

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
