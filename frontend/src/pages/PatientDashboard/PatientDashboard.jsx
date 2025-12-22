import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { 
  FaUserInjured, FaFilePrescription, FaPills, FaCalendarCheck, 
  FaInfoCircle, FaShieldAlt, FaCheckCircle, FaCircle, FaLock, FaServer
} from 'react-icons/fa'; 

const PatientDashboard = () => {
  const { currentUser, prescriptions } = useAppContext();
  const navigate = useNavigate();

  // --- SAFE DATA HANDLING ---
  const safePrescriptions = Array.isArray(prescriptions) ? prescriptions : [];
  const myPrescriptions = safePrescriptions.filter(p => 
      String(p.patientId) === String(currentUser.id || currentUser._id)
  );

  const recentPrescriptions = myPrescriptions.slice(-3).reverse();
  const totalPrescriptions = myPrescriptions.length;
  
  // Safety check for active meds count
  const activeMedications = myPrescriptions.length > 0 && myPrescriptions[0].medicines 
    ? myPrescriptions[0].medicines.length 
    : 0; 
  
  const todayDisplay = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  // --- INTERNAL STYLES (Matching Doctor Dashboard Standard) ---
  const styles = {
    // 1. Page Container
    pageContainer: {
        minHeight: '100vh',
        width: '99%',
        maxWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        fontFamily: "'Poppins', sans-serif",
        gap: '20px',
        paddingBottom: '20px'
    },

    // 2. Header Section
    topRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '97.5%',
        backgroundColor: '#ffffff', 
        padding: '20px',            
        borderRadius: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    headerContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    headerIcon: {
        backgroundColor: '#e0e7ff', 
        color: '#4338ca', 
        padding: '12px',
        borderRadius: '12px',
        fontSize: '24px',
        display: 'flex',
    },
    headerTitle: {
        margin: 0,
        fontSize: '26px', 
        fontWeight: '700',
        color: '#1e293b',
    },
    headerSubtitle: {
        margin: 0,
        fontSize: '14px', 
        color: '#64748b',
    },
    quickActions: {
        display: 'flex',
        gap: '10px'
    },
    actionBtn: {
        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
        borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer',
        fontSize: '14px', fontFamily: 'inherit'
    },
    btnPrimary: { backgroundColor: '#0f172a', color: 'white' },
    btnSecondary: { backgroundColor: '#f1f5f9', color: '#475569' },

    // 3. Stats Grid
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        width: '100%'
    },
    statCard: {
        padding: '24px', 
        borderRadius: '20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        color: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        minHeight: '120px'
    },
    tealCard: { background: 'linear-gradient(135deg, #0d9488, #115e59)' },
    blueCard: { background: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
    purpleCard: { background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
    
    statValue: { fontSize: '28px', fontWeight: '700', margin: 0 },
    statLabel: { fontSize: '14px', margin: 0, opacity: 0.9 },
    statIcon: { fontSize: '32px', opacity: 0.3 },

    // 4. Main Content Area
    dashboardContent: {
        display: 'flex',
        gap: '20px',
        width: '100%',
        flex: 1
    },

    // 5. Panels
    panel: {
        backgroundColor: '#ffffff',
        borderRadius: '20px', 
        border: '1px solid #e2e8f0',
        padding: '30px',      
        boxSizing: 'border-box',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column'
    },
    sectionTitle: {
        fontSize: '18px', 
        fontWeight: '600',
        color: '#334155',
        margin: '0 0 20px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    linkBtn: {
        background: 'none', border: 'none', color: '#2563eb', 
        cursor: 'pointer', fontSize: '13px', fontWeight: '600'
    },

    // 6. Table Styles
    tableContainer: {
        width: '100%',
        overflowX: 'auto'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    th: {
        textAlign: 'left',
        padding: '12px 10px',
        color: '#64748b',
        fontSize: '12px',
        fontWeight: '700',
        textTransform: 'uppercase',
        borderBottom: '2px solid #f1f5f9'
    },
    td: {
        padding: '14px 10px',
        borderBottom: '1px solid #f1f5f9',
        fontSize: '14px',
        color: '#334155'
    },
    badge: {
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        backgroundColor: '#dcfce7', color: '#166534',
        padding: '4px 10px', borderRadius: '12px',
        fontSize: '11px', fontWeight: '700'
    },

    // 7. Info List
    infoList: { listStyle: 'none', padding: 0, margin: 0 },
    infoItem: {
        marginBottom: '15px',
        fontSize: '13px',
        color: '#475569',
        lineHeight: '1.6',
        paddingBottom: '15px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start'
    },
    dot: {
        marginTop: '6px', minWidth: '6px', height: '6px', borderRadius: '50%'
    },

    // 8. Footer
    footer: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        width: '100%', backgroundColor: '#ffffff', padding: '30px 40px',
        borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        marginTop: 'auto', boxSizing: 'border-box'
    },
    footerBrand: { display: 'flex', flexDirection: 'column', gap: '5px' },
    footerBrandTitle: { fontSize: '18px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' },
    footerMeta: { fontSize: '12px', color: '#94a3b8', fontWeight: '500' },
    footerStats: { display: 'flex', gap: '40px' },
    footerStatItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
    footerLabel: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', fontWeight: '700' },
    footerValue: { fontSize: '14px', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' },
    footerLinks: { display: 'flex', gap: '25px', fontSize: '13px', color: '#64748b', fontWeight: '500' }
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          .action-btn:hover { transform: translateY(-2px); transition: transform 0.2s; }
          .footer-link:hover { color: #2563eb; transition: color 0.2s; }
        `}
      </style>

      <div style={styles.pageContainer}>
        
        {/* --- HEADER --- */}
        <div style={styles.topRow}>
          <div style={styles.headerContent}>
            <div style={styles.headerIcon}><FaUserInjured /></div>
            <div>
              <h1 style={styles.headerTitle}>Hello, {currentUser?.name || "Patient"}</h1>
              <p style={styles.headerSubtitle}>
                Your Health Overview • {todayDisplay}
              </p>
            </div>
          </div>

          <div style={styles.quickActions}>
            <button onClick={() => navigate('/patient-dashboard/prescriptions')} className="action-btn" style={{...styles.actionBtn, ...styles.btnPrimary}}>
              <FaPills /> My Medicines
            </button>
            <button onClick={() => alert("Quick Tip: Drink water!")} className="action-btn" style={{...styles.actionBtn, ...styles.btnSecondary}}>
              <FaInfoCircle /> Quick Tips
            </button>
            <button onClick={() => navigate('/patient-dashboard/reminders')} className="action-btn" style={{...styles.actionBtn, ...styles.btnSecondary}}>
              <FaCalendarCheck /> Reminders
            </button>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, ...styles.tealCard}}>
            <div>
              <h3 style={styles.statValue}>{totalPrescriptions}</h3>
              <p style={styles.statLabel}>Total Prescriptions</p>
            </div>
            <div style={styles.statIcon}><FaFilePrescription /></div>
          </div>

          <div style={{...styles.statCard, ...styles.blueCard}}>
            <div>
              <h3 style={styles.statValue}>{activeMedications}</h3>
              <p style={styles.statLabel}>Active Medicines</p>
            </div>
            <div style={styles.statIcon}><FaPills /></div>
          </div>

          <div style={{...styles.statCard, ...styles.purpleCard}}>
            <div>
              <h3 style={styles.statValue}>Good</h3>
              <p style={styles.statLabel}>Health Status</p>
            </div>
            <div style={styles.statIcon}><FaUserInjured /></div>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div style={styles.dashboardContent}>
          
          {/* LEFT: Recent Prescriptions */}
          <div style={{...styles.panel, flex: 3}}>
            <div style={styles.sectionTitle}>
              <span>Recent Prescriptions</span>
              <button style={styles.linkBtn} onClick={() => navigate('/patient-dashboard/prescriptions')}>View All History</button>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Doctor</th>
                    <th style={styles.th}>Diagnosis</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPrescriptions.length > 0 ? (
                    recentPrescriptions.map((p, index) => (
                      <tr key={p.id || index}>
                        <td style={styles.td}><strong>Dr. {p.doctorId?.name || p.doctorName || "Unknown"}</strong></td>
                        <td style={styles.td}>{p.diagnosis}</td>
                        <td style={styles.td}>{p.date}</td>
                        <td style={styles.td}>
                          <span style={styles.badge}>
                              <FaCheckCircle style={{fontSize:'10px'}}/> Prescribed
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{...styles.td, textAlign: 'center', color: '#94a3b8', padding: '30px'}}>
                        No prescriptions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: Quick Actions */}
          <div style={{...styles.panel, flex: 1}}>
            <div style={styles.sectionTitle}>
              <span style={{display:'flex', alignItems:'center', gap:'8px'}}><FaInfoCircle style={{color:'#3b82f6'}}/> Quick Actions</span>
            </div>
            <ul style={styles.infoList}>
              <li style={styles.infoItem}>
                <span style={{...styles.dot, backgroundColor:'#3b82f6'}}></span>
                <span>Use <strong>AI Chatbot</strong> to ask health questions instantly.</span>
              </li>
              <li style={styles.infoItem}>
                <span style={{...styles.dot, backgroundColor:'#8b5cf6'}}></span>
                <span>Check <strong>Reminders</strong> so you never miss a dose.</span>
              </li>
              <li style={{...styles.infoItem, borderBottom:'none'}}>
                <span style={{...styles.dot, backgroundColor:'#0d9488'}}></span>
                <span>Review <strong>My Prescriptions</strong> to track medication history.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* --- FOOTER --- */}
        <div style={styles.footer}>
            <div style={styles.footerBrand}>
                <div style={styles.footerBrandTitle}>
                   <FaShieldAlt style={{color:'#4338ca', fontSize:'22px'}}/> MediSure Vault
                </div>
                <div style={styles.footerMeta}>Secure Blockchain EMR System • v2.4.0</div>
            </div>
            
            <div style={styles.footerStats}>
                <div style={styles.footerStatItem}>
                    <span style={styles.footerLabel}>System Status</span>
                    <div style={{...styles.footerValue, color:'#10b981'}}>
                        <FaCircle style={{fontSize:'8px'}}/> Online
                    </div>
                </div>
                <div style={styles.footerStatItem}>
                    <span style={styles.footerLabel}>Security Level</span>
                    <div style={styles.footerValue}>
                        <FaLock style={{fontSize:'12px', color:'#6366f1'}}/> AES-256 Encrypted
                    </div>
                </div>
                <div style={styles.footerStatItem}>
                    <span style={styles.footerLabel}>Server Node</span>
                    <div style={styles.footerValue}>
                        <FaServer style={{fontSize:'12px', color:'#64748b'}}/> Asia-South-1
                    </div>
                </div>
            </div>

            <div style={styles.footerLinks}>
                <span className="footer-link" style={{cursor:'pointer'}}>Help Center</span>
                <span className="footer-link" style={{cursor:'pointer'}}>Report Issue</span>
                <span className="footer-link" style={{cursor:'pointer'}}>Privacy Policy</span>
            </div>
        </div>

      </div>
    </>
  );
};

export default PatientDashboard;