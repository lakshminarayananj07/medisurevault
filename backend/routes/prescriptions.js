const express = require('express');
const Prescription = require('../models/Prescription');
const auth = require('../middleware/authMiddleware'); // Import our auth middleware

const router = express.Router();

// @route   POST /api/prescriptions/create
// @desc    Create a new prescription
// @access  Private (requires token)
router.post('/create', auth, async (req, res) => {
  try {
    const { patientId, date, diagnosis, medicines } = req.body;
    
    // The doctor's ID comes from the decoded JWT token in our auth middleware
    const doctorId = req.user.id;

    const newPrescription = new Prescription({
      doctorId,
      patientId,
      date,
      diagnosis,
      medicines
    });

    const prescription = await newPrescription.save();
    res.json(prescription);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/prescriptions
// @desc    Get all prescriptions for the logged-in user (can be doctor or patient)
// @access  Private (requires token)
router.get('/', auth, async (req, res) => {
  try {
    let prescriptions;
    if (req.user.role === 'doctor') {
      prescriptions = await Prescription.find({ doctorId: req.user.id }).sort({ createdAt: -1 });
    } else if (req.user.role === 'patient') {
      prescriptions = await Prescription.find({ patientId: req.user.id }).sort({ createdAt: -1 });
    } else {
      // For pharmacists or other roles, get all prescriptions (can be refined)
      prescriptions = await Prescription.find().sort({ createdAt: -1 });
    }
    res.json(prescriptions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;