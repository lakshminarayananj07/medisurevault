const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  hospitalName: { type: String },
  
  // THIS ARRAY IS CRITICAL FOR THE SHARE FEATURE
  myPatients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient' // or 'User' depending on your patient model name
  }],
  
  // ... other fields
});

module.exports = mongoose.model('Doctor', DoctorSchema);