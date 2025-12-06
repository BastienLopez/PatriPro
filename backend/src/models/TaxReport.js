const mongoose = require('mongoose');

const taxReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['ANNUAL_SUMMARY', 'QUARTERLY_DECLARATION', 'MONTHLY_DECLARATION'],
    default: 'ANNUAL_SUMMARY'
  },
  period: {
    type: String // "2024", "Q1-2024", "01-2024"
  },
  // Calculated values
  cryptoGains: {
    type: Number,
    default: 0
  },
  stockGains: {
    type: Number,
    default: 0
  },
  dividends: {
    type: Number,
    default: 0
  },
  interestIncome: {
    type: Number,
    default: 0
  },
  rentalIncome: {
    type: Number,
    default: 0
  },
  freelanceIncome: {
    type: Number,
    default: 0
  },
  // Micro-entreprise specific
  declaredTurnover: {
    type: Number,
    default: 0
  },
  socialContributions: {
    type: Number,
    default: 0
  },
  incomeTaxPaid: {
    type: Number,
    default: 0
  },
  // Summary
  totalTaxableIncome: {
    type: Number,
    default: 0
  },
  estimatedTax: {
    type: Number,
    default: 0
  },
  netIncome: {
    type: Number,
    default: 0
  },
  // French tax form references
  formReferences: {
    case2DC: Number, // Dividendes
    case2TR: Number, // Intérêts
    case3VG: Number, // Plus-values crypto
    case3AN: Number, // Plus-values mobilières
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['DRAFT', 'FILED', 'PAID'],
    default: 'DRAFT'
  },
  filedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

taxReportSchema.index({ userId: 1, year: -1 });

module.exports = mongoose.model('TaxReport', taxReportSchema);
