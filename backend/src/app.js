const express = require('express');
const cors = require('cors');
const assetRoutes = require('./routes/assetRoutes');
const riskRoutes = require('./routes/riskRoutes');
const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/assets', protect, assetRoutes);
app.use('/risk', protect, riskRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;
