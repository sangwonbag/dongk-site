import { supabase } from './supabaseClient.js';

const AUTH_KEY = 'dk_auth_user';

export const getCurrentUser = () => {
  try {
    if (typeof localStorage === 'undefined') return null;
    const userStr = localStorage.getItem(AUTH_KEY);
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Failed to parse auth data', e);
    return null;
  }
};

// Mask sensitive string for Korean UI display (e.g. psw****, psw****@naver.com)
export const maskString = (str) => {
  if (!str || typeof str !== 'string') return '';
  const trimmed = str.trim();
  if (trimmed.includes('@')) {
    const [local, domain] = trimmed.split('@');
    if (local.length <= 2) return `${local.charAt(0)}*@${domain}`;
    if (local.length <= 4) return `${local.slice(0, 2)}**@${domain}`;
    return `${local.slice(0, 3)}${'*'.repeat(Math.max(1, local.length - 3))}@${domain}`;
  }
  if (trimmed.length <= 2) return `${trimmed.charAt(0)}*`;
  if (trimmed.length <= 4) return `${trimmed.slice(0, 2)}${'*'.repeat(trimmed.length - 2)}`;
  if (trimmed.length <= 6) return `${trimmed.slice(0, 3)}***`;
  return `${trimmed.slice(0, 3)}${'*'.repeat(Math.min(4, trimmed.length - 3))}`;
};

// Simple SHA-256 hash function using Web Crypto API
export const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const checkDuplicateUsername = async (username) => {
  if (!supabase) return { error: 'Supabase client not initialized' };
  const cleanUsername = String(username || '').trim();
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', cleanUsername)
    .maybeSingle();

  if (error) {
    console.error('Error checking duplicate username:', error);
    return { error: '서버 오류가 발생했습니다.' };
  }
  
  return { isDuplicate: !!data };
};

export const signup = async (userData) => {
  if (!supabase) return { success: false, message: '서버 연결에 실패했습니다. (Supabase 미설정)' };

  try {
    const hashedPassword = await hashPassword(userData.password);
    
    // Try primary insert with all new fields
    const { error: primaryError } = await supabase.from('profiles').insert({
      username: userData.username.trim(),
      password: hashedPassword,
      name: userData.name.trim(),
      phone: userData.phone.trim(),
      company_name: userData.company_name ? userData.company_name.trim() : null,
      user_type: userData.user_type,
      address: userData.address || null,
      address_detail: userData.address_detail || null,
      business_number: userData.business_number || null,
      marketing_agree: userData.marketing_agree || false,
      marketing_agreed: userData.marketing_agreed ?? userData.marketing_agree ?? false,
      terms_agreed_at: userData.terms_agreed_at || null,
      privacy_agreed_at: userData.privacy_agreed_at || null,
      age_confirmed_at: userData.age_confirmed_at || null,
      memo: userData.memo || null,
      role: 'user'
    });

    if (primaryError) {
      if (primaryError.code === '23505' || primaryError.message?.includes('duplicate')) {
        return { success: false, message: '이미 사용 중인 아이디입니다.' };
      }

      console.warn('Primary signup failed, trying fallback insert:', primaryError.message);
      
      const concatenatedAddress = userData.address 
        ? `${userData.address} ${userData.address_detail || ''}`.trim() 
        : null;
        
      const agreementLogs = [
        userData.terms_agreed_at ? `이용약관동의(${userData.terms_agreed_at})` : '이용약관동의(미동의)',
        userData.privacy_agreed_at ? `개인정보수집동의(${userData.privacy_agreed_at})` : '개인정보수집동의(미동의)',
        userData.age_confirmed_at ? `만14세확인(${userData.age_confirmed_at})` : '만14세확인(미동의)',
        (userData.marketing_agreed ?? userData.marketing_agree) ? `마케팅수신동의(동의)` : '마케팅수신동의(미동의)'
      ].join(' | ');

      const fallbackMemo = [
        userData.business_number ? `사업자번호: ${userData.business_number}` : null,
        userData.memo ? `기타메모: ${userData.memo}` : null,
        `[약관동의이력] ${agreementLogs}`
      ].filter(Boolean).join(' / ');

      const { error: fallbackError } = await supabase.from('profiles').insert({
        username: userData.username.trim(),
        password: hashedPassword,
        name: userData.name.trim(),
        phone: userData.phone.trim(),
        company_name: userData.company_name ? userData.company_name.trim() : null,
        user_type: userData.user_type,
        address: concatenatedAddress,
        memo: fallbackMemo,
        role: 'user'
      });

      if (fallbackError) {
        console.error('Fallback signup error:', fallbackError);
        if (fallbackError.code === '23505' || fallbackError.message?.includes('duplicate')) {
          return { success: false, message: '이미 사용 중인 아이디입니다.' };
        }
        return { success: false, message: `회원가입 처리 중 오류가 발생했습니다. (상세: ${fallbackError.message || fallbackError.code})` };
      }
    }

    return { success: true };
  } catch (err) {
    console.error('Signup exception:', err);
    return { success: false, message: `서버 오류가 발생했습니다. (상세: ${err.message || err.toString()})` };
  }
};

