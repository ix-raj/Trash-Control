const express = require('express');
const router = express.Router();
const { createEvent, getEvents, joinEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', getEvents);
router.post('/', protect, admin, createEvent);
router.post('/:id/join', protect, joinEvent);
router.put('/:id', protect, admin, updateEvent);
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;
