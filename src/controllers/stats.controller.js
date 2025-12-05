const db = require('../config/db.config');

class StatsController {
    static async topRatedBooks(req, res) {
        try {
            const limit = Number(req.query.limit) || 10;
            const sql = `SELECT b.id, b.title, b.author, AVG(r.rating) as avg_rating, COUNT(r.id) as reviews_count
                         FROM books b
                         LEFT JOIN reviews r ON r.book_id = b.id
                         GROUP BY b.id
                         HAVING reviews_count > 0
                         ORDER BY avg_rating DESC
                         LIMIT ?`;
            const [rows] = await db.query(sql, [limit]);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching stats', error: err.message });
        }
    }

    static async booksPerGenre(req, res) {
        try {
            const sql = `SELECT genre, COUNT(*) as count FROM books GROUP BY genre ORDER BY count DESC`;
            const [rows] = await db.query(sql);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching stats', error: err.message });
        }
    }
}

module.exports = StatsController;
