import React from 'react';
import './ConfirmModal.css';

export default function ConfirmModal({ show, onClose, onConfirm, message }) {
  if (!show) return null;

  return (
    <div className="modal-backdrop modalbox">
      <div className="modal-box">
        <h3>Confirm Action</h3>
        <p>{message || 'Are you sure you want to proceed?'}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
