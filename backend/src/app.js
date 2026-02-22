const express = require('express');
const cors = require('cors');
const assetRoutes = require('./routes/assetRoutes');
const riskRoutes = require('./routes/riskRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/assets', assetRoutes);
app.use('/risk', riskRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;
