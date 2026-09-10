import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { EstimateCartProvider } from "./contexts/EstimateCartContext";
import { AuthProvider } from "./contexts/AuthContext";
import "./styles/index.css";

// Automatically unregister legacy Service Workers & purge stale Cache Storage for existing visitors
if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((success) => {
          if (success) console.log('[SW] Unregistered legacy service worker:', registration.scope);
        });
      }
    }).catch(() => {});
  }

  if ('caches' in window) {
    caches.keys().then((names) => {
      for (const name of names) {
        caches.delete(name).then((success) => {
          if (success) console.log('[CacheStorage] Cleared legacy cache storage:', name);
        });
      }
    }).catch(() => {});
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <EstimateCartProvider>
            <App />
          </EstimateCartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);


