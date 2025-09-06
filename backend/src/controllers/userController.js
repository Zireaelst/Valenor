const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get all users with filtering and pagination
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      members,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (members !== undefined) {
      filter['membership.isMember'] = members === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const users = await User.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v')
      .lean();

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single user by address
const getUser = async (req, res) => {
  try {
    const { address } = req.params;
    
    const user = await User.findOne({ address }).select('-__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create new user
const createUser = async (req, res) => {
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

    const { address, profile, membership } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ address });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new user
    const user = new User({
      address,
      profile: profile || {},
      membership: {
        ...membership,
        joinDate: membership?.isMember ? new Date() : undefined
      }
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { address } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.address;
    delete updates.createdAt;

    // Handle membership updates
    if (updates.membership?.isMember && !updates.membership.joinDate) {
      updates.membership.joinDate = new Date();
    }

    const user = await User.findOneAndUpdate(
      { address },
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalMembers: {
            $sum: { $cond: ['$membership.isMember', 1, 0] }
          },
          totalStaked: {
            $sum: { $toDouble: '$membership.stakeAmount' }
          },
          activeUsers: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    '$activity.lastActive',
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const topContributors = await User.aggregate([
      { $match: { 'membership.isMember': true } },
      {
        $project: {
          address: 1,
          'profile.username': 1,
          'membership.stakeAmount': 1,
          'activity.proposalsCreated': 1,
          'activity.proposalsPassed': 1,
          'activity.totalVotes': 1
        }
      },
      { $sort: { 'membership.stakeAmount': -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalUsers: 0,
          totalMembers: 0,
          totalStaked: 0,
          activeUsers: 0
        },
        topContributors
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  getUserStats
};
