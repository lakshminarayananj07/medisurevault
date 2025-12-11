import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Helper function to get the token and add it to headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'x-auth-token': token } : {};
};

// --- CHATBOT SERVICE ---
export const getAiChatResponse = async (message, prescriptions) => {
  try {
    const response = await axios.post(`${API_URL}/chat`, {
      message,
      prescriptions,
    });
    return response.data.reply;
  } catch (error) {
    console.error("Error getting AI response:", error);
    return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.";
  }
};

// --- AUTHENTICATION SERVICES ---
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return { success: true, message: response.data.message };
  } catch (error) {
    return { success: false, message: error.response.data.message || 'An error occurred during signup.' };
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, userData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response.data.message || 'An error occurred during login.' };
  }
};

// --- PRESCRIPTION SERVICES ---
export const createPrescriptionAPI = async (prescriptionData) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_URL}/prescriptions/create`, prescriptionData, { headers });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response.data.message || 'Error creating prescription.' };
  }
};

export const getPrescriptionsAPI = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/prescriptions`, { headers });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response.data.message || 'Error fetching prescriptions.' };
  }
};

// --- REMINDER SERVICES ---
export const addReminderAPI = async (reminderData) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_URL}/reminders/add`, reminderData, { headers });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response.data.message || 'Error adding reminder.' };
  }
};

export const getRemindersAPI = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/reminders`, { headers });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response.data.message || 'Error fetching reminders.' };
  }
};

export const deleteReminderAPI = async (id) => {
  try {
    const headers = getAuthHeaders();
    await axios.delete(`${API_URL}/reminders/${id}`, { headers });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.response.data.message || 'Error deleting reminder.' };
  }
};

// --- NEW: DOCTOR PATIENT MANAGEMENT SERVICES ---

// 1. Doctor adds a patient using username + code
export const addPatientAPI = async (doctorId, patientUsername, patientCode) => {
  try {
    // Note: This goes to the auth route as we defined in backend
    const response = await axios.post(`${API_URL}/auth/add-patient`, {
      doctorId, 
      patientUsername, 
      patientCode
    });
    return { success: true, message: response.data.message, patientName: response.data.patientName };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error adding patient.' };
  }
};

// 2. Fetch the list of patients associated with the doctor
export const getDoctorPatientsAPI = async (doctorId) => {
  try {
    const response = await axios.get(`${API_URL}/auth/patient-history/${doctorId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error fetching patient list.' };
  }
};

// --- INVENTORY API (Pharmacist) ---

export const getInventoryAPI = async (pharmacistId) => {
  try {
    // Assuming you set up this route in backend
    const response = await axios.get(`${API_URL}/inventory/${pharmacistId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Fetch failed" };
  }
};

export const addInventoryItemAPI = async (itemData) => {
  try {
    const response = await axios.post(`${API_URL}/inventory/add`, itemData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Add failed" };
  }
};

export const updateInventoryItemAPI = async (id, itemData) => {
  try {
    const response = await axios.put(`${API_URL}/inventory/update/${id}`, itemData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Update failed" };
  }
};

export const deleteInventoryItemAPI = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/inventory/delete/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Delete failed" };
  }
};