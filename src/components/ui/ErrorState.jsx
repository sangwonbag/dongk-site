import React from "react";
import { AlertTriangle } from "lucide-react";
import "./ErrorState.css";

export default function ErrorState({ 
  title = "오류가 발생했습니다", 
  message = "서버와의 통신이 원활하지 않습니다.", 
  retryLabel = "다시 시도", 
  onRetry = null 
}) {
  return (
    <div className="ui-error-banner-alert">
      <AlertTriangle className="ui-error-icon-alert" size={20} />
      <div className="ui-error-content-wrapper">
        <h4 className="ui-error-title-alert">{title}</h4>
        <p className="ui-error-message-alert">{message}</p>
      </div>
      {onRetry && (
        <button className="btn btn-secondary btn-sm ui-error-retry-action-btn" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  );
}
