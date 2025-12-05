const Favorite = require('../models/favorite.model');

class FavoriteController {
    static async add(req, res) {
        try {
            const user_id = req.user.id;
            const { book_id } = req.body;
            if (!book_id) return res.status(400).json({ message: 'book_id required' });
            const result = await Favorite.add({ user_id, book_id });
            res.status(201).json({ id: result.id, message: 'Added to favorites' });
        } catch (err) {
            if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Already in favorites' });
            res.status(500).json({ message: 'Error adding favorite', error: err.message });
        }
    }

    static async remove(req, res) {
        try {
            const user_id = req.user.id;
            const { book_id } = req.params;
            const result = await Favorite.remove({ user_id, book_id });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Favorite not found' });
            res.json({ message: 'Removed from favorites' });
        } catch (err) {
            res.status(500).json({ message: 'Error removing favorite', error: err.message });
        }
    }

    static async list(req, res) {
        try {
            const user_id = req.user.id;
            const rows = await Favorite.listByUser(user_id);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ message: 'Error listing favorites', error: err.message });
        }
    }
}

module.exports = FavoriteController;
