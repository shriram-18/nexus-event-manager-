const Event = require('../models/Event');
const User = require('../models/User');
const Booking = require('../models/Booking');

exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalEvents = await Event.countDocuments();
        const totalBookings = await Booking.countDocuments();
        
        const bookingRev = await Booking.aggregate([
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        const revenue = bookingRev.length > 0 ? bookingRev[0].total : 0;

        const topCategories = await Event.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 }
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalEvents,
                totalBookings,
                revenue,
                topCategories
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        
        // Sum the ticketQuantity of all bookings directly to compute tickets sold
        const ticketsSoldAgg = await Booking.aggregate([
            { $group: { _id: null, totalTickets: { $sum: "$ticketQuantity" } } }
        ]);
        const totalTicketsSold = ticketsSoldAgg.length > 0 ? ticketsSoldAgg[0].totalTickets : 0;

        const topCategories = await Event.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 }
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalTicketsSold,
                topCategories
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};
