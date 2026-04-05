const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    eventId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event', 
        required: true 
    },
    eventCustomId: { 
        type: String, 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    ticketQuantity: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    totalPrice: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled'],
        default: 'confirmed'
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
