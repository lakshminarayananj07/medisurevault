const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
connectDB();
// ... existing imports ...
const inventoryRoutes = require('./routes/inventoryroutes'); // <--- IMPORT THIS


// ... app.listen(...) ...
const app = express();

app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use('/api/inventory', inventoryRoutes); 
const apiRoutes = require('./routes/api'); 
const authRoutes = require('./routes/auth');
const prescriptionRoutes = require('./routes/prescriptions');
const reminderRoutes = require('./routes/reminders');
app.use('/api', apiRoutes);               // <-- ADD THIS LINE
app.use('/api/auth', authRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reminders', reminderRoutes);

app.get('/', (req, res) => {
  res.send('MediSure Vault Server is running!');
});

// --- SERVER ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});