import React, { useState, useEffect, useRef } from "react";
import ApartmentScene from "./ApartmentScene";
import HeroOverlay from "./HeroOverlay";
import "./InteractiveApartmentHero.css";

export default function InteractiveApartmentHero() {
  const [currentScene, setCurrentScene] = useState("entrance"); // Starts at 현관 (Entrance) as requested
  const [autoRotate, setAutoRotate] = useState(true);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const heroRef = useRef(null);
  const timerRef = useRef(null);

  // IntersectionObserver to optimize performance:
  // Unmounts Three.js Canvas when the user scrolls down past the hero section.
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting);
      },
      { threshold: 0.05 } // Trigger when at least 5% of the hero is visible
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleUserInteraction = (isInteracting) => {
    if (isInteracting) {
      // Stop automatic rotation when dragging starts
      setAutoRotate(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      // Set timer to resume automatic rotation 5 seconds after dragging stops
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setAutoRotate(true);
      }, 5000);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <section className="interactive-hero-section" ref={heroRef}>
      <div className="hero-canvas-container">
        {isHeroVisible ? (
          <ApartmentScene 
            currentScene={currentScene}
            onSceneChange={setCurrentScene}
            autoRotate={autoRotate} 
            onUserInteraction={handleUserInteraction} 
          />
        ) : (
          // Fallback static container when scrolled out of view to save GPU cycles
          <div className="hero-fallback-static"></div>
        )}
      </div>

      {/* Content text and buttons overlay */}
      <HeroOverlay />

      {/* Floating Interactive Guide UI */}
      <div className="interactive-prompt">
        <svg 
          className="prompt-icon"
          viewBox="0 0 24 24" 
          width="20" 
          height="20" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span className="prompt-text">드레그해서 360도 공간 돌아보기</span>
      </div>
    </section>
  );
}

