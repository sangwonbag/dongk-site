import React from "react";
import "./Toast.css";

export default function Toast({ message, visible, onClose, actionLabel, onAction }) {
  if (!visible) return null;

  return (
    <div className="ui-toast-container-bar">
      <span className="ui-toast-message">{message}</span>
      <div className="ui-toast-actions-box">
        {actionLabel && onAction && (
          <button className="btn-secondary" onClick={() => { onAction(); onClose(); }}>
            {actionLabel}
          </button>
        )}
        <button className="btn-primary" onClick={onClose}>계속 보기</button>
      </div>
    </div>
  );
}
