const express = require('express');
const router = express.Router();
const auth = require('../Middleware/authMiddleware');
const Message = require('../models/Message');

// @route   POST /api/messages/send
// @desc    Send a message (text or prescription)
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, type, content, prescriptionData } = req.body;
    
    // Determine sender ID (handling your middleware structure)
    const senderId = req.user.user ? req.user.user.id : req.user.id;

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      type,
      content,
      prescriptionData
    });

    await newMessage.save();
    res.json({ success: true, data: newMessage });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/messages/:otherUserId
// @desc    Get conversation between current user and another user
router.get('/:otherUserId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.user ? req.user.user.id : req.user.id;
    const otherUserId = req.params.otherUserId;

    // Find messages where (Sender=Me AND Receiver=Them) OR (Sender=Them AND Receiver=Me)
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    }).sort({ timestamp: 1 }); // Sort by oldest to newest

    res.json({ success: true, data: messages });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;