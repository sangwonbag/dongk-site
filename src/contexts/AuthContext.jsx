/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { getCurrentUser, login as authLogin, logout as authLogout, signup as authSignup } from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loading] = useState(false);

  const login = useCallback(async (id, password) => {
    try {
      const res = await authLogin(id, password);
      if (res.success && res.user) {
        setUser(res.user);
      }
      return res;
    } catch (err) {
      console.error("[AuthContext Login Error]", err);
      return { success: false, message: `로그인 중 오류가 발생했습니다. (${err.message || err.toString()})` };
    }
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
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

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const value = {
    user,
    loading,
    isLoginModalOpen,
    login,
    logout,
    signup,
    openLoginModal,
    closeLoginModal,
    setUser
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
