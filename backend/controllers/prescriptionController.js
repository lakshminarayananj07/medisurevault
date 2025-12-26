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
// 2. DISPENSE PRESCRIPTION (Strict Privacy)
// ==========================================
exports.dispensePrescription = async (req, res) => {
    try {
        const { prescriptionId, pharmacistNote } = req.body;

        // 1. Get User ID (Prioritize the Auto-ID sent in body)
        let userId = req.body.pharmacistId || (req.user ? req.user.id : null);

        // 2. STRICT CHECK: We DO NOT allow anonymous dispensing anymore.
        // Since frontend now generates a "pharm_..." ID, this should always exist.
        if (!userId || userId === "null" || userId === "undefined") {
            return res.status(400).json({ success: false, error: "Missing User ID. Cannot dispense anonymously." });
        }

        console.log(`[Controller] Dispensing Rx #${prescriptionId} by: ${userId}`);

        const rxInDb = await Prescription.findOne({ prescriptionId });
        
        if (!rxInDb) {
            return res.status(404).json({ success: false, error: "Prescription not found in Database." });
        }
        
        // 3. Blockchain Transaction
        const txHash = await blockchainService.dispensePrescriptionOnChain(
            prescriptionId, 
            pharmacistNote || "Dispensed via Web Dashboard"
        );

        // 4. Update DB
        rxInDb.isDispensed = true;
        rxInDb.dispenseDate = new Date();
        rxInDb.dispensedBy = userId; // CRITICAL: Saves the unique Session ID
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
// 4. GET DISPENSE HISTORY (Strict Privacy)
// ==========================================
exports.getDispenseHistory = async (req, res) => {
    try {
        // 1. Get User ID from Query Params
        let userId = req.query.pharmacistId || (req.user ? req.user.id : null);

        // 2. STRICT CHECK: If ID is missing, return EMPTY list.
        // We do NOT return global data anymore.
        if (!userId || userId === "null" || userId === "undefined" || userId === "") {
            console.log("[History] Blocked: No ID provided.");
            return res.status(200).json({ 
                success: true, 
                count: 0, 
                data: [] 
            });
        }

        // 3. Query ONLY for this specific User ID
        const query = { 
            isDispensed: true,
            dispensedBy: userId 
        };

        const history = await Prescription.find(query)
            .sort({ dispenseDate: -1, updatedAt: -1 }) 
            .limit(5);

        console.log(`[History] Fetching for: ${userId} | Found: ${history.length}`);

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