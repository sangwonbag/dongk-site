import { supabase } from '../lib/supabaseClient.js';
import { formatFlooringProductName } from '../utils/brandUtils.js';
import { getCurrentUser } from '../lib/auth.js';

/**
 * 견적문의(Estimate Inquiry) 접수 및 관리를 담당하는 서비스입니다.
 */

// 에러 처리 헬퍼 함수
const handleSupabaseError = (error, contextMsg) => {
  console.error(`[EstimateInquiryService Error] ${contextMsg}:`, error);
  throw new Error(`${contextMsg}: ${error.message || '서버 오류가 발생했습니다.'}`);
};

/**
 * 1. 견적문의 생성 (접수)
 * 원자성 보장을 위해 RPC 함수(create_estimate_with_items)를 우선 시도하며,
 * 실패 시 클라이언트 측 2단계 저장 및 보상 트랜잭션(Rollback Delete)을 대체 수단으로 실행합니다.
 */
export const createEstimateInquiry = async (payload) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다. 환경변수 설정을 확인하세요.');
  }

  // 0. 로그인 회원만 견적 접수 저장 가능하도록 검증 (서버/서비스 차단)
  // 클라이언트 페이로드의 user_id를 맹신하지 않고, 현재 세션/로그인 유저 기준 user_id로 강제 할당
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.id) {
    throw new Error('UNAUTHORIZED: 견적 신청은 로그인 후 이용할 수 있습니다.');
  }

  const userId = currentUser.id;

  // 자재 상세 품목 정보 정제
  const itemsToInsert = (payload.selected_items || []).map((item, idx) => ({
    sort_order: idx + 1,
    category: item.category || null,
    brand: item.brand || null,
    product_code: item.product_code || item.code || null,
    product_name: formatFlooringProductName(item) || '',
    spec: item.spec || item.size || null,
    quantity: item.quantity || 1,
    unit_price: item.unit_price || 0,
    supply_amount: item.supply_amount || 0
  }));

  // [운영 가이드] 오직 RPC 단일 경로 트랜잭션으로만 저장하며, 클라이언트 fallback은 제거
  const { data: rpcData, error: rpcError } = await supabase.rpc('create_estimate_with_items', {
    p_customer_type: payload.customer_type || '일반 소비자',
    p_customer_name: payload.customer_name,
    p_phone: payload.phone,
    p_email: payload.email || null,
    p_site_address: payload.site_address,
    p_site_detail_address: payload.site_detail_address || null,
    p_preferred_date: payload.preferred_date || null,
    p_consultation_type: payload.consultation_type || '전화 상담',
    p_site_type: payload.site_type || '아파트',
    p_work_type: payload.work_type || '상담 후 결정',
    p_area_pyeong: payload.area_pyeong ? Number(payload.area_pyeong) : null,
    p_has_elevator: payload.has_elevator === true,
    p_parking_available: payload.parking_available === true,
    p_accessory_options: payload.accessory_options || [],
    p_extra_accessory_text: payload.extra_accessory_text || null,
    p_request_memo: payload.request_memo || null,
    p_subtotal: payload.subtotal || 0,
    p_total: payload.total || 0,
    p_items: itemsToInsert
  });

  if (rpcError) {
    return handleSupabaseError(rpcError, '견적요청 저장에 실패했습니다. (DB 오류)');
  }

  if (!rpcData) {
    throw new Error('견적요청 저장 후 데이터가 생성되지 않았습니다.');
  }

  // 로그인 사용자 user_id 연결 보장 (estimates 테이블의 user_id 컬럼에 연결)
  if (userId && rpcData.id) {
    try {
      await supabase.from('estimates').update({ user_id: userId }).eq('id', rpcData.id);
    } catch (e) {
      console.warn('[EstimateInquiryService] user_id update warning:', e);
    }
  }

  return { ...rpcData, user_id: userId };
};


/**
 * 2. 견적문의 목록 조회 (관리자용, 전체 목록 최신순)
 */
