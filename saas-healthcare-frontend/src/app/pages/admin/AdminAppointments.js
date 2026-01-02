import React, { useEffect, useState,useMemo } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import FilterBar from '../../components/appointments/FilterBar';
import AppointmentActions from '../../components/appointments/AppointmentActions';
import RescheduleModal from '../../components/appointments/RescheduleModal';
import ReassignModal from '../../components/appointments/ReassignModal';
import BookingModal from '../../components/booking/BookingModal';
import FullCal from '../../components/common/FullCal';
import { getAppointments, cancelAppointment, getUnlinkedPatients, linkPatientsToDoctor, reassignPatientToDoctor, fetchAppointments, updateAppointment,
  markAsAttended} from '../../../services/appointmentService';
import { getDoctors } from '../../../services/userService';
import { getPatients, getLinkedPatientsForDoctor } from '../../../services/patientService';
import useDelayFetch from '../../../hooks/useDelayFetch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash, faChartBar} from '@fortawesome/free-solid-svg-icons';

import { toast } from 'react-toastify';
import io from 'socket.io-client';
import '../../pages/pages-common.css';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [tableLoading, setTableLoading] = useState(true);
  const [viewMode, setViewMode] = useState('group');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [patientOptions, setPatientOptions] = useState([]);
  const [showPastAppointments, setShowPastAppointments] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  const pageSize = 10;
  const calendarHeight = window.innerWidth < 768 ? 'auto' : '700px';
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

    const generateColorFromId = (id) => {
      const hash = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const hue = hash % 360;
      return `hsl(${hue}, 70%, 50%)`; // Vibrant, readable color
    };

    const doctorColorMap = useMemo(() => {
      const map = {};
      doctorOptions.forEach(doc => {
        map[doc._id] = generateColorFromId(doc._id);
      });
      return map;
    }, [doctorOptions]);

  const openBookingModal = (slotInfo = {}) => {
    const newAppt = {
      date: slotInfo.dateStr || new Date().toISOString().split('T')[0],
      doctorId: slotInfo.doctorId || null,
      patientId: null,
    };
    setSelectedAppointment(newAppt);
    setActiveModal('booking');
  };

  const openReassignModal = (appt) => {
    const patient = appt.patient || appt.patientId;

    if (!patient || !patient.name) {
      toast.error('⚠️ Patient data missing');
      return;
    }

    setSelectedAppointment(appt);
    setSelectedPatient(patient);
    setSelectedDoctor(null);
    setShowReassignModal(true);
    setActiveModal('reassign');
  };

  const openRescheduleModal = (appt) => {
    setShowReassignModal(false);
    setSelectedAppointment(appt);
    setActiveModal('reschedule');
  };

  const handleMarkAsAttended = async (id) => {
    try {
      await markAsAttended(id);
      toast.success('Marked as attended');
      fetchAppointments(); // refresh list
    } catch (err) {
      console.error('Attendance marking failed:', err);
      toast.error('Failed to mark attendance');
    }
  };

  const getCurrentDoctorForPatient = (patient) => {
    if (!patient || !patient._id) return null;
    const appt = appointments.find(
      a => a.patientId?._id === patient._id && a.status !== 'cancelled'
    );
    if (!appt?.doctorId) return null;
    const doctorId = typeof appt.doctorId === 'object' ? appt.doctorId._id : appt.doctorId;
    const doctor = doctorOptions.find(d => d._id === doctorId);
    return doctor || null;
  };

  useEffect(() => {
    async function loadPatients() {
      const patients = await getPatients();
      setPatientOptions(patients);
    }
    loadPatients();
  }, []);

  useEffect(() => {
    if (showReassignModal && selectedPatient && doctorOptions.length > 0) {
      const doc = getCurrentDoctorForPatient(selectedPatient);
      setCurrentDoctor(doc);
    }
  }, [showReassignModal, selectedPatient, doctorOptions]);

  const parseTimeSlot = (dateStr, timeSlotStr) => {
    const date = new Date(dateStr);
    const cleaned = timeSlotStr.replace(/\s/g, '').toUpperCase(); // "10.30AM" → "10.30AM"
    const [time, meridian] = cleaned.split(/(AM|PM)/);
    const [hours, minutes] = time.includes('.') ? time.split('.') : time.split(':');

    let h = parseInt(hours, 10);
    const m = parseInt(minutes || '0', 10);

    if (meridian === 'PM' && h < 12) h += 12;
    if (meridian === 'AM' && h === 12) h = 0;

    date.setHours(h);
    date.setMinutes(m);
    return date;
  };


  const evaluateAppointmentStatus = (appointment) => {
    if (!appointment?.date || !appointment?.timeSlot) return appointment.status;

    if (appointment.cancellation) return 'Cancelled';

    const now = new Date();
    const apptDateTime = parseTimeSlot(appointment.date, appointment.timeSlot);

    if (apptDateTime < now) {
      if (appointment.attended) return 'Completed'; // ✅ attended flag
      return 'Expired'; // ❌ missed without cancellation
    }

    return 'Scheduled';
  };

  const loadAppointments = async () => {
    try {
      const params = {};

      if (startDate && !isNaN(Date.parse(startDate))) {
        params.startDate = new Date(startDate).toISOString();
      }
      if (endDate && !isNaN(Date.parse(endDate))) {
        params.endDate = new Date(endDate).toISOString();
      }
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const res = await fetchAppointments(params);

      if (res && res.data) {
        const enriched = res.data.map(appt => ({
          ...appt,
          status: evaluateAppointmentStatus(appt)
        }));

        setAppointments(enriched);
      } else {
        console.warn('⚠️ Unexpected response from fetchAppointments:', res);
        setAppointments([]); // fallback to empty list
      }
    } catch (error) {
      console.error('❌ Failed to fetch appointments:', error);
      setAppointments([]); // ensure UI doesn't break
    }
  };
  


