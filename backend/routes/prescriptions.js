const express = require('express');
const Prescription = require('../models/Prescription');
const auth = require('../middleware/authMiddleware'); // Import our auth middleware

const router = express.Router();

// @route   POST /api/prescriptions/create
// @desc    Create a new prescription
// @access  Private (requires token)
router.post('/create', auth, async (req, res) => {
  try {
    // 1. Destructure ALL fields sent from frontend
    const { patientId, date, diagnosis, medicines, validUntil, doctorName } = req.body;
    
    // The doctor's ID comes from the decoded JWT token
    const doctorId = req.user.id;

    const newPrescription = new Prescription({
      doctorId,
      patientId,
      date,
      validUntil,   // Added this
      diagnosis,
      medicines,
      doctorName    // Added this (fallback for frontend)
    });

    const prescription = await newPrescription.save();
    res.json(prescription);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/prescriptions
// @desc    Get all prescriptions for the logged-in user
// @access  Private (requires token)
router.get('/', auth, async (req, res) => {
  try {
    let prescriptions;
    
    // 2. Add .populate() to ALL queries below
    // This fills the 'doctorId' field with the actual Doctor document (name, hospital, etc.)
    
    if (req.user.role === 'doctor') {
      prescriptions = await Prescription.find({ doctorId: req.user.id })
        .populate('doctorId', 'name hospitalName specialization') // <--- THE FIX
        .sort({ createdAt: -1 });
        
    } else if (req.user.role === 'patient') {
      prescriptions = await Prescription.find({ patientId: req.user.id })
        .populate('doctorId', 'name hospitalName specialization') // <--- THE FIX
        .sort({ createdAt: -1 });
        
    } else {
      // For pharmacists/admin
      prescriptions = await Prescription.find()
        .populate('doctorId', 'name hospitalName specialization') // <--- THE FIX
        .sort({ createdAt: -1 });
    }
    
    res.json(prescriptions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;