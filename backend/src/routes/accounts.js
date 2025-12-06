const express = require('express');
const Account = require('../models/Account');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all accounts for user
router.get('/', auth, async (req, res) => {
  try {
    const { type } = req.query;
    const query = { userId: req.userId };
    if (type) query.type = type;
    
    const accounts = await Account.find(query).sort({ createdAt: -1 });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single account
router.get('/:id', auth, async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.userId });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create account
router.post('/', auth, async (req, res) => {
  try {
    const account = new Account({
      ...req.body,
      userId: req.userId
    });
    await account.save();
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update account
router.patch('/:id', auth, async (req, res) => {
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete account
router.delete('/:id', auth, async (req, res) => {
  try {
    const account = await Account.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json({ message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get accounts summary
router.get('/summary/totals', auth, async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.userId });
    
    const summary = accounts.reduce((acc, account) => {
      acc.totalBalance += account.balance || 0;
      if (!acc.byType[account.type]) {
        acc.byType[account.type] = { count: 0, total: 0 };
      }
      acc.byType[account.type].count++;
      acc.byType[account.type].total += account.balance || 0;
      return acc;
    }, { totalBalance: 0, byType: {} });
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
