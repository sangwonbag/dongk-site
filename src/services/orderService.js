import { supabase } from '../lib/supabaseClient';
import { getCurrentUser } from '../lib/auth';

/**
 * 실제 주문 접수 기능을 담당하는 서비스입니다.
 */

// 에러 처리 헬퍼 함수
const handleSupabaseError = (error, contextMsg) => {
  console.error(`[OrderService Error] ${contextMsg}:`, error);
  throw new Error(`${contextMsg}: ${error.message || '서버 오류가 발생했습니다.'}`);
};

/**
 * 1. 주문 생성
 * - orders 테이블에 주문 헤더 추가
 * - order_items 테이블에 상세 품목 추가
 * - 상세 품목 저장 실패 시, 이미 생성된 주문을 '취소' 상태로 업데이트(롤백 유사 기능)
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

  // 1. orders 테이블 insert
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      customer_name: customer.name,
      company_name: customer.company_name || null,
      phone: customer.phone,
      address: customer.address,
      address_detail: customer.address_detail || null,
      delivery_request_date: customer.delivery_date || null,
      memo: customer.memo || null,
      payment_method: paymentMethod,
      payment_status: '미입금', // 기본값
      status: '접수', // 기본값
      total_amount: totalAmount
    })
    .select('id, order_no, customer_name, phone, total_amount, status')
    .single();

  if (orderError) {
    return handleSupabaseError(orderError, '주문 생성에 실패했습니다.');
  }

  const orderId = orderData.id;

  // 2. order_items 데이터 매핑 및 insert 준비
  const itemsToInsert = cartItems.map(item => {
    const quantity = Math.max(1, parseInt(item.quantity) || 1);
    const unitPrice = Math.max(0, parseFloat(item.price || item.unit_price) || 0);
    
    return {
      order_id: orderId,
      category: item.category || null,
      brand: item.brand || null,
      product_name: item.name || item.product_name || '이름 없음',
      product_code: item.code || item.product_code || null,
      spec: item.spec || null,
      unit: item.unit || '평',
      quantity: quantity,
      unit_price: unitPrice,
      image_url: item.image_url || item.image || null
    };
  });

  // 3. order_items 테이블 insert
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsToInsert);

  if (itemsError) {
    // order_items 저장 실패 시 롤백 수행 (주문 상태를 '취소'로 변경)
    console.warn('[OrderService Warning] order_items insert failed. Rolling back order status to 취소...');
    const { error: rollbackError } = await supabase
      .from('orders')
      .update({ status: '취소', memo: `[시스템오류] 상세 품목 저장 실패로 취소 처리됨 (${itemsError.message})` })
      .eq('id', orderId);

    if (rollbackError) {
      console.error('[OrderService Error] Rollback update failed:', rollbackError);
    }

    return handleSupabaseError(itemsError, '주문 상품 등록에 실패하여 주문이 취소되었습니다.');
  }

  return orderData;
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

  return data;
};

/**
 * 3. 관리자 주문 목록 조회 (전체 주문 최신순)
 */
export const getAdminOrders = async () => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const user = getCurrentUser();
  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
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

  return data;
};

/**
 * 4. 주문상태 변경
 */
export const updateOrderStatus = async (orderId, status) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    return handleSupabaseError(error, '주문 상태 변경에 실패했습니다.');
  }

  return data;
};

/**
 * 5. 결제상태 변경
 */
export const updatePaymentStatus = async (orderId, paymentStatus) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ payment_status: paymentStatus })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    return handleSupabaseError(error, '결제 상태 변경에 실패했습니다.');
  }

  return data;
};
