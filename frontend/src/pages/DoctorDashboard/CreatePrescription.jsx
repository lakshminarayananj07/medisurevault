import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { getDoctorPatientsAPI } from '../../services/apiService'; // Import the API
import './CreatePrescription.css';

const CreatePrescription = () => {
  const { currentUser, medicinesDB, createPrescription, diagnoses } = useAppContext();
  
  // --- SEARCH & PATIENT STATES ---
  const [myPatients, setMyPatients] = useState([]);       // All linked patients
  const [filteredPatients, setFilteredPatients] = useState([]); // Filtered by search
  const [searchTerm, setSearchTerm] = useState('');       // Input text
  const [selectedPatientId, setSelectedPatientId] = useState(''); // Selected ID
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // --- FORM STATES ---
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([
    { medicineId: '', type: '', strength: '', quantity: '', volume: '', dosageInstruction: '', frequency: '', instructions: '' },
  ]);

  const today = new Date().toLocaleDateString('en-CA');

  // 1. Fetch Doctor's Linked Patients on Load
  useEffect(() => {
    const fetchMyPatients = async () => {
      const doctorId = currentUser?.id || currentUser?._id;
      if (doctorId) {
        const result = await getDoctorPatientsAPI(doctorId);
        if (result.success) {
          setMyPatients(result.data);
          setFilteredPatients(result.data);
        }
      }
    };
    fetchMyPatients();
  }, [currentUser]);

  // 2. Click Outside Handler (Close Dropdown)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- SEARCH LOGIC ---
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setShowSuggestions(true);
    setSelectedPatientId(''); // Clear selection if typing new stuff

    if (term === '') {
      setFilteredPatients(myPatients);
    } else {
      const filtered = myPatients.filter(patient => 
        patient.name.toLowerCase().includes(term.toLowerCase()) || 
        patient.username.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  };

  const selectPatient = (patient) => {
    setSelectedPatientId(patient._id);
    setSearchTerm(`${patient.name} (@${patient.username})`); // Show nice name
    setShowSuggestions(false);
  };

  // --- MEDICINE HANDLERS (Unchanged) ---
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

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPatientId) {
      alert("Please search and select a valid patient from the list.");
      return;
    }

    const prescriptionData = {
      patientId: selectedPatientId, // Use the state from search
      date: today,
      diagnosis: diagnosis,
      medicines: medicines,
    };
    
    const result = await createPrescription(prescriptionData);
    
    if (result.success) {
      alert('Prescription created successfully!');
      // Reset form
      setSelectedPatientId('');
      setSearchTerm('');
      setDiagnosis('');
      setMedicines([{ medicineId: '', type: '', strength: '', quantity: '', volume: '', dosageInstruction: '', frequency: '', instructions: '' }]);
      // Reset search list
      setFilteredPatients(myPatients);
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
          
          {/* --- NEW SEARCH BAR (Replaces Select) --- */}
          <div className="input-group search-container" ref={searchRef}>
            <label>Select Patient</label>
            <input 
              type="text" 
              placeholder="Type to search your patients..." 
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              className="search-input"
              required // Validates that text is present
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="suggestions-dropdown">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map(patient => (
                    <div 
                      key={patient._id} 
                      className="suggestion-row" 
                      onClick={() => selectPatient(patient)}
                    >
                      <strong>{patient.name}</strong> 
                      <span className="suggestion-username"> (@{patient.username})</span>
                    </div>
                  ))
                ) : (
                  <div className="no-suggestions">No patients found. Add them in History first.</div>
                )}
              </div>
            )}
          </div>
          {/* -------------------------------------- */}

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

        {/* ... Medicines Section (Same as before) ... */}
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