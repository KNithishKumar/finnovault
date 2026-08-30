const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  downloadReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/download', downloadReport);

module.exports = router;
