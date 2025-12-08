import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import './PrescriptionCard.css';

const PrescriptionCard = ({ prescription }) => {
  const { allUsers } = useAppContext();

  // Find the doctor and patient details from our user list
  const doctor = allUsers.find(user => user.id === prescription.doctorId);
  const patient = allUsers.find(user => user.id === prescription.patientId);

  return (
    <div className="prescription-paper">
      {/* --- HEADER --- */}
      <div className="prescription-header">
        <div className="doctor-info">
          <h2>{doctor ? doctor.name : 'Unknown Doctor'}</h2>
          <p>{doctor ? doctor.specialization : ''}</p>
        </div>
        <div className="hospital-info">
          <h3>{doctor ? doctor.hospital : 'General Hospital'}</h3>
        </div>
      </div>

      <div className="divider"></div>

      {/* --- PATIENT INFO --- */}
      <div className="patient-info">
        <div>
          <strong>Patient:</strong> {patient ? patient.name : 'Unknown Patient'}
        </div>
        <div>
          <strong>Date:</strong> {prescription.date}
        </div>
      </div>
      <div className="patient-info">
        <div>
          <strong>Diagnosis:</strong> {prescription.diagnosis}
        </div>
      </div>

      {/* --- MEDICATION TABLE --- */}
      <div className="medication-section">
        <div className="rx-symbol">Rx</div>
        <table className="medication-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Dosage</th>
              <th>Quantity</th>
              <th>Frequency</th>
              <th>Instructions</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medicines.map((med, index) => (
              <tr key={index}>
                <td>{med.name || 'N/A'}</td>
                <td>{med.strength || med.volume}</td>
                <td>{med.quantity ? `${med.quantity} units` : med.dosageInstruction}</td>
                <td>{med.frequency}</td>
                <td>{med.instructions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- FOOTER / SIGNATURE --- */}
      <div className="prescription-footer">
        <div className="signature-line">
          Doctor's Signature
        </div>
      </div>
    </div>
  );
};

export default PrescriptionCard;