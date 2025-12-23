import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../../hooks/useAppContext';
import { 
  FaArrowLeft, FaCheckCircle, FaQrcode, FaExclamationTriangle, 
  FaHistory, FaBoxOpen, FaClock, FaSpinner, FaUserMd, FaHospital, FaCalendarAlt, FaSync
} from 'react-icons/fa';

const ScanQR = () => {
  const [scanResult, setScanResult] = useState(null);
  const [foundPrescription, setFoundPrescription] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // HISTORY STATE
  const [sessionHistory, setSessionHistory] = useState([]);

  const { prescriptions, medicinesDB } = useAppContext();
  const navigate = useNavigate();

  // --- HELPER: USER ID FINDER ---
  const getUserId = () => {
      try {
          const userStr = localStorage.getItem('user');
          if (!userStr) return null; // Not logged in

          const user = JSON.parse(userStr);
          // Check common locations for ID
          return user.id || user._id || (user.data && user.data.id) || null;
      } catch (e) {
          return null;
      }
  };

  // --- 1. FETCH HISTORY ---
  const fetchHistory = async () => {
    try {
      const pharmacistId = getUserId();
      // Send ID if we have it, otherwise send blank (Backend now handles this!)
      const { data } = await axios.get(`http://localhost:5001/api/prescriptions/dispense-history?pharmacistId=${pharmacistId || ''}`);
      
      if (data.success && Array.isArray(data.data)) {
        const formattedHistory = data.data.map(item => {
            const rawDate = item.dispenseDate || item.updatedAt || new Date();
            const dateObj = new Date(rawDate);

            return {
                id: item.prescriptionId || item._id, 
                patient: item.patientName || "Unknown Patient",
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

  useEffect(() => {
    fetchHistory();
  }, []);

  // --- 2. SCANNER ---
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

      const onScanSuccess = (decodedText) => {
        setScanResult(decodedText);
        scanner.clear();
      };

      scanner.render(onScanSuccess, (err) => console.warn(err));

      return () => {
        scanner.clear().catch(err => console.error("Scanner cleanup", err));
      };
    }
  }, [foundPrescription]);

  // --- 3. PROCESS SCAN ---
  useEffect(() => {
    if (scanResult) {
      setErrorMsg('');
      const fetchPrescriptionDetails = async () => {
        try {
            const parsedData = JSON.parse(scanResult);
            const rxIdToCheck = parsedData.id || parsedData.prescriptionId;
            
            // Try Local Context
            const localRx = prescriptions.find(p => String(p.prescriptionId) === String(rxIdToCheck));

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
                    const { data } = await axios.get(`http://localhost:5001/api/prescriptions/find/${rxIdToCheck}`);
                    
                    if (data.success && data.data) {
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
                    } else {
                        throw new Error("Prescription not found in Database.");
                    }
                } catch (apiError) {
                    console.error("API Fetch Error:", apiError);
                    const fallbackDate = new Date();
                    fallbackDate.setFullYear(fallbackDate.getFullYear() + 1);
                    setFoundPrescription({
                        prescriptionId: rxIdToCheck,
                        patientName: parsedData.patient || "Unknown",
                        doctorName: "Unknown",
                        diagnosis: "Data not available",
                        date: new Date().toLocaleDateString('en-CA'),
                        validationDate: fallbackDate.toISOString().split('T')[0],
                        medicines: [] 
                    });
                } finally {
                    setLoading(false);
                }
            }
        } catch (err) {
            setErrorMsg('Invalid QR Code format.');
            setScanResult(null);
        }
      };
      fetchPrescriptionDetails();
    }
  }, [scanResult, prescriptions, medicinesDB]);

  // --- 4. DISPENSE ---
  const handleDispense = async () => {
    if (!foundPrescription) return;
    setLoading(true);
    
    try {
        const pharmacistId = getUserId();
        // If ID is missing, we send 'null', but Backend will now handle it gracefully
        
        const response = await axios.post("http://localhost:5001/api/prescriptions/dispense", {
            prescriptionId: foundPrescription.prescriptionId,
            pharmacistNote: "Dispensed via Scanner",
            pharmacistId: pharmacistId 
        });

        if (response.data.success) {
            alert(`✅ Success! Medicine Dispensed.`);
            setTimeout(async () => {
                await fetchHistory();
            }, 500);
            handleReset();
        }
    } catch (error) {
        console.error("Dispense Error:", error);
        alert(`❌ Dispense Failed: ${error.response?.data?.error || error.message}`);
    } finally {
        setLoading(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setFoundPrescription(null);
    setErrorMsg('');
  };

  // --- STYLES (Unchanged) ---
  const styles = {
    pageContainer: { minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', fontFamily: "'Poppins', sans-serif", gap: '20px', paddingBottom: '20px' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', backgroundColor: '#ffffff', padding: '20px', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    headerContent: { display: 'flex', alignItems: 'center', gap: '15px' },
    headerIcon: { backgroundColor: '#e0f2fe', color: '#0284c7', padding: '12px', borderRadius: '12px', fontSize: '24px', display: 'flex' },
    headerTitle: { margin: 0, fontSize: '26px', fontWeight: '700', color: '#1e293b' },
    headerSubtitle: { margin: 0, fontSize: '14px', color: '#64748b' },
    backBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', color: '#475569', cursor: 'pointer', fontWeight: '500' },
    mainLayout: { display: 'flex', gap: '20px', width: '100%', flex: 1 },
    scanPanel: { flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative' },
    historyPanel: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '25px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', maxWidth: '400px' },
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
          {/* Force Dashboard Refresh on Back */}
          <button style={styles.backBtn} onClick={() => window.location.href = '/dashboard'}>
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
                        <FaHistory style={{color:'#6366f1', marginRight:'8px'}}/> Session History
                    </div>
                    <button onClick={fetchHistory} style={{background:'none', border:'none', cursor:'pointer', color:'#6366f1'}} title="Refresh History">
                        <FaSync />
                    </button>
                </div>
                <div style={styles.historyList}>
                    {sessionHistory.length === 0 ? (
                        <div style={styles.emptyHistory}>
                            <FaBoxOpen style={{fontSize:'32px', marginBottom:'10px', opacity:0.5}}/><br/>
                            No items dispensed yet.<br/>
                            <span style={{fontSize:'12px', color:'#94a3b8', marginTop:'5px', display:'block'}}>
                                Note: Scanned items must be <strong>unique</strong> to appear as separate entries.
                            </span>
                        </div>
                    ) : (
                        sessionHistory.slice(0, 5).map((item, idx) => (
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