/**
 * Universal login function:
 * Supports username, email, case-insensitive match, custom profiles SHA-256 and Supabase Auth.
 */
export const login = async (id, password) => {
  const cleanId = String(id || '').trim();
  const cleanPassword = String(password || '').trim();

  if (!cleanId || !cleanPassword) {
    return { success: false, statusType: 'validation_error', message: '아이디와 비밀번호를 모두 입력해 주세요.' };
  }

  if (!supabase) {
    return { success: false, isNetworkError: true, statusType: 'network_error', message: '서버와 연결할 수 없습니다. 인터넷 연결을 확인한 후 다시 시도해 주세요.' };
  }

  try {
    const hashedPassword = await hashPassword(cleanPassword);
    const isEmailInput = cleanId.includes('@');

    // 10초 기준 타임아웃 래퍼
    const withQueryTimeout = (p, ms = 10000) => {
      let timer;
      return Promise.race([
        p,
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            const timeoutErr = new Error('인증 서버 응답 시간이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.');
            timeoutErr.isTimeout = true;
            reject(timeoutErr);
          }, ms);
        })
      ]).finally(() => clearTimeout(timer));
    };

    // 1. 단일 최적화 쿼리: 아이디(username) 또는 이메일(memo/username) 1회 즉시 조회
    let profileQuery = supabase
      .from('profiles')
      .select('id, username, password, name, phone, company_name, user_type, role, memo');

    if (isEmailInput) {
      profileQuery = profileQuery.or(`username.ilike.${cleanId},memo.ilike.%${cleanId}%`);
    } else {
      profileQuery = profileQuery.ilike('username', cleanId);
    }

    const { data: profileRow, error: pErr } = await withQueryTimeout(profileQuery.limit(1).maybeSingle(), 10000);

    if (pErr) {
      console.error('[Auth Error] Profile query error:', pErr);
      return { 
        success: false, 
        isNetworkError: true, 
        statusType: 'network_error', 
        message: '서버와 연결할 수 없습니다. 인터넷 연결을 확인한 후 다시 시도해 주세요.' 
      };
    }

    // 2. 일치하는 프로필이 확인된 경우
    if (profileRow) {
      // 카카오 OAuth 간편가입 계정인 경우 안내
      if (!profileRow.password && profileRow.memo && profileRow.memo.includes('OAuth')) {
        return {
          success: false,
          isKakaoAccount: true,
          statusType: 'kakao_required',
          message: '카카오 간편 로그인으로 가입된 계정입니다. 아래 "카카오로 로그인" 버튼을 이용해 주세요.'
        };
      }

      // SHA-256 비밀번호 해시 일치 확인
      if (profileRow.password === hashedPassword) {
        const { password: _, ...userSafe } = profileRow;
        const user = {
          ...userSafe,
          isLoggedIn: true
        };
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        }
        return { success: true, user, statusType: 'success' };
      }

      // 비밀번호 불일치
      return { 
        success: false, 
        isAuthFailed: true, 
        statusType: 'auth_failed', 
        message: '아이디 또는 비밀번호가 올바르지 않습니다.' 
      };
    }

    // 3. 이메일 입력의 경우 Supabase Auth(이메일 기반 가입/비밀번호 재설정 계정) 추가 검증
    if (isEmailInput) {
      try {
        const { data: authData, error: authErr } = await withQueryTimeout(
          supabase.auth.signInWithPassword({
            email: cleanId,
            password: cleanPassword
          }),
          8000
        );

        if (!authErr && authData?.user) {
          const sUser = authData.user;
          const { data: foundProf } = await supabase
            .from('profiles')
            .select('id, username, name, phone, company_name, user_type, role')
            .eq('id', sUser.id)
            .limit(1)
            .maybeSingle();

          const user = {
            id: sUser.id,
            username: foundProf?.username || cleanId,
            name: foundProf?.name || sUser.user_metadata?.name || '회원',
            phone: foundProf?.phone || sUser.user_metadata?.phone || '',
            company_name: foundProf?.company_name || null,
            user_type: foundProf?.user_type || '일반',
            role: foundProf?.role || 'user',
            email: sUser.email || cleanId,
            isLoggedIn: true
          };

          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(AUTH_KEY, JSON.stringify(user));
          }
          return { success: true, user, statusType: 'success' };
        }
      } catch (authEx) {
        if (authEx.isTimeout) {
          return { 
            success: false, 
            isTimeout: true, 
            statusType: 'timeout', 
            message: '인증 응답 시간이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.' 
          };
        }
      }
    }

    // 일치하는 계정 없음
    return { 
      success: false, 
      isAuthFailed: true, 
      statusType: 'auth_failed', 
      message: '아이디 또는 비밀번호가 올바르지 않습니다.' 
    };

  } catch (err) {
    console.error('Login exception:', err);
    if (err.isTimeout) {
      return { 
        success: false, 
        isTimeout: true, 
        statusType: 'timeout', 
        message: '인증 서버 응답 시간이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.' 
      };
    }
    // 네트워크 오류 판별
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { 
        success: false, 
        isNetworkError: true, 
        statusType: 'network_error', 
        message: '서버와 연결할 수 없습니다. 인터넷 연결을 확인한 후 다시 시도해 주세요.' 
      };
    }
    return { 
      success: false, 
      isNetworkError: true, 
      statusType: 'network_error', 
      message: '서버와 연결할 수 없습니다. 인터넷 연결을 확인한 후 다시 시도해 주세요.' 
    };
  }
};

