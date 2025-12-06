const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
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
  holdingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Holding'
  },
  type: {
    type: String,
    enum: ['BUY', 'SELL', 'DEPOSIT', 'WITHDRAW', 'DIVIDEND', 'INTEREST', 'FEE', 'TRANSFER_IN', 'TRANSFER_OUT'],
    required: true
  },
  symbol: {
    type: String
  },
  quantity: {
    type: Number
  },
  price: {
    type: Number
  },
  amount: {
    type: Number,
    required: true
  },
  fees: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    required: true
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

transactionSchema.index({ userId: 1, accountId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
