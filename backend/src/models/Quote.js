const mongoose = require('mongoose');

const quoteLineSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  vatRate: { type: Number, default: 0 },
  total: { type: Number, required: true }
});

const quoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  number: {
    type: String,
    required: true
  },
  client: {
    name: { type: String, required: true },
    company: String,
    address: String,
    email: String,
    phone: String
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SENT', 'ACCEPTED', 'REFUSED', 'EXPIRED'],
    default: 'DRAFT'
  },
  lines: [quoteLineSchema],
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  notes: {
    type: String
  },
  termsAndConditions: {
    type: String
  },
  convertedToInvoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

quoteSchema.index({ userId: 1, number: 1 });

module.exports = mongoose.model('Quote', quoteSchema);
