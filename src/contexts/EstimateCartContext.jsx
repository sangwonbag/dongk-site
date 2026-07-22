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
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse estimate cart', e);
      }
    }
    return [];
  });
  const [toast, setToast] = useState({ visible: false, message: '' });

  const prevUserRef = useRef(user);

  // Helper getters/setters for buyNowItem & pendingDirectOrder
  const getBuyNowItem = () => {
    try {
      const item = localStorage.getItem('buyNowItem') || localStorage.getItem('pendingDirectOrder');
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Failed to parse buyNowItem', e);
      return null;
    }
  };

  const setBuyNowItem = (item) => {
    localStorage.setItem('buyNowItem', JSON.stringify(item));
    localStorage.setItem('pendingDirectOrder', JSON.stringify(item));
  };

  const removeBuyNowItem = () => {
    localStorage.removeItem('buyNowItem');
    sessionStorage.removeItem('buyNowItem');
    localStorage.removeItem('pendingDirectOrder');
    sessionStorage.removeItem('pendingDirectOrder');
    localStorage.removeItem('directOrder');
    sessionStorage.removeItem('directOrder');
  };

  const getPendingDirectOrder = getBuyNowItem;
  const setPendingDirectOrder = setBuyNowItem;
  const removePendingDirectOrder = removeBuyNowItem;

  const clearAllCartStorage = () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (
        key === 'estimateCart' ||
        key === 'estimateCart_guest' ||
        key === 'pendingDirectOrder' ||
        key === 'buyNowItem' ||
        key === 'checkoutItems' ||
        key === 'checkoutDraft' ||
        key === 'directOrder' ||
        key === 'cartItems' ||
        key === 'dongk_cart' ||
        key === 'dongk_estimate_cart' ||
        (key && key.startsWith('estimateCart_'))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Clear session storage as well
    sessionStorage.removeItem('pendingDirectOrder');
    sessionStorage.removeItem('buyNowItem');
    sessionStorage.removeItem('directOrder');
    sessionStorage.removeItem('checkoutItems');
    sessionStorage.removeItem('checkoutDraft');

    window.dispatchEvent(new CustomEvent('dongk-cart-cleared'));
    window.dispatchEvent(new StorageEvent('storage', { key: 'estimateCart' }));
  };

  // Legacy local storage keys cleanup
  useEffect(() => {
    const keysToRemove = ['estimateCart', 'cart', 'cartItems', 'dk-cart', 'dongk-cart'];
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // Validate estimateCart_guest structure
    const guestCart = localStorage.getItem('estimateCart_guest');
    if (guestCart) {
      try {
        const parsed = JSON.parse(guestCart);
        if (!Array.isArray(parsed)) {
          localStorage.removeItem('estimateCart_guest');
        }
      } catch (e) {
        localStorage.removeItem('estimateCart_guest');
      }
    }

    // Clean up inactive user cart keys
    const currentUserId = user ? user.id : null;
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('estimateCart_') && key !== 'estimateCart_guest') {
        const userIdFromKey = key.replace('estimateCart_', '');
        if (userIdFromKey !== currentUserId) {
          localStorage.removeItem(key);
        }
      }
    });
  }, [user]);

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
      clearAllCartStorage();
    }
  }, [user]);

  // Save to active storage key whenever cart items change
  useEffect(() => {
    const key = getCartKey(user);
    localStorage.setItem(key, JSON.stringify(cartItems));
  }, [cartItems, user]);

  // Storage event listener to sync state across same/different tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      const activeKey = getCartKey(user);
      if (e.key === activeKey) {
        if (e.newValue) {
          try {
            setCartItems(JSON.parse(e.newValue));
          } catch (err) {
            console.error('Failed to parse storage synced cart', err);
          }
        } else {
          setCartItems([]);
        }
      }
      if (e.key === 'dk_auth_user' && !e.newValue) {
        setCartItems([]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  // Add custom event listener for cart:cleared event to sync state immediately
  useEffect(() => {
    const handleCartCleared = () => {
      setCartItems([]);
    };
    window.addEventListener('cart:cleared', handleCartCleared);
    return () => window.removeEventListener('cart:cleared', handleCartCleared);
  }, []);

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

  const updateQuantity = (id, quantity, options = {}) => {
    setCartItems(prev => prev.map(i => i.id === id ? { 
      ...i, 
      quantity, 
      isManualQty: options.isManual !== undefined ? options.isManual : true 
    } : i));
  };

  const syncAutomaticQuantities = (areaPyeong) => {
    const pyeongVal = parseFloat(areaPyeong);
    const defaultQty = (!isNaN(pyeongVal) && pyeongVal > 0) ? pyeongVal : 1;
    setCartItems(prev => prev.map(item => {
      if (item.isManualQty) return item;
      return { ...item, quantity: defaultQty };
    }));
  };

  const clearCart = async (options = {}) => {
    setCartItems([]);
    if (options.clearAll) {
      clearAllCartStorage();
      window.dispatchEvent(new Event('cart:cleared'));
    } else {
      const key = getCartKey(user);
      localStorage.removeItem(key);
      localStorage.removeItem('estimateCart');
    }
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Provide unified cartCount (length of distinct items in cart)
  const cartCount = cartItems.length;

  return (
    <EstimateCartContext.Provider value={{
      cartItems,
      cartCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      syncAutomaticQuantities,
      clearCart,
      clearAllCartStorage,
      getPendingDirectOrder,
      setPendingDirectOrder,
      removePendingDirectOrder,
      getBuyNowItem,
      setBuyNowItem,
      removeBuyNowItem,
      toast,
      hideToast
    }}>
      {children}
    </EstimateCartContext.Provider>
  );


}
