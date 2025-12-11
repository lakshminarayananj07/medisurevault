import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { 
  FaUserInjured, 
  FaFilePrescription, 
  FaPills, 
  FaCalendarCheck, 
  FaInfoCircle,
  FaRobot // Added for the chatbot tip
} from 'react-icons/fa'; 
import './PatientDashboard.css'; 

const PatientDashboard = () => {
  const { currentUser, prescriptions } = useAppContext();
  const navigate = useNavigate();

  // --- LOGIC ---
  const myPrescriptions = prescriptions.filter(p => 
    String(p.patientId) === String(currentUser.id || currentUser._id)
  );

  const recentPrescriptions = myPrescriptions.slice(-3).reverse();
  const totalPrescriptions = myPrescriptions.length;
  const activeMedications = myPrescriptions.length > 0 ? myPrescriptions[0].medicines.length : 0; 
  
  const todayDisplay = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  // --- INLINE STYLES ---
  const darkHeading = { color: '#0f172a', margin: 0 }; 
  const mutedText = { color: '#64748b', margin: '4px 0 0' }; 
  const cardBg = { backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }; 

  const showTips = () => {
    alert("Check the Quick Actions card below for details!");
  };

  return (
    <div className="patient-dashboard-page" style={{ color: '#334155' }}>
      
      {/* --- Header Section --- */}
      <div className="dashboard-top-row" style={cardBg}>
        <header className="dashboard-header">
          <div className="header-icon">
            <FaUserInjured />
          </div>
          <div className="header-text">
            <h1 style={darkHeading}>Hello, {currentUser?.name || "Patient"}</h1>
            <p style={mutedText}>Your Health Overview • {todayDisplay}</p>
          </div>
        </header>

        <div className="quick-actions-bar">
           <button onClick={() => navigate('/patient-dashboard/prescriptions')} className="action-btn primary">
            <FaPills /> My Medicines
          </button>
          <button onClick={showTips} className="action-btn secondary">
            <FaInfoCircle /> Quick Tips
          </button>
          <button onClick={() => navigate('/patient-dashboard/reminders')} className="action-btn secondary">
            <FaCalendarCheck /> Reminders
          </button>
        </div>
      </div>

      {/* --- Stats Grid --- */}
      <div className="stats-grid">
        <div className="stat-card teal-card">
          <div className="card-content">
            <h3>{totalPrescriptions}</h3>
            <p>Total Prescriptions</p>
          </div>
          <div className="card-icon"><FaFilePrescription /></div>
        </div>

        <div className="stat-card blue-card">
          <div className="card-content">
            <h3>{activeMedications}</h3>
            <p>Active Medicines</p>
          </div>
          <div className="card-icon"><FaPills /></div>
        </div>

        <div className="stat-card purple-card">
          <div className="card-content">
            <h3>Good</h3>
            <p>Health Status</p>
          </div>
          <div className="card-icon"><FaUserInjured /></div>
        </div>
      </div>

      {/* --- SPLIT LAYOUT: Recent Prescriptions (Left) & Quick Actions (Right) --- */}
      <div className="content-split-layout">
        
        {/* LEFT SIDE: Table */}
        <div className="section-panel" style={cardBg}>
          <div className="panel-header">
            <h2 style={darkHeading}>Recent Prescriptions</h2>
            <button className="link-text" onClick={() => navigate('/patient-dashboard/prescriptions')}>
              View All History
            </button>
          </div>

          <div className="table-container">
            <table className="modern-table" style={{ width: '100%' }}>
              <thead>
                <tr style={{ textAlign: 'left', backgroundColor: '#f8fafc' }}>
                  <th style={{ padding: '12px', color: '#64748b' }}>Doctor</th>
                  <th style={{ padding: '12px', color: '#64748b' }}>Diagnosis</th>
                  <th style={{ padding: '12px', color: '#64748b' }}>Date</th>
                  <th style={{ padding: '12px', color: '#64748b' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPrescriptions.length > 0 ? (
                  recentPrescriptions.map((p, index) => (
                    <tr key={p.id || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px', color: '#334155', fontWeight: 'bold' }}>
                        Dr. {p.doctorName || "Unknown"}
                      </td>
                      <td style={{ padding: '16px', color: '#334155' }}>{p.diagnosis}</td>
                      <td style={{ padding: '16px', color: '#64748b' }}>{p.date}</td>
                      <td style={{ padding: '16px' }}>
                        <span className="badge success" style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          Prescribed
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontStyle: 'italic' }}>
                      No prescriptions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDE: Quick Actions Card */}
        <div className="section-panel" style={{ ...cardBg, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
           <div className="panel-header" style={{ marginBottom: '15px' }}>
             <h2 style={{ ...darkHeading, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaInfoCircle color="#3b82f6"/> Quick Actions
             </h2>
           </div>
           
           <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#64748b', lineHeight: '1.6' }}>
             <li style={{ marginBottom: '15px', display: 'flex', gap: '12px', alignItems: 'start' }}>
               <span style={{ marginTop: '5px', minWidth: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></span>
               <span>
                 Use <strong>AI Chatbot</strong> to ask health questions instantly and get advice.
               </span>
             </li>
             <li style={{ marginBottom: '15px', display: 'flex', gap: '12px', alignItems: 'start' }}>
               <span style={{ marginTop: '5px', minWidth: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#8b5cf6' }}></span>
               <span>
                 Check <strong>Reminders</strong> to set up alerts so you never miss a dose.
               </span>
             </li>
             <li style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
               <span style={{ marginTop: '5px', minWidth: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0d9488' }}></span>
               <span>
                 Review <strong>My Prescriptions</strong> to track your full medication history.
               </span>
             </li>
           </ul>
        </div>

      </div>
    </div>
  );
};

export default PatientDashboard;