require('dotenv').config();
const express = require('express');
const router = express.Router();   // Create route handler
const paymentController = require('../controllers/paymentController');

router.post('/verifypayment', paymentController.verifyPayment);

router.post('/razorpay/webhook', paymentController.razorpayWebhook);

module.exports = router;