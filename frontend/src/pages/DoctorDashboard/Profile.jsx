import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import './ProfilePage.css'; // Using the shared CSS

const DoctorProfile = () => {
  const { currentUser } = useAppContext();

  return (
    <div className="profile-container">
      <h2>Doctor Profile</h2>
      <div className="profile-card">
        <ul className="profile-details">
          <li>
            <span className="detail-label">Name</span>
            <span className="detail-value">{currentUser?.name}</span>
          </li>
          <li>
            <span className="detail-label">Username</span>
            <span className="detail-value">{currentUser?.username}</span>
          </li>
          <li>
            <span className="detail-label">Role</span>
            <span className="detail-value">{currentUser?.role}</span>
          </li>
          <li>
            <span className="detail-label">Hospital</span>
            <span className="detail-value">{currentUser?.hospital}</span>
          </li>
          <li>
            <span className="detail-label">Specialization</span>
            <span className="detail-value">{currentUser?.specialization}</span>
          </li>
          <li>
            <span className="detail-label">Medical Council Reg. No.</span>
            <span className="detail-value">{currentUser?.medicalRegNo}</span>
          </li>
        </ul>
        <div className="profile-actions">
          <button className="edit-button">Edit Profile</button>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;