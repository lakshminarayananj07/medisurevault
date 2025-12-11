import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import './ProfilePage.css'; // Shared CSS
import { 
  FaUserMd, FaEnvelope, FaPhone, FaHospital, 
  FaStethoscope, FaFileMedical, FaEdit, FaCamera, FaMapMarkerAlt 
} from 'react-icons/fa';

const DoctorProfile = () => {
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
              <FaUserMd />
            </div>
            <button className="camera-btn"><FaCamera /></button>
          </div>

          <div className="profile-identity">
            <h1>Dr. {currentUser.name}</h1>
            <span className="role-badge">DOCTOR</span>
            <div className="sub-identity">
              <FaHospital style={{ marginRight: '6px' }}/> {currentUser.hospitalName || "General Hospital"}
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
          <h2>Professional Details</h2>
        </div>
        
        <div className="info-grid">
          
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
              {currentUser.phone || "+91 98765 43210"}
            </div>
          </div>

          {/* Professional Info */}
          <div className="info-group">
            <label><FaStethoscope /> Specialization</label>
            <div className="info-value highlight-text">
              {currentUser.specialization || "General Medicine"}
            </div>
          </div>

          <div className="info-group">
            <label><FaFileMedical /> Medical Reg. No</label>
            <div className="info-value">
              {currentUser.medicalRegNo || "N/A"}
            </div>
          </div>

          {/* Full Width Field */}
          <div className="info-group full-width">
            <label><FaHospital /> Hospital Affiliation</label>
            <div className="info-value">
              {currentUser.hospitalName || currentUser.hospital || "Not Assigned"}
            </div>
          </div>
          
           <div className="info-group full-width">
            <label><FaMapMarkerAlt /> Clinic Address</label>
            <div className={isEditing ? "info-value editable" : "info-value"}>
              {currentUser.address || "Chennai, Tamil Nadu, India"}
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

export default DoctorProfile;