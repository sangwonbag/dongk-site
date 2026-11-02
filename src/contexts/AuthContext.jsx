/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, login as authLogin, logout as authLogout, signup as authSignup, findUsernameByEmail, requestPasswordReset, updatePasswordWithSession } from '../lib/auth';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [authStatus, setAuthStatus] = useState('checking'); // 'checking' | 'authenticated' | 'unauthenticated'
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      // 1. 저장된 로컬 세션이 있다면 화면을 블로킹하지 않고 즉시 인증 상태 반영
      const localUser = getCurrentUser();
      if (localUser && localUser.isLoggedIn) {
        setUser(localUser);
        setAuthStatus('authenticated');

        // 백그라운드에서 계정 유효성 비차단 확인 (화면 정지 없음)
        if (supabase) {
          supabase
            .from('profiles')
            .select('id, username, name, phone, company_name, user_type, role')
            .eq('username', localUser.username)
            .limit(1)
            .maybeSingle()
            .then(({ data: profile, error: profileErr }) => {
              if (!profileErr && profile) {
                const updatedUser = { ...localUser, ...profile, isLoggedIn: true };
                localStorage.setItem('dk_auth_user', JSON.stringify(updatedUser));
                setUser(updatedUser);
              }
            })
            .catch(() => {});
        }
        return;
      }

      // 2. 로컬 계정이 없는 경우 Supabase OAuth 세션 1.5초 안전 확인
      if (supabase) {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ data: { session: null } }), 1500));
        const { data: sessionData } = await Promise.race([sessionPromise, timeoutPromise]);
        
        const session = sessionData?.session;
        if (session && session.user) {
          const sUser = session.user;
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, username, name, phone, company_name, user_type, role')
              .eq('id', sUser.id)
              .limit(1)
              .maybeSingle();

            const authData = {
              id: sUser.id,
              username: profile?.username || `oauth_${sUser.id.substring(0, 8)}`,
              name: profile?.name || sUser.user_metadata?.name || '회원',
              phone: profile?.phone || sUser.user_metadata?.phone || '',
              company_name: profile?.company_name || null,
              user_type: profile?.user_type || '일반',
              role: profile?.role || 'user',
              email: sUser.email || null,
              isLoggedIn: true
            };

            localStorage.setItem('dk_auth_user', JSON.stringify(authData));
            setUser(authData);
            setAuthStatus('authenticated');
            return;
          } catch (pErr) {
            console.warn('[AuthContext] Supabase profile fetch exception:', pErr);
          }
        }
      }

      // 활성 세션 없음
      setUser(null);
      setAuthStatus('unauthenticated');
    } catch (err) {
      console.error('[AuthContext] Check session exception:', err);
      const localUser = getCurrentUser();
      if (localUser && localUser.isLoggedIn) {
        setUser(localUser);
        setAuthStatus('authenticated');
      } else {
        setUser(null);
        setAuthStatus('unauthenticated');
      }
    }
  }, []);

  useEffect(() => {
    checkSession();

    if (supabase) {
      // onAuthStateChange 콜백 내부에서 직접적인 Supabase DB 조회를 지연(setTimeout) 실행하여
      // Gotrue 내부 락과 PostgREST 쿼리 간의 교착 상태(Deadlock)를 원천 방지
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setTimeout(async () => {
          try {
            if (event === 'SIGNED_OUT') {
              authLogout();
              setUser(null);
              setAuthStatus('unauthenticated');
            } else if (event === 'SIGNED_IN' && session?.user) {
              const sUser = session.user;
              let profile = null;
              try {
                const res = await supabase
                  .from('profiles')
                  .select('id, username, name, phone, company_name, user_type, role')
                  .eq('id', sUser.id)
                  .limit(1)
                  .maybeSingle();
                profile = res.data;
              } catch (e) {
                console.warn('[AuthContext] onAuthStateChange profile fetch error:', e);
              }

              const authData = {
                id: sUser.id,
                username: profile?.username || `oauth_${sUser.id.substring(0, 8)}`,
                name: profile?.name || sUser.user_metadata?.name || '회원',
                phone: profile?.phone || sUser.user_metadata?.phone || '',
                company_name: profile?.company_name || null,
                user_type: profile?.user_type || '일반',
                role: profile?.role || 'user',
                email: sUser.email || null,
                isLoggedIn: true
              };

              localStorage.setItem('dk_auth_user', JSON.stringify(authData));
              setUser(authData);
              setAuthStatus('authenticated');
            }
          } catch (evtErr) {
            console.error('[AuthContext] onAuthStateChange error:', evtErr);
          }
        }, 0);
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [checkSession]);

  const login = useCallback(async (id, password) => {
    try {
      const res = await authLogin(id, password);
      if (res.success && res.user) {
        setUser(res.user);
        setAuthStatus('authenticated');
      }
      return res;
    } catch (err) {
      console.error("[AuthContext Login Error]", err);
      return { success: false, message: `로그인 중 오류가 발생했습니다. (${err.message || err.toString()})` };
    }
  }, []);

  const logout = useCallback(() => {
    authLogout();
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    setAuthStatus('unauthenticated');
  }, []);

  const signup = useCallback(async (userData) => {
    try {
      const res = await authSignup(userData);
      return res;
    } catch (err) {
      console.error("[AuthContext Signup Error]", err);
      return { success: false, message: `회원가입 중 오류가 발생했습니다. (${err.message || err.toString()})` };
    }
  }, []);

  const openLoginModal = useCallback(() => {
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const value = {
    user,
    authStatus,
    loading: authStatus === 'checking',
    isLoginModalOpen,
    login,
    logout,
    signup,
    findUsernameByEmail,
    requestPasswordReset,
    updatePasswordWithSession,
    openLoginModal,
    closeLoginModal,
    setUser,
    checkSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
