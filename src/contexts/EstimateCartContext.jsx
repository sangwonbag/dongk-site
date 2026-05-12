import React, { createContext, useContext, useState, useEffect } from 'react';

const EstimateCartContext = createContext();

export function useEstimateCart() {
  return useContext(EstimateCartContext);
}

export function EstimateCartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: '' });

  // Load initial cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('estimateCart');
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse estimate cart', e);
      }
    }
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('estimateCart', JSON.stringify(cartItems));
  }, [cartItems]);

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
    setToast({ visible: true, message: '견적요청에 담겼습니다' });
    
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
