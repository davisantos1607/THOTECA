const db = require('../config/db.config');

class Book {
    // supports filters: search (title/author), genre, page, limit, sort
    static async getAllBooks({ search, genre, page = 1, limit = 10, sort = 'created_at', order = 'DESC' } = {}) {
        try {
            const offset = (page - 1) * limit;
            const where = [];
            const params = [];
            if (search) {
                where.push('(title LIKE ? OR author LIKE ?)');
                params.push(`%${search}%`, `%${search}%`);
            }
            if (genre) {
                where.push('genre = ?');
                params.push(genre);
            }
            const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';
            const validSort = ['title','author','created_at','updated_at','id'];
            const sortBy = validSort.includes(sort) ? sort : 'created_at';
            const orderBy = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            const sql = `SELECT * FROM books ${whereSQL} ORDER BY ${sortBy} ${orderBy} LIMIT ? OFFSET ?`;
            params.push(Number(limit), Number(offset));
            const [rows] = await db.query(sql, params);
            // total count for pagination
            const countSql = `SELECT COUNT(*) as total FROM books ${whereSQL}`;
            const [countRows] = await db.query(countSql, params.slice(0, params.length - 2));
            return { rows, total: countRows[0].total };
        } catch (error) {
            throw error;
        }
    }

    static async getBookById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async createBook(bookData) {
        try {
            const { title, author, description, cover_image } = bookData;
            const [result] = await db.query(
                'INSERT INTO books (title, author, description, cover_image) VALUES (?, ?, ?, ?)',
                [title, author, description, cover_image]
            );
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async updateBook(id, bookData) {
        try {
            const { title, author, description, cover_image } = bookData;
            const [result] = await db.query(
                'UPDATE books SET title = ?, author = ?, description = ?, cover_image = ? WHERE id = ?',
                [title, author, description, cover_image, id]
            );
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async deleteBook(id) {
        try {
            const [result] = await db.query('DELETE FROM books WHERE id = ?', [id]);
            return result;
        } catch (error) {
            throw error;
        }
    }
}