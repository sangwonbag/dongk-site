/**
 * Preloads page chunk JS modules in the background on hover/touch or idle.
 * Since primary visitor routes are statically imported in App.jsx, preloading is a no-op.
 */
export function preloadRoute(path) {
  // Primary routes are pre-bundled in main bundle index.js
}

export function setupIdlePreload() {
  return () => {};
}

