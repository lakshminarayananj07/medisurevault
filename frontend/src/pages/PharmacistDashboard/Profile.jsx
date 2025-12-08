import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import '../DoctorDashboard/ProfilePage.css'; // Reusing the same CSS file

const PharmacistProfile = () => {
  const { currentUser } = useAppContext();

  return (
    <div className="profile-container">
      <h2>Pharmacist Profile</h2>
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
            <span className="detail-label">Pharmacy Name</span>
            <span className="detail-value">{currentUser?.pharmacyName}</span>
          </li>
          {/* --- NEW CODE ADDED BELOW --- */}
          <li>
            <span className="detail-label">Registration No.</span>
            <span className="detail-value">{currentUser?.registrationNumber}</span>
          </li>
          <li>
            <span className="detail-label">Drug License No.</span>
            <span className="detail-value">{currentUser?.drugLicenseNumber}</span>
          </li>
        </ul>
        <div className="profile-actions">
          <button className="edit-button">Edit Profile</button>
        </div>
      </div>
    </div>
  );
};

export default PharmacistProfile;