const express = require('express');
const InvestmentStrategy = require('../models/InvestmentStrategy');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all strategies
router.get('/', auth, async (req, res) => {
  try {
    const strategies = await InvestmentStrategy.find({ userId: req.userId })
      .populate('accountId', 'name type')
      .sort({ createdAt: -1 });
    res.json(strategies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single strategy
router.get('/:id', auth, async (req, res) => {
  try {
    const strategy = await InvestmentStrategy.findOne({ _id: req.params.id, userId: req.userId })
      .populate('accountId', 'name type');
    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }
    res.json(strategy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create strategy
router.post('/', auth, async (req, res) => {
  try {
    const strategy = new InvestmentStrategy({
      ...req.body,
      userId: req.userId
    });
    await strategy.save();
    res.status(201).json(strategy);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update strategy
router.patch('/:id', auth, async (req, res) => {
  try {
    const strategy = await InvestmentStrategy.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }
    res.json(strategy);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete strategy
router.delete('/:id', auth, async (req, res) => {
  try {
    const strategy = await InvestmentStrategy.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }
    res.json({ message: 'Strategy deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record a DCA execution
router.post('/:id/execute', auth, async (req, res) => {
  try {
    const { price, quantity, amount, date } = req.body;
    
    const strategy = await InvestmentStrategy.findOne({ _id: req.params.id, userId: req.userId });
    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }
    
    strategy.executions.push({
      date: date || new Date(),
      amount,
      price,
      quantity
    });
    
    strategy.totalInvested += amount;
    strategy.currentValue = strategy.totalQuantity * price;
    
    await strategy.save();
    res.json(strategy);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Compare DCA vs Lump Sum
router.get('/:id/comparison', auth, async (req, res) => {
  try {
    const strategy = await InvestmentStrategy.findOne({ _id: req.params.id, userId: req.userId });
    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }
    
    if (strategy.executions.length === 0) {
      return res.json({ message: 'No executions yet' });
    }
    
    const firstExecution = strategy.executions[0];
    const lastPrice = strategy.executions[strategy.executions.length - 1].price;
    
    // Lump sum scenario: invest all at first price
    const lumpSumQuantity = strategy.totalInvested / firstExecution.price;
    const lumpSumValue = lumpSumQuantity * lastPrice;
    
    const comparison = {
      dca: {
        totalInvested: strategy.totalInvested,
        currentValue: strategy.currentValue,
        performance: strategy.performance,
        averagePrice: strategy.averagePrice
      },
      lumpSum: {
        totalInvested: strategy.totalInvested,
        currentValue: lumpSumValue,
        performance: ((lumpSumValue - strategy.totalInvested) / strategy.totalInvested) * 100,
        buyPrice: firstExecution.price
      },
      winner: strategy.currentValue > lumpSumValue ? 'DCA' : 'LUMP_SUM',
      difference: strategy.currentValue - lumpSumValue
    };
    
    res.json(comparison);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
