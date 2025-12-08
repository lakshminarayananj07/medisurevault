import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Link } from 'react-router-dom';
import NewsFeed from '../../components/specific/NewsFeed';
import '../Dashboard.css';

const PharmacistDashboard = () => {
  const { currentUser } = useAppContext();

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {currentUser?.name}</h1>
        <p>Ready to verify new prescriptions.</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card grid-col-span-3">
          <h3>Primary Action</h3>
          <div className="action-buttons">
            <Link to="/pharmacist-dashboard/scan">Start New Verification (Scan QR Code)</Link>
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3>How to Use</h3>
          <ul className="data-list">
            <li className="data-list-item">Click 'Start New Verification' to open the QR scanner.</li>
            <li className="data-list-item">Align the patient's QR code with your camera to scan.</li>
            <li className="data-list-item">Verify the details and dispense the medication.</li>
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

export default PharmacistDashboard;