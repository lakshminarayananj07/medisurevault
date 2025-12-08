const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Import our User model

const router = express.Router();

// --- SIGNUP / REGISTER ROUTE ---
// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    // 1. Check if a user with that username already exists
    let user = await User.findOne({ username: req.body.username });
    if (user) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    // 2. If user doesn't exist, create a new user object from the request body
    user = new User(req.body);

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    // 4. Save the new user to the database
    await user.save();

    // 5. Send a success response
    res.status(201).json({ message: 'User registered successfully!' });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});


// --- LOGIN ROUTE ---
// @route   POST /api/auth/login
// @desc    Authenticate a user and get a token
router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // 1. Check if the user exists with the correct role
    let user = await User.findOne({ username, role });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // 2. Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // 3. If credentials are correct, create a JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Your secret key from the .env file
      { expiresIn: '5h' }, // Token expires in 5 hours
      (err, token) => {
        if (err) throw err;
        // 4. Send the token and user data back to the frontend
        res.json({ token, user });
      }
    );

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;