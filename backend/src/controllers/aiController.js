const axios = require('axios');
const Proposal = require('../models/Proposal');
const { validationResult } = require('express-validator');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Analyze proposal using AI service
const analyzeProposal = async (req, res) => {
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

    const { title, description, amount, category } = req.body;

    // Call AI service for analysis
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze`, {
      title,
      description,
      amount: parseFloat(amount),
      category
    }, {
      timeout: 30000 // 30 second timeout
    });

    const analysis = aiResponse.data;

    res.json({
      success: true,
      data: {
        aiScore: analysis.score,
        aiAnalysis: {
          sentiment: analysis.sentiment,
          impactScore: analysis.impact_score,
          feasibilityScore: analysis.feasibility_score,
          summary: analysis.summary,
          recommendations: analysis.recommendations || []
        }
      }
    });
  } catch (error) {
    console.error('Error analyzing proposal:', error);
    
    // If AI service is unavailable, return default analysis
    if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
      return res.json({
        success: true,
        data: {
          aiScore: 5.0,
          aiAnalysis: {
            sentiment: 'neutral',
            impactScore: 5.0,
            feasibilityScore: 5.0,
            summary: 'AI analysis service is currently unavailable. Manual review recommended.',
            recommendations: ['Review proposal manually', 'Consider community feedback']
          }
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error analyzing proposal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get AI insights and statistics
const getAiInsights = async (req, res) => {
  try {
    // Get AI analysis statistics
    const aiStats = await Proposal.aggregate([
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$aiScore' },
          highScoreProposals: {
            $sum: { $cond: [{ $gte: ['$aiScore', 8] }, 1, 0] }
          },
          mediumScoreProposals: {
            $sum: { $cond: [{ $and: [{ $gte: ['$aiScore', 5] }, { $lt: ['$aiScore', 8] }] }, 1, 0] }
          },
          lowScoreProposals: {
            $sum: { $cond: [{ $lt: ['$aiScore', 5] }, 1, 0] }
          },
          totalAnalyzed: {
            $sum: { $cond: [{ $gt: ['$aiScore', 0] }, 1, 0] }
          }
        }
      }
    ]);

    // Get sentiment distribution
    const sentimentStats = await Proposal.aggregate([
      { $match: { 'aiAnalysis.sentiment': { $exists: true } } },
      {
        $group: {
          _id: '$aiAnalysis.sentiment',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get category performance
    const categoryStats = await Proposal.aggregate([
      { $match: { aiScore: { $gt: 0 } } },
      {
        $group: {
          _id: '$category',
          averageScore: { $avg: '$aiScore' },
          count: { $sum: 1 }
        }
      },
      { $sort: { averageScore: -1 } }
    ]);

    // Get top performing proposals
    const topProposals = await Proposal.find({ aiScore: { $gte: 8 } })
      .select('contractId title aiScore aiAnalysis.summary')
      .sort({ aiScore: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: {
        overview: aiStats[0] || {
          averageScore: 0,
          highScoreProposals: 0,
          mediumScoreProposals: 0,
          lowScoreProposals: 0,
          totalAnalyzed: 0
        },
        sentimentDistribution: sentimentStats,
        categoryPerformance: categoryStats,
        topProposals
      }
    });
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update proposal with AI analysis
const updateProposalAnalysis = async (req, res) => {
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

    const { proposalId, aiScore, aiAnalysis } = req.body;

    // Update proposal with AI analysis
    const proposal = await Proposal.findOneAndUpdate(
      { contractId: proposalId },
      {
        aiScore,
        aiAnalysis,
        updatedAt: new Date()
      },
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
      message: 'Proposal analysis updated successfully',
      data: proposal
    });
  } catch (error) {
    console.error('Error updating proposal analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  analyzeProposal,
  getAiInsights,
  updateProposalAnalysis
};
