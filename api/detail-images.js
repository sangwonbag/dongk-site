import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY;

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase service role configuration is missing on server.');
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

export default async function handler(req, res) {
  // CORS & OPTIONS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabase = getAdminClient();

    // 1. GET: Fetch detail images for product
    if (req.method === 'GET') {
      const { productId } = req.query || {};
      if (!productId) {
        return res.status(400).json({ success: false, error: 'productId is required' });
      }

      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', Number(productId))
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return res.status(200).json({ success: true, images: data || [] });
    }

    // 2. POST: Handle image upload or list sync
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      // Subcase A: Base64 File Upload
      if (body.fileData && body.fileName) {
        const { fileData, fileName, productId } = body;
        const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        const base64Content = matches ? matches[2] : fileData;
        const buffer = Buffer.from(base64Content, 'base64');
        const fileExt = fileName.split('.').pop() || 'webp';
        const cleanName = `detail_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `detail-images/${productId || 'misc'}/${cleanName}`;

        const contentType = matches ? matches[1] : 'image/jpeg';
        const { error: uploadError } = await supabase.storage
          .from('materials')
          .upload(filePath, buffer, {
            contentType,
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('materials')
          .getPublicUrl(filePath);

        return res.status(200).json({ success: true, publicUrl });
      }

      // Subcase B: Save / Sync Detail Images Array
      const { productId, images } = body;
      if (!productId) {
        return res.status(400).json({ success: false, error: 'productId is required' });
      }

      const imageList = Array.isArray(images) ? images : [];

      // 1. Delete existing detail images for this product
      const { error: delError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', Number(productId));

      if (delError) throw delError;

      // 2. Insert new list with updated sort_order
      if (imageList.length > 0) {
        const rowsToInsert = imageList.map((img, idx) => ({
          product_id: Number(productId),
          image_url: img.url || img.image_url,
          sort_order: idx,
          alt_text: img.alt_text || `상세 이미지 ${idx + 1}`,
          image_type: 'detail',
          is_active: true
        }));

        const { error: insError } = await supabase
          .from('product_images')
          .insert(rowsToInsert);

        if (insError) throw insError;
      }

      return res.status(200).json({
        success: true,
        message: '상세 이미지가 성공적으로 저장되었습니다.',
        count: imageList.length
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('[API detail-images Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || '상세 이미지 처리 중 서버 오류가 발생했습니다.'
    });
  }
}
