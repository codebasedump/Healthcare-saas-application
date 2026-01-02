import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import {
  getPaginatedDoctors,
  updateDoctorStatus,
  updateDoctorProfile,
  resetDoctorMFA,
  getDoctorLogs,
  getDoctorStats,
  toggleDoctorMFA
} from '../../../services/doctorService';
import AdminConfirmModal from '../../components/common/AdminConfirmModal';
import { getSpecialties } from '../../../services/dashboardService';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash, faChartBar} from '@fortawesome/free-solid-svg-icons';
import './AdminDoctors.css';

function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specialties, setSpecialties] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [editDoctor, setEditDoctor] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingToggleId, setPendingToggleId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null); // Optional if you want to show name

  useEffect(() => {
    fetchSpecialties();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [page, searchTerm, specialtyFilter, statusFilter]);

  const fetchSpecialties = async () => {
    try {
      const res = await getSpecialties();
      setSpecialties(res.data.specialties || []);
    } catch {
      toast.error('❌ Failed to load specialties');
    }
  };

  const fetchDoctors = async () => {
  try {
    const res = await getPaginatedDoctors({
      page,
      pageSize,
      search: searchTerm,
      specialty: specialtyFilter,
      status: statusFilter
    });

    const doctors = res?.data?.data;
    const total = res?.data?.total;

    if (Array.isArray(doctors) && typeof total === 'number') {
      setDoctors(doctors);
      setTotal(total);

      const uniqueStatuses = Array.from(
        new Set(doctors.map(doc => doc.status).filter(Boolean))
      );
      setAvailableStatuses(uniqueStatuses);
    } else {
      toast.error('❌ Unexpected response format');
      console.warn('Unexpected response:', res);
    }

  } catch (err) {
    toast.error('❌ Error fetching doctors');
    console.error('Fetch error:', err);
  }
};


  const handleStatusToggle = async (id, currentStatus) => {
    try {
      await updateDoctorStatus(id, !currentStatus);
      toast.success(`✅ Doctor ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchDoctors();
    } catch {
      toast.error('❌ Failed to update status.');
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateDoctorProfile(editDoctor._id, editDoctor);
      toast.success('✅ Doctor updated');
      setEditDoctor(null);
      fetchDoctors();
    } catch {
      toast.error('❌ Failed to update doctor.');
    }
  };

  // const handleResetMFA = async (id) => {
  //   try {
  //     const res = await resetDoctorMFA(id);
  //     if (res?.data?.success) {
  //       toast.success('✅ MFA reset successfully');
  //       await fetchDoctors();
  //     } else {
  //       toast.error('⚠️ MFA reset failed: Unexpected response');
  //     }
  //   } catch (err) {
  //     console.error('❌ Error during MFA reset:', err);
  //     toast.error('❌ Failed to reset MFA.');
  //   }
  // };
  
  const handleToggleMFA = async (id) => {
    try {
      const res = await toggleDoctorMFA(id); // Your API call
      if (res?.data?.success) {
        toast.success('✅ MFA toggled');
        await fetchDoctors(); // Refresh list
      } else {
        toast.error('⚠️ Failed to toggle MFA');
      }
    } catch (err) {
      console.error('❌ Error toggling MFA:', err);
      toast.error('❌ Error toggling MFA');
    }
  };

  const handleViewLogs = async (doctorId) => {
    try {
      const res = await getDoctorLogs(doctorId);
      if (res?.data?.success && Array.isArray(res.data.data)) {
        setLogs(res.data.data);
      } else {
        setLogs([]);
        toast.error('❌ No logs found or invalid response.');
      }
      setShowAuditModal(true); // ✅ Only show modal after click
    } catch {
      setLogs([]);
      toast.error('❌ Failed to fetch logs.');
      setShowAuditModal(true); // ✅ Still show modal with fallback
    }
  };

  const handleViewStats = async (id) => {
    try {
      const res = await getDoctorStats(id);
      if (res?.data?.success) {
        setStats(res.data.data);
      } else {
        toast.error('❌ No stats found.');
      }
    } catch {
      toast.error('❌ Failed to fetch stats.');
    }
  };

  return (
    <DashboardLayout>
      <h2>Doctors Management</h2>

      <div className="filter-bar mt-5">
        <div className='filterbar'>
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={e => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
            className="search-input "
          />

          <select
            value={specialtyFilter}
            onChange={e => {
              setPage(1);
              setSpecialtyFilter(e.target.value);
            }}
            className="form-select form-select-sm mb-3"
          >
            <option value="all">All Specialties</option>
            {specialties.map((spec, idx) => (
              <option key={idx} value={spec}>{spec}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="form-select form-select-sm mb-3"
          >
            <option value="all">All Statuses</option>
            {availableStatuses.map((status, i) => (
              <option key={i} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
        </select>
        </div>
      </div>

      {doctors.length > 0 ? (
        <div className="doctor-grid mt-4">
          {/* Header Row */}
          <div className="doctor-header">
            <div>Avatar</div>
            <div>Name</div>
            <div>Email</div>
            <div>Phone</div>
            <div>MFA</div>
            <div>Role</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {/* Data Rows */}
          {doctors.map(doc => (
            <div key={doc._id} className="doctor-row hover-row">
              <div>
                <div className="avatar doctor">
                  {doc.name?.charAt(0).toUpperCase() || 'D'}
                </div>
              </div>
              <div>{doc.name}</div>
              <div>{doc.email}</div>
              <div>{doc.phone || '—'}</div>
              <div>{doc.mfaEnabled ? 'Enabled ✅' : 'Disabled ❌'}</div>
              <div>
                <span className="badge bg-primary">Doctor</span>
              </div>
              <div>
                <span className={`status-pill ${doc.status}`}>
                  {doc.status === 'active' ? 'Active' : 'Suspended'}
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="dropdown">
                  <button
                    className="btn btn-sm btn-outline-secondary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    Actions
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <button className="dropdown-item action-link action-btn edit" onClick={() => setEditDoctor(doc)}>
                        <FontAwesomeIcon icon={faEdit} className="me-1" /> Edit
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item action-link action-btn btn-audit" onClick={() => handleViewLogs(doc._id)}>
                        <FontAwesomeIcon icon={faChartBar} className="me-1" /> View Audit
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item action-link action-btn view" onClick={() => handleViewStats(doc._id)}>
                        <FontAwesomeIcon icon={faEye} className="me-1" /> Stats
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item action-link action-btn btn-status"
                        onClick={() => {
                          setPendingToggleId(doc._id);
                          setSelectedUser(doc); // Optional
                          setShowConfirm(true);
                        }}
                      >
                        🔐 Toggle MFA
                      </button>
                    </li>
                    <li>
                      <button
                        className={`dropdown-item action-link action-btn delete ${doc.isActive ? 'text-danger' : 'text-success'}`}
                        onClick={() => handleStatusToggle(doc._id, doc.isActive)}
                      >
                        <FontAwesomeIcon icon={faTrash} className="me-1" /> {doc.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No doctors found.</p>
      )}

      {/* Pagination */}
      <div className="pagination-container mt-4">
        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="page-nav">
          ◀ Prev
        </button>
        {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => (
          <button
            key={i}
            className={`page-btn ${page === i + 1 ? 'active' : ''}`}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          disabled={page * pageSize >= total}
          onClick={() => setPage(page + 1)}
          className="page-nav"
        >
          Next ▶
        </button>
      </div>

     {/* Edit Modal */}
          {editDoctor && (
            <>
              <div className="modal-backdrop modalbox">
              <div className="modal-box">
                <h2 className="modal-title">Edit Doctor</h2>
                 <form className="form mt-5">
                  
                <div className="form-group">
                  <label htmlFor="doctor-name">Name</label>
                  <input
                    id="doctor-name"
                    type="text"
                    className="form-control"
                    value={editDoctor.name}
                    onChange={e => setEditDoctor({ ...editDoctor, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doctor-email">Email</label>
                  <input
                    id="doctor-email"
                    type="email"
                    className="form-control"
                    value={editDoctor.email}
                    onChange={e => setEditDoctor({ ...editDoctor, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doctor-specialty">Specialty</label>
                  <input
                    id="doctor-specialty"
                    type="text"
                    className="form-control"
                    value={editDoctor.specialty}
                    onChange={e => setEditDoctor({ ...editDoctor, specialty: e.target.value })}
                    placeholder="e.g. Internal Medicine"
                  />
                </div>

                   <div className="modal-actions">
                    <button type="submit" className="btn btn-primary" onClick={handleSaveEdit}>Save</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setEditDoctor(null)}>Cancel</button>
                  </div>
                </form>
              </div>
               </div>
            </>
          )}
    
          {/* Audit Logs Modal */}
         {showAuditModal && (
          <div className="modal-backdrop modalbox">
            <div className="modal-box">
              <h2 className="modal-title">Audit Logs</h2>

              {logs?.length > 0 ? (
                <ul className="audit-log-list mt-4">
                  {logs.map(log => (
                    <li key={log._id} className="audit-log-item mb-3">
                      <strong>{log.action}</strong>
                      <br />
                      <span className="text-muted">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown time'}
                        {log.ipAddress && ` • IP: ${log.ipAddress}`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mt-4">No logs found for this doctor.</p>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowAuditModal(false);
                  setLogs(null);
                }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
          {/* Stats Modal */}
         {stats && (
          <div className="modal-backdrop modalbox">
            <div className="modal-box">
              <h2 className="modal-title">Doctor Stats</h2>

              <div className="form mt-4">
                <div className="form-group">
                  <label>Appointments</label>
                  <div className="form-control readonly">{stats.appointments}</div>
                </div>

                <div className="form-group">
                  <label>Linked Patients</label>
                  <div className="form-control readonly">{stats.linkedPatients}</div>
                </div>

                <div className="form-group">
                  <label>Last Login</label>
                  <div className="form-control readonly">
                    {stats.lastLogin ? new Date(stats.lastLogin).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setStats(null)}>Close</button>
              </div>
            </div>
          </div>
        )}


        <AdminConfirmModal
          show={showConfirm}
          title="⚠️ Confirm MFA Toggle"
          message={`Are you sure you want to ${selectedUser?.mfaEnabled ? 'disable' : 'enable'} MFA for ${selectedUser?.name}? This action will be logged in the audit trail.`}
          onConfirm={async () => {
            await handleToggleMFA(pendingToggleId);
            setShowConfirm(false);
            setPendingToggleId(null);
            setSelectedUser(null);
          }}
          onCancel={() => {
            setShowConfirm(false);
            setPendingToggleId(null);
            setSelectedUser(null);
          }}
          danger={true}
        />


       {/* <AdminConfirmModal
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
        /> */}

        </DashboardLayout>
      );
    }
    
    export default AdminDoctors;