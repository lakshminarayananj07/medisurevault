const express = require("express");
const router = express.Router();
const prescriptionController = require("../controllers/prescriptionController");

// API Routes
router.post("/issue", prescriptionController.issuePrescription);
router.post("/dispense", prescriptionController.dispensePrescription);
router.get("/find/:id", prescriptionController.getPrescriptionById);
router.get("/dispense-history", prescriptionController.getDispenseHistory);

module.exports = router;