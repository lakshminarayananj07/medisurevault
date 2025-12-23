const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// --- 1. CONNECT TO DATABASE ---
connectDB();

const app = express();

// --- 2. MIDDLEWARE ---
app.use(cors());
app.use(express.json()); // Allows server to accept JSON data

// --- 3. IMPORT ROUTES ---
const authRoutes = require('./routes/auth');
const reminderRoutes = require('./routes/reminders');
const messageRoutes = require('./routes/messages');
const inventoryRoutes = require('./routes/inventoryroutes'); 
const apiRoutes = require('./routes/api'); 

// === PRESCRIPTION ROUTES ===
// 1. The Old Route (Likely handles "Viewing/Fetching" history)
const standardPrescriptionRoutes = require('./routes/prescriptions');

// 2. The New Blockchain Route (Handles "Issuing" new ones)
const blockchainPrescriptionRoutes = require("./routes/prescriptionRoutes");


// --- 4. REGISTER ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/messages', messageRoutes); 
app.use('/api/inventory', inventoryRoutes);

// Register BOTH prescription files to the same URL path
// Express checks them in order. If it doesn't find the route in the first one, it checks the second.
app.use('/api/prescriptions', standardPrescriptionRoutes);
app.use('/api/prescriptions', blockchainPrescriptionRoutes);

// General API router 
app.use('/api', apiRoutes); 

// --- 5. ROOT ROUTE (Health Check) ---
app.get('/', (req, res) => {
  res.send('MediSure Vault Server is running!');
});

// --- 6. START SERVER ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});