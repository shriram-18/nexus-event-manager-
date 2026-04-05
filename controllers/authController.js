const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
};

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if(userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name, email, password: hashedPassword, role: role || 'user'
        });

        if(user) {
            res.status(201).json({
                success: true,
                data: {
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id)
                }
            });
        }
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if(user && (await bcrypt.compare(password, user.password))) {
            res.json({
                success: true,
                data: {
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id)
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if(user) {
            res.json({
                success: true,
                data: {
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch(e) {
        res.status(500).json({ success: false, error: e.message });
    }
};
