const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // We will hash this later
  role: { type: String, required: true, enum: ['patient', 'doctor', 'pharmacist'] },
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // Unique but can be null
  
  // --- Doctor-specific ---
  hospitalName: { type: String },
  specialization: { type: String },
  medicalRegNo: { type: String },
  // NEW: List of patients the doctor has explicitly added to their history
  addedPatients: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  // --- Patient-specific ---
  mobile: { type: String },
  dob: { type: String },
  address: { type: String },
  bloodGroup: { type: String },
  aadhaar: { type: String },
  // NEW: The unique secret code created by the patient for doctor verification
  patientCode: { type: String },

  // --- Pharmacist-specific ---
  pharmacyName: { type: String },
  registrationNumber: { type: String },
  drugLicenseNumber: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);