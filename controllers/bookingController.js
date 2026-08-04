const bookingService = require('../services/bookingService');

const createOrder = async (req, res) => {
    try {
        const result = await bookingService.createOrder(req.body);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        if (error.body) {
            return res.status(error.statusCode || 500).json(error.body);
        }
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const bookings = await bookingService.getMyBookings(req.user.email);
        res.json(bookings);
    } catch (error) {
        console.error(error);
        if (error.body) {
            return res.status(error.statusCode || 500).json(error.body);
        }
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

const cancelRefund = async (req, res) => {
    try {
        const result = await bookingService.cancelRefund(req.body.bookingId, req.user.email);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);

        if (error.body) {
            return res.status(error.statusCode || 500).json(error.body);
        }
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};
module.exports = { createOrder, getMyBookings, cancelRefund };