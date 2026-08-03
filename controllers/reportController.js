const reportService = require('../services/reportService');

const getBookingsReport = async (req, res) => {
    try {
        const result = await reportService.getBookingsReport();
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

module.exports = { getBookingsReport };