const express = require('express');
const Loan = require('../models/Loan');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all loans
router.get('/', auth, async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.userId }).sort({ startDate: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single loan with amortization
router.get('/:id', auth, async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.userId });
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    // Generate amortization schedule
    const schedule = generateAmortizationSchedule(loan);
    
    res.json({ loan, schedule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create loan
router.post('/', auth, async (req, res) => {
  try {
    const { principal, annualRate, termMonths, startDate } = req.body;
    
    // Calculate monthly payment
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) 
      / (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    const loan = new Loan({
      ...req.body,
      userId: req.userId,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      remainingPrincipal: principal,
      remainingMonths: termMonths
    });
    
    await loan.save();
    res.status(201).json(loan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update loan
router.patch('/:id', auth, async (req, res) => {
  try {
    const loan = await Loan.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    res.json(loan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete loan
router.delete('/:id', auth, async (req, res) => {
  try {
    const loan = await Loan.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    res.json({ message: 'Loan deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get loans summary
router.get('/summary/totals', auth, async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.userId });
    
    const summary = {
      totalLoans: loans.length,
      totalPrincipal: loans.reduce((sum, l) => sum + l.principal, 0),
      totalRemaining: loans.reduce((sum, l) => sum + l.remainingPrincipal, 0),
      totalMonthlyPayment: loans.reduce((sum, l) => sum + l.monthlyPayment, 0),
      totalInterest: loans.reduce((sum, l) => sum + l.totalInterest, 0)
    };
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function
function generateAmortizationSchedule(loan) {
  const schedule = [];
  let balance = loan.principal;
  const monthlyRate = loan.annualRate / 100 / 12;
  
  for (let month = 1; month <= loan.termMonths; month++) {
    const interest = balance * monthlyRate;
    const principal = loan.monthlyPayment - interest;
    balance -= principal;
    
    schedule.push({
      month,
      payment: loan.monthlyPayment,
      principal: Math.round(principal * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.max(0, Math.round(balance * 100) / 100)
    });
  }
  
  return schedule;
}

module.exports = router;
