const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Ethereum address (primary identifier)
  address: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid Ethereum address'
    }
  },
  
  // User profile information
  profile: {
    username: {
      type: String,
      trim: true,
      maxlength: 50
    },
    
    bio: {
      type: String,
      maxlength: 500
    },
    
    avatar: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: 'Invalid avatar URL'
      }
    },
    
    website: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Invalid website URL'
      }
    },
    
    socialLinks: {
      twitter: String,
      github: String,
      linkedin: String
    }
  },
  
  // Membership information
  membership: {
    isMember: {
      type: Boolean,
      default: false
    },
    
    stakeAmount: {
      type: String,
      default: '0'
    },
    
    joinDate: {
      type: Date
    },
    
    isActive: {
      type: Boolean,
      default: true
    }
  },
  
  // Activity tracking
  activity: {
    totalVotes: {
      type: Number,
      default: 0
    },
    
    proposalsCreated: {
      type: Number,
      default: 0
    },
    
    proposalsPassed: {
      type: Number,
      default: 0
    },
    
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  
  // Preferences
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: false
      },
      
      proposalUpdates: {
        type: Boolean,
        default: true
      },
      
      votingReminders: {
        type: Boolean,
        default: true
      }
    },
    
    privacy: {
      showProfile: {
        type: Boolean,
        default: true
      },
      
      showVotingHistory: {
        type: Boolean,
        default: true
      }
    }
  },
  
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

// Indexes
userSchema.index({ address: 1 });
userSchema.index({ 'membership.isMember': 1 });
userSchema.index({ 'activity.lastActive': -1 });
userSchema.index({ createdAt: -1 });

// Virtual for voting power
userSchema.virtual('votingPower').get(function() {
  return this.membership.stakeAmount;
});

// Virtual for success rate
userSchema.virtual('successRate').get(function() {
  if (this.activity.proposalsCreated === 0) return 0;
  return Math.round((this.activity.proposalsPassed / this.activity.proposalsCreated) * 100);
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Update lastActive on save
userSchema.pre('save', function(next) {
  this.activity.lastActive = new Date();
  next();
});

module.exports = mongoose.model('User', userSchema);
