require('dotenv').config();
const Booking = require('../models/booking');
const Razorpay = require('razorpay');
const { sendMail } = require('./emailService');
const Trek = require('../models/trek');

const createOrder = async (bookingData) => {
    console.log("Inside booking");
    try {
        console.log(bookingData.trekId);
        //  prevent overbooking
        console.log("trekId =", bookingData.trekId);
        console.log("batchCode =", bookingData.batchCode);
        console.log("persons =", bookingData.noOfPersons);
        console.log(typeof bookingData.noOfPersons);
        console.log("bookingData =", bookingData);
        const updated = await Trek.findOneAndUpdate(
            {
                _id: bookingData.trekId,
                batches: {
                    $elemMatch: {
                        batchId: bookingData.batchCode,
                        availableSeats: { $gte: bookingData.noOfPersons }
                    }
                }
            },
            {
                $inc: {
                    "batches.$.availableSeats": -bookingData.noOfPersons
                }
            },
            { returnDocument: "after" }
        );
        console.log("updated =", updated);
        // console.log("availableSeats =", updated.availableSeats);
        console.log("requested =", Number(bookingData.noOfPersons));
        // console.log("comparison =", updated.availableSeats >= Number(bookingData.noOfPersons));
        if (!updated) {
            throw {
                statusCode: 400,
                body: {
                    success: false,
                    message: "Not enough seats available"
                }
            };
        }
        //
        console.log("after batch check");
        if (bookingData.customerName) {
            // const trek = await Trek.findById(bookingData.trekId);
            const trek = updated;

            const batch = trek.batches.find(
                b => b.batchId === bookingData.batchCode
            );
            if (!batch) {
                throw {
                    statusCode: 404,
                    body: {
                        success: false,
                        message: "Batch not found"
                    }
                };
            }
            // const now = new Date();
            //    const orderId = 'TRK' + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0') + Date.now().toString().slice(-6);
            const random = Math.floor(1000 + Math.random() * 9000);
            const orderId = `TRK${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${Date.now().toString().slice(-6)}${random}`;
            console.log(orderId);
            bookingData.paymentStatus = "Pending"
            bookingData.bookingId = orderId;
            bookingData.orderId = "";
            bookingData.paymentId = "";
            bookingData.paymentDate = null
            bookingData.bookingDate = new Date();
            bookingData.paymentVia = "Razorpay";
            // const formatedDate = bookingData.eventDate;
            bookingData.eventDate = batch.eventDate;
            bookingData.eventName = trek.eventName;
            const amount = batch.fees * bookingData.noOfPersons;
            bookingData.amount = amount;
            bookingData.eventFee = batch.fees;
            // console.log("bookingData.eventDate ", bookingData.eventDate);
            if (!trek.pickupLocation.includes(bookingData.pickupLocation)) {
                throw {
                    statusCode: 400,
                    body: {
                        success: false,
                        message: "Invalid pickup location"
                    }
                };
            }
            const newBooking = new Booking(bookingData);
            await newBooking.save();
            console.log("booking inserted");
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET
            });
            // console.log(" key id= " + key_id);
            try {
                //const amount = bookingData.amount;
                const options = {
                    amount: amount * 100, // paisa
                    currency: 'INR',
                    receipt: 'receipt_' + Date.now()
                };
                console.log("creating order");
                const order = await razorpay.orders.create(options);
                // update order id in booking collection
                const result = await Booking.updateOne(
                    { bookingId: bookingData.bookingId },
                    {
                        $set: {
                            orderId: order.id
                        }
                    }
                );
                if (result.matchedCount === 0) {
                    throw {
                        statusCode: 404,
                        body: {
                            success: false,
                            message: "Booking not found"
                        }
                    };
                }
                order.bookingId = bookingData.bookingId;
                return order;
            }
            catch (error) {
                console.error(error);
                await Trek.updateOne(
                    {
                        _id: bookingData.trekId,
                        batches: {
                            $elemMatch: {
                                batchId: bookingData.batchCode
                            }
                        }
                    },
                    {
                        $inc: {
                            "batches.$.availableSeats": bookingData.noOfPersons
                        }
                    }
                );
                await Booking.updateOne(
                    { bookingId: bookingData.bookingId },
                    {
                        $set: {
                            paymentStatus: "Failed"
                        }
                    }
                );
                throw {
                    statusCode: 500,
                    body: {
                        success: false,
                        message: error.message
                    }
                };
            }
        }
        else {
            throw {
                statusCode: 400,
                body: {
                    success: false,
                    message: "Invalid data"
                }
            };
        }
    } catch (error) {
        console.error(error);
        // await Trek.updateOne(
        //     {
        //         _id: bookingData.trekId,
        //         batches: {
        //             $elemMatch: {
        //                 batchId: bookingData.batchCode
        //             }
        //         }
        //     },
        //     {
        //         $inc: {
        //             "batches.$.availableSeats": bookingData.noOfPersons
        //         }
        //     }
        // );
        if (error.statusCode) {
            throw error;
        }
        throw {
            statusCode: 500,
            body: {
                success: false,
                message: 'Error while booking'
            }
        };
    }
};
const getMyBookings = async (email) => {
    try {
        console.log("inside my booking")
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bookings = await Booking.find({ email: email, eventDate: { $gte: today } }).sort({ bookingDate: -1 });
        // console.log("booking = " ,bookings)
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
const cancelRefund = async (bookingId, email) => {
    try {
        console.log("inside cancel booking");
        const booking = await Booking.findOne({ bookingId, email });
        if (!booking) {
            throw {
                statusCode: 404,
                body: {
                    success: false,
                    message: 'Booking not found'
                }
            };
        }
        if (booking.paymentStatus === "Refunded" || booking.paymentStatus === "Refund Initiated") {
            throw {
                statusCode: 400,
                body: {
                    success: false,
                    message: "Booking already refunded"
                }
            };
        }
        if (booking.bookingStatus === "Cancelled" || booking.bookingStatus === "Cancellation Requested") {
            throw {
                statusCode: 400,
                body: {
                    success: false,
                    message: 'Booking already cancelled'
                }
            };
        }
        if (booking.paymentStatus !== "Paid") {
            throw {
                statusCode: 400,
                body: {
                    success: false,
                    message: "Only paid bookings can be cancelled"
                }
            };
        }
        const requestDate = new Date();
        // requestDate.setHours(0, 0, 0, 0);
        console.log("requestDate: ", requestDate);
        console.log("booking.eventDate: ", booking.eventDate);
        if (new Date(booking.eventDate) < requestDate) {
            throw {
                statusCode: 400,
                body: {
                    success: false,
                    message: "Trek already completed"
                }
            };
        }
        const diffDays = Math.ceil(
            (new Date(booking.eventDate) - requestDate) /
            (1000 * 60 * 60 * 24)
        );
        console.log("diffDays: ", diffDays);
        let refundAmount = booking.amount;
        if (diffDays >= 5) {
            refundAmount = booking.amount;
        }
        else if (diffDays >= 2) {
            refundAmount = Math.round(booking.amount * 0.5);
        }
        else {
            refundAmount = 0;
        }
        booking.bookingStatus = "Cancellation Requested";
        booking.refundStatus = "Pending";
        booking.refundRequestedAt = requestDate;
        booking.refundEligibleAmount = refundAmount;
        await booking.save();

        try {
            const htmlContent = `
        <h2>New cancellation request received</h2>
        <p><b>Booking ID:</b> ${booking.bookingId}</p>
        <p>Customer: ${booking.customerName} </p>
        <p><b>Trek:</b> ${booking.eventName}</p>
        <p><b>Trek Date:</b> ${new Date(booking.eventDate).toDateString()}</p>
        <p><b>Amount:</b> ₹${booking.amount}</p>
        <p><b>Eligible Refund:</b> ₹${refundAmount}</p>`;
            await sendMail(process.env.EMAIL_ID, "TrekOne Booking Cancellation Request", htmlContent);
        } catch (err) {
            console.log(err);
        }
        return {
            success: true,
            message: 'Booking cancellation request submitted'
        };
    } catch (error) {
        console.log(error);
        if (error.statusCode) {
            throw error;
        }
        throw {
            statusCode: 500,
            body: {
                success: false,
                message: 'Cancellation failed'
            }
        };
    }
};

module.exports = { createOrder, getMyBookings, cancelRefund };