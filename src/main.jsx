import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import { EstimateCartProvider } from "./contexts/EstimateCartContext";
import { AuthProvider } from "./contexts/AuthContext";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EstimateCartProvider>
          <App />
        </EstimateCartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Register PWA Service Worker in production/supported environments
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('SW registration failed: ', err);
    });
  });
}

