import React from "react";
import "./ConfirmModal.css";

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "확인", 
  description = "이 작업을 진행하시겠습니까?", 
  confirmLabel = "확인", 
  cancelLabel = "취소",
  isDanger = false 
}) {
  if (!isOpen) return null;

  return (
    <div className="ui-confirm-modal-overlay">
      <div className="ui-confirm-modal-card">
        <h3 className="ui-confirm-modal-title">{title}</h3>
        <p className="ui-confirm-modal-desc">{description}</p>
        <div className="ui-confirm-modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            {cancelLabel}
          </button>
          <button 
            className={`btn ${isDanger ? "btn-danger" : "btn-primary"}`} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
