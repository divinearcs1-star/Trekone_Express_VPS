require('dotenv').config();
const Booking = require('../models/booking');
const WebhookLog = require('../models/webhookLog');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendMail } = require('./emailService');
const Trek = require('../models/trek');

const verifyPayment = async (paymentData) => {
    console.log("Inside verify");
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString()).digest('hex');

        const valid = expectedSignature === razorpay_signature;
        if (!valid) {
            throw {
                statusCode: 400,
                body: {
                    success: false,
                    message: 'Invalid Signature'
                }
            };
        }
        await Booking.updateOne(
            { orderId: razorpay_order_id },
            {
                $set: {
                    paymentStatus: "Paid",
                    paymentDate: new Date(),
                    bookingStatus: "Success",
                    paymentId: razorpay_payment_id
                }
            }
        );
        return {
            success: true,
            message: 'Payment Verified'
        };
    } catch (error) {
        if (error.statusCode) {
            throw error;
        }
        throw {
            statusCode: 500,
            body: {
                success: false,
                message: error.message
            }
        };
    }
};

const razorpayWebhook = async (body, headers) => {
    try {
        console.log("inside webhook");
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const generatedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');
        const receivedSignature = headers['x-razorpay-signature'];
        if (generatedSignature !== receivedSignature) {
            throw {
                statusCode: 400,
                sendResponse: true,
                message: 'Invalid webhook signature'
            };
        }
        // console.log("Headers:", headers);
        // console.log("Body:", JSON.stringify(body, null, 2));
        const payload = JSON.parse(body.toString());
        console.log("Event:", payload.event);
        const eventId = headers['x-razorpay-event-id'];
        // duplicate check
        const alreadyProcessed = await WebhookLog.findOne({ eventId });
        if (alreadyProcessed) {
            console.log("Duplicate webhook ignored");
            return {
                message: "Already processed"
            };
        }
        // store event first
        await WebhookLog.create({
            eventId,
            eventType: payload.event,
            payload
        });
        const event = payload.event;
        if (event === 'payment.captured') {
            const payment = payload.payload.payment.entity;
            console.log("Payment ID:", payment.id);
            console.log("Amount:", payment.amount);
            console.log("Status:", payment.status);
            await Booking.updateOne(
                { orderId: payment.order_id },
                {
                    $set: {
                        paymentStatus: "Paid",
                        bookingStatus: "Success",
                        paymentId: payment.id,
                        paymentDate: new Date()
                    }
                }
            );
            console.log("Payment updated from webhook");
            const booking = await Booking.findOne({
                orderId: payment.order_id
            });
            if (!booking) {
                throw {
                    statusCode: 404,
                    body: {
                        message: "Booking not found"
                    }
                };
            }
            try {
                const htmlContent = `
            <h1>Booking Confirmed 🎉</h1>
            <p>Hello ${booking.customerName},</p>
            <p>Your Trek booking for <b>${booking.eventName}</b> has been successfully confirmed.</p>
            <hr/>
            <p><b>Booking ID:</b> ${booking.bookingId}</p>
            <p><b>Order ID:</b> ${booking.orderId}</p>
            <p><b>Payment ID:</b> ${booking.paymentId}</p>
            <p><b>Trek Date:</b> ${booking.eventDate}</p>
            <p><b>Amount Paid:</b> ₹${booking.amount}</p>
            <hr/>
            <p>Please carry valid ID proof on trek day.</p>
            <p>Report 30 minutes before departure time.</p>
            <br/>
            <p>Thank you for choosing TrekOne.</p>
            <p><b>Team TrekOne</b></p>`;
                await sendMail(booking.email, "TrekOne Booking Confirmation", htmlContent);
            } catch (err) {
                console.log(err);
                throw {
                    statusCode: 500,
                    body: {
                        message: "Unable to send reset email. Please try again later."
                    }
                };
            }
        }
        if (event === 'payment.failed') {
            const payment = payload.payload.payment.entity;
            const booking = await Booking.findOne({ orderId: payment.order_id });
            if (!booking) {
                throw {
                    statusCode: 404,
                    body: {
                        message: "Booking not found"
                    }
                };
            }
            if (booking.paymentStatus === "Failed") {
                return {
                    success: true
                };
            }
            await Booking.updateOne(
                { orderId: payment.order_id },
                {
                    $set: {
                        paymentStatus: "Failed",
                        bookingStatus: "Failed"
                    }
                }
            );
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
            if (batch.availableSeats + booking.noOfPersons <= batch.totalSeats) {
                batch.availableSeats += booking.noOfPersons;
                await trek.save();
            }
        }
        if (event === "refund.processed") {
            const refund = payload.payload.refund.entity;
            await Booking.updateOne(
                { paymentId: refund.payment_id },
                {
                    $set: {
                        paymentStatus: "Refunded",
                        refundStatus: "Refunded"
                    }
                }
            );
            console.log("Refund processed");
            const booking = await Booking.findOne({
                paymentId: refund.payment_id
            });
            if (!booking) {
                throw {
                    statusCode: 404,
                    body: {
                        message: "Booking not found"
                    }
                };
            }
            try {
                const htmlContent = `
            <h2>Refund Completed</h2>
            <p>Hello ${booking.customerName},</p>
            <p>Your refund for <b>${booking.eventName}</b> has been successfully processed.</p>
            <p><b>Booking ID:</b> ${booking.bookingId}</p>
            <p><b>Refund ID:</b> ${refund.id}</p>
            <p><b>Refund Amount:</b> ₹${refund.amount / 100}</p>
            <p>Refund will reflect in your account within 5-7 business days.</p>
            <br/>
            <p>Thank you for choosing TrekOne.</p>
            <p><b>Team TrekOne</b></p>`;
                await sendMail(booking.email, "TrekOne Refund Completed", htmlContent);
            } catch (err) {
                console.log(err);
                throw {
                    statusCode: 500,
                    body: {
                        message: "Unable to send reset email. Please try again later."
                    }
                };
            }
        }
        return {
            success: true
        };
    } catch (error) {
        if (error.statusCode) {
            throw error;
        }
        throw {
            statusCode: 500,
            body: {
                success: false,
                message: error.message
            }
        };
    }
};
module.exports = { verifyPayment, razorpayWebhook };