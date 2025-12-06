const express = require('express');
const Holding = require('../models/Holding');
const Account = require('../models/Account');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Goal = require('../models/Goal');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');

const router = express.Router();

// Get financial assistant insights (rule-based, no AI)
router.get('/assistant', auth, async (req, res) => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Fetch all relevant data
    const [
      holdings,
      accounts,
      thisMonthIncomes,
      lastMonthIncomes,
      thisMonthExpenses,
      lastMonthExpenses,
      goals,
      subscriptions
    ] = await Promise.all([
      Holding.find({ userId: req.userId }),
      Account.find({ userId: req.userId }),
      Income.find({ userId: req.userId, date: { $gte: thisMonth } }),
      Income.find({ userId: req.userId, date: { $gte: lastMonth, $lt: thisMonth } }),
      Expense.find({ userId: req.userId, date: { $gte: thisMonth } }),
      Expense.find({ userId: req.userId, date: { $gte: lastMonth, $lt: thisMonth } }),
      Goal.find({ userId: req.userId, isCompleted: false }),
      Subscription.find({ userId: req.userId, isActive: true })
    ]);
    
    const insights = [];
    
    // ===== SPENDING INSIGHTS =====
    const thisMonthTotal = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((s, e) => s + e.amount, 0);
    
    if (lastMonthTotal > 0) {
      const spendingChange = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
      if (spendingChange > 10) {
        insights.push({
          type: 'SPENDING_INCREASE',
          severity: 'warning',
          message: `Vous avez dépensé ${spendingChange.toFixed(0)}% de plus que le mois dernier.`,
          value: spendingChange
        });
      } else if (spendingChange < -10) {
        insights.push({
          type: 'SPENDING_DECREASE',
          severity: 'positive',
          message: `Bravo ! Vous avez réduit vos dépenses de ${Math.abs(spendingChange).toFixed(0)}% ce mois.`,
          value: spendingChange
        });
      }
    }
    
    // ===== CASHFLOW INSIGHT =====
    const thisMonthIncome = thisMonthIncomes.reduce((s, i) => s + i.amount, 0);
    const cashflow = thisMonthIncome - thisMonthTotal;
    
    insights.push({
      type: 'CASHFLOW',
      severity: cashflow >= 0 ? 'positive' : 'negative',
      message: cashflow >= 0 
        ? `Votre cashflow est positif de +${cashflow.toFixed(0)} € ce mois.`
        : `Attention, cashflow négatif de ${cashflow.toFixed(0)} € ce mois.`,
      value: cashflow
    });
    
    // ===== PORTFOLIO CONCENTRATION =====
    const totalPortfolioValue = holdings.reduce((s, h) => s + (h.quantity * h.currentPrice), 0);
    if (totalPortfolioValue > 0) {
      const holdingsByValue = holdings
        .map(h => ({ ...h.toObject(), value: h.quantity * h.currentPrice }))
        .sort((a, b) => b.value - a.value);
      
      const topHolding = holdingsByValue[0];
      if (topHolding) {
        const concentration = (topHolding.value / totalPortfolioValue) * 100;
        if (concentration > 30) {
          insights.push({
            type: 'CONCENTRATION',
            severity: 'warning',
            message: `${topHolding.name} représente ${concentration.toFixed(0)}% de votre portefeuille. Pensez à diversifier.`,
            value: concentration
          });
        }
      }
      
      // Sector concentration (simplified)
      const bySector = {};
      holdings.forEach(h => {
        const sector = h.sector || 'Autre';
        if (!bySector[sector]) bySector[sector] = 0;
        bySector[sector] += h.quantity * h.currentPrice;
      });
      
      Object.entries(bySector).forEach(([sector, value]) => {
        const pct = (value / totalPortfolioValue) * 100;
        if (pct > 50 && sector !== 'Autre') {
          insights.push({
            type: 'SECTOR_CONCENTRATION',
            severity: 'info',
            message: `Votre allocation est concentrée en ${sector} (${pct.toFixed(0)}%). Diversifiez avec d'autres secteurs.`,
            value: pct
          });
        }
      });
    }
    
    // ===== UNUSED SUBSCRIPTIONS =====
    const twoMonthsAgo = new Date(now.setMonth(now.getMonth() - 2));
    subscriptions.forEach(sub => {
      if (sub.lastUsedDate && sub.lastUsedDate < twoMonthsAgo) {
        insights.push({
          type: 'UNUSED_SUBSCRIPTION',
          severity: 'suggestion',
          message: `Vous pourriez supprimer l'abonnement ${sub.name}, non utilisé depuis 2 mois. Économie: ${sub.monthlyEquivalent.toFixed(2)} €/mois.`,
          value: sub.monthlyEquivalent
        });
      }
    });
    
    // ===== CATEGORY SPENDING =====
    const byCategory = {};
    thisMonthExpenses.forEach(e => {
      if (!byCategory[e.category]) byCategory[e.category] = 0;
      byCategory[e.category] += e.amount;
    });
    
    const topCategories = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    topCategories.forEach(([cat, amount]) => {
      const pct = (amount / thisMonthTotal) * 100;
      if (pct > 30 && cat !== 'HOUSING') {
        insights.push({
          type: 'HIGH_CATEGORY_SPENDING',
          severity: 'info',
          message: `Réduire les dépenses ${cat} (${pct.toFixed(0)}% du budget) pourrait améliorer votre cashflow.`,
          value: amount
        });
      }
    });
    
    // ===== GOAL SUGGESTIONS =====
    goals.forEach(goal => {
      const remaining = goal.targetAmount - goal.currentAmount;
      if (remaining > 0 && goal.monthlyContribution > 0) {
        const monthsNeeded = Math.ceil(remaining / goal.monthlyContribution);
        const improvedMonths = Math.ceil(remaining / (goal.monthlyContribution + 50));
        
        if (monthsNeeded - improvedMonths >= 2) {
          insights.push({
            type: 'GOAL_ACCELERATION',
            severity: 'suggestion',
            message: `Mettre 50 €/mois de plus permettrait d'atteindre l'objectif "${goal.name}" ${monthsNeeded - improvedMonths} mois plus tôt.`,
            value: monthsNeeded - improvedMonths
          });
        }
      }
    });
    
    // ===== SAVINGS RATE =====
    if (thisMonthIncome > 0) {
      const savingsRate = (cashflow / thisMonthIncome) * 100;
      if (savingsRate < 10) {
        insights.push({
          type: 'LOW_SAVINGS_RATE',
          severity: 'warning',
          message: `Votre taux d'épargne est de ${savingsRate.toFixed(0)}%. L'idéal serait d'atteindre au moins 20%.`,
          value: savingsRate
        });
      } else if (savingsRate > 30) {
        insights.push({
          type: 'HIGH_SAVINGS_RATE',
          severity: 'positive',
          message: `Excellent ! Votre taux d'épargne de ${savingsRate.toFixed(0)}% est très bon.`,
          value: savingsRate
        });
      }
    }
    
    res.json({
      insights: insights.sort((a, b) => {
        const severityOrder = { negative: 0, warning: 1, info: 2, suggestion: 3, positive: 4 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
      summary: {
        thisMonthIncome,
        thisMonthExpenses: thisMonthTotal,
        cashflow,
        portfolioValue: totalPortfolioValue,
        activeGoals: goals.length,
        activeSubscriptions: subscriptions.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get portfolio analysis
router.get('/portfolio', auth, async (req, res) => {
  try {
    const holdings = await Holding.find({ userId: req.userId }).populate('accountId', 'type');
    
    const totalValue = holdings.reduce((s, h) => s + (h.quantity * h.currentPrice), 0);
    const totalInvested = holdings.reduce((s, h) => s + (h.quantity * h.buyPrice), 0);
    const totalPnl = totalValue - totalInvested;
    
    // Allocation by asset type
    const byAssetType = {};
    const bySector = {};
    const byGeography = {};
    const byCurrency = {};
    
    holdings.forEach(h => {
      const value = h.quantity * h.currentPrice;
      
      byAssetType[h.assetType] = (byAssetType[h.assetType] || 0) + value;
      bySector[h.sector || 'Autre'] = (bySector[h.sector || 'Autre'] || 0) + value;
      byGeography[h.geography || 'Autre'] = (byGeography[h.geography || 'Autre'] || 0) + value;
      byCurrency[h.currency] = (byCurrency[h.currency] || 0) + value;
    });
    
    // Calculate percentages
    const toPercentage = (obj) => Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, totalValue > 0 ? (v / totalValue) * 100 : 0])
    );
    
    // Top holdings
    const topHoldings = holdings
      .map(h => ({
        name: h.name,
        symbol: h.symbol,
        value: h.quantity * h.currentPrice,
        pnl: (h.currentPrice - h.buyPrice) * h.quantity,
        pnlPercent: h.buyPrice > 0 ? ((h.currentPrice - h.buyPrice) / h.buyPrice) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    
    // Top gainers/losers
    const byPnl = holdings
      .map(h => ({
        name: h.name,
        symbol: h.symbol,
        pnl: (h.currentPrice - h.buyPrice) * h.quantity,
        pnlPercent: h.buyPrice > 0 ? ((h.currentPrice - h.buyPrice) / h.buyPrice) * 100 : 0
      }))
      .sort((a, b) => b.pnlPercent - a.pnlPercent);
    
    res.json({
      summary: {
        totalValue,
        totalInvested,
        totalPnl,
        pnlPercent: totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0,
        holdingsCount: holdings.length
      },
      allocation: {
        byAssetType: toPercentage(byAssetType),
        bySector: toPercentage(bySector),
        byGeography: toPercentage(byGeography),
        byCurrency: toPercentage(byCurrency)
      },
      topHoldings,
      topGainers: byPnl.slice(0, 5),
      topLosers: byPnl.slice(-5).reverse()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get patrimony summary
router.get('/patrimony', auth, async (req, res) => {
  try {
    const [holdings, accounts, loans] = await Promise.all([
      Holding.find({ userId: req.userId }),
      Account.find({ userId: req.userId }),
      require('../models/Loan').find({ userId: req.userId })
    ]);
    
    const portfolioValue = holdings.reduce((s, h) => s + (h.quantity * h.currentPrice), 0);
    const accountsValue = accounts.reduce((s, a) => s + (a.balance || 0), 0);
    const totalAssets = portfolioValue + accountsValue;
    const totalLiabilities = loans.reduce((s, l) => s + l.remainingPrincipal, 0);
    const netWorth = totalAssets - totalLiabilities;
    
    // Breakdown by account type
    const breakdown = {};
    accounts.forEach(a => {
      if (!breakdown[a.type]) breakdown[a.type] = 0;
      breakdown[a.type] += a.balance || 0;
    });
    breakdown['PORTFOLIO'] = portfolioValue;
    
    res.json({
      totalAssets,
      totalLiabilities,
      netWorth,
      breakdown,
      investedVsCash: {
        invested: portfolioValue,
        cash: accountsValue,
        ratio: accountsValue > 0 ? (portfolioValue / accountsValue) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
