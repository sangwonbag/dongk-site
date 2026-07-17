import { supabase } from '../lib/supabaseClient';
import { formatFlooringProductName } from '../utils/brandUtils';

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

  const { data, error } = await supabase
    .from('estimates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return handleSupabaseError(error, '견적문의 목록을 가져오는 중 오류가 발생했습니다.');
  }

  return data || [];
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
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    return handleSupabaseError(error, '견적문의 정보를 가져오는 중 오류가 발생했습니다.');
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

  const { data, error } = await supabase
    .from('estimates')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return handleSupabaseError(error, '견적문의 상태 변경에 실패했습니다.');
  }

  return data;
};

/**
 * 5. 견적문의 관리자 메모 변경
 */
export const updateEstimateInquiryAdminMemo = async (id, adminMemo) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('estimates')
    .update({ admin_memo: adminMemo || null })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return handleSupabaseError(error, '견적문의 관리자 메모 저장에 실패했습니다.');
  }

  return data;
};
