const express = require('express');
const router = express.Router();
const { getEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', protect, authorize('admin', 'organizer'), createEvent);
router.patch('/:id', protect, authorize('admin', 'organizer'), updateEvent);
router.delete('/:id', protect, authorize('admin', 'organizer'), deleteEvent);

module.exports = router;
