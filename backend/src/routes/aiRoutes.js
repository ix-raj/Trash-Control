const express = require('express');
const { optimizeRoute, predictWaste, classifyWaste, findHotspots } = require('../controllers/aiController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/route-optimize', protect, admin, optimizeRoute);
router.post('/predict', protect, admin, predictWaste);
router.post('/classify', protect, admin, classifyWaste);
router.post('/hotspots', protect, admin, findHotspots);

module.exports = router;
