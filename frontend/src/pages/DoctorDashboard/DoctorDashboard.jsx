import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useNavigate } from 'react-router-dom';
import NewsFeed from '../../components/specific/NewsFeed';
import './DoctorDashboard.css';
import { 
  FaUserInjured, FaPrescriptionBottleAlt, FaChartLine, 
  FaPlus, FaHistory 
} from 'react-icons/fa';

const DoctorDashboard = () => {
  const { currentUser, prescriptions = [] } = useAppContext();
  const navigate = useNavigate();

  // --- FILTERING LOGIC ---
  const myPrescriptions = prescriptions.filter(p => 
    String(p.doctorId) === String(currentUser.id || currentUser._id)
  );

  // Sort by Date (Newest First) and take top 3
  const recentRx = [...myPrescriptions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  const totalPatients = new Set(myPrescriptions.map(p => p.patientId)).size;
  const totalPrescriptions = myPrescriptions.length;

  return (
    <div className="doctor-dashboard-page">
      
      {/* --- Header Section (Unchanged) --- */}
      <div className="dashboard-top-row">
        <div className="dashboard-header">
          <div className="header-icon">
            <FaUserInjured />
          </div>
          <div className="header-text">
            <h1>Welcome, Dr. {currentUser?.name}</h1>
            <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • Command Center</p>
          </div>
        </div>

        <div className="quick-actions-bar">
          <button onClick={() => navigate('/doctor-dashboard/create')} className="action-btn primary">
            <FaPlus /> Create Prescription
          </button>
          <button onClick={() => navigate('/doctor-dashboard/history')} className="action-btn secondary">
            <FaHistory /> Patient History
          </button>
          <button onClick={() => navigate('/doctor-dashboard/analytics')} className="action-btn secondary">
            <FaChartLine /> Analytics
          </button>
        </div>
      </div>

      {/* --- Stats Grid (Unchanged) --- */}
      <div className="stats-grid">
        <div className="stat-card teal-card">
          <div className="card-content">
            <h3>{totalPatients}</h3>
            <p>Total Patients</p>
          </div>
          <div className="card-icon"><FaUserInjured /></div>
        </div>

        <div className="stat-card blue-card">
          <div className="card-content">
            <h3>{totalPrescriptions}</h3>
            <p>Prescriptions Issued</p>
          </div>
          <div className="card-icon"><FaPrescriptionBottleAlt /></div>
        </div>

        <div className="stat-card purple-card">
          <div className="card-content">
            <h3>98%</h3>
            <p>Satisfaction Rate</p>
          </div>
          <div className="card-icon"><FaChartLine /></div>
        </div>
      </div>

      {/* --- Main Content Split --- */}
      <div className="dashboard-content" >
        
        {/* Left Column: Recent Activity */}
        {/* ADDED CLASS: recent-rx-panel */}
        <div className="section-panel recent-rx-panel">
          <div className="panel-header">
            <h2>Recent Prescriptions</h2>
            <button className="link-text" onClick={() => navigate('/doctor-dashboard/history')}>View All</button>
          </div>

          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Diagnosis</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRx.length > 0 ? (
                  recentRx.map((rx, index) => (
                    <tr key={rx.id || index}>
                      <td><strong>{rx.patientName || "Unknown Patient"}</strong></td>
                      <td>{rx.diagnosis}</td>
                      <td>{rx.date}</td>
                      <td><span className="badge success">Issued</span></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>
                      No recent prescriptions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick Tips & News */}
        <div className="side-panel">
          <div className="panel-card" width="100px">
            <h3><FaHistory style={{marginRight:'8px'}}/> Quick Tips</h3>
            <ul className="info-list">
              <li>Use '<strong>Create Prescription</strong>' to issue a new secure record.</li>
              <li>Check '<strong>Patient History</strong>' to review past treatments.</li>
              <li>Review '<strong>Analytics</strong>' for prescribing insights.</li>
            </ul>
          </div>

          {/* ADDED CLASS: news-panel */}
          
        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;