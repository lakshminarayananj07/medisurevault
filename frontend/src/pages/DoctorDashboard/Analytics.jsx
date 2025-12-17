import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title 
} from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import { FaChartLine, FaSyncAlt, FaCalendarAlt } from 'react-icons/fa';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Analytics = () => {
  const { currentUser, prescriptions = [], medicinesDB = [] } = useAppContext();
  const [volumeTimeframe, setVolumeTimeframe] = useState('week'); 
  const [issuesTimeframe, setIssuesTimeframe] = useState('week'); 

  // --- Real-Time Data Processing ---
  const processedData = useMemo(() => {
    if (!currentUser || !prescriptions) return null;

    // 1. Filter for Current Doctor
    const doctorPrescriptions = prescriptions.filter(p => 
      String(p.doctorId) === String(currentUser.id || currentUser._id)
    );

    // Helper: Filter by Timeframe
    const filterByTime = (data, timeframe) => {
      const now = new Date();
      if (timeframe === 'day') {
        return data.filter(p => {
          const pDate = new Date(p.date);
          return pDate.toDateString() === new Date().toDateString();
        });
      }
      if (timeframe === 'week') {
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        return data.filter(p => new Date(p.date) >= oneWeekAgo);
      }
      if (timeframe === 'year') {
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        return data.filter(p => new Date(p.date) >= oneYearAgo);
      }
      return data;
    };

    // --- Chart 1: Volume Data ---
    const getVolumeData = () => {
      const data = filterByTime(doctorPrescriptions, volumeTimeframe);
      // Grouping by date for better visualization if needed, currently total count
      // For a simple bar of "Total", we keep it simple. 
      return {
        labels: ['Total Prescriptions'],
        datasets: [{ 
          label: 'Count', 
          data: [data.length], 
          backgroundColor: '#0f172a', // Midnight Blue
          borderRadius: 8,
          barThickness: 50
        }]
      };
    };

    // --- Chart 2: Patient Status ---
    const getPatientStatusData = () => {
      const seenPatients = new Set();
      let newCount = 0;
      let returningCount = 0;
      
      const sorted = [...doctorPrescriptions].sort((a, b) => new Date(a.date) - new Date(b.date));

      sorted.forEach(p => {
        if (seenPatients.has(p.patientId)) {
          returningCount++;
        } else {
          newCount++;
          seenPatients.add(p.patientId);
        }
      });

      return {
        labels: ['New Patients', 'Returning Patients'],
        datasets: [{ 
          data: [newCount, returningCount], 
          backgroundColor: ['#3b82f6', '#bae6fd'], // Bright Blue & Light Blue
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      };
    };

    // --- Chart 3: Top Medications ---
    const getTopMedicationsData = () => {
      const medCounts = {};
      
      doctorPrescriptions.forEach(p => {
        if(p.medicines) {
          p.medicines.forEach(med => {
            let medName = 'Unknown';
            if (medicinesDB.length > 0) {
                const found = medicinesDB.find(m => m.id === med.medicineId);
                if (found) medName = found.name;
            }
            if (medName === 'Unknown' && med.medicineId) medName = med.medicineId;

            medCounts[medName] = (medCounts[medName] || 0) + 1;
          });
        }
      });

      const sortedMeds = Object.entries(medCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      return {
        labels: sortedMeds.map(([name]) => name),
        datasets: [{ 
          data: sortedMeds.map(([, count]) => count), 
          backgroundColor: ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8'], 
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      };
    };

    // --- Chart 4: Top Issues (Diagnosis) ---
    const getTopIssuesData = () => {
      const data = filterByTime(doctorPrescriptions, issuesTimeframe);
      const issueCounts = data.reduce((acc, p) => {
        if (p.diagnosis) acc[p.diagnosis] = (acc[p.diagnosis] || 0) + 1;
        return acc;
      }, {});

      const sortedIssues = Object.entries(issueCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      return {
        labels: sortedIssues.map(([name]) => name),
        datasets: [{ 
          label: 'Cases', 
          data: sortedIssues.map(([, count]) => count), 
          backgroundColor: '#3b82f6', 
          borderRadius: 6
        }]
      };
    };

    return { getVolumeData, getPatientStatusData, getTopMedicationsData, getTopIssuesData };
  }, [currentUser, prescriptions, medicinesDB, volumeTimeframe, issuesTimeframe]);

  // --- Chart Configuration ---
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#334155', font: { family: "'Poppins', sans-serif", size: 12 } }
      }
    }
  };

  const axisOptions = {
    ...commonOptions,
    scales: {
      x: { 
        grid: { color: '#f1f5f9' }, 
        ticks: { color: '#64748b', font: { family: "'Poppins', sans-serif" } } 
      },
      y: { 
        grid: { color: '#f1f5f9' }, 
        ticks: { color: '#64748b', precision: 0, font: { family: "'Poppins', sans-serif" } } 
      }
    }
  };

  const horizontalOptions = {
    ...axisOptions,
    indexAxis: 'y',
    plugins: { legend: { display: false } }
  };

  // --- STYLES ---
  const styles = {
    pageContainer: {
        minHeight: '100vh',
        width: '99%',
        maxWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        fontFamily: "'Poppins', sans-serif",
        gap: '20px'
    },
    // Header
    topRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '98%',
        backgroundColor: '#ffffff', 
        padding: '20px',            
        borderRadius: '20px', 
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
    liveIndicator: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#ecfdf5',
        color: '#059669',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        border: '1px solid #d1fae5'
    },
    spinIcon: {
        animation: 'spin 2s linear infinite'
    },

    // Grid Layout
    chartsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', // Responsive grid
        gap: '20px',
        width: '101%',
    },
    
    // Cards
    chartCard: {
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        padding: '25px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '400px',
        boxSizing: 'border-box'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '15px'
    },
    cardTitle: {
        margin: 0,
        fontSize: '18px',
        fontWeight: '600',
        color: '#1e293b'
    },
    
    // Toggle Buttons
    toggleContainer: {
        display: 'flex',
        backgroundColor: '#f1f5f9',
        borderRadius: '8px',
        padding: '4px'
    },
    toggleBtn: {
        border: 'none',
        background: 'transparent',
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: '500',
        color: '#64748b',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    activeBtn: {
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontWeight: '600',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },

    // Chart Canvas Wrapper
    chartWrapper: {
        position: 'relative',
        height: '300px',
        width: '100%',
        display: 'flex',
        justifyContent: 'center'
    },
    loadingState: {
        display: 'flex', 
        justifyContent:'center', 
        alignItems:'center', 
        height:'50vh', 
        color:'#64748b', 
        fontFamily:"'Poppins', sans-serif"
    }
  };

  if (!processedData) return <div style={styles.loadingState}>Loading Analytics...</div>;

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}
      </style>

      <div style={styles.pageContainer}>
        
        {/* --- HEADER --- */}
        <div style={styles.topRow}>
          <div style={styles.headerContent}>
            <div style={styles.headerIcon}><FaChartLine /></div>
            <div>
              <h1 style={styles.headerTitle}>Practice Analytics</h1>
              <p style={styles.headerSubtitle}>Real-time insights and statistics</p>
            </div>
          </div>
          <div style={styles.liveIndicator}>
            <FaSyncAlt style={styles.spinIcon} /> Live Data Sync
          </div>
        </div>

        {/* --- CHARTS GRID --- */}
        <div style={styles.chartsGrid}>
          
          {/* Chart 1: Volume */}
          <div style={styles.chartCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Prescription Volume</h3>
              <div style={styles.toggleContainer}>
                {['day', 'week', 'year'].map(t => (
                    <button 
                        key={t}
                        onClick={() => setVolumeTimeframe(t)} 
                        style={{...styles.toggleBtn, ...(volumeTimeframe === t ? styles.activeBtn : {})}}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
              </div>
            </div>
            <div style={styles.chartWrapper}>
              <Bar data={processedData.getVolumeData()} options={axisOptions} />
            </div>
          </div>

          {/* Chart 2: New vs Returning */}
          <div style={styles.chartCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Patient Demographics</h3>
              <FaCalendarAlt style={{color:'#cbd5e1'}}/>
            </div>
            <div style={styles.chartWrapper}>
              <Doughnut data={processedData.getPatientStatusData()} options={commonOptions} />
            </div>
          </div>

          {/* Chart 3: Top Medications */}
          <div style={styles.chartCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Most Prescribed</h3>
              <FaCalendarAlt style={{color:'#cbd5e1'}}/>
            </div>
            <div style={styles.chartWrapper}>
              <Pie data={processedData.getTopMedicationsData()} options={commonOptions} />
            </div>
          </div>
          
          {/* Chart 4: Top Diagnoses */}
          <div style={styles.chartCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Top Diagnoses</h3>
               <div style={styles.toggleContainer}>
                {['day', 'week', 'year'].map(t => (
                    <button 
                        key={t}
                        onClick={() => setIssuesTimeframe(t)} 
                        style={{...styles.toggleBtn, ...(issuesTimeframe === t ? styles.activeBtn : {})}}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
              </div>
            </div>
            <div style={styles.chartWrapper}>
              <Bar options={horizontalOptions} data={processedData.getTopIssuesData()} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Analytics;