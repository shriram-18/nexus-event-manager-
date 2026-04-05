require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const Event = require('./models/Event');
const User = require('./models/User');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// Expose io object to all routes if needed inside req.app.get('io')
app.set('io', io);

// ─── Socket.IO ───────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
    console.log('A user connected via Socket.IO');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

// ─── Seed Data ──────────────────────────────────────────────────────────────
async function seedAdmin() {
    const defaultA = await User.findOne({ email: 'admin@nexus.com' });
    if(!defaultA) {
        const bcrypt = require('bcryptjs');
        const hp = await bcrypt.hash('admin123', 10);
        await User.create({ name: 'Super Admin', email: 'admin@nexus.com', password: hp, role: 'admin' });
        console.log('👑 Default Admin created: admin@nexus.com | password: admin123');
    }
}

// ─── Start Server ─────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nexus')
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        await seedAdmin(); // So we have an admin account ready to test
        
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => console.log(`🚀 Nexus API running at http://localhost:${PORT}/api`));
    })
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    });
