const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Import our User model

const router = express.Router();

// --- SIGNUP / REGISTER ROUTE ---
// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    // 1. Check if a user with that username already exists
    let user = await User.findOne({ username: req.body.username });
    if (user) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    // 2. If user doesn't exist, create a new user object from the request body
    // (Since we updated the User Schema, req.body will now accept 'patientCode' automatically if sent)
    user = new User(req.body);

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    // 4. Save the new user to the database
    await user.save();

    // 5. Send a success response
    res.status(201).json({ message: 'User registered successfully!' });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});


// --- LOGIN ROUTE ---
// @route   POST /api/auth/login
// @desc    Authenticate a user and get a token
router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // 1. Check if the user exists with the correct role
    let user = await User.findOne({ username, role });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // 2. Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // 3. If credentials are correct, create a JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Your secret key from the .env file
      { expiresIn: '5h' }, // Token expires in 5 hours
      (err, token) => {
        if (err) throw err;
        // 4. Send the token and user data back to the frontend
        res.json({ token, user });
      }
    );

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});


// =======================================================
//  NEW FEATURE: DOCTOR PATIENT MANAGEMENT
// =======================================================

// --- ADD PATIENT ROUTE ---
// @route   POST /api/auth/add-patient
// @desc    Doctor adds a patient using Username + Secret Code
router.post('/add-patient', async (req, res) => {
  const { doctorId, patientUsername, patientCode } = req.body;

  try {
    // 1. Find the Patient
    const patient = await User.findOne({ username: patientUsername });

    // 2. Validate Patient: Must exist, be a 'patient', and Code must match
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: "Patient user not found." });
    }
    
    // Check the secret code
    if (patient.patientCode !== patientCode) {
      return res.status(401).json({ message: "Invalid Patient Code. Access denied." });
    }

    // 3. Find the Doctor
    const doctor = await User.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found." });

    // 4. Check for Duplicates (Is this patient already in the list?)
    if (doctor.addedPatients.includes(patient._id)) {
      return res.status(400).json({ message: "Patient already exists in your history." });
    }

    // 5. Success: Link the patient to the doctor
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

// --- GET PATIENT HISTORY ROUTE ---
// @route   GET /api/auth/patient-history/:id
// @desc    Get the list of patients added by a specific doctor
router.get('/patient-history/:id', async (req, res) => {
  try {
    // Find the doctor and populate the 'addedPatients' array
    // We strictly select only the fields needed for the dashboard (name, username, mobile, dob)
    const doctor = await User.findById(req.params.id)
                             .populate('addedPatients', 'name username mobile dob bloodGroup');

    if (!doctor) return res.status(404).json({ message: "User not found" });

    // Return the list of patients
    res.status(200).json(doctor.addedPatients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching history" });
  }
});

module.exports = router;