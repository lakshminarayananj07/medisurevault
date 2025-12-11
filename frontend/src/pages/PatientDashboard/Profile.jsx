import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
// Importing the shared CSS from the Doctor folder
import '../DoctorDashboard/ProfilePage.css'; 
import { 
  FaUserInjured, FaEnvelope, FaPhone, FaCalendarAlt, 
  FaTint, FaFingerprint, FaLock, FaEdit, FaCamera, FaUser
} from 'react-icons/fa';

const PatientProfile = () => {
  const { currentUser } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);

  // Safety check
  if (!currentUser) return <div className="loading-state">Loading Profile...</div>;

  return (
    // FIX 1: Page Layout - Fixed height, Flex column, No window scroll
    <div className="profile-page" style={{ 
      height: 'calc(100vh - 60px)', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden',
      paddingBottom: '20px' 
    }}>
      
      {/* --- 1. HEADER CARD (Cover Removed) --- */}
      <div className="profile-header-card">
        
        {/* FIX 2: Added marginTop: 0 and padding to sit correctly without the black cover */}
        <div className="profile-content" style={{ marginTop: 0, paddingTop: '30px' }}>
          
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              <FaUserInjured />
            </div>
            <button className="camera-btn"><FaCamera /></button>
          </div>

          <div className="profile-identity">
            <h1>{currentUser.name}</h1>
            <span className="role-badge">PATIENT</span>
            <div className="sub-identity">
              <FaUser style={{ marginRight: '6px', fontSize: '0.9rem' }}/> 
              @{currentUser.username || "username"}
            </div>
          </div>

          <button className="edit-profile-btn" onClick={() => setIsEditing(!isEditing)}>
            <FaEdit /> {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* --- 2. DETAILS CARD (Scrollable Area) --- */}
      {/* FIX 3: Added flex: 1 and overflowY: auto so ONLY this part scrolls */}
      <div className="profile-details-card" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        marginTop: '20px' 
      }}>
        <div className="card-header-row">
          <h2>Personal Health Record</h2>
        </div>
        
        <div className="info-grid">
          
          {/* Secret Code */}
          <div className="info-group">
            <label><FaLock /> My Secret Code</label>
            <div className="info-value highlight-text" style={{ color: '#d97706', borderColor: '#fcd34d' }}>
              {currentUser.patientCode || "Not Set"}
            </div>
          </div>

          {/* Blood Group */}
          <div className="info-group">
            <label><FaTint /> Blood Group</label>
            <div className="info-value">
              {currentUser.bloodGroup || "N/A"}
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
            <label><FaPhone /> Mobile Number</label>
            <div className={isEditing ? "info-value editable" : "info-value"}>
              {currentUser.mobile || "N/A"}
            </div>
          </div>

          {/* Personal Details */}
          <div className="info-group">
            <label><FaCalendarAlt /> Date of Birth</label>
            <div className={isEditing ? "info-value editable" : "info-value"}>
              {currentUser.dob || "N/A"}
            </div>
          </div>

          <div className="info-group">
            <label><FaFingerprint /> Aadhaar Number</label>
            <div className="info-value">
              {currentUser.aadhaar || "N/A"}
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

export default PatientProfile;