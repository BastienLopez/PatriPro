const express = require('express');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all expenses
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
    
    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create expense
router.post('/', auth, async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      userId: req.userId
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update expense
router.patch('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expense summary
router.get('/summary/totals', auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    const query = { userId: req.userId };
    
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      query.date = { $gte: startOfYear, $lte: endOfYear };
    }
    
    const expenses = await Expense.find(query);
    
    const summary = expenses.reduce((acc, exp) => {
      acc.total += exp.amount;
      if (!acc.byCategory[exp.category]) {
        acc.byCategory[exp.category] = 0;
      }
      acc.byCategory[exp.category] += exp.amount;
      return acc;
    }, { total: 0, byCategory: {} });
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cashflow data for Sankey
router.get('/cashflow/sankey', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.userId };
    
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const [expenses, incomes] = await Promise.all([
      Expense.find(query),
      require('../models/Income').find(query)
    ]);
    
    const incomeTotal = incomes.reduce((sum, i) => sum + i.amount, 0);
    const expensesByCategory = expenses.reduce((acc, e) => {
      if (!acc[e.category]) acc[e.category] = 0;
      acc[e.category] += e.amount;
      return acc;
    }, {});
    
    const nodes = [
      { id: 'income', name: 'Revenus' },
      ...Object.keys(expensesByCategory).map(cat => ({ id: cat, name: cat }))
    ];
    
    const links = Object.entries(expensesByCategory).map(([cat, amount]) => ({
      source: 'income',
      target: cat,
      value: amount
    }));
    
    res.json({
      nodes,
      links,
      totals: {
        income: incomeTotal,
        expenses: expenses.reduce((sum, e) => sum + e.amount, 0),
        net: incomeTotal - expenses.reduce((sum, e) => sum + e.amount, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
