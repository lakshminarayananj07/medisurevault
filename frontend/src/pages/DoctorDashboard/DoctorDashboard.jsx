import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUserInjured, FaPrescriptionBottleAlt, FaChartLine, 
  FaPlus, FaHistory, FaCheckCircle, FaShieldAlt, FaServer, FaLock, FaCircle 
} from 'react-icons/fa';

const DoctorDashboard = () => {
  const { currentUser } = useAppContext();
  const navigate = useNavigate();

  // --- STATE ---
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalPrescriptions: 0,
    satisfaction: '98%'
  });
  const [recentRx, setRecentRx] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = currentUser?.token || localStorage.getItem('token');
        if (!token) return;

        const rxResponse = await axios.get('http://localhost:5001/api/prescriptions/doctor-history', {
            headers: { 'x-auth-token': token }
        });

        const patientsResponse = await axios.get(`http://localhost:5001/api/auth/patient-history/${currentUser.id || currentUser._id}`, {
             headers: { 'x-auth-token': token }
        });

        if (rxResponse.data.success) {
            const allRx = rxResponse.data.data;
            const sortedRx = allRx.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            // Show only top 4
            setRecentRx(sortedRx.slice(0, 4)); 
            
            setStats(prev => ({
                ...prev,
                totalPrescriptions: allRx.length,
                totalPatients: patientsResponse.data ? patientsResponse.data.length : 0
            }));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [currentUser]);

  // --- INTERNAL STYLES ---
  const styles = {
    pageContainer: {
        minHeight: '100vh',
        width: '98%', // Matched to Header Width for alignment
        maxWidth: '100vw',
        margin: '0 auto', // Centers the content if screen is ultra-wide
        display: 'flex',
        padding: '0px',
        flexDirection: 'column',
        boxSizing: 'border-box',
        fontFamily: "'Poppins', sans-serif",
        gap: '20px',
    },

    // HEADER
    topRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%', // Fills pageContainer
        backgroundColor: '#ffffff', 
        padding: '20px',            
        borderRadius: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        boxSizing: 'border-box'
    },
    headerContent: { display: 'flex', alignItems: 'center', gap: '15px' },
    headerIcon: {
        backgroundColor: '#e0e7ff', color: '#4338ca', padding: '12px',
        borderRadius: '12px', fontSize: '24px', display: 'flex',
    },
    headerTitle: { margin: 0, fontSize: '26px', fontWeight: '700', color: '#1e293b' },
    headerSubtitle: { margin: 0, fontSize: '14px', color: '#64748b' },
    quickActions: { display: 'flex', gap: '10px' },
    actionBtn: {
        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
        borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer',
        fontSize: '14px', fontFamily: 'inherit'
    },
    btnPrimary: { backgroundColor: '#0f172a', color: 'white' },
    btnSecondary: { backgroundColor: '#f1f5f9', color: '#475569' },

    // STATS
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        width: '100%' // Fills full width
    },
    statCard: {
        padding: '24px', borderRadius: '20px', display: 'flex', 
        justifyContent: 'space-between', alignItems: 'center', color: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minHeight: '120px'
    },
    tealCard: { background: 'linear-gradient(135deg, #0d9488, #115e59)' },
    blueCard: { background: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
    purpleCard: { background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
    statValue: { fontSize: '28px', fontWeight: '700', margin: 0 },
    statLabel: { fontSize: '14px', margin: 0, opacity: 0.9 },
    statIcon: { fontSize: '32px', opacity: 0.3 },

    // MAIN CONTENT
    dashboardContent: {
        display: 'flex', 
        gap: '20px', 
        width: '100%', // Ensures it touches the edges defined by pageContainer
        flex: 1
    },
    panel: {
        backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0',
        padding: '30px', boxSizing: 'border-box', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column'
    },
    sectionTitle: {
        fontSize: '18px', fontWeight: '600', color: '#334155', margin: '0 0 20px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    linkBtn: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },

    // TABLE
    tableContainer: { width: '100%', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px 10px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', borderBottom: '2px solid #f1f5f9' },
    td: { padding: '14px 10px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#334155' },
    badge: { display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' },

    // LIST
    infoList: { listStyle: 'none', padding: 0, margin: 0 },
    infoItem: { marginBottom: '15px', fontSize: '13px', color: '#475569', lineHeight: '1.6', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' },

    // FOOTER
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
              <h1 style={styles.headerTitle}>Welcome, Dr. {currentUser?.name}</h1>
              <p style={styles.headerSubtitle}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • Command Center
              </p>
            </div>
          </div>

          <div style={styles.quickActions}>
            <button onClick={() => navigate('/doctor-dashboard/create')} className="action-btn" style={{...styles.actionBtn, ...styles.btnPrimary}}>
              <FaPlus /> Issue Prescription
            </button>
            <button onClick={() => navigate('/doctor-dashboard/history')} className="action-btn" style={{...styles.actionBtn, ...styles.btnSecondary}}>
              <FaHistory /> Patient History
            </button>
            <button onClick={() => navigate('/doctor-dashboard/analytics')} className="action-btn" style={{...styles.actionBtn, ...styles.btnSecondary}}>
              <FaChartLine /> Analytics
            </button>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, ...styles.tealCard}}>
            <div>
              <h3 style={styles.statValue}>{loading ? "-" : stats.totalPatients}</h3>
              <p style={styles.statLabel}>Total Patients</p>
            </div>
            <div style={styles.statIcon}><FaUserInjured /></div>
          </div>

          <div style={{...styles.statCard, ...styles.blueCard}}>
            <div>
              <h3 style={styles.statValue}>{loading ? "-" : stats.totalPrescriptions}</h3>
              <p style={styles.statLabel}>Prescriptions Issued</p>
            </div>
            <div style={styles.statIcon}><FaPrescriptionBottleAlt /></div>
          </div>

          <div style={{...styles.statCard, ...styles.purpleCard}}>
            <div>
              <h3 style={styles.statValue}>{stats.satisfaction}</h3>
              <p style={styles.statLabel}>Satisfaction Rate</p>
            </div>
            <div style={styles.statIcon}><FaChartLine /></div>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div style={styles.dashboardContent}>
          
          {/* Recent Activity (Flex 2 = 75%) */}
          <div style={{...styles.panel, flex: 2}}>
            <div style={styles.sectionTitle}>
              <span>Recent Prescriptions</span>
              <button style={styles.linkBtn} onClick={() => navigate('/doctor-dashboard/history')}>View All</button>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Patient Name</th>
                    <th style={styles.th}>Diagnosis</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                      <tr><td colSpan="4" style={{...styles.td, textAlign:'center'}}>Loading data...</td></tr>
                  ) : recentRx.length > 0 ? (
                    recentRx.map((rx, index) => (
                      <tr key={rx._id || index}>
                        <td style={styles.td}><strong>{rx.patientName || rx.patientId?.name || "Unknown Patient"}</strong></td>
                        <td style={styles.td}>{rx.diagnosis}</td>
                        <td style={styles.td}>{rx.date}</td>
                        <td style={styles.td}>
                          <span style={styles.badge}>
                              <FaCheckCircle style={{fontSize:'10px'}}/> Issued
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{...styles.td, textAlign: 'center', color: '#94a3b8', padding: '30px'}}>
                        No recent prescriptions found.<br/>
                        <small>Try issuing a new prescription to see it here.</small>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Tips (Flex 1 = 25%) - [FIX] REMOVED maxWidth */}
          <div style={{...styles.panel, flex: 1}}>
            <div style={styles.sectionTitle}>
              <span style={{display:'flex', alignItems:'center', gap:'8px'}}><FaHistory style={{color:'#4338ca'}}/> Quick Tips</span>
            </div>
            <ul style={styles.infoList}>
              <li style={styles.infoItem}>Use '<strong>Issue Prescription</strong>' to create a new record for any registered patient.</li>
              <li style={styles.infoItem}>Check '<strong>Patient History</strong>' to view past diagnoses and medications.</li>
              <li style={{...styles.infoItem, borderBottom:'none'}}>Review '<strong>Analytics</strong>' for weekly insights on your practice.</li>
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

export default DoctorDashboard;