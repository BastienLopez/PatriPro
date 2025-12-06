const mongoose = require('mongoose');

const investmentStrategySchema = new mongoose.Schema({
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
    enum: ['DCA_CRYPTO', 'DCA_ETF', 'DCA_STOCK', 'LUMP_SUM', 'VALUE_AVERAGING'],
    required: true
  },
  assetSymbol: {
    type: String,
    required: true,
    uppercase: true
  },
  assetName: {
    type: String
  },
  amountPerPeriod: {
    type: Number,
    required: true,
    min: 0
  },
  frequency: {
    type: String,
    enum: ['DAILY', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY'],
    default: 'MONTHLY'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  targetAmount: {
    type: Number
  },
  totalInvested: {
    type: Number,
    default: 0
  },
  currentValue: {
    type: Number,
    default: 0
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  executions: [{
    date: Date,
    amount: Number,
    price: Number,
    quantity: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

investmentStrategySchema.virtual('performance').get(function() {
  if (this.totalInvested === 0) return 0;
  return ((this.currentValue - this.totalInvested) / this.totalInvested) * 100;
});

investmentStrategySchema.virtual('totalQuantity').get(function() {
  return this.executions.reduce((sum, ex) => sum + ex.quantity, 0);
});

investmentStrategySchema.virtual('averagePrice').get(function() {
  const totalQty = this.totalQuantity;
  if (totalQty === 0) return 0;
  return this.totalInvested / totalQty;
});

investmentStrategySchema.set('toJSON', { virtuals: true });
investmentStrategySchema.index({ userId: 1 });

module.exports = mongoose.model('InvestmentStrategy', investmentStrategySchema);
