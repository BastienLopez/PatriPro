const express = require('express');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all subscriptions
router.get('/', auth, async (req, res) => {
  try {
    const { type } = req.query;
    const query = { userId: req.userId };
    if (type) query.type = type;
    
    const subscriptions = await Subscription.find(query)
      .populate('linkedAccountId', 'name')
      .sort({ nextBillingDate: 1 });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single subscription
router.get('/:id', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ _id: req.params.id, userId: req.userId });
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create subscription
router.post('/', auth, async (req, res) => {
  try {
    const subscription = new Subscription({
      ...req.body,
      userId: req.userId
    });
    await subscription.save();
    res.status(201).json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update subscription
router.patch('/:id', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ _id: req.params.id, userId: req.userId });
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    // Track price changes
    if (req.body.amount && req.body.amount !== subscription.amount) {
      subscription.priceHistory.push({
        amount: subscription.amount,
        date: new Date()
      });
    }
    
    Object.assign(subscription, req.body);
    await subscription.save();
    res.json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete subscription
router.delete('/:id', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json({ message: 'Subscription deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subscriptions summary
router.get('/summary/totals', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.userId, isActive: true });
    
    const summary = subscriptions.reduce((acc, s) => {
      acc.monthlyTotal += s.monthlyEquivalent;
      acc.yearlyTotal += s.yearlyEquivalent;
      acc.count++;
      
      if (!acc.byCategory[s.category]) {
        acc.byCategory[s.category] = { count: 0, monthly: 0, yearly: 0 };
      }
      acc.byCategory[s.category].count++;
      acc.byCategory[s.category].monthly += s.monthlyEquivalent;
      acc.byCategory[s.category].yearly += s.yearlyEquivalent;
      
      if (!acc.byType[s.type]) {
        acc.byType[s.type] = { count: 0, monthly: 0 };
      }
      acc.byType[s.type].count++;
      acc.byType[s.type].monthly += s.monthlyEquivalent;
      
      return acc;
    }, { monthlyTotal: 0, yearlyTotal: 0, count: 0, byCategory: {}, byType: {} });
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alerts (unused, price increases)
router.get('/alerts/all', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.userId, isActive: true });
    const now = new Date();
    const twoMonthsAgo = new Date(now.setMonth(now.getMonth() - 2));
    
    const alerts = [];
    
    subscriptions.forEach(s => {
      // Unused for 2+ months
      if (s.lastUsedDate && s.lastUsedDate < twoMonthsAgo) {
        alerts.push({
          type: 'UNUSED',
          subscriptionId: s._id,
          name: s.name,
          message: `Non utilisé depuis ${Math.floor((new Date() - s.lastUsedDate) / (1000 * 60 * 60 * 24 * 30))} mois`,
          severity: 'warning'
        });
      }
      
      // Price increase detected
      if (s.priceHistory.length > 0) {
        const lastPrice = s.priceHistory[s.priceHistory.length - 1];
        if (s.amount > lastPrice.amount) {
          const increase = ((s.amount - lastPrice.amount) / lastPrice.amount) * 100;
          alerts.push({
            type: 'PRICE_INCREASE',
            subscriptionId: s._id,
            name: s.name,
            message: `Augmentation de ${increase.toFixed(1)}% détectée`,
            severity: 'info'
          });
        }
      }
    });
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
