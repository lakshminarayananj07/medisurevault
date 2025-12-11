import React, { useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Link } from 'react-router-dom';
import './PharmacistDashboard.css';
import { 
  FaQrcode, 
  FaClipboardCheck, 
  FaHistory, 
  FaExclamationTriangle, 
  FaArrowRight,
  FaChartBar,
  FaPills,
  FaBoxOpen
} from 'react-icons/fa';

const PharmacistDashboard = () => {
  // Access real data from Context
  const { currentUser, prescriptions, inventory } = useAppContext();

  // --- 1. REAL-TIME STATS CALCULATION ---
  const stats = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    }); // Matches standard format e.g. "Dec 10, 2025"

    // Filter scans that happened today
    const todayScans = prescriptions.filter(p => p.date === todayStr).length;
    const totalScans = prescriptions.length;
    // Count pending (Assuming 'Prescribed' needs verification or 'Pending' status)
    const pending = prescriptions.filter(p => p.status === 'Pending' || p.status === 'Prescribed').length;

    return { todayScans, totalScans, pending };
  }, [prescriptions]);

  // --- 2. DYNAMIC INVENTORY LOGIC ---
  // If inventory exists in context, use it. Otherwise, use a safe fallback to prevent crashes.
  const safeInventory = inventory && inventory.length > 0 ? inventory : [
    { name: 'Amoxicillin 500mg', stock: 5 },
    { name: 'Metformin 500mg', stock: 12 },
    { name: 'Paracetamol 650mg', stock: 0 },
    { name: 'Ibuprofen 400mg', stock: 45 },
    { name: 'Cetirizine 10mg', stock: 8 },
  ];

  const sortedLowStock = useMemo(() => {
    return [...safeInventory]
      .sort((a, b) => a.stock - b.stock) // Sort lowest first
      .slice(0, 3); // Take only top 3
  }, [safeInventory]);

  // Helper to determine status color/label
  const getStockStatus = (qty) => {
    if (qty === 0) return { label: 'Out of Stock', class: 'out' };
    if (qty < 20) return { label: 'Critical', class: 'critical' };
    if (qty < 50) return { label: 'Low', class: 'low' };
    return { label: 'Good', class: 'good' };
  };

  // --- 3. CHART DATA CALCULATION ---
  const chartData = useMemo(() => {
    if (prescriptions.length === 0) return { today: 0, average: 0, max: 10 };

    // Calculate unique days to find true average
    const uniqueDates = new Set(prescriptions.map(p => p.date));
    const totalDays = uniqueDates.size || 1; 
    
    const average = Math.round(stats.totalScans / totalDays);
    // Dynamic max value for chart scaling (add buffer)
    const max = Math.max(stats.todayScans, average) + 5; 

    return { today: stats.todayScans, average, max };
  }, [stats, prescriptions]);

  return (
    <div className="pharmacist-dashboard-page">
      
      {/* --- HEADER --- */}
      <div className="dashboard-header-row">
        <div className="header-text">
          <h1>Welcome, {currentUser?.name || 'Pharmacist'}</h1>
          <p>Inventory & Dispensing Overview</p>
        </div>
        <div className="date-badge">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* --- TOP STATS ROW (Dynamic & Colored) --- */}
      <div className="stats-grid">
        {/* Card 1: Today's Scans (Blue Gradient) */}
        <div className="stat-card gradient-blue">
          <div className="stat-content">
            <h3>{stats.todayScans}</h3>
            <span>Scanned Today</span>
          </div>
          <div className="stat-icon-box">
            <FaQrcode />
          </div>
        </div>

        {/* Card 2: Total Processed (Teal Gradient) */}
        <div className="stat-card gradient-teal">
          <div className="stat-content">
            <h3>{stats.totalScans}</h3>
            <span>Total Processed</span>
          </div>
          <div className="stat-icon-box">
            <FaHistory />
          </div>
        </div>

        {/* Card 3: Pending Review (Purple Gradient) */}
        <div className="stat-card gradient-purple">
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <span>Pending Review</span>
          </div>
          <div className="stat-icon-box">
            <FaClipboardCheck />
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION --- */}
      <div className="dashboard-bottom-grid">
        
        {/* LEFT: DYNAMIC STOCK ALERTS */}
        <div className="dashboard-card stock-card">
          <div className="card-header">
            <h3>
              <FaExclamationTriangle className="icon-red" /> Stock Alerts
            </h3>
            <span className="subtitle">Lowest quantity items shown first</span>
          </div>

          <div className="stock-list">
            {sortedLowStock.map((item, idx) => {
              const status = getStockStatus(item.stock);
              return (
                <div key={idx} className="stock-item-row">
                  <div className="stock-info">
                    <span className="stock-name">{item.name}</span>
                    <span className={`stock-status ${status.class}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="stock-right">
                    <div className="stock-count-badge">
                      {item.stock} left
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card-footer">
            <Link to="/inventory" className="view-all-btn">
              Manage Inventory <FaArrowRight />
            </Link>
          </div>
        </div>

        {/* RIGHT: REAL-TIME ANALYTICS CHART */}
        <div className="dashboard-card chart-card">
          <div className="card-header">
            <h3>
              <FaChartBar className="icon-blue" /> Dispensing Analytics
            </h3>
            <span className="subtitle">Real-time Performance Metrics</span>
          </div>

          <div className="custom-bar-chart">
            {/* Bar 1: Today */}
            <div className="chart-column">
              <span className="bar-value">{chartData.today}</span>
              <div 
                className="bar-fill today-bar" 
                style={{ height: `${(chartData.today / chartData.max) * 100}%` }}
              ></div>
              <span className="bar-label">Today</span>
            </div>

            {/* Bar 2: Average */}
            <div className="chart-column">
              <span className="bar-value">{chartData.average}</span>
              <div 
                className="bar-fill average-bar" 
                style={{ height: `${(chartData.average / chartData.max) * 100}%` }}
              ></div>
              <span className="bar-label">Daily Avg</span>
            </div>
          </div>
          
          <div className="chart-footer-info">
            <p>Average calculated based on total scans over operational days.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PharmacistDashboard;