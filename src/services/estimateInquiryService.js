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
export const createEstimateInquiry = async (payload) => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다. 환경변수 설정을 확인하세요.');
  }

  // 1. Insert header into public.estimates
  const { data: insertedHeader, error: headerError } = await supabase
    .from('estimates')
    .insert([
      {
        customer_type: payload.customer_type || '일반 소비자',
        customer_name: payload.customer_name,
        phone: payload.phone,
        email: payload.email || null,
        site_address: payload.site_address,
        site_detail_address: payload.site_detail_address || null,
        preferred_date: payload.preferred_date || null,
        consultation_type: payload.consultation_type || '전화 상담',
        site_type: payload.site_type || '아파트',
        work_type: payload.work_type || '상담 후 결정',
        area_pyeong: payload.area_pyeong ? Number(payload.area_pyeong) : null,
        has_elevator: payload.has_elevator === true,
        parking_available: payload.parking_available === true,
        accessory_options: payload.accessory_options || [],
        extra_accessory_text: payload.extra_accessory_text || null,
        request_memo: payload.request_memo || null,
        subtotal: payload.subtotal || 0,
        total: payload.total || 0,
        status: '접수'
      }
    ])
    .select('*')
    .single();

  if (headerError) {
    return handleSupabaseError(headerError, '견적요청 저장에 실패했습니다. (기본 정보 저장 오류)');
  }

  const estimateId = insertedHeader.id;

  // 2. Insert items into public.estimate_items
  if (payload.selected_items && payload.selected_items.length > 0) {
    const itemsToInsert = payload.selected_items.map((item, idx) => ({
      estimate_id: estimateId,
      sort_order: idx + 1,
      category: item.category || null,
      brand: item.brand || null,
      product_code: item.product_code || item.code || null,
      product_name: item.product_name || item.name || '',
      spec: item.spec || item.size || null,
      quantity: item.quantity || 1,
      unit_price: item.unit_price || 0,
      supply_amount: item.amount || 0,
      memo: null
    }));

    const { error: itemsError } = await supabase
      .from('estimate_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Error inserting estimate items, attempting rollback of header...', itemsError);
      await supabase.from('estimates').delete().eq('id', estimateId);
      return handleSupabaseError(itemsError, '견적요청 상세 자재 정보 저장에 실패했습니다.');
    }
  }

  return insertedHeader;
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
