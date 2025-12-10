import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import PrescriptionCard from '../../components/specific/PrescriptionCard';
import { addPatientAPI, getDoctorPatientsAPI } from '../../services/apiService'; 
import './PatientHistory.css';

const PatientHistory = () => {
  const { currentUser, prescriptions, medicinesDB } = useAppContext();
  
  // Data States
  const [myPatients, setMyPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  
  // Selection States
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);

  // Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null); // To handle clicking outside

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [newPatientUsername, setNewPatientUsername] = useState('');
  const [newPatientCode, setNewPatientCode] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // 1. Fetch Patients on Load
  useEffect(() => {
    const fetchMyPatients = async () => {
      const doctorId = currentUser?.id || currentUser?._id;
      if (doctorId) {
        const result = await getDoctorPatientsAPI(doctorId);
        if (result.success) {
          setMyPatients(result.data);
          setFilteredPatients(result.data); // Initialize filtered list with all patients
        }
      }
    };
    fetchMyPatients();
  }, [currentUser]);

  // 2. Filter Prescriptions when Patient Selected
  useEffect(() => {
    if (selectedPatientId) {
      const filtered = prescriptions.filter(p => 
        p.patientId === selectedPatientId && p.doctorId === currentUser.id
      );
      setPatientPrescriptions(filtered);
    } else {
      setPatientPrescriptions([]);
    }
  }, [selectedPatientId, prescriptions, currentUser.id]);

  // 3. Handle Click Outside (to close suggestions)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- SEARCH HANDLER ---
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setShowSuggestions(true);

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
    setSearchTerm(patient.name); // Set input to the selected name
    setShowSuggestions(false);   // Hide list
  };

  const clearSelection = () => {
    setSearchTerm('');
    setSelectedPatientId('');
    setFilteredPatients(myPatients);
  };

  // --- ADD PATIENT HANDLER ---
  const handleAddPatient = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');
    
    const doctorId = currentUser.id || currentUser._id; 
    const result = await addPatientAPI(doctorId, newPatientUsername, newPatientCode);

    if (result.success) {
      setModalSuccess(`Success! Added ${result.patientName}`);
      const refresh = await getDoctorPatientsAPI(doctorId); 
      if (refresh.success) {
        setMyPatients(refresh.data);
        setFilteredPatients(refresh.data); // Update filtered list too
      }
      setTimeout(() => {
        setShowModal(false);
        setNewPatientUsername('');
        setNewPatientCode('');
        setModalSuccess('');
      }, 1500);
    } else {
      setModalError(result.message);
    }
  };

  const getMedicineName = (id) => {
    const med = medicinesDB.find(m => m.id === id);
    return med ? med.name : 'Unknown Medicine';
  };

  return (
    <div className="patient-history-container">
      <div className="history-header">
        <h2>Patient History</h2>
        <button className="add-patient-btn" onClick={() => setShowModal(true)}>
          + Add New Patient
        </button>
      </div>

      {/* --- SEARCH BAR SECTION (Replaces Select) --- */}
      <div className="patient-selector-container" ref={searchRef}>
        <label>Search Patient</label>
        <div className="search-input-wrapper">
          <input 
            type="text" 
            placeholder="Type name or username..." 
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setShowSuggestions(true)}
            className="patient-search-input"
          />
          {selectedPatientId && (
            <button className="clear-search-btn" onClick={clearSelection}>✕</button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="suggestions-list">
            {filteredPatients.length > 0 ? (
              filteredPatients.map(patient => (
                <div 
                  key={patient._id} 
                  className="suggestion-item" 
                  onClick={() => selectPatient(patient)}
                >
                  <span className="s-name">{patient.name}</span>
                  <span className="s-username">@{patient.username}</span>
                </div>
              ))
            ) : (
              <div className="no-suggestion">No patients found.</div>
            )}
          </div>
        )}
      </div>

      {/* --- ADD PATIENT MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Patient to History</h3>
            <p>Enter the patient's username and their secret code.</p>
            <form onSubmit={handleAddPatient}>
              <div className="input-group">
                <label>Patient Username</label>
                <input type="text" value={newPatientUsername} onChange={(e) => setNewPatientUsername(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Secret Code</label>
                <input type="text" value={newPatientCode} onChange={(e) => setNewPatientCode(e.target.value)} required />
              </div>
              {modalError && <p className="error-msg">{modalError}</p>}
              {modalSuccess && <p className="success-msg">{modalSuccess}</p>}
              <div className="modal-actions">
                <button type="submit" className="confirm-btn">Add Patient</button>
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Close</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RESULTS --- */}
      <div className="history-results-container">
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
            <div className="empty-state">
              <p>No prescriptions found for <strong>{searchTerm}</strong>.</p>
            </div>
          )
        ) : (
          <p className="placeholder-msg">Search and select a patient to view their records.</p>
        )}
      </div>
    </div>
  );
};

export default PatientHistory;