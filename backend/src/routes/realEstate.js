const express = require('express');
const RealEstate = require('../models/RealEstate');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all real estate assets
router.get('/', auth, async (req, res) => {
  try {
    const assets = await RealEstate.find({ userId: req.userId })
      .populate('linkedLoanId', 'name remainingPrincipal monthlyPayment')
      .sort({ purchaseDate: -1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single asset
router.get('/:id', auth, async (req, res) => {
  try {
    const asset = await RealEstate.findOne({ _id: req.params.id, userId: req.userId })
      .populate('linkedLoanId');
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create asset
router.post('/', auth, async (req, res) => {
  try {
    const asset = new RealEstate({
      ...req.body,
      userId: req.userId
    });
    await asset.save();
    res.status(201).json(asset);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update asset
router.patch('/:id', auth, async (req, res) => {
  try {
    const asset = await RealEstate.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete asset
router.delete('/:id', auth, async (req, res) => {
  try {
    const asset = await RealEstate.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json({ message: 'Asset deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get real estate portfolio summary
router.get('/summary/portfolio', auth, async (req, res) => {
  try {
    const assets = await RealEstate.find({ userId: req.userId });
    
    const summary = assets.reduce((acc, a) => {
      acc.totalPurchaseValue += a.purchasePrice;
      acc.totalCurrentValue += a.currentEstimatedValue;
      acc.totalRentalIncome += a.rentalIncome * 12;
      acc.totalCharges += a.totalCharges * 12;
      acc.netRentalIncome += (a.rentalIncome - a.totalCharges) * 12;
      
      if (!acc.byType[a.type]) {
        acc.byType[a.type] = { count: 0, value: 0 };
      }
      acc.byType[a.type].count++;
      acc.byType[a.type].value += a.currentEstimatedValue;
      
      return acc;
    }, {
      totalPurchaseValue: 0,
      totalCurrentValue: 0,
      totalRentalIncome: 0,
      totalCharges: 0,
      netRentalIncome: 0,
      byType: {}
    });
    
    summary.appreciation = summary.totalPurchaseValue > 0
      ? ((summary.totalCurrentValue - summary.totalPurchaseValue) / summary.totalPurchaseValue) * 100
      : 0;
    
    summary.averageGrossYield = summary.totalCurrentValue > 0
      ? (summary.totalRentalIncome / summary.totalCurrentValue) * 100
      : 0;
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
