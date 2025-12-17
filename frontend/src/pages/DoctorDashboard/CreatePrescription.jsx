import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { getDoctorPatientsAPI } from '../../services/apiService';
import { FaUserMd, FaCalendarAlt, FaPlus, FaTrash, FaFilePrescription, FaSearch, FaStethoscope, FaClock, FaPills } from 'react-icons/fa';

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

    // --- STYLES (MATCHING PATIENT HISTORY PAGE) ---
    const styles = {
        pageContainer: {
            minHeight: '100vh',
            width: '99%',
            maxWidth: '100vw',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            fontFamily: "'Poppins', sans-serif",
            gap: '20px'
        },
        // HEADER SECTION
        topRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '98%',
            backgroundColor: '#ffffff', 
            padding: '20px',            
            borderRadius: '20px', 
        },
        headerContent: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
        },
        headerIcon: {
            backgroundColor: '#e0e7ff', 
            color: '#4338ca', 
            padding: '12px',
            borderRadius: '12px',
            fontSize: '24px',
            display: 'flex',
        },
        headerTitle: {
            margin: 0,
            fontSize: '26px',
            fontWeight: '700',
            color: '#1e293b',
        },
        headerSubtitle: {
            margin: 0,
            fontSize: '14px',
            color: '#64748b',
        },
        headerMeta: {
            display: 'flex',
            gap: '20px',
            color: '#64748b',
            fontSize: '14px',
            fontWeight: '500'
        },
        metaItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f8fafc',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
        },

        // CONTENT SECTION
        contentPanel: {
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            width: '101%', // Matches history page
            padding: '30px',
            boxSizing: 'border-box'
        },

        // FORM SECTIONS
        sectionTitle: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#334155',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        sectionIcon: {
            color: '#4338ca'
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
        },
        inputGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            position: 'relative' // For suggestions dropdown
        },
        label: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#475569'
        },
        input: {
            padding: '12px 15px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            fontSize: '14px',
            fontFamily: 'inherit',
            outline: 'none',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            transition: 'border-color 0.2s',
            width: '100%',
            boxSizing: 'border-box'
        },
        
        // SUGGESTIONS DROPDOWN
        dropdown: {
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            marginTop: '5px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
            maxHeight: '200px',
            overflowY: 'auto',
        },
        dropdownItem: {
            padding: '12px 15px',
            cursor: 'pointer',
            borderBottom: '1px solid #f8fafc',
            color: '#1e293b',
            fontSize: '14px',
            fontWeight: '500'
        },

        // MEDICINE TABLE STYLE
        medicineContainer: {
            backgroundColor: '#f8fafc',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0'
        },
        headerRow: {
            display: 'flex',
            gap: '15px',
            marginBottom: '15px',
            padding: '0 10px',
            color: '#64748b',
            fontSize: '12px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
        },
        medRow: {
            display: 'flex',
            gap: '15px',
            marginBottom: '10px',
            alignItems: 'center',
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        },
        
        // BUTTONS
        addBtn: {
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            border: '1px solid #dbeafe',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '15px',
            transition: 'background 0.2s',
        },
        submitBtn: {
            backgroundColor: '#0f172a',
            color: '#ffffff',
            border: 'none',
            padding: '14px 40px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s',
            alignSelf: 'flex-end',
            marginTop: '20px'
        },
        deleteBtn: {
            backgroundColor: '#fee2e2',
            color: '#ef4444',
            border: 'none',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '14px'
        },
        
        // Column Widths
        colWide: { flex: 2 },
        colNormal: { flex: 1 },
        colSmall: { width: '80px' },
        colAction: { width: '40px' }
    };

    return (
        <>
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`}
            </style>

            <div style={styles.pageContainer}>
                
                {/* --- 1. HEADER SECTION --- */}
                <div style={styles.topRow}>
                    <div style={styles.headerContent}>
                        <div style={styles.headerIcon}><FaFilePrescription /></div>
                        <div>
                            <h1 style={styles.headerTitle}>New Prescription</h1>
                            <p style={styles.headerSubtitle}>Create and issue digital prescriptions</p>
                        </div>
                    </div>
                    
                    <div style={styles.headerMeta}>
                        <div style={styles.metaItem}>
                            <FaUserMd style={{color: '#6366f1'}} /> Dr. {currentUser?.name}
                        </div>
                        <div style={styles.metaItem}>
                            <FaCalendarAlt style={{color: '#6366f1'}} /> {today}
                        </div>
                    </div>
                </div>

                {/* --- 2. CONTENT PANEL --- */}
                <div style={styles.contentPanel}>
                    <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', height:'100%'}}>
                        
                        {/* COMPONENT A: PATIENT DETAILS */}
                        <div style={{marginBottom:'40px'}}>
                            <div style={styles.sectionTitle}>
                                <FaStethoscope style={styles.sectionIcon} /> Patient & Diagnosis Details
                            </div>
                            
                            <div style={styles.formGrid}>
                                {/* Patient Search */}
                                <div style={styles.inputGroup} ref={searchRef}>
                                    <label style={styles.label}>Select Patient</label>
                                    <div style={{position:'relative'}}>
                                        <FaSearch style={{position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8'}} />
                                        <input 
                                            type="text" 
                                            placeholder="Search patient name..." 
                                            value={searchTerm} 
                                            onChange={handleSearchChange} 
                                            onFocus={() => setShowSuggestions(true)} 
                                            style={{...styles.input, paddingLeft: '40px'}} 
                                            required 
                                        />
                                    </div>
                                    {showSuggestions && (
                                        <div style={styles.dropdown}>
                                            {filteredPatients.length > 0 ? (
                                                filteredPatients.map(patient => (
                                                    <div 
                                                        key={patient._id} 
                                                        style={styles.dropdownItem} 
                                                        onClick={() => selectPatient(patient)}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                                    >
                                                        {patient.name} <span style={{color:'#94a3b8', fontSize:'12px'}}>@{patient.username}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{padding:'15px', color:'#94a3b8', fontSize:'14px'}}>No patients found</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Diagnosis */}
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Diagnosis</label>
                                    <select 
                                        value={diagnosis} 
                                        onChange={(e) => setDiagnosis(e.target.value)} 
                                        style={styles.input} 
                                        required
                                    >
                                        <option value="" disabled>-- Select Diagnosis --</option>
                                        {diagnoses && diagnoses.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>

                                {/* Validity */}
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Valid Until</label>
                                    <input 
                                        type="date" 
                                        min={today}
                                        value={validityDate} 
                                        onChange={(e) => setValidityDate(e.target.value)} 
                                        style={styles.input} 
                                        required 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* COMPONENT B: MEDICINES LIST */}
                        <div style={{flex:1}}>
                            <div style={styles.sectionTitle}>
                                <FaPills style={styles.sectionIcon} /> Prescribed Medications
                            </div>

                            <div style={styles.medicineContainer}>
                                {/* Table Headers */}
                                <div style={styles.headerRow}>
                                    <div style={styles.colWide}>Medicine Name</div>
                                    <div style={styles.colNormal}>Strength</div>
                                    <div style={styles.colSmall}>Qty</div>
                                    <div style={styles.colNormal}>Frequency</div>
                                    <div style={styles.colNormal}>Timing</div>
                                    <div style={styles.colAction}></div>
                                </div>

                                {/* Rows */}
                                {medicines.map((med, index) => (
                                    <div key={index} style={styles.medRow}>
                                        
                                        {/* Medicine Select */}
                                        <div style={styles.colWide}>
                                            <select 
                                                name="medicineId" 
                                                value={med.medicineId} 
                                                onChange={e => handleMedicineChange(index, e)} 
                                                style={styles.input} 
                                                required
                                            >
                                                <option value="" disabled>Select Medicine</option>
                                                {medicinesDB.map(m => <option key={m.id} value={m.id}>{m.name} ({m.type})</option>)}
                                            </select>
                                        </div>

                                        {/* Strength */}
                                        <div style={styles.colNormal}>
                                            <input 
                                                type="text" 
                                                name="strength" 
                                                placeholder="e.g. 500mg" 
                                                value={med.strength} 
                                                onChange={e => handleMedicineChange(index, e)} 
                                                style={styles.input} 
                                            />
                                        </div>

                                        {/* Quantity */}
                                        <div style={styles.colSmall}>
                                            <input 
                                                type="number" 
                                                name="quantity" 
                                                placeholder="10" 
                                                value={med.quantity} 
                                                onChange={e => handleMedicineChange(index, e)} 
                                                style={styles.input} 
                                                required 
                                            />
                                        </div>

                                        {/* Frequency */}
                                        <div style={styles.colNormal}>
                                            <select 
                                                name="frequency" 
                                                value={med.frequency} 
                                                onChange={e => handleMedicineChange(index, e)} 
                                                style={styles.input} 
                                                required
                                            >
                                                <option value="1-0-0">1-0-0 (Mrng)</option>
                                                <option value="0-1-0">0-1-0 (Noon)</option>
                                                <option value="0-0-1">0-0-1 (Night)</option>
                                                <option value="1-0-1">1-0-1 (M/N)</option>
                                                <option value="1-1-0">1-1-0 (M/A)</option>
                                                <option value="0-1-1">0-1-1 (A/N)</option>
                                                <option value="1-1-1">1-1-1 (3 Times)</option>
                                                <option value="0-0-0">SOS</option>
                                            </select>
                                        </div>

                                        {/* Timing */}
                                        <div style={styles.colNormal}>
                                            <div style={{position:'relative'}}>
                                                <FaClock style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8', fontSize:'12px'}} />
                                                <select 
                                                    name="foodTiming" 
                                                    value={med.foodTiming} 
                                                    onChange={e => handleMedicineChange(index, e)} 
                                                    style={{...styles.input, paddingLeft:'30px'}} 
                                                    required
                                                >
                                                    <option value="After Food">After Food</option>
                                                    <option value="Before Food">Before Food</option>
                                                    <option value="With Food">With Food</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Delete */}
                                        <div style={styles.colAction}>
                                            <button 
                                                type="button" 
                                                style={styles.deleteBtn} 
                                                onClick={() => handleRemoveMedicine(index)} 
                                                title="Remove"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button type="button" style={styles.addBtn} onClick={handleAddMedicine}>
                                    <FaPlus /> Add Another Medicine
                                </button>
                            </div>
                        </div>

                        <div style={{display:'flex', justifyContent:'flex-end'}}>
                            <button type="submit" style={styles.submitBtn}>
                                Sign & Issue Prescription
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </>
    );
};

export default CreatePrescription;