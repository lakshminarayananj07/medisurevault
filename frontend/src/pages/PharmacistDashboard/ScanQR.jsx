import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../../hooks/useAppContext';
import { 
  FaArrowLeft, FaCheckCircle, FaQrcode, FaExclamationTriangle, 
  FaHistory, FaBoxOpen, FaClock, FaSpinner, FaUserMd, FaHospital, FaCalendarAlt, FaSync, FaIdCard
} from 'react-icons/fa';

const ScanQR = () => {
  const [scanResult, setScanResult] = useState(null);
  const [foundPrescription, setFoundPrescription] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  
  // REAL IDENTITY STATE (Replaces the random ID)
  const [pharmacistIdentity, setPharmacistIdentity] = useState(null);

  const { prescriptions, medicinesDB } = useAppContext();
  const navigate = useNavigate();

  // --- 1. IDENTIFY THE PHARMACIST (From Local Storage) ---
  useEffect(() => {
      try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
              const user = JSON.parse(userStr);
              
              // PRIORITY: Use Username (e.g., "kavin_n") as the ID if available
              // If not, fall back to the database _id
              const identity = user.username || user.id || user._id;
              
              if (identity) {
                  setPharmacistIdentity(identity);
                  console.log("✅ Identity Verified:", identity);
              }
          }
      } catch (e) {
          console.error("Login Data Error:", e);
      }
  }, []);

  // --- 2. FETCH HISTORY (Based on Account) ---
  const fetchHistory = async () => {
    if (!pharmacistIdentity) return; 

    try {
      // Fetch history specific to this logged-in account
      const { data } = await axios.get(`http://localhost:5001/api/prescriptions/dispense-history?pharmacistId=${pharmacistIdentity}`);
      
      if (data.success && Array.isArray(data.data)) {
        const formattedHistory = data.data.map(item => {
            const rawDate = item.dispenseDate || item.updatedAt || new Date();
            const dateObj = new Date(rawDate);
            return {
                id: item.prescriptionId || item._id, 
                patient: item.patientName || "Unknown",
                date: !isNaN(dateObj) ? dateObj.toLocaleDateString() : "N/A",
                time: !isNaN(dateObj) ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A",
                itemCount: item.medicines ? item.medicines.length : 0
            };
        });
        setSessionHistory(formattedHistory);
      }
    } catch (error) { 
        console.error("History Error:", error); 
    }
  };

  // Fetch history immediately when identity is confirmed
  useEffect(() => { 
      if(pharmacistIdentity) fetchHistory(); 
  }, [pharmacistIdentity]);

  // --- 3. SCANNER SETUP ---
  useEffect(() => {
    if (!foundPrescription) { 
      const element = document.getElementById('qr-reader');
      if (element) element.innerHTML = "";
      
      const scanner = new Html5QrcodeScanner('qr-reader', { 
          qrbox: { width: 250, height: 250 }, 
          fps: 10, 
          aspectRatio: 1.0, 
          showTorchButtonIfSupported: true 
      });
      
      scanner.render((decodedText) => {
        setScanResult(decodedText);
        scanner.clear();
      }, (err) => console.warn(err));
      
      return () => scanner.clear().catch(err => console.error("Scanner cleanup", err));
    }
  }, [foundPrescription]);

  // --- 4. PROCESS SCAN ---
  useEffect(() => {
    if (scanResult) {
      setErrorMsg('');
      const fetchRx = async () => {
        try {
            const parsedData = JSON.parse(scanResult);
            const rxId = parsedData.id || parsedData.prescriptionId;
            
            // Try Local Context first
            const localRx = prescriptions.find(p => String(p.prescriptionId) === String(rxId));
            
            if (localRx) {
                const detailedMedicines = localRx.medicines.map(med => {
                    const dbInfo = medicinesDB?.find(m => m.id === med.medicineId);
                    return { ...med, name: dbInfo ? dbInfo.name : med.medicineId };
                });
                const issueDate = new Date(localRx.date || Date.now());
                issueDate.setFullYear(issueDate.getFullYear() + 1);

                setFoundPrescription({ 
                    ...localRx, 
                    medicines: detailedMedicines,
                    validationDate: issueDate.toISOString().split('T')[0]
                });
            } else {
                // Try Backend
                setLoading(true);
                try {
                    const { data } = await axios.get(`http://localhost:5001/api/prescriptions/find/${rxId}`);
                    
                    if (data.success) {
                        const apiRx = data.data;
                        const detailedMedicines = apiRx.medicines.map(med => {
                            const dbInfo = medicinesDB?.find(m => m.id === med.medicineId);
                            return { ...med, name: dbInfo ? dbInfo.name : med.medicineId };
                        });
                        const issueDate = new Date(apiRx.date || Date.now());
                        issueDate.setFullYear(issueDate.getFullYear() + 1);
                        
                        setFoundPrescription({ 
                            ...apiRx, 
                            medicines: detailedMedicines,
                            validationDate: apiRx.validationDate || issueDate.toISOString().split('T')[0] 
                        });
                    } else throw new Error("Not Found");
                // eslint-disable-next-line no-unused-vars
                } catch (e) {
                     // Fallback Logic
                     const nextYear = new Date(); nextYear.setFullYear(nextYear.getFullYear() + 1);
                     setFoundPrescription({ 
                         prescriptionId: rxId, 
                         patientName: parsedData.patient || "Unknown", 
                         doctorName: "Unknown", 
                         diagnosis: "Data Offline", 
                         date: new Date().toLocaleDateString(), 
                         validationDate: nextYear.toISOString().split('T')[0], 
                         medicines: [] 
                     });
                } finally { setLoading(false); }
            }
        // eslint-disable-next-line no-unused-vars
        } catch (e) { 
            setErrorMsg('Invalid QR Code'); 
            setScanResult(null); 
        }
      };
      fetchRx();
    }
  }, [scanResult]); 

  // --- 5. DISPENSE ---
  const handleDispense = async () => {
    if (!foundPrescription) return;

    // GUARD: Ensure user is logged in
    if (!pharmacistIdentity) {
        alert("❌ Error: You are not logged in! Please go back to the Login page.");
        return;
    }

    setLoading(true);
    
    try {
        const res = await axios.post("http://localhost:5001/api/prescriptions/dispense", {
            prescriptionId: foundPrescription.prescriptionId,
            pharmacistNote: "Dispensed via Scanner",
            pharmacistId: pharmacistIdentity // 👈 Sends the Real Username/ID
        });

        if (res.data.success) {
            alert("✅ Success! Medicine Dispensed.");
            setTimeout(fetchHistory, 500); 
            handleReset();
        }
    } catch (err) {
        alert("❌ Error: " + (err.response?.data?.error || err.message));
    } finally { setLoading(false); }
  };

  const handleReset = () => {
    setScanResult(null);
    setFoundPrescription(null);
    setErrorMsg('');
  };

  // --- STYLES ---
  const styles = {
    pageContainer: { minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', fontFamily: "'Poppins', sans-serif", gap: '20px', paddingBottom: '20px' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', backgroundColor: '#ffffff', padding: '20px', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    headerContent: { display: 'flex', alignItems: 'center', gap: '15px' },
    headerIcon: { backgroundColor: '#e0f2fe', color: '#0284c7', padding: '12px', borderRadius: '12px', fontSize: '24px', display: 'flex' },
    headerTitle: { margin: 0, fontSize: '26px', fontWeight: '700', color: '#1e293b' },
    headerSubtitle: { margin: 0, fontSize: '14px', color: '#64748b' },
    backBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', color: '#475569', cursor: 'pointer', fontWeight: '500' },
    mainLayout: { display: 'flex', gap: '20px', width: '100%', flex: 1 },
    scanPanel: { flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '30px', position: 'relative' },
    historyPanel: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '25px', maxWidth: '400px' },
    card: { width: '100%', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '25px', backgroundColor: '#fff', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '15px' },
    docName: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' },
    hospitalName: { margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: '500' },
    metaRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '14px' },
    metaLabel: { fontWeight: '600', color: '#64748b', marginRight: '5px' },
    metaValue: { color: '#334155', fontWeight: '500' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { textAlign: 'left', padding: '12px', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '12px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '14px' },
    scannerWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '500px' },
    scannerBox: { width: '100%', borderRadius: '16px', overflow: 'hidden', border: '2px dashed #cbd5e1', background: '#f8fafc', padding: '10px', position: 'relative' },
    scanLine: { position: 'absolute', width: '100%', height: '2px', background: '#3b82f6', top: 0, left: 0, boxShadow: '0 0 4px #3b82f6', animation: 'scanMove 2s infinite linear', zIndex: 5 },
    instructionText: { textAlign: 'center', color: '#64748b' },
    errorBanner: { marginTop: '20px', padding: '12px 20px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600' },
    successWrapper: { width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' },
    successHeader: { textAlign: 'center', marginBottom: '10px' },
    successTitle: { fontSize: '22px', fontWeight: '700', color: '#166534', margin: '10px 0 5px 0' },
    actionGroup: { display: 'flex', gap: '15px', marginTop: '10px', width: '100%', justifyContent: 'center' },
    btnPrimary: { backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' },
    btnSecondary: { backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', padding: '12px 30px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '16px' },
    historyTitle: { fontSize: '18px', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
    historyList: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
    historyItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '10px', borderLeft: '4px solid #10b981' },
    historyName: { fontWeight: '600', fontSize: '14px', color: '#334155' },
    historyMeta: { fontSize: '12px', color: '#64748b' },
    emptyHistory: { textAlign: 'center', color: '#94a3b8', marginTop: '50px', fontSize: '14px', fontStyle: 'italic' },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        #qr-reader { border: none !important; }
        #qr-reader__scan_region { background: white; }
        @keyframes scanMove { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }
      `}</style>

      <div style={styles.pageContainer}>
        
        {/* --- HEADER --- */}
        <div style={styles.topRow}>
          <div style={styles.headerContent}>
            <div style={styles.headerIcon}><FaQrcode /></div>
            <div>
              <h1 style={styles.headerTitle}>Dispense Verification</h1>
              <p style={styles.headerSubtitle}>Scan patient QR code to dispense</p>
            </div>
          </div>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
             <FaArrowLeft /> Back
          </button>
        </div>

        {/* --- MAIN LAYOUT --- */}
        <div style={styles.mainLayout}>
            
            {/* LEFT: SCANNER AREA */}
            <div style={styles.scanPanel}>
                {!foundPrescription ? (
                    <div style={styles.scannerWrapper}>
                        <div style={styles.instructionText}>
                            <h2 style={{fontSize:'20px', color:'#1e293b', marginBottom:'5px'}}>Ready to Scan</h2>
                            <p style={{margin:0}}>Align the QR code within the frame.</p>
                        </div>
                        <div style={styles.scannerBox}>
                             <div style={styles.scanLine}></div> 
                             <div id="qr-reader"></div>
                        </div>
                        {errorMsg && (
                            <div style={styles.errorBanner}><FaExclamationTriangle /> {errorMsg}</div>
                        )}
                    </div>
                ) : (
                    <div style={styles.successWrapper}>
                        <div style={styles.successHeader}>
                            <FaCheckCircle style={{fontSize: '48px', color: '#22c55e'}} />
                            <h2 style={styles.successTitle}>Ready to Dispense</h2>
                            <p style={{color:'#64748b'}}>ID: #{foundPrescription.prescriptionId}</p>
                        </div>

                        {/* --- DETAILS CARD --- */}
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <div>
                                    <h3 style={styles.docName}>
                                        <FaUserMd style={{color:'#3b82f6'}} /> 
                                        Dr. {foundPrescription.doctorName || "Unknown Doctor"}
                                    </h3>
                                    <p style={styles.hospitalName}>
                                        <FaHospital style={{marginRight:'5px'}} />
                                        MediSure Hospital
                                    </p>
                                </div>
                                <div style={{textAlign:'right'}}>
                                    <p style={{margin:0, fontSize:'14px', fontWeight:'600', color:'#334155'}}>
                                        Issued: {foundPrescription.date}
                                    </p>
                                    <p style={{margin:0, fontSize:'12px', fontWeight:'500', color:'#dc2626'}}>
                                        Valid Until: {foundPrescription.validationDate}
                                    </p>
                                </div>
                            </div>

                            <div style={styles.metaRow}>
                                <div>
                                    <span style={styles.metaLabel}>Patient:</span>
                                    <span style={styles.metaValue}>{foundPrescription.patientName || "Unknown"}</span>
                                </div>
                                <div>
                                    <span style={styles.metaLabel}>Diagnosis:</span>
                                    <span style={styles.metaValue}>{foundPrescription.diagnosis}</span>
                                </div>
                            </div>

                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Medicine</th>
                                        <th style={styles.th}>Dosage</th>
                                        <th style={styles.th}>Qty</th>
                                        <th style={styles.th}>Freq</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {foundPrescription.medicines && foundPrescription.medicines.map((med, idx) => (
                                        <tr key={idx}>
                                            <td style={styles.td}><strong>{med.name}</strong><br/><small style={{color:'#94a3b8'}}>{med.type}</small></td>
                                            <td style={styles.td}>{med.strength}</td>
                                            <td style={styles.td}>{med.quantity}</td>
                                            <td style={styles.td}>{med.frequency}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={styles.actionGroup}>
                            <button style={styles.btnSecondary} onClick={handleReset} disabled={loading}>Cancel</button>
                            <button style={styles.btnPrimary} onClick={handleDispense} disabled={loading}>
                                {loading ? (<><FaSpinner className="fa-spin" /> Verifying...</>) : "Confirm Dispense"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT: SESSION HISTORY */}
            <div style={styles.historyPanel}>
                <div style={styles.historyTitle}>
                    <div style={{display:'flex', alignItems:'center'}}>
                        <FaHistory style={{color:'#6366f1', marginRight:'8px'}}/> Your History
                    </div>
                    <button onClick={fetchHistory} style={{background:'none', border:'none', cursor:'pointer', color:'#6366f1'}} title="Refresh History">
                        <FaSync />
                    </button>
                </div>
                
                {/* SHOW REAL IDENTITY */}
                <div style={{fontSize:'11px', color:'#64748b', background:'#f1f5f9', padding:'8px', borderRadius:'6px', marginBottom:'15px', wordBreak:'break-all'}}>
                    <FaIdCard style={{marginRight:'5px'}}/> 
                    <strong>Account:</strong> {pharmacistIdentity || "Please Log In"}
                </div>

                <div style={styles.historyList}>
                    {sessionHistory.length === 0 ? (
                        <div style={styles.emptyHistory}>
                            <FaBoxOpen style={{fontSize:'32px', marginBottom:'10px', opacity:0.5}}/><br/>
                            {pharmacistIdentity ? "No history found for this account." : "Log in to see your history."}<br/>
                        </div>
                    ) : (
                        sessionHistory.map((item, idx) => (
                            <div key={idx} style={styles.historyItem}>
                                <div>
                                    <div style={styles.historyName}>{item.patient}</div>
                                    <div style={styles.historyMeta}>{item.itemCount !== "N/A" ? `${item.itemCount} Medicines` : "External Data"}</div>
                                </div>
                                <div style={{textAlign: 'right', fontSize:'11px', color:'#64748b'}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'4px', justifyContent:'flex-end'}}>
                                        <FaCalendarAlt /> {item.date}
                                    </div>
                                    <div style={{marginTop:'2px'}}>
                                        <FaClock style={{marginRight:'4px'}}/>{item.time}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default ScanQR;