import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
// Importing the shared CSS from the Doctor folder
import '../DoctorDashboard/ProfilePage.css'; 
import { 
  FaUser, FaEnvelope, FaPhone, FaClinicMedical, 
  FaIdCard, FaEdit, FaCamera, FaMapMarkerAlt 
} from 'react-icons/fa';

const PharmacistProfile = () => {
  const { currentUser } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);

  // Safety check
  if (!currentUser) return <div className="loading-state">Loading Profile...</div>;

  return (
    // FIX 1: Fixed page height to prevent full window scroll
    <div className="profile-page" style={{ 
      height: 'calc(100vh - 60px)', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden',
      paddingBottom: '20px' 
    }}>
      
      {/* --- 1. HEADER CARD (Cover Removed) --- */}
      <div className="profile-header-card">
        
        {/* FIX 2: Added marginTop: 0 to sit correctly without the cover */}
        <div className="profile-content" style={{ marginTop: 0, paddingTop: '30px' }}>
          
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              <FaClinicMedical /> {/* Pharmacist Icon */}
            </div>
            <button className="camera-btn"><FaCamera /></button>
          </div>

          <div className="profile-identity">
            <h1>{currentUser.name}</h1>
            <span className="role-badge">PHARMACIST</span>
            <div className="sub-identity">
              <FaIdCard style={{ marginRight: '6px', fontSize: '0.9rem' }}/> 
              ID: {currentUser.username || "pharmacist_01"}
            </div>
          </div>

          <button className="edit-profile-btn" onClick={() => setIsEditing(!isEditing)}>
            <FaEdit /> {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* --- 2. DETAILS CARD (Scrollable) --- */}
      <div className="profile-details-card" style={{ 
        flex: 1, 
        overflowY: 'auto', // Allows scrolling ONLY inside this card
        marginTop: '20px' 
      }}>
        <div className="card-header-row">
          <h2>Pharmacy & Personal Details</h2>
        </div>
        
        <div className="info-grid">
          
          {/* Pharmacy Name (Full Width Highlight) */}
          <div className="info-group full-width">
            <label><FaClinicMedical /> Pharmacy / Shop Name</label>
            <div className="info-value highlight-text">
              {currentUser.pharmacyName || currentUser.shopName || "MediSure Central Pharmacy"}
            </div>
          </div>

          {/* License Number */}
          <div className="info-group">
            <label><FaIdCard /> License Number</label>
            <div className="info-value">
              {currentUser.licenseNumber || "LIC-12345678"}
            </div>
          </div>

          {/* Contact Info */}
          <div className="info-group">
            <label><FaEnvelope /> Email Address</label>
            <div className={isEditing ? "info-value editable" : "info-value"}>
              {currentUser.email || "N/A"}
            </div>
          </div>

          <div className="info-group">
            <label><FaPhone /> Phone Number</label>
            <div className={isEditing ? "info-value editable" : "info-value"}>
              {currentUser.phone || currentUser.mobile || "+91 98765 43210"}
            </div>
          </div>

          {/* Address */}
          <div className="info-group full-width">
            <label><FaMapMarkerAlt /> Pharmacy Address</label>
            <div className={isEditing ? "info-value editable" : "info-value"}>
              {currentUser.address || "123, Health Street, Chennai, Tamil Nadu"}
            </div>
          </div>

        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="edit-actions">
            <button className="save-btn">Save Changes</button>
          </div>
        )}
      </div>

    </div>
  );
};

export default PharmacistProfile;