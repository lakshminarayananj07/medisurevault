import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Inventory from './pages/PharmacistDashboard/Inventory';

// ▼▼▼ IMPORT THE POPUP ▼▼▼
import ReminderPopup from './components/specific/ReminderPopup';

import MedicalReminders from './pages/PatientDashboard/MedicalReminders';
import AuthPage from './pages/Authpage'; // Note: check capitalization (AuthPage vs Authpage) based on your file
import DashboardLayout from './components/layout/DashboardLayout';
import DoctorShare from './pages/PatientDashboard/DoctorShare';

// Doctor Pages
import DoctorDashboard from './pages/DoctorDashboard/DoctorDashboard';
import CreatePrescription from './pages/DoctorDashboard/CreatePrescription';
import PatientHistory from './pages/DoctorDashboard/PatientHistory';
import DoctorPatientChat from './pages/DoctorDashboard/DoctorPatientChat';
import Analytics from './pages/DoctorDashboard/Analytics';
import DoctorProfile from './pages/DoctorDashboard/Profile';

// Patient Pages
import PatientDashboard from './pages/PatientDashboard/PatientDashboard';
import MyPrescriptions from './pages/PatientDashboard/MyPrescriptions';
import AiChatbot from './pages/PatientDashboard/AiChatbot';
import PatientProfile from './pages/PatientDashboard/Profile';

// Pharmacist Pages
import PharmacistDashboard from './pages/PharmacistDashboard/PharmacistDashboard';
import ScanQR from './pages/PharmacistDashboard/ScanQR';
import PharmacistProfile from './pages/PharmacistDashboard/Profile';

function App() {
  return (
    // ▼▼▼ USE A FRAGMENT (<> ... </>) TO WRAP EVERYTHING ▼▼▼
    <>
      
      {/* 1. The Popup sits here, floating above everything */}
      <ReminderPopup />

      {/* 2. Your Routes stay exactly the same */}
      <Routes>
        {/* Auth Route */}
        <Route path="/" element={<AuthPage />} />

        {/* Doctor Nested Routes */}
        <Route path="/doctor-dashboard" element={<DashboardLayout role="doctor" />}>
          <Route index element={<DoctorDashboard />} />
          <Route path="create" element={<CreatePrescription />} />
          <Route path="history" element={<PatientHistory />} />
          <Route path="/doctor-dashboard/patient-chat" element={<DoctorPatientChat />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<DoctorProfile />} />
        </Route>
        
        {/* Patient Nested Routes */}
        <Route path="/patient-dashboard" element={<DashboardLayout role="patient" />}>
          <Route index element={<PatientDashboard />} />
          <Route path="prescriptions" element={<MyPrescriptions />} />
          <Route path="reminders" element={<MedicalReminders />} />
          <Route path="/patient-dashboard/doctor-share" element={<DoctorShare />} />
          <Route path="chatbot" element={<AiChatbot />} />
          <Route path="profile" element={<PatientProfile />} />
        </Route>
        
        {/* Pharmacist Nested Routes */}
        <Route path="/pharmacist-dashboard" element={<DashboardLayout role="pharmacist" />}>
          <Route index element={<PharmacistDashboard />} />
          <Route path="scan" element={<ScanQR />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="profile" element={<PharmacistProfile />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;