const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const auth = require('../middleware/authMiddleware');

// Add a reminder
router.post('/add', auth, async (req, res) => {
  try {
    const { medicineName, dosage, time } = req.body;
    const newReminder = new Reminder({
      patientId: req.user.id,
      medicineName,
      dosage,
      time
    });
    const savedReminder = await newReminder.save();
    res.json(savedReminder);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get all reminders
router.get('/', auth, async (req, res) => {
  try {
    const reminders = await Reminder.find({ patientId: req.user.id }).sort({ time: 1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Delete a reminder
router.delete('/:id', auth, async (req, res) => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, patientId: req.user.id });
    res.json({ msg: 'Reminder deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;