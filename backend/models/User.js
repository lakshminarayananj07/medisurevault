const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // --- Common Fields ---
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store hashed passwords
  role: { type: String, required: true, enum: ['patient', 'doctor', 'pharmacist'] },
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // Optional but unique if provided
  
  // --- Doctor-specific Fields ---
  hospitalName: { type: String },
  specialization: { type: String },
  medicalRegNo: { type: String },
  
  // [CRITICAL FOR SHARING] List of patients linked to this doctor
  addedPatients: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  // --- Patient-specific Fields ---
  mobile: { type: String },
  dob: { type: String },
  address: { type: String },
  bloodGroup: { type: String },
  aadhaar: { type: String },
  
  // Secret code for doctors to verify and add this patient
  patientCode: { type: String },

  // --- Pharmacist-specific Fields ---
  pharmacyName: { type: String },
  registrationNumber: { type: String },
  drugLicenseNumber: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);