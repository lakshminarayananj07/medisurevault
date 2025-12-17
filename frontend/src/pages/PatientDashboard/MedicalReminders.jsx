import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import './PatientDashboard.css';
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

  if (!currentUser) return <div className="loading-state">Loading...</div>;

  return (
    // FIX: Main Container explicitly set to 100% width and box-sizing
    <div className="patient-dashboard-page" style={{
      minHeight: '100vh',
      width: '97%',
      maxWidth: '100vw', 
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      padding: '0px'
    }}>
      
      {/* Header */}
      <div className="dashboard-top-row" style={{ width: '99.5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <header className="dashboard-header">
          <div className="header-icon"><FaCalendarCheck /></div>
          <div className="header-text">
            <h1>Medical Reminders</h1>
            <p>Set alarms for your medications</p>
          </div>
        </header>
        
        <div className="quick-actions-bar">
          <button className="action-btn primary" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Set New Reminder
          </button>
        </div>
      </div>

      {/* FIX: Dashboard Content forced to 100% width */}
      <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', maxWidth: '100%' }}>
        
        {/* FIX: Panel forced to 100% width */}
        <div className="section-panel full-width" style={{ flex: 1, marginBottom: 0, width: '100%', maxWidth: '100%' }}>
          
          <div className="table-container" style={{ width: '100%', overflowX: 'auto' }}>
            {/* FIX: Table forced to 100% width */}
            <table className="modern-table" style={{ width: '100%', minWidth: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Medicine</th>
                  <th style={{ width: '15%' }}>Type & Dosage</th>
                  <th style={{ width: '15%' }}>Time</th>
                  <th style={{ width: '20%' }}>Status</th>
                  <th style={{ width: '15%' }}>Action</th>
                  {/* NEW COLUMN */}
                  <th style={{ width: '10%' }}>Remove</th> 
                </tr>
              </thead>
              <tbody>
                {reminders.length > 0 ? (
                  reminders.map((item) => (
                    <tr key={item.id} style={{ opacity: item.status === 'Taken' ? 0.6 : 1 }}>
                      <td><strong>{item.medicine}</strong><br/><small className="text-muted">{item.instruction}</small></td>
                      <td>{item.quantity} {item.type === 'Syrup' ? 'ml' : 'tabs'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FaClock style={{ color: '#3b82f6' }}/> {formatTimeDisplay(item.time)}
                        </div>
                      </td>
                      <td>
                        {item.status === 'Taken' ? (
                          <span className="badge success"><FaCheckCircle/> Taken today</span>
                        ) : (
                          <span className="badge warning"><FaClock/> Pending</span>
                        )}
                      </td>
                      <td>
                         <button onClick={() => toggleStatus(item.id)} className="icon-btn-view">
                           {item.status === 'Taken' ? 'Undo' : 'Mark Done'}
                         </button>
                      </td>
                      {/* NEW REMOVE CELL */}
                      <td>
                         <button onClick={() => deleteReminder(item.id)} className="icon-btn-view" style={{ color: 'red', background: '#fee2e2' }}>
                           <FaTrash />
                         </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="empty-state-cell">No reminders set. Click "Set New Reminder" to add one.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- ADD MODAL --- */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content dark-modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Set Medicine Reminder</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><FaTimes/></button>
            </div>
            
            <form onSubmit={saveReminder} className="reminder-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group">
                <label>Medicine Name</label>
                <input type="text" name="medicine" value={newReminder.medicine} onChange={handleInputChange} className="dark-input" placeholder="e.g. Paracetamol" required />
              </div>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Type</label>
                  <select name="type" value={newReminder.type} onChange={handleInputChange} className="dark-input">
                    <option value="Tablet">Tablet</option>
                    <option value="Syrup">Syrup</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" name="quantity" value={newReminder.quantity} onChange={handleInputChange} className="dark-input" placeholder="e.g. 1" />
                </div>
              </div>
              <div className="form-group">
                <label>Time</label>
                <input type="time" name="time" value={newReminder.time} onChange={handleInputChange} className="dark-input" required />
              </div>
              <div className="form-group">
                <label>Instructions (Optional)</label>
                <input type="text" name="instruction" value={newReminder.instruction} onChange={handleInputChange} className="dark-input" placeholder="e.g. After Food" />
              </div>
              <button type="submit" className="action-btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                Save Reminder
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ALARM MODAL --- */}
      {showAlarmModal && (
        <div className="modal-overlay">
          <div className="modal-content dark-modal" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', color: '#f59e0b', marginBottom: '10px' }}>
              <FaBell className="shake-animation" />
            </div>
            <h2>Time to take your medicine!</h2>
            <p style={{ fontSize: '1.2rem', margin: '20px 0' }}>
              <strong>{showAlarmModal.medicine}</strong><br/>
              {showAlarmModal.quantity} {showAlarmModal.type === 'Syrup' ? 'ml' : 'tabs'}
            </p>
            <div className="alarm-instruction-box">
              {showAlarmModal.instruction || "No special instructions"}
            </div>
            
            <button
              className="action-btn primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => {
                toggleStatus(showAlarmModal.id);
                setShowAlarmModal(null);
              }}
            >
              <FaCheckCircle /> Mark as Taken & Close
            </button>
            <button className="link-text" style={{ marginTop: '15px', display: 'block', width: '100%' }} onClick={() => setShowAlarmModal(null)}>
              Snooze / Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MedicalReminders;