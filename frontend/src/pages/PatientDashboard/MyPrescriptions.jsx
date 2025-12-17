import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { getPatientDoctorsAPI } from '../../services/apiService'; 
import './MyPrescriptions.css'; 
import { 
  FaFilePrescription, FaQrcode, FaEye, FaCheckCircle, 
  FaTimesCircle, FaUserMd, FaTimes, FaPrint, FaShareAlt, 
  FaSearch, FaPaperPlane 
} from 'react-icons/fa';

const MyPrescriptions = () => {
  const { currentUser, prescriptions = [], medicinesDB = [] } = useAppContext();
  
  // --- STATES ---
  const [selectedRx, setSelectedRx] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Sharing States
  const [showShareModal, setShowShareModal] = useState(false);
  const [rxToShare, setRxToShare] = useState(null);
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [linkedDoctors, setLinkedDoctors] = useState([]); 

  // --- FETCH LINKED DOCTORS ---
  useEffect(() => {
    const fetchLinkedDoctors = async () => {
        const patientId = currentUser?.id || currentUser?._id;
        if (patientId) {
            try {
                const result = await getPatientDoctorsAPI(patientId);
                if (result.success) {
                    setLinkedDoctors(result.data); 
                }
            } catch (error) {
                console.error("Failed to fetch linked doctors", error);
            }
        }
    };
    if(currentUser) fetchLinkedDoctors();
  }, [currentUser]);

  // Filter Doctors for Modal Search
  const filteredDoctors = linkedDoctors.filter(doc => 
    (doc.name || '').toLowerCase().includes(doctorSearchTerm.toLowerCase()) ||
    (doc.hospitalName || '').toLowerCase().includes(doctorSearchTerm.toLowerCase())
  );

  // Memo Hook for Filtering Prescriptions (Safe Check)
  const recentList = useMemo(() => {
    if (!currentUser) return [];
    
    // Safety check if prescriptions is not an array yet
    const safeList = Array.isArray(prescriptions) ? prescriptions : [];

    const myRx = safeList.filter(p => 
      String(p.patientId) === String(currentUser.id || currentUser._id)
    );
    return myRx.reverse(); 
  }, [prescriptions, currentUser]);

  // Validity Helper
  const checkValidity = (validUntilDate) => {
    if (!validUntilDate) return false;
    const today = new Date();
    const expiry = new Date(validUntilDate);
    today.setHours(0,0,0,0);
    expiry.setHours(0,0,0,0);
    return expiry >= today;
  };

  const getMedicineName = (id) => {
    const found = medicinesDB.find(m => m.id === id);
    return found ? found.name : id; 
  };

  // --- HANDLERS ---
  const handleViewClick = (prescription) => {
    setSelectedRx(prescription);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRx(null);
  };

  const handleShareClick = (prescription) => {
    setRxToShare(prescription);
    setDoctorSearchTerm(''); 
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setRxToShare(null);
  };

  const handleSendToDoctor = (doctor) => {
    console.log(`Sharing Rx ${rxToShare._id} with Dr. ${doctor.name} (${doctor._id})`);
    alert(`Successfully sent to Dr. ${doctor.name}`);
    closeShareModal();
  };

  if (!currentUser) return <div className="loading-state">Loading records...</div>;

  return (
    <div className="patient-dashboard-page full-height-page" style={{ width: '100%', maxWidth: '100vw', padding: '0px', boxSizing: 'border-box' }}>
      
      <div className="dashboard-top-row" style={{ width: '97%' }}>
        <header className="dashboard-header">
          <div className="header-icon"><FaFilePrescription /></div>
          <div className="header-text">
            <h1>My Prescriptions</h1>
            <p>Complete Medical History</p>
          </div>
        </header>
      </div>

      <div className="dashboard-content grow-content" style={{ width: '97%', maxWidth: '97%' }}>
        <div className="section-panel full-height-panel" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="table-container fill-space" style={{ width: '100%', overflowX: 'auto' }}>
            
            <table className="modern-table" style={{ width: '100%', minWidth: '100%', tableLayout: 'auto' }}>
              <thead>
                <tr>
                  <th style={{ width: '12%' }}>Date</th>
                  <th style={{ width: '20%' }}>Doctor Name</th>
                  <th style={{ width: '25%' }}>Diagnosis</th>
                  <th style={{ width: '15%' }}>Validity Status</th>
                  <th style={{ width: '8%', textAlign: 'center' }}>Share</th>
                  <th style={{ width: '20%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentList.length > 0 ? (
                  recentList.map((p, index) => {
                    const isValid = checkValidity(p.validUntil);
                    
                    // --- THE FIX IS HERE ---
                    // We check p.doctorId.name FIRST. 
                    // Because .populate() puts the name inside the doctorId object.
                    const docName = p.doctorId?.name || p.doctorName || "Unknown";

                    return (
                      <tr key={p.id || index}>
                        <td>{p.date}</td>
                        <td>
                           <div className="doctor-cell">
                             <FaUserMd style={{ color: '#3b82f6' }}/>
                             <span>Dr. {docName}</span>
                           </div>
                        </td>
                        <td><strong>{p.diagnosis}</strong></td>
                        <td>
                          {isValid ? (
                            <span className="badge success"><FaCheckCircle style={{ marginRight:'5px' }}/> Valid</span>
                          ) : (
                            <span className="badge error"><FaTimesCircle style={{ marginRight:'5px' }}/> Expired</span>
                          )}
                        </td>
                        
                        <td style={{ textAlign: 'center' }}>
                            <button 
                                className="icon-btn-share-only" 
                                onClick={() => handleShareClick(p)} 
                                title="Share with another Doctor"
                            >
                                <FaShareAlt />
                            </button>
                        </td>

                        <td>
                          <div className="action-buttons-row">
                            <button className="icon-btn-view" onClick={() => handleViewClick(p)}>
                              <FaEye /> View
                            </button>
                            {isValid ? (
                              <button className="icon-btn-qr"><FaQrcode /> Scan</button>
                            ) : (
                              <span className="text-disabled">Expired</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="6" className="empty-state-cell">No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* VIEW MODAL */}
      {showModal && selectedRx && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content rx-paper-look" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="rx-logo">
                <h2>MediSure<span>Rx</span></h2>
                <p>Secure Digital Prescription</p>
              </div>
              <button className="close-btn" onClick={closeModal}><FaTimes /></button>
            </div>
            
            <div className="rx-details-grid">
               {/* ALSO FIX HERE IN MODAL */}
               <div className="rx-info-group">
                 <label>Doctor:</label>
                 <span>Dr. {selectedRx.doctorId?.name || selectedRx.doctorName || "Unknown"}</span>
               </div>
               
               <div className="rx-info-group"><label>Date:</label><span>{selectedRx.date}</span></div>
               <div className="rx-info-group"><label>Valid Until:</label><span>{selectedRx.validUntil || "N/A"}</span></div>
               <div className="rx-info-group full-row"><label>Diagnosis:</label><span className="diagnosis-highlight">{selectedRx.diagnosis}</span></div>
            </div>
            <hr className="rx-divider" />
            <div className="rx-medicines-list">
              <table className="rx-med-table">
                <thead><tr><th>Medicine</th><th>Dosage</th><th>Instructions</th></tr></thead>
                <tbody>
                  {selectedRx.medicines && selectedRx.medicines.map((med, idx) => (
                      <tr key={idx}>
                        <td><strong>{getMedicineName(med.medicineId)}</strong><br/><small>{med.type}</small></td>
                        <td>{med.quantity || med.dosageInstruction}<br/><small>{med.frequency}</small></td>
                        <td>{med.instructions}</td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
               <div className="digital-sign">
                  <span>Signed by Dr. {selectedRx.doctorId?.name || selectedRx.doctorName || "Unknown"}</span>
               </div>
               <button className="print-btn" onClick={() => window.print()}><FaPrint /> Print</button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {showShareModal && (
        <div className="modal-overlay" onClick={closeShareModal}>
            <div className="modal-content share-modal-look" onClick={e => e.stopPropagation()}>
                <div className="share-header">
                    <h3>Share Prescription</h3>
                    <button className="close-btn-small" onClick={closeShareModal}><FaTimes /></button>
                </div>
                
                <p className="share-subtitle">Select a doctor to share your diagnosis of <strong>{rxToShare?.diagnosis}</strong>.</p>

                <div className="doctor-search-box">
                    <FaSearch className="search-icon"/>
                    <input 
                        type="text" 
                        placeholder="Search your doctors..." 
                        value={doctorSearchTerm}
                        onChange={(e) => setDoctorSearchTerm(e.target.value)}
                    />
                </div>

                <div className="doctor-list-container">
                    {filteredDoctors.length > 0 ? (
                        filteredDoctors.map(doc => (
                            <div key={doc._id || doc.id} className="doctor-list-item">
                                <div className="doc-info">
                                    <div className="doc-avatar"><FaUserMd /></div>
                                    <div>
                                        <h4>Dr. {doc.name}</h4>
                                        <span>{doc.hospitalName || doc.hospital || "General Practice"}</span>
                                    </div>
                                </div>
                                <button className="send-btn" onClick={() => handleSendToDoctor(doc)}>
                                    <FaPaperPlane /> Send
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="no-docs-found">
                            {linkedDoctors.length === 0 
                                ? "No linked doctors found. Visit a doctor to get added." 
                                : `No doctors found matching "${doctorSearchTerm}".`
                            }
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MyPrescriptions;