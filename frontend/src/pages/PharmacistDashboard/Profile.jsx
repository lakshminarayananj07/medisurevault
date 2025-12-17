import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { 
  FaUser, FaEnvelope, FaPhone, FaClinicMedical, 
  FaIdCard, FaEdit, FaCamera, FaMapMarkerAlt,
  FaSave, FaTimes
} from 'react-icons/fa';

const PharmacistProfile = () => {
  const { currentUser } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  
  // --- FORM STATE ---
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        username: currentUser.username || '',
        email: currentUser.email || '',
        phone: currentUser.phone || currentUser.mobile || '',
        pharmacyName: currentUser.pharmacyName || currentUser.shopName || '',
        licenseNumber: currentUser.licenseNumber || '',
        address: currentUser.address || ''
      });
    }
  }, [currentUser]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Saving Profile:", formData);
    setIsEditing(false);
    // Add API update call here
  };

  const handleCancel = () => {
    if (currentUser) {
        setFormData({
            name: currentUser.name || '',
            username: currentUser.username || '',
            email: currentUser.email || '',
            phone: currentUser.phone || currentUser.mobile || '',
            pharmacyName: currentUser.pharmacyName || currentUser.shopName || '',
            licenseNumber: currentUser.licenseNumber || '',
            address: currentUser.address || ''
        });
    }
    setIsEditing(false);
  };

  // --- STYLES (Identical Theme to Doctor/Patient Profiles) ---
  const styles = {
    pageContainer: {
        minHeight: '100vh',
        width: '99%',
        maxWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        fontFamily: "'Poppins', sans-serif",
        gap: '20px' // Gap between Header and Content
    },
    
    // --- 1. HEADER SECTION STYLES ---
    topRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '98%',
        backgroundColor: '#ffffff', 
        padding: '20px',            
        borderRadius: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
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
        backgroundColor: '#d1fae5', // Emerald-100 (Pharmacist Theme)
        color: '#059669', // Emerald-600
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

    // ACTIONS (Edit/Save Buttons)
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

    // --- 2. CONTENT PANEL STYLES (Bottom Part) ---
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
    sectionTitle: {
        marginTop: 0, 
        marginBottom: '30px', 
        fontSize: '20px', 
        color: '#1e293b', 
        borderBottom: '1px solid #e2e8f0', 
        paddingBottom: '15px'
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
    },
    fullWidth: {
        gridColumn: '1 / -1'
    }
  };

  // Helper to render fields
  const renderField = (label, name, icon, isFullWidth = false) => (
    <div style={{...styles.fieldGroup, ...(isFullWidth ? styles.fullWidth : {})}}>
      <label style={styles.label}>{icon} {label}</label>
      {isEditing ? (
        <input 
          type="text" 
          name={name}
          value={formData[name]} 
          onChange={handleInputChange} 
          style={{...styles.input, borderColor: '#10b981'}} // Green focus border
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
        
        {/* --- PART 1: HEADER SECTION --- */}
        <div style={styles.topRow}>
            <div style={styles.headerContent}>
                {/* Profile Image */}
                <div style={styles.avatarContainer}>
                    <div style={styles.avatar}><FaClinicMedical /></div>
                    <button style={styles.cameraBtn}><FaCamera /></button>
                </div>

                {/* Details */}
                <div style={styles.headerText}>
                    <h1 style={styles.headerTitle}>{formData.name}</h1>
                    <div style={styles.headerSubtitle}>
                        <span style={styles.badge}><FaIdCard /> ID: {formData.username || "pharm_01"}</span>
                        <span style={styles.badge}><FaUser /> Role: Pharmacist</span>
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

        {/* --- PART 2: CONTENT PANEL (BOTTOM) --- */}
        <div style={styles.contentPanel}>
            <h2 style={styles.sectionTitle}>
                Pharmacy & Personal Information
            </h2>
            
            <div style={styles.grid}>
                {/* Contact Info */}
                {renderField('Email Address', 'email', <FaEnvelope />)}
                {renderField('Phone Number', 'phone', <FaPhone />)}
                
                {/* Professional Info */}
                {renderField('Pharmacy / Shop Name', 'pharmacyName', <FaClinicMedical />)}
                {renderField('License Number', 'licenseNumber', <FaIdCard />)}

                {/* Full Width Info */}
                {renderField('Pharmacy Address', 'address', <FaMapMarkerAlt />, true)}
            </div>
        </div>

        </div>
    </>
  );
};

export default PharmacistProfile;