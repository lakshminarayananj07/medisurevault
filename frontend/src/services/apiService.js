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