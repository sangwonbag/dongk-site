import React from 'react';

/**
 * Wraps React.lazy to provide automatic retry and version-mismatch recovery for dynamic route imports.
 *
 * @param {() => Promise<{ default: React.ComponentType<any> }>} importFn
 * @returns {React.LazyExoticComponent<React.ComponentType<any>>}
 */
export function safeLazy(importFn) {
  return React.lazy(async () => {
    try {
      const module = await importFn();
      // On success, reset session reload flag
      sessionStorage.removeItem('dk_chunk_retry_executed');
      return module;
    } catch (firstError) {
      console.warn('[safeLazy] Initial dynamic import attempt failed. Retrying in 300ms...', firstError);

      // Short delay before second attempt
      await new Promise((resolve) => setTimeout(resolve, 300));

      try {
        const retryModule = await importFn();
        sessionStorage.removeItem('dk_chunk_retry_executed');
        return retryModule;
      } catch (secondError) {
        console.error('[safeLazy] Dynamic import failed after retry:', secondError);

        const errMessage = String(secondError?.message || secondError || '');
        const isChunkOrFetchError =
          errMessage.includes('Failed to fetch dynamically imported module') ||
          errMessage.includes('Loading chunk') ||
          errMessage.includes('Unexpected token') ||
          errMessage.includes('Importing a module script failed') ||
          secondError?.name === 'ChunkLoadError' ||
          secondError?.name === 'TypeError';

        const hasRetriedInSession = sessionStorage.getItem('dk_chunk_retry_executed');

        if (isChunkOrFetchError && !hasRetriedInSession) {
          console.warn('[safeLazy] Deployment version mismatch detected. Reloading page once to acquire fresh index.html...');
          sessionStorage.setItem('dk_chunk_retry_executed', 'true');
          window.location.reload();
          // Return non-resolving promise while page reloads
          return new Promise(() => {});
        }

        // If already reloaded or not recoverable, propagate error to ErrorBoundary
        throw secondError;
      }
    }
  });
}
