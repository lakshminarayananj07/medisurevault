const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Medicine Sub-schema (Keep this exactly as is)
const MedicineSchema = new Schema({
  medicineId: { type: String, required: true },
  name: { type: String },
  type: { type: String },
  strength: { type: String },
  quantity: { type: String },
  volume: { type: String },
  dosageInstruction: { type: String },
  frequency: { type: String },
  instructions: { type: String },
}, { _id: false });

const PrescriptionSchema = new Schema({
  // Links to Users
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Needed for Dashboard & Analytics
  doctorName: { type: String }, 
  patientName: { type: String }, 
  
  date: { type: String, required: true },
  validUntil: { type: String }, 
  
  diagnosis: { type: String, required: true },
  medicines: [MedicineSchema],

  // =========================================================
  // 👇 BLOCKCHAIN & DISPENSING FIELDS 👇
  // =========================================================
  
  // 1. Identification & Security
  prescriptionId: { type: Number, required: true, unique: true }, // Numeric ID for Smart Contract
  dataHash: { type: String, required: true },     // The "Digital Fingerprint"
  transactionHash: { type: String },              // The Blockchain Receipt
  
  // 2. Dispensing Status (CRITICAL FOR HISTORY)
  isDispensed: { 
    type: Boolean, 
    default: false 
  },
  
  // 3. Dispensing Metadata (Added this so History works correctly)
  dispenseDate: { 
    type: Date 
  },
  pharmacistNote: { 
    type: String 
  },
  dispensedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', // Assuming your Pharmacist is a "User"
      required: false // False initially so old records don't break
  }
  // =========================================================

}, { timestamps: true });

module.exports = mongoose.model('Prescription', PrescriptionSchema);