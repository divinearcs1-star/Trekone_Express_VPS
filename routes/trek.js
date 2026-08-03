require('dotenv').config();
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const trekController = require('../controllers/trekController');

router.get('/allTrek', trekController.getAllTrek);

router.get('/filterTrek', trekController.getFilterTrek);

router.get('/specialTrek', verifyToken, trekController.getSpecialTrek);

module.exports = router;