export const getEstimateInquiries = async () => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  // 1. Try join query with estimate_items child records first
  let estimatesData = null;
  let fetchError = null;

  try {
    const { data, error } = await supabase
      .from('estimates')
      .select('*, estimate_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      fetchError = error;
    } else {
      estimatesData = data;
    }
  } catch (err) {
    fetchError = err;
  }

  // 2. Fallback to basic query if join is not available
  if (fetchError || !estimatesData) {
    const { data: simpleData, error: simpleErr } = await supabase
      .from('estimates')
      .select('*')
      .order('created_at', { ascending: false });

    if (simpleErr) {
      return handleSupabaseError(simpleErr, '견적문의 목록을 가져오는 중 오류가 발생했습니다.');
    }
    estimatesData = simpleData || [];
  }

  // Normalize selected_items: if estimate_items child records exist, populate selected_items
  const normalized = (estimatesData || []).map(est => {
    let items = est.selected_items;
    if ((!items || items.length === 0) && est.estimate_items && est.estimate_items.length > 0) {
      items = est.estimate_items.map(i => ({
        product_id: i.product_id,
        category: i.category,
        brand: i.brand,
        code: i.product_code || i.code,
        product_code: i.product_code || i.code,
        name: i.product_name || i.name,
        spec: i.spec,
        quantity: i.quantity,
        unit_price: i.unit_price,
        supply_amount: i.supply_amount
      }));
    }

    // Map legacy status strings to standard UI status strings if needed
    let mappedStatus = est.status || '신규 접수';
    if (mappedStatus === '접수' || mappedStatus === '접수대기') mappedStatus = '신규 접수';
    else if (mappedStatus === '상담중') mappedStatus = '상담 중';
    else if (mappedStatus === '견적완료') mappedStatus = '견적 안내';
    else if (mappedStatus === '주문전환') mappedStatus = '진행 확정';

    return {
      ...est,
      status: mappedStatus,
      raw_status: est.status,
      selected_items: items || []
    };
  });

  return normalized;
};

/**
 * 3. 견적문의 상세 조회
 */
export const getEstimateInquiryById = async (id) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('estimates')
    .select('*, estimate_items(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    return handleSupabaseError(error, '견적문의 정보를 가져오는 중 오류가 발생했습니다.');
  }

  if (data && (!data.selected_items || data.selected_items.length === 0) && data.estimate_items) {
    data.selected_items = data.estimate_items.map(i => ({
      product_id: i.product_id,
      category: i.category,
      brand: i.brand,
      code: i.product_code || i.code,
      product_code: i.product_code || i.code,
      name: i.product_name || i.name,
      spec: i.spec,
      quantity: i.quantity,
      unit_price: i.unit_price,
      supply_amount: i.supply_amount
    }));
  }

  return data;
};

/**
 * 4. 견적문의 상태 변경
 */
export const updateEstimateInquiryStatus = async (id, status) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('estimates')
    .update({ 
      status,
      updated_at: now
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return handleSupabaseError(error, '견적문의 상태 변경에 실패했습니다.');
  }

  return data;
};

/**
 * 5. 견적문의 관리자 메모 및 상태 통합 변경 (낙관적 락 지원)
 */
export const updateEstimateInquiryAdminMemo = async (id, adminMemo, options = {}) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { expectedUpdatedAt, status } = options;

  // Optimistic concurrency check: Verify if record was modified by another admin in the meantime
  if (expectedUpdatedAt) {
    const { data: currentRecord } = await supabase
      .from('estimates')
      .select('updated_at')
      .eq('id', id)
      .maybeSingle();

    if (currentRecord && currentRecord.updated_at && new Date(currentRecord.updated_at) > new Date(expectedUpdatedAt)) {
      throw new Error('다른 관리자가 상담 내역을 수정했습니다. 최신 내용을 확인한 후 다시 시도해 주세요.');
    }
  }

  const now = new Date().toISOString();
  const updatePayload = {
    admin_memo: adminMemo || null,
    updated_at: now
  };

  if (status) {
    updatePayload.status = status;
  }

  const { data, error } = await supabase
    .from('estimates')
    .update(updatePayload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return handleSupabaseError(error, '견적문의 관리자 메모 저장에 실패했습니다.');
  }

  return data;
};

/**
 * 6. 선택 자재 품목의 수량 및 단가 수정 (관리자용)
 */
export const updateEstimateItems = async (estimateId, updatedItems) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  // 1. Check if estimates table has selected_items JSONB column
  const { data: currentEstimate, error: fetchErr } = await supabase
    .from('estimates')
    .select('*, estimate_items(*)')
    .eq('id', estimateId)
    .single();

  if (fetchErr) {
    return handleSupabaseError(fetchErr, '견적 정보를 불러오는 중 오류가 발생했습니다.');
  }

  const sanitizedItems = (updatedItems || []).map((item, idx) => ({
    ...item,
    sort_order: idx + 1,
    quantity: Math.max(1, Number(item.quantity) || 1),
    unit_price: Math.max(0, Number(item.unit_price) || 0),
    supply_amount: Math.max(0, (Number(item.quantity) || 1) * (Number(item.unit_price) || 0))
  }));

  const now = new Date().toISOString();

  // Try updating estimates table selected_items
  const { data: updatedEst, error: updateEstErr } = await supabase
    .from('estimates')
    .update({
      selected_items: sanitizedItems,
      updated_at: now
    })
    .eq('id', estimateId)
    .select('*, estimate_items(*)')
    .single();

  // If estimate_items table records exist, update them as well
  if (currentEstimate.estimate_items && currentEstimate.estimate_items.length > 0) {
    for (const item of sanitizedItems) {
      if (item.id) {
        await supabase
          .from('estimate_items')
          .update({
            quantity: item.quantity,
            unit_price: item.unit_price,
            supply_amount: item.supply_amount,
            product_name: item.product_name || item.name,
            spec: item.spec,
            updated_at: now
          })
          .eq('id', item.id);
      }
    }
  }

  if (updateEstErr) {
    // If selected_items column doesn't exist, return object with sanitized items
    return {
      ...currentEstimate,
      selected_items: sanitizedItems,
      updated_at: now
    };
  }

  return {
    ...updatedEst,
    selected_items: sanitizedItems
  };
};

/**
 * 7. 최종 견적 확정 (관리자용)
 */
