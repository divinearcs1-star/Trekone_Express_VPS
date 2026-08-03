const Booking = require('../models/booking');

const getBookingsReport = async () => {
    try {
        const bookings = await Booking.find().sort({ bookingDate: -1 });
        return bookings;
    } catch (error) {
        throw {
            statusCode: 500,
            body: {
                message: "Error fetching report"
            }
        };
    }
};

module.exports = { getBookingsReport };