// components/AdminConfirmModal.jsx
import React from 'react';

const AdminConfirmModal = ({
  show,
  title = 'Confirm Action',
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false
}) => {
  if (!show) return null;

  return (
    <div className="modal-backdrop modalbox confirmbox">
      <div className="modal-box confirm-modal">
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminConfirmModal;