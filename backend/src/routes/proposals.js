const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getProposals,
  getProposal,
  createProposal,
  updateProposal,
  getProposalStats
} = require('../controllers/proposalController');

const router = express.Router();

// Validation middleware
const createProposalValidation = [
  body('contractId').isInt({ min: 1 }).withMessage('Contract ID must be a positive integer'),
  body('title').isLength({ min: 10, max: 100 }).withMessage('Title must be between 10 and 100 characters'),
  body('description').isLength({ min: 50, max: 2000 }).withMessage('Description must be between 50 and 2000 characters'),
  body('amount').matches(/^\d+(\.\d+)?$/).withMessage('Amount must be a valid number'),
  body('recipient').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid recipient address'),
  body('proposer').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid proposer address'),
  body('startTime').isISO8601().withMessage('Invalid start time'),
  body('endTime').isISO8601().withMessage('Invalid end time'),
  body('category').optional().isIn(['education', 'healthcare', 'environment', 'community', 'technology', 'other']).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
];

const updateProposalValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid proposal ID'),
  body('votesFor').optional().matches(/^\d+(\.\d+)?$/).withMessage('Invalid votes for amount'),
  body('votesAgainst').optional().matches(/^\d+(\.\d+)?$/).withMessage('Invalid votes against amount'),
  body('executed').optional().isBoolean().withMessage('Executed must be a boolean'),
  body('cancelled').optional().isBoolean().withMessage('Cancelled must be a boolean'),
  body('aiScore').optional().isFloat({ min: 0, max: 10 }).withMessage('AI score must be between 0 and 10'),
  body('aiAnalysis').optional().isObject().withMessage('AI analysis must be an object')
];

const getProposalValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid proposal ID')
];

const getProposalsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['active', 'completed', 'cancelled', 'ended']).withMessage('Invalid status'),
  query('category').optional().isIn(['education', 'healthcare', 'environment', 'community', 'technology', 'other']).withMessage('Invalid category'),
  query('sortBy').optional().isIn(['createdAt', 'endTime', 'aiScore', 'amount']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
];

// Routes
router.get('/', getProposalsValidation, getProposals);
router.get('/stats', getProposalStats);
router.get('/:id', getProposalValidation, getProposal);
router.post('/', createProposalValidation, createProposal);
router.put('/:id', updateProposalValidation, updateProposal);

module.exports = router;
