const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
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
    enum: ['MORTGAGE', 'CONSUMER', 'AUTO', 'STUDENT', 'OTHER'],
    default: 'OTHER'
  },
  principal: {
    type: Number,
    required: true,
    min: 0
  },
  annualRate: {
    type: Number,
    required: true,
    min: 0
  },
  termMonths: {
    type: Number,
    required: true,
    min: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  monthlyPayment: {
    type: Number,
    required: true,
    min: 0
  },
  remainingPrincipal: {
    type: Number,
    required: true,
    min: 0
  },
  remainingMonths: {
    type: Number,
    required: true,
    min: 0
  },
  linkedRealEstateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RealEstate'
  },
  insuranceRate: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

loanSchema.virtual('totalInterest').get(function() {
  return (this.monthlyPayment * this.termMonths) - this.principal;
});

loanSchema.set('toJSON', { virtuals: true });
loanSchema.index({ userId: 1 });

module.exports = mongoose.model('Loan', loanSchema);
