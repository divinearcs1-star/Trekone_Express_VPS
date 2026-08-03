const trekService = require('../services/trekService');

const getAllTrek = async (req, res) => {
    try {
        const result = await trekService.getAllTrek();

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
const getFilterTrek = async (req, res) => {
    try {
        const result = await trekService.getFilterTrek();
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
const getSpecialTrek = async (req, res) => {
    try {
        const result = await trekService.getSpecialTrek();
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

module.exports = { getAllTrek, getFilterTrek, getSpecialTrek };