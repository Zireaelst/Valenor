const express = require('express');
const { body } = require('express-validator');
const {
  analyzeProposal,
  getAiInsights,
  updateProposalAnalysis
} = require('../controllers/aiController');

const router = express.Router();

// Validation middleware
const analyzeProposalValidation = [
  body('title').isLength({ min: 10, max: 100 }).withMessage('Title must be between 10 and 100 characters'),
  body('description').isLength({ min: 50, max: 2000 }).withMessage('Description must be between 50 and 2000 characters'),
  body('amount').matches(/^\d+(\.\d+)?$/).withMessage('Amount must be a valid number'),
  body('category').optional().isIn(['education', 'healthcare', 'environment', 'community', 'technology', 'other']).withMessage('Invalid category')
];

const updateAnalysisValidation = [
  body('proposalId').isInt({ min: 1 }).withMessage('Proposal ID must be a positive integer'),
  body('aiScore').isFloat({ min: 0, max: 10 }).withMessage('AI score must be between 0 and 10'),
  body('aiAnalysis').isObject().withMessage('AI analysis must be an object')
];

// Routes
router.post('/analyze', analyzeProposalValidation, analyzeProposal);
router.get('/insights', getAiInsights);
router.post('/update-analysis', updateAnalysisValidation, updateProposalAnalysis);

module.exports = router;
