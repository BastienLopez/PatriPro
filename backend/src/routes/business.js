const express = require('express');
const CompanyProfile = require('../models/CompanyProfile');
const Quote = require('../models/Quote');
const Invoice = require('../models/Invoice');
const auth = require('../middleware/auth');

const router = express.Router();

// ============= COMPANY PROFILE =============

// Get company profile
router.get('/profile', auth, async (req, res) => {
  try {
    let profile = await CompanyProfile.findOne({ userId: req.userId });
    if (!profile) {
      // Create default profile
      profile = new CompanyProfile({
        userId: req.userId,
        name: 'Mon entreprise',
        legalStatus: 'MICRO_ENTREPRISE',
        activityType: 'BNC_SERVICE'
      });
      await profile.save();
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update company profile
router.patch('/profile', auth, async (req, res) => {
  try {
    const profile = await CompanyProfile.findOneAndUpdate(
      { userId: req.userId },
      req.body,
      { new: true, runValidators: true, upsert: true }
    );
    res.json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Calculate charges from turnover
router.post('/simulate-charges', auth, async (req, res) => {
  try {
    const { turnover } = req.body;
    const profile = await CompanyProfile.findOne({ userId: req.userId });
    
    if (!profile) {
      return res.status(404).json({ error: 'Company profile not found' });
    }
    
    const { rates, usesVersementLiberatoire } = profile;
    
    const socialContributions = turnover * (rates.socialRate / 100);
    const incomeTax = usesVersementLiberatoire ? turnover * (rates.incomeTaxRate / 100) : 0;
    const trainingContribution = turnover * (rates.trainingContributionRate / 100);
    const cfe = turnover * (rates.cfeRate / 100);
    
    const totalCharges = socialContributions + incomeTax + trainingContribution + cfe;
    const netIncome = turnover - totalCharges;
    
    res.json({
      turnover,
      breakdown: {
        socialContributions,
        incomeTax,
        trainingContribution,
        cfe
      },
      totalCharges,
      netIncome,
      effectiveRate: (totalCharges / turnover) * 100
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============= QUOTES =============

// Get all quotes
router.get('/quotes', auth, async (req, res) => {
  try {
    const quotes = await Quote.find({ userId: req.userId }).sort({ issueDate: -1 });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create quote
router.post('/quotes', auth, async (req, res) => {
  try {
    // Generate quote number
    const year = new Date().getFullYear();
    const count = await Quote.countDocuments({ 
      userId: req.userId,
      number: new RegExp(`^DV-${year}`)
    });
    const number = `DV-${year}-${String(count + 1).padStart(3, '0')}`;
    
    const quote = new Quote({
      ...req.body,
      userId: req.userId,
      number
    });
    await quote.save();
    res.status(201).json(quote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update quote
router.patch('/quotes/:id', auth, async (req, res) => {
  try {
    const quote = await Quote.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    res.json(quote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete quote
router.delete('/quotes/:id', auth, async (req, res) => {
  try {
    const quote = await Quote.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    res.json({ message: 'Quote deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Convert quote to invoice
router.post('/quotes/:id/convert', auth, async (req, res) => {
  try {
    const quote = await Quote.findOne({ _id: req.params.id, userId: req.userId });
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    // Generate invoice number
    const year = new Date().getFullYear();
    const count = await Invoice.countDocuments({ 
      userId: req.userId,
      number: new RegExp(`^FA-${year}`)
    });
    const number = `FA-${year}-${String(count + 1).padStart(3, '0')}`;
    
    const invoice = new Invoice({
      userId: req.userId,
      number,
      quoteId: quote._id,
      client: quote.client,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      lines: quote.lines,
      subtotal: quote.subtotal,
      taxAmount: quote.taxAmount,
      total: quote.total,
      notes: quote.notes
    });
    
    await invoice.save();
    
    // Update quote
    quote.status = 'ACCEPTED';
    quote.convertedToInvoiceId = invoice._id;
    await quote.save();
    
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============= INVOICES =============

// Get all invoices
router.get('/invoices', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { userId: req.userId };
    if (status) query.status = status;
    
    const invoices = await Invoice.find(query).sort({ issueDate: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create invoice
router.post('/invoices', auth, async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const count = await Invoice.countDocuments({ 
      userId: req.userId,
      number: new RegExp(`^FA-${year}`)
    });
    const number = `FA-${year}-${String(count + 1).padStart(3, '0')}`;
    
    const invoice = new Invoice({
      ...req.body,
      userId: req.userId,
      number
    });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update invoice
router.patch('/invoices/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete invoice
router.delete('/invoices/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark invoice as paid
router.post('/invoices/:id/pay', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { 
        status: 'PAID', 
        paymentDate: req.body.paymentDate || new Date(),
        paymentMethod: req.body.paymentMethod
      },
      { new: true }
    );
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get business analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();
    
    const invoices = await Invoice.find({
      userId: req.userId,
      status: 'PAID',
      paymentDate: {
        $gte: new Date(currentYear, 0, 1),
        $lte: new Date(currentYear, 11, 31)
      }
    });
    
    // Monthly revenue
    const monthlyRevenue = Array(12).fill(0);
    const clientRevenue = {};
    
    invoices.forEach(inv => {
      const month = new Date(inv.paymentDate).getMonth();
      monthlyRevenue[month] += inv.total;
      
      const clientKey = inv.client.name || 'Unknown';
      if (!clientRevenue[clientKey]) clientRevenue[clientKey] = 0;
      clientRevenue[clientKey] += inv.total;
    });
    
    const totalRevenue = monthlyRevenue.reduce((a, b) => a + b, 0);
    
    // Get profile for charge calculation
    const profile = await CompanyProfile.findOne({ userId: req.userId });
    let estimatedCharges = 0;
    if (profile) {
      estimatedCharges = totalRevenue * (
        (profile.rates.socialRate + 
         (profile.usesVersementLiberatoire ? profile.rates.incomeTaxRate : 0) + 
         profile.rates.trainingContributionRate) / 100
      );
    }
    
    res.json({
      totalRevenue,
      estimatedCharges,
      estimatedProfit: totalRevenue - estimatedCharges,
      monthlyRevenue,
      topClients: Object.entries(clientRevenue)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, revenue]) => ({ name, revenue })),
      invoiceCount: invoices.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
