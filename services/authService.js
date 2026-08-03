require('dotenv').config();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendMail } = require('./emailService');
const jwt = require('jsonwebtoken');

const login = async (userData) => {
    try {
        if (userData.email && userData.password) {
            console.log("entered in login method");
            const data = await User.findOne({ email: userData.email });
            if (data) {
                if (data.status === 'blocked') {
                    throw {
                        statusCode: 403,
                        body: {
                            success: false,
                            message: 'Your account has been blocked'
                        }
                    };
                }
                const isMatch = await bcrypt.compare(userData.password, data.password);
                if (isMatch) {
                    console.log("Login Success");
                    let payload = { email: data.email, role: data.role };
                    let accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
                    const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: '7d' });
                    data.refreshToken = refreshToken;
                    await data.save();
                    return {
                        message: 'Login Success',
                        accessToken,
                        refreshToken,
                        role: data.role
                    };
                }
                else {
                    throw {
                        statusCode: 401,
                        body: {
                            status: '401',
                            message: 'Invalid credentials'
                        }
                    };
                }
            }
            else {
                throw {
                    statusCode: 401,
                    body: {
                        status: '401',
                        message: 'Invalid credentials'
                    }
                };
            }
        }
        else {
            throw {
                statusCode: 401,
                body: {
                    status: '401',
                    message: 'Invalid Credentials'
                }
            };
        }
    }
    catch (error) {
        console.error(error);
        if (error.statusCode) {
            throw error;
        }
        throw {
            statusCode: 500,
            body: {
                message: 'Error in login'
            }
        };
    }
};
const register = async (userData) => {
    try {
        console.log("Inside register");
        if (!userData.email || !userData.password) {
            throw {
                statusCode: 400,
                body: {
                    message: "Email and password required"
                }
            };
        }
        const checkeddata = await User.findOne({ email: userData.email });
        if (checkeddata) {
            console.log("user present");
            throw {
                statusCode: 409,
                body: {
                    status: 'warning',
                    message: 'User already exist'
                }
            };
        }
        else {
            // Create new user
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            userData.password = hashedPassword;
            const newUser = new User({
                email: userData.email,
                password: hashedPassword,
                phone: userData.phone,
                city: userData.city
            });
            await newUser.save();
            console.log("data inserted");
            return {
                status: 'success',
                message: 'User Registered Successfully'
            };
        }
    }
    catch (error) {
        console.error(error);
        if (error.statusCode) {
            throw error;
        }
        throw {
            statusCode: 500,
            body: {
                message: 'Error in registration'
            }
        };
    }
};
const refreshToken = async (refreshToken) => {
    try {
        if (!refreshToken) {
            throw {
                statusCode: 401,
                body: {
                    message: "No refresh token"
                }
            };
        }
        const user = await User.findOne({ refreshToken });
        if (!user) {
            throw {
                statusCode: 403,
                body: {
                    message: "Invalid refresh token"
                }
            };
        }
        if (user.status === 'blocked') {
            throw {
                statusCode: 403,
                body: {
                    message: 'Account blocked'
                }
            };
        }
        return await new Promise((resolve, reject) => {
            jwt.verify(refreshToken, process.env.REFRESH_SECRET, async (err, decoded) => {
                try {
                    if (err) {
                        return reject({
                            statusCode: 403,
                            body: {
                                message: "Expired refresh token"
                            }
                        });
                    }
                    // console.log("getting new token")
                    const newAccessToken = jwt.sign(
                        {
                            email: user.email,
                            role: user.role
                        },
                        process.env.JWT_SECRET,
                        { expiresIn: '15m' }
                    );
                    // console.log("new accesstoken: ", newAccessToken)
                    const newRefreshToken = jwt.sign(
                        {
                            email: user.email,
                            role: user.role
                        },
                        process.env.REFRESH_SECRET, { expiresIn: '7d' }
                    );
                    user.refreshToken = newRefreshToken;
                    await user.save();
                    resolve({
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken
                    });
                } catch (error) {
                    reject({
                        statusCode: 500,
                        body: {
                            message: error.message
                        }
                    });
                }
            }
            );
        });
    } catch (error) {
        if (error.statusCode) {
            throw error;
        }
        throw {
            statusCode: 500,
            body: {
                message: error.message
            }
        };
    }
};
const logout = async (refreshToken) => {
    try {
        const user = await User.findOne({ refreshToken });
        if (!user) {
            throw {
                statusCode: 404,
                body: {
                    message: "Invalid token"
                }
            };
        }
        await User.updateOne(
            { refreshToken },
            {
                $unset: {
                    refreshToken: ""
                }
            }
        );
        return {
            success: true,
            message: "Logged out"
        };
    } catch (error) {
        if (error.statusCode) {
            throw error;
        }
        throw {
            statusCode: 500,
            body: {
                message: error.message
            }
        };
    }
};
const forgotPassword = async (email) => {
    try {
        console.log("Inside forgot");
        const user = await User.findOne({ email });
        if (!user) {
            return {
                message: "If email exists, reset link sent"
            };
        }
        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000;
        await user.save();
        console.log("reset token generated");
        // const resetLink = `http://localhost:4200/reset-password/${token}`;
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        try {
            const htmlContent = `
            <h1>Team TrekOne</h1> 
            <h2>Password Reset</h2>
            <p>Click the link below to reset your password.</p>
            <a href="${resetLink}">Click here</a>
            <p>This link will expire in 1 hour.</p>`;
            await sendMail(user.email, "Reset Password", htmlContent);
            return {
                message: 'Reset link sent'
            };
        } catch (err) {
            console.log(err);
            throw {
                statusCode: 500,
                body: {
                    message: "Unable to send reset email. Please try again later."
                }
            };
        }
    } catch (err) {
        if (err.statusCode) {
            throw err;
        }
        throw {
            statusCode: 500,
            body: {
                error: err.message
            }
        };
    }
};
const resetPassword = async (data) => {
    try {
        const { token, password } = data;
        if (!password || password.length < 8) {
            throw {
                statusCode: 400,
                body: {
                    message: "Password must be at least 8 characters"
                }
            };
        }
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: {
                $gt: Date.now()
            }
        });
        if (!user) {
            throw {
                statusCode: 400,
                body: {
                    status: 'warning',
                    message: 'Token invalid or expired'
                }
            };
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.refreshToken = null;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();
        return {
            status: 'success',
            message: 'Password Updated'
        };
    } catch (err) {
        if (err.statusCode) {
            throw err;
        }
        throw {
            statusCode: 500,
            body: {
                error: err.message
            }
        };
    }
};
module.exports = { login, register, refreshToken, logout, forgotPassword, resetPassword };