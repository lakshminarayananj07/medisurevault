import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { FaCalendarCheck, FaPills, FaClock, FaCheckCircle, FaPlus, FaTrash, FaTimes, FaBell } from 'react-icons/fa';

const MedicalReminders = () => {
  const { currentUser } = useAppContext();

  // --- 1. SMART INITIALIZATION ---
  const [reminders, setReminders] = useState(() => {
    const savedData = localStorage.getItem('myMedicalReminders');
    if (!savedData) return [];
    const parsedData = JSON.parse(savedData);
    const todayStr = new Date().toDateString();
    return parsedData.map(item => {
      if (item.lastTakenDate !== todayStr) {
        return { ...item, status: 'Pending', alerted: false };
      }
      return item;
    });
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAlarmModal, setShowAlarmModal] = useState(null);

  const [newReminder, setNewReminder] = useState({
    medicine: '', type: 'Tablet', quantity: '', time: '', instruction: ''
  });

  // --- 2. SAVE TO LOCAL STORAGE ---
  useEffect(() => {
    localStorage.setItem('myMedicalReminders', JSON.stringify(reminders));
  }, [reminders]);

  // --- 3. LIVE CLOCK ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      reminders.forEach(item => {
        if (item.time === currentTime && item.status === 'Pending' && !item.alerted) {
          triggerAlarm(item);
        }
      });
    }, 10000);
    return () => clearInterval(timer);
  }, [reminders]);

  const triggerAlarm = (item) => {
    setShowAlarmModal(item);
    setReminders(prev => prev.map(r => r.id === item.id ? { ...r, alerted: true } : r));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReminder({ ...newReminder, [name]: value });
  };

  const saveReminder = (e) => {
    e.preventDefault();
    if(!newReminder.medicine || !newReminder.time) {
      alert("Please fill in Medicine Name and Time");
      return;
    }
    const reminderToAdd = {
      id: Date.now(),
      ...newReminder,
      status: 'Pending',
      alerted: false,
      lastTakenDate: null
    };
    setReminders([...reminders, reminderToAdd]);
    setShowAddModal(false);
    setNewReminder({ medicine: '', type: 'Tablet', quantity: '', time: '', instruction: '' });
  };

  const toggleStatus = (id) => {
    const todayStr = new Date().toDateString();
    setReminders(prev => prev.map(item => {
      if (item.id === id) {
        const newStatus = item.status === 'Pending' ? 'Taken' : 'Pending';
        return {
          ...item,
          status: newStatus,
          lastTakenDate: newStatus === 'Taken' ? todayStr : null
        };
      }
      return item;
    }));
  };

  const deleteReminder = (id) => {
    setReminders(prev => prev.filter(item => item.id !== id));
  };

  const formatTimeDisplay = (time24) => {
    if(!time24) return "";
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  if (!currentUser) return <div style={{padding:'20px'}}>Loading...</div>;

  // --- INTERNAL STYLES (Matching Standards) ---
  const styles = {
    // 1. Page Container
    pageContainer: {
        minHeight: '100vh',
        width: '99%',
        maxWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        fontFamily: "'Poppins', sans-serif",
        gap: '20px',
        paddingBottom: '20px'
    },
    // 2. Header
    topRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '98%',
        backgroundColor: '#ffffff', 
        padding: '20px',            
        borderRadius: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    headerContent: { display: 'flex', alignItems: 'center', gap: '15px' },
    headerIcon: {
        backgroundColor: '#e0e7ff', color: '#4338ca', padding: '12px',
        borderRadius: '12px', fontSize: '24px', display: 'flex',
    },
    headerTitle: { margin: 0, fontSize: '26px', fontWeight: '700', color: '#1e293b' },
    headerSubtitle: { margin: 0, fontSize: '14px', color: '#64748b' },

    // 3. Content Panel
    contentPanel: {
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        padding: '30px',
        boxSizing: 'border-box',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },

    // 4. Table Styles
    tableContainer: { width: '100%', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { 
        textAlign: 'left', padding: '16px', background: '#f8fafc', color: '#64748b', 
        fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid #e2e8f0' 
    },
    td: { 
        padding: '16px', borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem', color: '#334155', verticalAlign: 'middle' 
    },

    // 5. Buttons & Badges
    actionBtn: {
        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
        borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer',
        fontSize: '14px', fontFamily: 'inherit', backgroundColor: '#0f172a', color: 'white'
    },
    btnMark: { background: '#eff6ff', color: '#2563eb', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor:'pointer', fontWeight:'600' },
    btnUndo: { background: '#f1f5f9', color: '#64748b', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor:'pointer', fontWeight:'600' },
    btnDelete: { background: '#fee2e2', color: '#ef4444', border: 'none', width:'36px', height:'36px', borderRadius:'6px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },

    badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap:'5px' },
    badgePending: { background: '#fff7ed', color: '#ea580c', border: '1px solid #ffedd5' },
    badgeTaken: { background: '#dcfce7', color: '#166534', border: '1px solid #dcfce7' },

    // 6. Modals & Forms
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000, backdropFilter: 'blur(2px)'
    },
    modalContent: {
        background: '#ffffff', width: '90%', maxWidth: '500px',
        borderRadius: '12px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        fontFamily: "'Poppins', sans-serif"
    },
    input: {
        width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1',
        fontSize: '1rem', background: '#f8fafc', color: '#334155', boxSizing: 'border-box', marginBottom: '15px'
    },
    label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`}</style>

      <div style={styles.pageContainer}>
        
        {/* HEADER */}
        <div style={styles.topRow}>
            <div style={styles.headerContent}>
                <div style={styles.headerIcon}><FaCalendarCheck /></div>
                <div>
                    <h1 style={styles.headerTitle}>Medical Reminders</h1>
                    <p style={styles.headerSubtitle}>Set alarms for your medications</p>
                </div>
            </div>
            
            <button style={styles.actionBtn} onClick={() => setShowAddModal(true)}>
                <FaPlus /> Set New Reminder
            </button>
        </div>

        {/* CONTENT PANEL */}
        <div style={styles.contentPanel}>
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Medicine</th>
                            <th style={styles.th}>Type & Dosage</th>
                            <th style={styles.th}>Time</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Action</th>
                            <th style={styles.th}>Remove</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reminders.length > 0 ? (
                            reminders.map((item) => (
                                <tr key={item.id} style={{ opacity: item.status === 'Taken' ? 0.6 : 1 }}>
                                    <td style={styles.td}>
                                        <strong>{item.medicine}</strong><br/>
                                        <small style={{color:'#64748b'}}>{item.instruction}</small>
                                    </td>
                                    <td style={styles.td}>{item.quantity} {item.type === 'Syrup' ? 'ml' : 'tabs'}</td>
                                    <td style={styles.td}>
                                        <div style={{display:'flex', alignItems:'center', gap:'6px', fontWeight:'600', color:'#2563eb'}}>
                                            <FaClock /> {formatTimeDisplay(item.time)}
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        {item.status === 'Taken' ? (
                                            <span style={{...styles.badge, ...styles.badgeTaken}}><FaCheckCircle/> Taken</span>
                                        ) : (
                                            <span style={{...styles.badge, ...styles.badgePending}}><FaClock/> Pending</span>
                                        )}
                                    </td>
                                    <td style={styles.td}>
                                        <button 
                                            onClick={() => toggleStatus(item.id)} 
                                            style={item.status === 'Taken' ? styles.btnUndo : styles.btnMark}
                                        >
                                            {item.status === 'Taken' ? 'Undo' : 'Mark Done'}
                                        </button>
                                    </td>
                                    <td style={styles.td}>
                                        <button onClick={() => deleteReminder(item.id)} style={styles.btnDelete}>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{...styles.td, textAlign:'center', color:'#94a3b8', padding:'40px'}}>
                                    No reminders set. Click "Set New Reminder" to add one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* --- ADD MODAL --- */}
        {showAddModal && (
            <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
                <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                        <h2 style={{margin:0, color:'#1e293b'}}>Set Medicine Reminder</h2>
                        <button onClick={() => setShowAddModal(false)} style={{background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer'}}><FaTimes/></button>
                    </div>
                    
                    <form onSubmit={saveReminder}>
                        <div style={{marginBottom:'15px'}}>
                            <label style={styles.label}>Medicine Name</label>
                            <input type="text" name="medicine" value={newReminder.medicine} onChange={handleInputChange} style={styles.input} placeholder="e.g. Paracetamol" required />
                        </div>
                        
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                            <div>
                                <label style={styles.label}>Type</label>
                                <select name="type" value={newReminder.type} onChange={handleInputChange} style={styles.input}>
                                    <option value="Tablet">Tablet</option>
                                    <option value="Syrup">Syrup</option>
                                </select>
                            </div>
                            <div>
                                <label style={styles.label}>Quantity</label>
                                <input type="number" name="quantity" value={newReminder.quantity} onChange={handleInputChange} style={styles.input} placeholder="e.g. 1" />
                            </div>
                        </div>

                        <div style={{marginBottom:'15px'}}>
                            <label style={styles.label}>Time</label>
                            <input type="time" name="time" value={newReminder.time} onChange={handleInputChange} style={styles.input} required />
                        </div>

                        <div style={{marginBottom:'15px'}}>
                            <label style={styles.label}>Instructions (Optional)</label>
                            <input type="text" name="instruction" value={newReminder.instruction} onChange={handleInputChange} style={styles.input} placeholder="e.g. After Food" />
                        </div>

                        <button type="submit" style={{...styles.actionBtn, width:'100%', justifyContent:'center', padding:'14px'}}>
                            Save Reminder
                        </button>
                    </form>
                </div>
            </div>
        )}

        {/* --- ALARM MODAL --- */}
        {showAlarmModal && (
            <div style={styles.modalOverlay}>
                <div style={{...styles.modalContent, textAlign:'center', maxWidth:'400px'}}>
                    <div style={{fontSize:'3.5rem', color:'#f59e0b', marginBottom:'15px'}}>
                        <FaBell />
                    </div>
                    <h2 style={{color:'#1e293b', margin:'0 0 10px 0'}}>Time to take medicine!</h2>
                    
                    <div style={{background:'#fef3c7', padding:'15px', borderRadius:'8px', margin:'20px 0', border:'1px solid #fde68a'}}>
                        <strong style={{fontSize:'1.2rem', color:'#92400e'}}>{showAlarmModal.medicine}</strong><br/>
                        <span style={{color:'#b45309'}}>{showAlarmModal.quantity} {showAlarmModal.type === 'Syrup' ? 'ml' : 'tabs'}</span>
                        {showAlarmModal.instruction && <div style={{marginTop:'5px', fontStyle:'italic', fontSize:'0.9rem'}}>{showAlarmModal.instruction}</div>}
                    </div>
                    
                    <button 
                        style={{...styles.actionBtn, width:'100%', justifyContent:'center', padding:'14px', background:'#16a34a'}}
                        onClick={() => {
                            toggleStatus(showAlarmModal.id);
                            setShowAlarmModal(null);
                        }}
                    >
                        <FaCheckCircle /> Mark as Taken & Close
                    </button>
                    
                    <button 
                        onClick={() => setShowAlarmModal(null)}
                        style={{background:'none', border:'none', color:'#64748b', marginTop:'15px', textDecoration:'underline', cursor:'pointer'}}
                    >
                        Snooze / Close
                    </button>
                </div>
            </div>
        )}

      </div>
    </>
  );
};

export default MedicalReminders;