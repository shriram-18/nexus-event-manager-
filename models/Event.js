const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    id:               { type: String, unique: true }, // Custom ID for nice URLs like NEX-123
    title:            { type: String, required: [true, 'Event title is required'] },
    description:      { type: String, required: true },
    category:         { type: String, required: true },
    tags:             [{ type: String }],
    
    // Date & Time
    date:             { type: String, required: true }, // YYYY-MM-DD
    startTime:        { type: String, required: true }, // HH:mm
    endTime:          { type: String, required: true },   // HH:mm
    
    // Location
    venue:            { type: String, required: true },
    address:          { type: String, required: true },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    
    // Ticket Info
    price:            { type: Number, required: true, min: [0, 'Price cannot be negative'] },
    totalTickets:     { type: Number, required: true, min: [1, 'Must have at least 1 ticket'] },
    ticketsAvailable: { type: Number, required: true, min: [0, 'Cannot have negative tickets available'] },
    
    image:            { type: String },
    coverImage:       { type: String },
    
    // System Fields
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending'
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }
}, { timestamps: true, id: false });

// Schema validations — Mongoose 7+ uses async/throw (not callback next(err))
EventSchema.pre('save', async function() {
    // Validate Date
    const eventDate = new Date(this.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
        throw new Error('Event date must be in the future.');
    }

    // Ensure logical bounds
    if (this.ticketsAvailable > this.totalTickets) {
        this.ticketsAvailable = this.totalTickets;
    }
});

module.exports = mongoose.model('Event', EventSchema);