// In-memory rate limiting for account recovery requests (max 5 requests per 5 minutes per session)
let findIdAttempts = 0;
let lastFindIdReset = Date.now();

let resetPwdAttempts = 0;
let lastResetPwdReset = Date.now();

/**
 * Find username by registered email.
 * Masks the username for security.
 */
export const findUsernameByEmail = async (email) => {
  if (!supabase) return { success: false, message: '서버 연결에 실패했습니다.' };

  const cleanEmail = String(email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return { success: false, message: '올바른 이메일 주소 형식을 입력해주세요.' };
  }

  const now = Date.now();
  if (now - lastFindIdReset > 5 * 60 * 1000) {
    findIdAttempts = 0;
    lastFindIdReset = now;
  }
  findIdAttempts++;
  if (findIdAttempts > 5) {
    return { success: false, message: '요청 횟수를 초과했습니다. 잠시 후(약 5분 후) 다시 시도해 주세요.' };
  }

  try {
    // 1. Search in profiles by username (when username is an email) or memo (which stores email)
    let { data: profile, error } = await supabase
      .from('profiles')
      .select('username, memo, created_at')
      .or(`username.ilike.${cleanEmail},memo.ilike.%${cleanEmail}%`)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('findUsernameByEmail error:', error);
      return { success: false, message: '계정 조회 중 오류가 발생했습니다.' };
    }

    if (!profile) {
      return { success: false, message: '입력하신 이메일로 가입된 계정 정보를 찾을 수 없습니다.' };
    }

    const isKakao = !!(profile.memo && profile.memo.includes('OAuth'));
    const masked = maskString(profile.username);

    return {
      success: true,
      maskedId: masked,
      isKakao,
      createdAt: profile.created_at ? profile.created_at.split('T')[0] : null
    };

  } catch (err) {
    console.error('findUsernameByEmail exception:', err);
    return { success: false, message: `계정 조회 중 오류가 발생했습니다. (${err.message || err.toString()})` };
  }
};

