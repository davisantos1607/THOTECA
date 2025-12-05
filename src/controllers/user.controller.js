const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

class UserController {
    static async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.id);
            res.json(user);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching profile', error: err.message });
        }
    }

    static async updateProfile(req, res) {
        try {
            const data = {};
            const { name, email, password } = req.body;
            if (name) data.name = name;
            if (email) data.email = email;
            if (password) data.password = await bcrypt.hash(password, 10);
            const result = await User.update(req.user.id, data);
            res.json({ message: 'Profile updated' });
        } catch (err) {
            res.status(500).json({ message: 'Error updating profile', error: err.message });
        }
    }

    static async deleteAccount(req, res) {
        try {
            await User.delete(req.user.id);
            res.json({ message: 'Account deleted' });
        } catch (err) {
            res.status(500).json({ message: 'Error deleting account', error: err.message });
        }
    }
}

module.exports = UserController;
