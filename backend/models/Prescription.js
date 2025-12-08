const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MedicineSchema = new Schema({
  medicineId: { type: String, required: true },
  type: { type: String },
  strength: { type: String },
  quantity: { type: String },
  volume: { type: String },
  dosageInstruction: { type: String },
  frequency: { type: String },
  instructions: { type: String },
}, { _id: false });

const PrescriptionSchema = new Schema({
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  diagnosis: { type: String, required: true },
  medicines: [MedicineSchema],
}, { timestamps: true });

module.exports = mongoose.model('Prescription', PrescriptionSchema);