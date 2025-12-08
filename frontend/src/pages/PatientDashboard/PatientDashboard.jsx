import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Link } from 'react-router-dom';
import PrescriptionCard from '../../components/specific/PrescriptionCard';
import PrescriptionSummaryCard from '../../components/specific/PrescriptionSummaryCard';
import NewsFeed from '../../components/specific/NewsFeed';
import QRCode from 'react-qr-code';
import '../Dashboard.css';

const PatientDashboard = () => {
  const { currentUser, prescriptions, medicinesDB } = useAppContext();
  const [viewingPrescription, setViewingPrescription] = useState(null);
  const [qrPrescription, setQrPrescription] = useState(null);
  
  const userPrescriptions = prescriptions.filter(p => p.patientId === currentUser.id);
  const latestPrescription = userPrescriptions.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  const getMedicineName = (id) => medicinesDB.find(m => m.id === id)?.name || 'Unknown';

  const enrichPrescription = (p) => {
    if (!p) return null;
    const detailedMedicines = p.medicines.map(med => ({
      ...med, name: getMedicineName(med.medicineId)
    }));
    return { ...p, medicines: detailedMedicines };
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {currentUser?.name}</h1>
        <p>Your personal health dashboard.</p>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card grid-col-span-2">
          <h3>Your Latest Prescription</h3>
          {latestPrescription ? (
            <PrescriptionSummaryCard 
              prescription={latestPrescription}
              onViewClick={() => setViewingPrescription(latestPrescription)}
              onQrClick={() => setQrPrescription(latestPrescription)}
            />
          ) : (
            <p>No prescriptions found.</p>
          )}
        </div>
        <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <Link to="/patient-dashboard/prescriptions">View All Prescriptions</Link>
            <Link to="/patient-dashboard/chatbot">Ask AI Assistant</Link>
          </div>
        </div>
        <div className="dashboard-card grid-col-span-3">
          <h3>Latest Medical News</h3>
          <NewsFeed />
        </div>
      </div>

      {/* Modals for viewing details and QR code */}
      {viewingPrescription && (
        <div className="modal-overlay" onClick={() => setViewingPrescription(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <PrescriptionCard prescription={enrichPrescription(viewingPrescription)} />
            <button onClick={() => setViewingPrescription(null)} className="close-button">Close</button>
          </div>
        </div>
      )}
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

export default PatientDashboard;