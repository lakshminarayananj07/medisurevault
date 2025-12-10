import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import '../DoctorDashboard/ProfilePage.css';

const PatientProfile = () => {
  const { currentUser } = useAppContext();

  return (
    <div className="profile-container">
      <h2>Patient Profile</h2>
      <div className="profile-card">
        <ul className="profile-details">
          
          {/* --- UPDATED: SECRET CODE ITEM (Now a normal item) --- */}
          <li>
            <span className="detail-label">My Secret Code</span>
            <span className="detail-value">
              {currentUser?.patientCode || "Not Set"}
            </span>
          </li>
          {/* --------------------------------------------------- */}

          <li>
            <span className="detail-label">Name</span>
            <span className="detail-value">{currentUser?.name}</span>
          </li>
          <li>
            <span className="detail-label">Username</span>
            <span className="detail-value">{currentUser?.username}</span>
          </li>
          <li>
            <span className="detail-label">Email</span>
            <span className="detail-value">{currentUser?.email}</span>
          </li>
          <li>
            <span className="detail-label">Mobile Number</span>
            <span className="detail-value">{currentUser?.mobile}</span>
          </li>
          <li>
            <span className="detail-label">Date of Birth</span>
            <span className="detail-value">{currentUser?.dob}</span>
          </li>
          <li>
            <span className="detail-label">Blood Group</span>
            <span className="detail-value">{currentUser?.bloodGroup}</span>
          </li>
          <li>
            <span className="detail-label">Aadhaar Number</span>
            <span className="detail-value">{currentUser?.aadhaar}</span>
          </li>
        </ul>
        <div className="profile-actions">
          <button className="edit-button">Edit Profile</button>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;