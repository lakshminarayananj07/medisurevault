const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Medicine Sub-schema (Keep this as is)
const MedicineSchema = new Schema({
  medicineId: { type: String, required: true },
  name: { type: String }, // Useful to store the name directly
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
  
  // [NEW FIELDS] Needed for Dashboard & Analytics
  doctorName: { type: String }, 
  patientName: { type: String }, 
  
  date: { type: String, required: true },
  validUntil: { type: String }, // Needed for "Valid/Expired" badge
  
  diagnosis: { type: String, required: true },
  medicines: [MedicineSchema],
}, { timestamps: true });

module.exports = mongoose.model('Prescription', PrescriptionSchema);