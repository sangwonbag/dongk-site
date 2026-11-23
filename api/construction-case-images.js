import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const BUCKET_NAME = 'portfolio-images';
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif', 'avif']);
const ALLOWED_MIME_PREFIX = 'image/';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('서버의 Supabase 서비스 키 설정이 누락되었습니다.');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getHeader(req, name) {
  const lower = name.toLowerCase();
  return req.headers?.[lower] || req.headers?.[name] || '';
}

async function verifyAdminRequest(req, supabaseAdmin) {
  // 1. Check Supabase Auth Bearer JWT if provided
  const authHeader = String(getHeader(req, 'authorization') || '').trim();
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const { data: userData, error: authErr } = await supabaseAdmin.auth.getUser(token);
      if (!authErr && userData?.user?.id) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id, username, role')
          .eq('id', userData.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        if (profile) {
          return { ok: true, admin: profile };
        }
      }
    }
  }

  // 2. Check verified admin profile headers (used by dongk3089 admin session)
  const adminId = String(getHeader(req, 'x-admin-user-id') || '').trim();
  const adminUsername = String(getHeader(req, 'x-admin-username') || '').trim();
  if (!adminId || !adminUsername) {
    return { ok: false, status: 401, error: '관리자 인증 정보가 필요합니다.' };
  }

  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('profiles')
    .select('id, username, role')
    .eq('id', adminId)
    .eq('username', adminUsername)
    .eq('role', 'admin')
    .maybeSingle();

  if (profileErr || !profile) {
    return { ok: false, status: 403, error: '관리자 권한이 없는 요청입니다.' };
  }

  return { ok: true, admin: profile };
}

