const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    ticketId:  { type: String, unique: true },
    eventId:   { type: String, required: true }, // The string 'id' from Event
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who booked this
    quantity:  { type: Number, default: 1 },
    totalPaid: { type: Number, default: 0 },
    bookedAt:  { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);
