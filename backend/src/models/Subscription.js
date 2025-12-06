const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
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
    enum: ['PERSONAL', 'BUSINESS'],
    default: 'PERSONAL'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  billingPeriod: {
    type: String,
    enum: ['MONTHLY', 'QUARTERLY', 'YEARLY'],
    default: 'MONTHLY'
  },
  category: {
    type: String,
    enum: ['STREAMING', 'SAAS', 'HOSTING', 'DEV_TOOLS', 'MUSIC', 'GAMING', 'NEWS', 'FITNESS', 'STORAGE', 'COMMUNICATION', 'OTHER'],
    default: 'OTHER'
  },
  nextBillingDate: {
    type: Date,
    required: true
  },
  lastUsedDate: {
    type: Date
  },
  linkedAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  paymentMethod: {
    type: String,
    enum: ['CARD', 'PAYPAL', 'DIRECT_DEBIT', 'OTHER'],
    default: 'CARD'
  },
  url: {
    type: String
  },
  notes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priceHistory: [{
    amount: Number,
    date: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

subscriptionSchema.virtual('monthlyEquivalent').get(function() {
  switch (this.billingPeriod) {
    case 'YEARLY': return this.amount / 12;
    case 'QUARTERLY': return this.amount / 3;
    default: return this.amount;
  }
});

subscriptionSchema.virtual('yearlyEquivalent').get(function() {
  switch (this.billingPeriod) {
    case 'MONTHLY': return this.amount * 12;
    case 'QUARTERLY': return this.amount * 4;
    default: return this.amount;
  }
});

subscriptionSchema.set('toJSON', { virtuals: true });
subscriptionSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
