const express = require('express');
const router = express.Router();
const riskController = require('../controllers/riskController');

router.post('/calculate', riskController.calculateRisk);

module.exports = router;
