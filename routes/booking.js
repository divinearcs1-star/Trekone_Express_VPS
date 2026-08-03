require('dotenv').config();
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const bookingController = require('../controllers/bookingController');

router.post('/create-Order', bookingController.createOrder);

router.get('/mybookings', verifyToken, bookingController.getMyBookings );

router.post('/cancel-refund', verifyToken, bookingController.cancelRefund);

module.exports = router;

