const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const User = require('../models/User'); // Import User model to fetch names
const auth = require('../Middleware/authMiddleware'); // Import auth middleware

// =================================================================
//  1. CREATE PRESCRIPTION
//  @route   POST /api/prescriptions/add
//  @desc    Create a new prescription
// =================================================================
router.post('/add', auth, async (req, res) => {
  try {
    // 1. Destructure fields
    const { patientId, patientName, date, diagnosis, medicines, validUntil } = req.body;
    
    // 2. Get Doctor ID from token
    const doctorId = req.user.id;

    // 3. Fetch Doctor details to save name (Optional but good for UI)
    const doctor = await User.findById(doctorId);

    const newPrescription = new Prescription({
      doctorId,
      patientId,
      doctorName: doctor ? doctor.name : 'Doctor', // Fallback
      patientName, // Ensure this is sent from frontend
      date,
      validUntil, 
      diagnosis,
      medicines
    });

    const prescription = await newPrescription.save();
    res.json({ success: true, data: prescription });

  } catch (err) {
    console.error("Error creating prescription:", err.message);
    res.status(500).send('Server Error');
  }
});

// =================================================================
//  2. DOCTOR DASHBOARD STATS (CRITICAL FOR ANALYTICS)
//  @route   GET /api/prescriptions/doctor-history
//  @desc    Get all prescriptions issued by the logged-in doctor
// =================================================================
router.get('/doctor-history', auth, async (req, res) => {
  try {
    // Ensure we are finding by the logged-in doctor's ID
    const prescriptions = await Prescription.find({ doctorId: req.user.id })
      .populate('patientId', 'name mobile') // Get patient details
      .sort({ createdAt: -1 }); // Newest first

    res.json({ success: true, data: prescriptions });
  } catch (err) {
    console.error("Error fetching doctor history:", err.message);
    res.status(500).send('Server Error');
  }
});

// =================================================================
//  3. GENERAL FETCH (USER'S EXISTING ROUTE)
//  @route   GET /api/prescriptions
//  @desc    Get all prescriptions based on role (Patient or Doctor)
// =================================================================
router.get('/', auth, async (req, res) => {
  try {
    let prescriptions;
    
    if (req.user.role === 'doctor') {
      prescriptions = await Prescription.find({ doctorId: req.user.id })
        .populate('patientId', 'name mobile')
        .sort({ createdAt: -1 });
        
    } else if (req.user.role === 'patient') {
      prescriptions = await Prescription.find({ patientId: req.user.id })
        .populate('doctorId', 'name hospitalName specialization') 
        .sort({ createdAt: -1 });
        
    } else {
      // For pharmacists/admin
      prescriptions = await Prescription.find()
        .populate('doctorId', 'name hospitalName specialization')
        .sort({ createdAt: -1 });
    }
    
    res.json(prescriptions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ... existing imports and routes ...

// =================================================================
//  MISSING ROUTE: GET PRESCRIPTIONS FOR A SPECIFIC PATIENT
//  @route   GET /api/prescriptions/patient/:id
//  @desc    Get all prescriptions linked to a specific patient ID
// =================================================================
router.get('/patient/:id', auth, async (req, res) => {
  try {
    // Find prescriptions where patientId matches the URL parameter
    const prescriptions = await Prescription.find({ patientId: req.params.id })
      .populate('doctorId', 'name hospitalName') // Optional: Get doctor details
      .sort({ createdAt: -1 }); // Newest first

    res.json({ success: true, data: prescriptions });
  } catch (err) {
    console.error("Error fetching patient prescriptions:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;