import DashboardLayout from '../../components/common/DashboardLayout';
import CardMenu from '../../components/common/CardMenu';
import { useEffect, useState } from 'react';
import { getDashboardMetrics, getSpecialties } from '../../../services/dashboardService';
import { fetchMfaUsers } from '../../../services/userService';
import { exportDashboard } from '../../../utils/exportDashboard';

import { motion } from 'framer-motion';
import { FaUsers, FaUserMd, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../pages/pages-common.css';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState([]);
  const [mfaUsers, setMfaUsers] = useState([]);
  const [mfaFilter, setMfaFilter] = useState('');
  const [limit, setLimit] = useState(4);
  const [roleFilter, setRoleFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardMetrics({ limit, role: roleFilter }).then(res => {
      setMetrics(res.data);
      setLoading(false);
    });
    getSpecialties().then(res => {
      setSpecialties(res.data.specialties || []);
    });
  }, [limit, roleFilter]);

  const handleSpecialtyChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const statCards = [
    { label: 'Total Users', value: metrics.totalUsers, icon: <FaUsers />, bg: 'primary' },
    { label: 'Total Doctors', value: metrics.totalDoctors, icon: <FaUserMd />, bg: 'success' },
    { label: 'Appointments', value: metrics.totalAppointments, icon: <FaCalendarAlt />, bg: 'info' },
    { label: 'MFA Enabled', value: metrics.mfaEnabled, icon: <FaShieldAlt />, bg: 'warning' },
  ];

  const pieData = {
    labels: ['Admins', 'Doctors', 'Receptionists', 'Patients'],
    datasets: [
      {
        data: metrics.roleDistribution || [1, 1, 1, 1],
        backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545'],
      },
    ],
  };

  const lineData = {
    labels: metrics.appointmentStats?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Appointments',
        data: metrics.appointmentStats?.map(item => item.count) || [],
        borderColor: '#0dcaf0',
        tension: 0.3,
      },
    ],
  };

  return (
    <DashboardLayout>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="container-fluid" id="dashboard-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-dark">🧠 Admin Dashboard</h2>
          <CardMenu actions={[
            { label: 'Export as PDF', onClick: () => exportDashboard('dashboard-content', 'pdf') },
            { label: 'Export as PNG', onClick: () => exportDashboard('dashboard-content', 'png') }
          ]} />
        </div>

        {/* Stat Cards */}
        <div className="row g-3">
          {statCards.map((card, idx) => (
            <div key={idx} className="col-md-6 col-lg-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                className={`card text-white bg-${card.bg} h-100 shadow`}
              >
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title">{card.label}</h5>
                    <h2 className="card-text">{loading ? '...' : card.value}</h2>
                  </div>
                  <div className="fs-2">{card.icon}</div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="row mt-5">
          <div className="col-md-8">
            <div className="card shadow" id="appointments-chart">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span className="fw-semibold">📊 Appointments Over Time</span>
                <CardMenu actions={[
                  { label: 'Export as PDF', onClick: () => exportDashboard('appointments-chart', 'pdf') },
                  { label: 'Export as PNG', onClick: () => exportDashboard('appointments-chart', 'png') }
                ]} />
              </div>
              <div className="card-body">
                <Line data={lineData} />
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow" id="role-distribution-chart">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span className="fw-semibold">🧬 Role Distribution</span>
                <CardMenu actions={[
                  { label: 'Export as PDF', onClick: () => exportDashboard('role-distribution-chart', 'pdf') },
                  { label: 'Export as PNG', onClick: () => exportDashboard('role-distribution-chart', 'png') }
                ]} />
              </div>
              <div className="card-body">
                <Pie data={pieData} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        

        {/* Filter + Tables Side-by-Side */}
        <div className="row mt-5">
          <div className="col-md-6">
            <div className="card shadow-sm mb-4" id="top-doctors-table">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span className="fw-semibold">🩺 Top Doctors</span>
                <CardMenu actions={[
                  { label: 'Export as PDF', onClick: () => exportDashboard('top-doctors-table', 'pdf') }
                ]} />
              </div>
              <div className="card-body p-2">
                <label className="form-label fw-semibold">Filter by Specialty</label>
                <select className="form-select form-select-sm mb-3" onChange={handleSpecialtyChange}>
                  <option value="">All</option>
                  {specialties.map((spec, idx) => (
                    <option key={idx} value={spec}>{spec}</option>
                  ))}
                </select>
                <table className="table table-sm table-hover mb-0">
                  <thead>
                    <tr><th>Name</th><th>Specialty</th><th>Email</th></tr>
                  </thead>
                  <tbody>
                    {(metrics.topDoctors || []).map((doc, idx) => (
                      <tr key={idx}>
                        <td>{doc.name}</td>
                        <td>{doc.specialty}</td>
                        <td>{doc.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm mb-4" id="mfa-users-table">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span className="fw-semibold">🔐 MFA Enabled Users</span>
                <CardMenu actions={[
                    { label: 'Export as PNG', onClick: () => exportDashboard('mfa-users-table', 'png') }
                ]} />
              </div>
              <div className="card-body p-2">
                {/* <label className="form-label fw-semibold">Filter by Role</label>
               <select className="form-select form-select-sm mb-3" onChange={(e) => setMfaFilter(e.target.value)}>
                <option value="">All</option>
                {[...new Set(mfaUsers.map(user => user.role))].map((role, idx) => (
                  <option key={idx} value={role}>{role}</option>
                ))}
              </select> */}

              <table className="table table-sm table-bordered mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {(metrics.mfaUsers || []).slice(0, 4).map((user, idx) => (
                    <tr key={idx}>
                      <td>{user.name}</td>
                      <td>{user.role}</td>
                      <td>{user.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className="col-md-12 mt-4">
            <h4 className="mb-3 fw-semibold">📋 Recent Activity</h4>
            <ul className="list-group">
              {(metrics.recentLogs || []).slice(0, 5).map((log, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span>{log.message}</span>
                  <small className="text-muted">{log.timestamp}</small>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}