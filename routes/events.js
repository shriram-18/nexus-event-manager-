const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public Data Endpoints
router.get('/', eventController.getEvents);
// Put custom routes BEFORE /:id to prevent matching them as ID
router.get('/running', eventController.getRunningEvents);
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/manage', protect, authorize('admin', 'organizer'), eventController.getManagedEvents);
router.get('/:id', eventController.getEventById);

// Protected Organizer/Admin creation
router.post('/', protect, authorize('admin', 'organizer'), eventController.createEvent);

// Admin / Organizer endpoints
router.patch('/:id', protect, eventController.updateEvent);
router.delete('/:id', protect, eventController.deleteEvent);

// Admin Strict Endpoints
router.patch('/:id/approve', protect, authorize('admin'), eventController.approveEvent);
router.patch('/:id/reject', protect, authorize('admin'), eventController.rejectEvent);

module.exports = router;
