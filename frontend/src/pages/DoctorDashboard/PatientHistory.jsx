import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { addPatientAPI, getDoctorPatientsAPI } from '../../services/apiService'; 
import './PatientHistory.css';
import { FaEye, FaPrint, FaTimes, FaSearch } from 'react-icons/fa';

const PatientHistory = () => {
  const { currentUser, prescriptions = [], medicinesDB = [] } = useAppContext();
  
  // --- STATES ---
  const [myPatients, setMyPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [selectedRx, setSelectedRx] = useState(null); 
  const [showModal, setShowModal] = useState(false);  
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Add Patient Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatientUsername, setNewPatientUsername] = useState('');
  const [newPatientCode, setNewPatientCode] = useState('');
  const [addMsg, setAddMsg] = useState({ type: '', text: '' });

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchMyPatients = async () => {
      const doctorId = currentUser?.id || currentUser?._id;
      if (doctorId) {
        const result = await getDoctorPatientsAPI(doctorId);
        if (result.success) {
          setMyPatients(result.data);
          // Don't show list initially, wait for search
          setFilteredPatients(result.data); 
        }
      }
    };
    fetchMyPatients();
  }, [currentUser]);

  // --- FILTER PRESCRIPTIONS ---
  useEffect(() => {
    if (selectedPatientId) {
      const filtered = prescriptions.filter(p => 
        String(p.patientId) === String(selectedPatientId) && 
        String(p.doctorId) === String(currentUser.id || currentUser._id)
      );
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      setPatientPrescriptions(filtered);
    } else {
      setPatientPrescriptions([]);
    }
  }, [selectedPatientId, prescriptions, currentUser]);

  // --- CLICK OUTSIDE SEARCH ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HANDLERS ---
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setShowSuggestions(true);

    if (term.trim() === '') {
        setFilteredPatients(myPatients);
    } else {
        const lowerTerm = term.toLowerCase();
        const filtered = myPatients.filter(p => {
            const name = (p.name || '').toLowerCase();
            const username = (p.username || '').toLowerCase();
            return name.includes(lowerTerm) || username.includes(lowerTerm);
        });
        setFilteredPatients(filtered);
    }
  };

  const selectPatient = (patient) => {
    setSelectedPatientId(patient._id);
    // Use name, fallback to username if name is missing
    setSearchTerm(patient.name || patient.username); 
    setShowSuggestions(false);
  };

  const clearSelection = () => {
    setSearchTerm('');
    setSelectedPatientId('');
    setFilteredPatients(myPatients);
    setPatientPrescriptions([]);
  };

  const handleViewPrescription = (rx) => {
    setSelectedRx(rx);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRx(null);
  };

  const getMedicineName = (id) => {
    const med = medicinesDB.find(m => m.id === id);
    return med ? med.name : id;
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setAddMsg({ type: '', text: '' });
    const doctorId = currentUser.id || currentUser._id; 
    const result = await addPatientAPI(doctorId, newPatientUsername, newPatientCode);
    if (result.success) {
      setAddMsg({ type: 'success', text: `Success! Added ${result.patientName}` });
      const refresh = await getDoctorPatientsAPI(doctorId); 
      if (refresh.success) {
        setMyPatients(refresh.data);
        setFilteredPatients(refresh.data);
      }
      setTimeout(() => { setShowAddModal(false); setNewPatientUsername(''); setNewPatientCode(''); setAddMsg({ type: '', text: '' }); }, 1500);
    } else {
      setAddMsg({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="patient-history-container">
      <h2>Patient History Management</h2>

      {/* --- CONTROLS --- */}
      <div className="controls-wrapper">
        <div className="control-block add-block">
          <div className="block-header">
            <h3>Add New Patient</h3>
            <p>Link a new patient using their code.</p>
          </div>
          <button className="primary-btn" onClick={() => setShowAddModal(true)}>+ Link Patient</button>
        </div>

        <div className="control-block search-block" ref={searchRef}>
          <div className="block-header">
            <h3>Search Records</h3>
            <p>Find existing patient history.</p>
          </div>
          
          {/* FIX: Suggestions dropdown is now INSIDE this relative wrapper */}
          <div className="search-input-wrapper">
            <input 
              type="text" 
              placeholder="Start typing name..." 
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => {
                  setShowSuggestions(true);
                  if(searchTerm === '') setFilteredPatients(myPatients);
              }}
              className="patient-search-input"
            />
            {selectedPatientId ? 
              <button className="clear-search-btn" onClick={clearSelection}>✕</button> : 
              <FaSearch className="search-icon-static"/>
            }

            {/* DROPDOWN MOVED HERE */}
            {showSuggestions && (
              <div className="suggestions-list">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map(patient => (
                    <div key={patient._id} className="suggestion-item" onClick={() => selectPatient(patient)}>
                      <span className="s-name">{patient.name || patient.username || "Unknown"}</span>
                      <span className="s-username">@{patient.username}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-suggestion">No patients found.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- RESULTS TABLE --- */}
      <div className="history-results-container">
        {selectedPatientId ? (
          <>
            <h3 className="results-title">
              Prescriptions for <span className="highlight-name">{searchTerm}</span>
            </h3>
            
            {patientPrescriptions.length > 0 ? (
              <div className="prescription-table">
                <div className="table-header">
                  <span style={{flex: 1}}>Date Issued</span>
                  <span style={{flex: 2}}>Diagnosis</span>
                  <span style={{flex: 1, textAlign: 'center'}}>Validity</span>
                  <span style={{flex: 1, textAlign: 'right'}}>View</span>
                </div>
                {patientPrescriptions.map(p => (
                  <div key={p.id || p.date} className="table-row">
                    <span className="row-date" style={{flex: 1}}>{p.date}</span>
                    <span className="row-diagnosis" style={{flex: 2}}><strong>{p.diagnosis}</strong></span>
                    <span style={{flex: 1, textAlign: 'center', fontSize: '0.85rem', color: '#666'}}>
                        {p.validUntil ? `Until ${p.validUntil}` : 'No Expiry'}
                    </span>
                    <span className="row-action" style={{flex: 1, textAlign: 'right'}}>
                      <button className="view-btn" onClick={() => handleViewPrescription(p)}>
                        <FaEye /> Open
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No prescription records found for this patient.</div>
            )}
          </>
        ) : (
          <div className="empty-state">Select a patient above to view their records.</div>
        )}
      </div>

      {/* --- ADD PATIENT MODAL --- */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content small-modal">
            <h3>Link New Patient</h3>
            <form onSubmit={handleAddPatient}>
              <div className="input-group">
                <label>Username</label>
                <input type="text" value={newPatientUsername} onChange={(e) => setNewPatientUsername(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Secret Code</label>
                <input type="text" value={newPatientCode} onChange={(e) => setNewPatientCode(e.target.value)} required />
              </div>
              {addMsg.text && <p className={`msg ${addMsg.type}`}>{addMsg.text}</p>}
              <div className="modal-actions">
                <button type="submit" className="confirm-btn">Add</button>
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW PRESCRIPTION MODAL --- */}
      {showModal && selectedRx && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content rx-paper-look" onClick={e => e.stopPropagation()}>
            
            <div className="rx-paper-header">
                <div className="doc-info">
                    <h2>Dr. {selectedRx.doctorName || currentUser.name}</h2>
                    <p>General Medicine</p>
                </div>
                <div className="rx-meta-info">
                    <div className="meta-row">
                        <strong>DATE:</strong> <span>{selectedRx.date}</span>
                    </div>
                    <div className="meta-row">
                        <strong>VALID UNTIL:</strong> <span>{selectedRx.validUntil || "Not Specified"}</span>
                    </div>
                </div>
                <button className="close-btn-abs" onClick={closeModal}><FaTimes /></button>
            </div>

            <div className="rx-patient-bar">
                <div className="pb-item">
                    <span className="pb-label">PATIENT:</span> 
                    <span className="pb-val">{searchTerm}</span>
                </div>
                <div className="pb-item">
                    <span className="pb-label">DIAGNOSIS:</span> 
                    <span className="pb-val">{selectedRx.diagnosis}</span>
                </div>
            </div>

            <h4 className="rx-table-title">Rx (Prescribed Medications)</h4>
            <div className="rx-table-container">
              <table className="rx-med-table">
                <thead>
                  <tr>
                    <th style={{width: '40%'}}>MEDICINE NAME</th>
                    <th style={{width: '20%'}}>STRENGTH/TYPE</th>
                    <th style={{width: '15%', textAlign:'center'}}>QUANTITY</th>
                    <th style={{width: '25%', textAlign:'right'}}>FREQUENCY</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRx.medicines && selectedRx.medicines.map((med, idx) => (
                      <tr key={idx}>
                        <td className="med-name-cell">{getMedicineName(med.medicineId)}</td>
                        <td>{med.type} {med.strength}</td>
                        <td style={{textAlign:'center'}}>{med.quantity}</td>
                        <td className="freq-cell" style={{textAlign:'right'}}>{med.frequency}</td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rx-footer">
               <div className="sign-block">
                 Signature / Digital Stamp
               </div>
               <button className="print-btn-rx" onClick={() => window.print()}>
                 <FaPrint /> Print / Save
               </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PatientHistory;