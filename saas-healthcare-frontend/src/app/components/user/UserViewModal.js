import React, { useState } from 'react';
import './UserModal.css';
import { toggleMFA } from '../../../services/userService';
import AdminConfirmModal from '../../components/common/AdminConfirmModal';
import { toast } from 'react-toastify';

export default function UserViewModal({ show, onClose, user, setViewUser, getUserById, fetchUsers }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingToggleId, setPendingToggleId] = useState(null);

  const handleToggleMFA = async (id) => {
    try {
      await toggleMFA(id);
      toast.success(`MFA ${user.mfaEnabled ? 'disabled' : 'enabled'} for ${user.name}`);

      const { data: updatedUser } = await getUserById(id);
      setViewUser(updatedUser);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to toggle MFA');
    }
  };

  if (!show || !user) return null;
  
  return (
    <>
      <div className="modal-backdrop modalbox">
        <div className="modal-box animated-entry">
          <h2 className="modal-title">👤 User Details</h2>

          <div className="section mt-5">
            <div className="field"><strong>Name:</strong> {user.name}</div>
            <div className="field"><strong>Role:</strong> <span className={`role-tag ${user.role}`}>{user.role}</span></div>
            <div className="field"><strong>Status:</strong> 
              <span className={`status-badge ${user.status}`}>
                {user.status === 'active' ? '🟢 Active' : '🔴 Suspended'}
              </span>
            </div>
          </div>

          <div className="section">
            <div className="field"><strong>Email:</strong> {user.email}</div>
            <div className="field"><strong>Phone:</strong> {user.phone}</div>
          </div>

          <div className="section">
            <div className="field">
              <strong>MFA:</strong>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={user.mfaEnabled}
                  onChange={() => {
                    setPendingToggleId(user._id);
                    setShowConfirm(true);
                  }}
                  disabled={user.role === 'patient'}
                  aria-label="Toggle MFA"
                />
                <span className="slider"></span>
              </label>
              <span className={`mfa-status ${user.mfaEnabled ? 'enabled' : 'disabled'}`}>
                {user.mfaEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div className="field">
              <strong>Last Login:</strong> {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
            </div>
          </div>

          {user.role === 'doctor' && (
            <div className="section">
              <div className="field"><strong>Department:</strong> {user.department || '-'}</div>
              <div className="field"><strong>Specialty:</strong> {user.specialty || '-'}</div>
            </div>
          )}

          {user.auditTrail?.length > 0 && (
            <div className="section">
              <strong>Recent Activity:</strong>
              <ul className="audit-list">
                {user.auditTrail.slice(-5).map((log, i) => (
                  <li key={i}>
                    <span className="audit-icon">📄</span> {log.action} by <strong>{log.actor}</strong> on {new Date(log.timestamp).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>

      {/* {showConfirm && (
        <div className="modal-backdrop modalbox confirmbox">
          <div className="modal-box confirm-modal">
            <h2 className="modal-title">⚠️ Confirm MFA Toggle</h2>
            <p className="modal-message">
              Are you sure you want to {user.mfaEnabled ? 'disable' : 'enable'} MFA for <strong>{user.name}</strong>?<br />
              This action will be logged in the audit trail.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-danger"
                onClick={async () => {
                  await handleToggleMFA(pendingToggleId);
                  setShowConfirm(false);
                  setPendingToggleId(null);
                }}
              >
                Confirm
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowConfirm(false);
                  setPendingToggleId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )} */}

      <AdminConfirmModal
        show={showConfirm}
        title="⚠️ Confirm MFA Toggle"
        message={`Are you sure you want to ${user.mfaEnabled ? 'disable' : 'enable'} MFA for ${user.name}? This action will be logged in the audit trail.`}
        onConfirm={async () => {
          await handleToggleMFA(pendingToggleId);
          setShowConfirm(false);
          setPendingToggleId(null);
        }}
        onCancel={() => {
          setShowConfirm(false);
          setPendingToggleId(null);
        }}
        danger={true}
      />

    </>
  );
}