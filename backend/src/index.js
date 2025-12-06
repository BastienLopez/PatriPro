require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const holdingRoutes = require('./routes/holdings');
const incomeRoutes = require('./routes/incomes');
const expenseRoutes = require('./routes/expenses');
const loanRoutes = require('./routes/loans');
const goalRoutes = require('./routes/goals');
const watchlistRoutes = require('./routes/watchlist');
const realEstateRoutes = require('./routes/realEstate');
const strategyRoutes = require('./routes/strategies');
const subscriptionRoutes = require('./routes/subscriptions');
const calendarRoutes = require('./routes/calendar');
const businessRoutes = require('./routes/business');
const taxRoutes = require('./routes/tax');
const insightsRoutes = require('./routes/insights');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/holdings', holdingRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/real-estate', realEstateRoutes);
app.use('/api/strategies', strategyRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/insights', insightsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
