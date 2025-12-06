const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['SAVINGS', 'EMERGENCY_FUND', 'TRAVEL', 'CAR', 'REAL_ESTATE', 'RETIREMENT', 'EDUCATION', 'OTHER'],
    default: 'SAVINGS'
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  targetDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  },
  linkedAccountIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  }],
  monthlyContribution: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: '#10B981'
  },
  icon: {
    type: String
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

goalSchema.virtual('progress').get(function() {
  if (this.targetAmount === 0) return 100;
  return Math.min((this.currentAmount / this.targetAmount) * 100, 100);
});

goalSchema.virtual('remainingAmount').get(function() {
  return Math.max(this.targetAmount - this.currentAmount, 0);
});

goalSchema.virtual('monthsToGoal').get(function() {
  if (this.monthlyContribution <= 0) return null;
  const remaining = this.targetAmount - this.currentAmount;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / this.monthlyContribution);
});

goalSchema.set('toJSON', { virtuals: true });
goalSchema.index({ userId: 1 });

module.exports = mongoose.model('Goal', goalSchema);
