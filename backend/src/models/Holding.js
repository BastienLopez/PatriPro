const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  isin: {
    type: String,
    trim: true
  },
  assetType: {
    type: String,
    enum: ['STOCK', 'ETF', 'CRYPTO', 'FUND', 'BOND', 'UC', 'OTHER'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  buyPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  ter: {
    type: Number,
    default: 0,
    min: 0
  },
  sector: String,
  geography: String,
  currency: {
    type: String,
    default: 'EUR'
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

holdingSchema.virtual('value').get(function() {
  return this.quantity * this.currentPrice;
});

holdingSchema.virtual('pnl').get(function() {
  return (this.currentPrice - this.buyPrice) * this.quantity;
});

holdingSchema.virtual('pnlPercent').get(function() {
  if (this.buyPrice === 0) return 0;
  return ((this.currentPrice - this.buyPrice) / this.buyPrice) * 100;
});

holdingSchema.set('toJSON', { virtuals: true });
holdingSchema.index({ userId: 1, accountId: 1 });

module.exports = mongoose.model('Holding', holdingSchema);
