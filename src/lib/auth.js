import { supabase } from './supabaseClient';

const AUTH_KEY = 'dk_auth_user';

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem(AUTH_KEY);
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Failed to parse auth data', e);
    return null;
  }
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
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 means no rows returned, which means not duplicate
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
      username: userData.username,
      password: hashedPassword,
      name: userData.name,
      phone: userData.phone,
      company_name: userData.company_name || null,
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
      // UNIQUE VIOLATION check
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
        username: userData.username,
        password: hashedPassword,
        name: userData.name,
        phone: userData.phone,
        company_name: userData.company_name || null,
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
        return { success: false, message: '회원가입 처리 중 오류가 발생했습니다.' };
      }
    }

    return { success: true };
  } catch (err) {
    console.error('Signup exception:', err);
    return { success: false, message: '서버 오류가 발생했습니다.' };
  }
};

export const login = async (id, password) => {
  if (!supabase) {
    // Fallback for missing Supabase config - ONLY FOR DEVELOPMENT
    console.warn("Supabase not connected. Using fallback auth.");
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || '1234';
    if (id === 'dongk3089' && password === adminPassword) {
      const user = { id: 'dongk3089', username: 'dongk3089', role: 'admin', isLoggedIn: true };
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.' };
  }

  try {
    const hashedPassword = await hashPassword(password);
    const { data: userRow, error } = await supabase
      .from('profiles')
      .select('id, username, name, phone, company_name, user_type, role')
      .eq('username', id)
      .eq('password', hashedPassword)
      .single();

    if (error || !userRow) {
      return { success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' };
    }

    const user = {
      ...userRow,
      isLoggedIn: true,
    };
    
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return { success: true, user };

  } catch (err) {
    console.error('Login exception:', err);
    return { success: false, message: '로그인 처리 중 오류가 발생했습니다.' };
  }
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.isLoggedIn && (user.role === 'admin' || user.role === 'staff');
};
