const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const verifyAdmin = require('../middlewares/adminAuth');
const reportController = require('../controllers/reportController');

router.get('/bookings-report', verifyToken, verifyAdmin, reportController.getBookingsReport );

module.exports = router;