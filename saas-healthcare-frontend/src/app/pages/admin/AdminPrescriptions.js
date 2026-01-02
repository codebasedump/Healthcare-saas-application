import React, { useEffect, useState, useCallback } from 'react';
import Select from 'react-select';
import DashboardLayout from '../../components/common/DashboardLayout';
import {
  searchPrescriptions,
  updatePrescription,
  exportPrescriptions,
  deletePrescription
} from '../../../services/prescriptionService';
import {
  getPatients,
  getDoctors
} from '../../../services/doctorService';
import { toast } from 'react-toastify';
import './AdminPrescriptions.css';
import '../../pages/pages-common.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faDownload,
  faCircleCheck,
  faCircleXmark
} from '@fortawesome/free-solid-svg-icons';

export default function AdminPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [selected, setSelected] = useState(null);
 
  const pageSize = 5;
  const totalPages = Math.ceil(total / pageSize);

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await searchPrescriptions({
        query: search,
        page,
        limit: pageSize,
        startDate,
        endDate,
        doctorIds: selectedDoctors.map(d => d.value),
        patientIds: selectedPatients.map(p => p.value)
      });

      console.log('✅ Prescriptions from API:', data.prescriptions);
      setPrescriptions(data.prescriptions || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('❌ Failed to load prescriptions:', err);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  }, [search, page, startDate, endDate, selectedDoctors, selectedPatients]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await exportPrescriptions({
        query: search,
        startDate,
        endDate,
        doctorIds: selectedDoctors.map(d => d.value),
        patientIds: selectedPatients.map(p => p.value)
      });

      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'prescriptions.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Export successful');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorList = await getDoctors();
        if (!Array.isArray(doctorList)) {
          toast.error('Doctor list format is invalid');
          setDoctors([]);
          return;
        }

        const options = doctorList.map((doc) => ({
          value: String(doc._id),
          label: `${doc.name} (${doc.specialty || doc.department || '—'})`,
        }));

        setDoctors(options);
      } catch (err) {
        toast.error('Failed to load doctors');
        setDoctors([]);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getPatients();
        const options = data.map((p) => ({
          value: p._id,
          label: p.name,
        }));
        setPatients(options);
      } catch (err) {
        toast.error('Failed to load patients');
      }
    };
    fetchPatients();
  }, []);

  const handleEdit = (prescription) => {
    setSelected(prescription);
  };

  const handleDelete = async (id) => {
    try {
      await deletePrescription(id);
      toast.success('Prescription deleted');
      fetchPrescriptions();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleSave = async () => {
    try {
      const { _id, status, notes } = selected;
      const payload = {};
      if (status !== undefined) payload.status = status;
      if (notes !== undefined) payload.notes = notes;

      const updated = await updatePrescription(_id, payload);
      setPrescriptions((prev) =>
        prev.map((p) => (p._id === _id ? updated : p))
      );
      setSelected(null);
      toast.success('✅ Changes saved successfully');
    } catch (err) {
      toast.error('❌ Failed to update prescription');
    }
  };

  return (
    <DashboardLayout>
      <h2 className="page-title">🧾 All Prescriptions</h2>

      <div className="filters mt-5">
        <input
          type="text"
          placeholder="Search prescriptions"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="filter-input"
        />

        <Select
          options={doctors}
          isMulti
          isSearchable
          placeholder="Select doctors..."
          value={selectedDoctors}
          onChange={(selected) => {
            setSelectedDoctors(selected);
            setPage(1);
          }}
          className="multi-select"
        />

        <Select
          options={patients}
          isMulti
          isSearchable
          placeholder="Select patients..."
          value={selectedPatients}
          onChange={(selected) => {
            setSelectedPatients(selected);
            setPage(1);
          }}
          className="multi-select"
          classNamePrefix="react-select"
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setPage(1);
          }}
          className="filter-input"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setPage(1);
          }}
          className="filter-input"
        />

        <button onClick={handleExport} className="export-button" disabled={isExporting}>
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {loading ? (
        <p>Loading prescriptions...</p>
      ) : prescriptions.length === 0 ? (
        <p className="empty-message">No prescriptions found.</p>
      ) : (
        <>
          <table className="user-table mt-5">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Patient</th>
              <th>Appointment</th>
              <th>Medications</th>
              <th>Notes</th>
              <th>Status</th>
              <th>PDF</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((p) => (
              <tr key={p._id} className="hover-row">
                <td>
                  {p.doctor?.name
                    ? `${p.doctor.name} (${p.doctor.specialty || '—'})`
                    : '--'}
                </td>

                <td>{p.patient?.name || p.patientId?.name || '—'}</td>

                <td>
                  {p.appointment?.date
                    ? new Date(p.appointment.date).toLocaleDateString()
                    : '—'}
                </td>

                <td>
                  {Array.isArray(p.medications) && p.medications.length > 0 ? (
                    p.medications.map((m, i) => (
                      <div key={i}>
                        {m.name} – {m.dosage} – {m.frequency}
                      </div>
                    ))
                  ) : p.prescription ? (
                    <div>
                      {p.prescription.medication} – {p.prescription.dosage} – {p.prescription.frequency}
                    </div>
                  ) : (
                    '—'
                  )}
                </td>

                <td>{p.notes || p.prescription?.notes || '—'}</td>

                <td>
                  <span className={`status-pill ${p.status}`}>
                    <FontAwesomeIcon
                      icon={p.status === 'active' ? faCircleCheck : faCircleXmark}
                      className="me-1"
                    />
                    {p.status === 'active'
                      ? 'Active'
                      : p.status === 'cancelled'
                      ? 'Cancelled'
                      : 'Expired'}
                  </span>
                </td>

                <td>
                  {p.pdfUrl ? (
                    <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <FontAwesomeIcon icon={faDownload} className="me-1" /> Download
                    </a>
                  ) : (
                    '—'
                  )}
                </td>

                <td style={{ textAlign: 'center' }}>
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
                        <button
                          className="dropdown-item action-link action-btn edit"
                          onClick={() => handleEdit(p)}
                        >
                          <FontAwesomeIcon icon={faEdit} className="me-1" /> Edit
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item action-link action-btn delete"
                          onClick={() => handleDelete(p._id)}
                        >
                          <FontAwesomeIcon icon={faTrash} className="me-1" /> Delete
                        </button>
                      </li>
                    
                    </ul>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>

          <div className="pagination-container mt-5">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="page-nav"
            >
              ◀ Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="page-nav"
            >
              Next ▶
            </button>
          </div>

        </>
      )}

       {selected && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Prescription</h3>

            <label>Status:</label>
            <select
              value={selected.status}
              onChange={(e) =>
                setSelected({ ...selected, status: e.target.value })
              }
            >
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>

            <label>Notes:</label>
            <textarea
              value={selected.notes || selected.prescription?.notes || ''}
              onChange={(e) =>
                setSelected({ ...selected, notes: e.target.value })
              }
            />

            <div className="modal-actions">
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setSelected(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}