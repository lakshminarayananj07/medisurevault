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
  prescriptionId: { type: Number, required: true, unique: true }, 
  dataHash: { type: String, required: true },     
  transactionHash: { type: String },              
  
  // 2. Dispensing Status
  isDispensed: { 
    type: Boolean, 
    default: false 
  },
  
  // 3. Dispensing Metadata
  dispenseDate: { 
    type: Date 
  },
  pharmacistNote: { 
    type: String 
  },
  
  // 👇 UPDATED FIELD: Changed from ObjectId to String 👇
  dispensedBy: { 
      type: String,  // <--- This allows "pharm_..." IDs
      required: false 
  }
  // =========================================================

}, { timestamps: true });

module.exports = mongoose.model('Prescription', PrescriptionSchema);