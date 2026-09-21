/**
 * Safe Redirect URL Validator
 * Prevents open-redirect vulnerabilities by allowing only internal relative paths.
 */
export const getSafeRedirectUrl = (rawUrl, fallback = '/') => {
  if (!rawUrl || typeof rawUrl !== 'string') return fallback;
  const trimmed = rawUrl.trim();
  
  // Allow relative paths starting with '/' but reject '//', Windows absolute paths, or full protocols (http/https)
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.includes(':\\') &&
    !trimmed.toLowerCase().startsWith('http:') &&
    !trimmed.toLowerCase().startsWith('https:')
  ) {
    return trimmed;
  }
  return fallback;
};
