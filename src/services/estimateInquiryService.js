import { supabase } from '../lib/supabaseClient';

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
 */
export const createEstimateInquiry = async (data) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다. 환경변수 설정을 확인하세요.');
  }

  const { data: insertedData, error } = await supabase
    .from('estimate_inquiries')
    .insert([
      {
        customer_name: data.customer_name || null,
        phone: data.phone,
        address: data.address || null,
        space_type: data.space_type || null,
        area_pyeong: data.area_pyeong ? Number(data.area_pyeong) : null,
        elevator: data.elevator || null,
        luggage: data.luggage || null,
        parking: data.parking || null,
        selected_items: data.selected_items || null,
        extra_options: data.extra_options || null,
        demolition: data.demolition || null,
        desired_date: data.desired_date || null,
        memo: data.memo || null,
        estimated_total: data.estimated_total ? Number(data.estimated_total) : null,
        status: data.status || '접수대기',
        admin_memo: data.admin_memo || null
      }
    ])
    .select('*')
    .single();

  if (error) {
    return handleSupabaseError(error, '견적문의 접수에 실패했습니다.');
  }

  return insertedData;
};

/**
 * 2. 견적문의 목록 조회 (관리자용, 전체 목록 최신순)
 */
export const getEstimateInquiries = async () => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('estimate_inquiries')
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
    .from('estimate_inquiries')
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
    .from('estimate_inquiries')
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
    .from('estimate_inquiries')
    .update({ admin_memo: adminMemo || null })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return handleSupabaseError(error, '견적문의 관리자 메모 저장에 실패했습니다.');
  }

  return data;
};
