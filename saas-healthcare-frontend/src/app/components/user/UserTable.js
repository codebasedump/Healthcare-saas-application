import React, { useState } from 'react';
import ConfirmModal from '../common/ConfirmModal';
import UserViewModal from './UserViewModal';
import UserEditModal from './UserEditModal';
import CreateUserModal from './CreateUserModal';
import AuditTrailModal from '../common/AuditTrailModal';
import LinkPatientsModal from '../doctor/LinkPatientsModal';
import LinkedPatientsViewModal from '../doctor/LinkedPatientsViewModal';
import { getUserById, toggleUserStatus, deleteUser } from '../../../services/userService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash, faChartBar, faToggleOff, faToggleOn, faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { can } from '../../../utils/permissions';
import '../../pages/pages-common.css';

export default function UserTable({ users, currentUser, fetchUsers }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);

  const [showLinkedModal, setShowLinkedModal] = useState(false);
  const [viewLinkedDoctor, setViewLinkedDoctor] = useState(null);

  const role = currentUser?.role;

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    deleteUser(selectedId)
      .then(() => {
        toast.success('🗑 User deleted');
        fetchUsers(); // ✅ Refresh instead of reload
      })
      .catch(() => toast.error('❌ Delete failed'));
    setShowModal(false);
  };

  const handleToggleStatus = async (userId, isActivating) => {
    try {
      const newStatus = isActivating ? 'active' : 'suspended';
      await toggleUserStatus(userId, newStatus);
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchUsers(); // ✅ Refresh instead of reload
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'doctor': return 'primary';
      case 'receptionist': return 'secondary';
      default: return 'dark';
    }
  };


  const handleOpenAuditModal = (userId) => {
    setSelectedUserId(userId);
    setShowAuditModal(true);
  };

  const handleCloseAuditModal = () => {
    setShowAuditModal(false);
    setSelectedUserId(null);
  };

  const openLinkModal = (userId) => {
    setSelectedUserId(userId);
    setShowLinkModal(true);
  };


  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <>
      <button className="action-btn view mt-4" onClick={() => setShowCreate(true)}>+ Create User</button>
      {/* <table className="user-table mt-4">
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>MFA</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id} className="hover-row">
              <td><div className={`avatar ${user.role}`}>{user.name.charAt(0).toUpperCase()}</div></td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone || '-'}</td>
              <td>{user.mfaEnabled ? 'Enabled ✅' : 'Disabled ❌'}</td>
              <td><span className={`badge bg-${getRoleColor(user.role)}`}>{capitalize(user.role)}</span></td>
              <td>
                <span className={`status-pill ${user.status}`}>
                  <FontAwesomeIcon icon={user.status === 'active' ? faCircleCheck : faCircleXmark} className="me-1" />
                  {user.status === 'active' ? 'Active' : 'Suspended'}
                </span>
              </td>
              <td style={{ textAlign: 'center' }}>
                <div className="dropdown">
                  <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    Actions
                  </button>
                   <ul className="dropdown-menu dropdown-menu-end">
                    {can(role, 'view') && (
                      <li>
                        <button
                          className="dropdown-item action-link action-btn view"
                          onClick={() => setViewUser(user)}
                        >
                          <FontAwesomeIcon icon={faEye} className="me-1" /> View
                        </button>
                      </li>
                    )}
                    {can(role, 'edit') && (
                      <li>
                        <button
                          className="dropdown-item action-link action-btn edit"
                          onClick={() => setEditUser(user)}
                        >
                          <FontAwesomeIcon icon={faEdit} className="me-1" /> Edit
                        </button>
                      </li>
                    )}
                    {can(role, 'audit') && (
                      <li>
                        <button
                          className="dropdown-item action-link action-btn btn-audit"
                          onClick={() => handleOpenAuditModal(user._id)}
                        >
                          <FontAwesomeIcon icon={faChartBar} className="me-1" /> View Audit
                        </button>
                      </li>
                    )}
                    {can(role, 'delete') && (
                      <li>
                        <button
                          className="dropdown-item action-link action-btn delete"
                          onClick={() => handleDeleteClick(user._id)}
                        >
                          <FontAwesomeIcon icon={faTrash} className="me-1" /> Delete
                        </button>
                      </li>
                    )}
                    {can(role, 'toggleStatus') && (
                      <li>
                        <button
                          className={`dropdown-item action-link action-btn btn-status ${user.status === 'active' ? 'text-danger' : 'text-success'}`}
                          onClick={() => handleToggleStatus(user._id, user.status !== 'active')}
                        >
                          <FontAwesomeIcon
                            icon={user.status === 'active' ? faToggleOff : faToggleOn}
                            className="me-2"
                          />
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </li>
                    )}
                    
                    {currentUser.role === 'admin' && user.role === 'doctor' && (
                      <li>
                        <button
                          className="dropdown-item action-link action-btn view"
                          onClick={() => openLinkModal(user._id)}
                        >
                          🔗 Link Patients
                        </button>
                      </li>
                    )}
                    {currentUser.role === 'admin' &&  user.role === 'doctor' && (
                      <li>
                        <button
                          className="dropdown-item action-link action-btn view"
                          onClick={() => {
                            setViewLinkedDoctor(user);
                            setShowLinkedModal(true);
                          }}
                        >
                          👁 View Linked Patients
                        </button>
                      </li>
                    )}

                  </ul>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table> */}


      <div className="user-grid mt-4">
        <div className="user-header">
          <div>Avatar</div>
          <div>Name</div>
          <div>Email</div>
          <div>Phone</div>
          <div>MFA</div>
          <div>Role</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {users.map(user => (
          <div key={user._id} className="user-row hover-row">
            <div><div className={`avatar ${user.role}`}>{user.name.charAt(0).toUpperCase()}</div></div>
            <div>{user.name}</div>
            <div>{user.email}</div>
            <div>{user.phone || '-'}</div>
            <div>{user.mfaEnabled ? 'Enabled ✅' : 'Disabled ❌'}</div>
            <div><span className={`badge bg-${getRoleColor(user.role)}`}>{capitalize(user.role)}</span></div>
            <div>
              <span className={`status-pill ${user.status}`}>
                <FontAwesomeIcon icon={user.status === 'active' ? faCircleCheck : faCircleXmark} className="me-1" />
                {user.status === 'active' ? 'Active' : 'Suspended'}
              </span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="dropdown">
                <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  Actions
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  {can(role, 'view') && (
                    <li>
                      <button className="dropdown-item action-link action-btn view" onClick={() => setViewUser(user)}>
                        <FontAwesomeIcon icon={faEye} className="me-1" /> View
                      </button>
                    </li>
                  )}
                  {can(role, 'edit') && (
                    <li>
                      <button className="dropdown-item action-link action-btn edit" onClick={() => setEditUser(user)}>
                        <FontAwesomeIcon icon={faEdit} className="me-1" /> Edit
                      </button>
                    </li>
                  )}
                  {can(role, 'audit') && (
                    <li>
                      <button className="dropdown-item action-link action-btn btn-audit" onClick={() => handleOpenAuditModal(user._id)}>
                        <FontAwesomeIcon icon={faChartBar} className="me-1" /> View Audit
                      </button>
                    </li>
                  )}
                  {can(role, 'delete') && (
                    <li>
                      <button className="dropdown-item action-link action-btn delete" onClick={() => handleDeleteClick(user._id)}>
                        <FontAwesomeIcon icon={faTrash} className="me-1" /> Delete
                      </button>
                    </li>
                  )}
                  {can(role, 'toggleStatus') && (
                    <li>
                      <button
                        className={`dropdown-item action-link action-btn btn-status ${user.status === 'active' ? 'text-danger' : 'text-success'}`}
                        onClick={() => handleToggleStatus(user._id, user.status !== 'active')}
                      >
                        <FontAwesomeIcon icon={user.status === 'active' ? faToggleOff : faToggleOn} className="me-2" />
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </li>
                  )}
                  {currentUser.role === 'admin' && user.role === 'doctor' && (
                    <>
                      <li>
                        <button className="dropdown-item action-link action-btn view" onClick={() => openLinkModal(user._id)}>
                          🔗 Link Patients
                        </button>
                      </li>
                      <li>
                        <button className="dropdown-item action-link action-btn view" onClick={() => {
                          setViewLinkedDoctor(user);
                          setShowLinkedModal(true);
                        }}>
                          👁 View Linked Patients
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <CreateUserModal
        show={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchUsers} // ✅ Refresh after creation
      />

      <ConfirmModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this user?"
      />

      <UserViewModal
        show={!!viewUser}
        user={viewUser}
        setViewUser={setViewUser}
        getUserById={getUserById}
        fetchUsers={fetchUsers} // ✅ Refresh after MFA toggle
        onClose={() => setViewUser(null)}
      />

      <UserEditModal
        show={!!editUser}
        user={editUser}
        onClose={() => setEditUser(null)}
        onUpdated={fetchUsers} // ✅ Refresh after edit
      />

      <AuditTrailModal
        userId={selectedUserId}
        show={showAuditModal}
        onClose={handleCloseAuditModal}
      />

      <LinkPatientsModal
        userId={selectedUserId}
        show={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onLinked={fetchUsers} // ✅ Refresh after linking
      />

      <LinkedPatientsViewModal
        show={showLinkedModal}
        onClose={() => setShowLinkedModal(false)}
        doctor={viewLinkedDoctor}
      />

    </>
  );
}