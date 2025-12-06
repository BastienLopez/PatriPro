const express = require('express');
const Income = require('../models/Income');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all incomes
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const query = { userId: req.userId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (category) query.category = category;
    
    const incomes = await Income.find(query).sort({ date: -1 });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create income
router.post('/', auth, async (req, res) => {
  try {
    const income = new Income({
      ...req.body,
      userId: req.userId
    });
    await income.save();
    res.status(201).json(income);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update income
router.patch('/:id', auth, async (req, res) => {
  try {
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }
    res.json(income);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete income
router.delete('/:id', auth, async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }
    res.json({ message: 'Income deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get income summary
router.get('/summary/totals', auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    const query = { userId: req.userId };
    
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      query.date = { $gte: startOfYear, $lte: endOfYear };
    }
    
    const incomes = await Income.find(query);
    
    const summary = incomes.reduce((acc, inc) => {
      acc.total += inc.amount;
      if (!acc.byCategory[inc.category]) {
        acc.byCategory[inc.category] = 0;
      }
      acc.byCategory[inc.category] += inc.amount;
      return acc;
    }, { total: 0, byCategory: {} });
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
