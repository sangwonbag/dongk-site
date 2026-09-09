import React, { useState, useEffect, useRef } from "react";

/**
 * LazySection defers rendering its children until the element is within `rootMargin` of the viewport,
 * or after an optional `fallbackDelay` idle timeout.
 */
export default function LazySection({
  children,
  minHeight = "200px",
  rootMargin = "300px 0px",
  fallbackDelay = 2000,
  className = ""
}) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isVisible) return;

    let observer = null;
    let timer = null;

    if (typeof IntersectionObserver !== "undefined" && containerRef.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (observer) observer.disconnect();
          }
        },
        { rootMargin }
      );
      observer.observe(containerRef.current);
    } else {
      setIsVisible(true);
    }

    if (fallbackDelay > 0) {
      timer = setTimeout(() => {
        setIsVisible(true);
      }, fallbackDelay);
    }

    return () => {
      if (observer) observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, rootMargin, fallbackDelay]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={!isVisible ? { minHeight, contentVisibility: "auto" } : undefined}
    >
      {isVisible ? children : null}
    </div>
  );
}
