import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { 
  FaSearch, FaPaperPlane, FaPaperclip, FaUserMd, FaFilePrescription, 
  FaCheckDouble, FaCircle, FaArrowLeft 
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api'; 

const DoctorShare = () => {
  const { currentUser, prescriptions } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation(); 
  
  // --- STATE ---
  const [myDoctors, setMyDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]); 
  const [showPrescriptionPicker, setShowPrescriptionPicker] = useState(false);
  
  const [hoveredDoctorId, setHoveredDoctorId] = useState(null);

  const chatEndRef = useRef(null);
  const hasAutoShared = useRef(false); 

  // --- 1. FETCH CONNECTED DOCTORS ---
  useEffect(() => {
    const fetchMyDoctors = async () => {
      try {
        const token = currentUser?.token || localStorage.getItem('token');
        if (!token) return;
        
        const { data } = await axios.get(`${API_BASE}/auth/my-doctors`, {
            headers: { 'x-auth-token': token }
        });
        
        if (data.success) {
          setMyDoctors(data.data);
        }
      } catch (error) {
        console.error("Failed to load connected doctors", error);
      }
    };
    fetchMyDoctors();
  }, [currentUser]);

  // --- 2. FETCH CHAT HISTORY ---
  const fetchChatHistory = useCallback(async (doctorId) => {
    try {
        const token = currentUser?.token || localStorage.getItem('token');
        if (!token || !doctorId) return;

        const { data } = await axios.get(`${API_BASE}/messages/${doctorId}`, {
            headers: { 'x-auth-token': token }
        });

        if (data.success) {
            setMessages(data.data);
        }
    } catch (error) {
        console.error("Failed to load chat", error);
    }
  }, [currentUser]);

  // Real-time polling
  useEffect(() => {
      let interval;
      if (selectedDoctor) {
          fetchChatHistory(selectedDoctor._id || selectedDoctor.id);
          interval = setInterval(() => {
             fetchChatHistory(selectedDoctor._id || selectedDoctor.id);
          }, 3000);
      }
      return () => clearInterval(interval);
  }, [selectedDoctor, fetchChatHistory]);


  // --- 3. AUTO-SHARE LOGIC ---
  useEffect(() => {
    if (location.state?.activeDoctor && location.state?.sharedPrescription) {
      const { activeDoctor, sharedPrescription } = location.state;
      
      setSelectedDoctor(activeDoctor);

      const performAutoShare = async () => {
          if (hasAutoShared.current) return; 
          hasAutoShared.current = true;

          try {
            console.log("Auto-sharing prescription...");
            const token = currentUser?.token || localStorage.getItem('token');
            const docId = activeDoctor._id || activeDoctor.id;

            const payload = {
                receiverId: docId,
                type: 'prescription',
                prescriptionData: sharedPrescription
            };

            await axios.post(`${API_BASE}/messages/send`, payload, {
                headers: { 'x-auth-token': token }
            });

            fetchChatHistory(docId);
            window.history.replaceState({}, document.title);

          } catch (error) {
            console.error("Auto-share failed", error);
          }
      };

      performAutoShare();
    }
  }, [location.state, currentUser, fetchChatHistory]);


  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedDoctor]);

  // --- MANUAL SEND HANDLERS ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedDoctor) return;
    
    try {
        const token = currentUser?.token || localStorage.getItem('token');
        const payload = {
            receiverId: selectedDoctor._id || selectedDoctor.id,
            type: 'text',
            content: messageText
        };

        await axios.post(`${API_BASE}/messages/send`, payload, {
            headers: { 'x-auth-token': token }
        });

        setMessageText('');
        fetchChatHistory(selectedDoctor._id || selectedDoctor.id);

    } catch (error) {
        console.error("Failed to send message", error);
    }
  };

  const handleManualSharePrescription = async (prescription) => {
    try {
        const token = currentUser?.token || localStorage.getItem('token');
        const payload = {
            receiverId: selectedDoctor._id || selectedDoctor.id,
            type: 'prescription',
            prescriptionData: prescription 
        };

        await axios.post(`${API_BASE}/messages/send`, payload, {
            headers: { 'x-auth-token': token }
        });

        setShowPrescriptionPicker(false);
        fetchChatHistory(selectedDoctor._id || selectedDoctor.id);

    } catch (error) {
        console.error("Failed to share prescription", error);
    }
  };

  const isMe = (msg) => {
      const myId = currentUser?.id || currentUser?._id;
      return String(msg.sender) === String(myId);
  };

  // --- INTERNAL STYLES ---
  const styles = {
    // 1. PAGE CONTAINER
    pageContainer: { 
        height: 'calc(100vh - 60px)', 
        width: '100%', 
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
        width: '100%', 
        backgroundColor: '#ffffff', 
        padding: '20px', 
        borderRadius: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', 
        flexShrink: 0,
        boxSizing: 'border-box'
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
        width: '100%',
        backgroundColor: '#ffffff', 
        borderRadius: '20px',       
        padding: '20px',            
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        boxSizing: 'border-box'
    },

    // 4. INNER SEPARATOR (Grey BG)
    innerWrapper: {
        flex: 1,
        display: 'flex',
        gap: '20px',
        backgroundColor: '#f8fafc', 
        borderRadius: '16px',
        padding: '15px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        width: '100%',
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
        flexShrink: 0
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
    chatHeader: { padding: '15px 25px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', zIndex: 10 },
    messagesBox: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' },
    
    bubble: { maxWidth: '70%', padding: '12px 18px', borderRadius: '12px', fontSize: '14px', lineHeight: '1.5', position: 'relative', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
    bubbleMe: { alignSelf: 'flex-end', backgroundColor: '#dcfce7', color: '#14532d', borderBottomRightRadius: '2px' },
    bubbleDoc: { alignSelf: 'flex-start', backgroundColor: 'white', color: '#334155', borderBottomLeftRadius: '2px', border: '1px solid #e2e8f0' },
    
    presCard: { background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '5px', display: 'flex', gap: '10px', alignItems: 'center' },
    chatFooter: { padding: '15px 20px', backgroundColor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', alignItems: 'center' },
    input: { flex: 1, padding: '12px 15px', borderRadius: '25px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' },
    iconBtn: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', transition: '0.2s' },
    
    modalOverlay: { position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    pickerBox: { background: 'white', width: '450px', maxHeight: '80vh', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column' }
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`}</style>

      <div style={styles.pageContainer}>
        {/* HEADER */}
        <div style={styles.topRow}>
          <div style={styles.headerContent}>
            <div style={styles.headerIcon}><FaPaperPlane /></div>
            <div>
              <h1 style={styles.headerTitle}>Share Prescriptions</h1>
              <p style={styles.headerSubtitle}>Connect and share records with your doctors</p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/patient-dashboard')} 
            style={{
                background:'black', color: 'white', border:'none', 
                padding:'10px 20px', borderRadius:'8px', cursor:'pointer', 
                display:'flex', alignItems:'center', gap:'8px',
                fontWeight: '600', fontSize: '14px'
            }}
          > 
             <FaArrowLeft style={{fontSize: '12px'}}/> Dashboard
          </button>
        </div>

        {/* COMMON OUTER WRAPPER */}
        <div style={styles.contentPanel}>
            
            {/* INNER GREY SEPARATOR */}
            <div style={styles.innerWrapper}>

                {/* SIDEBAR */}
                <div style={styles.sidebar}>
                    <div style={styles.sidebarHeader}>
                        <div style={styles.searchBox}>
                            <FaSearch style={{color:'#94a3b8', marginRight:'10px'}} />
                            <input placeholder="Search doctors..." style={{border:'none', background:'transparent', outline:'none', width:'100%'}} />
                        </div>
                    </div>
                    <div style={styles.contactList}>
                        {myDoctors.length === 0 ? (
                            <div style={{padding:'30px', textAlign:'center', color:'#94a3b8', fontSize:'13px'}}>No doctors have added you yet.</div>
                        ) : (
                            myDoctors.map(doc => {
                                const dId = doc._id || doc.id;
                                const isSelected = (selectedDoctor?._id || selectedDoctor?.id) === dId;
                                const isHovered = hoveredDoctorId === dId;
                                
                                return (
                                    <div 
                                        key={dId} 
                                        onMouseEnter={() => setHoveredDoctorId(dId)}
                                        onMouseLeave={() => setHoveredDoctorId(null)}
                                        onClick={() => setSelectedDoctor(doc)}
                                        style={{
                                            ...styles.contactItem, 
                                            backgroundColor: isSelected 
                                                ? '#eff6ff' 
                                                : isHovered 
                                                    ? '#f1f5f9' 
                                                    : 'transparent'
                                        }} 
                                    >
                                        <div style={styles.avatar}><FaUserMd /></div>
                                        <div>
                                            <div style={{fontWeight:'600', fontSize:'14px', color:'#334155'}}>{doc.name}</div>
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
                    {selectedDoctor ? (
                        <>
                            <div style={styles.chatHeader}>
                                <div style={styles.avatar}><FaUserMd /></div>
                                <div>
                                    <div style={{fontWeight:'700', color:'#1e293b'}}>{selectedDoctor.name}</div>
                                    <div style={{fontSize:'12px', color:'#10b981', display:'flex', alignItems:'center', gap:'5px'}}><FaCircle style={{fontSize:'8px'}} /> Online</div>
                                </div>
                            </div>
                            <div style={styles.messagesBox}>
                                {messages.length === 0 && (
                                    <div style={{textAlign:'center', fontSize:'12px', color:'#94a3b8', margin:'10px 0'}}>This is the start of your encrypted conversation.</div>
                                )}
                                
                                {messages.map((msg, idx) => {
                                    const fromMe = isMe(msg);
                                    return (
                                        <div key={idx} style={{...styles.bubble, ...(fromMe ? styles.bubbleMe : styles.bubbleDoc)}}>
                                            {msg.type === 'text' && <span>{msg.content}</span>}
                                            {msg.type === 'prescription' && (
                                                <div>
                                                    <div style={{fontWeight:'600', marginBottom:'5px', display:'flex', alignItems:'center', gap:'5px', fontSize: '13px'}}><FaFilePrescription /> Shared Prescription</div>
                                                    <div style={styles.presCard}>
                                                        <div style={{background:'#f1f5f9', padding:'8px', borderRadius:'6px'}}><FaFilePrescription style={{color:'#4338ca', fontSize:'20px'}} /></div>
                                                        <div>
                                                            <div style={{fontWeight:'600', fontSize:'13px'}}>Dr. {msg.prescriptionData?.doctorName || 'Unknown'}</div>
                                                            <div style={{fontSize:'11px', color:'#64748b'}}>{msg.prescriptionData?.date} • {msg.prescriptionData?.medicines?.length} Meds</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div style={{fontSize:'10px', textAlign:'right', marginTop:'5px', opacity:0.7, display:'flex', justifyContent:'flex-end', alignItems:'center', gap:'4px'}}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} {fromMe && <FaCheckDouble />}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>
                            <form style={styles.chatFooter} onSubmit={handleSendMessage}>
                                <button type="button" style={{...styles.iconBtn, background:'#f1f5f9', color:'#475569'}} onClick={() => setShowPrescriptionPicker(true)} title="Share Prescription"><FaPaperclip /></button>
                                <input style={styles.input} placeholder="Type a message..." value={messageText} onChange={e => setMessageText(e.target.value)} />
                                <button type="submit" style={{...styles.iconBtn, background:'#0f172a', color:'white'}}><FaPaperPlane /></button>
                            </form>
                        </>
                    ) : (
                        <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#94a3b8'}}>
                             <div style={{fontSize:'48px', opacity:0.3, marginBottom:'20px'}}><FaPaperPlane /></div>
                             <h3>Select a doctor to start sharing</h3>
                        </div>
                    )}
                </div>

            </div>
        </div>
        
        {/* MODAL */}
        {showPrescriptionPicker && (
            <div style={styles.modalOverlay} onClick={() => setShowPrescriptionPicker(false)}>
                <div style={styles.pickerBox} onClick={e => e.stopPropagation()}>
                    <h3 style={{marginTop:0, color:'#1e293b'}}>Select Prescription to Share</h3>
                    <div style={{flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'10px', paddingRight:'5px'}}>
                        {prescriptions.map(p => (
                            <div key={p.id} onClick={() => handleManualSharePrescription(p)} style={{padding:'15px', border:'1px solid #e2e8f0', borderRadius:'10px', cursor:'pointer', display:'flex', alignItems:'center', gap:'15px', transition: 'background 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                                <div style={{background:'#e0e7ff', width:'40px', height:'40px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#4338ca'}}><FaFilePrescription /></div>
                                <div><div style={{fontWeight:'600', fontSize:'14px', color:'#1e293b'}}>Dr. {p.doctorName}</div><div style={{fontSize:'12px', color:'#64748b'}}>{p.date} • {p.diagnosis}</div></div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setShowPrescriptionPicker(false)} style={{marginTop:'15px', padding:'10px', border:'none', background:'#f1f5f9', borderRadius:'8px', cursor:'pointer', fontWeight:'600', color:'#475569'}}>Cancel</button>
                </div>
            </div>
        )}
      </div>
    </>
  );
};

export default DoctorShare;