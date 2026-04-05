const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
    try {
        const { category, priceRange, date, sort } = req.query;
        let query = { status: 'approved' };

        // Filtering
        if (category) {
            query.category = category;
        }

        if (priceRange) {
            // Assume format "min-max" e.g., "0-50" or "100+"
            if (priceRange.includes('-')) {
                const [min, max] = priceRange.split('-');
                query.price = { $gte: Number(min), $lte: Number(max) };
            } else if (priceRange.includes('+')) {
                const min = priceRange.replace('+', '');
                query.price = { $gte: Number(min) };
            }
        }

        if (date) {
            query.date = date; // Exact string match for "YYYY-MM-DD"
        }

        // Sorting
        let sortObj = { createdAt: -1 }; // Default newest
        if (sort === 'trending') {
            // simple proxy for trending: least tickets available relative to total
            // or just sort by a generic hype metric. Mongoose can't compute fields during simple find() sorting easily,
            // so we will sort by ticketsAvailable ascending (closest to selling out)
            sortObj = { ticketsAvailable: 1 };
        } else if (sort === 'newest') {
            sortObj = { createdAt: -1 };
        }

        const events = await Event.find(query).sort(sortObj);
        res.json({ success: true, data: events });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findOne({ id: req.params.id });
        if(!event) return res.status(404).json({ success: false, error: 'Event not found' });
        res.json({ success: true, data: event });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

// Custom query: Running Events
exports.getRunningEvents = async (req, res) => {
    try {
        const now = new Date();
        const currentDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const currentTimeStr = now.toTimeString().substring(0, 5); // HH:mm

        // Events that are approved, happen today, and current time is between start and end
        const query = {
            status: 'approved',
            date: currentDateStr,
            startTime: { $lte: currentTimeStr },
            endTime: { $gte: currentTimeStr }
        };

        const events = await Event.find(query);
        res.json({ success: true, data: events });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

// Custom query: Upcoming Events
exports.getUpcomingEvents = async (req, res) => {
    try {
        const now = new Date();
        const currentDateStr = now.toISOString().split('T')[0];

        // Events that are in the future
        const query = {
            status: 'approved',
            date: { $gt: currentDateStr }
        };

        const events = await Event.find(query).sort({ date: 1 });
        res.json({ success: true, data: events });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

// Admin / Organizer: Manage Events
exports.getManagedEvents = async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'admin') {
            // Organizer sees only their own events
            query.createdBy = req.user._id;
        }
        
        const events = await Event.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: events });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const eventData = req.body;
        eventData.createdBy = req.user._id;
        
        if (!eventData.coordinates || typeof eventData.coordinates.lat !== 'number' || typeof eventData.coordinates.lng !== 'number') {
            return res.status(400).json({ success: false, error: 'Valid coordinates (lat, lng) are required.' });
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
        res.status(201).json({ success: true, data: event });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findOneAndUpdate(
            { id: req.params.id },
            { $set: req.body },
            { new: true }
        );
        if(!event) return res.status(404).json({ success: false, error: 'Event not found' });
        
        // Emit socket io event for real-time updates
        if(req.app.get('io')) {
            req.app.get('io').emit('eventUpdated', { id: event.id, ticketsAvailable: event.ticketsAvailable, totalTickets: event.totalTickets });
        }

        res.json({ success: true, data: event });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findOneAndDelete({ id: req.params.id });
        if(!event) return res.status(404).json({ success: false, error: 'Event not found' });
        res.json({ success: true, message: 'Event removed' });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

// ADMIN: Approve Event
exports.approveEvent = async (req, res) => {
    try {
        const event = await Event.findOneAndUpdate(
            { id: req.params.id },
            { status: 'approved' },
            { new: true }
        );
        if(!event) return res.status(404).json({ success: false, error: 'Event not found' });
        res.json({ success: true, data: event });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

// ADMIN: Reject Event
exports.rejectEvent = async (req, res) => {
    try {
        const event = await Event.findOneAndUpdate(
            { id: req.params.id },
            { status: 'rejected' },
            { new: true }
        );
        if(!event) return res.status(404).json({ success: false, error: 'Event not found' });
        res.json({ success: true, data: event });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};
