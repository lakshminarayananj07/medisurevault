import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import Axios for private history fetch
import { getInventoryAPI } from '../../services/apiService'; 
import { 
  FaQrcode, FaClipboardCheck, FaHistory, FaExclamationTriangle, 
  FaArrowRight, FaChartBar, FaUserShield, FaCalendarAlt, 
  FaShieldAlt, FaCircle, FaLock, FaServer
} from 'react-icons/fa';

const PharmacistDashboard = () => {
  const { prescriptions = [] } = useAppContext(); // Keep for "Pending" counts

  // --- LOCAL STATE ---
  const [inventoryData, setInventoryData] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [currentPharmacist, setCurrentPharmacist] = useState(null);
  
  // Private Stats State (Only for this user)
  const [myStats, setMyStats] = useState({
      todayScans: 0,
      totalScans: 0,
      pending: 0 
  });

  // --- 1. IDENTIFY USER & FETCH PRIVATE DATA ---
  useEffect(() => {
    const initDashboard = async () => {
        try {
            // A. Get User Identity (Same logic as ScanQR.js)
            const userStr = localStorage.getItem('user');
            let userId = null;
            let userName = 'Pharmacist';

            if (userStr) {
                const user = JSON.parse(userStr);
                userId = user.username || user.id || user._id; // The unique ID
                userName = user.name || user.username || 'Pharmacist';
            }

            setCurrentPharmacist(userName);

            if (!userId) return; // Stop if not logged in

            // B. Fetch Private Dispense History (For Stats)
            const historyRes = await axios.get(`http://localhost:5001/api/prescriptions/dispense-history?pharmacistId=${userId}`);
            
            if (historyRes.data.success) {
                const history = historyRes.data.data;
                
                // Calculate Private Stats
                const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
                
                // 1. Total (My Personal Count)
                const total = history.length;

                // 2. Today (My Personal Count)
                // Check against dispenseDate or updatedAt
                const todayCount = history.filter(item => {
                    const itemDate = new Date(item.dispenseDate || item.updatedAt).toLocaleDateString('en-CA');
                    return itemDate === todayStr;
                }).length;

                // 3. Pending (Global Count from Context - items not dispensed yet)
                const pendingCount = prescriptions.filter(p => !p.isDispensed).length;

                setMyStats({
                    todayScans: todayCount,
                    totalScans: total,
                    pending: pendingCount
                });
            }

            // C. Fetch Inventory (Shared Resource)
            setLoadingInventory(true);
            const invRes = await getInventoryAPI(userId);
            if (invRes.success) {
                setInventoryData(invRes.data);
            }

        } catch (error) {
            console.error("Dashboard Sync Error:", error);
        } finally {
            setLoadingInventory(false);
        }
    };

    initDashboard();
  }, [prescriptions]); // Re-run if global context updates

  // --- 2. DYNAMIC LOW STOCK LOGIC ---
  const sortedLowStock = useMemo(() => {
    return [...inventoryData]
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 3); 
  }, [inventoryData]);

  const getStockStatus = (item) => {
    const low = item.lowLimit ?? 10;
    const high = item.highLimit ?? 100;
    if (item.stock === 0) return { label: 'Out of Stock', color: '#ef4444', bg: '#fee2e2' }; 
    if (item.stock <= low) return { label: 'Low', color: '#f59e0b', bg: '#fef3c7' }; 
    if (item.stock >= high) return { label: 'Over', color: '#3b82f6', bg: '#dbeafe' }; 
    return { label: 'Good', color: '#10b981', bg: '#d1fae5' }; 
  };

  // --- 3. CHART DATA (Based on My Stats) ---
  const chartData = useMemo(() => {
    // Simple visualization logic
    const max = Math.max(myStats.todayScans * 2, 10); 
    return { today: myStats.todayScans, average: Math.round(myStats.totalScans / 7) || 0, max };
  }, [myStats]);

  // --- STYLES ---
  const styles = {
    pageContainer: { minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', fontFamily: "'Poppins', sans-serif", gap: '20px', paddingBottom: '20px' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', backgroundColor: '#ffffff', padding: '20px', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', boxSizing: 'border-box' },
    headerContent: { display: 'flex', alignItems: 'center', gap: '15px' },
    headerIcon: { backgroundColor: '#d1fae5', color: '#059669', padding: '12px', borderRadius: '12px', fontSize: '24px', display: 'flex' },
    headerTitle: { margin: 0, fontSize: '26px', fontWeight: '700', color: '#1e293b' },
    headerSubtitle: { margin: 0, fontSize: '14px', color: '#64748b' },
    dateBadge: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '8px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#475569' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', width: '100%' },
    statCard: { padding: '24px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minHeight: '120px' },
    cardBlue: { background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)' },
    cardTeal: { background: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)' },
    cardPurple: { background: 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)' },
    statValue: { fontSize: '28px', fontWeight: '700', margin: 0 },
    statLabel: { fontSize: '14px', margin: 0, opacity: 0.9 },
    statIconBox: { width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(5px)' },
    dashboardContent: { display: 'flex', gap: '20px', width: '100%', flex: 1 },
    panel: { backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '30px', boxSizing: 'border-box', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
    sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#334155', margin: '0 0 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    subtitle: { fontSize: '12px', color: '#94a3b8', fontWeight: '500' },
    stockList: { flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' },
    stockItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' },
    stockName: { fontWeight: '600', color: '#334155', fontSize: '14px' },
    statusBadge: { padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' },
    stockCount: { fontSize: '13px', fontWeight: '600', color: '#64748b' },
    viewAllLink: { marginTop: '20px', textDecoration: 'none', color: '#059669', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' },
    chartContainer: { flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '20px' },
    barGroup: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '60px' },
    barValue: { fontSize: '14px', fontWeight: '700', color: '#1e293b' },
    barBase: { width: '100%', backgroundColor: '#f1f5f9', borderRadius: '8px', position: 'relative', overflow: 'hidden', height: '150px' },
    barFill: { width: '100%', position: 'absolute', bottom: 0, left: 0, borderRadius: '8px', transition: 'height 1s ease-in-out' },
    barLabel: { fontSize: '13px', fontWeight: '600', color: '#64748b' },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', backgroundColor: '#ffffff', padding: '30px 40px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginTop: 'auto', boxSizing: 'border-box' },
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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`}</style>

      <div style={styles.pageContainer}>
        
        {/* --- HEADER --- */}
        <div style={styles.topRow}>
          <div style={styles.headerContent}>
            <div style={styles.headerIcon}><FaUserShield /></div>
            <div>
              <h1 style={styles.headerTitle}>Welcome, {currentPharmacist}</h1>
              <p style={styles.headerSubtitle}>Inventory & Dispensing Overview</p>
            </div>
          </div>
          <div style={styles.dateBadge}>
            <FaCalendarAlt /> 
            {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div style={styles.statsGrid}>
            <div style={{...styles.statCard, ...styles.cardBlue}}>
                <div>
                    <h3 style={styles.statValue}>{myStats.todayScans}</h3>
                    <span style={styles.statLabel}>You Scanned Today</span>
                </div>
                <div style={styles.statIconBox}><FaQrcode /></div>
            </div>

            <div style={{...styles.statCard, ...styles.cardTeal}}>
                <div>
                    <h3 style={styles.statValue}>{myStats.totalScans}</h3>
                    <span style={styles.statLabel}>Your Total Scans</span>
                </div>
                <div style={styles.statIconBox}><FaHistory /></div>
            </div>

            <div style={{...styles.statCard, ...styles.cardPurple}}>
                <div>
                    <h3 style={styles.statValue}>{myStats.pending}</h3>
                    <span style={styles.statLabel}>Global Pending</span>
                </div>
                <div style={styles.statIconBox}><FaClipboardCheck /></div>
            </div>
        </div>

        {/* --- MAIN CONTENT SPLIT --- */}
        <div style={styles.dashboardContent}>
            
            {/* LEFT: STOCK ALERTS */}
            <div style={{...styles.panel, flex: 1.5}}>
                <div style={styles.sectionTitle}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <FaExclamationTriangle style={{color:'#ef4444'}}/> Stock Alerts
                    </div>
                    <span style={styles.subtitle}>Lowest quantity items</span>
                </div>
                
                <div style={styles.stockList}>
                    {loadingInventory ? (
                        <div style={{textAlign:'center', color:'#94a3b8', padding:'20px'}}>Syncing inventory...</div>
                    ) : sortedLowStock.length === 0 ? (
                        <div style={{textAlign:'center', color:'#94a3b8', padding:'20px'}}>
                            Inventory is healthy. No low stock items.
                        </div>
                    ) : (
                        sortedLowStock.map((item, idx) => {
                            const status = getStockStatus(item);
                            return (
                                <div key={idx} style={styles.stockItem}>
                                    <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                                        <span style={styles.stockName}>{item.name}</span>
                                        <span style={{...styles.statusBadge, color: status.color, backgroundColor: status.bg}}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <span style={styles.stockCount}>{item.stock} left</span>
                                </div>
                            )
                        })
                    )}
                </div>

                <Link to="/pharmacist-dashboard/inventory" style={styles.viewAllLink}>
                    Manage Inventory <FaArrowRight />
                </Link>
            </div>

            {/* RIGHT: ANALYTICS (Private) */}
            <div style={{...styles.panel, flex: 1}}>
                <div style={styles.sectionTitle}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <FaChartBar style={{color:'#3b82f6'}}/> Your Performance
                    </div>
                    <span style={styles.subtitle}>Dispensing Analytics</span>
                </div>

                <div style={styles.chartContainer}>
                    <div style={styles.barGroup}>
                        <span style={styles.barValue}>{chartData.today}</span>
                        <div style={styles.barBase}>
                            <div style={{...styles.barFill, height: `${(chartData.today / chartData.max) * 100}%`, backgroundColor: '#3b82f6'}}></div>
                        </div>
                        <span style={styles.barLabel}>Today</span>
                    </div>

                    <div style={styles.barGroup}>
                        <span style={styles.barValue}>{chartData.average}</span>
                        <div style={styles.barBase}>
                            <div style={{...styles.barFill, height: `${(chartData.average / chartData.max) * 100}%`, backgroundColor: '#94a3b8'}}></div>
                        </div>
                        <span style={styles.barLabel}>Avg</span>
                    </div>
                </div>
                
                <div style={{fontSize:'12px', color:'#94a3b8', textAlign:'center', marginTop:'10px'}}>
                    Metrics are based on your personal dispensing history.
                </div>
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
                <span style={{cursor:'pointer'}}>Help Center</span>
                <span style={{cursor:'pointer'}}>Report Issue</span>
                <span style={{cursor:'pointer'}}>Privacy Policy</span>
            </div>
        </div>

      </div>
    </>
  );
};

export default PharmacistDashboard;