import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import './MyPrescriptions.css'; 
import { FaFilePrescription, FaQrcode, FaEye, FaCheckCircle, FaTimesCircle, FaUserMd, FaTimes, FaPrint } from 'react-icons/fa';

const MyPrescriptions = () => {
  const { currentUser, prescriptions = [], medicinesDB = [] } = useAppContext();
  const [selectedRx, setSelectedRx] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Memo Hook for Filtering
  const recentList = useMemo(() => {
    if (!prescriptions || !currentUser) return [];
    const myRx = prescriptions.filter(p => 
      String(p.patientId) === String(currentUser.id || currentUser._id)
    );
    return myRx.reverse(); // Show ALL history, not just 5, if we have space
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

  const handleViewClick = (prescription) => {
    setSelectedRx(prescription);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRx(null);
  };

  if (!currentUser) return <div className="loading-state">Loading records...</div>;

  return (
    // FIX: Main Container takes Full Height
    <div className="patient-dashboard-page full-height-page">
      
      <div className="dashboard-top-row">
        <header className="dashboard-header">
          <div className="header-icon"><FaFilePrescription /></div>
          <div className="header-text">
            <h1>My Prescriptions</h1>
            <p>Complete Medical History</p>
          </div>
        </header>
      </div>

      {/* FIX: Dashboard Content grows to fill space */}
      <div className="dashboard-content grow-content">
        <div className="section-panel full-height-panel">
          <div className="table-container fill-space">
            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>Date</th>
                  <th style={{ width: '20%' }}>Doctor Name</th>
                  <th style={{ width: '25%' }}>Diagnosis</th>
                  <th style={{ width: '20%' }}>Validity Status</th>
                  <th style={{ width: '20%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentList.length > 0 ? (
                  recentList.map((p, index) => {
                    const isValid = checkValidity(p.validUntil);
                    return (
                      <tr key={p.id || index}>
                        <td>{p.date}</td>
                        <td>
                           <div className="doctor-cell">
                             <FaUserMd style={{ color: '#3b82f6' }}/>
                             <span>Dr. {p.doctorName || "Unknown"}</span>
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
                  <tr><td colSpan="5" className="empty-state-cell">No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL (Unchanged) */}
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
            {/* ... Modal Details (Same as your code) ... */}
            <div className="rx-details-grid">
               <div className="rx-info-group"><label>Doctor:</label><span>Dr. {selectedRx.doctorName}</span></div>
               <div className="rx-info-group"><label>Date:</label><span>{selectedRx.date}</span></div>
               <div className="rx-info-group"><label>Valid Until:</label><span>{selectedRx.validUntil || "N/A"}</span></div>
               <div className="rx-info-group full-row"><label>Diagnosis:</label><span className="diagnosis-highlight">{selectedRx.diagnosis}</span></div>
            </div>
            <hr className="rx-divider" />
            <h3 className="rx-section-title">Prescribed Medications</h3>
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
               <div className="digital-sign"><span>Signed by Dr. {selectedRx.doctorName}</span></div>
               <button className="print-btn" onClick={() => window.print()}><FaPrint /> Print</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPrescriptions;