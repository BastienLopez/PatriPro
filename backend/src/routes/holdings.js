const express = require('express');
const Holding = require('../models/Holding');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all holdings
router.get('/', auth, async (req, res) => {
  try {
    const { accountId, assetType } = req.query;
    const query = { userId: req.userId };
    if (accountId) query.accountId = accountId;
    if (assetType) query.assetType = assetType;
    
    const holdings = await Holding.find(query).populate('accountId', 'name type');
    res.json(holdings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single holding
router.get('/:id', auth, async (req, res) => {
  try {
    const holding = await Holding.findOne({ _id: req.params.id, userId: req.userId })
      .populate('accountId', 'name type');
    if (!holding) {
      return res.status(404).json({ error: 'Holding not found' });
    }
    res.json(holding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create holding
router.post('/', auth, async (req, res) => {
  try {
    const holding = new Holding({
      ...req.body,
      userId: req.userId
    });
    await holding.save();
    res.status(201).json(holding);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update holding
router.patch('/:id', auth, async (req, res) => {
  try {
    const holding = await Holding.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, lastUpdatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!holding) {
      return res.status(404).json({ error: 'Holding not found' });
    }
    res.json(holding);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete holding
router.delete('/:id', auth, async (req, res) => {
  try {
    const holding = await Holding.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!holding) {
      return res.status(404).json({ error: 'Holding not found' });
    }
    res.json({ message: 'Holding deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get portfolio summary
router.get('/summary/portfolio', auth, async (req, res) => {
  try {
    const holdings = await Holding.find({ userId: req.userId });
    
    const summary = holdings.reduce((acc, h) => {
      const value = h.quantity * h.currentPrice;
      const pnl = (h.currentPrice - h.buyPrice) * h.quantity;
      
      acc.totalValue += value;
      acc.totalPnl += pnl;
      acc.totalInvested += h.buyPrice * h.quantity;
      
      if (!acc.byType[h.assetType]) {
        acc.byType[h.assetType] = { value: 0, pnl: 0, count: 0 };
      }
      acc.byType[h.assetType].value += value;
      acc.byType[h.assetType].pnl += pnl;
      acc.byType[h.assetType].count++;
      
      return acc;
    }, { totalValue: 0, totalPnl: 0, totalInvested: 0, byType: {} });
    
    summary.pnlPercent = summary.totalInvested > 0 
      ? (summary.totalPnl / summary.totalInvested) * 100 
      : 0;
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
