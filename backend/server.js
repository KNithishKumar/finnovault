const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');
const { initCronJobs } = require('./services/cronJobs');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Allows image attachments to load in browser
  })
);

// Enable CORS
app.use(
  cors({
    origin: '*', // For testing/simplicity, allow all origins
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  })
);

// Apply API Rate Limiter
app.use('/api', apiLimiter);

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/accounts', require('./routes/accountRoutes'));
app.use('/api/v1/transactions', require('./routes/transactionRoutes'));
app.use('/api/v1/budgets', require('./routes/budgetRoutes'));
app.use('/api/v1/goals', require('./routes/goalRoutes'));
app.use('/api/v1/loans', require('./routes/loanRoutes'));
app.use('/api/v1/debt', require('./routes/borrowLendRoutes'));
app.use('/api/v1/assets', require('./routes/assetRoutes'));
app.use('/api/v1/investments', require('./routes/investmentRoutes'));
app.use('/api/v1/reports', require('./routes/reportRoutes'));
app.use('/api/v1/notifications', require('./routes/notificationRoutes'));

// Root endpoint sanity check
app.get('/', (req, res) => {
  res.send('FinVault API Service is Running...');
});

// Init scheduler jobs
initCronJobs();

// Error handler middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = server;
