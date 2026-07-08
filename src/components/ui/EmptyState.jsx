import React from "react";
import { Info, AlertTriangle } from "lucide-react";
import "./EmptyState.css";

export default function EmptyState({ 
  title = "결과가 없습니다", 
  description = "조건에 부합하는 항목이 없거나 현재 준비 중입니다.", 
  actionLabel = "", 
  onAction = null,
  iconType = "info"
}) {
  return (
    <div className="ui-empty-state-card">
      <div className="ui-empty-icon-box">
        {iconType === "warning" ? (
          <AlertTriangle size={36} color="var(--warning)" />
        ) : (
          <Info size={36} color="var(--text-light)" />
        )}
      </div>
      <h3 className="ui-empty-title">{title}</h3>
      {description && <p className="ui-empty-desc">{description}</p>}
      {actionLabel && onAction && (
        <button className="btn btn-secondary ui-empty-action-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
