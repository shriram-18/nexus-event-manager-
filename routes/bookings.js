const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All booking routes require authentication
router.use(protect);

// Public User Endpoints
router.post('/', bookingController.createBooking);
router.get('/user', bookingController.getUserBookings);

// Admin Only
router.get('/all', authorize('admin'), bookingController.getAllBookings);

module.exports = router;
