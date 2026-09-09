/**
 * Preloads page chunk JS modules in the background on hover/touch or idle.
 */
const preloadedRoutes = new Set();

export function preloadRoute(path) {
  if (!path || preloadedRoutes.has(path)) return;
  preloadedRoutes.add(path);

  try {
    if (path.startsWith('/materials')) {
      import('../pages/Materials/Materials');
    } else if (path.startsWith('/estimate')) {
      import('../pages/Estimate/EstimateRequest');
    } else if (path.startsWith('/samplebooks')) {
      import('../pages/Samplebooks/SampleBooks');
    } else if (path.startsWith('/cases')) {
      import('../pages/Cases/Cases');
    } else if (path.startsWith('/cart') || path.startsWith('/checkout')) {
      import('../pages/Cart/Cart');
    }
  } catch {
    // Non-blocking preloader
  }
}

export function setupIdlePreload() {
  const preloader = () => {
    preloadRoute('/materials');
    preloadRoute('/estimate');
  };

  if ('requestIdleCallback' in window) {
    const handle = window.requestIdleCallback(preloader, { timeout: 2000 });
    return () => window.cancelIdleCallback(handle);
  } else {
    const timer = setTimeout(preloader, 1000);
    return () => clearTimeout(timer);
  }
}
