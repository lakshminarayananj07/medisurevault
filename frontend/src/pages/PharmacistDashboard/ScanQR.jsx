import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAppContext } from '../../hooks/useAppContext';
import PrescriptionCard from '../../components/specific/PrescriptionCard';
import './ScanQR.css';

const ScanQR = () => {
  const [scanResult, setScanResult] = useState(null);
  const [foundPrescription, setFoundPrescription] = useState(null);
  const { prescriptions, medicinesDB } = useAppContext(); // Get prescriptions from context

  useEffect(() => {
    if (!scanResult) { // Only render the scanner if we don't have a result
      const scanner = new Html5QrcodeScanner('qr-reader', {
        qrbox: { width: 250, height: 250 },
        fps: 5,
      });

      const onScanSuccess = (decodedText) => {
        setScanResult(decodedText);
      };

      // eslint-disable-next-line no-unused-vars
      const onScanFailure = (error) => {};

      scanner.render(onScanSuccess, onScanFailure);

      return () => {
        // Check if the scanner element is still in the DOM before clearing
        if (document.getElementById('qr-reader')) {
            scanner.clear().catch(err => console.error("Scanner clear failed", err));
        }
      };
    }
  }, [scanResult]);

  // This effect runs when a scan result is received
  useEffect(() => {
    if (scanResult) {
      try {
        const { prescriptionId } = JSON.parse(scanResult);
        const prescription = prescriptions.find(p => p.id === prescriptionId);

        if (prescription) {
          // Enrich the prescription with medicine names
          const getMedicineName = (id) => medicinesDB.find(m => m.id === id)?.name || 'Unknown';
          const detailedMedicines = prescription.medicines.map(med => ({
            ...med,
            name: getMedicineName(med.medicineId)
          }));
          setFoundPrescription({ ...prescription, medicines: detailedMedicines });
        } else {
          alert('Prescription not found in the system!');
        }
      } catch {
        alert('Invalid QR Code format.');
      }
    }
  }, [scanResult, prescriptions, medicinesDB]);

  const handleDispense = () => {
    // Later, this will update the prescription status on the blockchain
    alert(`Prescription ID ${foundPrescription.id} marked as dispensed!`);
  };

  return (
    <div className="scan-qr-container">
      <h2>Scan & Verify Prescription</h2>
      
      {!foundPrescription ? (
        <div id="qr-reader"></div>
      ) : (
        <div className="verification-container">
          <h3>Prescription Found & Verified</h3>
          <PrescriptionCard prescription={foundPrescription} hideQrButton={true} />
          <button onClick={handleDispense} className="dispense-button">
            Mark as Dispensed
          </button>
        </div>
      )}
    </div>
  );
};

export default ScanQR;