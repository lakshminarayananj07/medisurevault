const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
  pharmacistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  type: { type: String, default: 'Tablet' }, // Tablet, Syrup, etc.
  batch: { type: String, required: true },
  expiry: { type: String, required: true }, // Keeping as String for simple date input
  stock: { type: Number, required: true, default: 0 },
  lowLimit: { type: Number, default: 10 },
  highLimit: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);