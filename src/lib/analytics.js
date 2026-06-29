import { supabase } from './supabaseClient';
import { isAdmin } from './auth';

// Helper to retrieve or initialize a session-scoped visitor ID
const getSessionId = () => {
  try {
    let sessionId = sessionStorage.getItem('dk_visitor_session_id');
    if (!sessionId) {
      // Create a unique session ID
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
      sessionStorage.setItem('dk_visitor_session_id', sessionId);
    }
    return sessionId;
  } catch (e) {
    console.error('[Analytics] Failed to access sessionStorage:', e);
    return 'sess_fallback_' + Date.now();
  }
};

/**
 * Logs a page view event to the visitor_logs table in Supabase.
 * @param {string} path - The URL path of the page being visited.
 */
export const logPageView = async (path) => {
  if (!supabase) {
    // If Supabase is not configured, silently ignore
    return;
  }

  try {
    const sessionId = getSessionId();
    const isUserAdmin = isAdmin();
    const userAgent = navigator.userAgent || '';
    const referrer = document.referrer || '';

    // Insert the log entry
    const { error } = await supabase
      .from('visitor_logs')
      .insert({
        session_id: sessionId,
        page_path: path,
        referrer: referrer,
        user_agent: userAgent,
        is_admin: isUserAdmin
      });

    if (error) {
      console.warn('[Analytics] Failed to save log:', error.message);
    }
  } catch (err) {
    console.error('[Analytics] Exception in logPageView:', err);
  }
};
