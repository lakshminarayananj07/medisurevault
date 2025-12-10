import React, { useState, useEffect } from 'react';
import { AppContext } from './AppContext.js';
import { mockUsers, mockMedicines, mockDiagnoses, mockNews } from '../utils/mockData';
import { loginUser, registerUser, createPrescriptionAPI, getPrescriptionsAPI } from '../services/apiService';
import { getRemindersAPI, addReminderAPI, deleteReminderAPI } from '../services/apiService';

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reminders, setReminders] = useState([]);
  
  // --- STATE FOR THE POPUP ---
  const [activeAlert, setActiveAlert] = useState(null); 

  useEffect(() => {
    setUsers(mockUsers); 
  }, []);

  // --- FUNCTION TO CLEAR ALERT ---
  const clearAlert = () => setActiveAlert(null);

  const fetchReminders = async () => {
    const result = await getRemindersAPI();
    if (result.success) setReminders(result.data);
  };

  const login = async (username, password, role) => {
    const result = await loginUser({ username, password, role });
    if (result.success) {
      setCurrentUser(result.data.user);
      localStorage.setItem('token', result.data.token);
      
      const presResult = await getPrescriptionsAPI();
      if (presResult.success) setPrescriptions(presResult.data);
      
      if (result.data.user.role === 'patient') {
        fetchReminders();
      }
    }
    return result;
  };

  const logout = () => {
    setCurrentUser(null);
    setPrescriptions([]);
    setReminders([]);
    setActiveAlert(null);
    localStorage.removeItem('token');
  };
  
  // --- THE FINAL TIMER LOGIC ---
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'patient') return;

    const checkReminders = () => {
      const now = new Date();
      // Format time as HH:MM
      const currentHash = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      console.log(`Checking: ${currentHash}`); // Keep this for your peace of mind

      reminders.forEach(reminder => {
        const reminderKey = `${reminder._id}-${currentHash}`;
        const alreadyNotified = sessionStorage.getItem(reminderKey);

        if (reminder.time === currentHash && reminder.isActive && !alreadyNotified) {
            
            console.log("✅ TRIGGERING POPUP FOR:", reminder.medicineName);
            
            // 1. Mark as shown so it doesn't blink infinitely
            sessionStorage.setItem(reminderKey, "true");

            // 2. TRIGGER THE POPUP (This was missing in your debug code!)
            setActiveAlert({
              medicineName: reminder.medicineName,
              dosage: reminder.dosage,
              time: reminder.time
            });
        }
      });
    };

    // Check every 5 seconds to be precise
    const intervalId = setInterval(checkReminders, 5000);
    checkReminders();

    return () => clearInterval(intervalId);
  }, [currentUser, reminders]);

  // Wrappers
  const signup = async (data) => await registerUser(data);
  const createPrescription = async (data) => {
    const result = await createPrescriptionAPI(data);
    if (result.success) {
        const presResult = await getPrescriptionsAPI();
        if (presResult.success) setPrescriptions(presResult.data);
    }
    return result;
  };
  const addReminder = async (data) => {
    const result = await addReminderAPI(data);
    if (result.success) await fetchReminders();
    return result;
  };
  const deleteReminder = async (id) => {
    const result = await deleteReminderAPI(id);
    if (result.success) await fetchReminders();
    return result;
  }

  const value = {
    currentUser, login, logout, signup, prescriptions, createPrescription,
    reminders, addReminder, deleteReminder,
    
    // Export the Alert state so the Popup component can see it
    activeAlert, 
    clearAlert, 
    setActiveAlert, // Included for the Test button
    
    patients: users.filter(u => u.role === 'patient'),
    medicinesDB: mockMedicines, allUsers: users, diagnoses: mockDiagnoses, news: mockNews,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};