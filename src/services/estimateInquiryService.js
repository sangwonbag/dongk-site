import { supabase } from '../lib/supabaseClient.js';
import { formatFlooringProductName } from '../utils/brandUtils.js';

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

  return rpcData;
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
