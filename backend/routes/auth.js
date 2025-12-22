const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User Model
const auth = require('../Middleware/authMiddleware'); // Import Middleware

const router = express.Router();

// =======================================================
//   USER AUTHENTICATION (Register & Login)
// =======================================================

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    // 1. Check if user exists
    let user = await User.findOne({ username: req.body.username });
    if (user) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    // 2. Create new user
    user = new User(req.body);

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    // 4. Save to DB
    await user.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // 1. Check user exists
    let user = await User.findOne({ username, role });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // 2. Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // 3. Create Token Payload
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    // 4. Sign Token
    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Ensure this exists in your .env
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// =======================================================
//   DOCTOR: MANAGE PATIENTS
// =======================================================

// @route   POST /api/auth/add-patient
// @desc    Doctor adds a patient using Username + Secret Code
router.post('/add-patient', async (req, res) => {
  const { doctorId, patientUsername, patientCode } = req.body;

  try {
    // 1. Find Patient
    const patient = await User.findOne({ username: patientUsername });

    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: "Patient user not found." });
    }
    
    // 2. Verify Secret Code
    if (patient.patientCode !== patientCode) {
      return res.status(401).json({ message: "Invalid Patient Code. Access denied." });
    }

    // 3. Find Doctor
    const doctor = await User.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found." });

    // 4. Check for Duplicates
    if (doctor.addedPatients.includes(patient._id)) {
      return res.status(400).json({ message: "Patient already exists in your history." });
    }

    // 5. Link Patient to Doctor
    doctor.addedPatients.push(patient._id);
    await doctor.save();

    res.status(200).json({ 
      message: "Patient added successfully!", 
      patientName: patient.name 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error processing request." });
  }
});

// @route   GET /api/auth/patient-history/:id
// @desc    Get the list of patients added by a specific doctor
router.get('/patient-history/:id', async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id)
                             .populate('addedPatients', 'name username mobile dob bloodGroup');

    if (!doctor) return res.status(404).json({ message: "User not found" });

    res.status(200).json(doctor.addedPatients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching history" });
  }
});

// =======================================================
//   [NEW] PATIENT: SHARE PRESCRIPTION (DEBUG VERSION)
// =======================================================

// @route   GET /api/auth/my-doctors
// @desc    Get list of doctors who have added this patient
// @access  Private (Patient Only)
router.get('/my-doctors', auth, async (req, res) => {
  try {
    console.log("--- DEBUG START: /my-doctors ---");

    // 1. Determine ID based on middleware structure
    const patientId = req.user.user ? req.user.user.id : req.user.id;
    console.log("Extracted Patient ID:", patientId);

    // 2. Find doctors (Case Insensitive 'doctor' search)
    const doctors = await User.find({
      role: { $regex: /^doctor$/i }, // Matches 'Doctor', 'doctor', 'DOCTOR'
      addedPatients: { $in: [patientId] } 
    }).select('name email role _id'); 

    console.log(`Found ${doctors.length} linked doctors.`);

    // 3. If empty, check if ANY doctor exists to help debug
    if (doctors.length === 0) {
        const anyDoctor = await User.findOne({ role: { $regex: /^doctor$/i } });
        if (anyDoctor) {
            console.log("Sample Doctor Found:", anyDoctor.username);
            console.log("Sample Doctor's addedPatients:", anyDoctor.addedPatients);
            console.log("Does sample include patient?", anyDoctor.addedPatients.includes(patientId));
        } else {
            console.log("No doctors found in database at all.");
        }
    }
    console.log("--- DEBUG END ---");

    res.json({
      success: true,
      data: doctors
    });

  } catch (err) {
    console.error("SERVER ERROR:", err.message);
    res.status(500).send('Server Error fetching doctors');
  }
});

module.exports = router;