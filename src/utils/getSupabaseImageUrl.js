import { normalizeProductImageUrl } from './productImageResolver.js';

export function getSupabaseImageUrl(path, bucket = 'materials') {
  if (!path) return '';
  const normalized = normalizeProductImageUrl(path);
  return normalized === '/images/no-image.svg' ? '' : normalized;
}


