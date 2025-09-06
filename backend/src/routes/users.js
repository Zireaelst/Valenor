const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  getUserStats
} = require('../controllers/userController');

const router = express.Router();

// Validation middleware
const createUserValidation = [
  body('address').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid Ethereum address'),
  body('profile.username').optional().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
  body('profile.bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('profile.avatar').optional().isURL().withMessage('Invalid avatar URL'),
  body('profile.website').optional().isURL().withMessage('Invalid website URL'),
  body('membership.stakeAmount').optional().matches(/^\d+(\.\d+)?$/).withMessage('Invalid stake amount')
];

const updateUserValidation = [
  param('address').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid Ethereum address'),
  body('profile.username').optional().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
  body('profile.bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('profile.avatar').optional().isURL().withMessage('Invalid avatar URL'),
  body('profile.website').optional().isURL().withMessage('Invalid website URL'),
  body('membership.isMember').optional().isBoolean().withMessage('isMember must be a boolean'),
  body('membership.stakeAmount').optional().matches(/^\d+(\.\d+)?$/).withMessage('Invalid stake amount'),
  body('preferences').optional().isObject().withMessage('Preferences must be an object')
];

const getUserValidation = [
  param('address').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid Ethereum address')
];

const getUsersValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('members').optional().isBoolean().withMessage('Members filter must be a boolean'),
  query('sortBy').optional().isIn(['createdAt', 'activity.lastActive', 'membership.stakeAmount']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
];

// Routes
router.get('/', getUsersValidation, getUsers);
router.get('/stats', getUserStats);
router.get('/:address', getUserValidation, getUser);
router.post('/', createUserValidation, createUser);
router.put('/:address', updateUserValidation, updateUser);

module.exports = router;