export const confirmEstimateQuote = async (id, quotePayload, currentUser) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const {
    material_fee = 0,
    sub_material_fee = 0,
    construction_fee = 0,
    demolition_fee = 0,
    transport_fee = 0,
    extra_fee = 0,
    discount_fee = 0,
    final_amount = 0,
    valid_until = null,
    admin_quote_memo = '',
    items = []
  } = quotePayload;

  // Calculate final amount validation check
  const calculatedTotal = (
    Number(material_fee) +
    Number(sub_material_fee) +
    Number(construction_fee) +
    Number(demolition_fee) +
    Number(transport_fee) +
    Number(extra_fee) -
    Number(discount_fee)
  );

  const finalTotal = Math.max(0, Number(final_amount) >= 0 ? Number(final_amount) : calculatedTotal);

  const now = new Date().toISOString();
  const userName = currentUser?.name || currentUser?.email || 'admin';

  // Check column existence dynamically for quote confirmation fields
  let hasQuoteColumns = false;
  try {
    const { error: colErr } = await supabase
      .from('estimates')
      .select('quote_confirmed')
      .limit(1);
    if (!colErr) {
      hasQuoteColumns = true;
    }
  } catch (err) {
    console.warn('[EstimateInquiryService] quote_confirmed column check failed:', err);
  }

  const updateFields = {
    updated_at: now
  };

  if (hasQuoteColumns) {
    updateFields.quote_confirmed = true;
    updateFields.quote_confirmed_at = now;
    updateFields.quote_confirmed_by = userName;
    updateFields.material_fee = Number(material_fee);
    updateFields.sub_material_fee = Number(sub_material_fee);
    updateFields.construction_fee = Number(construction_fee);
    updateFields.demolition_fee = Number(demolition_fee);
    updateFields.transport_fee = Number(transport_fee);
    updateFields.extra_fee = Number(extra_fee);
    updateFields.discount_fee = Number(discount_fee);
    updateFields.final_amount = finalTotal;
    updateFields.total = finalTotal;
    updateFields.valid_until = valid_until || null;
    updateFields.admin_quote_memo = admin_quote_memo || null;
  } else {
    // Graceful fallback: append quote breakdown to admin_memo if columns do not exist yet
    const quoteSummaryTag = `\n[최종견적확정] 자재:${material_fee}원, 부자재:${sub_material_fee}원, 시공:${construction_fee}원, 철거:${demolition_fee}원, 운반:${transport_fee}원, 기타:${extra_fee}원, 할인:${discount_fee}원 => 최종:${finalTotal}원 (유효기간: ${valid_until || '미정'}, 확정자: ${userName})`;
    
    const { data: currentRecord } = await supabase.from('estimates').select('admin_memo').eq('id', id).single();
    const cleanMemo = (currentRecord?.admin_memo || '').replace(/\[최종견적확정\].*$/m, '').trim();
    updateFields.admin_memo = (cleanMemo ? cleanMemo + quoteSummaryTag : quoteSummaryTag.trim());
    updateFields.total = finalTotal;
  }

  // Update items if provided
  if (items && items.length > 0) {
    updateFields.selected_items = items;
  }

  // Status transitions to '견적 안내' if currently '신규 접수' or '상담 중'
  const { data: existingEst } = await supabase.from('estimates').select('status, quote_version, customer_response').eq('id', id).single();
  if (existingEst && (existingEst.status === '신규 접수' || existingEst.status === '상담 중' || existingEst.status === '접수')) {
    updateFields.status = '견적 안내';
  }

  // Increment quote_version if quote was previously confirmed or modified
  const nextVersion = (existingEst?.quote_version || 1) + (hasQuoteColumns ? 1 : 0);
  if (hasQuoteColumns) {
    updateFields.quote_version = nextVersion;
    // Invalidate prior customer approval upon admin re-quote
    if (existingEst?.customer_response === 'approved') {
      updateFields.customer_approved = false;
      updateFields.customer_response = 'pending';
      updateFields.approved_quote_version = null;
      updateFields.approved_amount = null;
    }
  }

  const { data, error } = await supabase
    .from('estimates')
    .update(updateFields)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return handleSupabaseError(error, '최종 견적 확정에 실패했습니다.');
  }

  return {
    ...data,
    quote_confirmed: true,
    quote_confirmed_at: now,
    quote_confirmed_by: userName,
    quote_version: nextVersion,
    material_fee: Number(material_fee),
    sub_material_fee: Number(sub_material_fee),
    construction_fee: Number(construction_fee),
    demolition_fee: Number(demolition_fee),
    transport_fee: Number(transport_fee),
    extra_fee: Number(extra_fee),
    discount_fee: Number(discount_fee),
    final_amount: finalTotal,
    valid_until: valid_until || null,
    admin_quote_memo: admin_quote_memo || null
  };
};

/**
 * 8. 상담건 -> 주문으로 전환
 * - 이미 전환된 경우 중복 생성 방지
 * - orders 및 order_items 테이블에 신규 생성
 * - estimates 테이블에 converted_order_id, converted_order_no 저장
 */
