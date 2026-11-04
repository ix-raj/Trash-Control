const express = require('express');
const router = express.Router();
const { getAdminReports, updateReportStatus, assignTeam } = require('../controllers/adminController');
const { getAnalytics } = require('../controllers/analyticsController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.put('/waste/:id/status', protect, admin, updateReportStatus);
router.put('/waste/:id/assign', protect, admin, assignTeam);
router.get('/analytics', protect, admin, getAnalytics);
router.get('/waste', protect, admin, getAdminReports);

module.exports = router;
