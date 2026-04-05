const Booking = require('../models/Booking');
const Event = require('../models/Event');

exports.createBooking = async (req, res) => {
    try {
        const { eventId, qty } = req.body;
        const requestedQty = parseInt(qty);

        if (!requestedQty || requestedQty < 1) {
            return res.status(400).json({ success: false, error: 'Invalid ticket quantity' });
        }

        // 1. Atomically check and decrement tickets in ONE operation using MongoDB $inc
        // This solves race conditions where two users book simultaneously 
        const updatedEvent = await Event.findOneAndUpdate(
            { 
                id: eventId, 
                status: 'approved',
                ticketsAvailable: { $gte: requestedQty } // Only match if enough tickets exist
            },
            {
                $inc: { ticketsAvailable: -requestedQty } // Atomic decrement
            },
            { new: true }
        );

        if (!updatedEvent) {
            return res.status(400).json({ success: false, error: 'Event sold out or not enough tickets available' });
        }

        // 2. Create the Booking Record
        const totalPrice = updatedEvent.price * requestedQty;
        const booking = new Booking({
            eventId: updatedEvent._id,
            eventCustomId: updatedEvent.id, // e.g. NEX-XXX
            userId: req.user._id,
            ticketQuantity: requestedQty,
            totalPrice: totalPrice,
            status: 'confirmed'
        });

        await booking.save();

        // 3. Emit real-time socket update for other users
        if (req.app.get('io')) {
            req.app.get('io').emit('eventUpdated', { 
                id: updatedEvent.id, 
                ticketsAvailable: updatedEvent.ticketsAvailable, 
                totalTickets: updatedEvent.totalTickets 
            });
        }

        res.status(201).json({ success: true, data: booking });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate('eventId')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: bookings });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('eventId')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: bookings });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};
