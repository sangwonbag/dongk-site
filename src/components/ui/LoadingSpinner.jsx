import React from "react";
import { Loader } from "lucide-react";
import "./LoadingSpinner.css";

export default function LoadingSpinner({ size = 28, centered = true, message = "" }) {
  const spinner = <Loader size={size} className="ui-spinner-loader-icon" />;
  
  if (centered) {
    return (
      <div className="ui-spinner-centered-wrapper">
        {spinner}
        {message && <p className="ui-spinner-message">{message}</p>}
      </div>
    );
  }
  return spinner;
}
