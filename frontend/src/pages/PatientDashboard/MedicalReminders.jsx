// frontend/src/pages/PatientDashboard/MedicalReminders.jsx
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import '../DoctorDashboard/CreatePrescription.css'; // Re-use existing form styles

const MedicalReminders = () => {
  const { reminders, addReminder, deleteReminder } = useAppContext();
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!medicineName || !time) return;

    const result = await addReminder({ medicineName, dosage, time });
    if (result.success) {
      alert('Reminder added successfully!');
      setMedicineName('');
      setDosage('');
      setTime('');
    } else {
      alert('Failed to add reminder');
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Medical Reminders</h1>
        <p>Set alarms for your daily medications.</p>
      </div>

      <div className="dashboard-grid">
        {/* Form Section */}
        <div className="dashboard-card grid-col-span-1">
          <h3>Add New Reminder</h3>
          <form onSubmit={handleSubmit} className="prescription-form">
            <div className="input-group">
              <label>Medicine Name</label>
              <input type="text" value={medicineName} onChange={(e) => setMedicineName(e.target.value)} placeholder="e.g. Paracetamol" required />
            </div>
            <div className="input-group">
              <label>Dosage</label>
              <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 1 tablet" />
            </div>
            <div className="input-group">
              <label>Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
            <button type="submit" className="submit-btn" style={{marginTop: '20px'}}>Set Reminder</button>
          </form>
        </div>

        {/* List Section */}
        <div className="dashboard-card grid-col-span-2">
          <h3>Your Scheduled Reminders</h3>
          {reminders.length === 0 ? (
            <p style={{color: '#b0b0b0'}}>No active reminders.</p>
          ) : (
            <ul className="data-list">
              {reminders.map(r => (
                <li key={r._id} className="data-list-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <span className="item-title" style={{fontSize: '1.2em', color: '#3A86FF'}}>{r.time}</span>
                    <span className="item-meta" style={{color: '#e0e0e0', fontSize: '1.1em'}}> - {r.medicineName} ({r.dosage})</span>
                  </div>
                  <button 
                    onClick={() => deleteReminder(r._id)} 
                    style={{background: '#FF006E', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalReminders;