import React, { useEffect, useState } from 'react';
import './IntroSplash.css';

export default function IntroSplash({ onFinish }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Disable scrolling while intro is active
    document.body.style.overflow = 'hidden';
    
    // Total animation time is ~2.4s (1.9s + 0.5s fadeOut).
    // Let's unmount slightly after fadeOut finishes.
    const timer = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = 'unset';
      if (onFinish) onFinish();
    }, 2400); 

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
    };
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div className="intro-splash-container">
      <div className="water-splash-container">
        {/* Ripple effects */}
        <div className="ripple ripple-1"></div>
        <div className="ripple ripple-2"></div>
        
        {/* Bouncing logo */}
        <div className="logo-bounce-wrapper">
          <img src="/dk-logo.png" alt="Dongkyung Flooring" className="intro-logo" />
        </div>
        
        {/* Splashing dots */}
        <div className="splash-dot dot-1"></div>
        <div className="splash-dot dot-2"></div>
        <div className="splash-dot dot-3"></div>
      </div>
    </div>
  );
}
