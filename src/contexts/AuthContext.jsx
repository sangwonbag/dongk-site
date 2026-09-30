/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, login as authLogin, logout as authLogout, signup as authSignup } from '../lib/auth';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [authStatus, setAuthStatus] = useState('checking'); // 'checking' | 'authenticated' | 'unauthenticated'
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const checkSession = useCallback(async () => {
    setAuthStatus('checking');
    try {
      if (supabase) {
        // 1. Check Supabase Auth OAuth session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!sessionError && session && session.user) {
          const sUser = session.user;
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, name, phone, company_name, user_type, role')
            .eq('id', sUser.id)
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
        }

        // 2. Check local user session saved from custom login
        const localUser = getCurrentUser();
        if (localUser && localUser.isLoggedIn) {
          const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('id, username, name, phone, company_name, user_type, role')
            .eq('username', localUser.username)
            .maybeSingle();

          if (!profileErr && profile) {
            const updatedUser = {
              ...localUser,
              ...profile,
              isLoggedIn: true
            };
            localStorage.setItem('dk_auth_user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setAuthStatus('authenticated');
            return;
          } else if (profileErr) {
            // Network error during profile check; trust local user defensively
            setUser(localUser);
            setAuthStatus('authenticated');
            return;
          } else {
            // Profile no longer exists on server
            authLogout();
            setUser(null);
            setAuthStatus('unauthenticated');
            return;
          }
        }
      } else {
        // Fallback for missing Supabase client (development mode)
        const localUser = getCurrentUser();
        if (localUser && localUser.isLoggedIn) {
          setUser(localUser);
          setAuthStatus('authenticated');
          return;
        }
      }

      // No active session found
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
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          authLogout();
          setUser(null);
          setAuthStatus('unauthenticated');
        } else if (event === 'SIGNED_IN' && session?.user) {
          const sUser = session.user;
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, name, phone, company_name, user_type, role')
            .eq('id', sUser.id)
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
        }
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
    const confirmLogin = window.confirm("로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?");
    if (confirmLogin) {
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
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