export const convertEstimateToOrder = async (estimateId, currentUser) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  // 1. Fetch current estimate details
  const { data: estimate, error: fetchErr } = await supabase
    .from('estimates')
    .select('*, estimate_items(*)')
    .eq('id', estimateId)
    .single();

  if (fetchErr || !estimate) {
    throw new Error('상담 접수 내역을 불러올 수 없습니다.');
  }

  // 2. Duplicate conversion check (DB & field checks)
  if (estimate.converted_order_id) {
    throw new Error(`이미 주문으로 전환된 상담건입니다. (주문번호: ${estimate.converted_order_no || 'DK-주문'})`);
  }

  // 3. Prepare order payload
  const itemsSource = (estimate.selected_items && estimate.selected_items.length > 0)
    ? estimate.selected_items
    : (estimate.estimate_items || []);

  if (itemsSource.length === 0) {
    throw new Error('선택된 자재 품목이 없어 주문으로 전환할 수 없습니다.');
  }

  const cartItems = itemsSource.map(item => ({
    id: item.product_id || item.id || 9999,
    category: item.category || '자재',
    brand: item.brand || '기타',
    product_name: item.product_name || item.name || '자재 상품',
    code: item.product_code || item.code || '',
    product_code: item.product_code || item.code || '',
    spec: item.spec || item.size || '',
    unit: item.unit || '평',
    quantity: Math.max(1, Number(item.quantity) || 1),
    unit_price: Math.max(0, Number(item.unit_price) || 0),
    price: Math.max(0, Number(item.unit_price) || 0),
    image_url: item.thumbnail || item.thumbnail_url || item.image_url || null
  }));

  const customerPayload = {
    name: estimate.customer_name || '고객',
    phone: estimate.phone || '',
    email: estimate.email || null,
    address: estimate.site_address || estimate.address || '',
    address_detail: estimate.site_detail_address || '',
    delivery_date: estimate.preferred_date || estimate.desired_date || null,
    // CRITICAL: Internal admin notes MUST NOT leak to customer memo!
    memo: `[시공상담전환] 접수번호: ${estimate.estimate_no || estimate.id.substring(0, 8)}\n${estimate.request_memo || ''}`.trim()
  };

  // Generate unique order number (e.g., DK-YYYYMMDD-XXXX)
  const today = new Date();
  const dateStr = today.getFullYear() +
    String(today.getMonth() + 1).padStart(2, '0') +
    String(today.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNo = `DK-${dateStr}-${randomSuffix}`;

  // 4. Create Order using orders table
  const user = currentUser || {};
  const totalAmount = estimate.final_amount && Number(estimate.final_amount) > 0
    ? Number(estimate.final_amount)
    : (estimate.total && Number(estimate.total) > 0 ? Number(estimate.total) : cartItems.reduce((acc, i) => acc + (i.quantity * i.unit_price), 0));

  const insertOrderPayload = {
    order_no: orderNo,
    user_id: estimate.user_id || null,
    customer_name: customerPayload.name,
    phone: customerPayload.phone,
    email: customerPayload.email,
    address: customerPayload.address,
    address_detail: customerPayload.address_detail,
    delivery_request_date: customerPayload.delivery_date,
    memo: customerPayload.memo,
    subtotal: totalAmount,
    shipping_fee: 0,
    total_amount: totalAmount,
    status: 'submitted', // 접수완료
    payment_method: 'bank_transfer',
    payment_status: 'unpaid'
  };

  // Check if source_estimate_id column exists in orders
  try {
    const { error: colCheck } = await supabase.from('orders').select('source_estimate_id').limit(1);
    if (!colCheck) {
      insertOrderPayload.source_estimate_id = estimate.id;
      insertOrderPayload.source_estimate_no = estimate.estimate_no || estimate.id.substring(0, 8);
    }
  } catch (e) {
    console.warn('[EstimateInquiryService] source_estimate_id check failed:', e);
  }

  const { data: createdOrder, error: orderErr } = await supabase
    .from('orders')
    .insert(insertOrderPayload)
    .select('*')
    .single();

  if (orderErr) {
    return handleSupabaseError(orderErr, '주문 생성에 실패했습니다.');
  }

  // 5. Create Order Items
  const itemsToInsert = cartItems.map(item => ({
    order_id: createdOrder.id,
    product_id: /^\d+$/.test(String(item.id)) ? Number(item.id) : null,
    category: item.category,
    brand: item.brand,
    product_name: item.product_name,
    product_code: item.product_code,
    spec: item.spec,
    unit: item.unit,
    quantity: item.quantity,
    unit_price: item.unit_price,
    image_url: item.image_url
  }));

  const { error: itemsErr } = await supabase
    .from('order_items')
    .insert(itemsToInsert);

  if (itemsErr) {
    console.error('[Order Items Insert Failed]', itemsErr);
    // Rollback order
    await supabase.from('orders').delete().eq('id', createdOrder.id);
    throw new Error(`주문 품목 생성 중 오류가 발생했습니다: ${itemsErr.message}`);
  }

  // 6. Update estimate record to mark conversion & lock against double-conversion
  const now = new Date().toISOString();
  let hasConvertedCols = false;
  try {
    const { error: checkEstCols } = await supabase.from('estimates').select('converted_order_id').limit(1);
    if (!checkEstCols) {
      hasConvertedCols = true;
    }
  } catch (e) {
    console.warn('[EstimateInquiryService] converted_order_id check failed:', e);
  }

  const estimateUpdatePayload = {
    status: '진행 확정',
    updated_at: now
  };

  if (hasConvertedCols) {
    estimateUpdatePayload.converted_order_id = createdOrder.id;
    estimateUpdatePayload.converted_order_no = createdOrder.order_no || orderNo;
    estimateUpdatePayload.converted_at = now;
  } else {
    // Fallback: append converted_order_id tag into admin_memo
    const tag = `\n[주문전환완료] 주문ID:${createdOrder.id}, 주문번호:${createdOrder.order_no || orderNo}, 전환일시:${now}`;
    const cleanMemo = (estimate.admin_memo || '').replace(/\[주문전환완료\].*$/m, '').trim();
    estimateUpdatePayload.admin_memo = (cleanMemo ? cleanMemo + tag : tag.trim());
  }

  const { data: updatedEstimate, error: updateEstErr } = await supabase
    .from('estimates')
    .update(estimateUpdatePayload)
    .eq('id', estimateId)
    .select('*')
    .single();

  if (updateEstErr) {
    console.error('[Estimate Update Failed]', updateEstErr);
  }

  return {
    order: createdOrder,
    estimate: {
      ...updatedEstimate,
      converted_order_id: createdOrder.id,
      converted_order_no: createdOrder.order_no || orderNo,
      converted_at: now,
      status: '진행 확정'
    }
  };
};

