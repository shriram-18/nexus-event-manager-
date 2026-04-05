const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
    try {
        // Public gets approved events by default.
        // We will loosen this if admin explicitly passes ?all=true or something, but let's keep it simple.
        let query = { status: 'approved' };
        
        const events = await Event.find(query).sort({ createdAt: -1 });
        res.json(events);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findOne({ id: req.params.id });
        if(!event) return res.status(404).json({ error: 'Event not found' });
        res.json(event);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const eventData = req.body;
        eventData.createdBy = req.user._id;
        
        if (!eventData.coordinates || typeof eventData.coordinates.lat !== 'number' || typeof eventData.coordinates.lng !== 'number') {
            return res.status(400).json({ error: 'Valid coordinates (lat, lng) are required.' });
        }
        
        // Auto-approve if created by admin
        if(req.user.role === 'admin') {
            eventData.status = 'approved';
        } else {
            eventData.status = 'pending';
        }
        
        req.app.get('io').emit('notification', { message: `New event created: ${eventData.title}` });

        const event = new Event(eventData);
        await event.save();
        res.status(201).json(event);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findOneAndUpdate(
            { id: req.params.id },
            { $set: req.body },
            { new: true }
        );
        if(!event) return res.status(404).json({ error: 'Event not found' });
        
        // Emit socket io event for real-time updates
        if(req.app.get('io')) {
            req.app.get('io').emit('eventUpdated', { id: event.id, ticketsAvailable: event.ticketsAvailable, totalTickets: event.totalTickets });
        }

        res.json(event);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findOneAndDelete({ id: req.params.id });
        if(!event) return res.status(404).json({ error: 'Event not found' });
        res.json({ message: 'Event removed' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
