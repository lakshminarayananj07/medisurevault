import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { getDoctorPatientsAPI } from '../../services/apiService';
import './CreatePrescription.css';
import { FaUserMd, FaCalendarAlt, FaPlus, FaTrash, FaFilePrescription } from 'react-icons/fa';

const CreatePrescription = () => {
    const { currentUser, medicinesDB, createPrescription, diagnoses } = useAppContext();
    
    // --- STATES ---
    const [myPatients, setMyPatients] = useState([]);       
    const [filteredPatients, setFilteredPatients] = useState([]); 
    const [searchTerm, setSearchTerm] = useState('');       
    const [selectedPatientId, setSelectedPatientId] = useState(''); 
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);

    const [diagnosis, setDiagnosis] = useState('');
    const [validityDate, setValidityDate] = useState(''); 

    // INITIAL STATE with all new fields
    const [medicines, setMedicines] = useState([
      { 
        medicineId: '', 
        type: '', 
        strength: '',    // e.g., 500mg
        quantity: '',    // e.g., 10
        frequency: '1-0-1', 
        foodTiming: 'After Food',
        instructions: '' // Optional notes
      },
    ]);

    const today = new Date().toLocaleDateString('en-CA');

    // --- FETCH PATIENTS ---
    useEffect(() => {
        const fetchMyPatients = async () => {
            const doctorId = currentUser?.id || currentUser?._id; 
            if (doctorId) {
                try {
                    const result = await getDoctorPatientsAPI(doctorId);
                    if (result && result.success) {
                        setMyPatients(result.data);
                        setFilteredPatients(result.data);
                    }
                } catch (error) { console.error("Error fetching patients:", error); }
            }
        };
        fetchMyPatients();
    }, [currentUser]);

    // --- HANDLERS ---
    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setShowSuggestions(true);
        setSelectedPatientId('');
        if (term === '') setFilteredPatients(myPatients);
        else {
            const filtered = myPatients.filter(patient => 
                (patient.name?.toLowerCase().includes(term.toLowerCase()))
            );
            setFilteredPatients(filtered);
        }
    };

    const selectPatient = (patient) => {
        setSelectedPatientId(patient._id);
        setSearchTerm(`${patient.name}`);
        setShowSuggestions(false);
    };

    const handleMedicineChange = (index, event) => {
        const { name, value } = event.target;
        const list = [...medicines];
        if (name === 'medicineId') {
            const selectedMed = medicinesDB.find(med => med.id === value);
            if(selectedMed) {
                list[index] = { 
                    ...list[index], 
                    medicineId: value, 
                    type: selectedMed.type, 
                    // Set default strength if available in DB, else keep blank
                    strength: selectedMed.strength || '', 
                    foodTiming: list[index].foodTiming || 'After Food',
                    frequency: list[index].frequency || '1-0-1'
                };
            }
        } else {
            list[index][name] = value;
        }
        setMedicines(list);
    };

    const handleAddMedicine = () => {
        setMedicines([...medicines, { medicineId: '', type: '', strength: '', quantity: '', frequency: '1-0-1', foodTiming: 'After Food', instructions: '' }]);
    };

    const handleRemoveMedicine = (index) => {
        const list = [...medicines];
        list.splice(index, 1);
        setMedicines(list);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatientId) { alert("Please select a patient."); return; }
        if (!validityDate) { alert("Please set a validity date."); return; }

        const docId = currentUser.id || currentUser._id;

        const prescriptionData = {
            doctorId: docId,
            doctorName: currentUser.name,
            patientId: selectedPatientId,
            date: today,
            validUntil: validityDate,
            diagnosis: diagnosis,
            medicines: medicines, 
        };
        
        try {
            const result = await createPrescription(prescriptionData);
            if (result.success) {
                alert('Prescription created successfully!');
                // Reset Form
                setSelectedPatientId('');
                setSearchTerm('');
                setDiagnosis('');
                setValidityDate('');
                setMedicines([{ medicineId: '', type: '', strength: '', quantity: '', frequency: '1-0-1', foodTiming: 'After Food', instructions: '' }]);
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) { console.error("Error", error); }
    };

    return (
        <div className="create-prescription-page">
            <div className="prescription-card">
                <div className="form-header">
                    <h2><FaFilePrescription /> New Prescription</h2>
                    <div className="header-meta">
                        <span><FaUserMd /> Dr. {currentUser?.name}</span>
                        <span><FaCalendarAlt /> {today}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="prescription-form">
                    
                    {/* --- SECTION 1: DETAILS --- */}
                    <div className="form-section">
                        <h3 className="section-title">Patient & Diagnosis</h3>
                        <div className="form-grid-2-col">
                            {/* Search */}
                            <div className="input-group search-container" ref={searchRef}>
                                <label>Select Patient</label>
                                <input type="text" placeholder="Search patient name..." value={searchTerm} onChange={handleSearchChange} onFocus={() => setShowSuggestions(true)} className="modern-input" required />
                                {showSuggestions && (
                                    <div className="suggestions-dropdown">
                                        {filteredPatients.length > 0 ? filteredPatients.map(patient => (
                                            <div key={patient._id} className="suggestion-row" onClick={() => selectPatient(patient)}>
                                                <strong>{patient.name}</strong>
                                            </div>
                                        )) : <div className="no-suggestions">No patients found</div>}
                                    </div>
                                )}
                            </div>

                            {/* Diagnosis */}
                            <div className="input-group">
                                <label>Diagnosis</label>
                                <select value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="modern-input" required>
                                    <option value="" disabled>-- Select Diagnosis --</option>
                                    {diagnoses && diagnoses.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            {/* Validity */}
                            <div className="input-group">
                                <label>Valid Until</label>
                                <input 
                                    type="date" 
                                    min={today}
                                    value={validityDate} 
                                    onChange={(e) => setValidityDate(e.target.value)} 
                                    className="modern-input" 
                                    required 
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="divider" />

                    {/* --- SECTION 2: MEDICINES --- */}
                    <div className="form-section">
                        <h3 className="section-title">Prescribed Medications</h3>
                        
                        {/* HEADER ROW FOR MEDICINES */}
                        <div className="medicine-header-row">
                            <span className="col-med">Medicine Name</span>
                            <span className="col-str">Strength</span>
                            <span className="col-qty">Qty</span>
                            <span className="col-freq">Frequency</span>
                            <span className="col-time">Timing</span>
                            <span className="col-del"></span>
                        </div>
                        
                        <div className="medicines-wrapper">
                            {medicines.map((med, index) => (
                                <div key={index} className="medicine-row">
                                    
                                    {/* 1. Medicine Select */}
                                    <div className="col-med">
                                        <select name="medicineId" value={med.medicineId} onChange={e => handleMedicineChange(index, e)} className="modern-input" required>
                                            <option value="" disabled>Select Medicine</option>
                                            {medicinesDB.map(m => <option key={m.id} value={m.id}>{m.name} ({m.type})</option>)}
                                        </select>
                                    </div>

                                    {/* 2. Strength (mg) */}
                                    <div className="col-str">
                                        <input 
                                            type="text" 
                                            name="strength" 
                                            placeholder="500mg" 
                                            value={med.strength} 
                                            onChange={e => handleMedicineChange(index, e)} 
                                            className="modern-input" 
                                        />
                                    </div>

                                    {/* 3. Quantity */}
                                    <div className="col-qty">
                                        <input 
                                            type="number" 
                                            name="quantity" 
                                            placeholder="10" 
                                            value={med.quantity} 
                                            onChange={e => handleMedicineChange(index, e)} 
                                            className="modern-input" 
                                            required 
                                        />
                                    </div>
                                    
                                    {/* 4. Frequency Dropdown */}
                                    <div className="col-freq">
                                        <select name="frequency" value={med.frequency} onChange={e => handleMedicineChange(index, e)} className="modern-input" required>
                                            <option value="1-0-0">1-0-0 (Morning)</option>
                                            <option value="0-1-0">0-1-0 (Noon)</option>
                                            <option value="0-0-1">0-0-1 (Night)</option>
                                            <option value="1-0-1">1-0-1 (Morn-Night)</option>
                                            <option value="1-1-0">1-1-0 (Morn-Noon)</option>
                                            <option value="0-1-1">0-1-1 (Noon-Night)</option>
                                            <option value="1-1-1">1-1-1 (3 Times)</option>
                                            <option value="0-0-0">SOS / PRN</option>
                                        </select>
                                    </div>

                                    {/* 5. Timing Dropdown */}
                                    <div className="col-time">
                                        <select name="foodTiming" value={med.foodTiming} onChange={e => handleMedicineChange(index, e)} className="modern-input" required>
                                            <option value="After Food">After Food</option>
                                            <option value="Before Food">Before Food</option>
                                            <option value="With Food">With Food</option>
                                        </select>
                                    </div>

                                    {/* 6. Delete */}
                                    <div className="col-del">
                                        <button type="button" className="icon-btn-delete" onClick={() => handleRemoveMedicine(index)} title="Remove">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <button type="button" className="add-med-btn" onClick={handleAddMedicine}>
                            <FaPlus /> Add Another Medicine
                        </button>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-btn-primary">Sign & Issue Prescription</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePrescription;