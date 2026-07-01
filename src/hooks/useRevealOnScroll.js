import { useEffect, useRef } from "react";

/**
 * Custom hook to trigger animations when elements scroll into view.
 * Adds the 'is-visible' class to selected elements.
 * 
 * @param {Object} options IntersectionObserver options
 * @param {boolean} options.once Disconnect observer for that element after it becomes visible
 * @param {number} options.threshold The ratio of the element visible in viewport (0.0 to 1.0)
 * @param {string} options.rootMargin Margin around the root viewport boundaries
 */
export default function useRevealOnScroll(options = {}) {
  const { once = true, threshold = 0.12, rootMargin = "0px 0px -8% 0px" } = options;
  const elementsRef = useRef([]);

  const registerElement = (el) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  useEffect(() => {
    const targets = elementsRef.current.filter(Boolean);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      { threshold, rootMargin }
    );

    targets.forEach((target) => observer.observe(target));

    return () => {
      targets.forEach((target) => observer.unobserve(target));
      observer.disconnect();
    };
  }, [once, threshold, rootMargin]);

  return registerElement;
}
