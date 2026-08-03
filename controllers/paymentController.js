const paymentService = require('../services/paymentService');

const verifyPayment = async (req, res) => {
    try {
        const result = await paymentService.verifyPayment(req.body);
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

const razorpayWebhook = async (req, res) => {
    try {
        const result = await paymentService.razorpayWebhook(req.body, req.headers);
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
module.exports = { verifyPayment, razorpayWebhook };