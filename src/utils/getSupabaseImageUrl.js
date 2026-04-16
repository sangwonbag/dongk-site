import { supabase } from '../lib/supabase'

export function getSupabaseImageUrl(path, bucket = 'materials') {
  if (!path) return ''

  // Already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data?.publicUrl || ''
}
