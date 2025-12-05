const db = require('../config/db.config');

class Favorite {
    static async add({ user_id, book_id }) {
        const [result] = await db.query('INSERT INTO favorites (user_id, book_id) VALUES (?, ?)', [user_id, book_id]);
        return { id: result.insertId };
    }

    static async remove({ user_id, book_id }) {
        const [result] = await db.query('DELETE FROM favorites WHERE user_id = ? AND book_id = ?', [user_id, book_id]);
        return result;
    }

    static async listByUser(user_id) {
        const [rows] = await db.query(
            'SELECT f.*, b.title, b.author, b.cover_image FROM favorites f JOIN books b ON f.book_id = b.id WHERE f.user_id = ? ORDER BY f.created_at DESC',
            [user_id]
        );
        return rows;
    }
}

module.exports = Favorite;