/**
 * Request password reset email via Supabase Auth.
 */
export const requestPasswordReset = async (email) => {
  if (!supabase) return { success: false, message: '서버 연결에 실패했습니다.' };

  const cleanEmail = String(email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return { success: false, message: '올바른 이메일 주소 형식을 입력해주세요.' };
  }

  const now = Date.now();
  if (now - lastResetPwdReset > 5 * 60 * 1000) {
    resetPwdAttempts = 0;
    lastResetPwdReset = now;
  }
  resetPwdAttempts++;
  if (resetPwdAttempts > 5) {
    return { success: false, message: '요청 횟수를 초과했습니다. 잠시 후(약 5분 후) 다시 시도해 주세요.' };
  }

  try {
    // Check if account is a Kakao account
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, memo')
      .or(`username.ilike.${cleanEmail},memo.ilike.%${cleanEmail}%`)
      .limit(1)
      .maybeSingle();

    if (profile && profile.memo && profile.memo.includes('OAuth')) {
      return {
        success: false,
        isKakao: true,
        message: '해당 계정은 카카오 간편 로그인으로 가입되었습니다. 비밀번호 재설정 대신 "카카오로 로그인"을 이용해 주세요.'
      };
    }

    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const redirectTo = isLocalhost 
      ? `${window.location.origin}/reset-password` 
      : 'https://dkfloor.co.kr/reset-password';

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo
    });

    if (error) {
      console.warn('resetPasswordForEmail error:', error);
      if (error.status === 429 || error.code === 'over_email_send_rate_limit' || error.message?.includes('rate limit')) {
        return {
          success: false,
          message: '이메일 발송 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.'
        };
      }
      return { success: false, message: error.message || '비밀번호 재설정 이메일 발송에 실패했습니다.' };
    }

    return {
      success: true,
      message: '가입하신 이메일로 비밀번호 재설정 안내를 요청했습니다. 메일함을 확인해 주세요.'
    };

  } catch (err) {
    console.error('requestPasswordReset exception:', err);
    return { success: false, message: `비밀번호 재설정 요청 중 오류가 발생했습니다. (${err.message || err.toString()})` };
  }
};

/**
 * Update password using active Supabase Auth recovery session.
 */
export const updatePasswordWithSession = async (newPassword) => {
  if (!supabase) return { success: false, message: '서버 연결에 실패했습니다.' };

  const cleanPassword = String(newPassword || '').trim();
  if (cleanPassword.length < 6) {
    return { success: false, message: '비밀번호는 최소 6자 이상이어야 합니다.' };
  }

  try {
    const { data, error } = await supabase.auth.updateUser({
      password: cleanPassword
    });

    if (error) {
      console.error('updateUser error:', error);
      return { success: false, message: error.message || '비밀번호 변경에 실패했습니다.' };
    }

    // Also synchronize SHA-256 password hash in profiles
    if (data?.user?.id) {
      try {
        const hashedPassword = await hashPassword(cleanPassword);
        await supabase
          .from('profiles')
          .update({ password: hashedPassword })
          .eq('id', data.user.id);
      } catch (syncErr) {
        console.warn('Profile password sync error:', syncErr);
      }
    }

    return { success: true, message: '비밀번호가 성공적으로 변경되었습니다.' };

  } catch (err) {
    console.error('updatePasswordWithSession exception:', err);
    return { success: false, message: `비밀번호 변경 처리 중 오류가 발생했습니다. (${err.message || err.toString()})` };
  }
};

export const logout = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
  }
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.isLoggedIn && user.role === 'admin';
};
