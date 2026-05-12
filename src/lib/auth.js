/**
 * auth.js
 * 임시 자체 로그인 및 권한 관리를 위한 유틸리티 함수.
 * 향후 Supabase Auth 연동 시 이 파일 내부 로직만 교체하면 됩니다.
 */

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

export const login = async (id, password) => {
  // 환경변수에서 관리자 비밀번호 가져오기 (없으면 '1234'로 fallback)
  // [주의] 운영 배포 전 반드시 환경 변수(VITE_ADMIN_PASSWORD)를 설정해야 합니다.
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || '1234';

  if (id === 'dongk3089') {
    if (password === adminPassword) {
      const user = {
        id: 'dongk3089',
        role: 'admin',
        isLoggedIn: true,
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      return { success: true, user };
    } else {
      return { success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' };
    }
  }

  // 일반 사용자 로직 (추후 확장 가능)
  // 현재는 임시로 아무 비밀번호나 입력하면 로그인 성공으로 처리
  // (실제 서비스에서는 DB 대조 필요)
  if (id.startsWith('user')) {
    const user = {
      id: id,
      role: 'user',
      isLoggedIn: true,
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return { success: true, user };
  }

  return { success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' };
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
  // Optional: Supabase 연동 시 await supabase.auth.signOut() 호출
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.isLoggedIn && user.role === 'admin';
};
