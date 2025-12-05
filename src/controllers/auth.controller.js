const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

class AuthController {
    static async register(req, res) {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ message: 'name, email and password are required' });
            }
            const existing = await User.findByEmail(email);
            if (existing) return res.status(409).json({ message: 'Email already in use' });

            const hashed = await bcrypt.hash(password, 10);
            const { id } = await User.create({ name, email, password: hashed });
            const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            res.status(201).json({ id, name, email, token });
        } catch (error) {
            res.status(500).json({ message: 'Error registering user', error: error.message });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) return res.status(400).json({ message: 'email and password required' });

            const user = await User.findByEmail(email);
            if (!user) return res.status(401).json({ message: 'Invalid credentials' });

            const match = await bcrypt.compare(password, user.password);
            if (!match) return res.status(401).json({ message: 'Invalid credentials' });

            const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            res.json({ id: user.id, name: user.name, email: user.email, token });
        } catch (error) {
            res.status(500).json({ message: 'Error logging user', error: error.message });
        }
    }
}

module.exports = AuthController;
