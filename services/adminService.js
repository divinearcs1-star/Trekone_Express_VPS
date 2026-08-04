require('dotenv').config();
const Booking = require('../models/booking');
const User = require('../models/user');
const Trek = require('../models/trek');
const Razorpay = require('razorpay');
const { sendMail } = require('./emailService');

const getStats = async () => {
    try {
        const totalBookings = await Booking.countDocuments();
        const totalUsers = await User.countDocuments();
        const activeTreks = await Trek.countDocuments({ status: "Active" });
        const paidBookings = await Booking.find({ paymentStatus: "Paid" }, { amount: 1 });
        let totalRevenue = 0;
        paidBookings.forEach(x => {
            totalRevenue += x.amount;
        });
        const totalRefunds = await Booking.countDocuments({
            refundStatus: "Refunded"
        });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcomingTreks = await Trek.countDocuments({
            status: "Active",
            batches: {
                $elemMatch: {
                    eventDate: { $gte: today }
                }
            }
        });
        return {
            totalBookings, activeTreks, totalUsers, totalRevenue, totalRefunds, upcomingTreks
        };
    } catch (error) {
        throw {
            statusCode: 500,
            body: {
                message: error.message
            }
        };
    }
};
const getBookings = async () => {
    try {
        const bookings = await Booking.find().sort({ bookingDate: -1 }).limit(10);
        return bookings;
    } catch (error) {
        throw {
            statusCode: 500,
            body: {
                success: false,
                message: "Error fetching bookings"
            }
        };
    }
};
const getUsers = async () => {
    try {
        const users = await User.find().select('-password -refreshToken').sort({ createdAt: -1 });
        return users;
    } catch (error) {
        throw {
            statusCode: 500,
            body: {
                message: error.message
            }
        };
    }
};
const getTreks = async () => {
    try {
        const treks = await Trek.find();
        const data = treks.map(trek => ({ ...trek.toObject() }));
        return data;
    } catch (error) {
        throw {
            statusCode: 500,
            body: {
                message: error.message
            }
        };
    }
};
const getRefunds = async () => {
    try {
        const refunds = await Booking.find({ bookingStatus: "Cancellation Requested" }).sort({ bookingDate: -1 });
        return refunds;
    } catch (error) {
        throw {
            statusCode: 500,
            body: {
                success: false,
                message: "Error fetching refunds"
            }
        };
    }
};
const approveRefund = async (bookingId) => {
    try {
        console.log("inside approve refund");
        const booking = await Booking.findOne({ bookingId });
        if (!booking) {
            throw {
                statusCode: 404,
                body: {
                    message: "Booking not found"
                }
            };
        }
        if (booking.refundStatus !== "Pending" || booking.bookingStatus !== "Cancellation Requested") {
            throw {
                statusCode: 400,
                body: {
                    message: "Refund already processed"
                }
            };
        }
        const refundAmount = booking.refundEligibleAmount;
        if (refundAmount <= 0) {
            booking.bookingStatus = "Cancelled";
            booking.refundStatus = "Rejected";
            await booking.save();
            throw {
                statusCode: 400,
                body: {
                    message: "Refund not applicable before 48 hours"
                }
            };
        }
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        const refund = await razorpay.payments.refund(
            booking.paymentId,
            {
                amount: refundAmount * 100
            }
        );
        console.log("Refund initiated:", refund);
        booking.bookingStatus = "Cancelled";
        booking.refundStatus = "Initiated";
        booking.paymentStatus = "Refund Initiated";
        booking.refundId = refund.id;
        booking.refundDate = new Date();
        await booking.save();

        const trek = await Trek.findById(booking.trekId);
        if (!trek) {
            throw {
                statusCode: 404,
                body: {
                    message: "Trek not found"
                }
            };
        }
        const batch = trek.batches.find(
            b => b.batchId === booking.batchCode
        );
        if (batch && batch.availableSeats + booking.noOfPersons <= batch.totalSeats) {
            batch.availableSeats += booking.noOfPersons;
            await trek.save();
        }
        return {
            success: true,
            message: "Refund successful",
            refund
        };
    } catch (error) {
        if (error.statusCode) throw error;
        throw {
            statusCode: 500,
            body: {
                success: false,
                message: "Error fetching refunds"
            }
        };
    }
};
const rejectRefund = async (bookingId) => {
    try {
        console.log("inside reject refund");
        const booking = await Booking.findOne({ bookingId });
        if (!booking) {
            throw {
                statusCode: 404,
                body: {
                    message: "Booking not found"
                }
            };
        }
        if (booking.refundStatus !== "Pending" || booking.bookingStatus !== "Cancellation Requested") {
            throw {
                statusCode: 400,
                body: {
                    message: "Refund request already processed"
                }
            };
        }
        booking.bookingStatus = "Confirmed";
        booking.refundStatus = "Rejected";
        await booking.save();

        try {
            const htmlContent = `
            <h2>Refund Rejected</h2>
            <p>Hello ${booking.customerName},</p>
            <p>Your refund request for <b>${booking.eventName}</b> has been rejected.</p>
            <p><b>Booking ID:</b> ${booking.bookingId}</p>
            <p><b>Trek Date:</b> ${new Date(booking.eventDate).toDateString()}</p>
            <p><b>Refund Status:</b> Rejected</p>
            <p>Reason: Cancel before 48 hours.</p>
            <br/>
            <p>Thank you for choosing TrekOne.</p>
            <p><b>Team TrekOne</b></p>`;
            await sendMail(booking.email, "Refund Request Rejected", htmlContent);
        } catch (err) {
            console.log(err);
        }
        return {
            success: true,
            message: "Refund Rejected"
        };
    } catch (error) {
        if (error.statusCode) throw error;
        throw {
            statusCode: 500,
            body: {
                success: false,
                message: "Error fetching refunds"
            }
        };
    }
};
const addTrek = async (trekData) => {
    try {
        const newTrek = new Trek(trekData);
        await newTrek.save();
        return {
            success: true,
            message: "Trek added successfully"
        };
    } catch (error) {
        throw {
            statusCode: 500,
            body: {
                success: false,
                message: "Error adding trek"
            }
        };
    }
};
const getTrekById = async (id) => {
    try {
        const trek = await Trek.findById(id);
        if (!trek) {
            throw {
                statusCode: 404,
                body: {
                    success: false,
                    message: "Trek not found"
                }
            };
        }
        return trek;
    } catch (error) {
        if (error.statusCode) throw error;
        throw {
            statusCode: 500,
            body: {
                success: false,
                message: "Error fetching trek"
            }
        };
    }
};
const updateTrek = async (id, trekData) => {
    try {
        const updatedTrek = await Trek.findByIdAndUpdate(id, trekData,
            {
                new: true
            }
        );
        if (!updatedTrek) {
            throw {
                statusCode: 404,
                body: {
                    success: false,
                    message: "Trek not found"
                }
            };
        }
        return {
            success: true,
            message: "Trek updated successfully",
            updatedTrek
        };
    } catch (error) {
        if (error.statusCode) throw error;
        throw {
            statusCode: 500,
            body: {
                success: false,
                message: "Error updating trek"
            }
        };
    }
};
const deleteTrek = async (id) => {
    try {
        const deleted = await Trek.findByIdAndDelete(id);
        if (!deleted) {
            throw {
                statusCode: 404,
                body: {
                    success: false,
                    message: "Trek not found"
                }
            };
        }
        return {
            success: true,
            message: "Trek deleted successfully"
        };
    } catch (error) {
        if (error.statusCode) throw error;
        throw {
            statusCode: 500,
            body: {
                success: false,
                message: "Error deleting trek"
            }
        };
    }
};
const getAllBookings = async () => {
    try {
        const bookings = await Booking.find().sort({ bookingDate: -1 });
        return bookings;
    } catch (error) {
        throw {
            statusCode: 500,
            body: {
                message: error.message
            }
        };
    }
};
const makeAdmin = async (id) => {
    try {
        const user = await User.findByIdAndUpdate(id,
            {
                role: "admin"
            }
        );
        if (!user) {
            throw {
                statusCode: 404,
                body: {
                    success: false,
                    message: "User not found"
                }
            };
        }
        return {
            success: true,
            message: "User promoted to admin"
        };
    } catch (error) {
        if (error.statusCode) throw error;
        throw {
            statusCode: 500,
            body: {
                success: false,
                message: "Error updating role"
            }
        };
    }
};
const getPayments = async () => {
    try {
        const payments = await Booking.find({
            paymentStatus: {
                $in: ["Paid", "Refunded", "Failed", "Refund Initiated", "Pending"]
            }
        }).sort({ paymentDate: -1 });
        return payments;
    } catch (error) {
        throw {
            statusCode: 500,
            body: {
                success: false,
                message: "Error fetching payments"
            }
        };
    }
};
const blockUser = async (id) => {
    try {
        const user = await User.findByIdAndUpdate(
            id,
            {
                status: "blocked"
            }
        );
        if (!user) {
            throw {
                statusCode: 404,
                body: {
                    success: false,
                    message: "User not found"
                }
            };
        }
        return {
            success: true,
            message: "User blocked"
        };
    } catch (error) {
        if (error.statusCode) throw error;
        throw {
            statusCode: 500,
            body: {
                success: false,
                message: "Error blocking user"
            }
        };
    }
};
const unblockUser = async (id) => {
    try {
        const user = await User.findByIdAndUpdate(
            id,
            {
                status: "active"
            }
        );
        if (!user) {
            throw {
                statusCode: 404,
                body: {
                    success: false,
                    message: "User not found"
                }
            };
        }
        return {
            success: true,
            message: "User unblocked"
        };
    } catch (error) {
        if (error.statusCode) throw error;
        throw {
            statusCode: 500,
            body: {
                success: false,
                message: "Error unblocking user"
            }
        };
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
    getTrekById,
    updateTrek,
    deleteTrek,
    getAllBookings,
    makeAdmin,
    getPayments,
    blockUser,
    unblockUser
};