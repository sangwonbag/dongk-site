import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const EstimateCartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useEstimateCart() {
  return useContext(EstimateCartContext);
}

export function EstimateCartProvider({ children }) {
  const { user } = useAuth();

  // Helper to determine active cart key based on user session
  const getCartKey = (currentUser) => {
    return currentUser ? `estimateCart_${currentUser.id}` : 'estimateCart_guest';
  };

  const [cartItems, setCartItems] = useState(() => {
    // Determine initial key on mount
    const savedUserStr = localStorage.getItem('dk_auth_user');
    let initialKey = 'estimateCart_guest';
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        if (parsed && parsed.id) {
          initialKey = `estimateCart_${parsed.id}`;
        }
      } catch (e) {
        console.error('Failed to parse user on initial cart load', e);
      }
    }

    const saved = localStorage.getItem(initialKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse estimate cart', e);
      }
    }

    // Try fallback to legacy key if guest and guest key has no data
    if (initialKey === 'estimateCart_guest') {
      const legacy = localStorage.getItem('estimateCart');
      if (legacy) {
        try {
          const parsedLegacy = JSON.parse(legacy);
          localStorage.setItem('estimateCart_guest', legacy);
          localStorage.removeItem('estimateCart');
          return parsedLegacy;
        } catch (e) {
          // ignore
        }
      }
    }
    return [];
  });
  const [toast, setToast] = useState({ visible: false, message: '' });

  const prevUserRef = useRef(user);

  // Sync state with storage when user session changes (Login / Logout)
  useEffect(() => {
    const prevUser = prevUserRef.current;
    prevUserRef.current = user;

    // Case 1: Guest -> Logged In
    if (!prevUser && user) {
      const guestKey = 'estimateCart_guest';
      const userKey = `estimateCart_${user.id}`;

      const guestCartStr = localStorage.getItem(guestKey);
      const userCartStr = localStorage.getItem(userKey);

      let guestCart = [];
      let userCart = [];

      try {
        if (guestCartStr) guestCart = JSON.parse(guestCartStr);
      } catch (e) { console.error('Failed to parse guest cart on login', e); }

      try {
        if (userCartStr) userCart = JSON.parse(userCartStr);
      } catch (e) { console.error('Failed to parse user cart on login', e); }

      if (guestCart.length > 0) {
        // Merge guest items into user cart
        const mergedCart = [...userCart];
        guestCart.forEach(gItem => {
          const existing = mergedCart.find(uItem => uItem.id === gItem.id);
          if (existing) {
            existing.quantity = (existing.quantity || 1) + (gItem.quantity || 1);
          } else {
            mergedCart.push(gItem);
          }
        });
        setCartItems(mergedCart);
        localStorage.setItem(userKey, JSON.stringify(mergedCart));
        localStorage.removeItem(guestKey);
      } else {
        setCartItems(userCart);
      }
    }
    // Case 2: Logged In -> Logged Out
    else if (prevUser && !user) {
      setCartItems([]);
      localStorage.removeItem('estimateCart_guest');
      localStorage.removeItem(`estimateCart_${prevUser.id}`);
      localStorage.removeItem('estimateCart'); // clear legacy key too
    }
  }, [user]);

  // Save to active storage key whenever cart items change
  useEffect(() => {
    const key = getCartKey(user);
    localStorage.setItem(key, JSON.stringify(cartItems));
  }, [cartItems, user]);

  const addToCart = (item) => {
    setCartItems(prev => {
      // Check if item already exists based on ID
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });

    // Show toast
    setToast({ visible: true, message: '장바구니에 담았습니다.' });
    
    // Auto-hide toast after 5 seconds
    setTimeout(() => {
      hideToast();
    }, 5000);
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setCartItems([]);
    const key = getCartKey(user);
    localStorage.removeItem(key);
    localStorage.removeItem('estimateCart');
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  return (
    <EstimateCartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toast,
      hideToast
    }}>
      {children}
    </EstimateCartContext.Provider>
  );
}

