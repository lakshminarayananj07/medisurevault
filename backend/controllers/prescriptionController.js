const Prescription = require("../models/Prescription");
const blockchainService = require("../services/blockchainService");
const SHA256 = require("crypto-js/sha256");

// ==========================================
// 1. ISSUE PRESCRIPTION (Doctor Side)
// ==========================================
exports.issuePrescription = async (req, res) => {
    try {
        const { 
            prescriptionId, 
            doctorId, patientId, doctorName, patientName, 
            date, validUntil, diagnosis, medicines 
        } = req.body;

        console.log(`[Controller] Processing Rx #${prescriptionId} for ${patientName}`);

        // 1. Digital Fingerprint
        const dataString = JSON.stringify({
            id: prescriptionId,
            patient: patientName,
            diagnosis: diagnosis,
            expiry: validUntil,
            meds: medicines
        });
        const dataHash = SHA256(dataString).toString();

        // 2. Blockchain
        const txHash = await blockchainService.issuePrescriptionOnChain(
            prescriptionId,
            dataHash,
            validUntil 
        );

        // 3. MongoDB
        const newPrescription = new Prescription({
            prescriptionId,
            doctorId, patientId, doctorName, patientName,
            date, validUntil, diagnosis, medicines,
            dataHash, transactionHash: txHash
        });

        await newPrescription.save();

        res.status(201).json({
            success: true,
            message: "Prescription Created & Secured on Blockchain!",
            receipt: txHash,
            data: newPrescription
        });

    } catch (error) {
        console.error("Error in controller:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ==========================================
// 2. DISPENSE PRESCRIPTION (Balanced Privacy)
// ==========================================
exports.dispensePrescription = async (req, res) => {
    try {
        const { prescriptionId, pharmacistNote } = req.body;

        // Get User ID (Allow null/anonymous if frontend fails)
        let userId = req.user ? req.user.id : req.body.pharmacistId;
        if (userId === "null" || userId === "undefined" || userId === "") userId = null;

        console.log(`[Controller] Dispensing Rx #${prescriptionId}. User: ${userId || "Anonymous"}`);

        const rxInDb = await Prescription.findOne({ prescriptionId });
        
        if (!rxInDb) {
            return res.status(404).json({ success: false, error: "Prescription not found in Database." });
        }
        
        // Blockchain Transaction
        const txHash = await blockchainService.dispensePrescriptionOnChain(
            prescriptionId, 
            pharmacistNote || "Dispensed via Web Dashboard"
        );

        // Update DB
        rxInDb.isDispensed = true;
        rxInDb.dispenseDate = new Date();
        rxInDb.dispensedBy = userId; // Save ID (or null if anonymous)
        rxInDb.pharmacistNote = pharmacistNote;
        
        await rxInDb.save();

        res.status(200).json({
            success: true,
            message: "Medicine Dispensed Successfully!",
            receipt: txHash,
            updatedRx: rxInDb
        });

    } catch (error) {
        console.error("Dispense Error:", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
};

// ==========================================
// 3. GET PRESCRIPTION BY ID (Scanner)
// ==========================================
exports.getPrescriptionById = async (req, res) => {
    try {
        const { id } = req.params;
        const prescription = await Prescription.findOne({ prescriptionId: id });

        if (!prescription) {
            return res.status(404).json({ success: false, error: "Prescription not found" });
        }

        res.status(200).json({ success: true, data: prescription });

    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ==========================================
// 4. GET DISPENSE HISTORY (Balanced Privacy)
// ==========================================
exports.getDispenseHistory = async (req, res) => {
    try {
        let userId = req.user ? req.user.id : req.query.pharmacistId;

        // Handle string "null" from frontend
        if (userId === "null" || userId === "undefined" || userId === "") {
            userId = null;
        }

        const query = { isDispensed: true };

        if (userId) {
            // IF LOGGED IN: Show items dispensed by THIS user
            query.dispensedBy = userId;
        } else {
            // IF NOT LOGGED IN (or Error): Show Anonymous/Global items
            // This ensures the list is NOT empty if the frontend fails to send an ID
            query.$or = [
                { dispensedBy: null },
                { dispensedBy: { $exists: false } }
            ];
        }

        const history = await Prescription.find(query)
            .sort({ dispenseDate: -1, updatedAt: -1 }) 
            .limit(5);

        console.log(`[History] Fetching for: ${userId || "Anonymous"} | Found: ${history.length}`);

        res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });

    } catch (error) {
        console.error("History Fetch Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};