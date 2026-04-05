const express = require('express');
const router = express.Router();
const { bookTicket, getMyTickets, cancelTicket } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, bookTicket);
router.get('/my-tickets', protect, getMyTickets);
router.delete('/:id', protect, cancelTicket);

module.exports = router;
