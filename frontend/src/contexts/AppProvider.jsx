import React, { useState, useEffect } from 'react';
import { AppContext } from './AppContext.js';
import { mockUsers, mockMedicines, mockDiagnoses, mockNews } from '../utils/mockData';
import { loginUser, registerUser } from '../services/apiService';
import { createPrescriptionAPI, getPrescriptionsAPI } from '../services/apiService';

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  // In a real app, you might fetch initial users here. For now, using mock is fine for the dropdowns.
  useEffect(() => {
    // This provides the full user list for selection dropdowns.
    // NOTE: The actual signup/login uses the database, not this mock list.
    setUsers(mockUsers); 
  }, []);

  const login = async (username, password, role) => {
    const result = await loginUser({ username, password, role });
    if (result.success) {
      setCurrentUser(result.data.user);
      localStorage.setItem('token', result.data.token);
      
      // After a successful login, fetch the user's prescriptions from the database
      const presResult = await getPrescriptionsAPI();
      if (presResult.success) {
        setPrescriptions(presResult.data);
      }
    }
    return result;
  };

  const logout = () => {
    setCurrentUser(null);
    setPrescriptions([]); // Clear prescriptions on logout
    localStorage.removeItem('token');
  };
  
  const signup = async (newUserData) => {
    // This now directly calls the API service, which connects to the backend.
    return await registerUser(newUserData);
  };

  const createPrescription = async (newPrescription) => {
    const result = await createPrescriptionAPI(newPrescription);
    if (result.success) {
      // If creation is successful, re-fetch all prescriptions to update the UI
      const presResult = await getPrescriptionsAPI();
      if (presResult.success) {
        setPrescriptions(presResult.data);
      }
    }
    return result;
  };

  const value = {
    currentUser,
    login,
    logout,
    signup,
    prescriptions,
    createPrescription,
    patients: users.filter(u => u.role === 'patient'),
    medicinesDB: mockMedicines,
    allUsers: users,
    diagnoses: mockDiagnoses,
    news: mockNews,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};