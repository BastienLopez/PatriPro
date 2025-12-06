const mongoose = require('mongoose');

const invoiceLineSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  vatRate: { type: Number, default: 0 },
  total: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  number: {
    type: String,
    required: true
  },
  quoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote'
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
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'],
    default: 'DRAFT'
  },
  lines: [invoiceLineSchema],
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
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

invoiceSchema.index({ userId: 1, number: 1 });
invoiceSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
