import React from 'react';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import './DashboardLayout.css';

// Define the navigation links for each role
const navLinks = {
  doctor: [
    { name: 'Dashboard', path: '/doctor-dashboard' },
    { name: 'Create Prescription', path: '/doctor-dashboard/create' },
    { name: 'Patient History', path: '/doctor-dashboard/history' },
    { name: 'Analytics', path: '/doctor-dashboard/analytics' },
    { name: 'Profile', path: '/doctor-dashboard/profile' },
  ],
  patient: [
    { name: 'Dashboard', path: '/patient-dashboard' },
    { name: 'My Prescriptions', path: '/patient-dashboard/prescriptions' },
    { name: 'Reminders', path: '/patient-dashboard/reminders' },
    { name: 'AI Chatbot', path: '/patient-dashboard/chatbot' },
    { name: 'Profile', path: '/patient-dashboard/profile' },
  ],
  pharmacist: [
    { name: 'Dashboard', path: '/pharmacist-dashboard' },
    { name: 'Scan QR Code', path: '/pharmacist-dashboard/scan' },
    // --- ADDED INVENTORY LINK HERE ---
    { name: 'Stock Management', path: '/pharmacist-dashboard/inventory' },
    // ---------------------------------
    { name: 'Profile', path: '/pharmacist-dashboard/profile' },
  ],
};

const DashboardLayout = ({ children, role }) => {
  const navigate = useNavigate();
  const { currentUser } = useAppContext();
  const links = navLinks[role] || [];

  const handleLogout = () => {
    console.log('Logging out...');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>MediSure Vault</h2>
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              end
            >
              {link.name}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="user-info">
            <span>Welcome, {currentUser?.name || "User"}!</span> 
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </header>
        <div className="page-content">
          {children}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;