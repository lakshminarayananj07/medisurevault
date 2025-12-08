import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import './Analytics.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Analytics = () => {
  const { currentUser, prescriptions, medicinesDB} = useAppContext();
  const [volumeTimeframe, setVolumeTimeframe] = useState('week'); // 'day', 'week', 'year'
  const [issuesTimeframe, setIssuesTimeframe] = useState('week'); // 'day', 'week', 'year'

  // Memoize calculations to prevent re-computing on every render
  const processedData = useMemo(() => {
    if (!currentUser || !prescriptions || !medicinesDB) return null;

    const doctorPrescriptions = prescriptions.filter(p => p.doctorId === currentUser.id);

    // --- Time Filter Helper ---
    const filterByTime = (data, timeframe) => {
      const now = new Date();
      if (timeframe === 'day') {
        return data.filter(p => new Date(p.date).toDateString() === now.toDateString());
      }
      if (timeframe === 'week') {
        const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
        return data.filter(p => new Date(p.date) >= oneWeekAgo);
      }
      if (timeframe === 'year') {
        const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
        return data.filter(p => new Date(p.date) >= oneYearAgo);
      }
      return data;
    };

    // --- Chart 1: Patient Volume ---
    const getVolumeData = () => {
      const data = filterByTime(doctorPrescriptions, volumeTimeframe);
      return {
        labels: ['Prescriptions'],
        datasets: [{ label: `Total Prescriptions (${volumeTimeframe})`, data: [data.length], backgroundColor: '#3A86FF' }]
      };
    };

    // --- Chart 2: New vs Returning Patients ---
    const getPatientStatusData = () => {
      const seenPatients = new Set();
      let newCount = 0;
      let returningCount = 0;
      doctorPrescriptions.forEach(p => {
        if (seenPatients.has(p.patientId)) {
          returningCount++;
        } else {
          newCount++;
          seenPatients.add(p.patientId);
        }
      });
      return {
        labels: ['New Patients', 'Returning Patients'],
        datasets: [{ data: [newCount, returningCount], backgroundColor: ['#2ECC71', '#FFA500'] }]
      };
    };

    // --- Chart 3: Top 5 Medications ---
    const getTopMedicationsData = () => {
      const medCounts = doctorPrescriptions.flatMap(p => p.medicines).reduce((acc, med) => {
        const medName = medicinesDB.find(m => m.id === med.medicineId)?.name || 'Unknown';
        acc[medName] = (acc[medName] || 0) + 1;
        return acc;
      }, {});
      const sortedMeds = Object.entries(medCounts).sort(([, a], [, b]) => b - a).slice(0, 5);
      return {
        labels: sortedMeds.map(([name]) => name),
        datasets: [{ data: sortedMeds.map(([, count]) => count), backgroundColor: ['#FF006E', '#3A86FF', '#2ECC71', '#FFA500', '#9b59b6'] }]
      };
    };

    // --- Chart 4: Top 10 Patient Issues ---
    const getTopIssuesData = () => {
      const data = filterByTime(doctorPrescriptions, issuesTimeframe);
      const issueCounts = data.reduce((acc, p) => {
        if (p.diagnosis) acc[p.diagnosis] = (acc[p.diagnosis] || 0) + 1;
        return acc;
      }, {});
      const sortedIssues = Object.entries(issueCounts).sort(([, a], [, b]) => b - a).slice(0, 10);
      return {
        labels: sortedIssues.map(([name]) => name),
        datasets: [{ label: `Number of Cases (${issuesTimeframe})`, data: sortedIssues.map(([, count]) => count), backgroundColor: '#FF006E' }]
      };
    };

    return { getVolumeData, getPatientStatusData, getTopMedicationsData, getTopIssuesData };
  }, [currentUser, prescriptions, medicinesDB, volumeTimeframe, issuesTimeframe]);


  if (!processedData) return <h2>Loading analytics data...</h2>;

  const barOptions = { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } } };

  return (
    <div className="analytics-container">
      <h2>Your Analytics Dashboard</h2>
      <div className="charts-grid">
        
        <div className="chart-card">
          <div className="chart-header">
            <h3>Patient Volume</h3>
            <div className="time-toggle">
              <button onClick={() => setVolumeTimeframe('day')} className={volumeTimeframe === 'day' ? 'active' : ''}>Day</button>
              <button onClick={() => setVolumeTimeframe('week')} className={volumeTimeframe === 'week' ? 'active' : ''}>Week</button>
              <button onClick={() => setVolumeTimeframe('year')} className={volumeTimeframe === 'year' ? 'active' : ''}>Year</button>
            </div>
          </div>
          <Bar data={processedData.getVolumeData()} />
        </div>

        <div className="chart-card">
          <h3>New vs. Returning Patients</h3>
          <Doughnut data={processedData.getPatientStatusData()} />
        </div>

        <div className="chart-card">
          <h3>Top 5 Prescribed Medications</h3>
          <Pie data={processedData.getTopMedicationsData()} />
        </div>
        
        <div className="chart-card">
          <div className="chart-header">
            <h3>Top 10 Patient Issues</h3>
             <div className="time-toggle">
              <button onClick={() => setIssuesTimeframe('day')} className={issuesTimeframe === 'day' ? 'active' : ''}>Day</button>
              <button onClick={() => setIssuesTimeframe('week')} className={issuesTimeframe === 'week' ? 'active' : ''}>Week</button>
              <button onClick={() => setIssuesTimeframe('year')} className={issuesTimeframe === 'year' ? 'active' : ''}>Year</button>
            </div>
          </div>
          <Bar options={barOptions} data={processedData.getTopIssuesData()} />
        </div>

      </div>
    </div>
  );
};

export default Analytics;