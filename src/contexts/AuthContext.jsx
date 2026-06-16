import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login as authLogin, logout as authLogout, signup as authSignup } from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize user status on mount
  useEffect(() => {
    const initializedUser = getCurrentUser();
    setUser(initializedUser);
    setLoading(false);
  }, []);

  const login = async (id, password) => {
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
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const signup = async (userData) => {
    try {
      const res = await authSignup(userData);
      return res;
    } catch (err) {
      console.error("[AuthContext Signup Error]", err);
      return { success: false, message: `회원가입 중 오류가 발생했습니다. (${err.message || err.toString()})` };
    }
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

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
