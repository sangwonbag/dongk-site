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
    // Prevent redirect loops back to login routes
    if (trimmed === '/login' || trimmed.startsWith('/login?') || trimmed.startsWith('/login/')) {
      return fallback;
    }
    return trimmed;
  }
  return fallback;
};
