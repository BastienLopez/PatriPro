const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['INCOME', 'EXPENSE', 'BILL', 'LOAN_PAYMENT', 'SUBSCRIPTION', 'TAX', 'INVESTMENT', 'REMINDER', 'OTHER'],
    required: true
  },
  amount: {
    type: Number
  },
  date: {
    type: Date,
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrence: {
    frequency: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']
    },
    dayOfMonth: Number,
    dayOfWeek: Number,
    endDate: Date
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  category: {
    type: String
  },
  notes: {
    type: String
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

calendarEventSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
