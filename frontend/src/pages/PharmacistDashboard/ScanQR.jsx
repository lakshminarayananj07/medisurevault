import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import PrescriptionCard from '../../components/specific/PrescriptionCard';
import { FaArrowLeft, FaCheckCircle, FaQrcode, FaExclamationTriangle } from 'react-icons/fa';

const ScanQR = () => {
  const [scanResult, setScanResult] = useState(null);
  const [foundPrescription, setFoundPrescription] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { prescriptions, medicinesDB } = useAppContext();
  const navigate = useNavigate();

  // --- SCANNER LOGIC ---
  useEffect(() => {
    // Only render scanner if we are NOT in success state
    if (!foundPrescription) { 
      // Clear previous instance
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
        scanner.clear(); // Stop camera on success
      };

      const onScanFailure = (error) => {
        console.warn(error); // Suppress console spam
      };

      scanner.render(onScanSuccess, onScanFailure);

      // Cleanup
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
            // Enrich with medicine names
            const detailedMedicines = prescription.medicines.map(med => {
                const dbInfo = medicinesDB?.find(m => m.id === med.medicineId);
                return {
                    ...med,
                    name: dbInfo ? dbInfo.name : 'Unknown Medicine'
                };
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
    alert(`Prescription ID ${foundPrescription.id} marked as dispensed successfully!`);
    // In real app: call API here
    handleReset();
  };

  const handleReset = () => {
    setScanResult(null);
    setFoundPrescription(null);
    setErrorMsg('');
  };

  // --- STYLES (MATCHING INVENTORY THEME) ---
  const styles = {
    pageContainer: {
        height: 'calc(100vh - 60px)',
        width: '99%',
        maxWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        fontFamily: "'Poppins', sans-serif",
        gap: '10px',
        overflow: 'hidden'
    },
    // HEADER
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
        backgroundColor: '#e0f2fe', color: '#0284c7', padding: '12px', borderRadius: '12px', fontSize: '24px', display: 'flex',
    },
    headerTitle: { margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' },
    headerSubtitle: { margin: 0, fontSize: '14px', color: '#64748b' },
    
    // BACK BUTTON
    backBtn: {
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'transparent', border: '1px solid #cbd5e1',
        padding: '8px 16px', borderRadius: '8px',
        color: '#475569', cursor: 'pointer', fontWeight: '500',
        transition: 'all 0.2s'
    },

    // CONTENT PANEL
    contentPanel: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Center content for scanner
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        padding: '30px',
        boxSizing: 'border-box',
        gap: '20px',
        overflowY: 'auto',
        position: 'relative'
    },

    // SCANNER STATE UI
    scannerWrapper: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '500px'
    },
    scannerBox: {
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        background: '#f8fafc',
        padding: '20px'
    },
    instructionText: { textAlign: 'center', color: '#64748b' },
    errorBanner: {
        marginTop: '20px', padding: '12px 20px', backgroundColor: '#fee2e2', color: '#991b1b',
        borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600'
    },

    // SUCCESS STATE UI
    successWrapper: {
        width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '25px', alignItems: 'center'
    },
    successHeader: { textAlign: 'center', marginBottom: '10px' },
    successTitle: { fontSize: '22px', fontWeight: '700', color: '#166534', margin: '10px 0 5px 0' },
    successIcon: { fontSize: '48px', color: '#22c55e' },
    
    // ACTION BUTTONS
    actionGroup: { display: 'flex', gap: '15px', marginTop: '20px', width: '100%', justifyContent: 'center' },
    btnPrimary: {
        backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px',
        fontWeight: '600', cursor: 'pointer', fontSize: '16px'
    },
    btnSecondary: {
        backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', padding: '12px 30px', borderRadius: '8px',
        fontWeight: '600', cursor: 'pointer', fontSize: '16px'
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        /* Override Html5QrcodeScanner internal styles to match theme */
        #qr-reader { border: none !important; }
        #qr-reader__scan_region { background: white; }
        #qr-reader__dashboard_section_csr button { 
            background: #0f172a; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-top: 10px;
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

        {/* --- CONTENT PANEL --- */}
        <div style={styles.contentPanel}>
            
            {!foundPrescription ? (
                // STATE 1: SCANNER
                <div style={styles.scannerWrapper}>
                    <div style={styles.instructionText}>
                        <h2 style={{fontSize:'20px', color:'#1e293b', marginBottom:'5px'}}>Ready to Scan</h2>
                        <p style={{margin:0}}>Position the QR code within the frame below.</p>
                    </div>

                    <div style={styles.scannerBox}>
                         <div id="qr-reader"></div>
                    </div>

                    {errorMsg && (
                        <div style={styles.errorBanner}>
                            <FaExclamationTriangle /> {errorMsg}
                        </div>
                    )}
                </div>
            ) : (
                // STATE 2: SUCCESS / RESULT
                <div style={styles.successWrapper}>
                    <div style={styles.successHeader}>
                        <FaCheckCircle style={styles.successIcon} />
                        <h2 style={styles.successTitle}>Prescription Verified</h2>
                        <p style={{color:'#64748b'}}>Review details below before confirming dispense.</p>
                    </div>

                    {/* Reuse existing card component */}
                    <div style={{width:'100%', border:'1px solid #e2e8f0', borderRadius:'12px', overflow:'hidden'}}>
                        <PrescriptionCard prescription={foundPrescription} hideQrButton={true} />
                    </div>

                    <div style={styles.actionGroup}>
                        <button style={styles.btnSecondary} onClick={handleReset}>
                            Cancel
                        </button>
                        <button style={styles.btnPrimary} onClick={handleDispense}>
                            Confirm Dispense
                        </button>
                    </div>
                </div>
            )}

        </div>

      </div>
    </>
  );
};

export default ScanQR;