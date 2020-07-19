const mongoose = require('mongoose')


const BookingSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    book: [{
        time: String,
        status: String,
        location: String,
        bizname: String,
        url: String,
        ref: String,
        rdate: String,
        oneid: String,
        date: {
            type: Date,
            default: Date.now
        }
    }]
})


const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;