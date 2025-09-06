const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  // Smart contract proposal ID
  contractId: {
    type: Number,
    required: true,
    unique: true
  },
  
  // Basic proposal information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Financial details
  amount: {
    type: String, // Store as string to maintain precision
    required: true
  },
  
  recipient: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid Ethereum address'
    }
  },
  
  // Proposal metadata
  proposer: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid Ethereum address'
    }
  },
  
  // Voting information
  votesFor: {
    type: String,
    default: '0'
  },
  
  votesAgainst: {
    type: String,
    default: '0'
  },
  
  // Timing
  startTime: {
    type: Date,
    required: true
  },
  
  endTime: {
    type: Date,
    required: true
  },
  
  // Status
  executed: {
    type: Boolean,
    default: false
  },
  
  cancelled: {
    type: Boolean,
    default: false
  },
  
  // AI Analysis
  aiScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  
  aiAnalysis: {
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral'
    },
    impactScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    feasibilityScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    summary: {
      type: String,
      maxlength: 500
    }
  },
  
  // Additional metadata
  category: {
    type: String,
    enum: ['education', 'healthcare', 'environment', 'community', 'technology', 'other'],
    default: 'other'
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
proposalSchema.index({ contractId: 1 });
proposalSchema.index({ proposer: 1 });
proposalSchema.index({ executed: 1, cancelled: 1 });
proposalSchema.index({ endTime: 1 });
proposalSchema.index({ aiScore: -1 });
proposalSchema.index({ createdAt: -1 });

// Virtual for total votes
proposalSchema.virtual('totalVotes').get(function() {
  return (parseFloat(this.votesFor) + parseFloat(this.votesAgainst)).toString();
});

// Virtual for vote percentage
proposalSchema.virtual('votePercentage').get(function() {
  const total = parseFloat(this.votesFor) + parseFloat(this.votesAgainst);
  if (total === 0) return { for: 0, against: 0 };
  return {
    for: Math.round((parseFloat(this.votesFor) / total) * 100),
    against: Math.round((parseFloat(this.votesAgainst) / total) * 100)
  };
});

// Virtual for status
proposalSchema.virtual('status').get(function() {
  if (this.cancelled) return 'cancelled';
  if (this.executed) return 'executed';
  if (this.endTime > new Date()) return 'active';
  return 'ended';
});

// Ensure virtual fields are serialized
proposalSchema.set('toJSON', { virtuals: true });
proposalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Proposal', proposalSchema);
