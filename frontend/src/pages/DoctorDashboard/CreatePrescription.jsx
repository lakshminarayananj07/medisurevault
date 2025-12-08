import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import './CreatePrescription.css';

const CreatePrescription = () => {
  const { currentUser, patients, medicinesDB, createPrescription, diagnoses } = useAppContext();
  
  const [selectedPatient, setSelectedPatient] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([
    { medicineId: '', type: '', strength: '', quantity: '', volume: '', dosageInstruction: '', frequency: '', instructions: '' },
  ]);

  const today = new Date().toLocaleDateString('en-CA');

  const handleMedicineChange = (index, event) => {
    const { name, value } = event.target;
    const list = [...medicines];
    if (name === 'medicineId') {
      const selectedMed = medicinesDB.find(med => med.id === value);
      list[index] = { ...list[index], medicineId: value, type: selectedMed.type, strength: '', volume: '' };
    } else {
      list[index][name] = value;
    }
    setMedicines(list);
  };

  const handleAddMedicine = () => {
    setMedicines([...medicines, { medicineId: '', type: '', strength: '', quantity: '', volume: '', dosageInstruction: '', frequency: '', instructions: '' }]);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length > 1) {
      const list = [...medicines];
      list.splice(index, 1);
      setMedicines(list);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const prescriptionData = {
      patientId: selectedPatient,
      date: today,
      diagnosis: diagnosis,
      medicines: medicines,
    };
    
    const result = await createPrescription(prescriptionData);
    
    if (result.success) {
      alert('Prescription created successfully and saved to the database!');
      // Reset form fields
      setSelectedPatient('');
      setDiagnosis('');
      setMedicines([{ medicineId: '', type: '', strength: '', quantity: '', volume: '', dosageInstruction: '', frequency: '', instructions: '' }]);
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  return (
    <div className="create-prescription-container">
      <h2>Create a New Prescription</h2>
      <form onSubmit={handleSubmit} className="prescription-form">
        <div className="form-section static-info">
          <div><strong>Doctor:</strong> {currentUser?.name}</div>
          <div><strong>Hospital:</strong> {currentUser?.hospital}</div>
          <div><strong>Date:</strong> {today}</div>
        </div>

        <div className="form-section">
          <h3>Patient Information</h3>
          <div className="input-group">
            <label>Select Patient</label>
            <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} required>
              <option value="" disabled>-- Select a Patient --</option>
              {patients.map(p => (
                <option key={p._id} value={p._id}>{p.name} ({p.username})</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Patient's Issue / Diagnosis</label>
            <select value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required>
              <option value="" disabled>-- Select a Diagnosis --</option>
              {diagnoses.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Medications</h3>
          {medicines.map((med, index) => (
            <div key={index} className="medicine-entry-advanced">
              <select name="medicineId" value={med.medicineId} onChange={e => handleMedicineChange(index, e)} required>
                <option value="" disabled>-- Select Medicine --</option>
                {medicinesDB.map(dbMed => (
                  <option key={dbMed.id} value={dbMed.id}>{dbMed.name} ({dbMed.type})</option>
                ))}
              </select>

              {med.type === 'Tablet' && (
                <>
                  <select name="strength" value={med.strength} onChange={e => handleMedicineChange(index, e)} required>
                    <option value="" disabled>-- Strength --</option>
                    {medicinesDB.find(m => m.id === med.medicineId)?.strengths.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input type="number" name="quantity" placeholder="No. of Tablets" value={med.quantity} onChange={e => handleMedicineChange(index, e)} required />
                </>
              )}
              {med.type === 'Syrup' && (
                <>
                  <select name="volume" value={med.volume} onChange={e => handleMedicineChange(index, e)} required>
                    <option value="" disabled>-- Volume --</option>
                    {medicinesDB.find(m => m.id === med.medicineId)?.volumes.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                   <input type="text" name="dosageInstruction" placeholder="e.g., 5ml twice a day" value={med.dosageInstruction} onChange={e => handleMedicineChange(index, e)} required />
                </>
              )}

              <input type="text" name="frequency" placeholder="Frequency (e.g., 1-0-1)" value={med.frequency} onChange={e => handleMedicineChange(index, e)} required />
              <input type="text" name="instructions" placeholder="Instructions (e.g., After Food)" value={med.instructions} onChange={e => handleMedicineChange(index, e)} required />
              <button type="button" className="remove-btn" onClick={() => handleRemoveMedicine(index)} disabled={medicines.length === 1}>-</button>
            </div>
          ))}
          <button type="button" className="add-btn" onClick={handleAddMedicine}>+ Add Medicine</button>
        </div>

        <button type="submit" className="submit-btn">Create & Sign Prescription</button>
      </form>
    </div>
  );
};

export default CreatePrescription;