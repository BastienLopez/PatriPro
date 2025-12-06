const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['HOUSING', 'FOOD', 'TRANSPORT', 'UTILITIES', 'SUBSCRIPTIONS', 'HEALTH', 'LEISURE', 'SHOPPING', 'RESTAURANTS', 'INSURANCE', 'TAXES', 'BANK_FEES', 'OTHER'],
    default: 'OTHER'
  },
  frequency: {
    type: String,
    enum: ['ONCE', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'],
    default: 'MONTHLY'
  },
  date: {
    type: Date,
    required: true
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

expenseSchema.index({ userId: 1, date: -1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
