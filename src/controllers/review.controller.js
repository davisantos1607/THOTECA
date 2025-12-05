const Review = require('../models/review.model');

class ReviewController {
    static async create(req, res) {
        try {
            const { book_id, rating, comment } = req.body;
            const user_id = req.user.id;
            if (!book_id || !rating) return res.status(400).json({ message: 'book_id and rating are required' });
            const { id } = await Review.create({ user_id, book_id, rating, comment });
            res.status(201).json({ id, message: 'Review created' });
        } catch (err) {
            res.status(500).json({ message: 'Error creating review', error: err.message });
        }
    }

    static async listByBook(req, res) {
        try {
            const book_id = req.params.bookId;
            const reviews = await Review.getByBook(book_id);
            res.json(reviews);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching reviews', error: err.message });
        }
    }

    static async delete(req, res) {
        try {
            const id = req.params.id;
            const user_id = req.user.id;
            const result = await Review.delete(id, user_id);
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Review not found or not owned by user' });
            res.json({ message: 'Review deleted' });
        } catch (err) {
            res.status(500).json({ message: 'Error deleting review', error: err.message });
        }
    }
}

module.exports = ReviewController;
