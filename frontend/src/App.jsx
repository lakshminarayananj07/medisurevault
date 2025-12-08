import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthPage from './pages/Authpage';
import DashboardLayout from './components/layout/DashboardLayout';

// Doctor Pages
import DoctorDashboard from './pages/DoctorDashboard/DoctorDashboard';
import CreatePrescription from './pages/DoctorDashboard/CreatePrescription';
import PatientHistory from './pages/DoctorDashboard/PatientHistory';
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
    <Routes>
      {/* Auth Route */}
      <Route path="/" element={<AuthPage />} />

      {/* Doctor Nested Routes */}
      <Route path="/doctor-dashboard" element={<DashboardLayout role="doctor" />}>
        <Route index element={<DoctorDashboard />} />
        <Route path="create" element={<CreatePrescription />} />
        <Route path="history" element={<PatientHistory />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="profile" element={<DoctorProfile />} />
      </Route>
      
      {/* Patient Nested Routes */}
      <Route path="/patient-dashboard" element={<DashboardLayout role="patient" />}>
        <Route index element={<PatientDashboard />} />
        <Route path="prescriptions" element={<MyPrescriptions />} />
        <Route path="chatbot" element={<AiChatbot />} />
        <Route path="profile" element={<PatientProfile />} />
      </Route>
      
      {/* Pharmacist Nested Routes */}
      <Route path="/pharmacist-dashboard" element={<DashboardLayout role="pharmacist" />}>
        <Route index element={<PharmacistDashboard />} />
        <Route path="scan" element={<ScanQR />} />
        <Route path="profile" element={<PharmacistProfile />} />
      </Route>
    </Routes>
  );
}

export default App;