const db = require('../config/db.config');

class User {
    static async create({ name, email, password, role = 'user' }) {
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, password, role]
        );
        return { id: result.insertId };
    }

    static async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async update(id, data) {
        const fields = [];
        const values = [];
        for (const key of Object.keys(data)) {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }
        values.push(id);
        const [result] = await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
        return result;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
        return result;
    }
}

module.exports = User;
