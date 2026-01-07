const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // --- Common Fields (Shared by ALL roles) ---
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['patient', 'doctor', 'pharmacist'] },
  name: { type: String, required: true },
  
  // ✅ FIX: Moved 'email' and 'mobile' here so ALL users can have them
  email: { type: String, unique: true, sparse: true }, 
  mobile: { type: String }, 
  
  // --- Doctor-specific Fields ---
  hospitalName: { type: String },
  specialization: { type: String },
  medicalRegNo: { type: String },
  // (Removed duplicate 'mobile' from here)
  
  // [CRITICAL FOR SHARING] List of patients linked to this doctor
  addedPatients: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  // --- Patient-specific Fields ---
  // (Removed duplicate 'mobile' from here)
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