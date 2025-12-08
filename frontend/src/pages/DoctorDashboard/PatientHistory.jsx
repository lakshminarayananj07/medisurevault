import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import PrescriptionCard from '../../components/specific/PrescriptionCard';
import './PatientHistory.css';

const PatientHistory = () => {
  // Get all necessary data from the context
  const { currentUser, patients, prescriptions, medicinesDB } = useAppContext();
  
  // State to keep track of which patient is selected
  const [selectedPatientId, setSelectedPatientId] = useState('');
  
  // State to store the filtered prescriptions for the selected patient
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);

  // This effect runs whenever the user selects a different patient
  useEffect(() => {
    if (selectedPatientId) {
      const filtered = prescriptions.filter(p => 
        p.patientId === selectedPatientId && p.doctorId === currentUser.id
      );
      setPatientPrescriptions(filtered);
    } else {
      setPatientPrescriptions([]); // Clear if no patient is selected
    }
  }, [selectedPatientId, prescriptions, currentUser.id]);

  // Helper function to get medicine names (same as in MyPrescriptions)
  const getMedicineName = (id) => {
    const med = medicinesDB.find(m => m.id === id);
    return med ? med.name : 'Unknown Medicine';
  };

  return (
    <div className="patient-history-container">
      <h2>View Patient History</h2>
      
      <div className="patient-selector-container">
        <label htmlFor="patient-select">Select a Patient to View Their History</label>
        <select 
          id="patient-select"
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
        >
          <option value="">-- Select Patient --</option>
          {patients.map(patient => (
            <option key={patient.id} value={patient.id}>
              {patient.name} ({patient.username})
            </option>
          ))}
        </select>
      </div>

      <div className="history-results-container">
        {selectedPatientId && patientPrescriptions.length > 0 && (
          <h3>Prescriptions for {patients.find(p=>p.id === selectedPatientId)?.name}</h3>
        )}
        
        {selectedPatientId ? (
          patientPrescriptions.length > 0 ? (
            <div className="prescriptions-grid">
              {patientPrescriptions.map(p => {
                const detailedMedicines = p.medicines.map(med => ({
                  ...med,
                  name: getMedicineName(med.medicineId)
                }));
                const enrichedPrescription = { ...p, medicines: detailedMedicines };
                
                return <PrescriptionCard key={p.id} prescription={enrichedPrescription} />;
              })}
            </div>
          ) : (
            <p>No prescriptions found for this patient from you.</p>
          )
        ) : (
          <p>Please select a patient to see their records.</p>
        )}
      </div>
    </div>
  );
};

export default PatientHistory;