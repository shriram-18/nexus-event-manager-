const express = require('express');
const router = express.Router();
const { getStats, getUsers, updateEventStatus } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/events/:id/status', updateEventStatus);

module.exports = router;
