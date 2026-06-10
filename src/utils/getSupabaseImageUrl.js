import { supabase } from '../lib/supabase'

export function getSupabaseImageUrl(path, bucket = 'materials') {
  if (!path) return ''

  // Already a full URL or local absolute path, return as-is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path
  }

  if (!supabase) {
    return `https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/${bucket}/${path}`;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data?.publicUrl || ''
}

