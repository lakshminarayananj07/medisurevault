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
import './Analytics.css';
import { FaChartLine, FaSyncAlt } from 'react-icons/fa';

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
      // Reset hours to ensure accurate day comparison
      
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
      
      // Sort by date to determine "First Time" vs "Returning" accurately
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
          backgroundColor: ['#3b82f6', '#0ea5e9'], // Blue & Sky Blue
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
            // Try to find name in DB, fallback to ID if not found
            let medName = 'Unknown';
            if (medicinesDB.length > 0) {
                const found = medicinesDB.find(m => m.id === med.medicineId);
                if (found) medName = found.name;
            }
            // If still unknown, maybe the ID itself is the name in old data
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
          backgroundColor: ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8'], // Slate Gradients
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
          backgroundColor: '#3b82f6', // Bright Blue
          borderRadius: 6
        }]
      };
    };

    return { getVolumeData, getPatientStatusData, getTopMedicationsData, getTopIssuesData };
  }, [currentUser, prescriptions, medicinesDB, volumeTimeframe, issuesTimeframe]);

  // --- Chart Configuration (Theme) ---
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#334155', font: { family: 'Inter', size: 12 } }
      }
    }
  };

  const axisOptions = {
    ...commonOptions,
    scales: {
      x: { 
        grid: { color: '#f1f5f9' }, 
        ticks: { color: '#64748b' } 
      },
      y: { 
        grid: { color: '#f1f5f9' }, 
        ticks: { color: '#64748b', precision: 0 } 
      }
    }
  };

  const horizontalOptions = {
    ...axisOptions,
    indexAxis: 'y',
    plugins: { legend: { display: false } }
  };

  if (!processedData) return <div className="loading-state">Loading Analytics...</div>;

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2><FaChartLine style={{marginRight:'10px'}}/> Practice Analytics</h2>
        <div className="live-indicator">
            <FaSyncAlt className="spin-icon" /> Live Data
        </div>
      </div>

      <div className="charts-grid">
        
        {/* Chart 1: Volume */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Prescription Volume</h3>
            <div className="time-toggle">
              <button onClick={() => setVolumeTimeframe('day')} className={volumeTimeframe === 'day' ? 'active' : ''}>Day</button>
              <button onClick={() => setVolumeTimeframe('week')} className={volumeTimeframe === 'week' ? 'active' : ''}>Week</button>
              <button onClick={() => setVolumeTimeframe('year')} className={volumeTimeframe === 'year' ? 'active' : ''}>Year</button>
            </div>
          </div>
          <div className="chart-wrapper">
            <Bar data={processedData.getVolumeData()} options={axisOptions} />
          </div>
        </div>

        {/* Chart 2: New vs Returning */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Patient Demographics</h3>
          </div>
          <div className="chart-wrapper doughnut-wrapper">
            <Doughnut data={processedData.getPatientStatusData()} options={commonOptions} />
          </div>
        </div>

        {/* Chart 3: Top Medications */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Most Prescribed</h3>
          </div>
          <div className="chart-wrapper pie-wrapper">
            <Pie data={processedData.getTopMedicationsData()} options={commonOptions} />
          </div>
        </div>
        
        {/* Chart 4: Top Diagnoses */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Top Diagnoses</h3>
             <div className="time-toggle">
              <button onClick={() => setIssuesTimeframe('day')} className={issuesTimeframe === 'day' ? 'active' : ''}>Day</button>
              <button onClick={() => setIssuesTimeframe('week')} className={issuesTimeframe === 'week' ? 'active' : ''}>Week</button>
              <button onClick={() => setIssuesTimeframe('year')} className={issuesTimeframe === 'year' ? 'active' : ''}>Year</button>
            </div>
          </div>
          <div className="chart-wrapper">
            <Bar options={horizontalOptions} data={processedData.getTopIssuesData()} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;