import { supabase } from '../lib/supabaseClient.js';

/**
 * Worker Management & Schedule Conflict Service for Dongkyung Flooring
 */

// Default Fallback Seed Workers if DB table is empty
const DEFAULT_WORKERS = [
  { id: 'w1', name: '김철수 팀장', phone: '010-1234-5678', team_name: 'A팀 (서울/경기)', specialties: ['데코타일', '장판', '마루'], active: true },
  { id: 'w2', name: '박기사 팀장', phone: '010-9876-5432', team_name: 'B팀 (경기남부/인천)', specialties: ['장판', '벽지'], active: true },
  { id: 'w3', name: '이반장 기사', phone: '010-5555-7777', team_name: 'C팀 (지방/광역)', specialties: ['데코타일', '카페트타일'], active: true }
];

/**
 * 1. Fetch Active Construction Workers List
 */
export const getConstructionWorkers = async () => {
  if (!supabase) return DEFAULT_WORKERS;

  try {
    const { data, error } = await supabase
      .from('construction_workers')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_WORKERS;
    }
    return data;
  } catch (err) {
    console.warn('[getConstructionWorkers warning]', err);
    return DEFAULT_WORKERS;
  }
};

/**
 * 2. Add New Construction Worker
 */
export const createConstructionWorker = async (workerData) => {
  if (!supabase) {
    return { ...workerData, id: `w_${Date.now()}` };
  }

  const { data, error } = await supabase
    .from('construction_workers')
    .insert({
      name: workerData.name,
      phone: workerData.phone,
      team_name: workerData.team_name || '시공팀',
      specialties: workerData.specialties || ['데코타일'],
      active: true,
      memo: workerData.memo || null
    })
    .select()
    .single();

  if (error) {
    throw new Error(`작업자 등록 실패: ${error.message}`);
  }

  return data;
};

/**
 * 3. Assign Worker to Order
 */
export const updateOrderWorkerAssignment = async (orderId, {
  primary_worker_id,
  primary_worker_name,
  assistant_worker_id,
  assistant_worker_name,
  construction_team_name
}) => {
  if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');

  const updatePayload = {
    primary_worker_id: primary_worker_id || null,
    primary_worker_name: primary_worker_name || null,
    assistant_worker_id: assistant_worker_id || null,
    assistant_worker_name: assistant_worker_name || null,
    construction_team_name: construction_team_name || null,
    construction_manager: primary_worker_name || null
  };

  const { data, error } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)
    .select('*, order_items (*)')
    .single();

  if (error) {
    throw new Error(`작업자 배정 실패: ${error.message}`);
  }

  return data;
};

/**
 * 4. Worker Schedule Conflict Detector
 * Checks if the assigned worker already has another assignment on the same date and time slot.
 */
export const checkWorkerScheduleConflict = async ({
  workerId,
  workerName,
  constructionDate,
  constructionTimeSlot,
  currentOrderId
}) => {
  if (!constructionDate || (!workerId && !workerName)) {
    return { hasConflict: false };
  }

  if (!supabase) {
    return { hasConflict: false };
  }

  try {
    const { data: conflicts, error } = await supabase
      .from('orders')
      .select('id, order_no, customer_name, address, construction_date, construction_time_slot, primary_worker_id, primary_worker_name')
      .eq('construction_date', constructionDate)
      .neq('id', currentOrderId || '00000000-0000-0000-0000-000000000000');

    if (error || !conflicts || conflicts.length === 0) {
      return { hasConflict: false };
    }

    const matched = conflicts.find(o => {
      const isSameWorker = (workerId && o.primary_worker_id === workerId) || (workerName && o.primary_worker_name === workerName);
      const isSameSlot = !constructionTimeSlot || !o.construction_time_slot || o.construction_time_slot === constructionTimeSlot;
      return isSameWorker && isSameSlot;
    });

    if (matched) {
      return {
        hasConflict: true,
        conflictingOrderNo: matched.order_no,
        conflictingCustomer: matched.customer_name,
        conflictingAddress: matched.address,
        conflictingSlot: matched.construction_time_slot || '시간미정'
      };
    }
  } catch (err) {
    console.warn('[checkWorkerScheduleConflict warning]', err);
  }

  return { hasConflict: false };
};
