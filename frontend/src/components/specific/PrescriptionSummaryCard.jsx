import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import './PrescriptionSummaryCard.css';

const PrescriptionSummaryCard = ({ prescription, onViewClick, onQrClick }) => {
  const { allUsers } = useAppContext();
  const doctor = allUsers.find(user => user.id === prescription.doctorId);
  const doctorName = doctor ? doctor.name : 'Unknown Doctor';

  return (
    <div className="summary-card">
      <div className="summary-info">
        <span className="summary-title">Prescription from {doctorName}</span>
        <span className="summary-meta">Date: {prescription.date} | Diagnosis: {prescription.diagnosis}</span>
      </div>
      <div className="summary-actions">
        <button onClick={onViewClick} className="summary-btn view-btn">View Prescription</button>
        <button onClick={onQrClick} className="summary-btn qr-btn">Show QR Code</button>
      </div>
    </div>
  );
};

export default PrescriptionSummaryCard;