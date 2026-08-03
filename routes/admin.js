require('dotenv').config();
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const verifyAdmin = require('../middlewares/adminAuth');
const adminController = require('../controllers/adminController');

router.get('/stats', verifyToken, verifyAdmin, adminController.getStats);

router.get('/bookings', verifyToken, verifyAdmin, adminController.getBookings);

router.get('/users', verifyToken, verifyAdmin, adminController.getUsers);

router.get('/treks', verifyToken, verifyAdmin, adminController.getTreks);

router.get('/refunds', verifyToken, verifyAdmin, adminController.getRefunds);

router.post('/approve-refund', verifyToken, verifyAdmin, adminController.approveRefund);

router.post('/reject-refund', verifyToken, verifyAdmin, adminController.rejectRefund);

router.post('/add-trek', verifyToken, verifyAdmin, adminController.addTrek);

router.get('/trek/:id', verifyToken, verifyAdmin, adminController.getTrek);

router.put('/update-trek/:id', verifyToken, verifyAdmin, adminController.updateTrek);

router.delete('/delete-trek/:id', verifyToken, verifyAdmin, adminController.deleteTrek);

router.get('/allBookings', verifyToken, verifyAdmin, adminController.getAllBookings);

router.put('/make-admin/:id', verifyToken, verifyAdmin, adminController.makeAdmin);

router.get('/payments', verifyToken, verifyAdmin, adminController.getPayments);

router.put('/block-user/:id', verifyToken, verifyAdmin, adminController.blockUser);

router.put('/unblock-user/:id', verifyToken, verifyAdmin, adminController.unblockUser);

module.exports = router;