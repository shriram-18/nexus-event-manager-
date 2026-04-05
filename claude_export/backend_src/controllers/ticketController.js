const Ticket = require('../models/Ticket');
const Event = require('../models/Event');

exports.bookTicket = async (req, res) => {
    try {
        const { eventId, quantity } = req.body;
        
        const ev = await Event.findOne({ id: eventId });
        if(!ev) return res.status(404).json({ error: 'Event not found' });
        
        const spotsLeft = ev.spotsTotal - ev.spotsFilled;
        if(quantity > spotsLeft) {
            return res.status(400).json({ error: `Only ${spotsLeft} spots left` });
        }

        // Update spots
        ev.spotsFilled += quantity;
        await ev.save();

        if(req.app.get('io')) {
            req.app.get('io').emit('eventUpdated', { id: ev.id, spotsFilled: ev.spotsFilled, spotsTotal: ev.spotsTotal });
            req.app.get('io').emit('notification', { message: `Someone just booked tickets for ${ev.title}!` });
        }

        // Create ticket
        const ticket = new Ticket({
            ticketId: req.body.ticketId || 'NEX-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            eventId: ev.id,
            userId: req.user._id,
            quantity: quantity,
            totalPaid: quantity * ev.price,
            bookedAt: new Date().toISOString()
        });

        await ticket.save();
        res.status(201).json(ticket);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

exports.getMyTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.cancelTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ ticketId: req.params.id, userId: req.user._id });
        if(!ticket) return res.status(404).json({ error: 'Ticket not found or not authorized' });
        
        const ev = await Event.findOne({ id: ticket.eventId });
        if(ev) {
            ev.spotsFilled -= ticket.quantity;
            await ev.save();
            if(req.app.get('io')) {
                req.app.get('io').emit('eventUpdated', { id: ev.id, spotsFilled: ev.spotsFilled, spotsTotal: ev.spotsTotal });
            }
        }
        
        await Ticket.findOneAndDelete({ ticketId: req.params.id });
        res.json({ message: 'Ticket cancelled' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
