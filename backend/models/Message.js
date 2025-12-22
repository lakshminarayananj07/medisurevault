const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['text', 'prescription'], 
    default: 'text' 
  },
  content: { 
    type: String, // For text messages
    default: '' 
  },
  // If sharing a prescription, we store the full object or ID
  prescriptionData: { 
    type: Object, 
    default: null 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Message', MessageSchema);