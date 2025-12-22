import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import axios from 'axios'; 
import { FaEye, FaPrint, FaTimes, FaSearch, FaUserPlus, FaHistory, FaStethoscope, FaSpinner, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const PatientHistory = () => {
  const { currentUser, medicinesDB = [] } = useAppContext();
  
  // --- STATES ---
  const [myPatients, setMyPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  
  // Prescription Data State
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // UI States
  const [selectedRx, setSelectedRx] = useState(null); 
  const [showModal, setShowModal] = useState(false);  
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingRx, setLoadingRx] = useState(false);
  
  const searchRef = useRef(null);

  // Add Patient Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatientUsername, setNewPatientUsername] = useState('');
  const [newPatientCode, setNewPatientCode] = useState('');
  const [addMsg, setAddMsg] = useState({ type: '', text: '' });

  // --- 1. FETCH PATIENTS (Using the working Dashboard logic) ---
  const fetchMyPatients = async () => {
    try {
      const token = currentUser?.token || localStorage.getItem('token');
      const doctorId = currentUser?.id || currentUser?._id;
      
      if (!token || !doctorId) return;

      setLoadingPatients(true);

      // DIRECT CALL TO PORT 5001
      const { data } = await axios.get(`http://localhost:5001/api/auth/patient-history/${doctorId}`, {
        headers: { 'x-auth-token': token }
      });

      // Handle data whether it comes as { data: [] } or just []
      const patientsList = Array.isArray(data) ? data : (data.data || []);
      setMyPatients(patientsList);
      setFilteredPatients(patientsList);
      
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
        fetchMyPatients();
    }
  }, [currentUser]);

  // --- 2. FETCH PRESCRIPTIONS (The Fix for "No Prescriptions") ---
  useEffect(() => {
    const fetchPatientRx = async () => {
        if (!selectedPatientId) {
            setPatientPrescriptions([]);
            return;
        }

        try {
            setLoadingRx(true);
            setCurrentPage(1); // Reset to page 1 on new search
            const token = currentUser?.token || localStorage.getItem('token');
            
            // Call the endpoint that gets specific patient data
            const { data } = await axios.get(`http://localhost:5001/api/prescriptions/patient/${selectedPatientId}`, {
                headers: { 'x-auth-token': token }
            });

            if (data.success) {
                // FORCE SORT: Newest First
                const sorted = data.data.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
                setPatientPrescriptions(sorted);
            } else {
                setPatientPrescriptions([]);
            }
        } catch (error) {
            console.error("Error fetching Rx:", error);
            setPatientPrescriptions([]);
        } finally {
            setLoadingRx(false);
        }
    };

    fetchPatientRx();
  }, [selectedPatientId]);

  // --- 3. PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = patientPrescriptions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(patientPrescriptions.length / itemsPerPage);

  const nextPage = () => {
      if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const prevPage = () => {
      if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

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
    setSelectedPatientId(patient._id || patient.id);
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

  // --- ADD PATIENT ---
  const handleAddPatient = async (e) => {
    e.preventDefault();
    setAddMsg({ type: '', text: '' });
    
    try {
        const token = currentUser?.token || localStorage.getItem('token');
        const doctorId = currentUser?.id || currentUser?._id;

        const payload = {
            doctorId,
            patientUsername: newPatientUsername,
            patientCode: newPatientCode
        };

        const { data } = await axios.post('http://localhost:5001/api/auth/add-patient', payload, {
            headers: { 'x-auth-token': token }
        });
        
        setAddMsg({ type: 'success', text: `Success! Added ${data.patientName || 'patient'}` });
        fetchMyPatients();

        setTimeout(() => { 
            setShowAddModal(false); 
            setNewPatientUsername(''); 
            setNewPatientCode(''); 
            setAddMsg({ type: '', text: '' }); 
        }, 1500);

    } catch (error) {
        setAddMsg({ 
            type: 'error', 
            text: error.response?.data?.message || "Failed to add patient" 
        });
    }
  };

  // --- STYLES ---
  const styles = {
    pageContainer: { minHeight: '100vh', width: '99%', maxWidth: '100vw', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', padding: '0px', fontFamily: "'Poppins', sans-serif" },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', width: '98%', backgroundColor: '#ffffff', padding: '20px', borderRadius: '20px' },
    headerContent: { display: 'flex', alignItems: 'center', gap: '15px' },
    headerIcon: { backgroundColor: '#e0e7ff', color: '#4338ca', padding: '12px', borderRadius: '12px', fontSize: '24px', display: 'flex' },
    headerTitle: { margin: 0, fontSize: '26px', fontWeight: '700', color: '#1e293b' },
    headerSubtitle: { margin: 0, fontSize: '14px', color: '#64748b' },
    addButton: { backgroundColor: '#0f172a', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'all 0.2s' },
    contentPanel: { backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '101%' },
    searchToolbar: { padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#fafbfc' },
    searchWrapper: { position: 'relative', width: '100%', maxWidth: '500px' },
    searchInput: { width: '100%', padding: '12px 40px 12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontFamily: 'inherit', outline: 'none' },
    searchIcon: { position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
    dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '5px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 50, maxHeight: '200px', overflowY: 'auto' },
    dropdownItem: { padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between' },
    tableContainer: { width: '100%', overflowX: 'auto', flex: 1 },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
    th: { backgroundColor: '#ffffff', color: '#64748b', fontWeight: '600', textAlign: 'left', padding: '18px 45px', fontSize: '13px', textTransform: 'uppercase', borderBottom: '2px solid #f1f5f9' },
    td: { padding: '20px 45px', borderBottom: '1px solid #f8fafc', color: '#334155', fontSize: '15px', verticalAlign: 'middle' },
    actionBtn: { backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s' },
    emptyState: { padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '16px' },
    
    // Pagination Styles
    paginationContainer: { padding: '15px 45px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px', borderTop: '1px solid #f1f5f9' },
    pageBtn: { background: 'white', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#475569' },
    pageInfo: { fontSize: '13px', color: '#64748b', fontWeight: '500' },

    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContentSmall: { backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '400px', fontFamily: "'Poppins', sans-serif" },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#475569' },
    modalInput: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' },
    modalActions: { display: 'flex', gap: '10px', marginTop: '20px' },
    rxPaper: { backgroundColor: 'white', width: '800px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', fontFamily: "'Times New Roman', serif", color: 'black', position: 'relative' }
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`}</style>
      <div style={styles.pageContainer}>
        {/* HEADER */}
        <div style={styles.topRow}>
          <div style={styles.headerContent}>
            <div style={styles.headerIcon}><FaHistory /></div>
            <div><h1 style={styles.headerTitle}>Patient History</h1><p style={styles.headerSubtitle}>View and manage past medical records</p></div>
          </div>
          <button style={styles.addButton} onClick={() => setShowAddModal(true)}><FaUserPlus /> Link New Patient</button>
        </div>

        {/* CONTENT */}
        <div style={styles.contentPanel}>
            {/* Search */}
            <div style={styles.searchToolbar}>
                <div style={styles.searchWrapper} ref={searchRef}>
                    <input type="text" placeholder="Search patient by name or username..." value={searchTerm} onChange={handleSearchChange} onFocus={() => { setShowSuggestions(true); if(searchTerm === '') setFilteredPatients(myPatients); }} style={styles.searchInput} />
                    {selectedPatientId ? <button onClick={clearSelection} style={{...styles.searchIcon, border:'none', background:'none', cursor:'pointer', color:'#ef4444', fontWeight:'bold'}}>✕</button> : <FaSearch style={styles.searchIcon} />}
                    {showSuggestions && (
                        <div style={styles.dropdown}>
                            {loadingPatients ? (
                                <div style={{padding:'15px', textAlign:'center', color:'#94a3b8'}}>Loading...</div>
                            ) : filteredPatients.length > 0 ? (
                                filteredPatients.map(patient => (
                                    <div key={patient._id || patient.id} style={styles.dropdownItem} onClick={() => selectPatient(patient)} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                                        <span style={{fontWeight:'600', color:'#1e293b'}}>{patient.name || patient.username}</span><span style={{fontSize:'12px', color:'#64748b'}}>@{patient.username}</span>
                                    </div>
                                ))
                            ) : (<div style={{padding:'15px', color:'#94a3b8', textAlign:'center'}}>No patients found</div>)}
                        </div>
                    )}
                </div>
                {selectedPatientId && (
                    <div style={{fontSize:'14px', color:'#059669', backgroundColor:'#d1fae5', padding:'8px 12px', borderRadius:'6px', display:'flex', alignItems:'center', gap:'6px'}}>
                        <FaStethoscope /> Viewing records for: <strong>{searchTerm}</strong>
                    </div>
                )}
            </div>

            {/* Table */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={{...styles.th, width:'10%'}}>S.No</th>
                            <th style={{...styles.th, width:'15%'}}>Date Issued</th>
                            <th style={{...styles.th, width:'30%'}}>Diagnosis</th>
                            <th style={{...styles.th, width:'25%'}}>Validity Status</th>
                            <th style={{...styles.th, width:'20%'}}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loadingRx ? (
                            <tr><td colSpan="5" style={styles.emptyState}><FaSpinner className="icon-spin" /> Loading prescriptions...</td></tr>
                        ) : selectedPatientId ? (
                            currentItems.length > 0 ? (
                                currentItems.map((p, index) => (
                                    <tr key={p.id || p._id || index} style={{borderBottom: '1px solid #f8fafc'}}>
                                        {/* Adjust index for pagination */}
                                        <td style={styles.td}><div style={{fontWeight:'500', color:'#64748b'}}>#{indexOfFirstItem + index + 1}</div></td>
                                        <td style={styles.td}><div style={{fontWeight:'500'}}>{p.date}</div></td>
                                        <td style={styles.td}><div style={{fontWeight:'600', color:'#1e293b'}}>{p.diagnosis}</div></td>
                                        <td style={styles.td}>
                                            <span style={{fontSize: '12px', padding: '4px 8px', borderRadius: '12px', backgroundColor: '#f1f5f9', color:'#475569', fontWeight: '600'}}>
                                                {p.validUntil ? `Valid until ${p.validUntil}` : 'No Expiry'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <button style={styles.actionBtn} onClick={() => handleViewPrescription(p)}><FaEye /> View Prescription</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" style={styles.emptyState}>No prescription records found for this patient.</td></tr>
                            )
                        ) : (
                            <tr><td colSpan="5" style={styles.emptyState}>Please search and select a patient to view their history.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {selectedPatientId && patientPrescriptions.length > 0 && (
                <div style={styles.paginationContainer}>
                    <span style={styles.pageInfo}>
                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, patientPrescriptions.length)} of {patientPrescriptions.length}
                    </span>
                    <button 
                        onClick={prevPage} 
                        disabled={currentPage === 1} 
                        style={{...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1}}
                    >
                        <FaChevronLeft />
                    </button>
                    <button 
                        onClick={nextPage} 
                        disabled={currentPage === totalPages} 
                        style={{...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1}}
                    >
                        <FaChevronRight />
                    </button>
                </div>
            )}
        </div>

        {/* ADD MODAL */}
        {showAddModal && (
            <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
                <div style={styles.modalContentSmall} onClick={e => e.stopPropagation()}>
                    <h2 style={{marginTop:0, fontSize:'20px', color:'#1e293b'}}>Link New Patient</h2>
                    <p style={{color:'#64748b', fontSize:'14px', marginBottom:'20px'}}>Enter the patient's details to add them to your list.</p>
                    <form onSubmit={handleAddPatient}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Patient Username</label>
                            <input type="text" value={newPatientUsername} onChange={(e) => setNewPatientUsername(e.target.value)} style={styles.modalInput} required />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Secret Code</label>
                            <input type="text" value={newPatientCode} onChange={(e) => setNewPatientCode(e.target.value)} style={styles.modalInput} required />
                        </div>
                        {addMsg.text && (
                            <div style={{padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '15px', backgroundColor: addMsg.type === 'error' ? '#fee2e2' : '#dcfce7', color: addMsg.type === 'error' ? '#ef4444' : '#166534'}}>{addMsg.text}</div>
                        )}
                        <div style={styles.modalActions}>
                            <button type="submit" style={{...styles.addButton, justifyContent:'center', flex:1}}>Link Patient</button>
                            <button type="button" onClick={() => setShowAddModal(false)} style={{border: 'none', backgroundColor: '#f1f5f9', color: '#64748b', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'}}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* VIEW MODAL */}
        {showModal && selectedRx && (
            <div style={styles.modalOverlay} onClick={closeModal}>
                <div style={styles.rxPaper} onClick={e => e.stopPropagation()}>
                    <button onClick={closeModal} style={{position:'absolute', top:'20px', right:'20px', background:'none', border:'none', fontSize:'20px', cursor:'pointer'}}><FaTimes /></button>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'30px', borderBottom:'3px solid black', paddingBottom:'20px'}}>
                        <div><h2 style={{margin:0, fontSize:'28px', color:'#1e293b'}}>Dr. {selectedRx.doctorName || currentUser.name}</h2><p style={{margin:'5px 0 0 0', color:'#666', fontStyle:'italic'}}>General Medicine</p></div>
                        <div style={{textAlign:'right'}}><div style={{marginBottom:'5px'}}><strong>DATE:</strong> {selectedRx.date}</div><div><strong>VALID UNTIL:</strong> {selectedRx.validUntil || "Not Specified"}</div></div>
                    </div>
                    <div style={{backgroundColor:'#f8fafc', padding:'15px', borderTop:'1px solid #000', borderBottom:'1px solid #000', marginBottom:'30px', display:'flex', gap:'30px'}}>
                        <div><strong style={{fontSize:'12px', color:'#666'}}>PATIENT:</strong> <br/><span style={{fontSize:'18px'}}>{searchTerm}</span></div>
                        <div><strong style={{fontSize:'12px', color:'#666'}}>DIAGNOSIS:</strong> <br/><span style={{fontSize:'18px'}}>{selectedRx.diagnosis}</span></div>
                    </div>
                    <h3 style={{textDecoration:'underline', textAlign:'center', marginBottom:'20px'}}>Rx (Prescribed Medications)</h3>
                    <table style={{width:'100%', borderCollapse:'collapse', marginBottom:'40px'}}>
                        <thead><tr style={{borderBottom:'2px solid black'}}><th style={{textAlign:'left', padding:'10px'}}>MEDICINE</th><th style={{textAlign:'left', padding:'10px'}}>TYPE</th><th style={{textAlign:'center', padding:'10px'}}>QTY</th><th style={{textAlign:'right', padding:'10px'}}>FREQUENCY</th></tr></thead>
                        <tbody>
                             {selectedRx.medicines && selectedRx.medicines.map((med, idx) => (
                                <tr key={idx} style={{borderBottom:'1px solid #e2e8f0'}}>
                                    <td style={{padding:'12px 10px', fontWeight:'bold'}}>{getMedicineName(med.medicineId)}</td>
                                    <td style={{padding:'12px 10px'}}>{med.type} {med.strength}</td>
                                    <td style={{padding:'12px 10px', textAlign:'center'}}>{med.quantity}</td>
                                    <td style={{padding:'12px 10px', textAlign:'right', fontFamily:'monospace'}}>{med.frequency}</td>
                                </tr>
                             ))}
                        </tbody>
                    </table>
                    <div style={{display:'flex', justifyContent:'space-between', marginTop:'50px', alignItems:'flex-end'}}>
                         <div style={{borderTop:'1px dashed black', width:'200px', textAlign:'center', paddingTop:'5px'}}>Doctor's Signature</div>
                         <button onClick={() => window.print()} style={{backgroundColor:'black', color:'white', border:'none', padding:'10px 20px', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px'}}><FaPrint /> Print Prescription</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </>
  );
};

export default PatientHistory;