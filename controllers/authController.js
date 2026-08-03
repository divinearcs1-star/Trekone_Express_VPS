const authService = require('../services/authService');

const login = async (req, res) => {
    try {
        const result = await authService.login(req.body);
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
const register = async (req, res) => {
    try {
        const result = await authService.register(req.body);
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
const refreshToken = async (req, res) => {
    try {
        const result = await authService.refreshToken(req.body.refreshToken);
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
const logout = async (req, res) => {
    try {
        const result = await authService.logout(req.body.refreshToken);
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
const forgotPassword = async (req, res) => {
    try {
        const result = await authService.forgotPassword(req.body.email);
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
const resetPassword = async (req, res) => {
    try {
        const result = await authService.resetPassword(req.body);
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
module.exports = {login,register,refreshToken,logout,forgotPassword,resetPassword };