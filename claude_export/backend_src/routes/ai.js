const express = require('express');
const router = express.Router();
const { generateDescription } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate-description', protect, generateDescription);

module.exports = router;
