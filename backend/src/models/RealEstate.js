const mongoose = require('mongoose');

const realEstateSchema = new mongoose.Schema({
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
    enum: ['PRIMARY_RESIDENCE', 'SECONDARY_RESIDENCE', 'RENTAL', 'LMNP', 'PARKING', 'COMMERCIAL', 'OTHER'],
    required: true
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: { type: String, default: 'France' }
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  currentEstimatedValue: {
    type: Number,
    required: true,
    min: 0
  },
  surface: {
    type: Number,
    min: 0
  },
  rentalIncome: {
    type: Number,
    default: 0
  },
  charges: {
    taxeFonciere: { type: Number, default: 0 },
    chargesCopro: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    managementFees: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  linkedLoanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan'
  },
  notaryFees: {
    type: Number,
    default: 0
  },
  renovationCosts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

realEstateSchema.virtual('totalCharges').get(function() {
  const c = this.charges;
  return (c.taxeFonciere + c.chargesCopro + c.insurance + c.managementFees + c.other);
});

realEstateSchema.virtual('annualRentalIncome').get(function() {
  return this.rentalIncome * 12;
});

realEstateSchema.virtual('grossYield').get(function() {
  if (this.purchasePrice === 0) return 0;
  return (this.annualRentalIncome / this.purchasePrice) * 100;
});

realEstateSchema.virtual('netYield').get(function() {
  if (this.purchasePrice === 0) return 0;
  const netIncome = this.annualRentalIncome - (this.totalCharges * 12);
  return (netIncome / this.purchasePrice) * 100;
});

realEstateSchema.virtual('monthlyCashflow').get(function() {
  return this.rentalIncome - this.totalCharges;
});

realEstateSchema.set('toJSON', { virtuals: true });
realEstateSchema.index({ userId: 1 });

module.exports = mongoose.model('RealEstate', realEstateSchema);
