import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { 
  FaUserInjured, FaEnvelope, FaPhone, FaCalendarAlt, 
  FaTint, FaFingerprint, FaLock, FaEdit, FaCamera, FaUser,
  FaSave, FaTimes
} from 'react-icons/fa';

const PatientProfile = () => {
  const { currentUser } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        username: currentUser.username || '',
        email: currentUser.email || '',
        mobile: currentUser.mobile || '',
        dob: currentUser.dob || '',
        bloodGroup: currentUser.bloodGroup || '',
        patientCode: currentUser.patientCode || '',
        aadhaar: currentUser.aadhaar || ''
      });
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Saving Profile:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (currentUser) {
        setFormData({
            name: currentUser.name || '',
            username: currentUser.username || '',
            email: currentUser.email || '',
            mobile: currentUser.mobile || '',
            dob: currentUser.dob || '',
            bloodGroup: currentUser.bloodGroup || '',
            patientCode: currentUser.patientCode || '',
            aadhaar: currentUser.aadhaar || ''
        });
    }
    setIsEditing(false);
  };

  // --- STYLES (Shared Design System) ---
  const styles = {
    pageContainer: {
        minHeight: '100vh',
        width: '99%',
        maxWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        fontFamily: "'Poppins', sans-serif",
        gap: '20px'
    },
    // HEADER SECTION
    topRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '98%',
        backgroundColor: '#ffffff', 
        padding: '20px',            
        borderRadius: '20px', 
    },
    headerContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    avatarContainer: {
        position: 'relative',
        width: '80px',
        height: '80px',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        backgroundColor: '#fef3c7', // Amber-100 for Patients
        color: '#d97706', // Amber-600
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '35px',
        border: '3px solid #f1f5f9'
    },
    cameraBtn: {
        position: 'absolute',
        bottom: '0',
        right: '0',
        backgroundColor: '#0f172a',
        color: 'white',
        border: 'none',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '10px'
    },
    headerText: {
        display: 'flex',
        flexDirection: 'column',
    },
    headerTitle: {
        margin: 0,
        fontSize: '26px',
        fontWeight: '700',
        color: '#1e293b',
    },
    headerSubtitle: {
        margin: '5px 0 0 0',
        fontSize: '14px',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    badge: {
        backgroundColor: '#f1f5f9',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#475569',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    codeBadge: {
        backgroundColor: '#fffbeb',
        color: '#b45309',
        border: '1px solid #fcd34d'
    },

    // ACTIONS
    actionGroup: {
        display: 'flex',
        gap: '10px'
    },
    editBtn: {
        backgroundColor: '#0f172a',
        color: '#ffffff',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s',
    },
    cancelBtn: {
        backgroundColor: '#fee2e2',
        color: '#ef4444',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    saveBtn: {
        backgroundColor: '#dcfce7',
        color: '#166534',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },

    // CONTENT PANEL
    contentPanel: {
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '101%',
        padding: '40px',
        boxSizing: 'border-box'
    },

    // FORM GRID
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '30px',
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    label: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    input: {
        padding: '14px 16px',
        borderRadius: '10px',
        border: '1px solid #cbd5e1',
        fontSize: '15px',
        fontFamily: 'inherit',
        color: '#1e293b',
        outline: 'none',
        transition: 'border-color 0.2s',
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff'
    },
    readOnlyBox: {
        padding: '14px 16px',
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        color: '#334155',
        fontSize: '15px',
        fontWeight: '500',
    }
  };

  // Helper to render fields
  // readOnlyOverride: force read-only even in edit mode (for system IDs like Patient Code)
  const renderField = (label, name, icon, readOnlyOverride = false) => (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>{icon} {label}</label>
      {isEditing && !readOnlyOverride ? (
        <input 
          type="text" 
          name={name}
          value={formData[name]} 
          onChange={handleInputChange} 
          style={{...styles.input, borderColor: '#6366f1'}}
        />
      ) : (
        <div style={styles.readOnlyBox}>
          {formData[name] || "Not Provided"}
        </div>
      )}
    </div>
  );

  if (!currentUser) return <div style={{padding:'40px', textAlign:'center', fontFamily: "'Poppins', sans-serif"}}>Loading Profile...</div>;

  return (
    <>
        <style>
            {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`}
        </style>

        <div style={styles.pageContainer}>
        
        {/* --- HEADER SECTION --- */}
        <div style={styles.topRow}>
            <div style={styles.headerContent}>
                {/* Profile Image */}
                <div style={styles.avatarContainer}>
                    <div style={styles.avatar}><FaUserInjured /></div>
                    <button style={styles.cameraBtn}><FaCamera /></button>
                </div>

                {/* Details */}
                <div style={styles.headerText}>
                    <h1 style={styles.headerTitle}>{formData.name}</h1>
                    <div style={styles.headerSubtitle}>
                        <span style={styles.badge}><FaUser /> @{formData.username}</span>
                        <span style={{...styles.badge, ...styles.codeBadge}}><FaLock /> Code: {formData.patientCode}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={styles.actionGroup}>
                {!isEditing ? (
                    <button style={styles.editBtn} onClick={() => setIsEditing(true)}>
                        <FaEdit /> Edit Profile
                    </button>
                ) : (
                    <>
                        <button style={styles.cancelBtn} onClick={handleCancel}>
                            <FaTimes /> Cancel
                        </button>
                        <button style={styles.saveBtn} onClick={handleSave}>
                            <FaSave /> Save Changes
                        </button>
                    </>
                )}
            </div>
        </div>

        {/* --- CONTENT PANEL --- */}
        <div style={styles.contentPanel}>
            <h2 style={{marginTop:0, marginBottom:'30px', fontSize:'20px', color:'#1e293b', borderBottom:'1px solid #e2e8f0', paddingBottom:'15px'}}>
                Personal Health Record
            </h2>
            
            <div style={styles.grid}>
                {/* Contact Info */}
                {renderField('Email Address', 'email', <FaEnvelope />)}
                {renderField('Mobile Number', 'mobile', <FaPhone />)}
                
                {/* Personal Info */}
                {renderField('Date of Birth', 'dob', <FaCalendarAlt />)}
                {renderField('Blood Group', 'bloodGroup', <FaTint />)}

                {/* System IDs (Read Only) */}
                {renderField('Aadhaar Number', 'aadhaar', <FaFingerprint />, true)}
                {renderField('My Secret Code', 'patientCode', <FaLock />, true)}
            </div>
        </div>

        </div>
    </>
  );
};

export default PatientProfile;