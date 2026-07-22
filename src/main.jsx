import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { EstimateCartProvider } from "./contexts/EstimateCartContext";
import { AuthProvider } from "./contexts/AuthContext";
import "./styles/index.css";

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