function sanitizeExtension(fileName = '', contentType = '') {
  const rawExt = String(fileName).split('.').pop()?.toLowerCase()?.replace(/[^a-z0-9]/g, '') || '';
  if (ALLOWED_EXTENSIONS.has(rawExt)) return rawExt;

  const mimeMap = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/heic': 'heic',
    'image/heif': 'heif',
    'image/avif': 'avif',
  };
  return mimeMap[String(contentType).toLowerCase()] || '';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Authorization, Content-Type, X-Admin-User-Id, X-Admin-Username'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const authResult = await verifyAdminRequest(req, supabaseAdmin);
    if (!authResult.ok) {
      return res.status(authResult.status).json({
        success: false,
        error: authResult.error,
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    // POST: Admin-verified actions (signed upload URL, save case, delete case)
    if (req.method === 'POST') {
      const { action } = body;

      // Action 1: Save (INSERT or UPDATE) construction_cases record
      if (action === 'save-case') {
        const { id, payload } = body;
        if (!payload || !payload.title || !String(payload.title).trim()) {
          return res.status(400).json({ success: false, error: '시공사례 제목을 입력해주세요.' });
        }

        const sanitizedPayload = {
          title: String(payload.title).trim(),
          location: payload.location || null,
          material_summary: payload.material_summary || null,
          product_id: payload.product_id || null,
          description: payload.description || null,
          category: payload.category || '주거공간',
          is_active: payload.is_active ?? true,
          is_published: payload.is_published ?? payload.is_active ?? true,
          is_featured: payload.is_featured ?? false,
          sort_order: Number.isFinite(Number(payload.sort_order)) ? Number(payload.sort_order) : 0,
          main_image_url: payload.main_image_url || null,
          constructed_at: payload.constructed_at || null,
          image_urls: Array.isArray(payload.image_urls) ? payload.image_urls : [],
          updated_at: new Date().toISOString(),
        };

        if (id) {
          const { data: updated, error: updErr } = await supabaseAdmin
            .from('construction_cases')
            .update(sanitizedPayload)
            .eq('id', id)
            .select()
            .single();
          if (updErr) {
            return res.status(500).json({ success: false, error: updErr.message });
          }
          return res.status(200).json({ success: true, data: updated });
        } else {
          const insertPayload = { ...sanitizedPayload, created_at: new Date().toISOString() };
          let { data: inserted, error: insErr } = await supabaseAdmin
            .from('construction_cases')
            .insert(insertPayload)
            .select()
            .single();

          // Recover automatically if PostgreSQL serial sequence lags behind manual bulk inserts
          if (insErr && (insErr.code === '23505' || String(insErr.message || '').includes('construction_cases_pkey'))) {
            const { data: maxRow } = await supabaseAdmin
              .from('construction_cases')
              .select('id')
              .order('id', { ascending: false })
              .limit(1)
              .maybeSingle();
            const nextId = (Number(maxRow?.id) || 0) + 1;
            const retry = await supabaseAdmin
              .from('construction_cases')
              .insert({ ...insertPayload, id: nextId })
              .select()
              .single();
            inserted = retry.data;
            insErr = retry.error;
          }

          if (insErr) {
            return res.status(500).json({ success: false, error: insErr.message });
          }
          return res.status(200).json({ success: true, data: inserted });
        }
      }

      // Action 2: Delete construction_cases record
      if (action === 'delete-case') {
        const { id } = body;
        if (!id) {
          return res.status(400).json({ success: false, error: '삭제할 시공사례 ID가 누락되었습니다.' });
        }
        const { error: delErr } = await supabaseAdmin
          .from('construction_cases')
          .delete()
          .eq('id', id);
        if (delErr) {
          return res.status(500).json({ success: false, error: delErr.message });
        }
        return res.status(200).json({ success: true, deletedId: id });
      }

      // Default Action: Create a one-time signed upload URL for the existing 'portfolio-images' bucket
      const { fileName, contentType, fileSize } = body;

      if (!fileName) {
        return res.status(400).json({ success: false, error: '파일명이 누락되었습니다.' });
      }

      if (typeof fileSize === 'number' && fileSize > MAX_FILE_SIZE_BYTES) {
        return res.status(400).json({
          success: false,
          error: '이미지 파일 크기는 최대 20MB까지 업로드할 수 있습니다.',
        });
      }

      const ext = sanitizeExtension(fileName, contentType);
      const isMimeValid = !contentType || String(contentType).toLowerCase().startsWith(ALLOWED_MIME_PREFIX);
      if (!ext || !isMimeValid) {
        return res.status(400).json({
          success: false,
          error: '지원하지 않는 파일 형식입니다. (JPG, PNG, WEBP, GIF, HEIC 이미지만 가능)',
        });
      }

      const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${ext}`;
      const filePath = `cases/${safeFileName}`;

      const { data: signedData, error: signErr } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .createSignedUploadUrl(filePath);

      if (signErr || !signedData) {
        return res.status(500).json({
          success: false,
          error: signErr?.message || `Storage(${BUCKET_NAME}) 업로드 URL 발급에 실패했습니다.`,
        });
      }

      const { data: publicData } = supabaseAdmin.storage
        .from(BUCKET_NAME)
        .getPublicUrl(signedData.path);

      return res.status(200).json({
        success: true,
        bucket: BUCKET_NAME,
        path: signedData.path,
        token: signedData.token,
        signedUrl: signedData.signedUrl,
        publicUrl: publicData.publicUrl,
      });
    }

    // DELETE: Admin-only removal of an uploaded object in portfolio-images/cases/*
    if (req.method === 'DELETE') {
      const { path } = body;
      if (!path || typeof path !== 'string' || !path.startsWith('cases/')) {
        return res.status(400).json({ success: false, error: '삭제할 유효한 이미지 경로가 아닙니다.' });
      }

      const { error: delErr } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([path]);

      if (delErr) {
        return res.status(500).json({ success: false, error: delErr.message });
      }

      return res.status(200).json({ success: true, removed: path });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('[API construction-case-images Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || '시공사례 이미지 처리 중 서버 오류가 발생했습니다.',
    });
  }
}
