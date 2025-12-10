import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import './ReminderPopup.css';

const ReminderPopup = () => {
  const { activeAlert, clearAlert } = useAppContext();

  // If there is no active alert, don't show anything
  if (!activeAlert) return null; 

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <div className="popup-header">
          <span className="pulse-icon">🔔</span>
          <h3>Medical Reminder</h3>
        </div>
        
        <div className="popup-body">
          <p className="time-display">{activeAlert.time}</p>
          <h4>It's time to take your medicine:</h4>
          <div className="medicine-highlight">
            <h2>{activeAlert.medicineName}</h2>
            <p>Dosage: {activeAlert.dosage}</p>
          </div>
        </div>

        <div className="popup-actions">
          <button className="btn-take" onClick={clearAlert}>
            ✅ I've Taken It
          </button>
          <button className="btn-snooze" onClick={clearAlert}>
            💤 Snooze
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderPopup;