import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import PrescriptionCard from '../../components/specific/PrescriptionCard';
import PrescriptionSummaryCard from '../../components/specific/PrescriptionSummaryCard';
import QRCode from 'react-qr-code';
import './MyPrescriptions.css';

const MyPrescriptions = () => {
  const { currentUser, prescriptions, medicinesDB } = useAppContext();
  
  // --- This is the new state logic for managing the pop-ups ---
  const [viewingPrescription, setViewingPrescription] = useState(null);
  const [qrPrescription, setQrPrescription] = useState(null);

  const userPrescriptions = prescriptions.filter(p => p.patientId === currentUser.id);

  const getMedicineName = (id) => medicinesDB.find(m => m.id === id)?.name || 'Unknown';
  
  const enrichPrescription = (p) => {
    const detailedMedicines = p.medicines.map(med => ({
      ...med, name: getMedicineName(med.medicineId)
    }));
    return { ...p, medicines: detailedMedicines };
  };

  return (
    <div className="my-prescriptions-container">
      <h2>My Prescriptions</h2>
      {userPrescriptions.length > 0 ? (
        <div className="prescriptions-list">
          {/* --- THIS IS THE MAIN CHANGE ---
            Instead of showing the full PrescriptionCard here, we are now showing
            the new, simpler PrescriptionSummaryCard for each item.
          */}
          {userPrescriptions.map(p => (
            <PrescriptionSummaryCard 
              key={p.id} 
              prescription={p} 
              // We pass functions to the buttons to tell this page which pop-up to open
              onViewClick={() => setViewingPrescription(p)}
              onQrClick={() => setQrPrescription(p)}
            />
          ))}
        </div>
      ) : (
        <p>You do not have any prescriptions yet.</p>
      )}

      {/* This is the pop-up for viewing the full prescription details */}
      {viewingPrescription && (
        <div className="modal-overlay" onClick={() => setViewingPrescription(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <PrescriptionCard prescription={enrichPrescription(viewingPrescription)} />
            <button onClick={() => setViewingPrescription(null)} className="close-button">Close</button>
          </div>
        </div>
      )}

      {/* This is the pop-up for showing the QR code */}
      {qrPrescription && (
        <div className="modal-overlay" onClick={() => setQrPrescription(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Scan Prescription QR Code</h3>
            <div className="qr-code-container">
              <QRCode value={JSON.stringify({ prescriptionId: qrPrescription.id })} size={256} />
            </div>
            <p>Prescription ID: {qrPrescription.id}</p>
            <button onClick={() => setQrPrescription(null)} className="close-button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPrescriptions;