const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  legalStatus: {
    type: String,
    enum: ['MICRO_ENTREPRISE', 'AUTO_ENTREPRENEUR', 'SASU', 'SARL', 'EURL', 'EI', 'OTHER'],
    default: 'MICRO_ENTREPRISE'
  },
  activityType: {
    type: String,
    enum: ['BIC_VENTE', 'BIC_SERVICE', 'BNC_SERVICE'],
    default: 'BNC_SERVICE'
  },
  siret: {
    type: String
  },
  vatNumber: {
    type: String
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: { type: String, default: 'France' }
  },
  creationDate: {
    type: Date
  },
  usesVersementLiberatoire: {
    type: Boolean,
    default: true
  },
  // Configurable rates (2025 defaults)
  rates: {
    socialRate: { type: Number, default: 24.6 }, // URSSAF
    incomeTaxRate: { type: Number, default: 2.2 }, // Versement libératoire
    trainingContributionRate: { type: Number, default: 0.2 }, // CFP
    cfeRate: { type: Number, default: 0 }
  },
  bankDetails: {
    iban: String,
    bic: String,
    bankName: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);
