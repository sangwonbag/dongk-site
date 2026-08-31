import { supabase } from '../lib/supabase'

export function getSupabaseImageUrl(path, bucket = 'materials') {
  if (!path) return ''

  let str = String(path).trim();
  try {
    if (str.includes('%')) str = decodeURIComponent(str);
  } catch (e) {}

  // Already a full URL or local absolute path, return as-is
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/')) {
    return str
  }

  if (!supabase) {
    return `https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/${bucket}/${str}`;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(str)

  return data?.publicUrl || ''
}

