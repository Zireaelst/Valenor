const express = require('express');
const { body } = require('express-validator');
const { fraudCheck, getFraudStats, upload } = require('../controllers/fraudController');
const { errorHandler } = require('../middleware/errorHandler');

const router = express.Router();

// POST /api/fraud/check - Upload PDF and perform fraud detection
router.post('/check', 
  upload.single('pdf'), // Handle single PDF file upload
  fraudCheck
);

// GET /api/fraud/stats - Get fraud detection statistics
router.get('/stats', getFraudStats);

// Error handling middleware for this route
router.use(errorHandler);

module.exports = router;
