const User = require('../models/User');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

exports.getStats = async (req, res) => {
    try {
        const usersCount = await User.countDocuments();
        const eventsCount = await Event.countDocuments();
        const tickets = await Ticket.find();
        
        const totalRevenue = tickets.reduce((sum, t) => sum + (t.totalPaid || 0), 0);
        const bookingsCount = tickets.length;

        res.json({
            users: usersCount,
            events: eventsCount,
            bookings: bookingsCount,
            revenue: totalRevenue
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateEventStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const event = await Event.findOneAndUpdate({ id: req.params.id }, { status }, { new: true });
        if(!event) return res.status(404).json({ error: 'Event not found' });
        
        if(req.app.get('io') && status === 'approved') {
            req.app.get('io').emit('notification', { message: `New event approved: ${event.title}!` });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
