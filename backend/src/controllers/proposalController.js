const Proposal = require('../models/Proposal');
const { validationResult } = require('express-validator');

// Get all proposals with filtering and pagination
const getProposals = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) {
      switch (status) {
        case 'active':
          filter.executed = false;
          filter.cancelled = false;
          filter.endTime = { $gt: new Date() };
          break;
        case 'completed':
          filter.executed = true;
          break;
        case 'cancelled':
          filter.cancelled = true;
          break;
        case 'ended':
          filter.executed = false;
          filter.cancelled = false;
          filter.endTime = { $lte: new Date() };
          break;
      }
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const proposals = await Proposal.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Proposal.countDocuments(filter);

    res.json({
      success: true,
      data: {
        proposals,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single proposal by contract ID
const getProposal = async (req, res) => {
  try {
    const { id } = req.params;
    
    const proposal = await Proposal.findOne({ contractId: id });
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    res.json({
      success: true,
      data: proposal
    });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create new proposal
const createProposal = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      contractId,
      title,
      description,
      amount,
      recipient,
      proposer,
      startTime,
      endTime,
      category,
      tags
    } = req.body;

    // Check if proposal already exists
    const existingProposal = await Proposal.findOne({ contractId });
    if (existingProposal) {
      return res.status(409).json({
        success: false,
        message: 'Proposal already exists'
      });
    }

    // Create new proposal
    const proposal = new Proposal({
      contractId,
      title,
      description,
      amount,
      recipient,
      proposer,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      category,
      tags: tags || []
    });

    await proposal.save();

    res.status(201).json({
      success: true,
      message: 'Proposal created successfully',
      data: proposal
    });
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update proposal (for voting updates, execution status, etc.)
const updateProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.contractId;
    delete updates.proposer;
    delete updates.createdAt;

    const proposal = await Proposal.findOneAndUpdate(
      { contractId: id },
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    res.json({
      success: true,
      message: 'Proposal updated successfully',
      data: proposal
    });
  } catch (error) {
    console.error('Error updating proposal:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get proposal statistics
const getProposalStats = async (req, res) => {
  try {
    const stats = await Proposal.aggregate([
      {
        $group: {
          _id: null,
          totalProposals: { $sum: 1 },
          totalAmount: { $sum: { $toDouble: '$amount' } },
          executedProposals: {
            $sum: { $cond: ['$executed', 1, 0] }
          },
          cancelledProposals: {
            $sum: { $cond: ['$cancelled', 1, 0] }
          },
          activeProposals: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$executed', false] },
                    { $eq: ['$cancelled', false] },
                    { $gt: ['$endTime', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          },
          averageAiScore: { $avg: '$aiScore' }
        }
      }
    ]);

    const categoryStats = await Proposal.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAmount: { $sum: { $toDouble: '$amount' } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalProposals: 0,
          totalAmount: 0,
          executedProposals: 0,
          cancelledProposals: 0,
          activeProposals: 0,
          averageAiScore: 0
        },
        categories: categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching proposal stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getProposals,
  getProposal,
  createProposal,
  updateProposal,
  getProposalStats
};
