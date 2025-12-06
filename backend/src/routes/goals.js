const express = require('express');
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all goals
router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId })
      .populate('linkedAccountIds', 'name type balance')
      .sort({ priority: -1, targetDate: 1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single goal
router.get('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId })
      .populate('linkedAccountIds', 'name type balance');
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create goal
router.post('/', auth, async (req, res) => {
  try {
    const goal = new Goal({
      ...req.body,
      userId: req.userId
    });
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update goal
router.patch('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    // Auto-complete if target reached
    if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
      goal.isCompleted = true;
      goal.completedAt = new Date();
      await goal.save();
    }
    
    res.json(goal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate projections for a goal
router.get('/:id/projections', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    const remaining = goal.targetAmount - goal.currentAmount;
    const monthsToTarget = goal.monthsToGoal;
    
    // Project different scenarios
    const projections = {
      current: {
        monthlyAmount: goal.monthlyContribution,
        monthsNeeded: monthsToTarget,
        estimatedDate: monthsToTarget 
          ? new Date(Date.now() + monthsToTarget * 30 * 24 * 60 * 60 * 1000)
          : null
      },
      aggressive: {
        monthlyAmount: remaining > 0 ? Math.ceil(remaining / 6) : 0,
        monthsNeeded: 6,
        estimatedDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000)
      },
      moderate: {
        monthlyAmount: remaining > 0 ? Math.ceil(remaining / 12) : 0,
        monthsNeeded: 12,
        estimatedDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000)
      }
    };
    
    res.json(projections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