/**
 * Security Data Sanitizer Helper: Removes internal admin notes & margins before returning data to customer
 */
export const sanitizeEstimateForCustomer = (est) => {
  if (!est) return null;
  const copy = { ...est };
  delete copy.admin_memo;
  delete copy.admin_quote_memo;
  delete copy.quote_confirmed_by;
  delete copy.cost_price;
  delete copy.margin_rate;

  // Derive expiration status
  const now = new Date();
  if (copy.valid_until && new Date(copy.valid_until) < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    copy.is_expired = true;
  } else {
    copy.is_expired = false;
  }

  // Derive version mismatch flag
  if (copy.approved_quote_version && copy.quote_version && copy.approved_quote_version < copy.quote_version) {
    copy.version_mismatch = true;
  } else {
    copy.version_mismatch = false;
  }

  return copy;
};

/**
 * 9. 고객용 견적목록 조회 (소유권 검증 및 보안 정제 적용)
 */
export const getCustomerEstimates = async (user, guestCredentials = null) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  let query = supabase.from('estimates').select('*, estimate_items(*)').order('created_at', { ascending: false });

  if (user && user.id) {
    // 회원 조회 시 본인 user_id에 귀속된 견적만 엄격하게 필터링 (전화번호 임의 매칭 차단)
    query = query.eq('user_id', user.id);
  } else if (guestCredentials && guestCredentials.estimate_no && guestCredentials.phone) {
    // 과거 비회원 접수 데이터(user_id IS NULL)에 한해 견적번호 + 전화번호 일치 조회 허용
    query = query.eq('estimate_no', guestCredentials.estimate_no).eq('phone', guestCredentials.phone).is('user_id', null);
  } else {
    return [];
  }

  const { data, error } = await query;
  if (error) {
    return handleSupabaseError(error, '고객 견적 목록을 가져오는 중 오류가 발생했습니다.');
  }

  return (data || []).map(sanitizeEstimateForCustomer);
};

