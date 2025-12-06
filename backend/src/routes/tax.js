const express = require('express');
const TaxReport = require('../models/TaxReport');
const Transaction = require('../models/Transaction');
const Holding = require('../models/Holding');
const Income = require('../models/Income');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tax reports
router.get('/reports', auth, async (req, res) => {
  try {
    const reports = await TaxReport.find({ userId: req.userId }).sort({ year: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single report
router.get('/reports/:id', auth, async (req, res) => {
  try {
    const report = await TaxReport.findOne({ _id: req.params.id, userId: req.userId });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update tax report
router.post('/reports', auth, async (req, res) => {
  try {
    const report = new TaxReport({
      ...req.body,
      userId: req.userId
    });
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update report
router.patch('/reports/:id', auth, async (req, res) => {
  try {
    const report = await TaxReport.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete report
router.delete('/reports/:id', auth, async (req, res) => {
  try {
    const report = await TaxReport.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate capital gains for a year
router.get('/capital-gains/:year', auth, async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    
    // Get all SELL transactions for the year
    const sells = await Transaction.find({
      userId: req.userId,
      type: 'SELL',
      date: { $gte: startDate, $lte: endDate }
    }).populate('holdingId', 'assetType symbol');
    
    const gains = {
      crypto: { realized: 0, transactions: [] },
      stocks: { realized: 0, transactions: [] },
      total: 0
    };
    
    sells.forEach(tx => {
      const gain = tx.amount - (tx.quantity * tx.price); // Simplified
      const category = tx.holdingId?.assetType === 'CRYPTO' ? 'crypto' : 'stocks';
      
      gains[category].realized += gain;
      gains[category].transactions.push({
        date: tx.date,
        symbol: tx.symbol,
        quantity: tx.quantity,
        salePrice: tx.price,
        gain
      });
    });
    
    gains.total = gains.crypto.realized + gains.stocks.realized;
    
    res.json(gains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate dividends for a year
router.get('/dividends/:year', auth, async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    
    const dividends = await Transaction.find({
      userId: req.userId,
      type: 'DIVIDEND',
      date: { $gte: startDate, $lte: endDate }
    });
    
    const total = dividends.reduce((sum, d) => sum + d.amount, 0);
    
    res.json({
      total,
      count: dividends.length,
      transactions: dividends.map(d => ({
        date: d.date,
        symbol: d.symbol,
        amount: d.amount
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate interest income for a year
router.get('/interest/:year', auth, async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    
    const interests = await Transaction.find({
      userId: req.userId,
      type: 'INTEREST',
      date: { $gte: startDate, $lte: endDate }
    });
    
    const total = interests.reduce((sum, i) => sum + i.amount, 0);
    
    res.json({
      total,
      count: interests.length,
      transactions: interests
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate annual tax summary
router.get('/summary/:year', auth, async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    // Fetch all relevant data
    const [capitalGains, dividends, interests, freelanceIncomes] = await Promise.all([
      // Capital gains (simplified)
      Transaction.find({
        userId: req.userId,
        type: 'SELL',
        date: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) }
      }),
      // Dividends
      Transaction.find({
        userId: req.userId,
        type: 'DIVIDEND',
        date: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) }
      }),
      // Interest
      Transaction.find({
        userId: req.userId,
        type: 'INTEREST',
        date: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) }
      }),
      // Freelance income
      Income.find({
        userId: req.userId,
        category: 'FREELANCE',
        date: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) }
      })
    ]);
    
    const summary = {
      year,
      capitalGains: {
        crypto: 0, // Would need more complex calculation
        stocks: 0,
        total: 0
      },
      dividends: dividends.reduce((sum, d) => sum + d.amount, 0),
      interest: interests.reduce((sum, i) => sum + i.amount, 0),
      freelanceIncome: freelanceIncomes.reduce((sum, f) => sum + f.amount, 0),
      formReferences: {
        case2DC: dividends.reduce((sum, d) => sum + d.amount, 0), // Dividendes
        case2TR: interests.reduce((sum, i) => sum + i.amount, 0), // Intérêts
        case3VG: 0, // Plus-values crypto (simplified)
        case3AN: 0  // Plus-values mobilières (simplified)
      }
    };
    
    summary.totalTaxableIncome = 
      summary.capitalGains.total + 
      summary.dividends + 
      summary.interest + 
      summary.freelanceIncome;
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
