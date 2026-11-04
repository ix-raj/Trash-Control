const express = require('express');
const router = express.Router();
const { getAnalytics, exportReportsCSV } = require('../controllers/analyticsController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', protect, admin, getAnalytics);
router.get('/csv', protect, admin, exportReportsCSV);

module.exports = router;
