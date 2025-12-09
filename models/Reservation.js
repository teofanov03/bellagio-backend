const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    guestName: {
        type: String,
        required: [true, 'Guest name is required.'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required.'],
        // Osnovna regex validacija email formata
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format.'],
        trim: true
    },
    numberOfGuests: {
        type: Number,
        required: [true, 'Number of guests is required.'],
        min: [1, 'Number of guests must be at least 1.']
    },
    date: {
        type: Date,
        required: [true, 'Reservation date is required.']
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Confirmed', 'Cancelled']
    }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', ReservationSchema);