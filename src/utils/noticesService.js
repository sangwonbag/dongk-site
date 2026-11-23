import { supabase } from '../lib/supabaseClient.js';

let cachedNotices = null;
let noticesCachedAt = 0;
const NOTICES_CACHE_MS = 60 * 1000;

export const STATIC_OPERATIONAL_NOTICES = [
  {
    id: 'static-shipping',
    tag: '배송안내',
    title: '50평(50박스) 이상 무료배송 · 전국 화물 직배송 및 자가수령 가능',
    content: '동경바닥재는 대량 물량 50평(50박스) 이상 주문 시 무료배송을 지원하며, 전국 화물 직배송 및 매장 자가수령을 모두 이용하실 수 있습니다. 자세한 출고 일정은 고객센터(02-487-9775)로 문의해 주세요.',
    is_pinned: true,
    created_at: null,
    isStatic: true
  },
  {
    id: 'static-new-items',
    tag: '입고안내',
    title: '2025 KCC 센스타일·LX하우시스·동화마루 신규 샘플북 및 자재 업데이트',
    content: '2025년 최신 KCC 센스타일, LX하우시스 데코타일·장판, 동화자연마루, 이건마루 신규 라인업과 인앱 샘플북이 업데이트되었습니다. 상단 검색창 또는 샘플북 메뉴에서 바로 확인하실 수 있습니다.',
    is_pinned: false,
    created_at: null,
    isStatic: true
  },
  {
    id: 'static-hours',
    tag: '운영공지',
    title: '전문 시공팀 원스톱 상담 운영 안내 (평일 07:00~18:00 / 주말 07:00~12:00)',
    content: '자재 선택부터 현장 맞춤 견적, 전문 시공팀 연계까지 원스톱으로 상담해 드립니다. 전화(02-487-9775) 또는 카카오톡 1:1 상담을 이용해 주세요.',
    is_pinned: false,
    created_at: null,
    isStatic: true
  }
];

export function invalidateNoticesCache() {
  cachedNotices = null;
  noticesCachedAt = 0;
}

/**
 * Fetches published notices from Supabase `notices` table (if present).
 * Orders pinned notices first, then newest first.
 * Returns { items: [], isFromDb: boolean } without fabricating fake DB posts.
 */
export async function fetchPublishedNotices(limit = 3, forceRefresh = false) {
  if (cachedNotices && !forceRefresh && Date.now() - noticesCachedAt < NOTICES_CACHE_MS) {
    return { items: cachedNotices.slice(0, limit), allItems: cachedNotices, isFromDb: true };
  }

  try {
    if (!supabase) {
      return { items: [], allItems: [], isFromDb: false };
    }

    const { data, error } = await supabase
      .from('notices')
      .select('id, title, content, tag, is_pinned, is_published, created_at')
      .eq('is_published', true)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return { items: [], allItems: [], isFromDb: false };
    }

    if (Array.isArray(data) && data.length > 0) {
      cachedNotices = data;
      noticesCachedAt = Date.now();
      return { items: data.slice(0, limit), allItems: data, isFromDb: true };
    }

    return { items: [], allItems: [], isFromDb: false };
  } catch {
    return { items: [], allItems: [], isFromDb: false };
  }
}
