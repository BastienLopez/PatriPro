const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
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
    enum: ['CURRENT', 'SAVINGS', 'PEA', 'CTO', 'CRYPTO_WALLET', 'LIFE_INSURANCE', 'LIVRET_A', 'LIVRET_JEUNE', 'LDDS', 'LEP', 'PEL', 'CEL', 'COMPTE_A_TERME', 'OTHER'],
    required: true
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  balance: {
    type: Number,
    default: 0
  },
  interestRate: {
    type: Number,
    default: 0
  },
  ceiling: {
    type: Number
  },
  institution: {
    type: String
  },
  openedAt: {
    type: Date,
    default: Date.now
  },
  // Life insurance specific
  insurer: String,
  insuranceType: {
    type: String,
    enum: ['FONDS_EURO', 'MULTISUPPORT']
  },
  managementFeesRate: Number,
  guaranteedRate: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

accountSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

accountSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Account', accountSchema);
