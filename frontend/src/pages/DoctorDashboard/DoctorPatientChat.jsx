import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../hooks/useAppContext'; 
import axios from 'axios';
import { 
  FaSearch, FaUserInjured, FaFilePrescription, 
  FaCircle, FaStethoscope,
  FaPaperPlane, FaTimes, FaPrint, FaEye, FaClinicMedical, FaArrowLeft
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5001/api';

const DoctorPatientChat = () => {
  const { currentUser, medicinesDB } = useAppContext();
  const navigate = useNavigate();
  
  // --- STATE ---
  const [myPatients, setMyPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [chatHistory, setChatHistory] = useState([]); 
  const [messageText, setMessageText] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  
  // [NEW] State to track which patient is being hovered
  const [hoveredPatientId, setHoveredPatientId] = useState(null);
  
  // Modal State
  const [showRxModal, setShowRxModal] = useState(false);
  const [viewRx, setViewRx] = useState(null);

  const chatEndRef = useRef(null);

  // --- 1. FETCH CONNECTED PATIENTS ---
  useEffect(() => {
    const fetchMyPatients = async () => {
      try {
        const token = currentUser?.token || localStorage.getItem('token');
        if (!token) return;

        const { data } = await axios.get(`${API_BASE}/auth/patient-history/${currentUser.id || currentUser._id}`, {
            headers: { 'x-auth-token': token }
        });

        const patientsList = Array.isArray(data) ? data : (data.data || []);
        setMyPatients(patientsList);

      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };
    
    if (currentUser) fetchMyPatients();
  }, [currentUser]);

  // --- 2. FETCH CHAT HISTORY ---
  const fetchMessages = async () => {
    if (!selectedPatient) return;
    
    try {
      const token = currentUser?.token || localStorage.getItem('token');
      const patientId = selectedPatient._id || selectedPatient.id;

      const { data } = await axios.get(`${API_BASE}/messages/${patientId}`, {
          headers: { 'x-auth-token': token }
      });

      if (data.success) {
          setChatHistory(data.data);
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
    }
  };

  useEffect(() => {
    if (selectedPatient) {
        setLoadingChat(true);
        fetchMessages().finally(() => setLoadingChat(false));
        const interval = setInterval(fetchMessages, 3000); 
        return () => clearInterval(interval);
    }
  }, [selectedPatient]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, selectedPatient]);

  // --- 3. SEND MESSAGE ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedPatient) return;

    try {
        const token = currentUser?.token || localStorage.getItem('token');
        const patientId = selectedPatient._id || selectedPatient.id;

        const payload = {
            receiverId: patientId,
            type: 'text',
            content: messageText
        };

        await axios.post(`${API_BASE}/messages/send`, payload, {
            headers: { 'x-auth-token': token }
        });

        setMessageText('');
        fetchMessages(); 

    } catch (error) {
        console.error("Failed to send message", error);
    }
  };

  // --- 4. VIEW RX & HELPERS ---
  const handleViewRx = (rxData) => {
      setViewRx(rxData);
      setShowRxModal(true);
  };

  const getMedicineName = (id) => {
    const med = medicinesDB.find(m => m.id === id);
    return med ? med.name : id;
  };

  const isMe = (msg) => {
      const myId = currentUser?.id || currentUser?._id;
      return String(msg.sender) === String(myId);
  };

  const getDoctorName = (rx) => {
      if (!rx) return "Unknown";
      if (rx.doctorName) return rx.doctorName;
      if (rx.doctorId && typeof rx.doctorId === 'object' && rx.doctorId.name) return rx.doctorId.name;
      return "Unknown Doctor";
  };

  const getHospitalName = (rx) => {
      if (!rx) return "General Medical Center";
      if (rx.doctorId && typeof rx.doctorId === 'object' && rx.doctorId.hospitalName) return rx.doctorId.hospitalName;
      return "General Medical Center";
  };

  // --- STYLES ---
  // --- STYLES ---
  const styles = {
    // 1. PAGE CONTAINER
    pageContainer: { 
        height: 'calc(100vh - 60px)', // Adjusted to fit within layout padding
        width: '100%',                 // [CHANGED] Use 100% instead of 99%
        // maxWidth: '100vw',          // [REMOVED] This caused the overflow/clipping
        display: 'flex', 
        flexDirection: 'column', 
        boxSizing: 'border-box', 
        fontFamily: "'Poppins', sans-serif", 
        gap: '20px', 
        overflow: 'hidden' 
    },
    
    // 2. HEADER
    topRow: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        width: '100%',                 // [CHANGED] Ensure full width
        backgroundColor: '#ffffff', 
        padding: '20px', 
        borderRadius: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', 
        flexShrink: 0,
        boxSizing: 'border-box'        // Added to ensure padding doesn't increase width
    },
    
    headerContent: { display: 'flex', alignItems: 'center', gap: '15px' },
    headerIcon: { backgroundColor: '#e0e7ff', color: '#4338ca', padding: '12px', borderRadius: '12px', fontSize: '24px', display: 'flex' },
    headerTitle: { margin: 0, fontSize: '26px', fontWeight: '700', color: '#1e293b' },
    headerSubtitle: { margin: 0, fontSize: '14px', color: '#64748b' },

    // 3. COMMON OUTER CONTAINER
    contentPanel: { 
        flex: 1, 
        display: 'flex', 
        gap: '20px', 
        overflow: 'hidden', 
        width: '100%',                 // [CHANGED] Ensure full width
        backgroundColor: '#ffffff', 
        borderRadius: '20px',       
        padding: '20px',            
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        boxSizing: 'border-box'        // Added safety
    },

    // 4. INNER SEPARATOR
    innerWrapper: {
        flex: 1,
        display: 'flex',
        gap: '20px',
        backgroundColor: '#f8fafc', 
        borderRadius: '16px',
        padding: '15px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        width: '100%',                 // Ensure it fills the parent
        boxSizing: 'border-box'
    },

    // 5. SIDEBAR
    sidebar: { 
        width: '320px', 
        backgroundColor: '#ffffff', 
        borderRadius: '12px', 
        border: '1px solid #cbd5e1', 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        flexShrink: 0                  // Prevent sidebar from squishing
    },
    sidebarHeader: { padding: '20px', borderBottom: '1px solid #f1f5f9' },
    searchBox: { display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '10px', padding: '10px 15px', border: '1px solid #cbd5e1' },
    contactList: { flex: 1, overflowY: 'auto' },
    contactItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', cursor: 'pointer', transition: 'background 0.2s', borderBottom: '1px solid #f8fafc' },
    avatar: { width: '45px', height: '45px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 },

    // 6. CHAT AREA
    chatArea: { 
        flex: 1, 
        backgroundColor: '#ffffff', 
        borderRadius: '12px', 
        border: '1px solid #cbd5e1', 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden', 
        backgroundImage: 'radial-gradient(#f1f5f9 1px, transparent 1px)', 
        backgroundSize: '20px 20px' 
    },
    // ... rest of your styles (chatHeader, messagesBox, etc.) remain the same
    chatHeader: { padding: '15px 25px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', zIndex: 10 },
    messagesBox: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' },
    bubble: { maxWidth: '70%', padding: '12px 18px', borderRadius: '12px', fontSize: '14px', lineHeight: '1.5', position: 'relative', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
    bubbleMe: { alignSelf: 'flex-end', backgroundColor: '#dbeafe', color: '#1e3a8a', borderBottomRightRadius: '2px' }, 
    bubblePatient: { alignSelf: 'flex-start', backgroundColor: 'white', color: '#334155', borderBottomLeftRadius: '2px', border: '1px solid #e2e8f0' }, 
    presCard: { background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' },
    chatFooter: { padding: '15px 20px', backgroundColor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', alignItems: 'center' },
    input: { flex: 1, padding: '12px 15px', borderRadius: '25px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' },
    iconBtn: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', transition: '0.2s', background: '#0f172a', color: 'white' },
    
    modalOverlay: { position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    rxPaper: { backgroundColor: 'white', width: '800px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', fontFamily: "'Times New Roman', serif", color: 'black', position: 'relative' }
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`}</style>

      <div style={styles.pageContainer}>
        
        {/* --- HEADER --- */}
        <div style={styles.topRow}>
          <div style={styles.headerContent}>
            <div style={styles.headerIcon}><FaStethoscope /></div>
            <div>
              <h1 style={styles.headerTitle}>Patient Messages</h1>
              <p style={styles.headerSubtitle}>Communication & Shared Records</p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/doctor-dashboard')} 
            style={{
                background:'black', color:'white', border:'none', 
                padding:'10px 20px', borderRadius:'8px', cursor:'pointer', 
                fontWeight: '600', fontSize: '14px', display:'flex', alignItems:'center', gap:'8px'
            }}
          >
              <FaArrowLeft style={{fontSize:'12px'}}/> Dashboard
          </button>
        </div>

        {/* --- CONTENT PANEL --- */}
        <div style={styles.contentPanel}>
            
            {/* Inner Wrapper for visual separation */}
            <div style={styles.innerWrapper}>

                {/* SIDEBAR: PATIENTS */}
                <div style={styles.sidebar}>
                    <div style={styles.sidebarHeader}>
                        <div style={styles.searchBox}>
                            <FaSearch style={{color:'#94a3b8', marginRight:'10px'}} />
                            <input placeholder="Search patients..." style={{border:'none', background:'transparent', outline:'none', width:'100%'}} />
                        </div>
                    </div>
                    <div style={styles.contactList}>
                        {myPatients.length === 0 ? (
                            <div style={{padding:'30px', textAlign:'center', color:'#94a3b8', fontSize:'13px'}}>
                                No linked patients found. <br/> Add patients via 'Patient History'.
                            </div>
                        ) : (
                            myPatients.map(patient => {
                                const pId = patient._id || patient.id;
                                const isSelected = (selectedPatient?._id || selectedPatient?.id) === pId;
                                const isHovered = hoveredPatientId === pId;

                                return (
                                    <div 
                                        key={pId}
                                        onMouseEnter={() => setHoveredPatientId(pId)}
                                        onMouseLeave={() => setHoveredPatientId(null)}
                                        onClick={() => setSelectedPatient(patient)}
                                        style={{
                                            ...styles.contactItem, 
                                            backgroundColor: isSelected 
                                                ? '#eff6ff' 
                                                : isHovered 
                                                    ? '#f1f5f9' 
                                                    : 'transparent'
                                        }}
                                    >
                                        <div style={styles.avatar}><FaUserInjured /></div>
                                        <div>
                                            <div style={{fontWeight:'600', fontSize:'14px', color:'#334155'}}>{patient.name}</div>
                                            <div style={{fontSize:'12px', color:'#64748b'}}>Tap to chat</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* CHAT AREA */}
                <div style={styles.chatArea}>
                    {selectedPatient ? (
                        <>
                            <div style={styles.chatHeader}>
                                <div style={styles.avatar}><FaUserInjured /></div>
                                <div>
                                    <div style={{fontWeight:'700', color:'#1e293b'}}>{selectedPatient.name}</div>
                                    <div style={{fontSize:'12px', color:'#10b981', display:'flex', alignItems:'center', gap:'5px'}}>
                                        <FaCircle style={{fontSize:'8px'}} /> Online
                                    </div>
                                </div>
                            </div>

                            <div style={styles.messagesBox}>
                                {loadingChat && chatHistory.length === 0 && (
                                    <div style={{textAlign:'center', padding:'20px', color:'#94a3b8'}}>Loading history...</div>
                                )}
                                
                                {chatHistory.map((msg, idx) => {
                                    const fromMe = isMe(msg);
                                    return (
                                        <div key={idx} style={{...styles.bubble, ...(fromMe ? styles.bubbleMe : styles.bubblePatient)}}>
                                            
                                            {msg.type === 'text' && <span>{msg.content}</span>}

                                            {msg.type === 'prescription' && msg.prescriptionData && (
                                                <div>
                                                    <div style={{fontSize:'12px', fontWeight:'600', marginBottom:'5px', display:'flex', alignItems:'center', gap:'5px'}}>
                                                        <FaFilePrescription /> Shared Prescription
                                                    </div>
                                                    <div style={{...styles.presCard, borderLeft: '4px solid #f59e0b'}}>
                                                        <div style={{background: '#fff7ed', width:'40px', height:'40px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color: '#ea580c', flexShrink:0}}>
                                                            <FaFilePrescription />
                                                        </div>
                                                        <div style={{width:'100%'}}>
                                                            <div style={{fontWeight:'700', fontSize:'14px', color:'#1e293b'}}>Dr. {getDoctorName(msg.prescriptionData)}</div>
                                                            <div style={{fontSize:'12px', color:'#64748b', marginBottom:'8px'}}>{msg.prescriptionData.date}</div>
                                                            <button 
                                                                onClick={() => handleViewRx(msg.prescriptionData)}
                                                                style={{
                                                                    background:'#0f172a', color:'white', border:'none', 
                                                                    padding:'6px 12px', borderRadius:'6px', cursor:'pointer', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px'
                                                                }}
                                                            >
                                                                <FaEye /> View Details
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{fontSize:'10px', textAlign:'right', marginTop:'5px', opacity:0.7}}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>

                            <form style={styles.chatFooter} onSubmit={handleSendMessage}>
                                <input 
                                    style={styles.input} 
                                    placeholder="Type a message..." 
                                    value={messageText} 
                                    onChange={e => setMessageText(e.target.value)} 
                                />
                                <button type="submit" style={styles.iconBtn}><FaPaperPlane /></button>
                            </form>
                        </>
                    ) : (
                        <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#94a3b8'}}>
                            <div style={{fontSize:'48px', opacity:0.3, marginBottom:'20px'}}><FaUserInjured /></div>
                            <h3>Select a patient to chat</h3>
                        </div>
                    )}
                </div>

            </div>
        </div>

        {/* --- VIEW RX MODAL --- */}
        {showRxModal && viewRx && (
            <div style={styles.modalOverlay} onClick={() => setShowRxModal(false)}>
                <div style={styles.rxPaper} onClick={e => e.stopPropagation()}>
                    <button onClick={() => setShowRxModal(false)} style={{position:'absolute', top:'20px', right:'20px', background:'none', border:'none', fontSize:'20px', cursor:'pointer'}}><FaTimes /></button>
                    
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'30px', borderBottom:'3px solid black', paddingBottom:'20px'}}>
                        <div>
                            <h2 style={{margin:0, fontSize:'28px', color:'#1e293b'}}>Dr. {getDoctorName(viewRx)}</h2>
                            <p style={{margin:'5px 0 0 0', color:'#666', fontStyle:'italic', display:'flex', alignItems:'center', gap:'5px'}}>
                                <FaClinicMedical /> {getHospitalName(viewRx)}
                            </p>
                        </div>
                        <div style={{textAlign:'right'}}>
                            <div style={{marginBottom:'5px'}}><strong>DATE:</strong> {viewRx.date}</div>
                            <div><strong>VALID UNTIL:</strong> {viewRx.validUntil || "N/A"}</div>
                        </div>
                    </div>

                    <div style={{backgroundColor:'#f8fafc', padding:'15px', borderTop:'1px solid #000', borderBottom:'1px solid #000', marginBottom:'30px'}}>
                        <div><strong style={{fontSize:'12px', color:'#666'}}>DIAGNOSIS:</strong> <br/><span style={{fontSize:'18px'}}>{viewRx.diagnosis}</span></div>
                    </div>

                    <h3 style={{textDecoration:'underline', textAlign:'center', marginBottom:'20px'}}>Rx (Prescribed Medications)</h3>
                    <table style={{width:'100%', borderCollapse:'collapse', marginBottom:'40px'}}>
                        <thead><tr style={{borderBottom:'2px solid black'}}><th style={{textAlign:'left', padding:'10px'}}>MEDICINE</th><th style={{textAlign:'center', padding:'10px'}}>QTY</th><th style={{textAlign:'right', padding:'10px'}}>FREQUENCY</th></tr></thead>
                        <tbody>
                             {viewRx.medicines && viewRx.medicines.map((med, idx) => (
                                <tr key={idx} style={{borderBottom:'1px solid #e2e8f0'}}>
                                    <td style={{padding:'12px 10px', fontWeight:'bold'}}>{getMedicineName(med.medicineId)}<br/><small style={{fontWeight:'normal'}}>{med.type}</small></td>
                                    <td style={{padding:'12px 10px', textAlign:'center'}}>{med.quantity}</td>
                                    <td style={{padding:'12px 10px', textAlign:'right', fontFamily:'monospace'}}>{med.frequency}</td>
                                </tr>
                             ))}
                        </tbody>
                    </table>

                    <div style={{display:'flex', justifyContent:'space-between', marginTop:'50px', alignItems:'flex-end'}}>
                         <div style={{borderTop:'1px dashed black', width:'200px', textAlign:'center', paddingTop:'5px'}}>Doctor's Signature</div>
                         <button onClick={() => window.print()} style={{backgroundColor:'black', color:'white', border:'none', padding:'10px 20px', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px'}}><FaPrint /> Print</button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </>
  );
};

export default DoctorPatientChat;