/**
 * 10. 고객용 견적 상세 조회 (소유권 엄격 검증 및 보안 정제 적용)
 */
export const getCustomerEstimateById = async (id, user, guestCredentials = null) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('estimates')
    .select('*, estimate_items(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    return handleSupabaseError(error, '견적 상세 조회 중 오류가 발생했습니다.');
  }

  if (!data) {
    throw new Error('존재하지 않는 견적입니다.');
  }

  // Strict ownership check
  let isAuthorized = false;

  if (user && user.role === 'admin') {
    isAuthorized = true;
  } else if (user && user.id) {
    // 회원은 오직 본인의 user_id와 일치하는 견적만 접근 가능 (타 회원 및 과거 비회원 타인 조회 전면 차단)
    if (data.user_id === user.id) {
      isAuthorized = true;
    }
  } else if (guestCredentials && guestCredentials.phone && guestCredentials.estimate_no) {
    // 비회원은 user_id가 없는 과거 레거시 견적에 한해 견적번호와 전화번호가 모두 일치해야만 조회 허용
    if (!data.user_id && data.estimate_no === guestCredentials.estimate_no && data.phone === guestCredentials.phone) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    throw new Error('접근 권한이 없거나 다른 고객의 견적 내역입니다.');
  }

  return sanitizeEstimateForCustomer(data);
};

/**
 * 11. 고객 견적 승인 (`[이 견적으로 진행하기]`)
 */
export const approveEstimateByCustomer = async (id, { schedule_request_note = '', expected_version = 1 }, user, guestCredentials = null) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  // 1. Ownership & Current State Verification
  const estimate = await getCustomerEstimateById(id, user, guestCredentials);

  if (estimate.is_expired) {
    throw new Error('견적 유효기간이 만료되었습니다. 관리자에게 재견적을 문의해 주세요.');
  }

  // Version concurrency check
  if (estimate.quote_version && Number(expected_version) < Number(estimate.quote_version)) {
    throw new Error('견적 내용이 변경되었습니다. 최신 견적을 다시 확인해 주세요.');
  }

  const now = new Date().toISOString();
  const updatePayload = {
    customer_approved: true,
    customer_approved_at: now,
    customer_response: 'approved',
    approved_amount: estimate.final_amount || estimate.total || 0,
    approved_quote_version: estimate.quote_version || 1,
    schedule_request_note: schedule_request_note || null,
    updated_at: now
  };

  const { data, error } = await supabase
    .from('estimates')
    .update(updatePayload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return handleSupabaseError(error, '고객 견적 승인 처리에 실패했습니다.');
  }

  return sanitizeEstimateForCustomer(data);
};

/**
 * 12. 고객 견적 보류 (`[조금 더 고민할게요]`)
 */
export const holdEstimateByCustomer = async (id, user, guestCredentials = null) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  await getCustomerEstimateById(id, user, guestCredentials);

  const now = new Date().toISOString();
  const updatePayload = {
    customer_response: 'on_hold',
    status: '보류',
    updated_at: now
  };

  const { data, error } = await supabase
    .from('estimates')
    .update(updatePayload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return handleSupabaseError(error, '고객 보류 처리에 실패했습니다.');
  }

  return sanitizeEstimateForCustomer(data);
};

/**
 * 13. 관리자 시공 일정 저장
 */
export const updateConstructionSchedule = async (id, schedulePayload, currentUser) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const {
    construction_date = null,
    construction_time_slot = '미정',
    construction_manager = '',
    construction_phone = '',
    construction_memo = ''
  } = schedulePayload;

  const now = new Date().toISOString();
  const updatePayload = {
    construction_date: construction_date || null,
    construction_time_slot: construction_time_slot || null,
    construction_manager: construction_manager || null,
    construction_phone: construction_phone || null,
    construction_memo: construction_memo || null,
    updated_at: now
  };

  const { data, error } = await supabase
    .from('estimates')
    .update(updatePayload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return handleSupabaseError(error, '시공 일정 저장에 실패했습니다.');
  }

  return data;
};


