const express = require('express');
const WatchlistItem = require('../models/WatchlistItem');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all watchlist items
router.get('/', auth, async (req, res) => {
  try {
    const items = await WatchlistItem.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single item
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await WatchlistItem.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create watchlist item
router.post('/', auth, async (req, res) => {
  try {
    const item = new WatchlistItem({
      ...req.body,
      userId: req.userId
    });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update item
router.patch('/:id', auth, async (req, res) => {
  try {
    const item = await WatchlistItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, lastUpdatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete item
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await WatchlistItem.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Convert watchlist item to holding
router.post('/:id/convert', auth, async (req, res) => {
  try {
    const { accountId, quantity, buyPrice } = req.body;
    const item = await WatchlistItem.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const Holding = require('../models/Holding');
    const holding = new Holding({
      userId: req.userId,
      accountId,
      name: item.name,
      symbol: item.symbol,
      assetType: item.assetType,
      quantity,
      buyPrice,
      currentPrice: item.currentPrice
    });
    
    await holding.save();
    
    // Optionally remove from watchlist
    if (req.body.removeFromWatchlist) {
      await WatchlistItem.findByIdAndDelete(item._id);
    }
    
    res.status(201).json(holding);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
