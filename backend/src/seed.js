require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Account = require('./models/Account');
const Holding = require('./models/Holding');
const Income = require('./models/Income');
const Expense = require('./models/Expense');
const Loan = require('./models/Loan');
const Goal = require('./models/Goal');
const Subscription = require('./models/Subscription');
const WatchlistItem = require('./models/WatchlistItem');
const CalendarEvent = require('./models/CalendarEvent');
const CompanyProfile = require('./models/CompanyProfile');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Account.deleteMany({}),
      Holding.deleteMany({}),
      Income.deleteMany({}),
      Expense.deleteMany({}),
      Loan.deleteMany({}),
      Goal.deleteMany({}),
      Subscription.deleteMany({}),
      WatchlistItem.deleteMany({}),
      CalendarEvent.deleteMany({}),
      CompanyProfile.deleteMany({})
    ]);

    // Create demo user
    const user = new User({
      email: 'demo@patripro.fr',
      password: 'demo123456',
      name: 'Utilisateur Démo'
    });
    await user.save();
    const userId = user._id;

    console.log('Created demo user');

    // Create accounts
    const currentAccount = await Account.create({
      userId,
      name: 'Compte courant Boursorama',
      type: 'CURRENT',
      balance: 500,
      institution: 'Boursorama'
    });

    const livretA = await Account.create({
      userId,
      name: 'Livret A',
      type: 'LIVRET_A',
      balance: 2322,
      interestRate: 3,
      ceiling: 22950,
      institution: 'Boursorama'
    });

    const livretJeune = await Account.create({
      userId,
      name: 'Livret Jeune',
      type: 'LIVRET_JEUNE',
      balance: 1662,
      interestRate: 4,
      ceiling: 1600,
      institution: 'Boursorama'
    });

    const peaAccount = await Account.create({
      userId,
      name: 'PEA Boursorama',
      type: 'PEA',
      balance: 0,
      institution: 'Boursorama'
    });

    const ctoAccount = await Account.create({
      userId,
      name: 'CTO Trade Republic',
      type: 'CTO',
      balance: 0,
      institution: 'Trade Republic'
    });

    const cryptoWallet = await Account.create({
      userId,
      name: 'Wallet Crypto',
      type: 'CRYPTO_WALLET',
      balance: 0
    });

    console.log('Created accounts');

    // Create PEA holdings
    await Holding.create([
      {
        userId,
        accountId: peaAccount._id,
        name: 'Amundi MSCI World PEA UCITS ETF Acc',
        symbol: 'AM.PEA MS.WLD',
        isin: 'FR001400U5Q4',
        assetType: 'ETF',
        quantity: 703,
        buyPrice: 5.39,
        currentPrice: 5.39,
        ter: 0.38,
        sector: 'World',
        geography: 'Global'
      },
      {
        userId,
        accountId: peaAccount._id,
        name: 'Amundi MSCI EM ESG UCITS ETF',
        symbol: 'PEAEM',
        isin: 'FR0013412020',
        assetType: 'ETF',
        quantity: 42,
        buyPrice: 28.27,
        currentPrice: 28.27,
        ter: 0.20,
        sector: 'Emerging Markets',
        geography: 'Emerging'
      },
      {
        userId,
        accountId: peaAccount._id,
        name: 'Amundi MSCI EMU UCITS ETF',
        symbol: 'AM.EMUMSC',
        isin: 'FR0010655696',
        assetType: 'ETF',
        quantity: 63,
        buyPrice: 16.64,
        currentPrice: 16.64,
        ter: 0.12,
        sector: 'Europe',
        geography: 'Europe'
      },
      {
        userId,
        accountId: peaAccount._id,
        name: 'S&P 500 Swap PEA UCITS ETF',
        symbol: 'SP500PEA',
        isin: 'FR0011871128',
        assetType: 'ETF',
        quantity: 139,
        buyPrice: 5.67,
        currentPrice: 5.67,
        ter: 0.15,
        sector: 'US',
        geography: 'North America'
      }
    ]);

    // Create CTO holdings
    await Holding.create([
      {
        userId,
        accountId: ctoAccount._id,
        name: 'NVIDIA',
        symbol: 'NVDA',
        isin: 'US67066G1040',
        assetType: 'STOCK',
        quantity: 1.195,
        buyPrice: 155.67,
        currentPrice: 155.67,
        ter: 0,
        sector: 'Technology',
        geography: 'North America'
      },
      {
        userId,
        accountId: ctoAccount._id,
        name: 'Apple',
        symbol: 'AAPL',
        isin: 'US0378331005',
        assetType: 'STOCK',
        quantity: 0.508,
        buyPrice: 246.22,
        currentPrice: 246.22,
        ter: 0,
        sector: 'Technology',
        geography: 'North America'
      },
      {
        userId,
        accountId: ctoAccount._id,
        name: 'Physical Gold (USD)',
        symbol: 'XAUUSD',
        isin: 'IE00B4ND3602',
        assetType: 'FUND',
        quantity: 1.006,
        buyPrice: 695.55,
        currentPrice: 695.55,
        ter: 0.40,
        sector: 'Commodities',
        geography: 'Global'
      },
      {
        userId,
        accountId: ctoAccount._id,
        name: 'Amazon',
        symbol: 'AMZN',
        isin: 'US0231351067',
        assetType: 'STOCK',
        quantity: 0.278,
        buyPrice: 204.72,
        currentPrice: 204.72,
        ter: 0,
        sector: 'Technology',
        geography: 'North America'
      }
    ]);

    // Create Crypto holdings
    await Holding.create([
      {
        userId,
        accountId: cryptoWallet._id,
        name: 'Bitcoin',
        symbol: 'BTC',
        assetType: 'CRYPTO',
        quantity: 0.0249,
        buyPrice: 78315.64,
        currentPrice: 78315.64,
        ter: 0
      },
      {
        userId,
        accountId: cryptoWallet._id,
        name: 'Ethereum',
        symbol: 'ETH',
        assetType: 'CRYPTO',
        quantity: 0.0419,
        buyPrice: 2624.04,
        currentPrice: 2624.04,
        ter: 0
      }
    ]);

    console.log('Created holdings');

    // Create incomes
    await Income.create([
      { userId, label: 'Salaire', amount: 1300, category: 'SALARY', frequency: 'MONTHLY', date: new Date(), isRecurring: true },
      { userId, label: 'CAF', amount: 300, category: 'CAF', frequency: 'MONTHLY', date: new Date(), isRecurring: true },
      { userId, label: 'Prime', amount: 170, category: 'BONUS', frequency: 'MONTHLY', date: new Date(), isRecurring: true }
    ]);

    // Create expenses
    await Expense.create([
      { userId, label: 'Loyer', amount: 505, category: 'HOUSING', frequency: 'MONTHLY', date: new Date(), isRecurring: true },
      { userId, label: 'Assurance habitation', amount: 15, category: 'INSURANCE', frequency: 'MONTHLY', date: new Date(), isRecurring: true },
      { userId, label: 'Courses', amount: 250, category: 'FOOD', frequency: 'MONTHLY', date: new Date(), isRecurring: true },
      { userId, label: 'Spotify', amount: 7.07, category: 'SUBSCRIPTIONS', frequency: 'MONTHLY', date: new Date(), isRecurring: true },
      { userId, label: 'ChatGPT Plus', amount: 20, category: 'SUBSCRIPTIONS', frequency: 'MONTHLY', date: new Date(), isRecurring: true },
      { userId, label: 'Box + Tel', amount: 50, category: 'UTILITIES', frequency: 'MONTHLY', date: new Date(), isRecurring: true },
      { userId, label: 'Élec & eau & gaz', amount: 163.50, category: 'UTILITIES', frequency: 'MONTHLY', date: new Date(), isRecurring: true },
      { userId, label: 'Frais bancaires', amount: 10, category: 'BANK_FEES', frequency: 'MONTHLY', date: new Date(), isRecurring: true },
      { userId, label: 'UberEats', amount: 60, category: 'RESTAURANTS', frequency: 'MONTHLY', date: new Date(), isRecurring: true },
      { userId, label: 'Sorties', amount: 50, category: 'LEISURE', frequency: 'MONTHLY', date: new Date(), isRecurring: true }
    ]);

    console.log('Created incomes and expenses');

    // Create a loan
    await Loan.create({
      userId,
      name: 'Prêt étudiant',
      type: 'STUDENT',
      principal: 10000,
      annualRate: 1.5,
      termMonths: 60,
      startDate: new Date('2023-01-01'),
      monthlyPayment: 172.06,
      remainingPrincipal: 6882,
      remainingMonths: 40
    });

    console.log('Created loan');

    // Create goals
    await Goal.create([
      {
        userId,
        name: 'Fonds d\'urgence',
        type: 'EMERGENCY_FUND',
        targetAmount: 5000,
        currentAmount: 2322,
        monthlyContribution: 200,
        priority: 'HIGH',
        color: '#EF4444'
      },
      {
        userId,
        name: 'Voyage Japon',
        type: 'TRAVEL',
        targetAmount: 3000,
        currentAmount: 500,
        targetDate: new Date('2025-06-01'),
        monthlyContribution: 150,
        priority: 'MEDIUM',
        color: '#3B82F6'
      }
    ]);

    console.log('Created goals');

    // Create subscriptions
    await Subscription.create([
      { userId, name: 'Spotify', type: 'PERSONAL', amount: 7.07, billingPeriod: 'MONTHLY', category: 'MUSIC', nextBillingDate: new Date(), isActive: true },
      { userId, name: 'Netflix', type: 'PERSONAL', amount: 13.49, billingPeriod: 'MONTHLY', category: 'STREAMING', nextBillingDate: new Date(), isActive: true },
      { userId, name: 'ChatGPT Plus', type: 'BUSINESS', amount: 20, billingPeriod: 'MONTHLY', category: 'SAAS', nextBillingDate: new Date(), isActive: true },
      { userId, name: 'GitHub Pro', type: 'BUSINESS', amount: 4, billingPeriod: 'MONTHLY', category: 'DEV_TOOLS', nextBillingDate: new Date(), isActive: true },
      { userId, name: 'Vercel Pro', type: 'BUSINESS', amount: 20, billingPeriod: 'MONTHLY', category: 'HOSTING', nextBillingDate: new Date(), isActive: true }
    ]);

    console.log('Created subscriptions');

    // Create watchlist
    await WatchlistItem.create([
      { userId, symbol: 'TSLA', name: 'Tesla', assetType: 'STOCK', currentPrice: 248.50, change24h: 2.3 },
      { userId, symbol: 'MSFT', name: 'Microsoft', assetType: 'STOCK', currentPrice: 378.90, change24h: 0.8 },
      { userId, symbol: 'SOL', name: 'Solana', assetType: 'CRYPTO', currentPrice: 142.30, change24h: -1.2 }
    ]);

    console.log('Created watchlist');

    // Create calendar events
    await CalendarEvent.create([
      { userId, title: 'Salaire', type: 'INCOME', amount: 1300, date: new Date(), isRecurring: true, recurrence: { frequency: 'MONTHLY', dayOfMonth: 28 } },
      { userId, title: 'Loyer', type: 'BILL', amount: 505, date: new Date(), isRecurring: true, recurrence: { frequency: 'MONTHLY', dayOfMonth: 1 } },
      { userId, title: 'Spotify', type: 'SUBSCRIPTION', amount: 7.07, date: new Date(), isRecurring: true, recurrence: { frequency: 'MONTHLY', dayOfMonth: 5 } }
    ]);

    console.log('Created calendar events');

    // Create company profile (micro-entrepreneur dev)
    await CompanyProfile.create({
      userId,
      name: 'Micro-entreprise Bastien - Développement web',
      legalStatus: 'MICRO_ENTREPRISE',
      activityType: 'BNC_SERVICE',
      siret: '00000000000000',
      address: {
        street: 'Adresse de démo',
        city: 'Reims',
        postalCode: '51100',
        country: 'France'
      },
      creationDate: new Date('2023-01-01'),
      usesVersementLiberatoire: true,
      rates: {
        socialRate: 24.6,
        incomeTaxRate: 2.2,
        trainingContributionRate: 0.2,
        cfeRate: 0
      }
    });

    console.log('Created company profile');

    console.log('\n✅ Seed completed successfully!');
    console.log('Demo credentials:');
    console.log('  Email: demo@patripro.fr');
    console.log('  Password: demo123456');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
