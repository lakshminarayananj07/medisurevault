import React, { useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Link } from 'react-router-dom';
import { 
  FaQrcode, FaClipboardCheck, FaHistory, FaExclamationTriangle, 
  FaArrowRight, FaChartBar, FaUserShield, FaCalendarAlt
} from 'react-icons/fa';

const PharmacistDashboard = () => {
  const { currentUser, prescriptions, inventory } = useAppContext();

  // --- 1. REAL-TIME STATS CALCULATION ---
  const stats = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    }); 

    const todayScans = prescriptions.filter(p => p.date === todayStr).length;
    const totalScans = prescriptions.length;
    const pending = prescriptions.filter(p => p.status === 'Pending' || p.status === 'Prescribed').length;

    return { todayScans, totalScans, pending };
  }, [prescriptions]);

  // --- 2. DYNAMIC INVENTORY LOGIC ---
  const safeInventory = inventory && inventory.length > 0 ? inventory : [
    { name: 'Amoxicillin 500mg', stock: 5 },
    { name: 'Metformin 500mg', stock: 12 },
    { name: 'Paracetamol 650mg', stock: 0 },
    { name: 'Ibuprofen 400mg', stock: 45 },
    { name: 'Cetirizine 10mg', stock: 8 },
  ];

  const sortedLowStock = useMemo(() => {
    return [...safeInventory]
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 3); 
  }, [safeInventory]);

  const getStockStatus = (qty) => {
    if (qty === 0) return { label: 'Out of Stock', color: '#ef4444', bg: '#fee2e2' }; // Red
    if (qty < 20) return { label: 'Critical', color: '#f59e0b', bg: '#fef3c7' }; // Amber
    if (qty < 50) return { label: 'Low', color: '#3b82f6', bg: '#dbeafe' }; // Blue
    return { label: 'Good', color: '#10b981', bg: '#d1fae5' }; // Emerald
  };

  // --- 3. CHART DATA CALCULATION ---
  const chartData = useMemo(() => {
    if (prescriptions.length === 0) return { today: 0, average: 0, max: 10 };
    const uniqueDates = new Set(prescriptions.map(p => p.date));
    const totalDays = uniqueDates.size || 1; 
    const average = Math.round(stats.totalScans / totalDays);
    const max = Math.max(stats.todayScans, average) + 5; 
    return { today: stats.todayScans, average, max };
  }, [stats, prescriptions]);

  // --- STYLES ---
  const styles = {
    pageContainer: {
        minHeight: '92vh',
        width: '99%',
        maxWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        fontFamily: "'Poppins', sans-serif",
        gap: '15px',
    },
    // --- HEADER ---
    topRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '98%',
        backgroundColor: '#ffffff', 
        padding: '20px',            
        borderRadius: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    headerContent: { display: 'flex', alignItems: 'center', gap: '20px' },
    headerIcon: {
        backgroundColor: '#d1fae5', 
        color: '#059669', 
        padding: '12px',
        borderRadius: '12px',
        fontSize: '24px',
        display: 'flex',
    },
    headerTitle: { margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' },
    headerSubtitle: { margin: 0, fontSize: '14px', color: '#64748b' },
    dateBadge: {
        display: 'flex', alignItems: 'center', gap: '8px',
        backgroundColor: '#f8fafc', padding: '8px 16px',
        borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#475569'
    },

    // --- CONTENT PANEL ---
    contentPanel: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '15px', 
        width: '101%',
    },

    // 1. STATS ROW
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
    },
    // Base Card Style
    statCard: {
        borderRadius: '16px',
        padding: '25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        color: '#ffffff' // White text for colored cards
    },
    // Specific Gradients (Restoring the previous look)
    cardBlue: {
        background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)', // Blue Gradient
    },
    cardTeal: {
        background: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)', // Teal Gradient
    },
    cardPurple: {
        background: 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)', // Purple Gradient
    },

    statValue: { fontSize: '28px', fontWeight: '700', margin: 0, color: '#ffffff' },
    statLabel: { fontSize: '14px', marginTop: '4px', opacity: 0.9, color: '#ffffff' },
    
    // Transparent Icon Box for Colored Cards
    statIconBox: {
        width: '50px', height: '50px', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white
        backdropFilter: 'blur(5px)',
        color: '#ffffff'
    },

    // 2. BOTTOM GRID (Inventory & Charts)
    bottomGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
    },
    dashboardCard: {
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        padding: '25px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '350px'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '15px'
    },
    cardTitle: { margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' },
    cardSubtitle: { fontSize: '12px', color: '#94a3b8', fontWeight: '500' },

    stockList: { flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' },
    stockItem: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px'
    },
    stockName: { fontWeight: '600', color: '#334155', fontSize: '14px' },
    statusBadge: {
        padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase'
    },
    stockCount: { fontSize: '13px', fontWeight: '600', color: '#64748b' },
    
    viewAllLink: {
        marginTop: '20px', textDecoration: 'none', color: '#059669', 
        fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px'
    },

    chartContainer: {
        flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '20px'
    },
    barGroup: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '60px' },
    barValue: { fontSize: '14px', fontWeight: '700', color: '#1e293b' },
    barBase: {
        width: '100%', backgroundColor: '#f1f5f9', borderRadius: '8px', 
        position: 'relative', overflow: 'hidden', height: '150px' 
    },
    barFill: {
        width: '100%', position: 'absolute', bottom: 0, left: 0, borderRadius: '8px',
        transition: 'height 1s ease-in-out'
    },
    barLabel: { fontSize: '13px', fontWeight: '600', color: '#64748b' }
  };

  return (
    <>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`}
      </style>

      <div style={styles.pageContainer}>
        
        {/* --- 1. HEADER SECTION --- */}
        <div style={styles.topRow}>
          <div style={styles.headerContent}>
            <div style={styles.headerIcon}><FaUserShield /></div>
            <div>
              <h1 style={styles.headerTitle}>Welcome, {currentUser?.name || 'Pharmacist'}</h1>
              <p style={styles.headerSubtitle}>Inventory & Dispensing Overview</p>
            </div>
          </div>
          <div style={styles.dateBadge}>
            <FaCalendarAlt /> 
            {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* --- 2. CONTENT PANEL --- */}
        <div style={styles.contentPanel}>
            
            {/* STATS ROW (Now with Gradient Colors) */}
            <div style={styles.statsGrid}>
                {/* Card 1: Blue Gradient */}
                <div style={{...styles.statCard, ...styles.cardBlue}}>
                    <div>
                        <h3 style={styles.statValue}>{stats.todayScans}</h3>
                        <span style={styles.statLabel}>Scanned Today</span>
                    </div>
                    <div style={styles.statIconBox}>
                        <FaQrcode />
                    </div>
                </div>

                {/* Card 2: Teal Gradient */}
                <div style={{...styles.statCard, ...styles.cardTeal}}>
                    <div>
                        <h3 style={styles.statValue}>{stats.totalScans}</h3>
                        <span style={styles.statLabel}>Total Processed</span>
                    </div>
                    <div style={styles.statIconBox}>
                        <FaHistory />
                    </div>
                </div>

                {/* Card 3: Purple Gradient */}
                <div style={{...styles.statCard, ...styles.cardPurple}}>
                    <div>
                        <h3 style={styles.statValue}>{stats.pending}</h3>
                        <span style={styles.statLabel}>Pending Review</span>
                    </div>
                    <div style={styles.statIconBox}>
                        <FaClipboardCheck />
                    </div>
                </div>
            </div>

            {/* BOTTOM SPLIT VIEW */}
            <div style={styles.bottomGrid}>
                
                {/* LEFT: STOCK ALERTS */}
                <div style={styles.dashboardCard}>
                    <div style={styles.cardHeader}>
                        <div>
                            <h3 style={styles.cardTitle}><FaExclamationTriangle style={{color:'#ef4444'}}/> Stock Alerts</h3>
                            <span style={styles.cardSubtitle}>Lowest quantity items shown first</span>
                        </div>
                    </div>
                    
                    <div style={styles.stockList}>
                        {sortedLowStock.map((item, idx) => {
                            const status = getStockStatus(item.stock);
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
                        })}
                    </div>

                    <Link to="/inventory" style={styles.viewAllLink}>
                        Manage Inventory <FaArrowRight />
                    </Link>
                </div>

                {/* RIGHT: ANALYTICS CHART */}
                <div style={styles.dashboardCard}>
                    <div style={styles.cardHeader}>
                        <div>
                            <h3 style={styles.cardTitle}><FaChartBar style={{color:'#3b82f6'}}/> Dispensing Analytics</h3>
                            <span style={styles.cardSubtitle}>Live performance metrics</span>
                        </div>
                    </div>

                    <div style={styles.chartContainer}>
                        {/* Today Bar */}
                        <div style={styles.barGroup}>
                            <span style={styles.barValue}>{chartData.today}</span>
                            <div style={styles.barBase}>
                                <div style={{...styles.barFill, height: `${(chartData.today / chartData.max) * 100}%`, backgroundColor: '#3b82f6'}}></div>
                            </div>
                            <span style={styles.barLabel}>Today</span>
                        </div>

                        {/* Average Bar */}
                        <div style={styles.barGroup}>
                            <span style={styles.barValue}>{chartData.average}</span>
                            <div style={styles.barBase}>
                                <div style={{...styles.barFill, height: `${(chartData.average / chartData.max) * 100}%`, backgroundColor: '#94a3b8'}}></div>
                            </div>
                            <span style={styles.barLabel}>Avg</span>
                        </div>
                    </div>
                    
                    <div style={{fontSize:'12px', color:'#94a3b8', textAlign:'center', marginTop:'10px'}}>
                        Metrics update automatically based on scan activity.
                    </div>
                </div>

            </div>
        </div>

      </div>
    </>
  );
};

export default PharmacistDashboard;