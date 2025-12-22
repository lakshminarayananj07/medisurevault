import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import PrescriptionCard from '../../components/specific/PrescriptionCard';
import { 
  FaArrowLeft, FaCheckCircle, FaQrcode, FaExclamationTriangle, 
  FaHistory, FaBoxOpen, FaClock 
} from 'react-icons/fa';

const ScanQR = () => {
  const [scanResult, setScanResult] = useState(null);
  const [foundPrescription, setFoundPrescription] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // [NEW] Local History State
  const [sessionHistory, setSessionHistory] = useState([]);

  const { prescriptions, medicinesDB } = useAppContext();
  const navigate = useNavigate();

  // --- SCANNER LOGIC ---
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

  // --- RESULT PROCESSING ---
  useEffect(() => {
    if (scanResult) {
      setErrorMsg('');
      try {
        const { prescriptionId } = JSON.parse(scanResult);
        const prescription = prescriptions.find(p => p.id === prescriptionId);

        if (prescription) {
            const detailedMedicines = prescription.medicines.map(med => {
                const dbInfo = medicinesDB?.find(m => m.id === med.medicineId);
                return { ...med, name: dbInfo ? dbInfo.name : 'Unknown Medicine' };
            });
            setFoundPrescription({ ...prescription, medicines: detailedMedicines });
        } else {
            setErrorMsg('Prescription ID not found in system.');
            setScanResult(null); 
        }
      } catch  {
        setErrorMsg('Invalid QR Code format. Please scan a MediSure QR.');
        setScanResult(null);
      }
    }
  }, [scanResult, prescriptions, medicinesDB]);

  // --- HANDLERS ---
  const handleDispense = () => {
    // [NEW] Add to session history
    const newItem = {
        id: foundPrescription.id,
        patient: foundPrescription.patientName || "Unknown Patient",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        itemCount: foundPrescription.medicines.length
    };
    
    setSessionHistory(prev => [newItem, ...prev]);
    alert(`Dispensed successfully for ${newItem.patient}!`);
    handleReset();
  };

  const handleReset = () => {
    setScanResult(null);
    setFoundPrescription(null);
    setErrorMsg('');
  };

  // --- STYLES ---
  const styles = {
    pageContainer: {
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        fontFamily: "'Poppins', sans-serif",
        gap: '20px',
        paddingBottom: '20px'
    },
    topRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
        backgroundColor: '#ffffff', padding: '20px', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', boxSizing: 'border-box'
    },
    headerContent: { display: 'flex', alignItems: 'center', gap: '15px' },
    headerIcon: { backgroundColor: '#e0f2fe', color: '#0284c7', padding: '12px', borderRadius: '12px', fontSize: '24px', display: 'flex' },
    headerTitle: { margin: 0, fontSize: '26px', fontWeight: '700', color: '#1e293b' },
    headerSubtitle: { margin: 0, fontSize: '14px', color: '#64748b' },
    backBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', color: '#475569', cursor: 'pointer', fontWeight: '500' },

    // MAIN LAYOUT SPLIT
    mainLayout: {
        display: 'flex', gap: '20px', width: '100%', flex: 1
    },

    // LEFT: SCANNER PANEL
    scanPanel: {
        flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0',
        padding: '30px', boxSizing: 'border-box', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', relative: 'position'
    },

    // RIGHT: HISTORY PANEL
    historyPanel: {
        flex: 1, display: 'flex', flexDirection: 'column',
        backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0',
        padding: '25px', boxSizing: 'border-box', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        maxWidth: '400px'
    },

    // Scanner UI
    scannerWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '500px' },
    scannerBox: { width: '100%', borderRadius: '16px', overflow: 'hidden', border: '2px dashed #cbd5e1', background: '#f8fafc', padding: '10px', position: 'relative' },
    // [NEW] Animation Line
    scanLine: {
        position: 'absolute', width: '100%', height: '2px', background: '#3b82f6',
        top: 0, left: 0, boxShadow: '0 0 4px #3b82f6', animation: 'scanMove 2s infinite linear', zIndex: 5
    },
    instructionText: { textAlign: 'center', color: '#64748b' },
    errorBanner: { marginTop: '20px', padding: '12px 20px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600' },

    // Success UI
    successWrapper: { width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '25px', alignItems: 'center' },
    successHeader: { textAlign: 'center', marginBottom: '10px' },
    successTitle: { fontSize: '22px', fontWeight: '700', color: '#166534', margin: '10px 0 5px 0' },
    actionGroup: { display: 'flex', gap: '15px', marginTop: '20px', width: '100%', justifyContent: 'center' },
    btnPrimary: { backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '16px' },
    btnSecondary: { backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', padding: '12px 30px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '16px' },

    // History List UI
    historyTitle: { fontSize: '18px', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
    historyList: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
    historyItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '10px', borderLeft: '4px solid #10b981' },
    historyName: { fontWeight: '600', fontSize: '14px', color: '#334155' },
    historyMeta: { fontSize: '12px', color: '#64748b' },
    emptyHistory: { textAlign: 'center', color: '#94a3b8', marginTop: '50px', fontSize: '14px', fontStyle: 'italic' },
    historyFooter: { marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '600', color: '#334155' }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        #qr-reader { border: none !important; }
        #qr-reader__scan_region { background: white; }
        @keyframes scanMove {
            0% { top: 0; }
            50% { top: 100%; }
            100% { top: 0; }
        }
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
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
             <FaArrowLeft /> Back
          </button>
        </div>

        {/* --- MAIN LAYOUT (SPLIT) --- */}
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
                             <div style={styles.scanLine}></div> {/* [NEW] Scan Line Animation */}
                             <div id="qr-reader"></div>
                        </div>

                        {errorMsg && (
                            <div style={styles.errorBanner}>
                                <FaExclamationTriangle /> {errorMsg}
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={styles.successWrapper}>
                        <div style={styles.successHeader}>
                            <FaCheckCircle style={{fontSize: '48px', color: '#22c55e'}} />
                            <h2 style={styles.successTitle}>Verified Successfully</h2>
                            <p style={{color:'#64748b'}}>Prescription matches system records.</p>
                        </div>

                        <div style={{width:'100%', border:'1px solid #e2e8f0', borderRadius:'12px', overflow:'hidden'}}>
                            <PrescriptionCard prescription={foundPrescription} hideQrButton={true} />
                        </div>

                        <div style={styles.actionGroup}>
                            <button style={styles.btnSecondary} onClick={handleReset}>Cancel</button>
                            <button style={styles.btnPrimary} onClick={handleDispense}>Confirm Dispense</button>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT: SESSION HISTORY */}
            <div style={styles.historyPanel}>
                <div style={styles.historyTitle}>
                    <FaHistory style={{color:'#6366f1'}}/> Session History
                </div>
                
                <div style={styles.historyList}>
                    {sessionHistory.length === 0 ? (
                        <div style={styles.emptyHistory}>
                            <FaBoxOpen style={{fontSize:'32px', marginBottom:'10px', opacity:0.5}}/><br/>
                            No items dispensed in this session yet.
                        </div>
                    ) : (
                        sessionHistory.map((item, idx) => (
                            <div key={idx} style={styles.historyItem}>
                                <div>
                                    <div style={styles.historyName}>{item.patient}</div>
                                    <div style={styles.historyMeta}>{item.itemCount} Medicines</div>
                                </div>
                                <div style={{display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', color:'#64748b'}}>
                                    <FaClock /> {item.time}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {sessionHistory.length > 0 && (
                    <div style={styles.historyFooter}>
                        <span>Total Dispensed:</span>
                        <span>{sessionHistory.length} Patients</span>
                    </div>
                )}
            </div>

        </div>

      </div>
    </>
  );
};

export default ScanQR;