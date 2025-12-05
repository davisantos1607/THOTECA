const db = require('../config/db.config');

class Review {
    static async create({ user_id, book_id, rating, comment }) {
        const [result] = await db.query(
            'INSERT INTO reviews (user_id, book_id, rating, comment) VALUES (?, ?, ?, ?)',
            [user_id, book_id, rating, comment]
        );
        return { id: result.insertId };
    }

    static async getByBook(book_id) {
        const [rows] = await db.query(
            `SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.book_id = ? ORDER BY r.created_at DESC`,
            [book_id]
        );
        return rows;
    }

    static async getAverageRating(book_id) {
        const [rows] = await db.query('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE book_id = ?', [book_id]);
        return rows[0];
    }

    static async delete(id, user_id) {
        const [result] = await db.query('DELETE FROM reviews WHERE id = ? AND user_id = ?', [id, user_id]);
        return result;
    }
}

module.exports = Review;
