import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'react-qr-code'; 
import { 
  FaFilePrescription, FaQrcode, FaEye, FaCheckCircle, 
  FaTimesCircle, FaUserMd, FaTimes, FaPrint, FaShareAlt, 
  FaSearch, FaPaperPlane, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

const MyPrescriptions = () => {
  const { currentUser, prescriptions = [], medicinesDB = [] } = useAppContext();
  const navigate = useNavigate();
  
  // --- STATES ---
  const [selectedRx, setSelectedRx] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sharing States
  const [showShareModal, setShowShareModal] = useState(false);
  const [rxToShare, setRxToShare] = useState(null);
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [linkedDoctors, setLinkedDoctors] = useState([]); 
  const [loadingDocs, setLoadingDocs] = useState(false);

  // --- QR CODE STATES ---
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(''); 
  const [qrRxDetails, setQrRxDetails] = useState(null);

  // --- 1. FETCH LINKED DOCTORS ---
  useEffect(() => {
    const fetchLinkedDoctors = async () => {
        const token = currentUser?.token || localStorage.getItem('token');
        if (token) {
            try {
                setLoadingDocs(true);
                const { data } = await axios.get('http://localhost:5001/api/auth/my-doctors', {
                    headers: { 'x-auth-token': token }
                });
                if (data.success) {
                    setLinkedDoctors(data.data); 
                }
            } catch (error) {
                console.error("Failed to fetch linked doctors", error);
            } finally {
                setLoadingDocs(false);
            }
        }
    };
    fetchLinkedDoctors();
  }, [currentUser]);

  // Filter Doctors
  const filteredDoctors = linkedDoctors.filter(doc => 
    (doc.name || '').toLowerCase().includes(doctorSearchTerm.toLowerCase()) ||
    (doc.hospitalName || '').toLowerCase().includes(doctorSearchTerm.toLowerCase())
  );

  // --- 2. FILTER & SORT PRESCRIPTIONS (Newest First) ---
  const sortedList = useMemo(() => {
    if (!currentUser) return [];
    const safeList = Array.isArray(prescriptions) ? prescriptions : [];
    
    // Filter for current user
    const myRx = safeList.filter(p => 
      String(p.patientId) === String(currentUser.id || currentUser._id)
    );

    // Sort: Newest to Oldest
    // Assuming 'date' is stored as YYYY-MM-DD or ISO string. 
    // If simply reversing DB order works for you, .reverse() is fine.
    // For safer sorting by date:
    return myRx.sort((a, b) => new Date(b.date) - new Date(a.date)); 
  }, [prescriptions, currentUser]);

  // --- 3. PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedList.length / itemsPerPage);

  const handleNextPage = () => {
      if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
      if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  // --- 4. VALIDITY LOGIC ---
  const checkValidity = (validUntilDate) => {
    if (!validUntilDate) return false; 
    const today = new Date();
    today.setHours(0,0,0,0);
    const expiry = new Date(validUntilDate);
    expiry.setHours(0,0,0,0);
    return expiry >= today;
  };

  const getMedicineName = (id) => {
    if (!medicinesDB || !Array.isArray(medicinesDB)) return id;
    const found = medicinesDB.find(m => m.id === id);
    return found ? found.name : id; 
  };

  // --- HANDLERS ---
  const handleViewClick = (prescription) => {
    setSelectedRx(prescription);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRx(null);
  };

  const handleShareClick = (prescription) => {
    setRxToShare(prescription);
    setDoctorSearchTerm(''); 
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setRxToShare(null);
  };

  // --- QR HANDLERS ---
  const handleQRClick = (prescription) => {
    const qrPayload = JSON.stringify({
        id: prescription.prescriptionId,      
        patient: prescription.patientName,
        hash: prescription.dataHash || "NoHash", 
        validUntil: prescription.validUntil
    });

    setQrData(qrPayload);
    setQrRxDetails(prescription);
    setShowQRModal(true);
  };

  const closeQRModal = () => {
    setShowQRModal(false);
    setQrData('');
  };

  const handleSendToDoctor = (doctor) => {
    closeShareModal();
    navigate('/patient-dashboard/doctor-share', {
      state: {
        activeDoctor: doctor,
        sharedPrescription: rxToShare
      }
    });
  };

  const getDocName = (rx) => {
      if (rx?.doctorId && typeof rx.doctorId === 'object') {
          return rx.doctorId.name || "Unknown Doctor";
      }
      return rx?.doctorName || "Unknown Doctor";
  };

  if (!currentUser) return <div style={{padding:'20px'}}>Loading records...</div>;

  // --- STYLES ---
  const styles = {
    pageContainer: {
        minHeight: '100vh', width: '99%', maxWidth: '100vw', display: 'flex',
        flexDirection: 'column', boxSizing: 'border-box', fontFamily: "'Poppins', sans-serif",
        gap: '20px', paddingBottom: '20px'
    },
    topRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '98%',
        backgroundColor: '#ffffff', padding: '20px', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    headerContent: { display: 'flex', alignItems: 'center', gap: '15px' },
    headerIcon: {
        backgroundColor: '#e0e7ff', color: '#4338ca', padding: '12px',
        borderRadius: '12px', fontSize: '24px', display: 'flex',
    },
    headerTitle: { margin: 0, fontSize: '26px', fontWeight: '700', color: '#1e293b' },
    headerSubtitle: { margin: 0, fontSize: '14px', color: '#64748b' },
    contentPanel: {
        backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0',
        flex: 1, display: 'flex', flexDirection: 'column', width: '100%',
        padding: '30px', boxSizing: 'border-box', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    tableContainer: { width: '100%', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { 
        textAlign: 'left', padding: '16px', background: '#f8fafc', color: '#64748b', 
        fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid #e2e8f0' 
    },
    td: { 
        padding: '16px', borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem', color: '#334155', verticalAlign: 'middle' 
    },
    badge: { 
        padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', 
        display: 'inline-flex', alignItems: 'center', gap:'5px' 
    },
    actionBtnGroup: { display: 'flex', gap: '8px', alignItems: 'center' },
    
    // Pagination Styles
    paginationContainer: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px', marginTop: '20px', paddingRight: '10px' },
    pageBtn: { background: '#f1f5f9', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#475569', transition: '0.2s' },
    pageBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
    pageInfo: { fontSize: '0.9rem', color: '#64748b', fontWeight: '500' },

    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000, backdropFilter: 'blur(2px)'
    },
    modalContent: {
        background: '#ffffff', width: '90%', maxWidth: '750px', maxHeight: '90vh',
        overflowY: 'auto', borderRadius: '12px', padding: '40px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)', fontFamily: "'Georgia', serif"
    },
    shareModalContent: {
        background: '#ffffff', width: '400px', maxWidth: '90%', borderRadius: '12px',
        padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', 
        display: 'flex', flexDirection: 'column', fontFamily: "'Poppins', sans-serif"
    },
    qrModalContent: {
        background: '#ffffff', width: '350px', maxWidth: '90%', borderRadius: '20px',
        padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', 
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        fontFamily: "'Poppins', sans-serif', textAlign: 'center'"
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        .view-btn { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; padding: 6px 12px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 0.8rem; transition: all 0.2s; }
        .view-btn:hover { background: #dbeafe; }
        .share-btn { background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe; width: 36px; height: 36px; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; margin: 0 auto; transition: all 0.2s; }
        .share-btn:hover { background: #7c3aed; color: white; }
        .scan-btn { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 6px 12px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 0.8rem; transition: all 0.2s; }
        .scan-btn:hover { background: #dcfce7; }
        .scan-btn-disabled { background: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0; cursor: not-allowed; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <div style={styles.pageContainer}>
        <div style={styles.topRow}>
            <div style={styles.headerContent}>
                <div style={styles.headerIcon}><FaFilePrescription /></div>
                <div>
                    <h1 style={styles.headerTitle}>My Prescriptions</h1>
                    <p style={styles.headerSubtitle}>Complete Medical History</p>
                </div>
            </div>
        </div>

        <div style={styles.contentPanel}>
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Doctor Name</th>
                            <th style={styles.th}>Diagnosis</th>
                            <th style={styles.th}>Validity Status</th>
                            <th style={{...styles.th, textAlign:'center'}}>QR</th> {/* NEW COLUMN */}
                            <th style={{...styles.th, textAlign:'center'}}>Share</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((p, index) => {
                                const isValid = checkValidity(p.validUntil);
                                const docName = getDocName(p);
                                return (
                                    <tr key={p.id || p.prescriptionId || index}>
                                        <td style={styles.td}>{p.date}</td>
                                        <td style={styles.td}>
                                            <div style={{display:'flex', alignItems:'center', gap:'8px', fontWeight:'500'}}>
                                                <FaUserMd style={{color: '#3b82f6'}}/> Dr. {docName}
                                            </div>
                                        </td>
                                        <td style={styles.td}><strong>{p.diagnosis}</strong></td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.badge, 
                                                backgroundColor: isValid ? '#dcfce7' : '#fee2e2',
                                                color: isValid ? '#166534' : '#991b1b'
                                            }}>
                                                {isValid ? <><FaCheckCircle/> Valid</> : <><FaTimesCircle/> Expired</>}
                                            </span>
                                            <div style={{fontSize:'0.7rem', color:'#64748b', marginTop:'4px'}}>
                                                Until: {p.validUntil || "N/A"}
                                            </div>
                                        </td>
                                        
                                        {/* --- NEW QR COLUMN --- */}
                                        <td style={{...styles.td, textAlign:'center'}}>
                                            {isValid ? (
                                                <button className="scan-btn" onClick={() => handleQRClick(p)} style={{margin:'0 auto'}}>
                                                    <FaQrcode /> QR
                                                </button>
                                            ) : (
                                                <div style={{fontSize:'0.75rem', color:'#94a3b8', fontStyle:'italic'}}>Expired</div>
                                            )}
                                        </td>

                                        {/* --- SHARE COLUMN --- */}
                                        <td style={{...styles.td, textAlign:'center'}}>
                                            <button className="share-btn" onClick={() => handleShareClick(p)} title="Share with Doctor">
                                                <FaShareAlt />
                                            </button>
                                        </td>

                                        {/* --- ACTIONS COLUMN (Now only has View) --- */}
                                        <td style={styles.td}>
                                            <button className="view-btn" onClick={() => handleViewClick(p)}>
                                                <FaEye /> View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" style={{...styles.td, textAlign:'center', color:'#94a3b8', padding:'40px'}}>
                                    No records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- PAGINATION CONTROLS --- */}
            {sortedList.length > itemsPerPage && (
                <div style={styles.paginationContainer}>
                    <button 
                        style={{...styles.pageBtn, ...(currentPage === 1 ? styles.pageBtnDisabled : {})}} 
                        onClick={handlePrevPage} 
                        disabled={currentPage === 1}
                    >
                        <FaChevronLeft /> Prev
                    </button>
                    <span style={styles.pageInfo}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button 
                        style={{...styles.pageBtn, ...(currentPage === totalPages ? styles.pageBtnDisabled : {})}} 
                        onClick={handleNextPage} 
                        disabled={currentPage === totalPages}
                    >
                        Next <FaChevronRight />
                    </button>
                </div>
            )}
        </div>

        {/* --- VIEW MODAL --- */}
        {showModal && selectedRx && (
            <div style={styles.modalOverlay} onClick={closeModal}>
                <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                    <div style={{display:'flex', justifyContent:'space-between', borderBottom:'3px solid black', paddingBottom:'20px', marginBottom:'30px'}}>
                        <div>
                            <h2 style={{margin:0, fontSize:'28px'}}>Dr. {getDocName(selectedRx)}</h2>
                            <p style={{margin:0, color:'#666'}}>{selectedRx.hospitalName || "MediSure Hospital"}</p>
                        </div>
                        <div style={{textAlign:'right'}}>
                            <div style={{fontWeight:'bold'}}>DATE: {selectedRx.date}</div>
                            <div style={{fontWeight:'bold'}}>VALID UNTIL: {selectedRx.validUntil || "N/A"}</div>
                            <button onClick={closeModal} style={{background:'none', border:'none', fontSize:'24px', cursor:'pointer', marginTop:'10px'}}><FaTimes /></button>
                        </div>
                    </div>
                    
                    <div style={{borderBottom:'2px solid black', paddingBottom:'20px', marginBottom:'30px'}}>
                        <div style={{fontSize:'0.85rem', color:'#666', marginBottom:'5px', fontWeight:'bold', textTransform:'uppercase'}}>Diagnosis:</div>
                        <div style={{fontSize:'1.1rem'}}>{selectedRx.diagnosis || "No Diagnosis"}</div>
                    </div>

                    <h3 style={{textAlign:'center', textDecoration:'underline', marginBottom:'20px'}}>Rx (Prescribed Medications)</h3>

                    <table style={{width:'100%', borderCollapse:'collapse', marginBottom:'50px'}}>
                         <thead>
                            <tr style={{borderBottom:'2px solid black', textAlign:'left'}}>
                                <th style={{padding:'10px'}}>MEDICINE</th>
                                <th style={{padding:'10px'}}>QTY</th>
                                <th style={{padding:'10px', textAlign:'right'}}>FREQUENCY</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(selectedRx.medicines || []).map((med, idx) => (
                                <tr key={idx} style={{borderBottom:'1px solid #eee'}}>
                                    <td style={{padding:'15px 10px'}}>
                                        <div style={{fontWeight:'bold'}}>{getMedicineName(med.medicineId)}</div>
                                        <div style={{fontSize:'0.85rem', color:'#666'}}>{med.type}</div>
                                    </td>
                                    <td style={{padding:'15px 10px'}}>{med.quantity}</td>
                                    <td style={{padding:'15px 10px', textAlign:'right'}}>{med.frequency}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{marginTop:'50px', display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
                        <div style={{borderTop:'1px dashed black', paddingTop:'5px', width:'200px', textAlign:'center', fontSize:'0.9rem'}}>
                            Doctor's Signature
                        </div>
                        <button style={{background:'black', color:'white', border:'none', padding:'10px 20px', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                            <FaPrint /> Print
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- SHARE MODAL --- */}
        {showShareModal && (
            <div style={styles.modalOverlay} onClick={closeShareModal}>
                <div style={styles.shareModalContent} onClick={e => e.stopPropagation()}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                        <h3 style={{margin:0, color:'#1e293b'}}>Share Prescription</h3>
                        <button onClick={closeShareModal} style={{background:'none', border:'none', cursor:'pointer', color:'#64748b'}}><FaTimes /></button>
                    </div>
                    <p style={{fontSize:'0.9rem', color:'#64748b', marginBottom:'15px'}}>
                        Select a doctor to share your diagnosis of <strong>{rxToShare?.diagnosis}</strong>.
                    </p>
                    <div style={{position:'relative', marginBottom:'15px'}}>
                        <FaSearch style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8'}}/>
                        <input 
                            type="text" 
                            placeholder="Search your doctors..." 
                            value={doctorSearchTerm}
                            onChange={(e) => setDoctorSearchTerm(e.target.value)}
                            style={{width:'100%', padding:'10px 10px 10px 35px', borderRadius:'8px', border:'1px solid #cbd5e1', boxSizing:'border-box', outline:'none'}}
                        />
                    </div>
                    <div style={{maxHeight:'300px', overflowY:'auto', borderTop:'1px solid #f1f5f9'}}>
                        {loadingDocs ? (
                            <div style={{padding:'20px', textAlign:'center', color:'#94a3b8'}}>Loading...</div>
                        ) : filteredDoctors.length > 0 ? (
                            filteredDoctors.map(doc => (
                                <div key={doc._id || doc.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #f1f5f9'}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                        <div style={{width:'36px', height:'36px', borderRadius:'50%', background:'#e0f2fe', color:'#0284c7', display:'flex', alignItems:'center', justifyContent:'center'}}><FaUserMd/></div>
                                        <div>
                                            <div style={{fontWeight:'600', fontSize:'0.9rem', color:'#334155'}}>Dr. {doc.name}</div>
                                            <div style={{fontSize:'0.8rem', color:'#64748b'}}>{doc.hospitalName || "General"}</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleSendToDoctor(doc)}
                                        style={{background:'#0f172a', color:'white', border:'none', padding:'6px 12px', borderRadius:'6px', cursor:'pointer', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:'5px'}}
                                    >
                                        <FaPaperPlane /> Send
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div style={{padding:'20px', textAlign:'center', color:'#94a3b8', fontSize:'0.9rem'}}>No doctors found.</div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* --- QR CODE DISPLAY MODAL --- */}
        {showQRModal && (
            <div style={styles.modalOverlay} onClick={closeQRModal}>
                <div style={styles.qrModalContent} onClick={e => e.stopPropagation()}>
                    <div style={{display:'flex', justifyContent:'space-between', width:'100%', marginBottom:'20px'}}>
                        <h3 style={{margin:0, color:'#1e293b'}}>Scan Verification</h3>
                        <button onClick={closeQRModal} style={{background:'none', border:'none', cursor:'pointer', fontSize:'18px'}}><FaTimes /></button>
                    </div>

                    <div style={{background:'#fff', padding:'15px', borderRadius:'10px', border:'2px solid #e2e8f0'}}>
                        <QRCode value={qrData} size={200} />
                    </div>

                    <div style={{marginTop:'20px', color:'#64748b', fontSize:'0.9rem', textAlign:'center'}}>
                        <p style={{margin:0}}>Show this QR code to the pharmacist.</p>
                        <p style={{margin:'5px 0 0 0', fontWeight:'600', color:'#334155'}}>
                            ID: #{qrRxDetails?.prescriptionId || '---'}
                        </p>
                    </div>

                    <button 
                        onClick={closeQRModal}
                        style={{
                            marginTop:'25px', width:'100%', padding:'12px', 
                            background:'#1e293b', color:'white', border:'none', 
                            borderRadius:'10px', cursor:'pointer', fontWeight:'600'
                        }}
                    >
                        Done
                    </button>
                </div>
            </div>
        )}
      </div>
    </>
  );
};

export default MyPrescriptions;