const fetchData = async () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const tenantId = currentUser?.tenantId;
  if (!tenantId) {
    toast.error('Tenant ID missing. Please log in again.');
    return;
  }

  try {
    const [apptRes, doctorRes] = await Promise.all([
      getAppointments(),
      getDoctors()
    ]);

    const appointmentsRaw = Array.isArray(apptRes.data) ? apptRes.data : [];
    const doctorsOnly = doctorRes.data?.filter(user => user.role === 'doctor') || [];

    const enrichedAppointments = appointmentsRaw.map((appt) => ({
      ...appt,
      patient: appt.patientId,
      status: evaluateAppointmentStatus(appt)
    }));

    const filtered = enrichedAppointments.filter(
      (a) => a.tenantId?.toString() === tenantId
    );

    setAppointments(filtered);
    setDoctorOptions(doctorsOnly);
  } catch (err) {
    console.error('❌ Error loading data:', err);
    toast.error('Failed to load appointments or doctors.');
  }
};


  useEffect(() => {
    fetchData();
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    const tenantId = currentUser?.tenantId;

    const socket = io(process.env.REACT_APP_SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 3,
    });

    socket.emit('subscribeAdmin', tenantId);

    socket.on('newAppointment', (appt) => {
      if (appt.tenantId?.toString() === tenantId) {
        toast.info(`📅 New appointment for ${appt.patientId?.name || 'Unknown'}`);
        setAppointments((prev) => [appt, ...prev]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [startDate, endDate, statusFilter]);

  const handleReassign = async () => {
    try {
      await reassignPatientToDoctor({
        patientId: selectedPatient._id,
        fromDoctorId: selectedAppointment.doctorId._id || selectedAppointment.doctorId,
        toDoctorId: selectedDoctor._id
      });
      toast.success(`${selectedPatient.name} reassigned to ${selectedDoctor.name}`);
      setShowReassignModal(false);
      setSelectedAppointment(null);
      setSelectedPatient(null);
      setSelectedDoctor(null);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reassignment failed');
    }
  };

  const handleLinkMissingPatients = async (doctorId) => {
    try {
      const res = await getUnlinkedPatients();
      const patientIds = res.data.patients.map(p => p._id);
      if (patientIds.length === 0) {
        toast.info('✅ All patients already linked');
        return;
      }
      await linkPatientsToDoctor(doctorId, patientIds);
      toast.success(`🔗 Linked ${patientIds.length} patients to doctor`);
    } catch (err) {
      console.error('Linking failed:', err);
      toast.error('❌ Failed to link patients');
    }
  };

  useEffect(() => {
    async function loadLinkedPatients() {
      if (!selectedAppointment?.doctorId) return;

      try {
        const res = await getLinkedPatientsForDoctor(selectedAppointment.doctorId);
        setPatientOptions(res.data.patients || []);
      } catch (err) {
        console.error('❌ Failed to load linked patients:', err);
        setPatientOptions([]);
      }
    }

    if (activeModal === 'booking') {
      loadLinkedPatients();
    }
  }, [selectedAppointment?.doctorId, activeModal]);


  const isLinked = (appt) => {
    const linkedIds = (appt.doctorId?.linkedPatients || []).map(id => id.toString());
    const patientId = appt.patientId?._id?.toString();
    return linkedIds.includes(patientId);
  };

  const filteredAppointments = appointments.filter((a) => {
    const matchSearch = `${a.doctorId?.name || ''} ${a.patientId?.name || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter ? a.status === statusFilter : true;
    const matchDate =
      (!startDate || new Date(a.date) >= new Date(startDate)) &&
      (!endDate || new Date(a.date) <= new Date(endDate));
    return matchSearch && matchStatus && matchDate;
  });

  const today = new Date();

  const upcomingAppointments = filteredAppointments.filter(a => {
    const apptDateTime = parseTimeSlot(a.date, a.timeSlot);
    return apptDateTime >= today;
  });

  const visibleAppointments = showPastAppointments ? filteredAppointments : upcomingAppointments;

  const groupedByDoctor = doctorOptions.map((doctor) => {
    const doctorAppointments = visibleAppointments.filter((appt) => {
      const apptDoctorId = typeof appt.doctorId === 'object' ? appt.doctorId._id : appt.doctorId;
      return apptDoctorId === doctor._id;
    });
    return { doctor, appointments: doctorAppointments };
  });

  const handleExportCSV = () => {
    const headers = ['Doctor', 'Patient', 'Date', 'Time', 'Status', 'Mode', 'Notes', 'Linked'];
    const rows = filteredAppointments.map(a => [
      a.doctorId?.name || '—',
      a.patientId?.name || '—',
      new Date(a.date).toLocaleDateString(),
      a.timeSlot,
      a.status,
      a.mode,
      a.notes || '',
            isLinked(a) ? 'Yes' : 'No'
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'appointments.csv';
    link.click();
  };

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      toast.success('Appointment cancelled');
      setAppointments((prev) =>
        prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a)
      );
    } catch (err) {
      console.error('Cancel failed:', err);
      toast.error('Failed to cancel appointment');
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await getAppointments(); 
      setAppointments(res.data || []);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      toast.error('Unable to load appointments');
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

 const loading = useDelayFetch(fetchAppointments, 3000); // 10 sec delay

return (
  <DashboardLayout>
    <div className="page-header">
      <h2 className="page-title">📅 Appointments</h2>
    </div>

    <FilterBar
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      startDate={startDate}
      setStartDate={setStartDate}
      endDate={endDate}
      setEndDate={setEndDate}
      handleExportCSV={handleExportCSV}
    />

    

    <div className="d-flex justify-content-between align-items-center mb-3">
      
      <div className="form-check mb-3">
      <input
        className="form-check-input"
        type="checkbox"
        checked={showPastAppointments}
        onChange={() => setShowPastAppointments(prev => !prev)}
        id="togglePastAppointments"
      />
      <label className="form-check-label" htmlFor="togglePastAppointments">
        Show past appointments
      </label>
    </div>
    
      <button className="action-btn view mt-4" onClick={() => openBookingModal()}>
        + Book New Appointment
      </button>
    </div>

    <div className="tabs-container mb-4">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${viewMode === 'group' ? 'active' : ''}`}
            onClick={() => setViewMode('group')}
          >
            👨‍⚕️ Doctor Group View
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            🗓 Calendar View
          </button>
        </li>
      </ul>
    </div>

    {loading ? (
        <div className="table-loader">
          <div className="spinner" />
          <p>Loading appointments…</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
          <p className="empty-message">No appointments found for selected filters.</p>
        ) : viewMode === 'group' ? (
        groupedByDoctor.map(({ doctor, appointments }) => (
          <div key={doctor._id} className="doctor-group mt-5">
            <h3 className="doctor-name">
              👨‍⚕️ {doctor.name} — {appointments.length} appointment{appointments.length > 1 ? 's' : ''}
            </h3>

            {appointments.length === 0 ? (
              <p className="text-muted">No appointments</p>
            ) : (

              <div className="appointment-grid mt-4">
                <div className="appointment-header">
                  <div>Avatar</div>
                  <div>Patient</div>
                  <div>Date</div>
                  <div>Time</div>
                  <div>Status</div>
                  <div>Mode</div>
                  <div>Notes</div>
                  <div>Linked</div>
                  <div>Actions</div>
                </div>

                {appointments.map((appt) => (
                  <div key={appt._id} className={`appointment-row hover-row ${!appt.patientId || !isLinked(appt) ? 'unlinked-row' : ''}`}>
                    <div>
                      <div className={`avatar ${appt.patientId?.role || 'default'}`}>
                        {appt.patientId?.name?.charAt(0).toUpperCase() || '—'}
                      </div>
                    </div>

                    <div>
                      {!appt.patientId ? (
                        <span className="warning-text">⚠️ Missing Patient</span>
                      ) : !isLinked(appt) ? (
                        <span className="warning-text">⚠️ Not Linked</span>
                      ) : (
                        appt.patientId.name
                      )}
                    </div>

                    <div>{new Date(appt.date).toLocaleDateString()}</div>
                    <div>{appt.timeSlot}</div>
                    <div>
                      {/* <span className={`badge bg-${appt.status?.toLowerCase() === 'scheduled' ? 'success' : 'secondary'}`}>
                        {appt.status}
                      </span> */}
                      <span className={`badge bg-${appt.status?.toLowerCase() === 'scheduled' ? 'success' :
                              appt.status === 'Completed' ? 'primary' :
                              appt.status === 'Expired' ? 'warning' :
                              'secondary'}`}>
                           {appt.status}
                      </span>
                    </div>
                    <div>{appt.mode}</div>
                    <div>{appt.notes || '—'}</div>
                    <div>{isLinked(appt) ? '✅' : '⚠️'}</div>

                    <div style={{ textAlign: 'center' }}>
                      <div className="dropdown">
                        <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                          Actions
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button className="dropdown-item action-link action-btn edit" onClick={() => openRescheduleModal(appt)}>
                              <FontAwesomeIcon icon={faEdit} className="me-1" /> Reschedule
                            </button>
                          </li>
                          <li>
                            <button className="dropdown-item action-link action-btn btn-audit" onClick={() => openReassignModal(appt)}>
                              <FontAwesomeIcon icon={faChartBar} className="me-1" /> Reassign
                            </button>
                          </li>
                          {appt.status === 'scheduled' && !appt.attended && (
                          <li>
                              <button
                                className="dropdown-item action-link action-btn delete"
                                onClick={() => handleMarkAsAttended(appt._id)}
                              >
                                ✅ Mark as Attended
                              </button>
                            </li>
                          )}
                          <li>
                            <button
                                className="dropdown-item"
                                onClick={() => {
                                  setAppointmentToCancel(appt);
                                  setShowCancelModal(true);
                                }}
                              >
                                ❌ Cancel
                              </button>
                          </li>
                          {!isLinked(appt) && (
                            <li>
                              <button className="dropdown-item" onClick={() => handleLinkMissingPatients(appt)}>
                                🔗 Link Patient
                              </button>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              )}

            </div>
          ))
        
      ) : (
        <div className="calendar-wrapper mt-4">

        <FullCal
          appointments={appointments}
          calendarHeight="auto"
          setSelectedAppointment={setSelectedAppointment}
          setActiveModal={setActiveModal}
          doctorColorMap={doctorColorMap}
        />
      </div>
      )}

    {activeModal === 'reschedule' && selectedAppointment && (
      <RescheduleModal
        appointment={selectedAppointment}
        onClose={() => {
          setSelectedAppointment(null);
          setActiveModal(null);
        }}
        isLinked={isLinked}
        onConfirm={async (updatedAppt) => {
          try {
            await updateAppointment(updatedAppt);
            toast.success('Appointment rescheduled!');
            setAppointments(prev =>
              prev.map(a => a._id === updatedAppt._id ? updatedAppt : a)
            );
            setSelectedAppointment(null);
            setActiveModal(null);
          } catch (err) {
            console.error('Reschedule failed:', err);
            toast.error(err.response?.data?.error || 'Failed to reschedule');
          }
        }}
        onCancel={handleCancel}
      />
    )}

    {activeModal === 'reassign' && selectedPatient && (
      <ReassignModal
        show={true}
        selectedPatient={selectedPatient}
        selectedDoctor={selectedDoctor}
        setSelectedDoctor={setSelectedDoctor}
        doctorOptions={doctorOptions}
        onConfirm={handleReassign}
        onClose={() => {
          setSelectedPatient(null);
          setSelectedDoctor(null);
          setSelectedAppointment(null);
          setActiveModal(null);
        }}
        currentDoctor={getCurrentDoctorForPatient(selectedPatient)}
      />
    )}

    {activeModal === 'booking' && selectedAppointment && (
      <BookingModal
        appointment={selectedAppointment}
        patientOptions={patientOptions}
        doctorOptions={doctorOptions}
        currentUser={currentUser}
        appointments={appointments}
        onClose={() => {
          setSelectedAppointment(null);
          setActiveModal(null);
        }}
        onBooked={() => {
          toast.success('Appointment booked!');
          fetchAppointments(); // ✅ refresh from backend
          setSelectedAppointment(null);
          setActiveModal(null);
        }}

      />
    )}
    
    {showCancelModal && appointmentToCancel && (
        <div className="modal-backdrop modalbox">
          <div className="modal-box">
            <h2 className="modal-title">❌ Cancel Appointment</h2>
            <p className="mt-4">
              Are you sure you want to cancel the appointment with{' '}
              <strong>{appointmentToCancel.patientId?.name || 'Unknown Patient'}</strong> on{' '}
              <strong>{new Date(appointmentToCancel.date).toLocaleDateString()}</strong> at{' '}
              <strong>{appointmentToCancel.timeSlot}</strong>?
            </p>

            <div className="modal-actions mt-5">
              <button
                className="btn btn-danger"
                onClick={async () => {
                  await handleCancel(appointmentToCancel._id);
                  setShowCancelModal(false);
                  setAppointmentToCancel(null);
                }}
              >
                Yes, Cancel
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowCancelModal(false);
                  setAppointmentToCancel(null);
                }}
              >
                No, Keep Appointment
              </button>
            </div>
          </div>
        </div>
      )}

  </DashboardLayout>
);
}