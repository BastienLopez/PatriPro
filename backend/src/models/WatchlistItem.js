const mongoose = require('mongoose');

const watchlistItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true
  },
  assetType: {
    type: String,
    enum: ['STOCK', 'ETF', 'CRYPTO', 'FUND', 'INDEX', 'OTHER'],
    required: true
  },
  currentPrice: {
    type: Number,
    default: 0
  },
  change24h: {
    type: Number,
    default: 0
  },
  change7d: {
    type: Number,
    default: 0
  },
  change30d: {
    type: Number,
    default: 0
  },
  targetPrice: {
    type: Number
  },
  alertEnabled: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
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

watchlistItemSchema.index({ userId: 1 });

module.exports = mongoose.model('WatchlistItem', watchlistItemSchema);
