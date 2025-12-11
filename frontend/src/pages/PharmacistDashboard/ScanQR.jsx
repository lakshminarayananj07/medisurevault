import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import PrescriptionCard from '../../components/specific/PrescriptionCard';
import { FaArrowLeft, FaCheckCircle, FaQrcode } from 'react-icons/fa';
import './ScanQR.css';

const ScanQR = () => {
  const [scanResult, setScanResult] = useState(null);
  const [foundPrescription, setFoundPrescription] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { prescriptions, medicinesDB } = useAppContext();
  const navigate = useNavigate();

  // Initialize Scanner
  useEffect(() => {
    // Only render scanner if we are NOT in success state (foundPrescription is null)
    if (!foundPrescription) { 
      // Clear any previous instance first to avoid "element not found" errors
      const element = document.getElementById('qr-reader');
      if (element) {
        element.innerHTML = "";
      }

      const scanner = new Html5QrcodeScanner('qr-reader', {
        qrbox: { width: 280, height: 280 }, // Slightly larger box
        fps: 10,
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true
      });

      const onScanSuccess = (decodedText) => {
        setScanResult(decodedText);
        scanner.clear(); // Stop camera immediately on success
      };

      const onScanFailure = () => {
        // Console log only, don't alert user on every frame failure
        // console.warn(error); 
      };

      scanner.render(onScanSuccess, onScanFailure);

      // Cleanup
      return () => {
        scanner.clear().catch(err => console.log("Scanner cleanup", err));
      };
    }
  }, [foundPrescription]); // Re-run if we reset the prescription

  // Handle Logic when Scan Result is found
  useEffect(() => {
    if (scanResult) {
      setErrorMsg('');
      try {
        const { prescriptionId } = JSON.parse(scanResult);
        const prescription = prescriptions.find(p => p.id === prescriptionId);

        if (prescription) {
            // Enrich with medicine names safely
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
            setScanResult(null); // Reset to allow scanning again
        }
      } catch  {
        setErrorMsg('Invalid QR Code format. Please scan a MediSure QR.');
        setScanResult(null);
      }
    }
  }, [scanResult, prescriptions, medicinesDB]);

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

  return (
    <div className="scan-page-wrapper">
      
      {/* Header with Back Button */}
      <div className="scan-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back to Dashboard
        </button>
        <h1>Dispense Verification</h1>
      </div>

      <div className="scan-content-card">
        
        {/* STATE 1: SCANNING */}
        {!foundPrescription ? (
          <div className="scanner-section">
            <div className="scanner-instruction">
                <div className="icon-pulse">
                    <FaQrcode />
                </div>
                <h2>Scan Patient QR Code</h2>
                <p>Position the QR code within the frame to verify prescription.</p>
            </div>

            <div className="scanner-box-wrapper">
                <div id="qr-reader"></div>
            </div>
            
            {errorMsg && <div className="error-banner">{errorMsg}</div>}
          </div>
        ) : (
          /* STATE 2: SUCCESS / FOUND */
          <div className="success-section">
            <div className="success-header">
                <FaCheckCircle className="success-icon" />
                <h2>Prescription Verified</h2>
                <p>Please review the details below before dispensing.</p>
            </div>

            <div className="prescription-preview">
                <PrescriptionCard prescription={foundPrescription} hideQrButton={true} />
            </div>

            <div className="action-buttons">
                <button onClick={handleReset} className="btn-secondary">
                    Cancel / Scan Another
                </button>
                <button onClick={handleDispense} className="btn-primary">
                    Confirm & Dispense
                </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ScanQR;