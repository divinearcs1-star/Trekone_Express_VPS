const adminService = require('../services/adminService');

const getStats = async (req, res) => {
    try {
        const result = await adminService.getStats();
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
const getBookings = async (req, res) => {
    try {
        const result = await adminService.getBookings();
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
const getUsers = async (req, res) => {
    try {
        const result = await adminService.getUsers();
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
const getTreks = async (req, res) => {
    try {
        const result = await adminService.getTreks();
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
const getRefunds = async (req, res) => {
    try {
        const result = await adminService.getRefunds();
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
const approveRefund = async (req, res) => {
    try {
        const result = await adminService.approveRefund(req.body.bookingId);
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
const rejectRefund = async (req, res) => {
    try {
        const result = await adminService.rejectRefund(req.body.bookingId);
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
const addTrek = async (req, res) => {
    try {
        const result = await adminService.addTrek(req.body);
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
const getTrek = async (req, res) => {
    try {
        const result = await adminService.getTrek(req.params.id);
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
const updateTrek = async (req, res) => {
    try {
        const result = await adminService.updateTrek(req.params.id, req.body);
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
const deleteTrek = async (req, res) => {
    try {
        const result = await adminService.deleteTrek(req.params.id);
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
const getAllBookings = async (req, res) => {
    try {
        const result = await adminService.getAllBookings();
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
const makeAdmin = async (req, res) => {
    try {
        const result = await adminService.makeAdmin(req.params.id);
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
const getPayments = async (req, res) => {
    try {
        const result = await adminService.getPayments();
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
const blockUser = async (req, res) => {
    try {
        const result = await adminService.blockUser(req.params.id);
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
const unblockUser = async (req, res) => {
    try {
        const result = await adminService.unblockUser(req.params.id);
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
module.exports = {
    getStats,
    getBookings,
    getUsers,
    getTreks,
    getRefunds,
    approveRefund,
    rejectRefund,
    addTrek,
    getTrek,
    updateTrek,
    deleteTrek,
    getAllBookings,
    makeAdmin,
    getPayments,
    blockUser,
    unblockUser
};