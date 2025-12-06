const express = require('express');
const CalendarEvent = require('../models/CalendarEvent');
const auth = require('../middleware/auth');

const router = express.Router();

// Get events for a date range
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const query = { userId: req.userId };
    
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (type) query.type = type;
    
    const events = await CalendarEvent.find(query)
      .populate('accountId', 'name')
      .sort({ date: 1 });
    
    // Expand recurring events
    const expandedEvents = [];
    events.forEach(event => {
      expandedEvents.push(event);
      
      if (event.isRecurring && event.recurrence) {
        const expanded = expandRecurringEvent(event, new Date(startDate), new Date(endDate));
        expandedEvents.push(...expanded);
      }
    });
    
    res.json(expandedEvents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single event
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await CalendarEvent.findOne({ _id: req.params.id, userId: req.userId });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create event
router.post('/', auth, async (req, res) => {
  try {
    const event = new CalendarEvent({
      ...req.body,
      userId: req.userId
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update event
router.patch('/:id', auth, async (req, res) => {
  try {
    const event = await CalendarEvent.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await CalendarEvent.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark event as completed
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const event = await CalendarEvent.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isCompleted: true, completedAt: new Date() },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get monthly summary
router.get('/summary/monthly', auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const events = await CalendarEvent.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate }
    });
    
    const summary = events.reduce((acc, e) => {
      if (e.type === 'INCOME') {
        acc.totalIncome += e.amount || 0;
      } else if (['EXPENSE', 'BILL', 'SUBSCRIPTION', 'LOAN_PAYMENT'].includes(e.type)) {
        acc.totalExpenses += e.amount || 0;
      }
      acc.eventCount++;
      return acc;
    }, { totalIncome: 0, totalExpenses: 0, eventCount: 0 });
    
    summary.net = summary.totalIncome - summary.totalExpenses;
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to expand recurring events
function expandRecurringEvent(event, startDate, endDate) {
  const expanded = [];
  const { frequency, dayOfMonth, endDate: recurEnd } = event.recurrence;
  
  let current = new Date(event.date);
  const finalEnd = recurEnd ? new Date(Math.min(recurEnd, endDate)) : endDate;
  
  while (current <= finalEnd) {
    if (current >= startDate && current.getTime() !== event.date.getTime()) {
      expanded.push({
        ...event.toObject(),
        _id: `${event._id}_${current.getTime()}`,
        date: new Date(current),
        isRecurringInstance: true,
        originalEventId: event._id
      });
    }
    
    switch (frequency) {
      case 'DAILY':
        current.setDate(current.getDate() + 1);
        break;
      case 'WEEKLY':
        current.setDate(current.getDate() + 7);
        break;
      case 'MONTHLY':
        current.setMonth(current.getMonth() + 1);
        if (dayOfMonth) current.setDate(dayOfMonth);
        break;
      case 'QUARTERLY':
        current.setMonth(current.getMonth() + 3);
        break;
      case 'YEARLY':
        current.setFullYear(current.getFullYear() + 1);
        break;
      default:
        return expanded;
    }
  }
  
  return expanded;
}

module.exports = router;
