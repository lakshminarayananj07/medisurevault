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
const prescriptionRoutes = require('./routes/prescriptions');
const reminderRoutes = require('./routes/reminders');
const messageRoutes = require('./routes/messages');
const inventoryRoutes = require('./routes/inventoryroutes'); 
// Assuming 'api.js' is a general router, keeping it as requested
const apiRoutes = require('./routes/api'); 

// --- 4. REGISTER ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/messages', messageRoutes); 
app.use('/api/inventory', inventoryRoutes);

// General API router (ensure this doesn't conflict with specific routes above)
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