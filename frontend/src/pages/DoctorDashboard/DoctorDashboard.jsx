import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Link } from 'react-router-dom';
import NewsFeed from '../../components/specific/NewsFeed';
import '../Dashboard.css'; // Import the shared CSS

const DoctorDashboard = () => {
  const { currentUser, prescriptions, patients } = useAppContext();

  const doctorPrescriptions = prescriptions.filter(p => p.doctorId === currentUser.id);
  const recentPrescriptions = doctorPrescriptions.slice(-3).reverse(); // Last 3

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {currentUser?.name}</h1>
        <p>This is your command center for managing patient care.</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card grid-col-span-3">
          <div className="stat-card-container">
            <div className="stat-card">
              <div className="stat-number">{doctorPrescriptions.length}</div>
              <div className="stat-label">Total Prescriptions</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{new Set(doctorPrescriptions.map(p => p.patientId)).size}</div>
              <div className="stat-label">Patients Treated</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{doctorPrescriptions.filter(p => new Date(p.date).toDateString() === new Date().toDateString()).length}</div>
              <div className="stat-label">Prescriptions Today</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <Link to="/doctor-dashboard/create">Create New Prescription</Link>
            <Link to="/doctor-dashboard/history">View Patient History</Link>
          </div>
        </div>
        
        <div className="dashboard-card grid-col-span-2">
          <h3>Recent Prescriptions</h3>
          <ul className="data-list">
            {recentPrescriptions.length > 0 ? recentPrescriptions.map(p => (
              <li key={p.id} className="data-list-item">
                <span className="item-title">{patients.find(pat => pat.id === p.patientId)?.name || 'Unknown Patient'}</span>
                <span className="item-meta">Diagnosis: {p.diagnosis} | Date: {p.date}</span>
              </li>
            )) : <li>No recent prescriptions.</li>}
          </ul>
        </div>
        
        <div className="dashboard-card">
          <h3>How to Use</h3>
          <ul className="data-list">
            <li className="data-list-item">Use 'Create Prescription' to issue a new secure prescription.</li>
            <li className="data-list-item">Use 'Patient History' to review all past prescriptions for a specific patient.</li>
            <li className="data-list-item">Check 'Analytics' for insights into your prescribing patterns.</li>
          </ul>
        </div>

        <div className="dashboard-card grid-col-span-2">
          <h3>Latest Medical News</h3>
          <NewsFeed />
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;